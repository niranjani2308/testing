import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Forgot Password Page - UI, Validation & Recovery Tests', () => {
  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
  });

  // =========================================================================
  // CATEGORY 1: UI & VISUAL LAYOUT
  // =========================================================================
  test.describe('1. UI & Visual Layout', () => {
    test('TC-FORGOT-UI-001: Should display Forgot Password auth card, title, and descriptive subtitle', async ({
      forgotPasswordPage,
    }) => {
      await expect(forgotPasswordPage.authCard).toBeVisible();
      await expect(forgotPasswordPage.cardTitle).toBeVisible();
      await expect(forgotPasswordPage.cardTitle).toHaveText(authTestData.forgotPasswordUiText.title);

      await expect(forgotPasswordPage.cardSubtitle).toBeVisible();
      await expect(forgotPasswordPage.cardSubtitle).toHaveText(authTestData.forgotPasswordUiText.subtitle);
    });

    test('TC-FORGOT-UI-002: Should display Registered Email Address label and placeholder', async ({
      forgotPasswordPage,
    }) => {
      await expect(forgotPasswordPage.emailLabel).toBeVisible();
      await expect(forgotPasswordPage.emailLabel).toHaveText(authTestData.forgotPasswordUiText.emailLabel);

      await expect(forgotPasswordPage.emailInput).toBeVisible();
      await expect(forgotPasswordPage.emailInput).toHaveAttribute(
        'placeholder',
        authTestData.forgotPasswordUiText.emailPlaceholder,
      );
    });

    test('TC-FORGOT-UI-003: Should display "Send Password Reset Link" submit button', async ({
      forgotPasswordPage,
    }) => {
      await expect(forgotPasswordPage.submitButton).toBeVisible();
      await expect(forgotPasswordPage.submitButton).toBeEnabled();
      await expect(forgotPasswordPage.submitButton).toHaveText(
        authTestData.forgotPasswordUiText.submitBtnText,
      );
    });

    test('TC-FORGOT-UI-004: Should display "Back to Login" navigation link in footer', async ({
      forgotPasswordPage,
    }) => {
      await expect(forgotPasswordPage.backToLoginLink).toBeVisible();
      await expect(forgotPasswordPage.backToLoginLink).toHaveAttribute('href', authTestData.links.loginPath);
    });
  });

  // =========================================================================
  // CATEGORY 2: FIELD VALIDATION (POSITIVE & NEGATIVE)
  // =========================================================================
  test.describe('2. Field Validations (Positive & Negative)', () => {
    test('TC-FORGOT-VAL-001: (Negative) Submitting empty email should display required error', async ({
      forgotPasswordPage,
    }) => {
      await forgotPasswordPage.clickSubmit();

      await expect(forgotPasswordPage.errorAlert).toBeVisible();
      await expect(forgotPasswordPage.errorAlert).toContainText(
        authTestData.forgotPasswordValidationMessages.emailRequired,
      );
    });

    test('TC-FORGOT-VAL-002: (Negative) Submitting whitespace-only email should display required error', async ({
      forgotPasswordPage,
    }) => {
      await forgotPasswordPage.fillEmail('     ');
      await forgotPasswordPage.clickSubmit();

      await expect(forgotPasswordPage.errorAlert).toBeVisible();
      await expect(forgotPasswordPage.errorAlert).toContainText(
        authTestData.forgotPasswordValidationMessages.emailRequired,
      );
    });

    for (const invalidEmail of authTestData.signupInputs.invalidEmails) {
      test(`TC-FORGOT-VAL-003: (Negative) Should reject invalid email format "${invalidEmail}"`, async ({
        forgotPasswordPage,
      }) => {
        await forgotPasswordPage.fillEmail(invalidEmail);
        await forgotPasswordPage.clickSubmit();

        await expect(forgotPasswordPage.errorAlert).toBeVisible();
        await expect(forgotPasswordPage.errorAlert).toContainText(
          authTestData.forgotPasswordValidationMessages.emailInvalid,
        );
      });
    }

    test('TC-FORGOT-VAL-004: (Positive) Typing into email field should clear existing error', async ({
      forgotPasswordPage,
    }) => {
      await forgotPasswordPage.clickSubmit();
      await expect(forgotPasswordPage.errorAlert).toBeVisible();

      await forgotPasswordPage.fillEmail('valid@example.com');
      await expect(forgotPasswordPage.errorAlert).not.toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 3: RECOVERY DISPATCH (MOCKED & REAL)
  // =========================================================================
  test.describe('3. Password Recovery Dispatch (Positive & Security)', () => {
    test('TC-FORGOT-DISPATCH-001: (Positive) Submitting valid email displays Password Recovery Dispatched success card', async ({
      forgotPasswordPage,
      page,
    }) => {
      await page.route('**/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message:
              'If an account is associated with this email, a 2-minute password reset link has been dispatched.',
            link: 'http://localhost:3000/reset-password?token=mock_reset_token',
          }),
        });
      });

      await forgotPasswordPage.fillEmail('registered_user@example.com');
      await forgotPasswordPage.clickSubmit();

      await expect(forgotPasswordPage.successCard).toBeVisible({ timeout: 5000 });
      await expect(forgotPasswordPage.successTitle).toHaveText(
        authTestData.forgotPasswordUiText.successTitle,
      );
      await expect(forgotPasswordPage.linkValidityNote).toBeVisible();
      await expect(forgotPasswordPage.returnToLoginBtn).toBeVisible();
    });

    test('TC-FORGOT-DISPATCH-002: (Security) Submitting unregistered email returns non-revealing generic success', async ({
      forgotPasswordPage,
      page,
    }) => {
      await page.route('**/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message:
              'If an account is associated with this email, a 2-minute password reset link has been dispatched.',
          }),
        });
      });

      await forgotPasswordPage.fillEmail('nonexistent_user_9999@example.com');
      await forgotPasswordPage.clickSubmit();

      // Does not reveal account absence: shows standard success card
      await expect(forgotPasswordPage.successCard).toBeVisible({ timeout: 5000 });
      await expect(forgotPasswordPage.successTitle).toHaveText(
        authTestData.forgotPasswordUiText.successTitle,
      );
    });

    test('TC-FORGOT-DISPATCH-003: (Positive) Clicking "Return to Login" from success card navigates to /login', async ({
      forgotPasswordPage,
      page,
    }) => {
      await page.route('**/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Reset link dispatched.',
          }),
        });
      });

      await forgotPasswordPage.fillEmail('nav_test@example.com');
      await forgotPasswordPage.clickSubmit();

      await expect(forgotPasswordPage.successCard).toBeVisible();
      await forgotPasswordPage.clickReturnToLogin();

      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
    });
  });

  // =========================================================================
  // CATEGORY 4: COOLDOWN & THROTTLING (FRONTEND & BACKEND)
  // =========================================================================
  test.describe('4. Cooldown & Throttling Feedback', () => {
    test('TC-FORGOT-THROTTLE-001: (Negative) Backend 429 throttling should display rate limit error message', async ({
      forgotPasswordPage,
      page,
    }) => {
      await page.route('**/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Too many password reset requests. Please wait 55 seconds.',
          }),
        });
      });

      await forgotPasswordPage.fillEmail('throttle_test@example.com');
      await forgotPasswordPage.clickSubmit();

      await expect(forgotPasswordPage.errorAlert).toBeVisible();
      await expect(forgotPasswordPage.errorAlert).toContainText('Too many password reset requests');
    });

    test('TC-FORGOT-THROTTLE-002: (Positive) Submit button shows loading spinner during submission', async ({
      forgotPasswordPage,
      page,
    }) => {
      await page.route('**/auth/forgot-password', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Success' }),
        });
      });

      await forgotPasswordPage.fillEmail('loading_test@example.com');
      await forgotPasswordPage.clickSubmit();

      // Submit button should be disabled during loading
      await expect(forgotPasswordPage.submitButton).toBeDisabled();
    });
  });

  // =========================================================================
  // CATEGORY 5: KEYBOARD & NAVIGATION
  // =========================================================================
  test.describe('5. Keyboard & Navigation', () => {
    test('TC-FORGOT-NAV-001: Clicking "Back to Login" link from form navigates to /login', async ({
      forgotPasswordPage,
      page,
    }) => {
      await forgotPasswordPage.clickBackToLogin();
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
    });

    test('TC-FORGOT-KEY-001: Pressing Enter on email input should submit the form', async ({
      forgotPasswordPage,
      page,
    }) => {
      await forgotPasswordPage.emailInput.focus();
      await page.keyboard.press('Enter');

      // Empty submission should trigger required error
      await expect(forgotPasswordPage.errorAlert).toBeVisible();
      await expect(forgotPasswordPage.errorAlert).toContainText(
        authTestData.forgotPasswordValidationMessages.emailRequired,
      );
    });

    test('TC-FORGOT-A11Y-001: Email input should be autofocus on page load', async ({
      forgotPasswordPage,
    }) => {
      await expect(forgotPasswordPage.emailInput).toBeFocused();
    });
  });
});
