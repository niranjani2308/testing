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

    // 7. If rate-limited right at inbox open, wait out the cooldown before proceeding
    await this.waitOutRateLimit();

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
        console.log('✅ [Yopmail] Human verification completed! Playwright is now continuing all remaining actions automatically.');
        await this.page.waitForTimeout(1500);
        return;
      }
    }

    throw new Error(
      `[Yopmail] Human verification was NOT completed within ${maxWaitMs / 1000} seconds. ` +
      `Please tick the CAPTCHA checkbox in the headed browser window.`,
    );
  }

  /**
   * Checks whether YOPmail is displaying its temporary rate limit screen
   * ("Please wait before continuing. Try again in X min Y s.")
   * Returns the cooldown in milliseconds (0 if not rate-limited).
   */
  async getRateLimitCooldownMs(): Promise<number> {
    try {
      // Check in the inbox iframe first
      const inboxMsg = this.inboxFrame.locator('text="Please wait before continuing"');
      const pageMsg = this.page.locator('text="Please wait before continuing"');

      const inFrameVisible = await inboxMsg.isVisible({ timeout: 600 }).catch(() => false);
      const onPageVisible = await pageMsg.isVisible({ timeout: 600 }).catch(() => false);

      if (!inFrameVisible && !onPageVisible) {
        return 0;
      }

      // Try to parse the countdown timer text e.g. "Try again in 4 min 40 s."
      const timerLocator = onPageVisible
        ? this.page.locator('text=/Try again in/')
        : this.inboxFrame.locator('text=/Try again in/');

      const timerText = await timerLocator.first().textContent({ timeout: 1500 }).catch(() => '');

      if (timerText) {
        // Parse "Try again in X min Y s." or "Try again in Y s."
        const minMatch = timerText.match(/(\d+)\s*min/);
        const secMatch = timerText.match(/(\d+)\s*s/);
        const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
        const seconds = secMatch ? parseInt(secMatch[1], 10) : 0;
        const totalMs = (minutes * 60 + seconds + 5) * 1000; // +5s buffer
        console.log(`⏱️  [Yopmail] Rate limit detected: "${timerText.trim()}" → waiting ${totalMs / 1000}s`);
        return totalMs;
      }

      // Fallback: return a default 15s cooldown
      return 15_000;
    } catch {
      return 0;
    }
  }

  /**
   * Checks if YOPmail is rate-limiting (simple boolean version)
   */
  async isRateLimited(): Promise<boolean> {
    return (await this.getRateLimitCooldownMs()) > 0;
  }

  /**
   * If YOPmail is showing the rate-limit screen, waits out the full cooldown period.
   * Uses the parsed countdown timer to determine exactly how long to wait.
   */
  async waitOutRateLimit(): Promise<void> {
    const cooldownMs = await this.getRateLimitCooldownMs();
    if (cooldownMs <= 0) return;

    console.log(`\n⏳ [Yopmail] Rate-limited! Waiting ${Math.ceil(cooldownMs / 1000)}s for cooldown to expire...`);
    console.log('   (You can watch the countdown in the browser — Playwright will auto-resume)');

    // Wait in 5s chunks so we can log progress
    let remaining = cooldownMs;
    while (remaining > 0) {
      const chunk = Math.min(remaining, 5000);
      await this.page.waitForTimeout(chunk);
      remaining -= chunk;

      // Re-check — if the page recovered early, stop waiting
      const stillLimited = await this.isRateLimited();
      if (!stillLimited) {
        console.log('✅ [Yopmail] Rate limit lifted early! Continuing...');
        return;
      }

      if (remaining > 0) {
        console.log(`   ⏳ Still waiting... ~${Math.ceil(remaining / 1000)}s remaining`);
      }
    }

    console.log('✅ [Yopmail] Rate limit cooldown expired. Proceeding...');
    // After cooldown, reload to refresh the inbox state
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.dismissConsent();
    await this.page.waitForTimeout(2000);
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
   * Checks for rate-limiting first and waits out the cooldown if needed.
   */
  async refresh(): Promise<void> {
    if (await this.isHumanVerificationPresent()) {
      await this.waitForHumanVerification();
      return;
    }

    // If rate-limited, wait it out before attempting a refresh
    await this.waitOutRateLimit();

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

        // If YOPmail is showing rate-limiting screen, wait out the full cooldown
        await this.waitOutRateLimit();

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
            'a[href*="/set-password"], a:has-text("Verify Email & Set Password"), a:has-text("Verify Email"), a:has-text("Set Password")',
          );

          const linkCount = await verificationLink.count();
          if (linkCount > 0) {
            await verificationLink.first().waitFor({ state: 'visible', timeout: 8000 });
            const href = await verificationLink.first().getAttribute('href');

            if (href && href.includes('/set-password')) {
              console.log(`🔗 [Yopmail] Verification link found: ${href}`);
              return href;
            }
          } else {
            console.log(`⚠️ [Yopmail] Email opened but no /set-password link found. Retrying...`);
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
   * IMPORTANT: When called after getVerificationLink(), the inbox may already contain
   * the old verification email at position [0]. This method scans ALL visible email rows
   * to find the one specifically containing a /reset-password link.
   */
  async getResetPasswordLink(
    maxRetries: number = 12,
    retryDelayMs: number = 5000,
  ): Promise<string> {
    console.log('📬 [Yopmail] Searching for Password Reset email in inbox...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dismissConsent();

        if (await this.isHumanVerificationPresent()) {
          await this.waitForHumanVerification();
        }

        // If YOPmail is showing rate-limiting screen, wait out the full cooldown
        await this.waitOutRateLimit();

        const mailRows = this.inboxFrame.locator('.m, .lm, button.lm, a.lm, div.m');
        const count = await mailRows.count();

        if (count > 0) {
          console.log(`✉️ [Yopmail] Inbox has ${count} email(s). Scanning all for reset-password link...`);

          // Scan ALL email rows (newest first) for the reset-password email
          for (let i = 0; i < count; i++) {
            try {
              // Click each email row in turn
              await mailRows.nth(i).click();
              await this.page.waitForTimeout(2000);

              // Check if this email contains a /reset-password link
              const resetLink = this.mailFrame.locator(
                'a[href*="/reset-password"]',
              );
              const resetLinkCount = await resetLink.count();

              if (resetLinkCount > 0) {
                await resetLink.first().waitFor({ state: 'visible', timeout: 5000 });
                const href = await resetLink.first().getAttribute('href');

                if (href && href.includes('/reset-password')) {
                  console.log(`🔗 [Yopmail] Reset Password link found (email #${i + 1}): ${href}`);
                  return href;
                }
              } else {
                console.log(`   Email #${i + 1}: no /reset-password link (skipping)`);
              }
            } catch {
              console.log(`   Email #${i + 1}: error reading — skipping`);
            }
          }

          console.log(`⚠️ [Yopmail] Scanned all ${count} email(s) but reset-password link not found. Refreshing...`);
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
