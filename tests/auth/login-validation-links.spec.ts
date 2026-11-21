import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Login Page - Validation & Navigation Links Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ==========================================
  // Category 6: Navigation Links
  // ==========================================

  test('TC-LOGIN-LINK-001: Verify Forgot Password link href attribute', async ({ loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toHaveAttribute('href', authTestData.links.forgotPasswordPath);
  });

  test('TC-LOGIN-LINK-002: Verify Forgot Password link click navigates to forgot password page', async ({ page, loginPage }) => {
    await loginPage.clickForgotPassword();
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('TC-LOGIN-LINK-003: Verify Sign Up link href attribute', async ({ loginPage }) => {
    await expect(loginPage.signupLink).toBeVisible();
    await expect(loginPage.signupLink).toHaveAttribute('href', authTestData.links.signupPath);
  });

  test('TC-LOGIN-LINK-004: Verify Sign Up link click navigates to signup page', async ({ page, loginPage }) => {
    await loginPage.clickSignup();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('TC-LOGIN-LINK-005: Verify link styling classes for blue text and hover transitions', async ({ loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toHaveClass(/text-blue-600/);
    await expect(loginPage.signupLink).toHaveClass(/text-blue-600/);
  });

  // ==========================================
  // Category 7: Client Validations & Error Clearing
  // ==========================================

  test('TC-LOGIN-VAL-001: Submitting empty form displays both required field errors', async ({ loginPage }) => {
    await loginPage.clickLogin();

    await expect(loginPage.usernameError).toBeVisible();
    await expect(loginPage.usernameError).toContainText(authTestData.validationMessages.usernameRequired);

    await expect(loginPage.passwordError).toBeVisible();
    await expect(loginPage.passwordError).toContainText(authTestData.validationMessages.passwordRequired);
  });

  test('TC-LOGIN-VAL-002: Submitting empty username with valid password triggers username required error', async ({ loginPage }) => {
    await loginPage.fillPassword('ValidPassword123!');
    await loginPage.clickLogin();

    await expect(loginPage.usernameError).toBeVisible();
    await expect(loginPage.usernameError).toContainText(authTestData.validationMessages.usernameRequired);
    await expect(loginPage.passwordError).not.toBeVisible();
  });

  test('TC-LOGIN-VAL-003: Submitting whitespace-only username triggers username required error', async ({ loginPage }) => {
    await loginPage.fillUsername(authTestData.inputs.whitespaceOnly);
    await loginPage.fillPassword('ValidPassword123!');
    await loginPage.clickLogin();

    await expect(loginPage.usernameError).toBeVisible();
    await expect(loginPage.usernameError).toContainText(authTestData.validationMessages.usernameRequired);
  });

  test('TC-LOGIN-VAL-004: Submitting valid username with empty password triggers password required error', async ({ loginPage }) => {
    await loginPage.fillUsername('valid_username');
    await loginPage.clickLogin();

    await expect(loginPage.passwordError).toBeVisible();
    await expect(loginPage.passwordError).toContainText(authTestData.validationMessages.passwordRequired);
    await expect(loginPage.usernameError).not.toBeVisible();
  });

  test('TC-LOGIN-VAL-005: Reject uppercase email on login (AUTH-001 validation rule)', async ({ loginPage }) => {
    const uppercaseEmail = authTestData.inputs.uppercaseEmails[0];
    await loginPage.fillUsername(uppercaseEmail);
    await loginPage.fillPassword('ValidPassword123!');
    await loginPage.clickLogin();

    await expect(loginPage.usernameError).toBeVisible();
    await expect(loginPage.usernameError).toContainText(authTestData.validationMessages.uppercaseEmail);
  });

  test('TC-LOGIN-VAL-006: Lowercase email does not trigger uppercase email error', async ({ loginPage }) => {
    await loginPage.fillUsername('user@example.com');
    await loginPage.clickLogin();

    // Username error should not be visible (only password required error)
    await expect(loginPage.usernameError).not.toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
  });

  test('TC-LOGIN-VAL-007: Standard uppercase username without @ does not trigger uppercase email error', async ({ loginPage }) => {
    await loginPage.fillUsername('ADMIN_USER');
    await loginPage.clickLogin();

    // Uppercase username without @ is valid, only password should be required
    await expect(loginPage.usernameError).not.toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
  });

  test('TC-LOGIN-VAL-008: Error positioning - username error appears between username and password fields', async ({ loginPage }) => {
    await loginPage.clickLogin();

    const usernameBox = await loginPage.usernameInput.boundingBox();
    const errorBox = await loginPage.usernameError.boundingBox();
    const passwordBox = await loginPage.passwordInput.boundingBox();

    expect(usernameBox).not.toBeNull();
    expect(errorBox).not.toBeNull();
    expect(passwordBox).not.toBeNull();

    // Error is vertically below username input and above password input
    expect(errorBox!.y).toBeGreaterThan(usernameBox!.y);
    expect(errorBox!.y).toBeLessThan(passwordBox!.y);
  });

  test('TC-LOGIN-VAL-009: Error positioning - password error appears between password input and submit button', async ({ loginPage }) => {
    await loginPage.clickLogin();

    const passwordBox = await loginPage.passwordInput.boundingBox();
    const errorBox = await loginPage.passwordError.boundingBox();
    const buttonBox = await loginPage.submitButton.boundingBox();

    expect(passwordBox).not.toBeNull();
    expect(errorBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    // Error is vertically below password input and above submit button
    expect(errorBox!.y).toBeGreaterThan(passwordBox!.y);
    expect(errorBox!.y).toBeLessThan(buttonBox!.y);
  });

  test('TC-LOGIN-VAL-010: Error clearing - typing into username input clears username error', async ({ loginPage }) => {
    // Trigger validation error
    await loginPage.clickLogin();
    await expect(loginPage.usernameError).toBeVisible();

    // Type a character into username input
    await loginPage.usernameInput.pressSequentially('a');
    await expect(loginPage.usernameError).not.toBeVisible();
  });

  test('TC-LOGIN-VAL-011: Error clearing - typing into password input clears password error', async ({ loginPage }) => {
    // Trigger validation error
    await loginPage.clickLogin();
    await expect(loginPage.passwordError).toBeVisible();

    // Type a character into password input
    await loginPage.passwordInput.pressSequentially('p');
    await expect(loginPage.passwordError).not.toBeVisible();
  });
});
