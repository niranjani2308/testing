import { test, expect } from '../../fixtures/test.fixture';

test.describe('Login Page - Keyboard, Accessibility & Responsive UI Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ==========================================
  // Category 8: Keyboard Interactions
  // ==========================================

  test('TC-LOGIN-KEY-001: Tab navigation from username directly focuses password input', async ({ loginPage }) => {
    await loginPage.usernameInput.focus();
    await expect(loginPage.usernameInput).toBeFocused();

    // In LoginPage.tsx, pressing Tab on username is intercepted to focus passwordInputRef
    await loginPage.page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
  });

  test('TC-LOGIN-KEY-002: Tab navigation from password input focuses Forgot Password link', async ({ loginPage }) => {
    await loginPage.passwordInput.focus();
    await expect(loginPage.passwordInput).toBeFocused();

    // Password toggle has tabIndex={-1}, so next focusable element is Forgot Password link
    await loginPage.page.keyboard.press('Tab');
    await expect(loginPage.forgotPasswordLink).toBeFocused();
  });

  test('TC-LOGIN-KEY-003: Tab navigation from Forgot Password link focuses Login submit button', async ({ loginPage }) => {
    await loginPage.forgotPasswordLink.focus();
    await expect(loginPage.forgotPasswordLink).toBeFocused();

    await loginPage.page.keyboard.press('Tab');
    await expect(loginPage.submitButton).toBeFocused();
  });

  test('TC-LOGIN-KEY-004: Tab navigation from Login button focuses Create an Account link', async ({ loginPage }) => {
    await loginPage.submitButton.focus();
    await expect(loginPage.submitButton).toBeFocused();

    await loginPage.page.keyboard.press('Tab');
    await expect(loginPage.signupLink).toBeFocused();
  });

  test('TC-LOGIN-KEY-005: Shift+Tab moves focus backwards from password to username', async ({ loginPage }) => {
    await loginPage.passwordInput.focus();
    await expect(loginPage.passwordInput).toBeFocused();

    await loginPage.page.keyboard.press('Shift+Tab');
    await expect(loginPage.usernameInput).toBeFocused();
  });

  test('TC-LOGIN-KEY-006: Pressing Enter key submits the form', async ({ loginPage }) => {
    await loginPage.usernameInput.focus();
    await loginPage.page.keyboard.press('Enter');

    // Submitting triggers validation error
    await expect(loginPage.usernameError).toBeVisible();
  });

  // ==========================================
  // Category 9: Responsive UI
  // ==========================================

  test('TC-LOGIN-RESP-001: Desktop viewport (1280x800) layout renders centered card without horizontal scroll', async ({ page, loginPage }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(loginPage.authCard).toBeVisible();

    const box = await loginPage.authCard.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(480);

    // Verify page has no horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('TC-LOGIN-RESP-002: Tablet viewport (768x1024) layout renders properly proportioned card', async ({ page, loginPage }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(loginPage.authCard).toBeVisible();

    const box = await loginPage.authCard.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(480);
    expect(box!.width).toBeGreaterThan(280);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('TC-LOGIN-RESP-003: Mobile viewport (375x667) renders full responsive card without clipping', async ({ page, loginPage }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(loginPage.authCard).toBeVisible();

    const box = await loginPage.authCard.boundingBox();
    expect(box).not.toBeNull();
    // Card should fit neatly inside mobile width with padding
    expect(box!.width).toBeLessThanOrEqual(375);
    expect(box!.width).toBeGreaterThan(250);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('TC-LOGIN-RESP-004: Responsive element non-overlapping verification across elements', async ({ page, loginPage }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const titleBox = await loginPage.cardTitle.boundingBox();
    const userBox = await loginPage.usernameInput.boundingBox();
    const passBox = await loginPage.passwordInput.boundingBox();
    const btnBox = await loginPage.submitButton.boundingBox();

    expect(titleBox).not.toBeNull();
    expect(userBox).not.toBeNull();
    expect(passBox).not.toBeNull();
    expect(btnBox).not.toBeNull();

    // Verify strictly ascending vertical positions (no overlapping)
    expect(userBox!.y).toBeGreaterThan(titleBox!.y + titleBox!.height);
    expect(passBox!.y).toBeGreaterThan(userBox!.y + userBox!.height);
    expect(btnBox!.y).toBeGreaterThan(passBox!.y + passBox!.height);
  });

  // ==========================================
  // Category 10: Accessibility (a11y)
  // ==========================================

  test('TC-LOGIN-A11Y-001: Form inputs have corresponding <label> elements with matching htmlFor', async ({ loginPage }) => {
    const userFor = await loginPage.usernameLabel.getAttribute('for');
    const userElemId = await loginPage.usernameInput.getAttribute('id');
    expect(userFor).toBe(userElemId);

    const passFor = await loginPage.passwordLabel.getAttribute('for');
    const passElemId = await loginPage.passwordInput.getAttribute('id');
    expect(passFor).toBe(passElemId);
  });

  test('TC-LOGIN-A11Y-002: Inputs have standard autocomplete attributes for password managers', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toHaveAttribute('autocomplete', 'username');
    await expect(loginPage.passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('TC-LOGIN-A11Y-003: Password toggle button has accessible name via aria-label', async ({ loginPage }) => {
    await expect(loginPage.passwordToggleBtn).toHaveAttribute('aria-label', /password/i);
  });

  test('TC-LOGIN-A11Y-004: Interactive inputs feature visible outline or focus ring classes', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toHaveClass(/focus:ring-2/);
    await expect(loginPage.passwordInput).toHaveClass(/focus:ring-2/);
  });

  test('TC-LOGIN-A11Y-005: Form has noValidate to ensure custom accessible error messaging', async ({ loginPage }) => {
    await expect(loginPage.form).toHaveAttribute('novalidate', '');
  });
});
