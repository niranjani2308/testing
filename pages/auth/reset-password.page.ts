import type { Page, Locator } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class ResetPasswordPage {
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
  readonly expiredCardTitle: Locator;
  readonly expiredCardSubtitle: Locator;
  readonly expiredAlertTitle: Locator;
  readonly requestFreshResetLinkBtn: Locator;
  readonly invalidCardTitle: Locator;
  readonly invalidCardSubtitle: Locator;
  readonly invalidAlertTitle: Locator;
  readonly backToLoginBtn: Locator;

  constructor(readonly page: Page) {
    this.authCard = page.locator(this.selectors.resetPasswordSection.authCard);
    this.cardTitle = page.locator(this.selectors.resetPasswordSection.cardTitle);
    this.cardSubtitle = page.locator(this.selectors.resetPasswordSection.cardSubtitle);
    this.newPasswordLabel = page.locator(this.selectors.resetPasswordSection.newPasswordLabel);
    this.newPasswordInput = page.locator(this.selectors.resetPasswordSection.newPasswordInput);
    this.newPasswordError = page.locator(this.selectors.resetPasswordSection.newPasswordError);
    this.toggleNewPasswordBtn = page.locator(this.selectors.resetPasswordSection.toggleNewPasswordVisibility);
    this.confirmPasswordLabel = page.locator(this.selectors.resetPasswordSection.confirmPasswordLabel);
    this.confirmPasswordInput = page.locator(this.selectors.resetPasswordSection.confirmPasswordInput);
    this.confirmPasswordError = page.locator(this.selectors.resetPasswordSection.confirmPasswordError);
    this.toggleConfirmPasswordBtn = page.locator(this.selectors.resetPasswordSection.toggleConfirmPasswordVisibility);
    this.passwordRulesContainer = page.locator(this.selectors.resetPasswordSection.passwordRulesContainer);
    this.ruleMinLength = page.locator(this.selectors.resetPasswordSection.ruleMinLength);
    this.ruleMaxLength = page.locator(this.selectors.resetPasswordSection.ruleMaxLength);
    this.ruleUppercase = page.locator(this.selectors.resetPasswordSection.ruleUppercase);
    this.ruleLowercase = page.locator(this.selectors.resetPasswordSection.ruleLowercase);
    this.ruleNumber = page.locator(this.selectors.resetPasswordSection.ruleNumber);
    this.ruleSpecial = page.locator(this.selectors.resetPasswordSection.ruleSpecial);
    this.ruleNoSpaces = page.locator(this.selectors.resetPasswordSection.ruleNoSpaces);
    this.submitButton = page.locator(this.selectors.resetPasswordSection.submitBtn);
    this.errorAlert = page.locator(this.selectors.resetPasswordSection.errorAlert);
    this.successCard = page.locator(this.selectors.resetPasswordSection.successCard);
    this.successTitle = page.locator(this.selectors.resetPasswordSection.successTitle);
    this.proceedToLoginBtn = page.locator(this.selectors.resetPasswordSection.proceedToLoginBtn);
    this.expiredCardTitle = page.locator(this.selectors.resetPasswordSection.expiredCardTitle);
    this.expiredCardSubtitle = page.locator(this.selectors.resetPasswordSection.expiredCardSubtitle);
    this.expiredAlertTitle = page.locator(this.selectors.resetPasswordSection.expiredAlertTitle);
    this.requestFreshResetLinkBtn = page.locator(this.selectors.resetPasswordSection.requestFreshResetLinkBtn);
    this.invalidCardTitle = page.locator(this.selectors.resetPasswordSection.invalidCardTitle);
    this.invalidCardSubtitle = page.locator(this.selectors.resetPasswordSection.invalidCardSubtitle);
    this.invalidAlertTitle = page.locator(this.selectors.resetPasswordSection.invalidAlertTitle);
    this.backToLoginBtn = page.locator(this.selectors.resetPasswordSection.backToLoginBtn);
  }

  /**
   * Navigate to the Reset Password page, optionally with a reset token
   */
  async goto(token?: string): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const targetUrl = token
      ? `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`
      : `${baseUrl}/reset-password`;
    await this.page.goto(targetUrl);
  }

  /**
   * Fill the New Password field
   */
  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
  }

  /**
   * Fill the Confirm Password field
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
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
   * Click submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Combined action to set and confirm password, then submit
   */
  async resetPassword(newPassword: string, confirmPassword: string): Promise<void> {
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickSubmit();
  }

  /**
   * Click Proceed to Login button after successful reset
   */
  async clickProceedToLogin(): Promise<void> {
    await this.proceedToLoginBtn.click();
  }

  /**
   * Click Request Fresh Reset Link from expired or invalid screen
   */
  async clickRequestFreshLink(): Promise<void> {
    await this.requestFreshResetLinkBtn.click();
  }

  /**
   * Click Back to Login button from expired or invalid screen
   */
  async clickBackToLogin(): Promise<void> {
    await this.backToLoginBtn.click();
  }
}
