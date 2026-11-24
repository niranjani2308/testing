import type { Page, Locator } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class SetPasswordPage {
  readonly selectors = new IndexSelectors();

  // Locators
  readonly authCard: Locator;
  readonly cardTitle: Locator;
  readonly cardSubtitle: Locator;
  readonly newPasswordLabel: Locator;
  readonly newPasswordInput: Locator;
  readonly newPasswordError: Locator;
  readonly toggleNewPasswordBtn: Locator;
  readonly confirmPasswordLabel: Locator;
  readonly confirmPasswordInput: Locator;
  readonly confirmPasswordError: Locator;
  readonly toggleConfirmPasswordBtn: Locator;
  readonly passwordRulesContainer: Locator;
  readonly ruleMinLength: Locator;
  readonly ruleMaxLength: Locator;
  readonly ruleUppercase: Locator;
  readonly ruleLowercase: Locator;
  readonly ruleNumber: Locator;
  readonly ruleSpecial: Locator;
  readonly ruleNoSpaces: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly successCard: Locator;
  readonly successTitle: Locator;
  readonly proceedToLoginBtn: Locator;
  readonly blockedCardTitle: Locator;
  readonly blockedCardSubtitle: Locator;
  readonly blockedAlertTitle: Locator;
  readonly blockedAlertDescription: Locator;
  readonly expiredCardTitle: Locator;
  readonly expiredAlertTitle: Locator;
  readonly requestNewLinkBtn: Locator;
  readonly backToLoginBtn: Locator;
  readonly footerText: Locator;
  readonly signInLink: Locator;
  readonly body: Locator;

  constructor(readonly page: Page) {
    this.body = page.locator(this.selectors.commonFlow.body).first();
    this.authCard = page.locator(this.selectors.setPasswordSection.authCard);
    this.cardTitle = page.locator(this.selectors.setPasswordSection.cardTitle);
    this.cardSubtitle = page.locator(this.selectors.setPasswordSection.cardSubtitle);
    this.newPasswordLabel = page.locator(this.selectors.setPasswordSection.newPasswordLabel);
    this.newPasswordInput = page.locator(this.selectors.setPasswordSection.newPasswordInput);
    this.newPasswordError = page.locator(this.selectors.setPasswordSection.newPasswordError);
    this.toggleNewPasswordBtn = page.locator(this.selectors.setPasswordSection.toggleNewPasswordVisibility);
    this.confirmPasswordLabel = page.locator(this.selectors.setPasswordSection.confirmPasswordLabel);
    this.confirmPasswordInput = page.locator(this.selectors.setPasswordSection.confirmPasswordInput);
    this.confirmPasswordError = page.locator(this.selectors.setPasswordSection.confirmPasswordError);
    this.toggleConfirmPasswordBtn = page.locator(this.selectors.setPasswordSection.toggleConfirmPasswordVisibility);
    this.passwordRulesContainer = page.locator(this.selectors.setPasswordSection.passwordRulesContainer);
    this.ruleMinLength = page.locator(this.selectors.setPasswordSection.ruleMinLength);
    this.ruleMaxLength = page.locator(this.selectors.setPasswordSection.ruleMaxLength);
    this.ruleUppercase = page.locator(this.selectors.setPasswordSection.ruleUppercase);
    this.ruleLowercase = page.locator(this.selectors.setPasswordSection.ruleLowercase);
    this.ruleNumber = page.locator(this.selectors.setPasswordSection.ruleNumber);
    this.ruleSpecial = page.locator(this.selectors.setPasswordSection.ruleSpecial);
    this.ruleNoSpaces = page.locator(this.selectors.setPasswordSection.ruleNoSpaces);
    this.submitButton = page.locator(this.selectors.setPasswordSection.submitBtn);
    this.errorAlert = page.locator(this.selectors.setPasswordSection.errorAlert);
    this.successCard = page.locator(this.selectors.setPasswordSection.successCard);
    this.successTitle = page.locator(this.selectors.setPasswordSection.successTitle);
    this.proceedToLoginBtn = page.locator(this.selectors.setPasswordSection.proceedToLoginBtn);
    this.blockedCardTitle = page.locator(this.selectors.setPasswordSection.blockedCardTitle);
    this.blockedCardSubtitle = page.locator(this.selectors.setPasswordSection.blockedCardSubtitle);
    this.blockedAlertTitle = page.locator(this.selectors.setPasswordSection.blockedAlertTitle);
    this.blockedAlertDescription = page.locator(this.selectors.setPasswordSection.blockedAlertDescription);
    this.expiredCardTitle = page.locator(this.selectors.setPasswordSection.expiredCardTitle);
    this.expiredAlertTitle = page.locator(this.selectors.setPasswordSection.expiredAlertTitle);
    this.requestNewLinkBtn = page.locator(this.selectors.setPasswordSection.requestNewLinkBtn);
    this.backToLoginBtn = page.locator(this.selectors.setPasswordSection.backToLoginBtn);
    this.footerText = page.locator(this.selectors.setPasswordSection.footerText);
    this.signInLink = page.locator(this.selectors.setPasswordSection.signInLink);
  }

  /**
   * Navigate to the Set Password page, optionally with a verification token
   */
  async goto(token?: string): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const targetUrl = token
      ? `${baseUrl}/set-password?token=${encodeURIComponent(token)}`
      : `${baseUrl}/set-password`;
    await this.page.goto(targetUrl);
  }

  /**
   * Fill the New Password field
   */
  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
  }

  /**
   * Clear the New Password field
   */
  async clearNewPassword(): Promise<void> {
    await this.newPasswordInput.fill('');
  }

  /**
   * Fill the Confirm Password field
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Clear the Confirm Password field
   */
  async clearConfirmPassword(): Promise<void> {
    await this.confirmPasswordInput.fill('');
  }

  /**
   * Toggle visibility of new password
   */
  async toggleNewPasswordVisibility(): Promise<void> {
    await this.toggleNewPasswordBtn.click();
  }

  /**
   * Toggle visibility of confirm password
   */
  async toggleConfirmPasswordVisibility(): Promise<void> {
    await this.toggleConfirmPasswordBtn.click();
  }

  /**
   * Click the Activate Account & Set Password submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Combined action to set and confirm password, then submit
   */
  async setPassword(newPassword: string, confirmPassword: string): Promise<void> {
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickSubmit();
  }

  /**
   * Click Proceed to Login button after successful activation
   */
  async clickProceedToLogin(): Promise<void> {
    await this.proceedToLoginBtn.click();
  }

  /**
   * Click Request New Verification Link button from expired or blocked screen
   */
  async clickRequestNewLink(): Promise<void> {
    await this.requestNewLinkBtn.click();
  }

  /**
   * Click Back to Login button from expired or blocked screen
   */
  async clickBackToLogin(): Promise<void> {
    await this.backToLoginBtn.click();
  }
}
