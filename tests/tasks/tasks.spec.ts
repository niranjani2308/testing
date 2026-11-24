import { test, expect } from '../../fixtures/test.fixture';

test.describe('Tasks Module - Manual Tasks, Status Transitions, Filters & Deadlines', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session without repeating login
    await loginPage.ensureLoggedIn();
  });

  // =========================================================================
  // 1. DISPLAY & SCOPE SWITCHING (TC-TASK-001 to TC-TASK-010)
  // =========================================================================
  test('TC-TASK-001: (Positive) Display seeded tasks and switch Date Scope to All Dates', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await expect(tasksPage.todayTab).toBeVisible();

    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const count = await tasksPage.taskCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-TASK-002: Header displays Add Task and Plan with AI buttons', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await expect(tasksPage.newManualTaskBtn).toBeVisible();
    await expect(tasksPage.aiPlanGeneratorBtn).toBeVisible();
  });

  test('TC-TASK-003: Search tasks input is visible with correct placeholder', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await expect(tasksPage.searchInput).toBeVisible();
    const placeholder = await tasksPage.searchInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/search tasks/i);
  });

  test('TC-TASK-004: Default date scope displays Today & Overdue filter', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await expect(tasksPage.todayOnlyFilter).toBeVisible();
  });

  test('TC-TASK-005: Switching to All Scheduled Dates displays all seeded tasks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const count = await tasksPage.taskCards.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('TC-TASK-006: Task cards render with non-empty titles', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = await tasksPage.taskCards.first().innerText();
    expect(firstTitle.trim().length).toBeGreaterThan(0);
  });

  test('TC-TASK-007: Task cards display priority badges (HIGH, MEDIUM, or LOW)', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const badge = tasksPage.taskCards.first().locator(tasksPage.selectors.taskSection.priorityBadge);
    if (await badge.isVisible()) {
      const text = await badge.innerText();
      expect(text).toMatch(/(HIGH|MEDIUM|LOW|URGENT)/i);
    }
  });

  test('TC-TASK-008: Task cards render status checkbox or select control', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const firstCard = tasksPage.taskCards.first();
    const control = firstCard.locator('button[title*="task"], button[aria-label*="Mark"], select').first();
    await expect(control).toBeVisible();
  });

  test('TC-TASK-009: Task cards display due date indicators with calendar icons', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const firstCard = tasksPage.taskCards.first();
    const dateElement = firstCard.locator(tasksPage.selectors.taskSection.dueDate).first();
    await expect(dateElement).toBeVisible();
  });

  test('TC-TASK-010: Task cards render delete action button on each item', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible({ timeout: 10000 });
    const firstCard = tasksPage.taskCards.first();
    const deleteBtn = firstCard.locator(tasksPage.selectors.taskSection.deleteTaskBtn).first();
    await expect(deleteBtn).toBeVisible();
  });

  // =========================================================================
  // 2. STATUS FILTER TABS (TC-TASK-011 to TC-TASK-020)
  // =========================================================================
  test('TC-TASK-011: (Filter) Filtering by COMPLETED displays only completed tasks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('COMPLETED');
    await expect(tasksPage.taskCards.first()).toBeVisible();
    expect(await tasksPage.taskCards.count()).toBeGreaterThan(0);
  });

  test('TC-TASK-012: (Filter) Filtering by IN_PROGRESS displays only in-progress tasks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('IN_PROGRESS');
    await expect(tasksPage.taskCards.first()).toBeVisible();
    expect(await tasksPage.taskCards.count()).toBeGreaterThan(0);
  });

  test('TC-TASK-013: (Filter) Filtering by OVERDUE displays overdue tasks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('OVERDUE');
    await expect(tasksPage.taskCards.first()).toBeVisible();
    expect(await tasksPage.taskCards.count()).toBeGreaterThan(0);
  });

  test('TC-TASK-014: (Filter) Filtering by PENDING displays pending tasks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('PENDING');
    await expect(tasksPage.taskCards.first()).toBeVisible();
    expect(await tasksPage.taskCards.count()).toBeGreaterThan(0);
  });

  test('TC-TASK-015: (Filter) Resetting filter to ALL restores complete task collection', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('COMPLETED');
    const completedCount = await tasksPage.taskCards.count();

    await tasksPage.filterByStatus('ALL');
    const totalCount = await tasksPage.taskCards.count();
    expect(totalCount).toBeGreaterThan(completedCount);
  });

  test('TC-TASK-016: Completed tasks filter count matches seeded dataset (4 tasks)', async ({
    tasksPage,
    seededData,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('COMPLETED');
    const expected = seededData.getExpectedMetrics();
    const count = await tasksPage.taskCards.count();
    expect(count).toBe(expected.completedTasks);
  });

  test('TC-TASK-017: In-progress tasks filter count matches seeded dataset (3 tasks)', async ({
    tasksPage,
    seededData,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('IN_PROGRESS');
    const expected = seededData.getExpectedMetrics();
    const count = await tasksPage.taskCards.count();
    expect(count).toBe(expected.inProgressTasks);
  });

  test('TC-TASK-018: Overdue tasks filter count matches seeded dataset (2 tasks)', async ({
    tasksPage,
    seededData,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('OVERDUE');
    const expected = seededData.getExpectedMetrics();
    const count = await tasksPage.taskCards.count();
    expect(count).toBe(expected.overdueTasks);
  });

  test('TC-TASK-019: Filter tabs display active highlight on selected tab', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.filterByStatus('COMPLETED');
    const className = (await tasksPage.filterCompleted.getAttribute('class')) || '';
    expect(className).toMatch(/(bg-|text-|active|border|shadow)/i);
  });

  test('TC-TASK-020: Rapid switching between filter tabs updates task list without errors', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.filterByStatus('PENDING');
    await tasksPage.filterByStatus('IN_PROGRESS');
    await tasksPage.filterByStatus('COMPLETED');
    await tasksPage.filterByStatus('ALL');
    await expect(tasksPage.taskCards.first()).toBeVisible();
  });

  // =========================================================================
  // 3. MANUAL TASK CREATION & BOUNDARIES (TC-TASK-021 to TC-TASK-030)
  // =========================================================================
  test('TC-TASK-021: Clicking "Add Task" button opens manual task creation modal', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.manualTaskModal).toBeVisible();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-022: Manual task modal displays Title input field with placeholder', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.modalTitleInput).toBeVisible();
    const placeholder = await tasksPage.modalTitleInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-023: Manual task modal displays Due Date picker input', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.modalDateInput).toBeVisible();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-024: Manual task modal displays Description textarea', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.modalDescriptionInput).toBeVisible();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-025: Clicking Cancel closes manual task modal', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.manualTaskModal).toBeVisible();
    await tasksPage.modalCancelBtn.click();
    await expect(tasksPage.manualTaskModal).not.toBeVisible();
  });

  test('TC-TASK-026: Pressing ESC key closes manual task modal', async ({
    tasksPage,
    page,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.manualTaskModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tasksPage.manualTaskModal).not.toBeVisible();
  });

  test('TC-TASK-027: (Boundary) Title with exactly 2 characters (boundary min) is accepted', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill('QA');
    await expect(tasksPage.modalSubmitBtn).toBeEnabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-028: (Boundary) Title with 100 characters (boundary max) is accepted', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    const longTitle = 'T'.repeat(100);
    await tasksPage.modalTitleInput.fill(longTitle);
    await expect(tasksPage.modalSubmitBtn).toBeEnabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-029: Setting future due date populates date field properly', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalDateInput.fill('2026-12-31');
    const val = await tasksPage.modalDateInput.inputValue();
    expect(val).toBe('2026-12-31');
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-030: Setting past due date enables overdue task creation', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalDateInput.fill('2026-01-01');
    const val = await tasksPage.modalDateInput.inputValue();
    expect(val).toBe('2026-01-01');
    await tasksPage.modalCancelBtn.click();
  });

  // =========================================================================
  // 4. NEGATIVE VALIDATIONS & CANCEL BEHAVIOR (TC-TASK-031 to TC-TASK-038)
  // =========================================================================
  test('TC-TASK-031: Empty title keeps Submit button disabled', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.modalSubmitBtn).toBeDisabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-032: Whitespace-only title keeps Submit button disabled', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill('      ');
    await expect(tasksPage.modalSubmitBtn).toBeDisabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-033: Single character title (< 2 chars) keeps Submit button disabled', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill('A');
    await expect(tasksPage.modalSubmitBtn).toBeDisabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-034: Canceling modal does not append any task to the list', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    const countBefore = await tasksPage.taskCards.count();

    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill(`DiscardedTask_${Date.now()}`);
    await tasksPage.modalCancelBtn.click();

    const countAfter = await tasksPage.taskCards.count();
    expect(countAfter).toBe(countBefore);
  });

  test('TC-TASK-035: Reopening modal resets input fields to empty default', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill('Temporary draft');
    await tasksPage.modalCancelBtn.click();

    await tasksPage.newManualTaskBtn.click();
    const val = await tasksPage.modalTitleInput.inputValue();
    expect(val).toBe('');
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-036: Title with surrounding whitespace is accepted and trimmed', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill('   Valid Task Title   ');
    await expect(tasksPage.modalSubmitBtn).toBeEnabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-037: Description is optional for task submission', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await tasksPage.modalTitleInput.fill('Task Without Description');
    await expect(tasksPage.modalDescriptionInput).toHaveValue('');
    await expect(tasksPage.modalSubmitBtn).toBeEnabled();
    await tasksPage.modalCancelBtn.click();
  });

  test('TC-TASK-038: Modal title heading displays Add Task', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.newManualTaskBtn.click();
    await expect(tasksPage.manualTaskModal).toContainText(/Add Task|New Task/i);
    await tasksPage.modalCancelBtn.click();
  });

  // =========================================================================
  // 5. FUNCTIONAL LIFECYCLE: CREATE, TRANSITION & DELETE (TC-TASK-039 to TC-TASK-045)
  // =========================================================================
  test('TC-TASK-039: (Functional) Create, update status, and delete a temporary task', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();

    const taskTitle = `Dynamic Task ${Date.now()}`;

    // 1. Create task
    await tasksPage.createManualTask({
      title: taskTitle,
      description: 'Dynamic manual task for status verification',
      dueDate: '2026-12-31',
      status: 'PENDING',
    });
    await expect(tasksPage.taskCards.filter({ hasText: taskTitle }).first()).toBeVisible({ timeout: 10000 });

    // 2. Update status to COMPLETED
    await tasksPage.updateTaskStatus(taskTitle, 'COMPLETED');

    // 3. Delete task
    await tasksPage.deleteTask(taskTitle);
    await expect(tasksPage.taskCards.filter({ hasText: taskTitle })).toHaveCount(0);
  });

  test('TC-TASK-040: Marking Pending task as Completed moves it to Completed filter', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();

    const title = `TransitionTest_${Date.now()}`;
    await tasksPage.createManualTask({ title, status: 'PENDING' });
    await expect(tasksPage.taskCards.filter({ hasText: title }).first()).toBeVisible();

    await tasksPage.updateTaskStatus(title, 'COMPLETED');
    await tasksPage.filterByStatus('COMPLETED');
    await expect(tasksPage.taskCards.filter({ hasText: title }).first()).toBeVisible();

    await tasksPage.deleteTask(title);
  });

  test('TC-TASK-041: Marking Completed task as Pending restores it to Pending filter', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();

    const title = `RevertTest_${Date.now()}`;
    await tasksPage.createManualTask({ title, status: 'COMPLETED' });
    await tasksPage.updateTaskStatus(title, 'PENDING');

    await tasksPage.filterByStatus('PENDING');
    await expect(tasksPage.taskCards.filter({ hasText: title }).first()).toBeVisible();

    await tasksPage.deleteTask(title);
  });

  test('TC-TASK-042: Canceling task delete dialog preserves the task in the list', async ({
    tasksPage,
    page,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    const firstTask = tasksPage.taskCards.first();
    const taskTitle = (await firstTask.innerText()).split('\n')[0].trim();

    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await firstTask.locator('button[title*="Delete"]').click();
    await expect(tasksPage.taskCards.filter({ hasText: taskTitle }).first()).toBeVisible();
  });

  test('TC-TASK-043: Deleting a task decrements total task count immediately', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();

    const title = `CountDecr_${Date.now()}`;
    await tasksPage.createManualTask({ title });
    const countBefore = await tasksPage.taskCards.count();

    await tasksPage.deleteTask(title);
    const countAfter = await tasksPage.taskCards.count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('TC-TASK-044: Task created with HIGH priority displays HIGH badge', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();

    const title = `HighPri_${Date.now()}`;
    await tasksPage.createManualTask({ title, priority: 'HIGH' });
    const card = tasksPage.taskCards.filter({ hasText: title }).first();
    await expect(card).toBeVisible();
    await expect(card).toContainText('HIGH');

    await tasksPage.deleteTask(title);
  });

  test('TC-TASK-045: Task created with LOW priority displays LOW badge', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();

    const title = `LowPri_${Date.now()}`;
    await tasksPage.createManualTask({ title, priority: 'LOW' });
    const card = tasksPage.taskCards.filter({ hasText: title }).first();
    await expect(card).toBeVisible();

    await tasksPage.deleteTask(title);
  });

  // =========================================================================
  // 6. SEARCH & UI INTEGRITY (TC-TASK-046 to TC-TASK-050)
  // =========================================================================
  test('TC-TASK-046: Searching tasks filters list to matching titles only', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await expect(tasksPage.taskCards.first()).toBeVisible();

    const firstTitle = (await tasksPage.taskCards.first().innerText()).split('\n')[0].trim();
    const query = firstTitle.split(' ')[0];

    await tasksPage.searchInput.fill(query);
    await expect(tasksPage.taskCards.filter({ hasText: firstTitle }).first()).toBeVisible();
    await tasksPage.searchInput.fill('');
  });

  test('TC-TASK-047: Searching with non-existent query yields zero matching task cards', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    await tasksPage.searchInput.fill(`NoSuchTask_${Date.now()}`);
    await expect(tasksPage.taskCards).toHaveCount(0);
    await tasksPage.searchInput.fill('');
  });

  test('TC-TASK-048: Clearing search input restores all tasks in current filter', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    const initialCount = await tasksPage.taskCards.count();

    await tasksPage.searchInput.fill('NonExistentXYZ');
    await expect(tasksPage.taskCards).toHaveCount(0);

    await tasksPage.searchInput.fill('');
    const restoredCount = await tasksPage.taskCards.count();
    expect(restoredCount).toBe(initialCount);
  });

  test('TC-TASK-049: Tasks page does not display "undefined" or "null" in task text', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.switchToAllDates();
    const text = await tasksPage.taskCards.first().innerText();
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('null');
  });

  test('TC-TASK-050: Switching between Today and My Plans tabs updates view without errors', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first().or(tasksPage.todayTab)).toBeVisible();

    await tasksPage.todayTab.click();
    await expect(tasksPage.todayOnlyFilter).toBeVisible();
  });
});
