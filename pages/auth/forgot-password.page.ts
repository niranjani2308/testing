import type { Page, Locator } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class ForgotPasswordPage {
  readonly selectors = new IndexSelectors();

  // Locators
  readonly authCard: Locator;
  readonly cardTitle: Locator;
  readonly cardSubtitle: Locator;
  readonly brandIcon: Locator;
  readonly emailLabel: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly backToLoginLink: Locator;
  readonly successCard: Locator;
  readonly successTitle: Locator;
  readonly successDescription: Locator;
  readonly linkValidityNote: Locator;
  readonly returnToLoginBtn: Locator;
  readonly body: Locator;

  constructor(readonly page: Page) {
    this.body = page.locator(this.selectors.commonFlow.body).first();
    this.authCard = page.locator(this.selectors.forgotPasswordSection.authCard);
    this.cardTitle = page.locator(this.selectors.forgotPasswordSection.cardTitle);
    this.cardSubtitle = page.locator(this.selectors.forgotPasswordSection.cardSubtitle);
    this.brandIcon = page.locator(this.selectors.forgotPasswordSection.brandIcon);
    this.emailLabel = page.locator(this.selectors.forgotPasswordSection.emailLabel);
    this.emailInput = page.locator(this.selectors.forgotPasswordSection.emailInput);
    this.submitButton = page.locator(this.selectors.forgotPasswordSection.submitBtn);
    this.errorAlert = page.locator(this.selectors.forgotPasswordSection.errorAlert);
    this.backToLoginLink = page.locator(this.selectors.forgotPasswordSection.backToLoginLink);
    this.successCard = page.locator(this.selectors.forgotPasswordSection.successCard);
    this.successTitle = page.locator(this.selectors.forgotPasswordSection.successTitle);
    this.successDescription = page.locator(this.selectors.forgotPasswordSection.successDescription);
    this.linkValidityNote = page.locator(this.selectors.forgotPasswordSection.linkValidityNote);
    this.returnToLoginBtn = page.locator(this.selectors.forgotPasswordSection.returnToLoginBtn);
  }

  /**
   * Navigate to the Forgot Password page
   */
  async goto(): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await this.page.goto(`${baseUrl}/forgot-password`);
  }

  /**
   * Fill the email input
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Clear the email input
   */
  async clearEmail(): Promise<void> {
    await this.emailInput.fill('');
  }

  /**
   * Click submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Combined action: fill email and submit
   */
  async requestReset(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickSubmit();
  }

  /**
   * Click Return to Login button from success screen
   */
  async clickReturnToLogin(): Promise<void> {
    await this.returnToLoginBtn.click();
  }

  /**
   * Click Back to Login link from footer
   */
  async clickBackToLogin(): Promise<void> {
    await this.backToLoginLink.click();
  }
}
