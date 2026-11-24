import { Page, Locator, expect } from '@playwright/test';
import { IndexSelectors } from '../../selectors';

export class SidebarComponent {
  readonly selectors = new IndexSelectors();

  readonly sidebarContainer: Locator;
  readonly collapseToggleBtn: Locator;
  readonly navDashboard: Locator;
  readonly navJourneys: Locator;
  readonly navNotes: Locator;
  readonly navTasks: Locator;
  readonly navTracker: Locator;
  readonly copilotBtn: Locator;
  readonly userSettingsBtn: Locator;
  readonly userDisplayName: Locator;
  readonly signOutBtn: Locator;
  readonly copilotDrawer: Locator;
  readonly closeCopilotBtn: Locator;
  readonly pageHeader: Locator;

  // Sign out modal locators
  readonly confirmLogoutModal: Locator;
  readonly cancelLogoutBtn: Locator;
  readonly confirmLogoutBtn: Locator;

  constructor(readonly page: Page) {
    const s = this.selectors.sidebarNavigation;
    const aside = page.locator(s.sidebarContainer).first();
    this.sidebarContainer = aside;
    this.collapseToggleBtn = aside.locator(s.collapseToggleBtn).first();
    this.navDashboard = aside.locator(s.navDashboard).first();
    this.navJourneys = aside.locator(s.navJourneys).first();
    this.navNotes = aside.locator(s.navNotes).first();
    this.navTasks = aside.locator(s.navTasks).first();
    this.navTracker = aside.locator(s.navTracker).first();
    this.copilotBtn = aside.locator(s.copilotBtn).first();
    this.userSettingsBtn = aside.locator(s.userSettingsBtn).first();
    this.userDisplayName = aside.locator(s.userDisplayName).first();
    this.signOutBtn = aside.locator(s.signOutBtn).first();
    this.copilotDrawer = page.locator(s.copilotDrawer).first();
    this.closeCopilotBtn = page.locator(s.closeCopilotBtn).first();
    this.pageHeader = page.locator(s.pageHeader).first();

    // Logout confirmation modal
    const cf = this.selectors.commonFlow;
    this.confirmLogoutModal = page.locator(cf.logoutModal).first();
    this.cancelLogoutBtn = page.locator(cf.logoutCancelBtn).first();
    this.confirmLogoutBtn = page.locator(cf.logoutConfirmBtn).first();
  }

  async navigateTo(tab: 'dashboard' | 'journeys' | 'notes' | 'tasks' | 'tracker' | 'settings') {
    switch (tab) {
      case 'dashboard':
        await this.navDashboard.click();
        break;
      case 'journeys':
        await this.navJourneys.click();
        break;
      case 'notes':
        await this.navNotes.click();
        break;
      case 'tasks':
        await this.navTasks.click();
        break;
      case 'tracker':
        await this.navTracker.click();
        break;
      case 'settings':
        await this.userSettingsBtn.click();
        break;
    }
  }

  async toggleCollapse() {
    await this.collapseToggleBtn.click();
  }

  async openCopilot() {
    await this.copilotBtn.click();
  }

  async closeCopilot() {
    if (await this.closeCopilotBtn.isVisible()) {
      await this.closeCopilotBtn.click();
    }
  }

  async clickSignOut() {
    await this.signOutBtn.click();
  }

  async confirmSignOut() {
    await this.confirmLogoutBtn.click();
  }

  async cancelSignOut() {
    await this.cancelLogoutBtn.click();
  }

  async verifyActiveTab(tabLabel: string) {
    const activeItem = this.page.locator(`aside button:has-text("${tabLabel}")`);
    await expect(activeItem).toBeVisible();
    await expect(activeItem).toHaveClass(/bg-|text-|active/);
  }
}
