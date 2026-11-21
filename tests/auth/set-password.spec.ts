import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Set Password Page - UI, Security & Validation Tests', () => {
  // =========================================================================
  // CATEGORY 1: DIRECT ACCESS BLOCKING & SECURITY
  // =========================================================================
  test.describe('1. Direct Access Security Checks', () => {
    test('TC-SETPW-SEC-001: Direct navigation without token should block access', async ({ setPasswordPage }) => {
      await setPasswordPage.goto();

      await expect(setPasswordPage.blockedCardTitle).toBeVisible();
      await expect(setPasswordPage.blockedCardTitle).toHaveText(authTestData.setPasswordUiText.blockedTitle);

      await expect(setPasswordPage.blockedCardSubtitle).toBeVisible();
      await expect(setPasswordPage.blockedCardSubtitle).toHaveText(authTestData.setPasswordUiText.blockedSubtitle);

      await expect(setPasswordPage.blockedAlertTitle).toBeVisible();
      await expect(setPasswordPage.blockedAlertTitle).toHaveText(authTestData.setPasswordUiText.directAccessBlockedAlert);

      await expect(setPasswordPage.blockedAlertDescription).toBeVisible();
      await expect(setPasswordPage.blockedAlertDescription).toContainText(
        authTestData.setPasswordUiText.directAccessBlockedMessage,
      );

      // Password inputs must NOT be exposed when blocked
      await expect(setPasswordPage.newPasswordInput).not.toBeVisible();
      await expect(setPasswordPage.confirmPasswordInput).not.toBeVisible();
    });

    test('TC-SETPW-SEC-002: Blocked screen buttons should navigate to Signup and Login', async ({
      setPasswordPage,
      page,
    }) => {
      await setPasswordPage.goto();

      await expect(setPasswordPage.requestNewLinkBtn).toBeVisible();
      await expect(setPasswordPage.backToLoginBtn).toBeVisible();

      // Click Back to Login
      await setPasswordPage.clickBackToLogin();
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));

      // Go back to blocked page and click Signup
      await setPasswordPage.goto();
      await setPasswordPage.clickRequestNewLink();
      await expect(page).toHaveURL(new RegExp(authTestData.links.signupPath));
    });

    test('TC-SETPW-SEC-003: Navigation with invalid token should show security rejection', async ({
      setPasswordPage,
    }) => {
      await setPasswordPage.goto('invalid_tampered_token_99999');

      // Wait for token pre-validation to finish and display Access Blocked or error
      await expect(
        setPasswordPage.blockedCardTitle.or(setPasswordPage.errorAlert),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // =========================================================================
  // CATEGORY 2: FORM UI & PASSWORD REQUIREMENTS LAYOUT
  // =========================================================================
  test.describe('2. Form UI & Password Requirements Layout', () => {
    test.beforeEach(async ({ page, setPasswordPage }) => {
      // Mock the token validation endpoint to return valid
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await setPasswordPage.goto('valid_mock_token_abc123');
    });

    test('TC-SETPW-UI-001: Should display Set Your Password title, subtitle, and input fields', async ({
      setPasswordPage,
    }) => {
      await expect(setPasswordPage.cardTitle).toBeVisible();
      await expect(setPasswordPage.cardTitle).toHaveText(authTestData.setPasswordUiText.title);

      await expect(setPasswordPage.cardSubtitle).toBeVisible();
      await expect(setPasswordPage.cardSubtitle).toHaveText(authTestData.setPasswordUiText.subtitle);

      await expect(setPasswordPage.newPasswordLabel).toBeVisible();
      await expect(setPasswordPage.newPasswordLabel).toHaveText(authTestData.setPasswordUiText.newPasswordLabel);
      await expect(setPasswordPage.newPasswordInput).toBeVisible();

      await expect(setPasswordPage.confirmPasswordLabel).toBeVisible();
      await expect(setPasswordPage.confirmPasswordLabel).toHaveText(authTestData.setPasswordUiText.confirmPasswordLabel);
      await expect(setPasswordPage.confirmPasswordInput).toBeVisible();

      await expect(setPasswordPage.submitButton).toBeVisible();
      await expect(setPasswordPage.submitButton).toHaveText(authTestData.setPasswordUiText.submitBtnText);
    });

    test('TC-SETPW-UI-002: Should display the complete 7-rule Password Requirements box', async ({ setPasswordPage }) => {
      await expect(setPasswordPage.passwordRulesContainer).toBeVisible();

      await expect(setPasswordPage.ruleMinLength).toBeVisible();
      await expect(setPasswordPage.ruleMaxLength).toBeVisible();
      await expect(setPasswordPage.ruleUppercase).toBeVisible();
      await expect(setPasswordPage.ruleLowercase).toBeVisible();
      await expect(setPasswordPage.ruleNumber).toBeVisible();
      await expect(setPasswordPage.ruleSpecial).toBeVisible();
      await expect(setPasswordPage.ruleNoSpaces).toBeVisible();
    });

    test('TC-SETPW-UI-003: Password visibility toggles should switch input types between password and text', async ({
      setPasswordPage,
    }) => {
      // Initially password fields should have type="password"
      await expect(setPasswordPage.newPasswordInput).toHaveAttribute('type', 'password');
      await expect(setPasswordPage.confirmPasswordInput).toHaveAttribute('type', 'password');

      // Click toggle for New Password
      await setPasswordPage.toggleNewPasswordVisibility();
      await expect(setPasswordPage.newPasswordInput).toHaveAttribute('type', 'text');

      await setPasswordPage.toggleNewPasswordVisibility();
      await expect(setPasswordPage.newPasswordInput).toHaveAttribute('type', 'password');

      // Click toggle for Confirm Password
      await setPasswordPage.toggleConfirmPasswordVisibility();
      await expect(setPasswordPage.confirmPasswordInput).toHaveAttribute('type', 'text');

      await setPasswordPage.toggleConfirmPasswordVisibility();
      await expect(setPasswordPage.confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  // =========================================================================
  // CATEGORY 3: LIVE PASSWORD RULES VALIDATION
  // =========================================================================
  test.describe('3. Live Password Rules & Validation Logic', () => {
    test.beforeEach(async ({ page, setPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await setPasswordPage.goto('valid_mock_token_abc123');
    });

    test('TC-SETPW-RULES-001: Generated valid 8-character password should satisfy all 7 rules', async ({
      setPasswordPage,
    }) => {
      const validPassword = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(validPassword);

      await expect(setPasswordPage.ruleMinLength).toContainText('✓');
      await expect(setPasswordPage.ruleMaxLength).toContainText('✓');
      await expect(setPasswordPage.ruleUppercase).toContainText('✓');
      await expect(setPasswordPage.ruleLowercase).toContainText('✓');
      await expect(setPasswordPage.ruleNumber).toContainText('✓');
      await expect(setPasswordPage.ruleSpecial).toContainText('✓');
      await expect(setPasswordPage.ruleNoSpaces).toContainText('✓');
    });

    test('TC-SETPW-RULES-002: Password with uppercase missing should fail uppercase rule', async ({ setPasswordPage }) => {
      const noUpper = authTestData.generators.invalidPassword('no_uppercase');
      await setPasswordPage.fillNewPassword(noUpper);

      await expect(setPasswordPage.ruleUppercase).toContainText('•');
      await expect(setPasswordPage.ruleLowercase).toContainText('✓');
    });

    test('TC-SETPW-RULES-003: Password with lowercase missing should fail lowercase rule', async ({ setPasswordPage }) => {
      const noLower = authTestData.generators.invalidPassword('no_lowercase');
      await setPasswordPage.fillNewPassword(noLower);

      await expect(setPasswordPage.ruleLowercase).toContainText('•');
      await expect(setPasswordPage.ruleUppercase).toContainText('✓');
    });

    test('TC-SETPW-RULES-004: Password with number missing should fail number rule', async ({ setPasswordPage }) => {
      const noNumber = authTestData.generators.invalidPassword('no_number');
      await setPasswordPage.fillNewPassword(noNumber);

      await expect(setPasswordPage.ruleNumber).toContainText('•');
    });

    test('TC-SETPW-RULES-005: Password with special character missing should fail special rule', async ({
      setPasswordPage,
    }) => {
      const noSpecial = authTestData.generators.invalidPassword('no_special');
      await setPasswordPage.fillNewPassword(noSpecial);

      await expect(setPasswordPage.ruleSpecial).toContainText('•');
    });

    test('TC-SETPW-RULES-006: Password with spaces should fail no spaces rule', async ({ setPasswordPage }) => {
      const withSpaces = authTestData.generators.invalidPassword('has_spaces');
      await setPasswordPage.fillNewPassword(withSpaces);

      await expect(setPasswordPage.ruleNoSpaces).toContainText('•');
    });
  });

  // =========================================================================
  // CATEGORY 4: LENGTH LIMITS & MISMATCH VALIDATIONS
  // =========================================================================
  test.describe('4. Length Limit & Password Mismatch Validations', () => {
    test.beforeEach(async ({ page, setPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await setPasswordPage.goto('valid_mock_token_abc123');
    });

    test('TC-SETPW-LEN-001: Password exceeding 8 characters should display live character limit error', async ({
      setPasswordPage,
    }) => {
      const tooLong = authTestData.generators.invalidPassword('too_long'); // "Secure1!9"
      await setPasswordPage.fillNewPassword(tooLong);

      await expect(setPasswordPage.newPasswordError).toBeVisible();
      await expect(setPasswordPage.newPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.exceeds8Chars(9),
      );

      // Back to valid 8 characters clears error
      const validPass = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(validPass);
      await expect(setPasswordPage.newPasswordError).not.toBeVisible();
    });

    test('TC-SETPW-LEN-002: Confirm password exceeding 8 characters should display limit error', async ({
      setPasswordPage,
    }) => {
      const tooLong = authTestData.generators.invalidPassword('too_long');
      await setPasswordPage.fillConfirmPassword(tooLong);

      await expect(setPasswordPage.confirmPasswordError).toBeVisible();
      await expect(setPasswordPage.confirmPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.confirmExceeds8Chars(9),
      );
    });

    test('TC-SETPW-MISMATCH-001: Mismatched confirm password should display error on submit', async ({
      setPasswordPage,
    }) => {
      const p1 = authTestData.generators.validPassword();
      const p2 = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(p1);
      await setPasswordPage.fillConfirmPassword(p1 === p2 ? 'Diff9$xy' : p2);
      await setPasswordPage.clickSubmit();

      await expect(setPasswordPage.confirmPasswordError).toBeVisible();
      await expect(setPasswordPage.confirmPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.passwordMismatch,
      );
    });

    test('TC-SETPW-REQ-001: Submitting empty fields should trigger required errors', async ({ setPasswordPage }) => {
      await setPasswordPage.clickSubmit();

      await expect(setPasswordPage.newPasswordError).toBeVisible();
      await expect(setPasswordPage.newPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.newPasswordRequired,
      );

      await expect(setPasswordPage.confirmPasswordError).toBeVisible();
      await expect(setPasswordPage.confirmPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.confirmPasswordRequired,
      );
    });
  });

  // =========================================================================
  // CATEGORY 5: EXPIRED TOKEN UI & NAVIGATION
  // =========================================================================
  test.describe('5. Expired Token — UI & Navigation', () => {
    test.beforeEach(async ({ page, setPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: false,
            reason: 'expired',
            message: 'Verification link has expired (exceeded 2 minutes). Please request a new link.',
          }),
        });
      });

      await setPasswordPage.goto('expired_mock_token_xyz');
    });

    test('TC-SETPW-SEC-004: (Negative) Expired token should show Link Expired card with correct title, alert, and NO password form', async ({
      setPasswordPage,
    }) => {
      await expect(setPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
      await expect(setPasswordPage.expiredCardTitle).toHaveText(authTestData.setPasswordUiText.expiredTitle);

      await expect(setPasswordPage.expiredAlertTitle).toBeVisible();
      await expect(setPasswordPage.expiredAlertTitle).toHaveText(authTestData.setPasswordUiText.expiredAlertTitle);

      // Password inputs must NOT be rendered on expired page
      await expect(setPasswordPage.newPasswordInput).not.toBeVisible();
      await expect(setPasswordPage.confirmPasswordInput).not.toBeVisible();
      await expect(setPasswordPage.submitButton).not.toBeVisible();
    });

    test('TC-SETPW-SEC-005: (Positive) Expired card "Request New Verification Link" should navigate to /signup', async ({
      setPasswordPage,
      page,
    }) => {
      await expect(setPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
      await setPasswordPage.clickRequestNewLink();
      await expect(page).toHaveURL(new RegExp(authTestData.links.signupPath));
    });

    test('TC-SETPW-SEC-006: (Positive) Expired card "Back to Login" should navigate to /login', async ({
      setPasswordPage,
      page,
    }) => {
      await expect(setPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
      await setPasswordPage.clickBackToLogin();
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
    });
  });

  // =========================================================================
  // CATEGORY 6: ADDITIONAL FORM UI & ATTRIBUTES
  // =========================================================================
  test.describe('6. Additional Form UI & Accessibility', () => {
    test.beforeEach(async ({ page, setPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await setPasswordPage.goto('valid_mock_token_abc123');
    });

    test('TC-SETPW-UI-004: Submit button text should be "Activate Account & Set Password"', async ({
      setPasswordPage,
    }) => {
      await expect(setPasswordPage.submitButton).toBeVisible();
      await expect(setPasswordPage.submitButton).toHaveText(authTestData.setPasswordUiText.submitBtnText);
    });

    test('TC-SETPW-UI-005: Footer should display "Already verified?" with Sign In link to /login', async ({
      setPasswordPage,
    }) => {
      const footerText = setPasswordPage.page.locator('//p[contains(., "Already verified?")]');
      await expect(footerText).toBeVisible();

      const signInLink = setPasswordPage.page.locator('//a[@href="/login"]');
      await expect(signInLink.first()).toBeVisible();
    });

    test('TC-SETPW-A11Y-001: Create Password input should have autofocus on page mount', async ({
      setPasswordPage,
    }) => {
      await expect(setPasswordPage.newPasswordInput).toBeFocused({ timeout: 3000 });
    });

    test('TC-SETPW-A11Y-002: Tab navigation should reach Confirm Password from Create Password', async ({
      setPasswordPage,
      page,
    }) => {
      await setPasswordPage.newPasswordInput.focus();
      // Tab through (may pass toggle visibility button first)
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
        const isFocused = await setPasswordPage.confirmPasswordInput.evaluate(
          (el) => el === document.activeElement,
        );
        if (isFocused) break;
      }
      await expect(setPasswordPage.confirmPasswordInput).toBeFocused();
    });
  });

  // =========================================================================
  // CATEGORY 7: ADDITIONAL VALIDATION — POSITIVE & NEGATIVE SCENARIOS
  // =========================================================================
  test.describe('7. Additional Validation — Positive & Negative', () => {
    test.beforeEach(async ({ page, setPasswordPage }) => {
      await page.route('**/auth/validate-token*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true }),
        });
      });

      await setPasswordPage.goto('valid_mock_token_abc123');
    });

    test('TC-SETPW-RULES-007: (Negative) Password too short (5 chars) should fail minimum length rule', async ({
      setPasswordPage,
    }) => {
      const tooShort = authTestData.signupInputs.invalidPasswords.tooShort5Chars;
      await setPasswordPage.fillNewPassword(tooShort);

      await expect(setPasswordPage.ruleMinLength).toContainText('•');
    });

    test('TC-SETPW-LEN-003: (Positive) Typing a valid 8-char password should clear the newPassword exceeds-limit error', async ({
      setPasswordPage,
    }) => {
      // Trigger error with >8 chars
      const tooLong = authTestData.generators.invalidPassword('too_long');
      await setPasswordPage.fillNewPassword(tooLong);
      await expect(setPasswordPage.newPasswordError).toBeVisible();

      // Fix with valid 8-char password → error clears
      const valid = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(valid);
      await expect(setPasswordPage.newPasswordError).not.toBeVisible();
    });

    test('TC-SETPW-LEN-004: (Positive) Typing a valid confirm password should clear the confirmPassword exceeds-limit error', async ({
      setPasswordPage,
    }) => {
      const tooLong = authTestData.generators.invalidPassword('too_long');
      await setPasswordPage.fillConfirmPassword(tooLong);
      await expect(setPasswordPage.confirmPasswordError).toBeVisible();

      const valid = authTestData.generators.validPassword();
      await setPasswordPage.fillConfirmPassword(valid);
      await expect(setPasswordPage.confirmPasswordError).not.toBeVisible();
    });

    test('TC-SETPW-MISMATCH-002: (Positive) Matching valid passwords should NOT trigger mismatch error on submit', async ({
      setPasswordPage,
    }) => {
      const validPass = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(validPass);
      await setPasswordPage.fillConfirmPassword(validPass);
      await setPasswordPage.clickSubmit();

      // confirmPassword mismatch error must not appear when passwords match
      await expect(setPasswordPage.confirmPasswordError).not.toBeVisible();
    });

    test('TC-SETPW-REQ-002: (Negative) Submitting with empty newPassword should show newPassword required error', async ({
      setPasswordPage,
    }) => {
      const validPass = authTestData.generators.validPassword();
      await setPasswordPage.fillConfirmPassword(validPass);
      await setPasswordPage.clickSubmit();

      await expect(setPasswordPage.newPasswordError).toBeVisible();
      await expect(setPasswordPage.newPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.newPasswordRequired,
      );
    });

    test('TC-SETPW-REQ-003: (Negative) Submitting with empty confirmPassword should show confirmPassword required error', async ({
      setPasswordPage,
    }) => {
      const validPass = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(validPass);
      await setPasswordPage.clickSubmit();

      await expect(setPasswordPage.confirmPasswordError).toBeVisible();
      await expect(setPasswordPage.confirmPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.confirmPasswordRequired,
      );
    });

    test('TC-SETPW-NEG-001: (Negative) Submitting a non-compliant password should show "must meet all requirements" error', async ({
      setPasswordPage,
    }) => {
      const tooShort = authTestData.signupInputs.invalidPasswords.tooShort5Chars;
      await setPasswordPage.fillNewPassword(tooShort);
      await setPasswordPage.fillConfirmPassword(tooShort);
      await setPasswordPage.clickSubmit();

      await expect(setPasswordPage.newPasswordError).toBeVisible();
      await expect(setPasswordPage.newPasswordError).toContainText(
        authTestData.setPasswordValidationMessages.passwordMustMeetRequirements,
      );
    });

    test('TC-SETPW-POS-001: (Positive) Valid password submission should show "Account Activated!" success card (mocked backend)', async ({
      setPasswordPage,
      page,
    }) => {
      // Mock set-password API to return success
      await page.route('**/auth/set-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Your password has been set successfully! Your account is now ACTIVE.',
            username: 'testuser',
          }),
        });
      });

      const validPass = authTestData.generators.validPassword();
      await setPasswordPage.fillNewPassword(validPass);
      await setPasswordPage.fillConfirmPassword(validPass);
      await setPasswordPage.clickSubmit();

      await expect(setPasswordPage.successCard).toBeVisible({ timeout: 5000 });
      await expect(setPasswordPage.successTitle).toHaveText(
        authTestData.setPasswordUiText.successTitle,
      );
    });
  });
});
