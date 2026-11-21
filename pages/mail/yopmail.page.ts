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
   * Open Yopmail inbox for a specific username or email
   */
  async gotoInbox(userOrEmail: string): Promise<void> {
    const username = userOrEmail.includes('@')
      ? userOrEmail.split('@')[0]
      : userOrEmail;

    // Navigate to Yopmail direct inbox URL
    await this.page.goto(`https://yopmail.com?login=${encodeURIComponent(username)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Handle common consent / cookie dialogs if present
    await this.dismissConsent();
  }

  /**
   * Attempt to dismiss GDPR or cookie banners if shown by Yopmail
   */
  async dismissConsent(): Promise<void> {
    try {
      const consentBtn = this.page.locator(
        '#accept, #cconsent-ok, button:has-text("Consent"), .fc-cta-consent, button:has-text("AGREE")',
      );
      if (await consentBtn.first().isVisible({ timeout: 2000 })) {
        await consentBtn.first().click();
      }
    } catch {
      // Consent banner not shown or already dismissed
    }
  }

  /**
   * Refresh the inbox to check for newly arrived messages
   */
  async refresh(): Promise<void> {
    try {
      const refreshBtn = this.page.locator('#crefresh, #refreshbut');
      if (await refreshBtn.isVisible({ timeout: 2000 })) {
        await refreshBtn.click();
      } else {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
      }
    } catch {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    }
  }

  /**
   * Poll inbox and retrieve the verification URL from the latest email
   */
  async getVerificationLink(maxRetries: number = 6, retryDelayMs: number = 3000): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dismissConsent();

        // Check if messages list in iframe #ifinbox has items
        const mailRows = this.inboxFrame.locator('.m, .lm, button.lm');
        const count = await mailRows.count();

        if (count > 0) {
          // Click the top (most recent) message
          await mailRows.first().click();

          // Wait for message body in #ifmail
          const verificationLink = this.mailFrame.locator(
            'a[href*="/set-password"], a:has-text("Verify Email & Set Password")',
          );

          await verificationLink.first().waitFor({ state: 'visible', timeout: 5000 });
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
