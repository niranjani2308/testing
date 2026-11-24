import { test, expect } from '../../fixtures/test.fixture';

test.describe('Settings & Sign Out - Profile Verification & Logout Lifecycle', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session (storageState) without repeating login
    await loginPage.ensureLoggedIn();
  });

  test('TC-SETTINGS-001: (Profile) Display correct username, email, and account status', async ({
    sidebar,
    settingsPage,
  }) => {
    await sidebar.navigateTo('settings');

    const expectedUser = process.env.TEST_SEED_USER || 'automation_seed_user';
    const expectedEmail = process.env.TEST_SEED_EMAIL || 'automation_seed_user@yopmail.com';

    // Verify personal profile items via POM calling methods
    await settingsPage.verifyProfile(expectedUser, expectedEmail);

    // Verify Update Password and Security Level remain absent (Phase 2 requirement)
    await settingsPage.verifyRemovedSecuritySections();
  });

  test('TC-LOGOUT-001: (Sign Out Lifecycle) Cancel retains session; Confirm redirects to login with session cleared', async ({
    sidebar,
    page,
    loginPage,
  }) => {
    // 1. Click Sign Out to trigger confirmation modal
    await sidebar.clickSignOut();
    await expect(sidebar.confirmLogoutModal).toBeVisible();

    // 2. Cancel sign out — should keep user on dashboard
    await sidebar.cancelSignOut();
    await expect(sidebar.confirmLogoutModal).not.toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);

    // 3. Confirm sign out — should redirect to /login
    await sidebar.clickSignOut();
    await sidebar.confirmSignOut();

    await page.waitForURL(/.*login/, { timeout: 15000 });
    await expect(loginPage.authCard).toBeVisible();

    // 4. Verify browser back does not restore unauthorized session
    await page.goBack();
    // Protected route redirect should bounce user back to /login
    await page.waitForURL(/.*login/, { timeout: 10000 });
    await expect(loginPage.authCard).toBeVisible();
  });
});
