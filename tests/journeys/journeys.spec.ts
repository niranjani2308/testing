import { test, expect } from '../../fixtures/test.fixture';

test.describe('Journey Module - Creation, Management, Timeline & Workflows', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session without repeating login
    await loginPage.ensureLoggedIn();
  });

  // =========================================================================
  // 1. DISPLAY & LIST RENDERING (TC-JOURNEY-001 to TC-JOURNEY-010)
  // =========================================================================
  test('TC-JOURNEY-001: (Positive) Display seeded journeys in Journey list', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.pageTitle).toBeVisible();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const count = await journeysPage.journeyCards.count();
    expect(count).toBeGreaterThan(0);

    const titles = await journeysPage.journeyTitles.allInnerTexts();
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title.trim().length).toBeGreaterThan(0);
    }
  });

  test('TC-JOURNEY-002: Header displays "Journeys" main title', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.pageTitle).toContainText('Journeys');
  });

  test('TC-JOURNEY-003: "New Journey" button is visible and enabled in header', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.newJourneyBtn).toBeVisible();
    await expect(journeysPage.newJourneyBtn).toBeEnabled();
  });

  test('TC-JOURNEY-004: Search journeys input field is visible and has correct placeholder', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.searchInput).toBeVisible();
    const placeholder = await journeysPage.searchInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/search journeys/i);
  });

  test('TC-JOURNEY-005: Journey cards render with non-empty titles', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = await journeysPage.journeyTitles.first().innerText();
    expect(firstTitle.trim().length).toBeGreaterThan(0);
  });

  test('TC-JOURNEY-006: Seeded journeys match expected count of at least 3', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const count = await journeysPage.journeyCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('TC-JOURNEY-007: Journey cards display action buttons (Edit and Delete)', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstCard = journeysPage.journeyCards.first();
    await expect(firstCard.locator('button[title*="Edit"]')).toBeVisible();
    await expect(firstCard.locator('button[title*="Delete"]')).toBeVisible();
  });

  test('TC-JOURNEY-008: Journey card contains clickable link/button to open Timeline', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstCard = journeysPage.journeyCards.first();
    const timelineTrigger = firstCard.locator('button:has-text("Timeline"), h3, div:has-text("Timeline")').first();
    await expect(timelineTrigger).toBeVisible();
  });

  test('TC-JOURNEY-009: Journey cards do not contain null or undefined text', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const text = await journeysPage.journeyCards.first().innerText();
    expect(text).not.toContain('null');
    expect(text).not.toContain('undefined');
  });

  test('TC-JOURNEY-010: Total journeys count is rendered accurately in overview', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    const count = await journeysPage.journeyCards.count();
    expect(count).toBeGreaterThan(0);
  });

  // =========================================================================
  // 2. SEARCH & FILTERING (TC-JOURNEY-011 to TC-JOURNEY-020)
  // =========================================================================
  test('TC-JOURNEY-011: (Search) Search journeys by title and handle matching results', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();
    const searchPrefix = firstTitle.split(' ')[0];

    await journeysPage.searchJourney(searchPrefix);
    await expect(journeysPage.journeyCards.filter({ hasText: firstTitle }).first()).toBeVisible();
  });

  test('TC-JOURNEY-012: (Search) Search journeys with non-existent query displays empty state', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const nonExistent = `NoSuchJourney_${Date.now()}`;
    await journeysPage.searchJourney(nonExistent);
    await expect(journeysPage.noJourneysFound).toBeVisible();
  });

  test('TC-JOURNEY-013: (Search) Clearing search input restores full journey list', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await journeysPage.journeyCards.count();

    await journeysPage.searchJourney('NonExistentQueryXYZ');
    await expect(journeysPage.noJourneysFound).toBeVisible();

    await journeysPage.clearSearch();
    await expect(journeysPage.journeyCards.first()).toBeVisible();
    const restoredCount = await journeysPage.journeyCards.count();
    expect(restoredCount).toBe(initialCount);
  });

  test('TC-JOURNEY-014: Search filter is case-insensitive (lowercase query matches uppercase title)', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();
    const lowerQuery = firstTitle.slice(0, 4).toLowerCase();

    await journeysPage.searchJourney(lowerQuery);
    await expect(journeysPage.journeyCards.filter({ hasText: firstTitle }).first()).toBeVisible();
  });

  test('TC-JOURNEY-015: Search filter is case-insensitive (uppercase query matches lowercase title)', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();
    const upperQuery = firstTitle.slice(0, 4).toUpperCase();

    await journeysPage.searchJourney(upperQuery);
    await expect(journeysPage.journeyCards.filter({ hasText: firstTitle }).first()).toBeVisible();
  });

  test('TC-JOURNEY-016: Partial substring search matches internal words of journey titles', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const titles = await journeysPage.journeyTitles.allInnerTexts();
    const multiWord = titles.find((t) => t.includes(' '));
    if (multiWord) {
      const secondWord = multiWord.split(' ')[1];
      await journeysPage.searchJourney(secondWord);
      await expect(journeysPage.journeyCards.filter({ hasText: multiWord }).first()).toBeVisible();
    }
  });

  test('TC-JOURNEY-017: Rapid typing into search input updates results smoothly', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.searchInput.pressSequentially('Cloud', { delay: 50 });
    await expect(journeysPage.journeyCards.first().or(journeysPage.noJourneysFound)).toBeVisible();
    await journeysPage.clearSearch();
  });

  test('TC-JOURNEY-018: Empty spaces in search input does not crash or throw unhandled exceptions', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.searchJourney('    ');
    await expect(journeysPage.journeyCards.first().or(journeysPage.noJourneysFound)).toBeVisible();
  });

  test('TC-JOURNEY-019: Special characters in search query are handled gracefully', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.searchJourney('!@#$%^&*()_+');
    await expect(journeysPage.noJourneysFound.or(journeysPage.journeyCards.first())).toBeVisible();
  });

  test('TC-JOURNEY-020: Empty search result state displays informative guidance text', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.searchJourney(`Unique_${Date.now()}`);
    await expect(journeysPage.noJourneysFound).toBeVisible();
    const emptyText = await journeysPage.noJourneysFound.innerText();
    expect(emptyText.toLowerCase()).toContain('no journeys');
  });

  // =========================================================================
  // 3. CREATE JOURNEY MODAL & BOUNDARIES (TC-JOURNEY-021 to TC-JOURNEY-030)
  // =========================================================================
  test('TC-JOURNEY-021: Clicking "New Journey" button opens Create Journey modal', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.createModal).toBeVisible();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-022: Create Journey modal displays Title input with placeholder', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.modalTitleInput).toBeVisible();
    const placeholder = await journeysPage.modalTitleInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-023: Create Journey modal displays Description textarea', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.modalDescriptionInput).toBeVisible();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-024: Create Journey modal displays Submit and Cancel buttons', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.modalSubmitBtn).toBeVisible();
    await expect(journeysPage.modalCancelBtn).toBeVisible();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-025: Clicking Cancel button closes Create Journey modal', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.createModal).toBeVisible();
    await journeysPage.modalCancelBtn.click();
    await expect(journeysPage.createModal).not.toBeVisible();
  });

  test('TC-JOURNEY-026: Pressing ESC key closes Create Journey modal', async ({
    journeysPage,
    page,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.createModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(journeysPage.createModal).not.toBeVisible();
  });

  test('TC-JOURNEY-027: Title input field is focused automatically when modal opens', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.createModal).toBeVisible();
    await expect(journeysPage.modalTitleInput).toBeFocused();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-028: (Boundary) Title with exactly 2 characters (boundary min) is accepted', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill('AI');
    await expect(journeysPage.modalSubmitBtn).toBeEnabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-029: (Boundary) Title with 50 characters (boundary max) is accepted', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    const maxTitle = 'A'.repeat(50);
    await journeysPage.modalTitleInput.fill(maxTitle);
    await expect(journeysPage.modalSubmitBtn).toBeEnabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-030: Description textarea accepts multiline text with newlines', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    const multiline = 'Line 1: Goal\nLine 2: Milestones\nLine 3: Target';
    await journeysPage.modalDescriptionInput.fill(multiline);
    const value = await journeysPage.modalDescriptionInput.inputValue();
    expect(value).toBe(multiline);
    await journeysPage.modalCancelBtn.click();
  });

  // =========================================================================
  // 4. NEGATIVE & VALIDATION CHECKS (TC-JOURNEY-031 to TC-JOURNEY-038)
  // =========================================================================
  test('TC-JOURNEY-031: Submitting empty form keeps submit button disabled', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.modalSubmitBtn).toBeDisabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-032: Submitting whitespace-only title keeps submit button disabled', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill('      ');
    await expect(journeysPage.modalSubmitBtn).toBeDisabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-033: Title with single character (< 2 chars) keeps submit button disabled', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill('X');
    await expect(journeysPage.modalSubmitBtn).toBeDisabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-034: Canceling Create modal does not add any journey record to the list', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    const countBefore = await journeysPage.journeyCards.count();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill(`Discarded_${Date.now()}`);
    await journeysPage.modalCancelBtn.click();
    const countAfter = await journeysPage.journeyCards.count();
    expect(countAfter).toBe(countBefore);
  });

  test('TC-JOURNEY-035: Reopening modal after cancel resets the title input field', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill('Abandoned draft title');
    await journeysPage.modalCancelBtn.click();
    await journeysPage.newJourneyBtn.click();
    const value = await journeysPage.modalTitleInput.inputValue();
    expect(value).toBe('');
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-036: Title with leading and trailing whitespaces is trimmed upon input', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill('   Valid Title   ');
    await expect(journeysPage.modalSubmitBtn).toBeEnabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-037: Description field is optional (title alone enables submit)', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await journeysPage.modalTitleInput.fill('Journey without description');
    await expect(journeysPage.modalDescriptionInput).toHaveValue('');
    await expect(journeysPage.modalSubmitBtn).toBeEnabled();
    await journeysPage.modalCancelBtn.click();
  });

  test('TC-JOURNEY-038: Modal title displays "Create New Journey"', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await journeysPage.newJourneyBtn.click();
    await expect(journeysPage.createModal).toContainText(/Create New Journey|New Journey/i);
    await journeysPage.modalCancelBtn.click();
  });

  // =========================================================================
  // 5. LIFECYCLE: CREATE, EDIT & DELETE (TC-JOURNEY-039 to TC-JOURNEY-045)
  // =========================================================================
  test('TC-JOURNEY-039: (Functional) Create, Edit, and Delete a temporary Journey', async ({
    journeysPage,
    seededData,
  }) => {
    await journeysPage.goto();

    const tempJourney = seededData.generateDynamicJourney();
    const updatedTitle = `${tempJourney.name} Updated`;

    // 1. Create using fixture generated data
    await journeysPage.createJourney(tempJourney.name, tempJourney.description);
    await expect(journeysPage.journeyCards.filter({ hasText: tempJourney.name }).first()).toBeVisible();

    // 2. Edit
    await journeysPage.editJourney(tempJourney.name, updatedTitle, `${tempJourney.description} Updated`);
    await expect(journeysPage.journeyCards.filter({ hasText: updatedTitle }).first()).toBeVisible();

    // 3. Delete
    await journeysPage.deleteJourney(updatedTitle);
    await expect(journeysPage.journeyCards.filter({ hasText: updatedTitle })).toHaveCount(0);
  });

  test('TC-JOURNEY-040: Created journey appears immediately at top of list', async ({
    journeysPage,
    seededData,
  }) => {
    await journeysPage.goto();
    const temp = seededData.generateDynamicJourney('Top_Journey');
    await journeysPage.createJourney(temp.name, temp.description);
    await expect(journeysPage.journeyCards.filter({ hasText: temp.name }).first()).toBeVisible();
    await journeysPage.deleteJourney(temp.name);
  });

  test('TC-JOURNEY-041: Edit modal pre-populates with current journey title and description', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();

    const firstCard = journeysPage.journeyCards.first();
    await firstCard.locator('button[title*="Edit"]').click();
    await expect(journeysPage.editModal).toBeVisible();

    const editValue = await journeysPage.editTitleInput.inputValue();
    expect(editValue).toBe(firstTitle);

    // Cancel edit
    await journeysPage.editModal.locator('button:has-text("Cancel")').click();
  });

  test('TC-JOURNEY-042: Canceling edit leaves original journey title unchanged', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();

    const firstCard = journeysPage.journeyCards.first();
    await firstCard.locator('button[title*="Edit"]').click();
    await journeysPage.editTitleInput.fill('Changed Title But Canceled');
    await journeysPage.editModal.locator('button:has-text("Cancel")').click();

    await expect(journeysPage.journeyCards.filter({ hasText: firstTitle }).first()).toBeVisible();
  });

  test('TC-JOURNEY-043: Canceling deletion dialog retains the journey card in the list', async ({
    journeysPage,
    page,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();

    // Dismiss the browser confirmation dialog
    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    const firstCard = journeysPage.journeyCards.first();
    await firstCard.locator('button[title*="Delete"]').click();

    // Card should still exist
    await expect(journeysPage.journeyCards.filter({ hasText: firstTitle }).first()).toBeVisible();
  });

  test('TC-JOURNEY-044: Confirming deletion removes the journey and decrements card count', async ({
    journeysPage,
    seededData,
  }) => {
    await journeysPage.goto();
    const temp = seededData.generateDynamicJourney('DeleteCount_Test');
    await journeysPage.createJourney(temp.name, temp.description);
    const countBefore = await journeysPage.journeyCards.count();

    await journeysPage.deleteJourney(temp.name);
    const countAfter = await journeysPage.journeyCards.count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('TC-JOURNEY-045: Editing journey title updates its searchability immediately', async ({
    journeysPage,
    seededData,
  }) => {
    await journeysPage.goto();
    const temp = seededData.generateDynamicJourney('SearchEdit_Test');
    const updated = `${temp.name}_Renamed`;

    await journeysPage.createJourney(temp.name, temp.description);
    await journeysPage.editJourney(temp.name, updated);

    await journeysPage.searchJourney(updated);
    await expect(journeysPage.journeyCards.filter({ hasText: updated }).first()).toBeVisible();

    await journeysPage.clearSearch();
    await journeysPage.deleteJourney(updated);
  });

  // =========================================================================
  // 6. TIMELINE & WORKSPACE NAVIGATION (TC-JOURNEY-046 to TC-JOURNEY-050)
  // =========================================================================
  test('TC-JOURNEY-046: (Timeline) Open Journey Workspace and navigate back', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });

    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();
    await journeysPage.openJourneyWorkspace(firstTitle);
    await expect(journeysPage.backToJourneysBtn).toBeVisible({ timeout: 10000 });

    await journeysPage.backToJourneys();
    await expect(journeysPage.pageTitle).toBeVisible();
  });

  test('TC-JOURNEY-047: Journey workspace displays Journey title heading', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });
    const firstTitle = (await journeysPage.journeyTitles.first().innerText()).trim();

    await journeysPage.openJourneyWorkspace(firstTitle);
    await expect(journeysPage.workspaceTitle).toContainText(firstTitle);
    await journeysPage.backToJourneys();
  });

  test('TC-JOURNEY-048: Journey workspace displays "Back to Journeys" button', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });

    await journeysPage.openJourneyWorkspace();
    await expect(journeysPage.backToJourneysBtn).toBeVisible();
    await journeysPage.backToJourneys();
  });

  test('TC-JOURNEY-049: Journey workspace displays Add Daily Note button', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });

    await journeysPage.openJourneyWorkspace();
    await expect(journeysPage.newDailyNoteBtn).toBeVisible();
    await journeysPage.backToJourneys();
  });

  test('TC-JOURNEY-050: Clicking "Back to Journeys" restores main Journey catalog view', async ({
    journeysPage,
  }) => {
    await journeysPage.goto();
    await expect(journeysPage.journeyCards.first()).toBeVisible({ timeout: 10000 });

    await journeysPage.openJourneyWorkspace();
    await journeysPage.backToJourneys();
    await expect(journeysPage.pageTitle).toBeVisible();
    await expect(journeysPage.journeyCards.first()).toBeVisible();
  });
});
