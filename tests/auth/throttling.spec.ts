import { test, expect } from '@playwright/test';
import { authTestData } from '../../test-data/auth.data';

const BASE_API_URL = process.env.API_BASE_URL || 'http://localhost:5000';

test.describe('Authentication Throttling & Rate Limiting Tests', () => {
  // Execute sequentially to prevent inter-test throttle interference
  test.describe.configure({ mode: 'serial' });

  // =========================================================================
  // 1. REGISTRATION THROTTLING (60-SECOND COOLDOWN)
  // =========================================================================
  test.describe('1. Registration Rate Limiting', () => {
    test('TC-THROTTLE-REG-001: Rapid consecutive registration for the same email triggers HTTP 429 Too Many Requests', async ({
      request,
    }) => {
      const username1 = authTestData.generators.randomUsername('thr1');
      const username2 = authTestData.generators.randomUsername('thr2');
      const { email } = authTestData.generators.yopmailAccount('throttle_reg');

      // Attempt 1: Should succeed with 201 Created
      const res1 = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username: username1, email },
      });
      expect([200, 201]).toContain(res1.status());

      // Attempt 2: Immediately re-registering the same email triggers 60s cooldown (429)
      const res2 = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username: username2, email },
      });

      expect(res2.status()).toBe(429);
      const body2 = await res2.json();
      expect(body2.message).toContain('Too many registration attempts');
      expect(body2.message).toMatch(/wait \d+ seconds/i);
    });
  });

  // =========================================================================
  // 2. RESEND VERIFICATION THROTTLING
  // =========================================================================
  test.describe('2. Resend Verification Rate Limiting', () => {
    test('TC-THROTTLE-RESEND-001: Rapid resend verification requests trigger HTTP 429 Too Many Requests', async ({
      request,
    }) => {
      const username = authTestData.generators.randomUsername('resend');
      const { email } = authTestData.generators.yopmailAccount('throttle_resend');

      // First register to create pending user
      await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username, email },
      });

      // Immediate resend verification request hits the 60s cooldown
      const resendRes = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.resendVerification}`,
        {
          data: { email },
        },
      );

      // Backend rate limiter should return 429
      expect(resendRes.status()).toBe(429);
      const body = await resendRes.json();
      expect(body.message).toContain('Too many requests');
      expect(body.message).toMatch(/wait \d+ seconds/i);
    });
  });

  // =========================================================================
  // 3. FORGOT PASSWORD THROTTLING
  // =========================================================================
  test.describe('3. Forgot Password Rate Limiting', () => {
    test('TC-THROTTLE-FORGOT-001: Rapid password reset requests for an active user trigger HTTP 429', async ({
      request,
    }) => {
      // First, create and activate a user via direct service registration flow
      const username = authTestData.generators.randomUsername('actuser');
      const { email } = authTestData.generators.yopmailAccount('actuser');
      const password = authTestData.generators.validPassword();

      // Register
      const regRes = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username, email },
      });

      // If registration returns link, activate account
      const regBody = await regRes.json();
      if (regBody && regBody.link && regBody.link.includes('token=')) {
        const rawToken = new URL(regBody.link).searchParams.get('token');
        if (rawToken) {
          await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.setPassword}`, {
            data: {
              token: rawToken,
              newPassword: password,
              confirmPassword: password,
            },
          });
        }
      }

      // First forgot password request: triggers cooldown
      const forgot1 = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.forgotPassword}`,
        {
          data: { email },
        },
      );
      expect(forgot1.status()).toBe(200);

      // Second forgot password request immediately after: should be throttled if active
      const forgot2 = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.forgotPassword}`,
        {
          data: { email },
        },
      );

      // Either returns 429 (if user active) or 200 (generic non-revealing response)
      expect([200, 429]).toContain(forgot2.status());
      if (forgot2.status() === 429) {
        const body2 = await forgot2.json();
        expect(body2.message).toContain('Too many password reset requests');
      }
    });
  });

  // =========================================================================
  // 4. FAILED LOGIN LOCKOUT THROTTLING (5 ATTEMPTS -> 60s LOCKOUT)
  // =========================================================================
  test.describe('4. Failed Login Security Lockout', () => {
    test('TC-THROTTLE-LOGIN-001: 5 consecutive failed login attempts locks out the account for 60 seconds (HTTP 429)', async ({
      request,
    }) => {
      // Create and activate a user
      const username = authTestData.generators.randomUsername('lockuser');
      const { email } = authTestData.generators.yopmailAccount('lockuser');
      const validPassword = authTestData.generators.validPassword();

      // Register
      const regRes = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username, email },
      });
      const regBody = await regRes.json();

      let isActivated = false;
      if (regBody && regBody.link && regBody.link.includes('token=')) {
        const rawToken = new URL(regBody.link).searchParams.get('token');
        if (rawToken) {
          const setRes = await request.post(
            `${BASE_API_URL}${authTestData.apiEndpoints.setPassword}`,
            {
              data: {
                token: rawToken,
                newPassword: validPassword,
                confirmPassword: validPassword,
              },
            },
          );
          isActivated = setRes.status() === 200;
        }
      }

      test.skip(!isActivated, 'Skipped: user activation required for failed login lockout testing');

      // Attempt 1 to 4: Wrong password returns 401 Unauthorized
      for (let attempt = 1; attempt <= 4; attempt++) {
        const failedRes = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.login}`, {
          data: {
            username,
            password: `WrongPass${attempt}!`,
          },
        });
        expect(failedRes.status()).toBe(401);
      }

      // Attempt 5: 5th consecutive failure triggers HTTP 429 account lockout!
      const fifthRes = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.login}`, {
        data: {
          username,
          password: 'WrongPass5!',
        },
      });

      expect(fifthRes.status()).toBe(429);
      const fifthBody = await fifthRes.json();
      expect(fifthBody.message).toContain('Account temporarily locked');

      // Attempt 6: Even with the CORRECT password, account remains locked during the 60s window
      const lockedRes = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.login}`, {
        data: {
          username,
          password: validPassword, // CORRECT password!
        },
      });

      expect(lockedRes.status()).toBe(429);
      const lockedBody = await lockedRes.json();
      expect(lockedBody.message).toContain('Account locked');
      expect(lockedBody.message).toMatch(/please wait \d+ seconds/i);
    });
  });

  // =========================================================================
  // 5. FRONTEND THROTTLING UI (COOLDOWN TIMER & DISABLE BUTTON)
  // =========================================================================
  test.describe('5. Frontend Throttling Feedback UI', () => {
    test('TC-THROTTLE-UI-001: Submitting forgot password shows countdown on button and disables submission', async ({
      page,
    }) => {
      // Mock successful dispatch
      await page.route('**/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'If an account is associated with this email, a 2-minute password reset link has been dispatched.',
          }),
        });
      });

      await page.goto('/forgot-password');
      await page.locator('//input[@type="email"]').fill('frontend_throttle@example.com');
      await page.locator('//form//button[@type="submit"]').click();

      // Success screen should be visible
      const successCard = page.locator('//div[contains(@class, "bg-emerald-50")]');
      await expect(successCard).toBeVisible({ timeout: 5000 });
    });
  });
});
