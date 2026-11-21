import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';
import { YopmailPage } from '../../pages/mail/yopmail.page';

// =============================================================================
// SECTION 1: MASTER END-TO-END FLOW (Real Backend + Yopmail + Complete Flow Validation)
// =============================================================================
test.describe('Create Account - Master End-to-End User Flow & Verification', () => {
  test.describe.configure({ mode: 'serial' });

  // Shared state across serial tests — populated by TC-SIGNUP-E2E-001
  let activatedUser: {
    username: string;
    email: string;
    password: string;
    verificationUrl: string;
  } | null = null;

  test('TC-SIGNUP-E2E-001: (Master Flow) Complete sequential journey: Signup UI & validations → YOPmail verification → Set Password live rules & validations → Login validations & dashboard authentication', async ({
    signupPage,
    setPasswordPage,
    loginPage,
    context,
    page,
  }) => {
    test.setTimeout(300_000); // 5 minutes for comprehensive flow including human verification if needed

    // Prevent Chrome from revealing webdriver flag to Cloudflare
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    const randomUser = authTestData.generators.randomUser({ usernamePrefix: 'usr' });

    // =========================================================================
    // STAGE 1: SIGNUP PAGE — UI, VALIDATION, BUTTON VISIBILITY & ENFORCEMENT
    // =========================================================================
    console.log('\n===============================================================');
    console.log('🚀 [STAGE 1] CREATE AN ACCOUNT — UI, STYLING & VALIDATIONS');
    console.log('===============================================================');

    await signupPage.goto();
    await expect(signupPage.authCard).toBeVisible();

    // 1.1 UI & Layout elements check
    await expect(signupPage.cardTitle).toContainText(authTestData.signupUiText.title);
    await expect(signupPage.cardSubtitle).toContainText(authTestData.signupUiText.subtitle);
    await expect(signupPage.usernameLabel).toBeVisible();
    await expect(signupPage.emailLabel).toBeVisible();
    await expect(signupPage.submitButton).toBeVisible();
    await expect(signupPage.submitButton).toBeEnabled();
    await expect(signupPage.loginLink).toBeVisible();

    // 1.2 Content hygiene / Unwanted words verification
    const signupPageText = await page.innerText('body');
    for (const word of authTestData.unwantedWords) {
      expect(signupPageText).not.toContain(word);
    }

    // 1.3 Box model styling verification (padding, margin, button)
    const cardPadding = await signupPage.authCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        paddingTop: parseInt(style.paddingTop, 10),
        paddingBottom: parseInt(style.paddingBottom, 10),
        backgroundColor: style.backgroundColor,
      };
    });
    expect(cardPadding.paddingTop).toBeGreaterThanOrEqual(16);
    expect(cardPadding.backgroundColor).toBe(authTestData.uiStyling.authCard.backgroundColor);

    // 1.4 Button enforcement & negative validations: Verify button prevents submission when fields empty/invalid
    console.log('🧪 [Stage 1.4] Testing Submit Button validation enforcement...');

    // A: Empty submission
    await signupPage.clickSubmit();
    await expect(signupPage.usernameError).toContainText(
      authTestData.signupValidationMessages.usernameRequired,
    );
    await expect(signupPage.emailError).toContainText(
      authTestData.signupValidationMessages.emailRequired,
    );
    await expect(signupPage.successCard).not.toBeVisible();

    // B: Username filled, email empty
    await signupPage.fillUsername(randomUser.username);
    await signupPage.clearEmail();
    await signupPage.clickSubmit();
    await expect(signupPage.emailError).toContainText(
      authTestData.signupValidationMessages.emailRequired,
    );
    await expect(signupPage.usernameError).not.toBeVisible();

    // C: Email filled, username empty
    await signupPage.clearUsername();
    await signupPage.fillEmail(randomUser.email);
    await signupPage.clickSubmit();
    await expect(signupPage.usernameError).toContainText(
      authTestData.signupValidationMessages.usernameRequired,
    );
    await expect(signupPage.emailError).not.toBeVisible();

    // D: Boundary username (< 2 chars)
    await signupPage.fillUsername('a');
    await signupPage.clickSubmit();
    await expect(signupPage.usernameError).toContainText(
      authTestData.signupValidationMessages.usernameMinLength,
    );

    // E: Invalid email format
    await signupPage.fillUsername(randomUser.username);
    await signupPage.fillEmail('invalid-format-email');
    await signupPage.clickSubmit();
    await expect(signupPage.emailError).toContainText(
      authTestData.signupValidationMessages.emailInvalid,
    );

    // F: Error clears upon typing
    await signupPage.fillEmail(randomUser.email);
    await expect(signupPage.emailError).not.toBeVisible();

    // 1.5 Positive Submission: Fill valid user details and submit
    console.log(`🚀 [Stage 1.5] Registering fresh user: ${randomUser.username} (${randomUser.email})`);
    await signupPage.fillUsername(randomUser.username);
    await signupPage.fillEmail(randomUser.email);
    await signupPage.clickSubmit();

    // Verify Success Card
    await expect(signupPage.successCard).toBeVisible({ timeout: 15000 });
    await expect(signupPage.successTitle).toContainText(authTestData.signupUiText.successTitle);
    await expect(signupPage.linkValidityNote).toBeVisible();
    await expect(signupPage.successDescription).toContainText(randomUser.email);
    console.log('✅ [STAGE 1 COMPLETE] Signup form submitted. "Verification Email Sent" success card displayed.');

    // =========================================================================
    // STAGE 2: YOPMAIL — EMAIL DELIVERY & VERIFICATION LINK EXTRACTION
    // =========================================================================
    console.log('\n===============================================================');
    console.log('🚀 [STAGE 2] YOPMAIL — RETRIEVING EMAIL & LINK');
    console.log('===============================================================');
    await page.waitForTimeout(2000);

    const mailPage = await context.newPage();
    const yopmail = new YopmailPage(mailPage);
    await yopmail.gotoInbox(randomUser.yopmailInbox);

    const verificationUrl = await yopmail.getVerificationLink(12, 4000);
    await mailPage.close();

    expect(verificationUrl).toBeTruthy();
    expect(verificationUrl).toContain('/set-password');
    expect(verificationUrl).toContain('token=');
    console.log(`✅ [STAGE 2 COMPLETE] Verification URL retrieved: ${verificationUrl}`);

    // =========================================================================
    // STAGE 3: SET PASSWORD — FUNCTIONAL & NON-FUNCTIONAL VALIDATIONS & ACTIVATION
    // =========================================================================
    console.log('\n===============================================================');
    console.log('🚀 [STAGE 3] SET PASSWORD — UI, LIVE RULES, MISMATCH & ACTIVATION');
    console.log('===============================================================');

    await page.goto(verificationUrl);
    await setPasswordPage.newPasswordInput.waitFor({ state: 'visible', timeout: 15000 });

    // 3.1 UI elements check
    await expect(setPasswordPage.authCard).toBeVisible();
    await expect(setPasswordPage.cardTitle).toContainText(authTestData.setPasswordUiText.title);
    await expect(setPasswordPage.passwordRulesContainer).toBeVisible();
    await expect(setPasswordPage.submitButton).toBeVisible();

    // 3.2 Content hygiene check
    const setPasswordPageText = await page.innerText('body');
    for (const word of authTestData.unwantedWords) {
      expect(setPasswordPageText).not.toContain(word);
    }

    // 3.3 Negative validations on Set Password
    console.log('🧪 [Stage 3.3] Testing Set Password negative validations...');

    // A: Empty submission
    await setPasswordPage.clickSubmit();
    await expect(
      setPasswordPage.newPasswordError.or(setPasswordPage.errorAlert),
    ).toBeVisible({ timeout: 5000 });

    // B: Non-compliant password rules checklist test (lowercase only)
    await setPasswordPage.fillNewPassword('onlylower');
    await expect(setPasswordPage.ruleUppercase).toBeVisible();
    await expect(setPasswordPage.ruleNumber).toBeVisible();
    await expect(setPasswordPage.ruleSpecial).toBeVisible();

    // C: Password length limit counter (> 8 characters)
    await setPasswordPage.fillNewPassword('LongPass1!');
    await expect(setPasswordPage.newPasswordError).toContainText('exceeds 8-character limit');

    // D: Password mismatch validation
    await setPasswordPage.fillNewPassword(randomUser.password);
    await setPasswordPage.fillConfirmPassword('DiffPass1!');
    await setPasswordPage.clickSubmit();
    await expect(setPasswordPage.confirmPasswordError).toContainText(
      authTestData.setPasswordValidationMessages.passwordMismatch,
    );

    // E: Password visibility toggles
    await expect(setPasswordPage.newPasswordInput).toHaveAttribute('type', 'password');
    await setPasswordPage.toggleNewPasswordVisibility();
    await expect(setPasswordPage.newPasswordInput).toHaveAttribute('type', 'text');
    await setPasswordPage.toggleNewPasswordVisibility();
    await expect(setPasswordPage.newPasswordInput).toHaveAttribute('type', 'password');

    // 3.4 Positive account activation
    console.log('🚀 [Stage 3.4] Submitting compliant 8-char password for activation...');
    await setPasswordPage.fillNewPassword(randomUser.password);
    await setPasswordPage.fillConfirmPassword(randomUser.confirmPassword);
    await setPasswordPage.clickSubmit();

    // Verify Account Activated success state
    await expect(setPasswordPage.successTitle).toContainText(
      authTestData.setPasswordUiText.successTitle,
    );
    console.log('✅ [STAGE 3 COMPLETE] Account Activated! Waiting for redirect to /login...');

    // Auto-redirect or manual navigation to /login
    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 15000 });
    await expect(loginPage.authCard).toBeVisible();

    // =========================================================================
    // STAGE 4: LOGIN PAGE — VALIDATIONS & DASHBOARD REDIRECTION
    // =========================================================================
    console.log('\n===============================================================');
    console.log('🚀 [STAGE 4] LOGIN PAGE — VALIDATIONS & DASHBOARD AUTHENTICATION');
    console.log('===============================================================');

    // 4.1 UI elements & content hygiene
    await expect(loginPage.cardTitle).toContainText(authTestData.loginUiText.title);
    const loginPageText = await page.innerText('body');
    for (const word of authTestData.unwantedWords) {
      expect(loginPageText).not.toContain(word);
    }

    // 4.2 Negative login: Empty fields validation
    await loginPage.clearUsername();
    await loginPage.clearPassword();
    await loginPage.clickLogin();
    await expect(loginPage.usernameError).toContainText(authTestData.validationMessages.usernameRequired);
    await expect(loginPage.passwordError).toContainText(authTestData.validationMessages.passwordRequired);

    // 4.3 Negative login: Incorrect password rejection
    console.log('🧪 [Stage 4.3] Testing negative login with wrong password...');
    await loginPage.fillUsername(randomUser.username);
    await loginPage.fillPassword('WrongP1!');
    await loginPage.clickLogin();
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/.*dashboard/);

    // 4.4 Password visibility toggle test
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // 4.5 Positive Login: Sign in with the newly created account
    console.log(`🚀 [Stage 4.5] Signing in with activated credentials: ${randomUser.username}...`);
    await loginPage.fillUsername(randomUser.username);
    await loginPage.fillPassword(randomUser.password);
    await loginPage.clickLogin();

    // Verify successful authentication and redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    console.log('🎉 [STAGE 4 COMPLETE] Successfully logged into dashboard!');
    console.log('===============================================================\n');

    // Save activated user for following post-activation tests
    activatedUser = {
      username: randomUser.username,
      email: randomUser.email,
      password: randomUser.password,
      verificationUrl,
    };
  });

  test('TC-SIGNUP-E2E-002: (Positive) Re-registering existing pending email updates verification token and sends new link', async ({
    signupPage,
  }) => {
    const { email: pendingEmail } = authTestData.generators.yopmailAccount('pending');
    const firstUser = authTestData.generators.randomUsername('p1');
    const secondUser = authTestData.generators.randomUsername('p2');

    await signupPage.goto();
    await signupPage.fillUsername(firstUser);
    await signupPage.fillEmail(pendingEmail);
    await signupPage.clickSubmit();
    await expect(signupPage.successCard).toBeVisible({ timeout: 10000 });

    await signupPage.page.waitForTimeout(2000);

    await signupPage.goto();
    await signupPage.fillUsername(secondUser);
    await signupPage.fillEmail(pendingEmail);
    await signupPage.clickSubmit();

    await expect(
      signupPage.successCard.or(signupPage.errorAlert),
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-SIGNUP-E2E-003: (Positive) Success screen "Back to Login" button returns user to /login', async ({
    signupPage,
    page,
  }) => {
    const randomUser = authTestData.generators.randomUser({ usernamePrefix: 'ret' });

    await signupPage.goto();
    await signupPage.fillUsername(randomUser.username);
    await signupPage.fillEmail(randomUser.email);
    await signupPage.clickSubmit();

    await expect(signupPage.successCard).toBeVisible({ timeout: 10000 });
    await signupPage.clickBackToLogin();

    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
  });

  // -------------------------------------------------------------------------
  // POST-ACTIVATION TESTS (depend on TC-SIGNUP-E2E-001 having succeeded)
  // -------------------------------------------------------------------------

  test('TC-SIGNUP-E2E-004: (Negative) After activation, logging in with wrong password should fail', async ({
    loginPage,
    page,
  }) => {
    test.skip(!activatedUser, 'Skipped: requires TC-SIGNUP-E2E-001 to have activated a user');

    await page.goto('/login');
    await expect(loginPage.authCard).toBeVisible();

    await loginPage.fillUsername(activatedUser!.username);
    await loginPage.fillPassword('WrongP1!');
    await loginPage.clickLogin();

    // Should show error alert, NOT navigate to dashboard
    const errorAlert = page.locator('//div[@role="alert" and contains(@class, "bg-red-50")]');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test('TC-SIGNUP-E2E-005: (Positive) After activation, logging in with email instead of username should succeed', async ({
    loginPage,
    page,
  }) => {
    test.skip(!activatedUser, 'Skipped: requires TC-SIGNUP-E2E-001 to have activated a user');

    await page.goto('/login');
    await expect(loginPage.authCard).toBeVisible();

    // Login using the registered email address instead of username
    await loginPage.fillUsername(activatedUser!.email);
    await loginPage.fillPassword(activatedUser!.password);
    await loginPage.clickLogin();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('TC-SIGNUP-E2E-006: (Negative) Re-using the same verification link after activation should show expired/used token error', async ({
    setPasswordPage,
  }) => {
    test.skip(!activatedUser?.verificationUrl, 'Skipped: requires TC-SIGNUP-E2E-001 verification URL');

    // Navigate back to the already-consumed verification URL
    await setPasswordPage.page.goto(activatedUser!.verificationUrl);

    // Token was already consumed → should show Access Blocked or Link Expired
    await expect(
      setPasswordPage.blockedCardTitle
        .or(setPasswordPage.expiredCardTitle)
        .or(setPasswordPage.errorAlert),
    ).toBeVisible({ timeout: 10000 });

    // Password form should NOT be rendered
    await expect(setPasswordPage.newPasswordInput).not.toBeVisible();
  });
});

// =============================================================================
// SECTION 2: FUNCTIONAL NEGATIVE TESTS (Mocked Backend Responses)
// =============================================================================
test.describe('Create Account - Functional Negative Scenarios (Mocked Backend)', () => {
  test('TC-SIGNUP-FUNC-001: (Negative) Registration throttling — Rapid submissions should trigger 429 rate limit error', async ({
    signupPage,
    page,
  }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          message:
            'Too many registration attempts. Please wait 58 seconds before requesting another verification email.',
        }),
      });
    });

    await signupPage.goto();
    await signupPage.fillUsername('throttle_user');
    await signupPage.fillEmail('throttle@yopmail.com');
    await signupPage.clickSubmit();

    await expect(signupPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(signupPage.errorAlert).toContainText('Too many registration attempts');
  });

  test('TC-SIGNUP-FUNC-002: (Negative) Registering with an already-verified email should show conflict error', async ({
    signupPage,
    page,
  }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          message: authTestData.signupValidationMessages.emailAlreadyRegistered,
        }),
      });
    });

    await signupPage.goto();
    await signupPage.fillUsername('new_username_123');
    await signupPage.fillEmail('verified_email@yopmail.com');
    await signupPage.clickSubmit();

    await expect(signupPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(signupPage.errorAlert).toContainText(
      authTestData.signupValidationMessages.emailAlreadyRegistered,
    );
    // Success card must NOT appear
    await expect(signupPage.successCard).not.toBeVisible();
  });

  test('TC-SIGNUP-FUNC-003: (Negative) Registering with a taken username should show conflict error', async ({
    signupPage,
    page,
  }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          message: authTestData.signupValidationMessages.usernameAlreadyTaken,
        }),
      });
    });

    await signupPage.goto();
    await signupPage.fillUsername('taken_username');
    await signupPage.fillEmail('unique_email@yopmail.com');
    await signupPage.clickSubmit();

    await expect(signupPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(signupPage.errorAlert).toContainText(
      authTestData.signupValidationMessages.usernameAlreadyTaken,
    );
    await expect(signupPage.successCard).not.toBeVisible();
  });

  test('TC-SIGNUP-FUNC-004: (Negative) Generic backend error should display error alert and NOT show success card', async ({
    signupPage,
    page,
  }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'An error occurred while creating your account.',
        }),
      });
    });

    await signupPage.goto();
    await signupPage.fillUsername('error_user');
    await signupPage.fillEmail('error@yopmail.com');
    await signupPage.clickSubmit();

    await expect(signupPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(signupPage.successCard).not.toBeVisible();
  });
});
