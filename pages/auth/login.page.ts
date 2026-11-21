import type { Page, Locator } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class LoginPage {
  readonly selectors = new IndexSelectors();

  // Locators
  readonly authCard: Locator;
  readonly cardTitle: Locator;
  readonly cardSubtitle: Locator;
  readonly brandIcon: Locator;
  readonly usernameLabel: Locator;
  readonly usernameInput: Locator;
  readonly usernameError: Locator;
  readonly passwordLabel: Locator;
  readonly passwordInput: Locator;
  readonly passwordError: Locator;
  readonly passwordToggleBtn: Locator;
  readonly forgotPasswordLink: Locator;
  readonly submitButton: Locator;
  readonly signupPromptText: Locator;
  readonly signupLink: Locator;
  readonly errorAlert: Locator;
  readonly successAlert: Locator;
  readonly lockoutBanner: Locator;
  readonly resendVerificationBtn: Locator;
  readonly loadingStatus: Locator;

  constructor(readonly page: Page) {
    this.authCard = page.locator(this.selectors.loginSection.authCard);
    this.cardTitle = page.locator(this.selectors.loginSection.cardTitle);
    this.cardSubtitle = page.locator(this.selectors.loginSection.cardSubtitle);
    this.brandIcon = page.locator(this.selectors.loginSection.brandIcon);
    this.usernameLabel = page.locator(this.selectors.loginSection.usernameLabel);
    this.usernameInput = page.locator(this.selectors.loginSection.usernameInput);
    this.usernameError = page.locator(this.selectors.loginSection.usernameError);
    this.passwordLabel = page.locator(this.selectors.loginSection.passwordLabel);
    this.passwordInput = page.locator(this.selectors.loginSection.passwordInput);
    this.passwordError = page.locator(this.selectors.loginSection.passwordError);
    this.passwordToggleBtn = page.locator(this.selectors.loginSection.togglePasswordVisibility);
    this.forgotPasswordLink = page.locator(this.selectors.loginSection.forgotPasswordLink);
    this.submitButton = page.locator(this.selectors.loginSection.submitBtn);
    this.signupPromptText = page.locator(this.selectors.loginSection.signupPromptText);
    this.signupLink = page.locator(this.selectors.loginSection.signupLink);
    this.errorAlert = page.locator(this.selectors.loginSection.errorAlert);
    this.successAlert = page.locator(this.selectors.loginSection.successAlert);
    this.lockoutBanner = page.locator(this.selectors.loginSection.lockoutBanner);
    this.resendVerificationBtn = page.locator(this.selectors.loginSection.resendVerificationBtn);
    this.loadingStatus = page.locator(this.selectors.loginSection.loadingStatus);
  }

  /**
   * Navigate to the login page using environment configuration
   */
  async goto(): Promise<void> {
    const url = process.env.LOGIN_URL || `${process.env.BASE_URL || ''}/login`;
    await this.page.goto(url);
  }

  /**
   * Fill the username or email field
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
   * Fill the password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Clear the password field
   */
  async clearPassword(): Promise<void> {
    await this.passwordInput.fill('');
  }

  /**
   * Click the eye icon to toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggleBtn.click();
  }

  /**
   * Click the Login submit button
   */
  async clickLogin(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Submit form by pressing Enter key on any input
   */
  async submitWithEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  /**
   * Perform a login action with given or environment credentials
   */
  async login(
    username = process.env.APP_USERNAME!,
    password = process.env.APP_PASSWORD!
  ): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Click "Forgot Password?" link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click "Create an Account / Sign Up" link
   */
  async clickSignup(): Promise<void> {
    await this.signupLink.click();
  }

  /**
   * Get current input value of the username field
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Get current input value of the password field
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Get current type attribute of the password field (password vs text)
   */
  async getPasswordInputType(): Promise<string | null> {
    return await this.passwordInput.getAttribute('type');
  }

  /**
   * Get field-level username error text
   */
  async getUsernameErrorText(): Promise<string | null> {
    if (await this.usernameError.isVisible()) {
      return (await this.usernameError.textContent()) || '';
    }
    return null;
  }

  /**
   * Get field-level password error text
   */
  async getPasswordErrorText(): Promise<string | null> {
    if (await this.passwordError.isVisible()) {
      return (await this.passwordError.textContent()) || '';
    }
    return null;
  }
}
