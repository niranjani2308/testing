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
   * and press the arrow/check button to open the inbox — just like a real user.
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
   * Checks whether the Cloudflare Turnstile "Verify you are human" challenge is currently active on the page.
   * Checks DOM text, modal containers, and frame URLs.
   */
  async isHumanVerificationPresent(): Promise<boolean> {
    try {
      // 1. Check if any frame belongs to Cloudflare Turnstile
      const hasCloudflareFrame = this.page.frames().some((f) => {
        const u = f.url();
        return u.includes('cloudflare') || u.includes('turnstile') || u.includes('challenges');
      });
      if (hasCloudflareFrame) {
        return true;
      }

      // 2. Check modal text and selectors on the main page
      const challengeLocators = [
        this.page.locator('text="Please confirm you\'re human to continue"'),
        this.page.locator('text="Verify you are human"'),
        this.page.locator('iframe[src*="cloudflare"]'),
        this.page.locator('iframe[src*="turnstile"]'),
        this.page.locator('iframe[title*="Cloudflare"]'),
        this.page.locator('div:has-text("Verify you are human")'),
      ];

      for (const loc of challengeLocators) {
        if (await loc.first().isVisible({ timeout: 500 }).catch(() => false)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Detects if a "Verify you are human" / Cloudflare challenge is present.
   * If detected, pauses and gives the user time to manually click the checkbox in headed mode.
   * DOES NOT reload the page while waiting so user clicks are not interrupted!
   */
  async waitForHumanVerification(maxWaitMs: number = 90000): Promise<void> {
    // Wait briefly in case the modal is still rendering
    let isPresent = await this.isHumanVerificationPresent();
    if (!isPresent) {
      await this.page.waitForTimeout(1500);
      isPresent = await this.isHumanVerificationPresent();
    }

    if (!isPresent) {
      return;
    }

    console.log('\n========================================================================');
    console.log('⚠️  [Yopmail] Human verification challenge detected ("Verify you are human")!');
    console.log('👉 Please click the "Verify you are human" checkbox manually in the browser.');
    console.log('⏳ Waiting for manual verification (page will NOT reload while you click)...');
    console.log('========================================================================\n');

    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      // Wait peacefully without touching or reloading the page
      await this.page.waitForTimeout(1000);

      const stillPresent = await this.isHumanVerificationPresent();
      if (!stillPresent) {
        console.log('✅ [Yopmail] Human verification completed! Resuming automated flow...\n');
        await this.page.waitForTimeout(2000);
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
      if (await consentBtn.first().isVisible({ timeout: 2000 })) {
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
    // Safety check: Never reload if the CAPTCHA modal is present
    if (await this.isHumanVerificationPresent()) {
      await this.waitForHumanVerification();
      return;
    }

    try {
      const refreshBtn = this.page.locator('#refresh, #crefresh, #refreshbut');
      if (await refreshBtn.first().isVisible({ timeout: 3000 })) {
        await refreshBtn.first().click();
        await this.page.waitForTimeout(2000);
      } else {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
      }
    } catch {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(2000);
    }
    await this.dismissConsent();
  }

  /**
   * Poll the Yopmail inbox via browser iframes and retrieve the verification URL
   * from the latest email that contains a "/set-password" link.
   *
   * Flow:
   *  1. Check for human verification challenge
   *  2. Look for mail rows inside #ifinbox iframe
   *  3. Click the first (most recent) mail row
   *  4. Inside #ifmail iframe, find <a> linking to /set-password
   *  5. Return the href
   */
  async getVerificationLink(
    maxRetries: number = 8,
    retryDelayMs: number = 5000,
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dismissConsent();
        await this.waitForHumanVerification();

        // Look for email rows inside the inbox iframe
        const mailRows = this.inboxFrame.locator('.m, .lm, button.lm');
        const count = await mailRows.count();

        if (count > 0) {
          // Click the top (most recent) message
          await mailRows.first().click();

          // Allow mail body iframe to load
          await this.page.waitForTimeout(2000);

          // Look for the verification link inside the mail body iframe
          const verificationLink = this.mailFrame.locator(
            'a[href*="/set-password"], a:has-text("Verify Email & Set Password"), a:has-text("Verify Email"), a:has-text("Set Password")',
          );

          await verificationLink.first().waitFor({ state: 'visible', timeout: 8000 });
          const href = await verificationLink.first().getAttribute('href');

          if (href && href.includes('/set-password')) {
            return href;
          }
        }
      } catch {
        // Message might not have arrived yet, proceed to retry
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
}
