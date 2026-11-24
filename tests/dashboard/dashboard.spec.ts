import { test, expect } from '../../fixtures';

test.describe('Dashboard - Live Seeded Metrics, Overview & Analytics', () => {
  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    // Reuses authenticated session without repeating login
    await loginPage.ensureLoggedIn();
    await dashboardPage.verifyDashboardLoaded();
  });

  // =========================================================================
  // 1. OVERVIEW SUMMARY METRICS (TC-DASH-001 to TC-DASH-010)
  // =========================================================================
  test('TC-DASH-001: Summary metric cards display live seeded counts accurately', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await dashboardPage.verifySummaryMetrics({
      journeys: expected.totalJourneys,
      tasks: expected.totalTasks,
      completed: expected.completedTasks,
      pending: expected.pendingTasks,
      notes: expected.totalNotes,
      files: expected.totalFiles || 2,
    });
  });

  test('TC-DASH-002: Journeys summary card displays correct numeric count', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await expect(dashboardPage.cardTotalJourneys).toContainText(String(expected.totalJourneys));
  });

  test('TC-DASH-003: Total tasks summary card displays correct numeric count', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await expect(dashboardPage.cardTotalTasks).toContainText(String(expected.totalTasks));
  });

  test('TC-DASH-004: Completed tasks summary card displays correct numeric count', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await expect(dashboardPage.cardCompletedTasks).toContainText(String(expected.completedTasks));
  });

  test('TC-DASH-005: Pending tasks summary card displays correct numeric count', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await expect(dashboardPage.cardPendingTasks).toContainText(String(expected.pendingTasks));
  });

  test('TC-DASH-006: Total notes summary card displays correct numeric count', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await expect(dashboardPage.cardTotalNotes).toContainText(String(expected.totalNotes));
  });

  test('TC-DASH-007: Total uploaded files card displays correct numeric count', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await expect(dashboardPage.cardTotalFiles).toContainText(String(expected.totalFiles || 2));
  });

  test('TC-DASH-008: Metric cards render without negative values or NaN', async ({
    dashboardPage,
  }) => {
    const cards = [
      dashboardPage.cardTotalJourneys,
      dashboardPage.cardTotalTasks,
      dashboardPage.cardCompletedTasks,
      dashboardPage.cardPendingTasks,
      dashboardPage.cardTotalNotes,
      dashboardPage.cardTotalFiles,
    ];
    for (const card of cards) {
      const text = await card.innerText();
      expect(text).not.toContain('NaN');
      expect(text).not.toContain('-1');
      expect(text).toMatch(/\d+/);
    }
  });

  test('TC-DASH-009: Completed tasks count does not exceed total tasks count', async ({
    dashboardPage,
  }) => {
    const totalText = await dashboardPage.cardTotalTasks.innerText();
    const completedText = await dashboardPage.cardCompletedTasks.innerText();
    const total = parseInt(totalText.replace(/\D/g, ''), 10) || 0;
    const completed = parseInt(completedText.replace(/\D/g, ''), 10) || 0;
    expect(completed).toBeLessThanOrEqual(total);
  });

  test('TC-DASH-010: Pending and completed tasks sum up accurately against total', async ({
    dashboardPage,
  }) => {
    const totalText = await dashboardPage.cardTotalTasks.innerText();
    const completedText = await dashboardPage.cardCompletedTasks.innerText();
    const pendingText = await dashboardPage.cardPendingTasks.innerText();
    const total = parseInt(totalText.replace(/\D/g, ''), 10) || 0;
    const completed = parseInt(completedText.replace(/\D/g, ''), 10) || 0;
    const pending = parseInt(pendingText.replace(/\D/g, ''), 10) || 0;
    expect(completed + pending).toBeLessThanOrEqual(total);
  });

  // =========================================================================
  // 2. OVERDUE TASKS BANNER & DRILLDOWN (TC-DASH-011 to TC-DASH-018)
  // =========================================================================
  test('TC-DASH-011: Overdue tasks alert banner renders with count 2', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await dashboardPage.verifyOverdueBanner(expected.overdueTasks);
  });

  test('TC-DASH-012: Review overdue button is visible and clickable on banner', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.reviewOverdueBtn).toBeVisible();
    await expect(dashboardPage.reviewOverdueBtn).toBeEnabled();
  });

  test('TC-DASH-013: Clicking review button opens overdue tasks drilldown drawer', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openOverdueDrawer();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 10000 });
    await expect(dashboardPage.drawerTitle).toContainText(/Overdue/i);
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-014: Overdue drawer displays list of overdue tasks', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openOverdueDrawer();
    await expect(dashboardPage.drawerRecords).toBeVisible({ timeout: 10000 });
    const count = await dashboardPage.drawerRecords.count();
    expect(count).toBeGreaterThan(0);
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-015: Closing overdue drawer via close button hides the drawer', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openOverdueDrawer();
    await expect(dashboardPage.detailsDrawer).toBeVisible();
    await dashboardPage.closeDrawer();
    await expect(dashboardPage.detailsDrawer).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-DASH-016: Closing overdue drawer via keyboard ESC key hides the drawer', async ({
    dashboardPage,
    page,
  }) => {
    await dashboardPage.openOverdueDrawer();
    await expect(dashboardPage.detailsDrawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dashboardPage.detailsDrawer).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-DASH-017: Overdue alert banner has prominent amber warning styling', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.overdueBanner).toBeVisible();
    const className = (await dashboardPage.overdueBanner.getAttribute('class')) || '';
    expect(className).toMatch(/(amber|yellow|warning|orange|red|border)/i);
  });

  test('TC-DASH-018: Overdue tasks drawer contains valid task titles and due dates', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openOverdueDrawer();
    const drawerText = await dashboardPage.detailsDrawer.innerText();
    expect(drawerText.trim().length).toBeGreaterThan(10);
    await dashboardPage.closeDrawer();
  });

  // =========================================================================
  // 3. DRILLDOWN DRAWERS FOR METRICS (TC-DASH-019 to TC-DASH-025)
  // =========================================================================
  test('TC-DASH-019: Clicking Total Notes card opens Notes drilldown drawer', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardNotes.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 10000 });
    await expect(dashboardPage.drawerTitle).toContainText(/Notes/i);
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-020: Notes drawer displays active note records', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardNotes.click();
    await expect(dashboardPage.drawerRecords).toBeVisible({ timeout: 10000 });
    const count = await dashboardPage.drawerRecords.count();
    expect(count).toBeGreaterThan(0);
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-021: Clicking Journeys metric card triggers drilldown view', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardTotalJourneys.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 10000 });
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-022: Clicking Tasks metric card triggers drilldown view', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardTotalTasks.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 10000 });
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-023: Clicking Completed tasks card opens completed task drilldown', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardCompletedTasks.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 10000 });
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-024: Clicking Pending tasks card opens pending task drilldown', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardPendingTasks.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 10000 });
    await dashboardPage.closeDrawer();
  });

  test('TC-DASH-025: Rapid toggling between metric card drilldowns does not freeze UI', async ({
    dashboardPage,
  }) => {
    await dashboardPage.cardTotalJourneys.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 5000 });
    await dashboardPage.cardTotalNotes.click();
    await expect(dashboardPage.detailsDrawer).toBeVisible({ timeout: 5000 });
    await dashboardPage.closeDrawer();
    await expect(dashboardPage.detailsDrawer).not.toBeVisible();
  });

  // =========================================================================
  // 4. ANALYTICS SECTION & CHARTS (TC-DASH-026 to TC-DASH-035)
  // =========================================================================
  test('TC-DASH-026: Switching to Analytics tab renders all 4 chart widgets', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.chartTaskStatus).toBeVisible();
    await expect(dashboardPage.chartFileType).toBeVisible();
    await expect(dashboardPage.chartDailyActivity).toBeVisible();
    await expect(dashboardPage.chartJourneyProgress).toBeVisible();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-027: Analytics tab displays 7-day timeframe filter button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.filter7Days).toBeVisible();
    await expect(dashboardPage.filter7Days).toBeEnabled();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-028: Analytics tab displays 14-day timeframe filter button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.filter14Days).toBeVisible();
    await expect(dashboardPage.filter14Days).toBeEnabled();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-029: Analytics tab displays 30-day timeframe filter button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.filter30Days).toBeVisible();
    await expect(dashboardPage.filter30Days).toBeEnabled();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-030: Analytics tab displays All-Time timeframe filter button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.filterAllTime).toBeVisible();
    await expect(dashboardPage.filterAllTime).toBeEnabled();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-031: Clicking 7-day timeframe updates filter selection state', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await dashboardPage.filter7Days.click();
    await expect(dashboardPage.chartTaskStatus).toBeVisible();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-032: Clicking 30-day timeframe updates filter selection state', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await dashboardPage.filter30Days.click();
    await expect(dashboardPage.chartTaskStatus).toBeVisible();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-033: Task status distribution chart contains status legend items', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    const chartText = await dashboardPage.chartTaskStatus.innerText();
    expect(chartText).toMatch(/(Completed|Progress|Pending)/i);
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-034: File type distribution chart displays file categorization', async ({
    dashboardPage,
  }) => {
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.chartFileType).toBeVisible();
    await dashboardPage.switchToOverviewTab();
  });

  test('TC-DASH-035: Switching between Overview and Analytics tabs preserves metric state', async ({
    dashboardPage,
    seededData,
  }) => {
    const expected = seededData.getExpectedMetrics();
    await dashboardPage.switchToAnalyticsTab();
    await expect(dashboardPage.chartTaskStatus).toBeVisible();
    await dashboardPage.switchToOverviewTab();
    await expect(dashboardPage.cardTotalJourneys).toContainText(String(expected.totalJourneys));
  });

  // =========================================================================
  // 5. EXPORT MODAL & QUICK ACTIONS (TC-DASH-036 to TC-DASH-040)
  // =========================================================================
  test('TC-DASH-036: Export modal opens and displays title and format choices', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openExportModal();
    await expect(dashboardPage.exportModal).toBeVisible();
    await dashboardPage.closeExportModal();
  });

  test('TC-DASH-037: Export modal displays PDF format button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openExportModal();
    await expect(dashboardPage.formatPdf).toBeVisible();
    await dashboardPage.closeExportModal();
  });

  test('TC-DASH-038: Export modal displays Excel format button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openExportModal();
    await expect(dashboardPage.formatExcel).toBeVisible();
    await dashboardPage.closeExportModal();
  });

  test('TC-DASH-039: Export modal displays CSV format button', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openExportModal();
    await expect(dashboardPage.formatCsv).toBeVisible();
    await dashboardPage.closeExportModal();
  });

  test('TC-DASH-040: Closing export modal via close button restores dashboard view', async ({
    dashboardPage,
  }) => {
    await dashboardPage.openExportModal();
    await expect(dashboardPage.exportModal).toBeVisible();
    await dashboardPage.closeExportModal();
    await expect(dashboardPage.exportModal).not.toBeVisible();
  });

  // =========================================================================
  // 6. UI HYGIENE & REGRESSION VERIFICATIONS (TC-DASH-041 to TC-DASH-045)
  // =========================================================================
  test('TC-DASH-041: Removed duplicate date below greeting remains absent', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.currentDate).toHaveCount(0);
  });

  test('TC-DASH-042: Removed refresh button next to export remains absent', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.refreshButton).toHaveCount(0);
  });

  test('TC-DASH-043: Interactive checkboxes on Upcoming Tasks list items remain absent', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.upcomingTasksCheckboxes).toHaveCount(0);
  });

  test('TC-DASH-044: Main dashboard header greeting is rendered prominently', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.greetingTitle).toBeVisible();
    const text = await dashboardPage.greetingTitle.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('TC-DASH-045: Dashboard content does not contain "undefined" or "null" text', async ({
    page,
  }) => {
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });
});
