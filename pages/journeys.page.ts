import { Page, Locator, expect } from '@playwright/test';
import { IndexSelectors } from '../selectors';
import { SidebarComponent } from './components/sidebar.component';
import { seededDataFixtureInstance } from '../fixtures/seed-data/seed-data.fixture';

export class JourneysPage {
  readonly selectors = new IndexSelectors();
  readonly sidebar: SidebarComponent;

  readonly pageTitle: Locator;
  readonly newJourneyBtn: Locator;
  readonly searchInput: Locator;
  readonly journeyCards: Locator;
  readonly journeyTitles: Locator;
  readonly noJourneysFound: Locator;

  // Create Modal
  readonly createModal: Locator;
  readonly modalTitleInput: Locator;
  readonly modalDescriptionInput: Locator;
  readonly modalSubmitBtn: Locator;
  readonly modalCancelBtn: Locator;

  // Edit Modal
  readonly editModal: Locator;
  readonly editTitleInput: Locator;
  readonly editDescriptionInput: Locator;
  readonly editSubmitBtn: Locator;

  // Timeline / Workspace
  readonly backToJourneysBtn: Locator;
  readonly workspaceTitle: Locator;
  readonly newDailyNoteBtn: Locator;
  readonly dailyNoteCards: Locator;

  constructor(readonly page: Page) {
    const s = this.selectors.journeySection;
    this.pageTitle = page.locator(s.pageTitle).first();
    this.newJourneyBtn = page.locator(s.newJourneyBtn).first();
    this.searchInput = page.locator(s.searchInput).first();
    this.journeyCards = page.locator(s.journeyCard);
    this.journeyTitles = page.locator(s.journeyCard).locator(s.journeyTitle);
    this.noJourneysFound = page.locator(s.noJourneysFound).first();

    const m = this.selectors.createJourneyModal;
    this.createModal = page.locator(m.modal).first();
    this.modalTitleInput = page.locator(m.titleInput).first();
    this.modalDescriptionInput = page.locator(m.descriptionTextarea).first();
    this.modalSubmitBtn = page.locator(m.submitBtn).first();
    this.modalCancelBtn = page.locator(m.cancelBtn).first();

    const e = this.selectors.editJourneyModal;
    this.editModal = page.locator(e.modal).first();
    this.editTitleInput = page.locator(e.titleInput).first();
    this.editDescriptionInput = page.locator(e.descriptionTextarea).first();
    this.editSubmitBtn = page.locator(e.submitBtn).first();

    const w = this.selectors.journeyWorkspace;
    this.backToJourneysBtn = page.locator(w.backBtn).first();
    this.workspaceTitle = page.locator(w.workspaceTitle).first();
    this.newDailyNoteBtn = page.locator(w.newDailyNoteBtn).first();
    this.dailyNoteCards = page.locator(w.dailyNoteCard);
    this.sidebar = new SidebarComponent(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.sidebar.navigateTo('journeys');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  /**
   * Creates a new Journey. If name/desc are omitted, obtains sample journey data from fixtures.
   */
  async createJourney(name?: string, description?: string) {
    const fallback = seededDataFixtureInstance.getSampleJourneyData();
    const journeyName = name !== undefined ? name : fallback.name;
    const journeyDesc = description !== undefined ? description : fallback.description;

    await this.newJourneyBtn.click();
    await expect(this.createModal).toBeVisible();
    await this.modalTitleInput.fill(journeyName);
    if (journeyDesc) {
      await this.modalDescriptionInput.fill(journeyDesc);
    }
    await this.modalSubmitBtn.click();
  }

  async searchJourney(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  async openJourneyWorkspace(journeyName?: string) {
    const card = journeyName
      ? this.journeyCards.filter({ hasText: journeyName }).first()
      : this.journeyCards.first();
    await card.locator(this.selectors.journeySection.openTimelineLink).first().click();
  }

  async backToJourneys() {
    await this.backToJourneysBtn.click();
    await expect(this.pageTitle).toBeVisible();
  }

  async editJourney(oldName: string, newName?: string, newDesc?: string) {
    const card = this.journeyCards.filter({ hasText: oldName }).first();
    await card.locator(this.selectors.journeySection.editJourneyBtn).first().click();
    await expect(this.editModal).toBeVisible();
    const title = newName !== undefined ? newName : `${oldName} Updated`;
    await this.editTitleInput.fill(title);
    if (newDesc !== undefined) {
      await this.editDescriptionInput.fill(newDesc);
    }
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await this.editSubmitBtn.click();
    await expect(this.editModal).not.toBeVisible();
  }

  async deleteJourney(journeyName: string) {
    const card = this.journeyCards.filter({ hasText: journeyName }).first();
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await card.locator(this.selectors.journeySection.deleteJourneyBtn).first().click();
  }

  /**
   * Seeds a journey via backend REST API using data from fixtures.
   */
  async seedJourneyViaApi(journeyData = seededDataFixtureInstance.getSampleJourneyData()) {
    try {
      const res = await this.page.request.post('/api/journeys', {
        data: {
          name: journeyData.name,
          description: journeyData.description,
        },
      });
      if (res.ok()) {
        return await res.json();
      }
    } catch (err) {
      console.log('ℹ️ [API SEED] Journey API seeding handled cleanly:', err);
    }
    return null;
  }

  getJourneyCard(title?: string): Locator {
    return this.page.locator(this.selectors.getJourneyCardXPath(title));
  }
}
