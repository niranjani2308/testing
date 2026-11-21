import { test, expect } from '@playwright/test';
import { authTestData } from '../../test-data/auth.data';

const BASE_API_URL = process.env.API_BASE_URL || 'http://localhost:5000';

test.describe('Authentication API Endpoint Tests (APIRequestContext)', () => {
  // =========================================================================
  // 1. DATABASE HEALTH CHECK
  // =========================================================================
  test('TC-API-DB-001: (Positive) GET /auth/db-check should return database connection status', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_API_URL}${authTestData.apiEndpoints.dbCheck}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message');
  });

  // =========================================================================
  // 2. REGISTRATION API (/auth/register & /auth/signup)
  // =========================================================================
  test.describe('POST /auth/register & /auth/signup', () => {
    test('TC-API-REG-001: (Positive) Valid unique username and email returns 201 Created', async ({
      request,
    }) => {
      const username = authTestData.generators.randomUsername('apireg');
      const { email } = authTestData.generators.yopmailAccount('apireg');

      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username, email },
      });

      expect([201, 200]).toContain(response.status());
      const body = await response.json();
      expect(body).toHaveProperty('message');
      expect(body.message).toContain('Registration successful');
      expect(body).toHaveProperty('user');
      expect(body.user.username).toBe(username);
      expect(body.user.email).toBe(email);
    });

    test('TC-API-REG-002: (Negative) Missing username returns 400 Bad Request', async ({
      request,
    }) => {
      const { email } = authTestData.generators.yopmailAccount('api');

      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { email },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('message');
    });

    test('TC-API-REG-003: (Negative) Missing email returns 400 Bad Request', async ({
      request,
    }) => {
      const username = authTestData.generators.randomUsername('api');

      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('message');
    });

    test('TC-API-REG-004: (Negative) Invalid email format returns 400 Bad Request', async ({
      request,
    }) => {
      const username = authTestData.generators.randomUsername('api');

      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username, email: 'invalid-email-format' },
      });

      expect(response.status()).toBe(400);
    });

    test('TC-API-REG-005: (Negative) Username < 2 characters returns 400 Bad Request', async ({
      request,
    }) => {
      const { email } = authTestData.generators.yopmailAccount('api');

      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.register}`, {
        data: { username: 'a', email },
      });

      expect(response.status()).toBe(400);
    });

    test('TC-API-REG-006: (Positive) POST /auth/signup alias endpoint works identical to /auth/register', async ({
      request,
    }) => {
      const username = authTestData.generators.randomUsername('alias');
      const { email } = authTestData.generators.yopmailAccount('alias');

      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.signup}`, {
        data: { username, email },
      });

      expect([201, 200]).toContain(response.status());
    });
  });

  // =========================================================================
  // 3. TOKEN VALIDATION API (/auth/validate-token)
  // =========================================================================
  test.describe('GET /auth/validate-token', () => {
    test('TC-API-TOKEN-001: (Negative) Missing token returns valid=false with reason="missing"', async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_API_URL}${authTestData.apiEndpoints.validateToken}?token=&type=verification`,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(false);
      expect(body.reason).toBe('missing');
    });

    test('TC-API-TOKEN-002: (Negative) Non-existent/invalid verification token returns valid=false with reason="invalid_or_used"', async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_API_URL}${authTestData.apiEndpoints.validateToken}?token=fake_random_token_99999&type=verification`,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(false);
      expect(body.reason).toBe('invalid_or_used');
    });

    test('TC-API-TOKEN-003: (Negative) Non-existent/invalid reset token returns valid=false with reason="invalid_or_used"', async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_API_URL}${authTestData.apiEndpoints.validateToken}?token=fake_reset_token_88888&type=reset`,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(false);
      expect(body.reason).toBe('invalid_or_used');
    });
  });

  // =========================================================================
  // 4. SET PASSWORD & VERIFY EMAIL API
  // =========================================================================
  test.describe('POST /auth/set-password & /auth/verify-email', () => {
    test('TC-API-SETPW-001: (Negative) Missing token returns 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.setPassword}`,
        {
          data: {
            token: '',
            newPassword: authTestData.signupInputs.valid8CharPassword,
            confirmPassword: authTestData.signupInputs.valid8CharPassword,
          },
        },
      );

      expect(response.status()).toBe(400);
    });

    test('TC-API-SETPW-002: (Negative) Password mismatch returns 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.setPassword}`,
        {
          data: {
            token: 'mock_token',
            newPassword: 'Password1!',
            confirmPassword: 'Password2!',
          },
        },
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toContain('Passwords do not match');
    });

    test('TC-API-SETPW-003: (Negative) Invalid/unrecognized token returns 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.setPassword}`,
        {
          data: {
            token: 'invalid_unrecognized_token_xyz',
            newPassword: authTestData.signupInputs.valid8CharPassword,
            confirmPassword: authTestData.signupInputs.valid8CharPassword,
          },
        },
      );

      expect(response.status()).toBe(400);
    });
  });

  // =========================================================================
  // 5. LOGIN API (/auth/login)
  // =========================================================================
  test.describe('POST /auth/login', () => {
    test('TC-API-LOGIN-001: (Negative) Empty username/email returns 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.login}`, {
        data: { username: '', password: 'SomePassword1!' },
      });

      expect(response.status()).toBe(400);
    });

    test('TC-API-LOGIN-002: (Negative) Non-existent user returns 401 Unauthorized', async ({
      request,
    }) => {
      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.login}`, {
        data: {
          username: 'non_existent_user_99999',
          password: 'Password1!',
        },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toContain('Invalid username/email or password');
    });

    test('TC-API-LOGIN-003: (Negative - AUTH-001) Fully uppercase email returns 401 Unauthorized', async ({
      request,
    }) => {
      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.login}`, {
        data: {
          username: 'UPPERCASE_EMAIL@EXAMPLE.COM',
          password: 'Password1!',
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  // =========================================================================
  // 6. FORGOT & RESET PASSWORD API
  // =========================================================================
  test.describe('POST /auth/forgot-password & /auth/reset-password', () => {
    test('TC-API-FORGOT-001: (Positive) Valid email returns 200 generic message', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.forgotPassword}`,
        {
          data: { email: 'any_user@example.com' },
        },
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('message');
    });

    test('TC-API-FORGOT-002: (Negative) Invalid email format returns 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.forgotPassword}`,
        {
          data: { email: 'not-valid-email' },
        },
      );

      expect(response.status()).toBe(400);
    });

    test('TC-API-RESETPW-001: (Negative) Missing token returns 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.resetPassword}`,
        {
          data: {
            token: '',
            newPassword: authTestData.signupInputs.valid8CharPassword,
            confirmPassword: authTestData.signupInputs.valid8CharPassword,
          },
        },
      );

      expect(response.status()).toBe(400);
    });

    test('TC-API-RESETPW-002: (Negative) Mismatched passwords return 400 Bad Request', async ({
      request,
    }) => {
      const response = await request.post(
        `${BASE_API_URL}${authTestData.apiEndpoints.resetPassword}`,
        {
          data: {
            token: 'some_token',
            newPassword: 'Password1!',
            confirmPassword: 'Password2!',
          },
        },
      );

      expect(response.status()).toBe(400);
    });
  });

  // =========================================================================
  // 7. PROTECTED PROFILE API (/auth/me)
  // =========================================================================
  test.describe('GET /auth/me', () => {
    test('TC-API-ME-001: (Negative) Request without Bearer token returns 401 Unauthorized', async ({
      request,
    }) => {
      const response = await request.get(`${BASE_API_URL}${authTestData.apiEndpoints.me}`);
      expect(response.status()).toBe(401);
    });

    test('TC-API-ME-002: (Negative) Request with invalid/malformed Bearer token returns 401 Unauthorized', async ({
      request,
    }) => {
      const response = await request.get(`${BASE_API_URL}${authTestData.apiEndpoints.me}`, {
        headers: {
          Authorization: 'Bearer invalid_malformed_token_99999',
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  // =========================================================================
  // 8. LOGOUT API (/auth/logout)
  // =========================================================================
  test.describe('POST /auth/logout', () => {
    test('TC-API-LOGOUT-001: (Positive) Logout endpoint returns 200 OK', async ({
      request,
    }) => {
      const response = await request.post(`${BASE_API_URL}${authTestData.apiEndpoints.logout}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toContain('Logged out successfully');
    });
  });
});
