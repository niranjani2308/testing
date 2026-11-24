import { test, expect } from '../../fixtures/test.fixture';

test.describe('Navigation - Workspace Sidebar, Tab Switching & Collapse Behavior', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session (storageState) without repeating login
    await loginPage.ensureLoggedIn();
  });

  test('TC-NAV-001: (Tab Navigation) Seamlessly navigate to every workspace module', async ({
    sidebar,
    journeysPage,
    notesPage,
    tasksPage,
    trackerPage,
    dashboardPage,
  }) => {
    // 1. Journey
    await sidebar.navigateTo('journeys');
    await expect(journeysPage.pageTitle).toBeVisible({ timeout: 10000 });

    // 2. Notes
    await sidebar.navigateTo('notes');
    await expect(notesPage.pageTitle).toBeVisible({ timeout: 10000 });

    // 3. Tasks
    await sidebar.navigateTo('tasks');
    await expect(tasksPage.todayTab).toBeVisible({ timeout: 10000 });

    // 4. Tracker
    await sidebar.navigateTo('tracker');
    await expect(trackerPage.pageTitle).toBeVisible({ timeout: 10000 });

    // 5. Dashboard
    await sidebar.navigateTo('dashboard');
    await expect(dashboardPage.greetingTitle).toBeVisible({ timeout: 10000 });
  });

  test('TC-NAV-002: (Collapse/Expand) Toggle sidebar collapse and expand states', async ({
    sidebar,
  }) => {
    // Verify collapse toggle button exists
    await expect(sidebar.collapseToggleBtn).toBeVisible();

    // Click collapse
    await sidebar.toggleCollapse();
    // Sidebar container should transition to w-20
    await expect(sidebar.sidebarContainer).toHaveClass(/w-20/);

    // Click expand
    await sidebar.toggleCollapse();
    await expect(sidebar.sidebarContainer).toHaveClass(/w-64/);
  });

  test('TC-NAV-003: (AI Copilot) Open and close AI Copilot drawer', async ({
    sidebar,
  }) => {
    await sidebar.openCopilot();
    await expect(sidebar.copilotDrawer).toBeVisible({ timeout: 10000 });

    // Close copilot via calling method
    await sidebar.closeCopilot();
    await expect(sidebar.copilotDrawer).not.toBeVisible();
  });
});
