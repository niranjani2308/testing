import { Page, Locator, expect } from '@playwright/test';
import { IndexSelectors } from '../selectors';

export class SettingsPage {
  readonly selectors = new IndexSelectors();

  readonly pageTitle: Locator;
  readonly profileHeading: Locator;
  readonly usernameDisplay: Locator;
  readonly emailDisplay: Locator;
  readonly statusBadge: Locator;
  readonly updatePasswordHeading: Locator;
  readonly securityLevelHeading: Locator;

  constructor(readonly page: Page) {
    const s = this.selectors.settingsSection;
    this.pageTitle = page.locator(s.pageTitle).first();
    this.profileHeading = page.locator(s.profileHeading).first();
    this.usernameDisplay = page.locator(s.usernameDisplay).first();
    this.emailDisplay = page.locator(s.emailDisplay).first();
    this.statusBadge = page.locator(s.statusBadge).first();
    this.updatePasswordHeading = page.locator(s.updatePasswordHeading);
    this.securityLevelHeading = page.locator(s.securityLevelHeading);
  }

  async verifyProfile(username: string, email: string) {
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(this.profileHeading).toBeVisible();
    await expect(this.usernameDisplay).toBeVisible();
    await expect(this.emailDisplay).toBeVisible();
    await expect(this.statusBadge).toBeVisible();
  }

  async verifyRemovedSecuritySections() {
    await expect(this.updatePasswordHeading).toHaveCount(0);
    await expect(this.securityLevelHeading).toHaveCount(0);
  }
}
