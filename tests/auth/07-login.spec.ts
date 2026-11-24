import { test, expect } from '../../fixtures/test.fixture';
import { IndexSelectors } from '../../selectors';

test.describe('Login Page - End-to-End Authentication Tests', () => {
  const selectors = new IndexSelectors();
  const username = process.env.APP_USERNAME!;
  const password = process.env.APP_PASSWORD!;

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC-LOGIN-AUTH-001: Successful login with valid credentials from .env redirects to dashboard', async ({ page, loginPage }) => {
    await loginPage.login(username, password);

    // Expect successful redirection to the dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('TC-LOGIN-AUTH-002: Failed login with invalid password displays error alert', async ({ loginPage }) => {
    await loginPage.login(username, 'InvalidPassword123!');

    // Expect error alert to appear
    await expect(loginPage.errorAlert).toBeVisible();
  });
});
