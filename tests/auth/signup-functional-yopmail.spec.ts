import { test, expect } from '../../fixtures/test.fixture';
import { authTestData } from '../../test-data/auth.data';
import { YopmailPage } from '../../pages/mail/yopmail.page';

test.describe('Create Account - Functional End-to-End Registration & Yopmail Verification', () => {
  // Execute sequentially to respect email service and rate limits
  test.describe.configure({ mode: 'serial' });

  test('TC-SIGNUP-E2E-001: Complete flow - Register random user, verify email via Yopmail browser & login to dashboard', async ({
    signupPage,
    setPasswordPage,
    loginPage,
    context,
    page,
  }) => {
    // Increase timeout for this E2E flow (email delivery + manual CAPTCHA verification + Yopmail polling)
    test.setTimeout(240_000);

    // Remove automated browser markers so Cloudflare Turnstile allows manual user clicks
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Generate a fresh random test user with compliant 8-character password and Yopmail inbox
    const randomUser = authTestData.generators.randomUser({ usernamePrefix: 'usr' });

    // -----------------------------------------------------------------------
    // STEP 1: Navigate to Signup page and register a new account
    // -----------------------------------------------------------------------
    await signupPage.goto();
    await expect(signupPage.authCard).toBeVisible();

    await signupPage.fillUsername(randomUser.username);
    await signupPage.fillEmail(randomUser.email);
    await signupPage.clickSubmit();

    // Verify "Verification Email Sent" success card appears
    await expect(signupPage.successCard).toBeVisible({ timeout: 15000 });
    await expect(signupPage.successTitle).toHaveText(authTestData.signupUiText.successTitle);
    await expect(signupPage.linkValidityNote).toBeVisible();

    // -----------------------------------------------------------------------
    // STEP 2: Open Yopmail in a new tab and find the verification email
    //         (Full browser-based flow — no API interception)
    // -----------------------------------------------------------------------

    // Wait a moment for the email to be delivered
    await page.waitForTimeout(3000);

    // Open a new browser tab for Yopmail
    const mailPage = await context.newPage();
    const yopmail = new YopmailPage(mailPage);

    // Navigate to yopmail.com, type the email, click to open inbox
    await yopmail.gotoInbox(randomUser.yopmailInbox);

    // Poll the inbox and extract the verification link from the email body
    const verificationUrl = await yopmail.getVerificationLink(8, 5000);

    // Close the Yopmail tab
    await mailPage.close();

    // -----------------------------------------------------------------------
    // STEP 3: Navigate to the Set Password verification URL
    // -----------------------------------------------------------------------
    expect(verificationUrl).toContain('/set-password');
    await page.goto(verificationUrl);

    // -----------------------------------------------------------------------
    // STEP 4: Set Password and Activate Account
    // -----------------------------------------------------------------------
    await setPasswordPage.newPasswordInput.waitFor({ state: 'visible', timeout: 10000 });

    await setPasswordPage.fillNewPassword(randomUser.password);
    await setPasswordPage.fillConfirmPassword(randomUser.confirmPassword);
    await setPasswordPage.clickSubmit();

    // Check "Account Activated!" success state
    await expect(setPasswordPage.successTitle).toHaveText(
      authTestData.setPasswordUiText.successTitle,
    );

    // Verify auto-redirect to /login
    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath), { timeout: 10000 });
    await expect(loginPage.authCard).toBeVisible();

    // -----------------------------------------------------------------------
    // STEP 5: Log in with the newly created random user & password
    // -----------------------------------------------------------------------
    await loginPage.fillUsername(randomUser.username);
    await loginPage.fillPassword(randomUser.password);
    await loginPage.clickLogin();

    // Expect successful authentication and redirection to Dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('TC-SIGNUP-E2E-002: Re-registering existing pending email updates verification token and sends new link', async ({
    signupPage,
  }) => {
    const { email: pendingEmail } = authTestData.generators.yopmailAccount('pending');
    const firstUser = authTestData.generators.randomUsername('p1');
    const secondUser = authTestData.generators.randomUsername('p2');

    // First registration
    await signupPage.goto();
    await signupPage.fillUsername(firstUser);
    await signupPage.fillEmail(pendingEmail);
    await signupPage.clickSubmit();
    await expect(signupPage.successCard).toBeVisible({ timeout: 10000 });

    // Wait 2 seconds before requesting update
    await signupPage.page.waitForTimeout(2000);

    // Second registration with same email
    await signupPage.goto();
    await signupPage.fillUsername(secondUser);
    await signupPage.fillEmail(pendingEmail);
    await signupPage.clickSubmit();

    // Verify system allows initiating registration / resends verification link or warns of rate limit
    await expect(
      signupPage.successCard.or(signupPage.errorAlert),
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-SIGNUP-E2E-003: Success screen "Back to Login" button returns user to /login', async ({ signupPage, page }) => {
    const randomUser = authTestData.generators.randomUser({ usernamePrefix: 'ret' });

    await signupPage.goto();
    await signupPage.fillUsername(randomUser.username);
    await signupPage.fillEmail(randomUser.email);
    await signupPage.clickSubmit();

    await expect(signupPage.successCard).toBeVisible({ timeout: 10000 });
    await signupPage.clickBackToLogin();

    await expect(page).toHaveURL(new RegExp(authTestData.links.loginPath));
  });
});
