import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Reset Password Page - UI, Security, Validation & Reset Flow Tests', () => {
  // =========================================================================
  // CATEGORY 1: DIRECT ACCESS & MISSING TOKEN SECURITY
  // =========================================================================
  test.describe('1. Direct Access & Missing Token Security', () => {
    test('TC-RESETPW-SEC-001: (Negative) Direct access without token should show Invalid Link state', async ({
      resetPasswordPage,
    }) => {
      await resetPasswordPage.goto();

      await expect(resetPasswordPage.invalidCardTitle).toBeVisible();
      await expect(resetPasswordPage.invalidCardTitle).toHaveText(authTestData.resetPasswordUiText.invalidTitle);

      // Password inputs must NOT be exposed when token is missing
      await expect(resetPasswordPage.newPasswordInput).not.toBeVisible();
      await expect(resetPasswordPage.confirmPasswordInput).not.toBeVisible();
      await expect(resetPasswordPage.submitButton).not.toBeVisible();
    });

    test('TC-RESETPW-SEC-002: (Positive) Invalid Link buttons should navigate to Forgot Password and Login', async ({
      resetPasswordPage,
      page,
    }) => {
      await resetPasswordPage.goto();

      await expect(resetPasswordPage.requestFreshResetLinkBtn).toBeVisible();
      await expect(resetPasswordPage.backToLoginBtn).toBeVisible();

      // Click Request Fresh Link → /forgot-password
      await resetPasswordPage.clickRequestFreshLink();
      await expect(page).toHaveURL(new RegExp(authTestData.links.forgotPasswordPath));

      // Go back without token, click Back to Login → /login
      await resetPasswordPage.goto();
      await resetPasswordPage.clickBackToLogin();
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
    });

    test('TC-RESETPW-SEC-003: (Negative) Navigation with invalid/tampered token should show security rejection', async ({
      resetPasswordPage,
    }) => {
      await resetPasswordPage.goto('tampered_fake_token_12345');

      await expect(
        resetPasswordPage.invalidCardTitle.or(resetPasswordPage.errorAlert),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // =========================================================================
  // CATEGORY 2: EXPIRED TOKEN UI & NAVIGATION
  // =========================================================================
  test.describe('2. Expired Token UI & Navigation', () => {
    test.beforeEach(async ({ page, resetPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: false,
            reason: 'expired',
            message: 'Password reset link has expired (exceeded 2 minutes). Please request a new one.',
          }),
        });
      });

      await resetPasswordPage.goto('mock_expired_reset_token');
    });

    test('TC-RESETPW-SEC-004: (Negative) Expired token should render Link Expired card with alert and NO form', async ({
      resetPasswordPage,
    }) => {
      await expect(resetPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
      await expect(resetPasswordPage.expiredCardTitle).toHaveText(authTestData.resetPasswordUiText.expiredTitle);

      await expect(resetPasswordPage.expiredAlertTitle).toBeVisible();
      await expect(resetPasswordPage.expiredAlertTitle).toHaveText(authTestData.resetPasswordUiText.expiredAlertTitle);

      // Form must NOT be visible
      await expect(resetPasswordPage.newPasswordInput).not.toBeVisible();
      await expect(resetPasswordPage.confirmPasswordInput).not.toBeVisible();
      await expect(resetPasswordPage.submitButton).not.toBeVisible();
    });

    test('TC-RESETPW-SEC-005: (Positive) Expired card "Request a Fresh Reset Link" navigates to /forgot-password', async ({
      resetPasswordPage,
      page,
    }) => {
      await expect(resetPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
      await resetPasswordPage.clickRequestFreshLink();
      await expect(page).toHaveURL(new RegExp(authTestData.links.forgotPasswordPath));
    });

    test('TC-RESETPW-SEC-006: (Positive) Expired card "Return to Login" navigates to /login', async ({
      resetPasswordPage,
      page,
    }) => {
      await expect(resetPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
      await resetPasswordPage.clickBackToLogin();
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
    });
  });

  // =========================================================================
  // CATEGORY 3: FORM UI & PASSWORD REQUIREMENTS (WITH VALID TOKEN)
  // =========================================================================
  test.describe('3. Form UI & Password Requirements Layout', () => {
    test.beforeEach(async ({ page, resetPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true, message: 'Password reset link is valid.' }),
        });
      });

      await resetPasswordPage.goto('mock_valid_reset_token');
    });

    test('TC-RESETPW-UI-001: Should display Reset Password title, subtitle, and input fields', async ({
      resetPasswordPage,
    }) => {
      await expect(resetPasswordPage.cardTitle).toBeVisible();
      await expect(resetPasswordPage.cardTitle).toHaveText(authTestData.resetPasswordUiText.title);

      await expect(resetPasswordPage.cardSubtitle).toBeVisible();
      await expect(resetPasswordPage.cardSubtitle).toHaveText(authTestData.resetPasswordUiText.subtitle);

      await expect(resetPasswordPage.newPasswordLabel).toBeVisible();
      await expect(resetPasswordPage.confirmPasswordLabel).toBeVisible();
      await expect(resetPasswordPage.submitButton).toBeVisible();
      await expect(resetPasswordPage.submitButton).toHaveText(authTestData.resetPasswordUiText.submitBtnText);
    });

    test('TC-RESETPW-UI-002: Should display the complete 7-rule Password Requirements checklist', async ({
      resetPasswordPage,
    }) => {
      await expect(resetPasswordPage.passwordRulesContainer).toBeVisible();
      await expect(resetPasswordPage.ruleMinLength).toBeVisible();
      await expect(resetPasswordPage.ruleMaxLength).toBeVisible();
      await expect(resetPasswordPage.ruleUppercase).toBeVisible();
      await expect(resetPasswordPage.ruleLowercase).toBeVisible();
      await expect(resetPasswordPage.ruleNumber).toBeVisible();
      await expect(resetPasswordPage.ruleSpecial).toBeVisible();
      await expect(resetPasswordPage.ruleNoSpaces).toBeVisible();
    });

    test('TC-RESETPW-UI-003: Password visibility toggles switch input types between password and text', async ({
      resetPasswordPage,
    }) => {
      await expect(resetPasswordPage.newPasswordInput).toHaveAttribute('type', 'password');
      await expect(resetPasswordPage.confirmPasswordInput).toHaveAttribute('type', 'password');

      // Toggle new password
      await resetPasswordPage.toggleNewPasswordVisibility();
      await expect(resetPasswordPage.newPasswordInput).toHaveAttribute('type', 'text');
      await resetPasswordPage.toggleNewPasswordVisibility();
      await expect(resetPasswordPage.newPasswordInput).toHaveAttribute('type', 'password');

      // Toggle confirm password
      await resetPasswordPage.toggleConfirmPasswordVisibility();
      await expect(resetPasswordPage.confirmPasswordInput).toHaveAttribute('type', 'text');
      await resetPasswordPage.toggleConfirmPasswordVisibility();
      await expect(resetPasswordPage.confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    test('TC-RESETPW-UI-004: Footer should display "Remember your password?" with Sign In link to /login', async ({
      resetPasswordPage,
    }) => {
      const footerText = resetPasswordPage.page.locator('//p[contains(., "Remember your password?")]');
      await expect(footerText).toBeVisible();

      const signInLink = resetPasswordPage.page.locator('//a[@href="/login"]');
      await expect(signInLink.first()).toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 4: LIVE PASSWORD RULES VALIDATION
  // =========================================================================
  test.describe('4. Live Password Rules Validation Logic', () => {
    test.beforeEach(async ({ page, resetPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await resetPasswordPage.goto('mock_valid_reset_token');
    });

    test('TC-RESETPW-RULES-001: (Positive) Valid 8-char password should satisfy all 7 rules', async ({
      resetPasswordPage,
    }) => {
      const validPass = authTestData.generators.validPassword();
      await resetPasswordPage.fillNewPassword(validPass);

      await expect(resetPasswordPage.ruleMinLength).toContainText('✓');
      await expect(resetPasswordPage.ruleMaxLength).toContainText('✓');
      await expect(resetPasswordPage.ruleUppercase).toContainText('✓');
      await expect(resetPasswordPage.ruleLowercase).toContainText('✓');
      await expect(resetPasswordPage.ruleNumber).toContainText('✓');
      await expect(resetPasswordPage.ruleSpecial).toContainText('✓');
      await expect(resetPasswordPage.ruleNoSpaces).toContainText('✓');
    });

    test('TC-RESETPW-RULES-002: (Negative) Password missing uppercase should fail uppercase rule', async ({
      resetPasswordPage,
    }) => {
      const noUpper = authTestData.generators.invalidPassword('no_uppercase');
      await resetPasswordPage.fillNewPassword(noUpper);

      await expect(resetPasswordPage.ruleUppercase).toContainText('•');
      await expect(resetPasswordPage.ruleLowercase).toContainText('✓');
    });

    test('TC-RESETPW-RULES-003: (Negative) Password missing lowercase should fail lowercase rule', async ({
      resetPasswordPage,
    }) => {
      const noLower = authTestData.generators.invalidPassword('no_lowercase');
      await resetPasswordPage.fillNewPassword(noLower);

      await expect(resetPasswordPage.ruleLowercase).toContainText('•');
      await expect(resetPasswordPage.ruleUppercase).toContainText('✓');
    });

    test('TC-RESETPW-RULES-004: (Negative) Password missing number should fail number rule', async ({
      resetPasswordPage,
    }) => {
      const noNum = authTestData.generators.invalidPassword('no_number');
      await resetPasswordPage.fillNewPassword(noNum);

      await expect(resetPasswordPage.ruleNumber).toContainText('•');
    });

    test('TC-RESETPW-RULES-005: (Negative) Password missing special char should fail special rule', async ({
      resetPasswordPage,
    }) => {
      const noSpec = authTestData.generators.invalidPassword('no_special');
      await resetPasswordPage.fillNewPassword(noSpec);

      await expect(resetPasswordPage.ruleSpecial).toContainText('•');
    });

    test('TC-RESETPW-RULES-006: (Negative) Password with spaces should fail no-spaces rule', async ({
      resetPasswordPage,
    }) => {
      const withSpaces = authTestData.generators.invalidPassword('has_spaces');
      await resetPasswordPage.fillNewPassword(withSpaces);

      await expect(resetPasswordPage.ruleNoSpaces).toContainText('•');
    });

    test('TC-RESETPW-RULES-007: (Negative) Password too short should fail min length rule', async ({
      resetPasswordPage,
    }) => {
      const tooShort = authTestData.signupInputs.invalidPasswords.tooShort5Chars;
      await resetPasswordPage.fillNewPassword(tooShort);

      await expect(resetPasswordPage.ruleMinLength).toContainText('•');
    });
  });

  // =========================================================================
  // CATEGORY 5: LENGTH LIMITS & MISMATCH VALIDATIONS
  // =========================================================================
  test.describe('5. Length Limits & Mismatch Validations', () => {
    test.beforeEach(async ({ page, resetPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await resetPasswordPage.goto('mock_valid_reset_token');
    });

    test('TC-RESETPW-LEN-001: (Negative) New password > 8 chars shows live character count error', async ({
      resetPasswordPage,
    }) => {
      const tooLong = authTestData.generators.invalidPassword('too_long');
      await resetPasswordPage.fillNewPassword(tooLong);

      await expect(resetPasswordPage.newPasswordError).toBeVisible();
      await expect(resetPasswordPage.newPasswordError).toContainText(
        authTestData.resetPasswordValidationMessages.exceeds8Chars(9),
      );
    });

    test('TC-RESETPW-LEN-002: (Negative) Confirm password > 8 chars shows live character count error', async ({
      resetPasswordPage,
    }) => {
      const tooLong = authTestData.generators.invalidPassword('too_long');
      await resetPasswordPage.fillConfirmPassword(tooLong);

      await expect(resetPasswordPage.confirmPasswordError).toBeVisible();
      await expect(resetPasswordPage.confirmPasswordError).toContainText(
        authTestData.resetPasswordValidationMessages.confirmExceeds8Chars(9),
      );
    });

    test('TC-RESETPW-MISMATCH-001: (Negative) Mismatched confirm password shows error on submit', async ({
      resetPasswordPage,
    }) => {
      const p1 = authTestData.generators.validPassword();
      const p2 = authTestData.generators.validPassword();
      await resetPasswordPage.fillNewPassword(p1);
      await resetPasswordPage.fillConfirmPassword(p1 === p2 ? 'Diff9$xy' : p2);
      await resetPasswordPage.clickSubmit();

      await expect(resetPasswordPage.confirmPasswordError).toBeVisible();
      await expect(resetPasswordPage.confirmPasswordError).toContainText(
        authTestData.resetPasswordValidationMessages.passwordMismatch,
      );
    });

    test('TC-RESETPW-REQ-001: (Negative) Submitting empty fields triggers required validations', async ({
      resetPasswordPage,
    }) => {
      await resetPasswordPage.clickSubmit();

      await expect(resetPasswordPage.newPasswordError).toBeVisible();
      await expect(resetPasswordPage.newPasswordError).toContainText(
        authTestData.resetPasswordValidationMessages.newPasswordRequired,
      );

      await expect(resetPasswordPage.confirmPasswordError).toBeVisible();
      await expect(resetPasswordPage.confirmPasswordError).toContainText(
        authTestData.resetPasswordValidationMessages.confirmPasswordRequired,
      );
    });
  });

  // =========================================================================
  // CATEGORY 6: SUCCESSFUL PASSWORD RESET & REDIRECTION
  // =========================================================================
  test.describe('6. Successful Password Reset Flow (Mocked & Navigation)', () => {
    test('TC-RESETPW-SUCCESS-001: (Positive) Submitting valid password shows Password Reset Complete! and redirects to /login', async ({
      resetPasswordPage,
      page,
    }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await page.route('**/auth/reset-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Your password has been successfully reset! You can now log in with your new password.',
          }),
        });
      });

      await resetPasswordPage.goto('mock_valid_reset_token');

      const validPass = authTestData.generators.validPassword();
      await resetPasswordPage.fillNewPassword(validPass);
      await resetPasswordPage.fillConfirmPassword(validPass);
      await resetPasswordPage.clickSubmit();

      // Check success card
      await expect(resetPasswordPage.successCard).toBeVisible({ timeout: 5000 });
      await expect(resetPasswordPage.successTitle).toHaveText(
        authTestData.resetPasswordUiText.successTitle,
      );

      // Verify auto-redirect to /login
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 10000 });
    });
  });
});
