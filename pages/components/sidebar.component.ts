import type { Page } from '@playwright/test';

export class SidebarComponent {
  constructor(readonly page: Page) {}
}
