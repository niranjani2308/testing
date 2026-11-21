import type { Page } from '@playwright/test';

export class TasksPage {
  constructor(readonly page: Page) {}
}
