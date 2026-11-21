import type { Page } from '@playwright/test';

export class TrackerPage {
  constructor(readonly page: Page) {}
}
