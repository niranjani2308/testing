import type { Page, FrameLocator, Locator } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class YopmailPage {
  readonly selectors = new IndexSelectors();
  readonly loginInput: Locator;
  readonly refreshBtn: Locator;
  readonly inboxFrame: FrameLocator;
  readonly mailFrame: FrameLocator;

  constructor(readonly page: Page) {
    this.loginInput = page.locator(this.selectors.yopmailSection.loginInput);
    this.refreshBtn = page.locator(this.selectors.yopmailSection.refreshBtn);
    this.inboxFrame = page.frameLocator(this.selectors.yopmailSection.inboxIframe);
    this.mailFrame = page.frameLocator(this.selectors.yopmailSection.mailIframe);
  }

  /**
   * Navigate to Yopmail homepage, type the email/username into the login field,
   * and press the arrow/check button to open the inbox.
   */
  async gotoInbox(userOrEmail: string): Promise<void> {
    const username = userOrEmail.includes('@')
      ? userOrEmail.split('@')[0]
      : userOrEmail;

    // 1. Navigate to Yopmail homepage
    await this.page.goto('https://yopmail.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // 2. Dismiss cookie / GDPR consent banners if shown
    await this.dismissConsent();

    // 3. Type the email/username into the login input field
    await this.loginInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.loginInput.fill(username);

    // 4. Click the check-inbox button (the arrow ▶ or "Check Inbox" button next to the input)
    const checkBtn = this.page.locator(
      'button.sbut, #refreshbut, button:has(i.material-icons-outlined)',
    );
    if (await checkBtn.first().isVisible({ timeout: 3000 })) {
      await checkBtn.first().click();
    } else {
      await this.loginInput.press('Enter');
    }

    // 5. Wait for navigation/redirection to inbox view (/wm)
    await this.page.waitForLoadState('domcontentloaded');
    await this.dismissConsent();

    // 6. Check if Cloudflare / Turnstile human verification modal appeared
    await this.waitForHumanVerification();

    // Give iframes time to populate
    await this.page.waitForTimeout(2000);
  }

  /**
   * Checks whether the Cloudflare Turnstile "Verify you are human" modal is currently VISIBLE on screen.
   * Note: Only checks visibility of the modal dialog so that after the user clicks and the modal closes,
   * this immediately returns false (even if Cloudflare's background iframe remains in the DOM).
   */
  async isHumanVerificationPresent(): Promise<boolean> {
    try {
      const modalText = this.page.locator('text="Please confirm you\'re human to continue"');
      if (await modalText.isVisible({ timeout: 400 }).catch(() => false)) {
        return true;
      }

      const verifyText = this.page.locator('text="Verify you are human"');
      if (await verifyText.isVisible({ timeout: 400 }).catch(() => false)) {
        return true;
      }

      const modalContainer = this.page.locator('div:has-text("Please confirm you\'re human to continue")');
      if (await modalContainer.first().isVisible({ timeout: 400 }).catch(() => false)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Detects if a "Verify you are human" / Cloudflare challenge is present.
   * If detected, pauses and gives the user time to manually click the checkbox in headed mode.
   * The moment the user clicks and the modal closes, it returns IMMEDIATELY and resumes Playwright!
   */
  async waitForHumanVerification(maxWaitMs: number = 90000): Promise<void> {
    // Check if challenge modal is visible
    let isPresent = await this.isHumanVerificationPresent();
    if (!isPresent) {
      await this.page.waitForTimeout(1000);
      isPresent = await this.isHumanVerificationPresent();
    }

    if (!isPresent) {
      return;
    }

    console.log('\n========================================================================');
    console.log('⚠️  [Yopmail] Human verification challenge detected on screen!');
    console.log('👉 Please tick the "Verify you are human" checkbox in the browser window.');
    console.log('⏳ Playwright is waiting for your click (will auto-continue right after)...');
    console.log('========================================================================\n');

    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      await this.page.waitForTimeout(600);

      const stillVisible = await this.isHumanVerificationPresent();
      if (!stillVisible) {
        console.log('✅ [Yopmail] Human verification completed! Playwright is now continuing all remaining actions automatically...\n');
        await this.page.waitForTimeout(1500);
        return;
      }
    }

    console.log('⚠️  [Yopmail] Verification wait period ended.');
  }

  /**
   * Attempt to dismiss GDPR or cookie banners if shown by Yopmail.
   */
  async dismissConsent(): Promise<void> {
    try {
      const consentBtn = this.page.locator(
        '#accept, #cconsent-ok, button:has-text("Consent"), .fc-cta-consent, button:has-text("AGREE"), button:has-text("Accept all")',
      );
      if (await consentBtn.first().isVisible({ timeout: 1500 })) {
        await consentBtn.first().click();
        await this.page.waitForTimeout(500);
      }
    } catch {
      // Consent banner not shown or already dismissed
    }
  }

  /**
   * Refresh the inbox to check for newly arrived messages.
   * Will NOT refresh if a human verification challenge is currently showing!
   */
  async refresh(): Promise<void> {
    if (await this.isHumanVerificationPresent()) {
      await this.waitForHumanVerification();
      return;
    }

    try {
      const refreshBtn = this.page.locator('#refresh, #crefresh, #refreshbut, button.wrefresh, button#refresh');
      if (await refreshBtn.first().isVisible({ timeout: 2000 })) {
        await refreshBtn.first().click();
        await this.page.waitForTimeout(1500);
      } else {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(1500);
      }
    } catch {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(1500);
    }
    await this.dismissConsent();
  }

  /**
   * Poll the Yopmail inbox via browser iframes and retrieve the verification URL
   * from the latest email that contains a "/set-password" link.
   *
   * Flow:
   *  1. Look for mail rows inside #ifinbox iframe
   *  2. Click the first (most recent) mail row
   *  3. Inside #ifmail iframe, find <a> linking to /set-password
   *  4. Return the href
   */
  async getVerificationLink(
    maxRetries: number = 10,
    retryDelayMs: number = 4000,
  ): Promise<string> {
    console.log('📬 [Yopmail] Searching for verification email in inbox...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dismissConsent();

        // If human verification popped up, wait for user click
        if (await this.isHumanVerificationPresent()) {
          await this.waitForHumanVerification();
        }

        // Look for email rows inside the inbox iframe (#ifinbox)
        const mailRows = this.inboxFrame.locator('.m, .lm, button.lm, a.lm, div.m');
        const count = await mailRows.count();

        if (count > 0) {
          console.log(`✉️ [Yopmail] Email arrived in inbox (${count} item(s))! Opening latest email...`);
          // Click the top (most recent) message
          await mailRows.first().click();

          // Allow mail body iframe to render
          await this.page.waitForTimeout(2000);

          // Look for the verification link inside the mail body iframe (#ifmail)
          const verificationLink = this.mailFrame.locator(
            'a[href*="/set-password"], a[href*="/reset-password"], a:has-text("Verify Email & Set Password"), a:has-text("Reset Password"), a:has-text("Verify Email"), a:has-text("Set Password")',
          );

          await verificationLink.first().waitFor({ state: 'visible', timeout: 8000 });
          const href = await verificationLink.first().getAttribute('href');

          if (href && (href.includes('/set-password') || href.includes('/reset-password'))) {
            console.log(`🔗 [Yopmail] Verification/Reset link found: ${href}`);
            return href;
          }
        } else {
          console.log(`⏳ [Yopmail] Inbox not updated yet (Attempt ${attempt}/${maxRetries}). Refreshing...`);
        }
      } catch {
        // Retry if message hasn't appeared yet
      }

      if (attempt < maxRetries) {
        await this.refresh();
        await this.page.waitForTimeout(retryDelayMs);
      }
    }

    throw new Error(
      `Could not find Set Password verification email on Yopmail after ${maxRetries} attempts.`,
    );
  }

  /**
   * Poll Yopmail inbox and retrieve the reset password URL (/reset-password?token=...)
   */
  async getResetPasswordLink(
    maxRetries: number = 10,
    retryDelayMs: number = 4000,
  ): Promise<string> {
    console.log('📬 [Yopmail] Searching for Password Reset email in inbox...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dismissConsent();

        if (await this.isHumanVerificationPresent()) {
          await this.waitForHumanVerification();
        }

        const mailRows = this.inboxFrame.locator('.m, .lm, button.lm, a.lm, div.m');
        const count = await mailRows.count();

        if (count > 0) {
          console.log(`✉️ [Yopmail] Password reset email arrived (${count} item(s))! Opening latest email...`);
          await mailRows.first().click();
          await this.page.waitForTimeout(2000);

          const resetLink = this.mailFrame.locator(
            'a[href*="/reset-password"], a:has-text("Reset Password"), a:has-text("Update Password"), a:has-text("Set New Password")',
          );

          await resetLink.first().waitFor({ state: 'visible', timeout: 8000 });
          const href = await resetLink.first().getAttribute('href');

          if (href && href.includes('/reset-password')) {
            console.log(`🔗 [Yopmail] Reset Password link found: ${href}`);
            return href;
          }
        } else {
          console.log(`⏳ [Yopmail] Reset email not arrived yet (Attempt ${attempt}/${maxRetries}). Refreshing...`);
        }
      } catch {
        // Retry if message hasn't appeared yet
      }

      if (attempt < maxRetries) {
        await this.refresh();
        await this.page.waitForTimeout(retryDelayMs);
      }
    }

    throw new Error(
      `Could not find Password Reset email on Yopmail after ${maxRetries} attempts.`,
    );
  }
}
