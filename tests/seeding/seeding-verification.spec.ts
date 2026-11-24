import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LifeTrackSeeder, SeedManifest } from '../../utils/seeder';
import { SCENARIO_B_MEDIUM } from '../../test-data/seeding.datasets';

test.describe.serial('Phase 3 - Sample Data Seeding & Data Verification', () => {
  let seeder: LifeTrackSeeder;
  let manifest: SeedManifest | null = null;

  test.beforeAll(async () => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    seeder = new LifeTrackSeeder(backendUrl);

    const username = process.env.TEST_SEED_USER || 'automation_seed_user';
    const password = process.env.TEST_SEED_PASSWORD || 'Valid12!';
    await seeder.authenticate(username, password);
  });

  test.afterAll(async () => {
    if (seeder) {
      await seeder.dispose();
    }
  });

  test('STEP 1: Validate Dataset Schema & Mathematical Consistency', async () => {
    expect(SCENARIO_B_MEDIUM.journeys).toHaveLength(3);
    expect(SCENARIO_B_MEDIUM.plans).toHaveLength(2);
    expect(SCENARIO_B_MEDIUM.tasks).toHaveLength(10); // 10 individual + 2 from plans = 12 total
    expect(SCENARIO_B_MEDIUM.notes).toHaveLength(6);
    expect(SCENARIO_B_MEDIUM.trackers).toHaveLength(2);

    const expected = SCENARIO_B_MEDIUM.expectedMetrics;
    const completedTasks = SCENARIO_B_MEDIUM.tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTasks = SCENARIO_B_MEDIUM.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingTasks = SCENARIO_B_MEDIUM.tasks.filter((t) => t.status === 'PENDING').length + SCENARIO_B_MEDIUM.plans.length;

    expect(completedTasks).toBe(expected.completedTasks);
    expect(inProgressTasks).toBe(expected.inProgressTasks);
    expect(pendingTasks).toBe(expected.pendingTasks);
    expect(completedTasks + inProgressTasks + pendingTasks).toBe(expected.totalTasks);
  });

  test('STEP 2: Verify Manifest Exists & Matches Seeded Resources', async () => {
    let manifestPath = path.resolve(__dirname, '../../fixtures/seed-data/seed-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      manifestPath = path.resolve(__dirname, '../../test-data/seed-manifest.json');
    }
    expect(fs.existsSync(manifestPath)).toBeTruthy();
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest!.user.username).toBe('automation_seed_user');
    expect(manifest!.journeys).toHaveLength(3);
    expect(manifest!.plans).toHaveLength(2);
    expect(manifest!.tasks).toHaveLength(12);
    expect(manifest!.notes).toHaveLength(6);
    expect(manifest!.trackers).toHaveLength(2);
    expect(manifest!.uploadedFiles || manifest!.attachments).toHaveLength(2);
  });

  test('STEP 3: Verify Live Dashboard Overview Metrics Match Expectations', async () => {
    const { overview } = await seeder.verifyDashboardMetrics();
    const summary = overview.summary;
    const overdueCount = overview.overdueTasks ? overview.overdueTasks.length : 0;
    const expected = SCENARIO_B_MEDIUM.expectedMetrics;

    console.log('\n--- LIVE DASHBOARD OVERVIEW METRICS ---');
    console.log(`Journeys: Expected ${expected.totalJourneys}, Actual ${summary.totalJourneys}`);
    console.log(`Total Tasks: Expected ${expected.totalTasks}, Actual ${summary.totalTasks}`);
    console.log(`Completed Tasks: Expected ${expected.completedTasks}, Actual ${summary.completedTasks}`);
    console.log(`In Progress Tasks: Expected ${expected.inProgressTasks}, Actual ${summary.inProgressTasks}`);
    console.log(`Pending Tasks: Expected ${expected.pendingTasks}, Actual ${summary.pendingTasks}`);
    console.log(`Overdue Tasks: Expected ${expected.overdueTasks}, Actual ${overdueCount}`);
    console.log(`Active Notes: Expected ${expected.totalNotes}, Actual ${summary.totalNotes}`);
    console.log(`Uploaded Files: Expected 2, Actual ${summary.totalUploadedFiles}`);
    console.log(`Storage Used: Expected 504 Bytes, Actual ${summary.storageUsedBytes} Bytes`);

    expect(summary.totalJourneys).toBe(expected.totalJourneys);
    expect(summary.totalTasks).toBe(expected.totalTasks);
    expect(summary.completedTasks).toBe(expected.completedTasks);
    expect(summary.inProgressTasks).toBe(expected.inProgressTasks);
    expect(summary.pendingTasks).toBe(expected.pendingTasks);
    expect(overdueCount).toBe(expected.overdueTasks);
    expect(summary.totalNotes).toBe(expected.totalNotes);
    expect(summary.totalUploadedFiles).toBe(2);
    expect(summary.storageUsedBytes).toBe(504);
  });

  test('STEP 4: Verify Analytics Tab & Task Distribution Charts', async () => {
    const { analytics } = await seeder.verifyDashboardMetrics();
    expect(analytics).toBeDefined();

    console.log('\n--- LIVE ANALYTICS DATA ---');
    console.log('Task Status Chart:', JSON.stringify(analytics.taskStatusChart));
    console.log('Journey Progress Chart:', JSON.stringify(analytics.journeyProgressChart));
    console.log('File Type Chart:', JSON.stringify(analytics.fileTypeChart));

    expect(analytics.taskStatusChart).toBeDefined();
    expect(analytics.taskStatusChart).toHaveLength(3);

    const completedSlice = analytics.taskStatusChart.find((s: any) => s.status === 'COMPLETED');
    const inProgressSlice = analytics.taskStatusChart.find((s: any) => s.status === 'IN_PROGRESS');
    const pendingSlice = analytics.taskStatusChart.find((s: any) => s.status === 'PENDING');

    expect(completedSlice.count).toBe(4);
    expect(inProgressSlice.count).toBe(3);
    expect(pendingSlice.count).toBe(5);

    expect(analytics.journeyProgressChart).toBeDefined();
    expect(analytics.journeyProgressChart).toHaveLength(3);

    expect(analytics.fileTypeChart).toBeDefined();
    const pdfCategory = analytics.fileTypeChart.find((f: any) => f.category === 'PDF');
    const imagesCategory = analytics.fileTypeChart.find((f: any) => f.category === 'Images');
    expect(pdfCategory.count).toBe(1);
    expect(imagesCategory.count).toBe(1);

    expect(analytics.dailyActivityChart).toBeDefined();
  });

  test('STEP 5: Verify Cross-Module API Endpoints Return Seeded Records', async () => {
    const { overview } = await seeder.verifyDashboardMetrics();
    expect(overview.recentJourneys).toHaveLength(3);
    expect(overview.overdueTasks).toHaveLength(2);

    // Verify overdue task titles
    const overdueTitles = overview.overdueTasks.map((t: any) => t.title);
    expect(overdueTitles).toContain('Legacy Database Schema Freeze Notice');
    expect(overdueTitles).toContain('Sports Dietitian Macro Consultation');
  });
});
