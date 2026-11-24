import { Page, Locator, expect } from '@playwright/test';
import dashboardSelectors from '../selectors/dashboard.json';
import { seededDataFixtureInstance } from '../fixtures/seed-data/seed-data.fixture';

export class DashboardPage {
  readonly page: Page;

  // Header & Controls
  readonly greetingTitle: Locator;
  readonly currentDate: Locator;
  readonly refreshBtn: Locator;
  readonly exportBtn: Locator;
  readonly newTaskBtn: Locator;
  readonly refreshToast: Locator;

  // Tabs
  readonly overviewTab: Locator;
  readonly analyticsTab: Locator;

  // Overview Alerts & Metric Cards
  readonly overdueBanner: Locator;
  readonly reviewOverdueBtn: Locator;
  readonly cardTotalJourneys: Locator;
  readonly cardTotalTasks: Locator;
  readonly cardCompletedTasks: Locator;
  readonly cardPendingTasks: Locator;
  readonly cardTotalNotes: Locator;
  readonly cardTotalFiles: Locator;
  readonly upcomingTasksCheckboxes: Locator;

  // Analytics Section
  readonly filter7Days: Locator;
  readonly filter14Days: Locator;
  readonly filter30Days: Locator;
  readonly filterAllTime: Locator;
  readonly chartTaskStatus: Locator;
  readonly chartFileType: Locator;
  readonly chartDailyActivity: Locator;
  readonly chartJourneyProgress: Locator;

  // Drawer Section
  readonly drawer: Locator;
  readonly drawerTitle: Locator;
  readonly drawerCloseBtn: Locator;
  readonly drawerRecords: Locator;

  // Export Modal
  readonly exportModal: Locator;
  readonly scopeCurrentTab: Locator;
  readonly scopeFullReport: Locator;
  readonly formatPdf: Locator;
  readonly formatExcel: Locator;
  readonly formatCsv: Locator;
  readonly submitExportBtn: Locator;
  readonly closeExportModalBtn: Locator;

  // Aliases for compatibility
  get detailsDrawer(): Locator {
    return this.drawer;
  }

  get refreshButton(): Locator {
    return this.refreshBtn;
  }

  get cardNotes(): Locator {
    return this.cardTotalNotes;
  }

  constructor(page: Page) {
    this.page = page;

    // Overview Selectors
    const ov = dashboardSelectors.dashboardOverview;
    this.greetingTitle = page.locator(ov.greetingTitle).first();
    this.currentDate = page.locator(ov.currentDate).first();
    this.refreshBtn = page.locator(ov.refreshBtn).first();
    this.exportBtn = page.locator(ov.exportBtn).first();
    this.newTaskBtn = page.locator(ov.newTaskBtn).first();
    this.refreshToast = page.locator(ov.refreshToast).first();
    this.overviewTab = page.locator(ov.overviewTab).first();
    this.analyticsTab = page.locator(ov.analyticsTab).first();
    // Use .first() on overdueBanner — the amber banner may appear in multiple wrapper divs
    this.overdueBanner = page.locator(ov.overdueBanner).first();
    this.reviewOverdueBtn = page.locator(ov.reviewOverdueBtn).first();
    // Metric cards: now anchored to div.bg-white so they should be unique, but .first() is a safety net
    this.cardTotalJourneys = page.locator(ov.cardTotalJourneys).first();
    this.cardTotalTasks = page.locator(ov.cardTotalTasks).first();
    this.cardCompletedTasks = page.locator(ov.cardCompletedTasks).first();
    this.cardPendingTasks = page.locator(ov.cardPendingTasks).first();
    this.cardTotalNotes = page.locator(ov.cardTotalNotes).first();
    this.cardTotalFiles = page.locator(ov.cardTotalFiles).first();
    this.upcomingTasksCheckboxes = page.locator(ov.upcomingTasksCheckboxes);

    // Analytics Selectors — scope to chart title headings so we match the chart section not wrappers
    const an = dashboardSelectors.analyticsSection;
    this.filter7Days = page.locator(an.filter7Days).first();
    this.filter14Days = page.locator(an.filter14Days).first();
    this.filter30Days = page.locator(an.filter30Days).first();
    this.filterAllTime = page.locator(an.filterAllTime).first();
    this.chartTaskStatus = page.locator(an.chartTaskStatus).first();
    this.chartFileType = page.locator(an.chartFileType).first();
    this.chartDailyActivity = page.locator(an.chartDailyActivity).first();
    this.chartJourneyProgress = page.locator(an.chartJourneyProgress).first();

    // Drawer Selectors
    const dr = dashboardSelectors.drawerSection;
    this.drawer = page.locator(dr.drawer);
    this.drawerTitle = page.locator(dr.drawerTitle);
    this.drawerCloseBtn = page.locator(dr.drawerCloseBtn);
    this.drawerRecords = page.locator(dr.drawerRecords);

    // Export Modal Selectors
    const exp = dashboardSelectors.exportModal;
    this.exportModal = page.locator(exp.modal);
    this.scopeCurrentTab = page.locator(exp.scopeCurrentTab);
    this.scopeFullReport = page.locator(exp.scopeFullReport);
    this.formatPdf = page.locator(exp.formatPdf);
    this.formatExcel = page.locator(exp.formatExcel);
    this.formatCsv = page.locator(exp.formatCsv);
    this.submitExportBtn = page.locator(exp.submitExportBtn);
    this.closeExportModalBtn = page.locator(exp.closeExportModalBtn);
  }

  /**
   * Navigate directly to Dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Seeds realistic application dashboard data via route interception.
   * Calls the fixtures layer for seed data instead of hardcoding values on the page.
   */
  async seedDashboardData(seedData = seededDataFixtureInstance.getDashboardSeedData()) {
    console.log('🌱 [SEED] Intercepting dashboard endpoints with rich seeded test data from fixtures...');

    // Intercept /api/dashboard/overview
    await this.page.route('**/api/dashboard/overview*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(seedData.overview),
      });
    });

    // Intercept /api/dashboard/analytics
    await this.page.route('**/api/dashboard/analytics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(seedData.analytics),
      });
    });

    // Intercept /api/dashboard/operations
    await this.page.route('**/api/dashboard/operations*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(seedData.operations),
      });
    });

    // Intercept /api/dashboard/drilldown
    await this.page.route('**/api/dashboard/drilldown*', async (route) => {
      const url = new URL(route.request().url());
      const type = url.searchParams.get('type') || '';

      if (type === 'OVERDUE_TASKS') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(seedData.drilldown.overdue),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(seedData.drilldown.journeys),
        });
      }
    });

    console.log('✅ [SEED] Dashboard routes successfully primed with test data from fixtures.');
  }

  /**
   * Seeds real backend entities via REST API if logged in.
   * Calls the fixtures layer for entity definitions instead of hardcoding values on the page.
   */
  async seedViaApi(apiSeedData = seededDataFixtureInstance.getApiSeedData()) {
    try {
      console.log('🌱 [API SEED] Attempting to create backend entities from fixtures...');
      // Create journey from fixtures
      const journeyRes = await this.page.request.post('/api/journeys', {
        data: apiSeedData.journey,
      });

      if (journeyRes.ok()) {
        const journey = await journeyRes.json();
        // Create tasks under journey from fixtures
        for (const task of apiSeedData.tasks) {
          await this.page.request.post('/api/tasks', {
            data: {
              ...task,
              journeyId: journey.id,
            },
          });
        }
        console.log('✅ [API SEED] Real backend records created successfully from fixtures.');
      }
    } catch (err) {
      console.log('ℹ️ [API SEED] API seeding skipped or intercepted cleanly:', err);
    }
  }

  /**
   * Verifies that the dashboard overview is loaded and greetings are rendered
   */
  async verifyDashboardLoaded() {
    await expect(this.greetingTitle).toBeVisible({ timeout: 15000 });
    await expect(this.overviewTab).toBeVisible();
    await expect(this.analyticsTab).toBeVisible();
  }

  /**
   * Asserts the summary metric card values match expected counts
   */
  async verifySummaryMetrics(expected: {
    journeys?: number;
    tasks?: number;
    completed?: number;
    pending?: number;
    notes?: number;
    files?: number;
  }) {
    if (expected.journeys !== undefined) {
      await expect(this.cardTotalJourneys).toContainText(String(expected.journeys));
    }
    if (expected.tasks !== undefined) {
      await expect(this.cardTotalTasks).toContainText(String(expected.tasks));
    }
    if (expected.completed !== undefined) {
      await expect(this.cardCompletedTasks).toContainText(String(expected.completed));
    }
    if (expected.pending !== undefined) {
      await expect(this.cardPendingTasks).toContainText(String(expected.pending));
    }
    if (expected.notes !== undefined) {
      await expect(this.cardTotalNotes).toContainText(String(expected.notes));
    }
    if (expected.files !== undefined) {
      await expect(this.cardTotalFiles).toContainText(String(expected.files));
    }
  }

  /**
   * Asserts the overdue tasks alert banner is visible
   */
  async verifyOverdueBanner(expectedCount?: number) {
    await expect(this.overdueBanner).toBeVisible();
    if (expectedCount !== undefined) {
      await expect(this.overdueBanner).toContainText(String(expectedCount));
    } else {
      await expect(this.overdueBanner).toContainText(/\d+/);
    }
  }

  /**
   * Triggers the refresh button and verifies toast confirmation
   */
  async clickRefresh() {
    await this.refreshBtn.click();
    await expect(this.refreshToast).toBeVisible({ timeout: 5000 });
  }

  /**
   * Switches to Analytics tab and verifies charts render
   */
  async switchToAnalyticsTab() {
    await this.analyticsTab.click();
    await expect(this.chartTaskStatus).toBeVisible({ timeout: 5000 });
    await expect(this.chartFileType).toBeVisible();
    await expect(this.chartDailyActivity).toBeVisible();
    await expect(this.chartJourneyProgress).toBeVisible();
  }

  /**
   * Switches to Overview tab
   */
  async switchToOverviewTab() {
    await this.overviewTab.click();
    await expect(this.cardTotalJourneys).toBeVisible({ timeout: 5000 });
  }

  /**
   * Opens Overdue slide-over details drawer
   */
  async openOverdueDrawer() {
    await this.reviewOverdueBtn.click();
    await expect(this.drawer).toBeVisible({ timeout: 10000 });
    await expect(this.drawerTitle).toContainText('Overdue Tasks');
  }

  /**
   * Closes the slide-over details drawer
   */
  async closeDrawer() {
    await this.drawerCloseBtn.first().click();
    await expect(this.drawer).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Opens export modal and verifies format buttons
   */
  async openExportModal() {
    await this.exportBtn.click();
    await expect(this.exportModal).toBeVisible({ timeout: 10000 });
    await expect(this.formatPdf).toBeVisible();
    await expect(this.formatExcel).toBeVisible();
    await expect(this.formatCsv).toBeVisible();
  }

  /**
   * Closes export modal
   */
  async closeExportModal() {
    await this.closeExportModalBtn.first().click();
    await expect(this.exportModal).not.toBeVisible({ timeout: 5000 });
  }
}
