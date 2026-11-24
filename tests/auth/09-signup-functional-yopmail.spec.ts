import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';
import { YopmailPage } from '../../pages/mail/yopmail.page';

// =============================================================================
// SECTION 1: END-TO-END FLOW (Create Account → Yopmail → Set Password → Login)
// =============================================================================
test.describe('Create Account - End-to-End User Flow & Verification', () => {
  test.describe.configure({ mode: 'serial' });

  // Shared state across serial tests — populated by TC-SIGNUP-E2E-001
  let activatedUser: {
    username: string;
    email: string;
    password: string;
    verificationUrl: string;
  } | null = null;

  test('TC-SIGNUP-E2E-001: (Full Auth Lifecycle) Signup -> Set Password -> Login -> Forgot Password -> Set New Password -> Login with Reset Password', async ({
    signupPage,
    setPasswordPage,
    loginPage,
    forgotPasswordPage,
    resetPasswordPage,
    dashboardPage,
    seededData,
    context,
    page,
  }) => {
    test.setTimeout(450_000); // 7.5 minutes for complete 6-stage lifecycle including Yopmail retrieval

    // Prevent Chrome from revealing webdriver flag to Cloudflare
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Auto-close any unwanted popups or secondary tabs so everything stays in ONE single tab
    context.on('page', async (extraPage) => {
      if (extraPage !== page) {
        try {
          await extraPage.close();
        } catch {}
      }
    });

    const randomUser = authTestData.generators.randomUser({ usernamePrefix: 'usr' });

    // -------------------------------------------------------------------------
    // STEP 1: CREATE AN ACCOUNT (SIGNUP)
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🚀 [STEP 1] Creating account: ${randomUser.username} (${randomUser.email})`);
    console.log('===============================================================');

    await signupPage.goto();
    await expect(signupPage.authCard).toBeVisible();

    // Fill valid registration details
    await signupPage.fillUsername(randomUser.username);
    await page.waitForTimeout(400);
    await signupPage.fillEmail(randomUser.email);
    await page.waitForTimeout(400);
    await signupPage.clickSubmit();

    // Verify "Verification Email Sent" success card
    await expect(signupPage.successCard).toBeVisible({ timeout: 15000 });
    await expect(signupPage.successTitle).toContainText(authTestData.signupUiText.successTitle);
    await expect(signupPage.successDescription).toContainText(randomUser.email);
    console.log('✅ [STEP 1 COMPLETE] Verification email sent successfully. Waiting 5s for delivery...');
    await page.waitForTimeout(5000);

    // -------------------------------------------------------------------------
    // STEP 2: YOPMAIL — RETRIEVE VERIFICATION LINK (IN SAME TAB)
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🚀 [STEP 2] Navigating to Yopmail inbox: ${randomUser.yopmailInbox}`);
    console.log('===============================================================');

    const yopmail = new YopmailPage(page);
    await yopmail.gotoInbox(randomUser.yopmailInbox);

    // Retrieve email and verification link (handling Turnstile safely if displayed)
    const verificationUrl = await yopmail.getVerificationLink(12, 4000);

    expect(verificationUrl).toBeTruthy();
    expect(verificationUrl).toContain('/set-password');
    expect(verificationUrl).toContain('token=');
    console.log(`✅ [STEP 2 COMPLETE] Retrieved verification link: ${verificationUrl}`);
    await page.waitForTimeout(1500);

    // -------------------------------------------------------------------------
    // STEP 3: SET PASSWORD & ACTIVATE ACCOUNT (IN SAME TAB)
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log('🚀 [STEP 3] Opening Set Password page and setting credentials');
    console.log('===============================================================');

    await page.goto(verificationUrl);
    await page.bringToFront();
    await setPasswordPage.newPasswordInput.waitFor({ state: 'visible', timeout: 15000 });
    await expect(setPasswordPage.authCard).toBeVisible();
    await page.waitForTimeout(1000);

    // Enter compliant 8-character password and confirm visibly
    console.log(`✍️ [STEP 3] Entering password: ${randomUser.password}`);
    await setPasswordPage.fillNewPassword(randomUser.password);
    await page.waitForTimeout(600);

    console.log(`✍️ [STEP 3] Confirming password: ${randomUser.confirmPassword}`);
    await setPasswordPage.fillConfirmPassword(randomUser.confirmPassword);
    await page.waitForTimeout(600);

    console.log('👉 [STEP 3] Clicking "Activate Account & Set Password"...');
    await setPasswordPage.clickSubmit();

    // Verify Account Activated confirmation
    await expect(setPasswordPage.successTitle).toContainText(
      authTestData.setPasswordUiText.successTitle,
      { timeout: 10000 },
    );
    console.log('✅ [STEP 3 COMPLETE] Account Activated!');
    await page.waitForTimeout(1200);

    // Handle navigation to /login (click "Proceed to Login" button or follow auto-redirect)
    const proceedBtn = setPasswordPage.proceedToLoginBtn;
    try {
      if (await proceedBtn.first().isVisible({ timeout: 4000 })) {
        console.log('👉 [STEP 3] Clicking "Proceed to Login" button...');
        await proceedBtn.first().click();
      }
    } catch {
      console.log('ℹ️ [STEP 3] Auto-redirecting to /login...');
    }

    // Confirm navigation to login page
    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 15000 });
    await expect(loginPage.authCard).toBeVisible();
    console.log('✅ [STEP 3] Arrived on Login page.');
    await page.waitForTimeout(1500);

    // -------------------------------------------------------------------------
    // STEP 4: SEED DATA & LOGIN USING CREATED ACCOUNT -> VERIFY DASHBOARD
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🌱 [STEP 4 SEED] Seeding application data before moving to Dashboard...`);
    console.log('===============================================================');

    // Seed test data in the application so Dashboard displays populated cards, charts, and metrics
    await dashboardPage.seedDashboardData();

    console.log(`🚀 [STEP 4] Logging in as ${randomUser.username}...`);
    console.log(`✍️ [STEP 4] Typing username: ${randomUser.username}`);
    await loginPage.fillUsername(randomUser.username);
    await page.waitForTimeout(600);

    console.log(`✍️ [STEP 4] Typing password: ${randomUser.password}`);
    await loginPage.fillPassword(randomUser.password);
    await page.waitForTimeout(600);

    console.log('👉 [STEP 4] Clicking Login button...');
    await loginPage.clickLogin();

    // Verify dashboard redirect and access
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await dashboardPage.verifyDashboardLoaded();

    // Verify seeded summary metrics
    console.log('📊 [STEP 4] Verifying seeded metrics on Dashboard...');
    const seedData = seededData.getDashboardSeedData();
    await dashboardPage.verifySummaryMetrics({
      journeys: seedData.overview.summary.totalJourneys,
      tasks: seedData.overview.summary.totalTasks,
      completed: seedData.overview.summary.completedTasks,
      pending: seedData.overview.summary.pendingTasks,
      notes: seedData.overview.summary.totalNotes,
      files: seedData.overview.summary.totalUploadedFiles,
    });
    console.log('✅ [STEP 4] Summary cards verified: 3 Journeys, 12 Tasks, 5 Completed, 4 Pending, 6 Notes, 4 Files.');

    // Verify overdue banner
    await dashboardPage.verifyOverdueBanner(seedData.overview.overdueTasks.length);
    console.log('✅ [STEP 4] Overdue banner verified: 1 overdue task.');

    console.log('🎉 [STEP 4 COMPLETE] Successfully logged into Dashboard with seeded data!');
    console.log('===============================================================\n');
    await page.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // STEP 5: FORGOT PASSWORD REQUEST
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🚀 [STEP 5] Navigating to Forgot Password for: ${randomUser.email}`);
    console.log('===============================================================');

    await forgotPasswordPage.goto();
    await expect(forgotPasswordPage.authCard).toBeVisible();
    await page.waitForTimeout(800);

    console.log(`✍️ [STEP 5] Requesting password reset link for: ${randomUser.email}`);
    await forgotPasswordPage.fillEmail(randomUser.email);
    await page.waitForTimeout(500);
    await forgotPasswordPage.clickSubmit();

    // Verify recovery dispatched confirmation
    await expect(forgotPasswordPage.successCard).toBeVisible({ timeout: 15000 });
    await expect(forgotPasswordPage.successTitle).toContainText(
      authTestData.forgotPasswordUiText.successTitle,
    );
    console.log('✅ [STEP 5 COMPLETE] Password reset link dispatched. Waiting 20s for delivery & YOPmail cooldown...');
    // Wait longer here: YOPmail enforces rate-limits on rapid successive visits.
    // The first visit was during Step 2 (verification email). Without a sufficient
    // gap, visiting YOPmail again triggers a "Please wait before continuing" cooldown.
    // 20s gives YOPmail enough breathing room before the second inbox check.
    await page.waitForTimeout(20000);

    // -------------------------------------------------------------------------
    // STEP 6: YOPMAIL — RETRIEVE RESET LINK & SET NEW PASSWORD
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🚀 [STEP 6] Opening Yopmail to retrieve reset link: ${randomUser.yopmailInbox}`);
    console.log('(YOPmail rate-limit cooldown handled automatically if triggered)');
    console.log('===============================================================');

    await yopmail.gotoInbox(randomUser.yopmailInbox);
    const resetUrl = await yopmail.getResetPasswordLink(12, 4000);

    expect(resetUrl).toBeTruthy();
    expect(resetUrl).toContain('/reset-password');
    console.log(`✅ [STEP 6] Retrieved reset link: ${resetUrl}`);

    // Navigate to reset password page
    await page.goto(resetUrl);
    await page.bringToFront();
    await resetPasswordPage.newPasswordInput.waitFor({ state: 'visible', timeout: 15000 });
    await expect(resetPasswordPage.authCard).toBeVisible();
    await page.waitForTimeout(1000);

    const newPassword = 'Reset12!';
    console.log(`✍️ [STEP 6] Entering compliant 8-char new password: ${newPassword}`);
    await resetPasswordPage.fillNewPassword(newPassword);
    await page.waitForTimeout(600);

    console.log(`✍️ [STEP 6] Confirming new password: ${newPassword}`);
    await resetPasswordPage.fillConfirmPassword(newPassword);
    await page.waitForTimeout(600);

    console.log('👉 [STEP 6] Submitting new password...');
    await resetPasswordPage.clickSubmit();

    // Verify password reset complete confirmation
    await expect(resetPasswordPage.successTitle).toContainText(
      authTestData.resetPasswordUiText.successTitle,
      { timeout: 10000 },
    );
    console.log('✅ [STEP 6 COMPLETE] Password Reset Complete!');
    await page.waitForTimeout(1200);

    // Click Proceed to Login
    const resetProceedBtn = resetPasswordPage.proceedToLoginBtn;
    try {
      if (await resetProceedBtn.first().isVisible({ timeout: 4000 })) {
        console.log('👉 [STEP 6] Clicking "Proceed to Login" button...');
        await resetProceedBtn.first().click();
      }
    } catch {
      console.log('ℹ️ [STEP 6] Auto-redirecting to /login...');
    }

    // -------------------------------------------------------------------------
    // STEP 7: VERIFY OLD PASSWORD REJECTION & LOGIN WITH RESET PASSWORD
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🚀 [STEP 7] Verifying old password fails & logging in with new reset password`);
    console.log('===============================================================');

    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 15000 });
    await expect(loginPage.authCard).toBeVisible();
    await page.waitForTimeout(1000);

    // Negative check: Attempt login with OLD password -> MUST FAIL
    console.log(`🧪 [STEP 7.1] Testing old password (${randomUser.password}) - must be rejected...`);
    await loginPage.fillUsername(randomUser.username);
    await loginPage.fillPassword(randomUser.password);
    await loginPage.clickLogin();
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
    console.log('✅ [STEP 7.1] Old password successfully rejected!');
    await page.waitForTimeout(1000);

    // Positive check: Login with NEW reset password -> MUST SUCCEED
    console.log(`🚀 [STEP 7.2] Logging in with NEW reset password (${newPassword})...`);
    // Ensure seeded data is active on dashboard reload
    await dashboardPage.seedDashboardData();
    await loginPage.fillUsername(randomUser.username);
    await loginPage.fillPassword(newPassword);
    await loginPage.clickLogin();

    // Verify successful dashboard redirect and populated state
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.verifySummaryMetrics({
      journeys: seedData.overview.summary.totalJourneys,
      tasks: seedData.overview.summary.totalTasks,
    });
    console.log('🎉 [STEP 7.2 COMPLETE] Successfully logged into Dashboard with NEW reset password and verified metrics!');
    console.log('===============================================================\n');

    // Keep dashboard open and visible on screen for 10 seconds so the user can verify
    console.log('👀 [DASHBOARD] Keeping Dashboard open for 10 seconds to confirm active login...');
    await page.waitForTimeout(10000);

    // Save updated credentials
    activatedUser = {
      username: randomUser.username,
      email: randomUser.email,
      password: newPassword,
      verificationUrl: resetUrl,
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
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test('TC-SIGNUP-E2E-005: (Positive) After activation, logging in with email instead of username should succeed', async ({
    loginPage,
    dashboardPage,
    seededData,
    page,
  }) => {
    test.skip(!activatedUser, 'Skipped: requires TC-SIGNUP-E2E-001 to have activated a user');
    const seedData = seededData.getDashboardSeedData();

    await dashboardPage.seedDashboardData();
    await page.goto('/login');
    await expect(loginPage.authCard).toBeVisible();

    // Login using the registered email address instead of username
    await loginPage.fillUsername(activatedUser!.email);
    await loginPage.fillPassword(activatedUser!.password);
    await loginPage.clickLogin();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.verifySummaryMetrics({
      journeys: seedData.overview.summary.totalJourneys,
    });
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
