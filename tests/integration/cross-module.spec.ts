import { test, expect } from '../../fixtures/test.fixture';

test.describe('Cross-Module Integration - End-to-End Data Synchronization', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Reuses authenticated session (storageState) without repeating login
    await loginPage.ensureLoggedIn();
  });

  test('INT-001: Task Lifecycle & Dashboard Synchronization (Create -> Complete -> Verify Counts)', async ({
    sidebar,
    tasksPage,
    dashboardPage,
  }) => {
    // 1. Check initial task counts on Dashboard via POM property
    await sidebar.navigateTo('dashboard');
    const initialCompleted = parseInt((await dashboardPage.cardCompletedTasks.innerText()).match(/\d+/)?.[0] || '0', 10);

    // 2. Navigate to Tasks and create a task via POM method
    await sidebar.navigateTo('tasks');
    const taskTitle = `Sync Verification Task ${Date.now()}`;
    await tasksPage.createManualTask({
      title: taskTitle,
      description: 'Verifies real-time synchronization between Tasks and Dashboard',
      priority: 'HIGH',
      status: 'PENDING',
    });

    // 3. Switch to All Scheduled Dates via calling method and complete the task
    await tasksPage.switchToAllDates();
    await tasksPage.updateTaskStatus(taskTitle, 'COMPLETED');

    // 4. Return to Dashboard and verify Completed count incremented
    await sidebar.navigateTo('dashboard');
    await dashboardPage.verifyDashboardLoaded();

    const newCompleted = parseInt((await dashboardPage.cardCompletedTasks.innerText()).match(/\d+/)?.[0] || '0', 10);
    expect(newCompleted).toBe(initialCompleted + 1);

    // Cleanup: delete the task via calling method
    await sidebar.navigateTo('tasks');
    await tasksPage.switchToAllDates();
    await tasksPage.deleteTask(taskTitle);
  });

  test('INT-002: Note Archive Lifecycle & Dashboard Active Notes Count Synchronization', async ({
    sidebar,
    notesPage,
    dashboardPage,
  }) => {
    // 1. Check initial active notes on Dashboard via POM property
    await sidebar.navigateTo('dashboard');
    const initialNotes = parseInt((await dashboardPage.cardNotes.innerText()).match(/\d+/)?.[0] || '0', 10);

    // 2. Navigate to Notes and create a note via POM method
    await sidebar.navigateTo('notes');
    const noteTitle = `Sync Note ${Date.now()}`;
    await notesPage.createNote({
      title: noteTitle,
      content: 'Verifies note archiving updates active count on Dashboard',
    });

    // 3. Verify Dashboard Notes count incremented
    await sidebar.navigateTo('dashboard');
    const incrementedNotes = parseInt((await dashboardPage.cardNotes.innerText()).match(/\d+/)?.[0] || '0', 10);
    expect(incrementedNotes).toBe(initialNotes + 1);

    // 4. Archive the note via POM calling method
    await sidebar.navigateTo('notes');
    await notesPage.archiveNote(noteTitle);

    // 5. Verify Dashboard Notes count decremented back to initial active count
    await sidebar.navigateTo('dashboard');
    const decrementedNotes = parseInt((await dashboardPage.cardNotes.innerText()).match(/\d+/)?.[0] || '0', 10);
    expect(decrementedNotes).toBe(initialNotes);

    // Cleanup: Delete from archived tab via calling method
    await sidebar.navigateTo('notes');
    await notesPage.switchTab('archived');
    await notesPage.deleteNote(noteTitle);
    await notesPage.switchTab('active');
  });

  test('INT-003: Journey Creation & Progress Tracker Synchronization', async ({
    sidebar,
    journeysPage,
    trackerPage,
  }) => {
    const journeyTitle = `Sync Journey ${Date.now()}`;

    // 1. Create a journey via POM method
    await sidebar.navigateTo('journeys');
    await journeysPage.createJourney(journeyTitle, 'Testing cross-module sync to Tracker');

    // 2. Navigate to Tracker and verify the new journey appears via calling method
    await sidebar.navigateTo('tracker');
    await trackerPage.switchTab('journey');
    await trackerPage.searchJourney(journeyTitle);

    await expect(trackerPage.getJourneyCard(journeyTitle)).toBeVisible({ timeout: 10000 });

    // Cleanup: Delete the journey via calling method
    await sidebar.navigateTo('journeys');
    await journeysPage.deleteJourney(journeyTitle);
  });
});
