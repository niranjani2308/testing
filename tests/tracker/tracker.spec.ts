import { test, expect } from '../../fixtures/test.fixture';

test.describe('Tracker Module - Journey & Task Plan Progress Tracking', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session (storageState) without repeating login
    await loginPage.ensureLoggedIn();
  });

  test('TC-TRACK-001: (Journey Progress) Select journey and verify tracking details', async ({
    trackerPage,
  }) => {
    await trackerPage.goto();
    await expect(trackerPage.pageTitle).toBeVisible();

    // Verify Journey tab is active
    await trackerPage.switchTab('journey');

    // Retrieve the first journey item via POM locator calling method
    const firstJourneyItem = trackerPage.firstCardItem;
    await expect(firstJourneyItem).toBeVisible({ timeout: 10000 });
    const journeyTitle = (await firstJourneyItem.locator('xpath=.//h3').innerText()).trim();

    // Search and select dynamically
    const searchPrefix = journeyTitle.split(' ')[0];
    await trackerPage.searchJourney(searchPrefix);
    await trackerPage.selectJourney(journeyTitle);

    // Verify tracking detail metrics are displayed
    await expect(trackerPage.metricTotalDailyNotes).toBeVisible({ timeout: 10000 });
    await expect(trackerPage.metricDaysWithUpdates).toBeVisible();

    // Navigate back to search results
    await trackerPage.backToSearchResults();
    await expect(trackerPage.journeySearchInput).toBeVisible();
  });

  test('TC-TRACK-002: (Task Plan Progress) Select task plan and verify completion percentage', async ({
    trackerPage,
  }) => {
    await trackerPage.goto();

    // Switch to Tasks tab
    await trackerPage.switchTab('tasks');
    await expect(trackerPage.taskSearchInput).toBeVisible();

    // Retrieve the first available plan item via POM locator calling method
    const firstPlanItem = trackerPage.firstCardItem;
    await expect(firstPlanItem).toBeVisible({ timeout: 10000 });
    const planTitle = (await firstPlanItem.locator('xpath=.//h3').innerText()).trim();

    // Search and select dynamically
    const searchPrefix = planTitle.split(' ')[0];
    await trackerPage.searchPlan(searchPrefix);
    await trackerPage.selectPlan(planTitle);

    // Verify task plan metrics appear
    await expect(trackerPage.metricTotalTasks).toBeVisible({ timeout: 10000 });
    await expect(trackerPage.progressPercentage).toBeVisible();

    // Navigate back
    await trackerPage.backToSearchResults();
    await expect(trackerPage.taskSearchInput).toBeVisible();
  });
});
