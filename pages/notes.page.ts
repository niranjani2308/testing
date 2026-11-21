import type { Page } from '@playwright/test';

export class NotesPage {
  constructor(readonly page: Page) {}
}
