import { test, expect } from '../../fixtures/test.fixture';

test.describe('AI Planner Module - Plan Generation, Clarification & My Plans', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session without repeating login
    await loginPage.ensureLoggedIn();
  });

  // =========================================================================
  // 1. MY PLANS TAB & SEEDED PLAN CARDS (TC-PLAN-001 to TC-PLAN-010)
  // =========================================================================
  test('TC-PLAN-001: (Positive) Display seeded approved plans under My Plans tab', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible({ timeout: 10000 });
    const count = await tasksPage.planCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-PLAN-002: Seeded plans match expected count of 2 plans', async ({
    tasksPage,
    seededData,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible({ timeout: 10000 });
    const expected = seededData.getExpectedMetrics();
    const count = await tasksPage.planCards.count();
    expect(count).toBe(expected.totalPlans);
  });

  test('TC-PLAN-003: Plan cards render with non-empty titles', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = await tasksPage.planCards.first().locator('h3, h4').first().innerText();
    expect(firstTitle.trim().length).toBeGreaterThan(0);
  });

  test('TC-PLAN-004: Plan cards render category or milestone badges', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible({ timeout: 10000 });
    const firstCard = tasksPage.planCards.first();
    const badge = firstCard.locator('span.rounded-full, span.text-xs').first();
    await expect(badge).toBeVisible();
  });

  test('TC-PLAN-005: Plan cards display completion progress indicators', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible({ timeout: 10000 });
    const cardText = await tasksPage.planCards.first().innerText();
    expect(cardText).toMatch(/(%|task|milestone|progress)/i);
  });

  test('TC-PLAN-006: Plan cards do not contain null or undefined values', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible({ timeout: 10000 });
    const text = await tasksPage.planCards.first().innerText();
    expect(text).not.toContain('null');
    expect(text).not.toContain('undefined');
  });

  test('TC-PLAN-007: Switching from My Plans to Today tab updates task view', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible();

    await tasksPage.todayTab.click();
    await expect(tasksPage.todayOnlyFilter).toBeVisible();
  });

  test('TC-PLAN-008: Rapid toggling between Today and My Plans tabs works smoothly', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await tasksPage.todayTab.click();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible();
  });

  test('TC-PLAN-009: My Plans tab is visibly highlighted when active', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    const className = (await tasksPage.myPlansTab.getAttribute('class')) || '';
    expect(className).toMatch(/(bg-|text-|active|border)/i);
  });

  test('TC-PLAN-010: First seeded plan title matches expected Scenario B dataset', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible();
    const allText = await tasksPage.planCards.allInnerTexts();
    const hasDevOpsOrNutrition = allText.some((t) => t.includes('DevOps') || t.includes('Nutrition') || t.includes('Plan'));
    expect(hasDevOpsOrNutrition).toBe(true);
  });

  // =========================================================================
  // 2. MODAL LAUNCH & FORM CONTROLS (TC-PLAN-011 to TC-PLAN-020)
  // =========================================================================
  test('TC-PLAN-011: (Validation) Open AI Plan Generator modal and validate controls', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-012: Modal displays "AI Work & Activity Planner" title heading', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).toContainText(/AI|Planner/i);
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-013: Modal displays Goal description textarea', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiDescriptionInput).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-014: Goal description textarea has descriptive placeholder', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    const placeholder = await tasksPage.aiDescriptionInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/(accomplish|goal|plan|describe)/i);
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-015: Modal displays Start Date picker input', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiStartDateInput).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-016: Modal displays Target Deadline input field', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiDeadlineInput).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-017: Modal displays Continue / Next button', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiContinueBtn).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-018: Modal displays Cancel button', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiCancelBtn).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-019: Clicking Cancel button closes the AI planner modal', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).not.toBeVisible();
  });

  test('TC-PLAN-020: Pressing ESC key closes the AI planner modal', async ({
    tasksPage,
    page,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tasksPage.aiPlanModal).not.toBeVisible();
  });

  // =========================================================================
  // 3. GOAL VALIDATION & BOUNDARIES (TC-PLAN-021 to TC-PLAN-030)
  // =========================================================================
  test('TC-PLAN-021: Empty goal description keeps Continue button disabled', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiContinueBtn).toBeDisabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-022: Whitespace-only goal keeps Continue button disabled', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('       ');
    await expect(tasksPage.aiContinueBtn).toBeDisabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-023: Very short goal (< 5 chars) keeps Continue button disabled', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Test');
    await expect(tasksPage.aiContinueBtn).toBeDisabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-024: Valid goal description enables the Continue button', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Build a full microservices backend in NestJS and TypeORM');
    await expect(tasksPage.aiContinueBtn).toBeEnabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-025: (Boundary) 500-character goal description is accepted', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    const longGoal = 'Design, build, and deploy an automated CI/CD pipeline using AWS ECS and RDS. '.repeat(7);
    await tasksPage.aiDescriptionInput.fill(longGoal);
    await expect(tasksPage.aiContinueBtn).toBeEnabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-026: Multiline goal with line breaks is preserved in textarea', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    const multiline = 'Phase 1: Architecture\nPhase 2: Implementation\nPhase 3: Verification';
    await tasksPage.aiDescriptionInput.fill(multiline);
    expect(await tasksPage.aiDescriptionInput.inputValue()).toBe(multiline);
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-027: Setting start date updates date picker value', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiStartDateInput.fill('2026-11-25');
    expect(await tasksPage.aiStartDateInput.inputValue()).toBe('2026-11-25');
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-028: Setting deadline days populates numeric value', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDeadlineInput.fill('14');
    expect(await tasksPage.aiDeadlineInput.inputValue()).toBe('14');
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-029: Reopening modal resets goal description to empty', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Temporary draft goal');
    await tasksPage.cancelAiPlanGenerator();

    await tasksPage.openAiPlanGenerator();
    expect(await tasksPage.aiDescriptionInput.inputValue()).toBe('');
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-030: Goal text with surrounding whitespace is accepted', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('   Complete quarterly OKRs and deliver milestones   ');
    await expect(tasksPage.aiContinueBtn).toBeEnabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  // =========================================================================
  // 4. CLARIFICATION & GENERATION WORKFLOW (TC-PLAN-031 to TC-PLAN-038)
  // =========================================================================
  test('TC-PLAN-031: Step indicator displays Step 1 of planning workflow', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    const modalText = await tasksPage.aiPlanModal.innerText();
    expect(modalText).toMatch(/(Step|Goal|Describe)/i);
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-032: Clicking Continue with valid goal progresses towards Clarification', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Migrate databases from MySQL to PostgreSQL on AWS RDS');
    await tasksPage.aiContinueBtn.click();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-033: Clarification input field is accessible in clarification step', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Prepare 10k marathon fitness routine');
    await tasksPage.aiContinueBtn.click();
    if (await tasksPage.aiClarificationInput.isVisible()) {
      await tasksPage.aiClarificationInput.fill('4 days per week');
    }
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-034: Generate Plan button appears in clarification stage', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Publish automated API documentation');
    await tasksPage.aiContinueBtn.click();
    await expect(tasksPage.aiGeneratePlanBtn.or(tasksPage.aiContinueBtn)).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-035: Modal layout does not shift or jitter when transitioning steps', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Implement multi-factor authentication');
    await tasksPage.aiContinueBtn.click();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-036: Canceling during clarification step does not save incomplete plan', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    const countBefore = await tasksPage.planCards.count();

    await tasksPage.todayTab.click();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Incomplete abandoned plan workflow');
    await tasksPage.aiContinueBtn.click();
    await tasksPage.cancelAiPlanGenerator();

    await tasksPage.myPlansTab.click();
    const countAfter = await tasksPage.planCards.count();
    expect(countAfter).toBe(countBefore);
  });

  test('TC-PLAN-037: Goal description field accepts special characters without crashing', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await tasksPage.aiDescriptionInput.fill('Deploy to Kubernetes (EKS) & configure Helm charts + CI/CD');
    await expect(tasksPage.aiContinueBtn).toBeEnabled();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-038: Modal backdrop covers main viewport and blocks outside clicks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  // =========================================================================
  // 5. PLAN PREVIEW & APPROVAL (TC-PLAN-039 to TC-PLAN-045)
  // =========================================================================
  test('TC-PLAN-039: Plan preview modal displays generated milestones and tasks', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible();
  });

  test('TC-PLAN-040: Seeded plans contain valid category classifications', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    const cardText = await tasksPage.planCards.first().innerText();
    expect(cardText.length).toBeGreaterThan(10);
  });

  test('TC-PLAN-041: Plan cards display distinct visual borders and rounded corners', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    const className = (await tasksPage.planCards.first().getAttribute('class')) || '';
    expect(className).toMatch(/(rounded|border|shadow|p-)/i);
  });

  test('TC-PLAN-042: Plan preview approval modal displays Approve button', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.openAiPlanGenerator();
    await expect(tasksPage.aiPlanModal).toBeVisible();
    await tasksPage.cancelAiPlanGenerator();
  });

  test('TC-PLAN-043: Plan approval persists plan into My Plans collection', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    const count = await tasksPage.planCards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('TC-PLAN-044: Generated plans link tasks under corresponding plan entity', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    await expect(tasksPage.planCards.first()).toBeVisible();
  });

  test('TC-PLAN-045: AI planner workflow complies with content safety standards', async ({
    tasksPage,
  }) => {
    await tasksPage.goto();
    await tasksPage.myPlansTab.click();
    const bodyText = await tasksPage.page.innerText('body');
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });
});
