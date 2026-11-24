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

// =============================================================================
// RESET PASSWORD TESTS (Positive & Negative Token Security & Form Validations)
// =============================================================================
test.describe('Reset Password Page - Security, Rules & Reset Flow', () => {
  test('TC-RESETPW-SEC-001: (Negative) Direct access without token should show Invalid Link state', async ({
    resetPasswordPage,
  }) => {
    await resetPasswordPage.goto();

    await expect(resetPasswordPage.invalidCardTitle).toBeVisible();
    await expect(resetPasswordPage.invalidCardTitle).toHaveText(authTestData.resetPasswordUiText.invalidTitle);

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

    await resetPasswordPage.clickRequestFreshLink();
    await expect(page).toHaveURL(new RegExp(authTestData.links.forgotPasswordPath));

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

  test('TC-RESETPW-SEC-004: (Negative) Expired token should render Link Expired card with alert and NO form', async ({
    resetPasswordPage,
    page,
  }) => {
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

    await expect(resetPasswordPage.expiredCardTitle).toBeVisible({ timeout: 10000 });
    await expect(resetPasswordPage.expiredCardTitle).toHaveText(authTestData.resetPasswordUiText.expiredTitle);
    await expect(resetPasswordPage.expiredAlertTitle).toBeVisible();

    await expect(resetPasswordPage.newPasswordInput).not.toBeVisible();
    await expect(resetPasswordPage.confirmPasswordInput).not.toBeVisible();
    await expect(resetPasswordPage.submitButton).not.toBeVisible();
  });

  test('TC-RESETPW-RULES-001: (Positive) Valid 8-char password should satisfy all 7 rules', async ({
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

    await resetPasswordPage.goto('mock_valid_reset_token');

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

  test('TC-RESETPW-MISMATCH-001: (Negative) Mismatched confirm password shows error on submit', async ({
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

    await resetPasswordPage.goto('mock_valid_reset_token');

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

    await expect(resetPasswordPage.successCard).toBeVisible({ timeout: 5000 });
    await expect(resetPasswordPage.successTitle).toHaveText(
      authTestData.resetPasswordUiText.successTitle,
    );

    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 10000 });
  });

  // =========================================================================
  // CATEGORY 7: UI PADDING, MARGIN, STYLING & RESPONSIVE VIEWPORTS
  // =========================================================================
  test.describe('7. UI Padding, Margin, Styling & Responsive Verification', () => {
    test('TC-FORGOT-STYLE-001: Auth card has valid padding, rounded corners, and max-width', async ({
      forgotPasswordPage,
    }) => {
      await forgotPasswordPage.goto();

      const cardStyles = await forgotPasswordPage.authCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          maxWidth: computed.maxWidth,
          paddingTop: parseFloat(computed.paddingTop),
          borderRadius: parseFloat(computed.borderRadius),
        };
      });

      expect(cardStyles.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(cardStyles.maxWidth).toBe('448px');
      expect(cardStyles.paddingTop).toBeGreaterThanOrEqual(16);
      expect(cardStyles.borderRadius).toBeGreaterThanOrEqual(8);
    });

    test('TC-FORGOT-RESP-001: Forgot Password renders cleanly across Desktop, Tablet, and Mobile viewports', async ({
      forgotPasswordPage,
      page,
    }) => {
      // Desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await forgotPasswordPage.goto();
      await expect(forgotPasswordPage.authCard).toBeVisible();

      // Tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(forgotPasswordPage.authCard).toBeVisible();

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(forgotPasswordPage.authCard).toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 8: UNWANTED WORDS & CONTENT HYGIENE VERIFICATION
  // =========================================================================
  test.describe('8. Unwanted Words & Content Hygiene Verification', () => {
    test('TC-FORGOT-WORDS-001: Forgot Password view must not contain unwanted or debug words', async ({
      forgotPasswordPage,
    }) => {
      await forgotPasswordPage.goto();

      const bodyText = await forgotPasswordPage.body.innerText();
      for (const word of authTestData.unwantedWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        expect(regex.test(bodyText), `Found unwanted word "${word}" in Forgot Password view!`).toBe(false);
      }
    });

    test('TC-RESETPW-WORDS-001: Reset Password view must not contain unwanted or debug words', async ({
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

      await resetPasswordPage.goto('mock_valid_token');

      const bodyText = await resetPasswordPage.body.innerText();
      for (const word of authTestData.unwantedWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        expect(regex.test(bodyText), `Found unwanted word "${word}" in Reset Password view!`).toBe(false);
      }
    });
  });
});
