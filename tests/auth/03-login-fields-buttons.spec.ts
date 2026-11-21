import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Login Page - Fields & Buttons Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ==========================================
  // Category 3: Username/Email Field
  // ==========================================

  test('TC-LOGIN-FIELD-USER-001: Verify username field has autofocus on initial load', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeFocused();
  });

  test('TC-LOGIN-FIELD-USER-002: Accept valid standard username input', async ({ loginPage }) => {
    const validUser = authTestData.inputs.validUsernames[0];
    await loginPage.fillUsername(validUser);
    await expect(loginPage.usernameInput).toHaveValue(validUser);
  });

  test('TC-LOGIN-FIELD-USER-003: Accept valid lowercase email address input', async ({ loginPage }) => {
    const emailUser = 'john.doe@example.com';
    await loginPage.fillUsername(emailUser);
    await expect(loginPage.usernameInput).toHaveValue(emailUser);
  });

  test('TC-LOGIN-FIELD-USER-004: Accept inputs with leading and trailing spaces', async ({ loginPage }) => {
    const spaceText = authTestData.inputs.spacesWithText;
    await loginPage.fillUsername(spaceText);
    await expect(loginPage.usernameInput).toHaveValue(spaceText);
  });

  test('TC-LOGIN-FIELD-USER-005: Accept special characters in username field', async ({ loginPage }) => {
    const specialChars = authTestData.inputs.specialCharacters;
    await loginPage.fillUsername(specialChars);
    await expect(loginPage.usernameInput).toHaveValue(specialChars);
  });

  test('TC-LOGIN-FIELD-USER-006: Boundary test - Accept single character username', async ({ loginPage }) => {
    const shortUser = authTestData.inputs.shortUsername;
    await loginPage.fillUsername(shortUser);
    await expect(loginPage.usernameInput).toHaveValue(shortUser);
  });

  test('TC-LOGIN-FIELD-USER-007: Boundary test - Accept very long username string (250 chars)', async ({ loginPage }) => {
    const longUser = authTestData.inputs.veryLongUsername;
    await loginPage.fillUsername(longUser);
    await expect(loginPage.usernameInput).toHaveValue(longUser);
  });

  test('TC-LOGIN-FIELD-USER-008: Verify typing and clearing username field', async ({ loginPage }) => {
    await loginPage.fillUsername('temp_username');
    await expect(loginPage.usernameInput).toHaveValue('temp_username');

    await loginPage.clearUsername();
    await expect(loginPage.usernameInput).toHaveValue('');
  });

  test('TC-LOGIN-FIELD-USER-009: Verify replacing username input value', async ({ loginPage }) => {
    await loginPage.fillUsername('first_user');
    await expect(loginPage.usernameInput).toHaveValue('first_user');

    await loginPage.fillUsername('second_user');
    await expect(loginPage.usernameInput).toHaveValue('second_user');
  });

  // ==========================================
  // Category 4: Password Field & Visibility
  // ==========================================

  test('TC-LOGIN-FIELD-PASS-001: Password input is masked (type="password") by default', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC-LOGIN-FIELD-PASS-002: Toggle eye icon unmasks password to type="text"', async ({ loginPage }) => {
    await loginPage.fillPassword('MySecretP@ss123');
    await loginPage.togglePasswordVisibility();

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  test('TC-LOGIN-FIELD-PASS-003: Toggle eye icon updates aria-label and title to "Hide password"', async ({ loginPage }) => {
    await loginPage.togglePasswordVisibility();

    await expect(loginPage.passwordToggleBtn).toHaveAttribute('aria-label', 'Hide password');
    await expect(loginPage.passwordToggleBtn).toHaveAttribute('title', 'Hide password');
  });

  test('TC-LOGIN-FIELD-PASS-004: Toggling eye icon a second time masks password back to type="password"', async ({ loginPage }) => {
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(loginPage.passwordToggleBtn).toHaveAttribute('aria-label', 'Show password');
  });

  test('TC-LOGIN-FIELD-PASS-005: Accept special characters in password field', async ({ loginPage }) => {
    const specialPass = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
    await loginPage.fillPassword(specialPass);
    await expect(loginPage.passwordInput).toHaveValue(specialPass);
  });

  test('TC-LOGIN-FIELD-PASS-006: Boundary test - Accept very long password string', async ({ loginPage }) => {
    const longPass = authTestData.inputs.veryLongPassword;
    await loginPage.fillPassword(longPass);
    await expect(loginPage.passwordInput).toHaveValue(longPass);
  });

  test('TC-LOGIN-FIELD-PASS-007: Verify typing and clearing password field', async ({ loginPage }) => {
    await loginPage.fillPassword('Secret123');
    await expect(loginPage.passwordInput).toHaveValue('Secret123');

    await loginPage.clearPassword();
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('TC-LOGIN-FIELD-PASS-008: Password value persists intact across visibility toggles', async ({ loginPage }) => {
    const secret = 'PersistPass#2026';
    await loginPage.fillPassword(secret);

    // Toggle to visible
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveValue(secret);

    // Toggle back to masked
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveValue(secret);
  });

  // ==========================================
  // Category 5: Login Button Interactions
  // ==========================================

  test('TC-LOGIN-BTN-001: Login button is visible and enabled on initial render', async ({ loginPage }) => {
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toBeEnabled();
  });

  test('TC-LOGIN-BTN-002: Login button has type="submit" and "Login" text', async ({ loginPage }) => {
    await expect(loginPage.submitButton).toHaveAttribute('type', 'submit');
    await expect(loginPage.submitButton).toHaveText(authTestData.uiText.buttonText);
  });

  test('TC-LOGIN-BTN-003: Login button triggers validation when clicked with empty inputs', async ({ loginPage }) => {
    await loginPage.clickLogin();

    await expect(loginPage.usernameError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
  });

  test('TC-LOGIN-BTN-004: Form submission can be triggered via Enter key on username input', async ({ loginPage }) => {
    await loginPage.usernameInput.focus();
    await loginPage.submitWithEnter();

    // Triggered validation due to empty fields
    await expect(loginPage.usernameError).toBeVisible();
  });

  test('TC-LOGIN-BTN-005: Form submission can be triggered via Enter key on password input', async ({ loginPage }) => {
    await loginPage.fillUsername('valid_user');
    await loginPage.passwordInput.focus();
    await loginPage.submitWithEnter();

    // Password was empty, so password error triggers
    await expect(loginPage.passwordError).toBeVisible();
    await expect(loginPage.passwordError).toContainText(authTestData.validationMessages.passwordRequired);
  });
});
