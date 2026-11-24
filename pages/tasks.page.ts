import { Page, Locator, expect } from '@playwright/test';
import { IndexSelectors } from '../selectors';
import { SidebarComponent } from './components/sidebar.component';

export class TasksPage {
  readonly selectors = new IndexSelectors();
  readonly sidebar: SidebarComponent;

  readonly todayTab: Locator;
  readonly myPlansTab: Locator;
  readonly newManualTaskBtn: Locator;
  readonly aiPlanGeneratorBtn: Locator;
  readonly searchInput: Locator;

  // Filter Pills
  readonly filterAll: Locator;
  readonly filterPending: Locator;
  readonly filterInProgress: Locator;
  readonly filterOverdue: Locator;
  readonly filterCompleted: Locator;

  // Task Cards
  readonly taskCards: Locator;
  readonly allScheduledDatesBtn: Locator;
  readonly planCards: Locator;
  readonly planAiBtn: Locator;

  // Manual Task Modal
  readonly manualTaskModal: Locator;
  readonly modalTitleInput: Locator;
  readonly modalDescriptionInput: Locator;
  readonly modalDateInput: Locator;
  readonly modalPrioritySelect: Locator;
  readonly modalStatusSelect: Locator;
  readonly modalSubmitBtn: Locator;
  readonly modalCancelBtn: Locator;

  // AI Plan Generator Modal
  readonly aiPlanModal: Locator;
  readonly aiDescriptionInput: Locator;
  readonly aiStartDateInput: Locator;
  readonly aiDeadlineInput: Locator;
  readonly aiContinueBtn: Locator;
  readonly aiClarificationInput: Locator;
  readonly aiGeneratePlanBtn: Locator;
  readonly aiPlanPreviewModal: Locator;
  readonly aiApprovePlanBtn: Locator;
  readonly aiCancelBtn: Locator;

  constructor(readonly page: Page) {
    const s = this.selectors.taskSection;
    this.todayTab = page.locator(s.todayTab).first();
    this.myPlansTab = page.locator(s.myPlansTab).first();
    this.newManualTaskBtn = page.locator(s.newManualTaskBtn).first();
    this.aiPlanGeneratorBtn = page.locator(s.aiPlanGeneratorBtn).first();
    this.searchInput = page.locator(s.searchInput).first();

    this.filterAll = page.locator(s.filterAll).first();
    this.filterPending = page.locator(s.filterPending).first();
    this.filterInProgress = page.locator(s.filterInProgress).first();
    this.filterOverdue = page.locator(s.filterOverdue).first();
    this.filterCompleted = page.locator(s.filterCompleted).first();

    this.taskCards = page.locator(s.taskCard);
    this.allScheduledDatesBtn = page.locator(s.allDatesFilter).first();
    this.planCards = page.locator(s.planCard);
    this.planAiBtn = page.locator(s.aiPlanGeneratorBtn).first();

    const m = this.selectors.manualTaskModal;
    this.manualTaskModal = page.locator(m.modal).first();
    this.modalTitleInput = page.locator(m.titleInput).first();
    this.modalDescriptionInput = page.locator(m.descriptionInput).first();
    this.modalDateInput = page.locator(m.dateInput).first();
    this.modalPrioritySelect = page.locator(m.prioritySelect).first();
    this.modalStatusSelect = page.locator(m.statusSelect).first();
    this.modalSubmitBtn = page.locator(m.submitBtn).first();
    this.modalCancelBtn = page.locator(m.cancelBtn).first();

    const a = this.selectors.aiPlanSection;
    this.aiPlanModal = page.locator(a.modal).first();
    this.aiDescriptionInput = page.locator(a.descriptionInput).first();
    this.aiStartDateInput = page.locator(a.startDateInput).first();
    this.aiDeadlineInput = page.locator(a.deadlineInput).first();
    this.aiContinueBtn = page.locator(a.continueBtn).first();
    this.aiClarificationInput = page.locator(a.clarificationInput).first();
    this.aiGeneratePlanBtn = page.locator(a.generatePlanBtn).first();
    this.aiPlanPreviewModal = page.locator(a.previewModal).first();
    this.aiApprovePlanBtn = page.locator(a.approvePlanBtn).first();
    this.aiCancelBtn = this.aiPlanModal.locator('//button[normalize-space()="Cancel"]').first();
    this.sidebar = new SidebarComponent(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.sidebar.navigateTo('tasks');
    await expect(this.todayTab).toBeVisible({ timeout: 10000 });
  }

  async switchToAllDates() {
    if (await this.allScheduledDatesBtn.isVisible()) {
      await this.allScheduledDatesBtn.click();
    }
  }

  async openAiPlanGenerator() {
    await this.planAiBtn.click();
    await expect(this.aiPlanModal).toBeVisible();
  }

  async cancelAiPlanGenerator() {
    await this.aiCancelBtn.click();
    await expect(this.aiPlanModal).not.toBeVisible();
  }

  getTaskCard(title?: string): Locator {
    return this.page.locator(this.selectors.getTaskCardXPath(title));
  }

  getPlanCard(title?: string): Locator {
    return this.page.locator(this.selectors.getPlanCardXPath(title));
  }

  async createManualTask(data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    status?: string;
  }) {
    await this.newManualTaskBtn.click();
    await expect(this.manualTaskModal).toBeVisible();
    await this.modalTitleInput.fill(data.title);

    if (data.description) {
      await this.modalDescriptionInput.fill(data.description);
    }
    if (data.dueDate) {
      await this.modalDateInput.fill(data.dueDate);
    }
    if (data.status) {
      await this.manualTaskModal.locator(this.selectors.manualTaskModal.statusSelect).first().selectOption(data.status);
    }
    if (data.priority) {
      const advancedBtn = this.manualTaskModal.locator(".//button[contains(., 'Advanced Options')]");
      if (await advancedBtn.isVisible()) {
        await advancedBtn.click();
      }
      await this.manualTaskModal.locator(this.selectors.manualTaskModal.prioritySelect).nth(1).selectOption(data.priority);
    }

    await this.modalSubmitBtn.click();
    await expect(this.manualTaskModal).not.toBeVisible();
  }

  async filterByStatus(status: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED') {
    switch (status) {
      case 'ALL':
        await this.filterAll.click();
        break;
      case 'PENDING':
        await this.filterPending.click();
        break;
      case 'IN_PROGRESS':
        await this.filterInProgress.click();
        break;
      case 'OVERDUE':
        await this.filterOverdue.click();
        break;
      case 'COMPLETED':
        await this.filterCompleted.click();
        break;
    }
  }

  async updateTaskStatus(taskTitle: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    const card = this.taskCards.filter({ hasText: taskTitle }).first();
    const statusSelect = card.locator(".//select");
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption(newStatus);
    } else {
      await card.locator(this.selectors.taskSection.statusCheckbox).first().click();
    }
  }

  async deleteTask(taskTitle: string) {
    const card = this.taskCards.filter({ hasText: taskTitle }).first();
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await card.locator(this.selectors.taskSection.deleteTaskBtn).first().click();
  }
}
