import { test, expect } from '../../fixtures/test.fixture';

test.describe('Notes Module - Standalone Notes, Active/Archive, Pin & Search', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session (storageState) without repeating login
    await loginPage.ensureLoggedIn();
  });

  test('TC-NOTE-001: (Positive) Display seeded active notes and verify counts', async ({
    notesPage,
  }) => {
    await notesPage.goto();
    await expect(notesPage.pageTitle).toBeVisible();

    // Verify notes cards dynamically
    await expect(notesPage.noteCards.first()).toBeVisible({ timeout: 10000 });
    const count = await notesPage.noteCards.count();
    expect(count).toBeGreaterThan(0);

    const noteTitles = await notesPage.noteTitles.allInnerTexts();
    expect(noteTitles.length).toBeGreaterThan(0);
    for (const title of noteTitles) {
      expect(title.trim().length).toBeGreaterThan(0);
    }
  });

  test('TC-NOTE-002: (Tabs) Switch between Active and Archived notes tabs', async ({
    notesPage,
  }) => {
    await notesPage.goto();

    // 1. On Active tab, read first active note title dynamically
    await notesPage.switchTab('active');
    await expect(notesPage.noteCards.first()).toBeVisible({ timeout: 10000 });
    const activeCount = await notesPage.noteCards.count();
    expect(activeCount).toBeGreaterThan(0);
    const activeTitle = (await notesPage.noteTitles.first().innerText()).trim();

    // 2. On Archived tab, read archived notes dynamically
    await notesPage.switchTab('archived');
    await expect(notesPage.noteCards.first()).toBeVisible({ timeout: 10000 });
    const archivedCount = await notesPage.noteCards.count();
    expect(archivedCount).toBeGreaterThan(0);

    // Active note must NOT be in archive
    await expect(notesPage.noteCards.filter({ hasText: activeTitle })).toHaveCount(0);

    // Switch back to active
    await notesPage.switchTab('active');
  });

  test('TC-NOTE-003: (Search) Search notes by title and handle empty results', async ({
    notesPage,
  }) => {
    await notesPage.goto();
    await expect(notesPage.noteCards.first()).toBeVisible({ timeout: 10000 });

    // Derive search keyword dynamically from the first note
    const firstNoteTitle = (await notesPage.noteTitles.first().innerText()).trim();
    const searchWord = firstNoteTitle.split(' ')[0];

    await notesPage.searchNotes(searchWord);
    await expect(notesPage.noteCards.filter({ hasText: firstNoteTitle }).first()).toBeVisible();

    // Empty search result with dynamic non-existent string
    const nonExistentQuery = `NoNote_${Date.now()}`;
    await notesPage.searchNotes(nonExistentQuery);
    await expect(notesPage.noNotesFound).toBeVisible();
  });

  test('TC-NOTE-004: (Functional) Create, Pin, Archive, and Delete a temporary Note', async ({
    notesPage,
  }) => {
    await notesPage.goto();

    const testTitle = `Dynamic Note ${Date.now()}`;
    const testContent = `Testing dynamic note lifecycle ${Date.now()}`;

    // 1. Create
    await notesPage.createNote({
      title: testTitle,
      content: testContent,
      tags: ['testing', 'dynamic'],
      isPinned: false,
    });
    await expect(notesPage.noteCards.filter({ hasText: testTitle }).first()).toBeVisible();

    // 2. Pin Note
    await notesPage.pinNote(testTitle);

    // 3. Archive Note
    await notesPage.archiveNote(testTitle);
    // Should disappear from Active tab
    await expect(notesPage.noteCards.filter({ hasText: testTitle })).toHaveCount(0);

    // 4. Verify in Archived tab and Delete
    await notesPage.switchTab('archived');
    await expect(notesPage.noteCards.filter({ hasText: testTitle }).first()).toBeVisible();
    await notesPage.deleteNote(testTitle);
    await expect(notesPage.noteCards.filter({ hasText: testTitle })).toHaveCount(0);

    // Return to Active tab
    await notesPage.switchTab('active');
  });
});
