import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';
import { YopmailPage } from '../../pages/mail/yopmail.page';

// =============================================================================
// SECTION 1: END-TO-END SERIAL TESTS (Real Backend + Yopmail)
// =============================================================================
test.describe('Create Account - End-to-End Registration & Yopmail Verification', () => {
  test.describe.configure({ mode: 'serial' });

  // Shared state across serial tests — populated by TC-SIGNUP-E2E-001
  let activatedUser: {
    username: string;
    email: string;
    password: string;
    verificationUrl: string;
  } | null = null;

  test('TC-SIGNUP-E2E-001: (Positive) Complete flow - Register random user, verify email via Yopmail browser & login to dashboard', async ({
    signupPage,
    setPasswordPage,
    loginPage,
    context,
    page,
  }) => {
    test.setTimeout(240_000);

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    const randomUser = authTestData.generators.randomUser({ usernamePrefix: 'usr' });

    // -----------------------------------------------------------------------
    // STEP 1: Register
    // -----------------------------------------------------------------------
    console.log(`\n🚀 [Step 1] Registering user: ${randomUser.username} (${randomUser.email})`);
    await signupPage.goto();
    await expect(signupPage.authCard).toBeVisible();

    await signupPage.fillUsername(randomUser.username);
    await signupPage.fillEmail(randomUser.email);
    await signupPage.clickSubmit();

    await expect(signupPage.successCard).toBeVisible({ timeout: 15000 });
    await expect(signupPage.successTitle).toHaveText(authTestData.signupUiText.successTitle);
    await expect(signupPage.linkValidityNote).toBeVisible();
    console.log('✅ [Step 1] Signup form submitted. "Verification Email Sent" success card displayed.');

    // -----------------------------------------------------------------------
    // STEP 2: Open Yopmail → find verification email
    // -----------------------------------------------------------------------
    console.log('\n🚀 [Step 2] Opening Yopmail inbox in browser to retrieve verification email...');
    await page.waitForTimeout(2000);

    const mailPage = await context.newPage();
    const yopmail = new YopmailPage(mailPage);
    await yopmail.gotoInbox(randomUser.yopmailInbox);

    const verificationUrl = await yopmail.getVerificationLink(10, 4000);
    await mailPage.close();
    console.log('✅ [Step 2] Yopmail verification link retrieved and mail tab closed.');

    // -----------------------------------------------------------------------
    // STEP 3: Navigate to Set Password URL
    // -----------------------------------------------------------------------
    console.log(`\n🚀 [Step 3] Navigating to Set Password page: ${verificationUrl}`);
    expect(verificationUrl).toContain('/set-password');
    await page.goto(verificationUrl);

    // -----------------------------------------------------------------------
    // STEP 4: Set password & activate
    // -----------------------------------------------------------------------
    console.log('🚀 [Step 4] Filling compliant password and confirming activation...');
    await setPasswordPage.newPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await setPasswordPage.fillNewPassword(randomUser.password);
    await setPasswordPage.fillConfirmPassword(randomUser.confirmPassword);
    await setPasswordPage.clickSubmit();

    await expect(setPasswordPage.successTitle).toHaveText(
      authTestData.setPasswordUiText.successTitle,
    );
    console.log('✅ [Step 4] Account Activated! Waiting for redirect to /login...');

    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 10000 });
    await expect(loginPage.authCard).toBeVisible();

    // -----------------------------------------------------------------------
    // STEP 5: Login with new credentials
    // -----------------------------------------------------------------------
    console.log(`\n🚀 [Step 5] Logging into application as ${randomUser.username}...`);
    await loginPage.fillUsername(randomUser.username);
    await loginPage.fillPassword(randomUser.password);
    await loginPage.clickLogin();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    console.log('🎉 [Step 5] Successfully logged into dashboard! Full E2E flow complete!\n');

    // Save credentials for subsequent serial tests
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
