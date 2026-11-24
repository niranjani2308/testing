import { Page, Locator, expect } from '@playwright/test';
import { IndexSelectors } from '../selectors';
import { SidebarComponent } from './components/sidebar.component';

export class NotesPage {
  readonly selectors = new IndexSelectors();
  readonly sidebar: SidebarComponent;

  readonly pageTitle: Locator;
  readonly newNoteBtn: Locator;
  readonly searchInput: Locator;
  readonly activeTab: Locator;
  readonly archivedTab: Locator;
  readonly noteCards: Locator;
  readonly noteTitles: Locator;
  readonly noNotesFound: Locator;

  // Note Modal
  readonly noteModal: Locator;
  readonly titleInput: Locator;
  readonly contentArea: Locator;
  readonly tagInput: Locator;
  readonly addTagBtn: Locator;
  readonly pinToggle: Locator;
  readonly submitBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(readonly page: Page) {
    const s = this.selectors.notesSection;
    this.pageTitle = page.locator(s.pageTitle).first();
    this.newNoteBtn = page.locator(s.newNoteBtn).first();
    this.searchInput = page.locator(s.searchInput).first();
    this.activeTab = page.locator(s.activeTab).first();
    this.archivedTab = page.locator(s.archivedTab).first();
    this.noteCards = page.locator(s.noteCard);
    this.noteTitles = page.locator(s.noteCard).locator(s.noteTitle);
    this.noNotesFound = page.locator(s.noNotesFound).first();

    const m = this.selectors.noteModal;
    this.noteModal = page.locator(m.modal).first();
    this.titleInput = page.locator(m.titleInput).first();
    this.contentArea = page.locator(m.contentArea).first();
    this.tagInput = page.locator(m.tagInput).first();
    this.addTagBtn = page.locator(m.addTagBtn).first();
    this.pinToggle = page.locator(m.pinToggle).first();
    this.submitBtn = page.locator(m.submitBtn).first();
    this.cancelBtn = page.locator(m.cancelBtn).first();
    this.sidebar = new SidebarComponent(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.sidebar.navigateTo('notes');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async createNote(data: { title: string; content: string; tags?: string[]; isPinned?: boolean }) {
    await this.newNoteBtn.click();
    await expect(this.noteModal).toBeVisible();
    await this.titleInput.fill(data.title);
    await this.contentArea.fill(data.content);

    if (data.tags && data.tags.length > 0) {
      const tagToggle = this.page.locator(this.selectors.noteModal.tagToggleBtn).first();
      if (await tagToggle.isVisible()) {
        await tagToggle.click();
      }
      for (const t of data.tags) {
        await this.tagInput.fill(t);
        await this.addTagBtn.click();
      }
    }

    if (data.isPinned) {
      await this.pinToggle.click();
    }

    await this.submitBtn.click();
    await expect(this.noteModal).not.toBeVisible();
  }

  async switchTab(tab: 'active' | 'archived') {
    if (tab === 'active') {
      await this.activeTab.click();
    } else {
      await this.archivedTab.click();
    }
  }

  async searchNotes(query: string) {
    await this.searchInput.fill(query);
  }

  async pinNote(noteTitle: string) {
    const card = this.noteCards.filter({ hasText: noteTitle }).first();
    await card.locator(this.selectors.notesSection.pinNoteBtn).first().click();
  }

  async archiveNote(noteTitle: string) {
    const card = this.noteCards.filter({ hasText: noteTitle }).first();
    await card.locator(this.selectors.notesSection.archiveNoteBtn).first().click();
  }

  async unarchiveNote(noteTitle: string) {
    const card = this.noteCards.filter({ hasText: noteTitle }).first();
    await card.locator(this.selectors.notesSection.archiveNoteBtn).first().click();
  }

  async deleteNote(noteTitle: string) {
    const card = this.noteCards.filter({ hasText: noteTitle }).first();
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await card.locator(this.selectors.notesSection.deleteNoteBtn).first().click();
  }

  getNoteCard(title?: string): Locator {
    return this.page.locator(this.selectors.getNoteCardXPath(title));
  }
}
