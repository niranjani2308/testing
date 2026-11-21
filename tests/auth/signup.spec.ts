import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';

test.describe('Create Account (Signup) Page - UI & Field Validation Tests', () => {
  test.beforeEach(async ({ signupPage }) => {
    await signupPage.goto();
  });

  // =========================================================================
  // CATEGORY 1: UI & VISUAL LAYOUT
  // =========================================================================
  test.describe('1. UI & Visual Layout', () => {
    test('TC-SIGNUP-UI-001: Should display the main auth card and brand icon', async ({ signupPage }) => {
      await expect(signupPage.authCard).toBeVisible();
      await expect(signupPage.brandIcon).toBeVisible();
    });

    test('TC-SIGNUP-UI-002: Should display the exact page title and descriptive subtitle', async ({ signupPage }) => {
      await expect(signupPage.cardTitle).toBeVisible();
      await expect(signupPage.cardTitle).toHaveText(authTestData.signupUiText.title);

      await expect(signupPage.cardSubtitle).toBeVisible();
      await expect(signupPage.cardSubtitle).toHaveText(authTestData.signupUiText.subtitle);
    });

    test('TC-SIGNUP-UI-003: Should display Username label and placeholder', async ({ signupPage }) => {
      await expect(signupPage.usernameLabel).toBeVisible();
      await expect(signupPage.usernameLabel).toHaveText(authTestData.signupUiText.usernameLabel);

      await expect(signupPage.usernameInput).toBeVisible();
      await expect(signupPage.usernameInput).toHaveAttribute(
        'placeholder',
        authTestData.signupUiText.usernamePlaceholder,
      );
    });

    test('TC-SIGNUP-UI-004: Should display Email Address label and placeholder', async ({ signupPage }) => {
      await expect(signupPage.emailLabel).toBeVisible();
      await expect(signupPage.emailLabel).toHaveText(authTestData.signupUiText.emailLabel);

      await expect(signupPage.emailInput).toBeVisible();
      await expect(signupPage.emailInput).toHaveAttribute(
        'placeholder',
        authTestData.signupUiText.emailPlaceholder,
      );
    });

    test('TC-SIGNUP-UI-005: Should display Verify / Create Account submit button', async ({ signupPage }) => {
      await expect(signupPage.submitButton).toBeVisible();
      await expect(signupPage.submitButton).toBeEnabled();
      await expect(signupPage.submitButton).toHaveText(authTestData.signupUiText.submitBtnText);
    });

    test('TC-SIGNUP-UI-006: Should display footer prompt and Sign In link pointing to /login', async ({ signupPage }) => {
      await expect(signupPage.loginPromptText).toBeVisible();
      await expect(signupPage.loginPromptText).toContainText(authTestData.signupUiText.loginPromptPrefix);

      await expect(signupPage.loginLink).toBeVisible();
      await expect(signupPage.loginLink).toContainText(authTestData.signupUiText.loginLinkText);
      await expect(signupPage.loginLink).toHaveAttribute('href', authTestData.links.loginPath);
    });
  });

  // =========================================================================
  // CATEGORY 2: ATTRIBUTES & ACCESSIBILITY
  // =========================================================================
  test.describe('2. Input Attributes & Accessibility', () => {
    test('TC-SIGNUP-A11Y-001: Username input should be focused on page mount', async ({ signupPage }) => {
      await expect(signupPage.usernameInput).toBeFocused();
    });

    test('TC-SIGNUP-A11Y-002: Username input should have proper autocomplete and text type', async ({ signupPage }) => {
      await expect(signupPage.usernameInput).toHaveAttribute('autocomplete', 'username');
      const inputType = await signupPage.usernameInput.evaluate((el: HTMLInputElement) => el.type);
      expect(inputType).toBe('text');
    });

    test('TC-SIGNUP-A11Y-003: Email input should have email type and proper autocomplete', async ({ signupPage }) => {
      await expect(signupPage.emailInput).toHaveAttribute('type', 'email');
      await expect(signupPage.emailInput).toHaveAttribute('placeholder', authTestData.signupUiText.emailPlaceholder);
    });

    test('TC-SIGNUP-A11Y-004: Keyboard navigation (Tab) should move focus from Username to Email', async ({
      signupPage,
      page,
    }) => {
      await signupPage.usernameInput.focus();
      await page.keyboard.press('Tab');
      await expect(signupPage.emailInput).toBeFocused();
    });

    test('TC-SIGNUP-A11Y-005: Keyboard ArrowDown should navigate focus from Username to Email', async ({
      signupPage,
      page,
    }) => {
      await signupPage.usernameInput.focus();
      await page.keyboard.press('ArrowDown');
      await expect(signupPage.emailInput).toBeFocused();
    });
  });

  // =========================================================================
  // CATEGORY 3: REQUIRED FIELD VALIDATIONS
  // =========================================================================
  test.describe('3. Required Field Validations', () => {
    test('TC-SIGNUP-VAL-001: Submitting empty form should trigger validation on both fields', async ({ signupPage }) => {
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).toBeVisible();
      await expect(signupPage.usernameError).toContainText(
        authTestData.signupValidationMessages.usernameRequired,
      );

      await expect(signupPage.emailError).toBeVisible();
      await expect(signupPage.emailError).toContainText(
        authTestData.signupValidationMessages.emailRequired,
      );
    });

    test('TC-SIGNUP-VAL-002: Submitting with only username should trigger email required validation', async ({
      signupPage,
    }) => {
      const validUser = authTestData.generators.randomUsername('user');
      await signupPage.fillUsername(validUser);
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).not.toBeVisible();
      await expect(signupPage.emailError).toBeVisible();
      await expect(signupPage.emailError).toContainText(
        authTestData.signupValidationMessages.emailRequired,
      );
    });

    test('TC-SIGNUP-VAL-003: Submitting with only email should trigger username required validation', async ({
      signupPage,
    }) => {
      const { email } = authTestData.generators.yopmailAccount('test');
      await signupPage.fillEmail(email);
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).toBeVisible();
      await expect(signupPage.usernameError).toContainText(
        authTestData.signupValidationMessages.usernameRequired,
      );
      await expect(signupPage.emailError).not.toBeVisible();
    });

    test('TC-SIGNUP-VAL-004: Submitting whitespace-only inputs should trigger required validations', async ({
      signupPage,
    }) => {
      await signupPage.fillUsername('     ');
      await signupPage.fillEmail('     ');
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).toBeVisible();
      await expect(signupPage.usernameError).toContainText(
        authTestData.signupValidationMessages.usernameRequired,
      );

      await expect(signupPage.emailError).toBeVisible();
      await expect(signupPage.emailError).toContainText(
        authTestData.signupValidationMessages.emailRequired,
      );
    });
  });

  // =========================================================================
  // CATEGORY 4: USERNAME BOUNDARY & CHARACTER VALIDATIONS
  // =========================================================================
  test.describe('4. Username Boundary Validations', () => {
    test('TC-SIGNUP-BOUND-001: Username with 1 character should trigger minimum 2 characters error', async ({
      signupPage,
    }) => {
      await signupPage.fillUsername(authTestData.signupInputs.boundaryUsernames.singleChar);
      await signupPage.fillEmail(authTestData.generators.yopmailAccount().email);
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).toBeVisible();
      await expect(signupPage.usernameError).toContainText(
        authTestData.signupValidationMessages.usernameMinLength,
      );
    });

    test('TC-SIGNUP-BOUND-002: Username with exactly 2 characters (boundary min) should pass username validation', async ({
      signupPage,
    }) => {
      await signupPage.fillUsername(authTestData.signupInputs.boundaryUsernames.minValid2Chars);
      await signupPage.clickSubmit();

      // Username error should not appear (only email error)
      await expect(signupPage.usernameError).not.toBeVisible();
      await expect(signupPage.emailError).toBeVisible();
    });

    test('TC-SIGNUP-BOUND-003: Username with 50 characters (boundary max) should pass username validation', async ({
      signupPage,
    }) => {
      await signupPage.fillUsername(authTestData.signupInputs.boundaryUsernames.maxValid50Chars);
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).not.toBeVisible();
      await expect(signupPage.emailError).toBeVisible();
    });

    test('TC-SIGNUP-BOUND-004: Username exceeding 50 characters (51 chars) should trigger max length error', async ({
      signupPage,
    }) => {
      await signupPage.fillUsername(authTestData.signupInputs.boundaryUsernames.tooLong51Chars);
      await signupPage.fillEmail(authTestData.generators.yopmailAccount().email);
      await signupPage.clickSubmit();

      await expect(signupPage.usernameError).toBeVisible();
      await expect(signupPage.usernameError).toContainText(
        authTestData.signupValidationMessages.usernameMaxLength,
      );
    });

    test('TC-SIGNUP-BOUND-005: Typing into username should clear existing username error', async ({ signupPage }) => {
      await signupPage.clickSubmit();
      await expect(signupPage.usernameError).toBeVisible();

      await signupPage.fillUsername('n');
      await expect(signupPage.usernameError).not.toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 5: EMAIL FORMAT VALIDATIONS
  // =========================================================================
  test.describe('5. Email Format Validations', () => {
    for (const invalidEmail of authTestData.signupInputs.invalidEmails) {
      test(`TC-SIGNUP-EMAIL-VAL: Should reject invalid email format "${invalidEmail}"`, async ({ signupPage }) => {
        const username = authTestData.generators.randomUsername();
        await signupPage.fillUsername(username);
        await signupPage.fillEmail(invalidEmail);
        await signupPage.clickSubmit();

        await expect(signupPage.emailError).toBeVisible();
        await expect(signupPage.emailError).toContainText(
          authTestData.signupValidationMessages.emailInvalid,
        );
      });
    }

    test('TC-SIGNUP-EMAIL-002: Typing into email field should clear existing email error', async ({ signupPage }) => {
      const username = authTestData.generators.randomUsername();
      await signupPage.fillUsername(username);
      await signupPage.fillEmail('invalid-format');
      await signupPage.clickSubmit();
      await expect(signupPage.emailError).toBeVisible();

      const { email: validEmail } = authTestData.generators.yopmailAccount();
      await signupPage.fillEmail(validEmail);
      await expect(signupPage.emailError).not.toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 6: NAVIGATION & LINKS
  // =========================================================================
  test.describe('6. Navigation & Links', () => {
    test('TC-SIGNUP-NAV-001: Clicking "Sign In" link should navigate to /login page', async ({ signupPage, page }) => {
      await signupPage.clickLoginLink();
      await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
    });
  });

  // =========================================================================
  // CATEGORY 7: RESPONSIVE VIEWPORTS
  // =========================================================================
  test.describe('7. Responsive Viewport Testing', () => {
    test('TC-SIGNUP-RESP-001: Renders correctly on Desktop viewport (1280x720)', async ({ page, signupPage }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(signupPage.authCard).toBeVisible();
      await expect(signupPage.usernameInput).toBeVisible();
      await expect(signupPage.emailInput).toBeVisible();
      await expect(signupPage.submitButton).toBeVisible();
    });

    test('TC-SIGNUP-RESP-002: Renders correctly on Tablet viewport (768x1024)', async ({ page, signupPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(signupPage.authCard).toBeVisible();
      await expect(signupPage.usernameInput).toBeVisible();
      await expect(signupPage.emailInput).toBeVisible();
      await expect(signupPage.submitButton).toBeVisible();
    });

    test('TC-SIGNUP-RESP-003: Renders correctly on Mobile viewport (375x667)', async ({ page, signupPage }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(signupPage.authCard).toBeVisible();
      await expect(signupPage.usernameInput).toBeVisible();
      await expect(signupPage.emailInput).toBeVisible();
      await expect(signupPage.submitButton).toBeVisible();
    });
  });
});
