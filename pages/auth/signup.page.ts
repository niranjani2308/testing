import type { Page, Locator } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class SignupPage {
  readonly selectors = new IndexSelectors();

  // Locators
  readonly authCard: Locator;
  readonly cardTitle: Locator;
  readonly cardSubtitle: Locator;
  readonly brandIcon: Locator;
  readonly usernameLabel: Locator;
  readonly usernameInput: Locator;
  readonly usernameError: Locator;
  readonly emailLabel: Locator;
  readonly emailInput: Locator;
  readonly emailError: Locator;
  readonly submitButton: Locator;
  readonly loginPromptText: Locator;
  readonly loginLink: Locator;
  readonly errorAlert: Locator;
  readonly successCard: Locator;
  readonly successTitle: Locator;
  readonly successDescription: Locator;
  readonly linkValidityNote: Locator;
  readonly backToLoginBtn: Locator;
  readonly body: Locator;

  constructor(readonly page: Page) {
    this.body = page.locator(this.selectors.commonFlow.body).first();
    this.authCard = page.locator(this.selectors.signupSection.authCard);
    this.cardTitle = page.locator(this.selectors.signupSection.cardTitle);
    this.cardSubtitle = page.locator(this.selectors.signupSection.cardSubtitle);
    this.brandIcon = page.locator(this.selectors.signupSection.brandIcon);
    this.usernameLabel = page.locator(this.selectors.signupSection.usernameLabel);
    this.usernameInput = page.locator(this.selectors.signupSection.usernameInput);
    this.usernameError = page.locator(this.selectors.signupSection.usernameError);
    this.emailLabel = page.locator(this.selectors.signupSection.emailLabel);
    this.emailInput = page.locator(this.selectors.signupSection.emailInput);
    this.emailError = page.locator(this.selectors.signupSection.emailError);
    this.submitButton = page.locator(this.selectors.signupSection.submitBtn);
    this.loginPromptText = page.locator(this.selectors.signupSection.loginPromptText);
    this.loginLink = page.locator(this.selectors.signupSection.loginLink);
    this.errorAlert = page.locator(this.selectors.signupSection.errorAlert);
    this.successCard = page.locator(this.selectors.signupSection.successCard);
    this.successTitle = page.locator(this.selectors.signupSection.successTitle);
    this.successDescription = page.locator(this.selectors.signupSection.successDescription);
    this.linkValidityNote = page.locator(this.selectors.signupSection.linkValidityNote);
    this.backToLoginBtn = page.locator(this.selectors.signupSection.backToLoginBtn);
  }

  /**
   * Navigate to the Signup page
   */
  async goto(): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await this.page.goto(`${baseUrl}/signup`);
  }

  /**
   * Fill the username field
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Clear the username field
   */
  async clearUsername(): Promise<void> {
    await this.usernameInput.fill('');
  }

  /**
   * Fill the email address field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Clear the email field
   */
  async clearEmail(): Promise<void> {
    await this.emailInput.fill('');
  }

  /**
   * Click the Create Account submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Combined action to fill both fields and submit
   */
  async signup(username: string, email: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillEmail(email);
    await this.clickSubmit();
  }

  /**
   * Click Back to Login button from success screen
   */
  async clickBackToLogin(): Promise<void> {
    await this.backToLoginBtn.click();
  }

  /**
   * Click Sign In link from the footer
   */
  async clickLoginLink(): Promise<void> {
    await this.loginLink.click();
  }
}
