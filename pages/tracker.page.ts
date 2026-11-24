import { Page, Locator, expect } from '@playwright/test';
import { IndexSelectors } from '../selectors';
import { SidebarComponent } from './components/sidebar.component';

export class TrackerPage {
  readonly selectors = new IndexSelectors();
  readonly sidebar: SidebarComponent;

  readonly pageTitle: Locator;
  readonly journeyTab: Locator;
  readonly tasksTab: Locator;
  readonly journeySearchInput: Locator;
  readonly taskSearchInput: Locator;
  readonly backToSearchResultsBtn: Locator;
  readonly firstCardItem: Locator;

  // Journey Progress Locators
  readonly metricTotalDailyNotes: Locator;
  readonly metricDaysWithUpdates: Locator;
  readonly metricLastUpdatedDate: Locator;
  readonly dailyTimeline: Locator;

  // Task Plan Progress Locators
  readonly metricTotalTasks: Locator;
  readonly metricCompletedTasks: Locator;
  readonly metricOverdueTasks: Locator;
  readonly progressPercentage: Locator;

  constructor(readonly page: Page) {
    const s = this.selectors.trackerSection;
    this.pageTitle = page.locator(s.pageTitle).first();
    this.journeyTab = page.locator(s.journeyTab).first();
    this.tasksTab = page.locator(s.tasksTab).first();
    this.journeySearchInput = page.locator(s.journeySearchInput).first();
    this.taskSearchInput = page.locator(s.taskSearchInput).first();
    this.backToSearchResultsBtn = page.locator(s.backToSearchResultsBtn).first();
    this.firstCardItem = page.locator(s.firstCardItem).first();

    const jp = this.selectors.journeyProgressSection;
    this.metricTotalDailyNotes = page.locator(jp.metricTotalDailyNotes).first();
    this.metricDaysWithUpdates = page.locator(jp.metricDaysWithUpdates).first();
    this.metricLastUpdatedDate = page.locator(jp.metricLastUpdatedDate).first();
    this.dailyTimeline = page.locator(jp.dailyTimeline).first();

    const tp = this.selectors.taskPlanProgressSection;
    this.metricTotalTasks = page.locator(tp.metricTotalTasks).first();
    this.metricCompletedTasks = page.locator(tp.metricCompletedTasks).first();
    this.metricOverdueTasks = page.locator(tp.metricOverdueTasks).first();
    this.progressPercentage = page.locator(tp.progressPercentage).first();
    this.sidebar = new SidebarComponent(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.sidebar.navigateTo('tracker');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async switchTab(tab: 'journey' | 'tasks') {
    if (tab === 'journey') {
      await this.journeyTab.click();
    } else {
      await this.tasksTab.click();
    }
  }

  async searchJourney(query: string) {
    await this.journeySearchInput.fill(query);
  }

  async selectJourney(name?: string) {
    const item = this.page.locator(this.selectors.getTrackerItemCardXPath(name)).first();
    await item.click();
  }

  async searchPlan(query: string) {
    await this.taskSearchInput.fill(query);
  }

  async selectPlan(name?: string) {
    const item = this.page.locator(this.selectors.getTrackerItemCardXPath(name)).first();
    await item.click();
  }

  async backToSearchResults() {
    await this.backToSearchResultsBtn.click();
  }

  getJourneyCard(title?: string): Locator {
    return this.page.locator(this.selectors.getJourneyCardXPath(title));
  }

  getPlanCard(title?: string): Locator {
    return this.page.locator(this.selectors.getPlanCardXPath(title));
  }
}
