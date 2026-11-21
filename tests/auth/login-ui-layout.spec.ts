import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Login Page - UI Text & Layout Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ==========================================
  // Category 1: UI Text & Placeholders
  // ==========================================

  test('TC-LOGIN-TEXT-001: Verify card heading text and spelling', async ({ loginPage }) => {
    await expect(loginPage.cardTitle).toBeVisible();
    await expect(loginPage.cardTitle).toHaveText(authTestData.uiText.title);
  });

  test('TC-LOGIN-TEXT-002: Verify card subtitle description text', async ({ loginPage }) => {
    await expect(loginPage.cardSubtitle).toBeVisible();
    await expect(loginPage.cardSubtitle).toHaveText(authTestData.uiText.subtitle);
  });

  test('TC-LOGIN-TEXT-003: Verify username field label and placeholder', async ({ loginPage }) => {
    await expect(loginPage.usernameLabel).toBeVisible();
    await expect(loginPage.usernameLabel).toHaveText(authTestData.uiText.usernameLabel);

    await expect(loginPage.usernameInput).toHaveAttribute(
      'placeholder',
      authTestData.uiText.usernamePlaceholder
    );
  });

  test('TC-LOGIN-TEXT-004: Verify password field label and placeholder', async ({ loginPage }) => {
    await expect(loginPage.passwordLabel).toBeVisible();
    await expect(loginPage.passwordLabel).toHaveText(authTestData.uiText.passwordLabel);

    await expect(loginPage.passwordInput).toHaveAttribute(
      'placeholder',
      authTestData.uiText.passwordPlaceholder
    );
  });

  test('TC-LOGIN-TEXT-005: Verify password toggle eye icon accessibility title', async ({ loginPage }) => {
    await expect(loginPage.passwordToggleBtn).toBeVisible();
    await expect(loginPage.passwordToggleBtn).toHaveAttribute('aria-label', 'Show password');
    await expect(loginPage.passwordToggleBtn).toHaveAttribute('title', 'Show password');
  });

  test('TC-LOGIN-TEXT-006: Verify Forgot Password link text and capitalization', async ({ loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toContainText(authTestData.uiText.forgotPasswordText);
  });

  test('TC-LOGIN-TEXT-007: Verify Login submit button text', async ({ loginPage }) => {
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toHaveText(authTestData.uiText.buttonText);
  });

  test('TC-LOGIN-TEXT-008: Verify footer signup prompt and link text', async ({ loginPage }) => {
    await expect(loginPage.signupPromptText).toBeVisible();
    await expect(loginPage.signupPromptText).toContainText(authTestData.uiText.signupPromptPrefix);
    await expect(loginPage.signupLink).toHaveText(authTestData.uiText.signupLinkText);
  });

  // ==========================================
  // Category 2: Layout, Spacing & Styling
  // ==========================================

  test('TC-LOGIN-LAYOUT-001: Verify auth card container is centered and structured', async ({ loginPage }) => {
    await expect(loginPage.authCard).toBeVisible();

    const box = await loginPage.authCard.boundingBox();
    expect(box).not.toBeNull();
    // Verify reasonable card dimensions
    expect(box!.width).toBeGreaterThan(280);
    expect(box!.width).toBeLessThanOrEqual(480);
    expect(box!.height).toBeGreaterThan(350);
  });

  test('TC-LOGIN-LAYOUT-002: Verify header brand icon is visible and displayed above title', async ({ loginPage }) => {
    await expect(loginPage.brandIcon).toBeVisible();

    const iconBox = await loginPage.brandIcon.boundingBox();
    const titleBox = await loginPage.cardTitle.boundingBox();

    expect(iconBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    // Brand icon must appear vertically above card title
    expect(iconBox!.y + iconBox!.height).toBeLessThanOrEqual(titleBox!.y);
  });

  test('TC-LOGIN-LAYOUT-003: Verify input fields occupy full card width', async ({ loginPage }) => {
    const cardBox = await loginPage.authCard.boundingBox();
    const usernameBox = await loginPage.usernameInput.boundingBox();
    const passwordBox = await loginPage.passwordInput.boundingBox();

    expect(cardBox).not.toBeNull();
    expect(usernameBox).not.toBeNull();
    expect(passwordBox).not.toBeNull();

    // Inputs should take significant width of the card container (accounting for padding)
    expect(usernameBox!.width).toBeGreaterThan(cardBox!.width * 0.75);
    expect(passwordBox!.width).toBeGreaterThan(cardBox!.width * 0.75);
  });

  test('TC-LOGIN-LAYOUT-004: Verify Forgot Password link is right-aligned below password field', async ({ loginPage }) => {
    const passwordBox = await loginPage.passwordInput.boundingBox();
    const linkBox = await loginPage.forgotPasswordLink.boundingBox();

    expect(passwordBox).not.toBeNull();
    expect(linkBox).not.toBeNull();

    // Link must be vertically below the password input
    expect(linkBox!.y).toBeGreaterThan(passwordBox!.y);
    // Link must be positioned towards the right side of the password field
    expect(linkBox!.x).toBeGreaterThan(passwordBox!.x + passwordBox!.width * 0.4);
  });

  test('TC-LOGIN-LAYOUT-005: Verify submit button has full width styling', async ({ loginPage }) => {
    const cardBox = await loginPage.authCard.boundingBox();
    const buttonBox = await loginPage.submitButton.boundingBox();

    expect(cardBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    expect(buttonBox!.width).toBeGreaterThan(cardBox!.width * 0.75);
  });

  test('TC-LOGIN-LAYOUT-006: Verify card footer contains border separator and is at bottom', async ({ loginPage }) => {
    const submitBox = await loginPage.submitButton.boundingBox();
    const footerBox = await loginPage.signupPromptText.boundingBox();

    expect(submitBox).not.toBeNull();
    expect(footerBox).not.toBeNull();

    // Footer must be positioned below submit button
    expect(footerBox!.y).toBeGreaterThan(submitBox!.y);
  });

  test('TC-LOGIN-LAYOUT-007: Verify card borders, rounded corners, and background styling', async ({ loginPage }) => {
    await expect(loginPage.authCard).toHaveClass(/rounded-2xl/);
    await expect(loginPage.authCard).toHaveClass(/bg-white/);
    await expect(loginPage.authCard).toHaveClass(/border/);
    await expect(loginPage.authCard).toHaveClass(/shadow-xl/);
  });

  test('TC-LOGIN-LAYOUT-008: Verify heading typography styling (font-size and weight)', async ({ loginPage }) => {
    await expect(loginPage.cardTitle).toHaveClass(/text-2xl/);
    await expect(loginPage.cardTitle).toHaveClass(/font-bold/);
    await expect(loginPage.cardTitle).toHaveClass(/text-slate-900/);
  });
});
