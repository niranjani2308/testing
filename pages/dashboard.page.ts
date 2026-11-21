import type { Page } from '@playwright/test';

export class DashboardPage {
  constructor(readonly page: Page) {}
}
