import * as fs from 'fs';
import * as path from 'path';
import { LifeTrackSeeder } from '../utils/seeder';
import { SCENARIO_B_MEDIUM } from '../test-data/seeding.datasets';

// Load .env manually if not populated
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function runScenarioBSeeding() {
  console.log('\n============================================================');
  console.log('🚀 LIFE TRACK AI - PHASE 3 SCENARIO B SEEDING & VERIFICATION');
  console.log('============================================================\n');

  const username = process.env.TEST_SEED_USER || 'automation_seed_user';
  const password = process.env.TEST_SEED_PASSWORD || 'Valid12!';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  console.log(`[AUTH] Target Backend URL: ${backendUrl}`);
  console.log(`[AUTH] Authenticating test user: ${username}`);

  const seeder = new LifeTrackSeeder(backendUrl);

  try {
    // 1. Authenticate
    const authResult = await seeder.authenticate(username, password);
    console.log(`✅ [AUTH] Authenticated successfully as "${authResult.user.username}" (User ID: ${authResult.user.id})`);

    // 2. Execute Seeding
    console.log('\n[SEED] Seeding Scenario B (3 Journeys, 2 Plans, 12 Tasks, 6 Notes, 2 Trackers, Files)...');
    const manifest = await seeder.seedScenarioB(SCENARIO_B_MEDIUM);

    console.log('\n✅ [SEED] Seeding complete! Manifest generated:');
    console.log(`  - Seeded At: ${manifest.seededAt}`);
    console.log(`  - User ID: ${manifest.user.id} (${manifest.user.username})`);
    console.log(`  - Journeys created (${manifest.journeys.length}): [${manifest.journeys.join(', ')}]`);
    console.log(`  - Plans created (${manifest.plans.length}): [${manifest.plans.join(', ')}]`);
    console.log(`  - Tasks created (${manifest.tasks.length}): [${manifest.tasks.join(', ')}]`);
    console.log(`  - Notes created (${manifest.notes.length}): [${manifest.notes.join(', ')}]`);
    console.log(`  - Trackers created (${manifest.trackers.length}): [${manifest.trackers.join(', ')}]`);
    console.log(`  - Uploaded Files (${manifest.uploadedFiles.length}): ${manifest.uploadedFiles.map(f => f.fileName).join(', ')}`);

    // 3. Verify Metrics Against Backend
    console.log('\n[VERIFY] Fetching Live Dashboard Overview and Analytics...');
    const { overview, analytics } = await seeder.verifyDashboardMetrics();

    console.log('\n============================================================');
    console.log('📊 EXPECTED VS ACTUAL VERIFICATION MATRIX');
    console.log('============================================================');

    const expected = SCENARIO_B_MEDIUM.expectedMetrics;
    const actual = overview.summary;

    const checks = [
      { metric: 'Total Journeys', expected: expected.totalJourneys, actual: actual.totalJourneys },
      { metric: 'Total Tasks', expected: expected.totalTasks, actual: actual.totalTasks },
      { metric: 'Completed Tasks', expected: expected.completedTasks, actual: actual.completedTasks },
      { metric: 'In Progress Tasks', expected: expected.inProgressTasks, actual: actual.inProgressTasks },
      { metric: 'Pending Tasks', expected: expected.pendingTasks, actual: actual.pendingTasks },
      { metric: 'Overdue Tasks', expected: expected.overdueTasks, actual: actual.overdueTasks },
      { metric: 'Active Notes', expected: expected.totalNotes, actual: actual.totalNotes },
    ];

    let allPassed = true;
    for (const chk of checks) {
      const match = chk.expected === chk.actual;
      if (!match) allPassed = false;
      const icon = match ? '✅' : '❌';
      console.log(`  ${icon} ${chk.metric.padEnd(22)}: Expected = ${chk.expected}, Actual = ${chk.actual}`);
    }

    console.log('\n[ANALYTICS] Chart Data Summary:');
    console.log(`  - Task Status Distribution: ${JSON.stringify(analytics.taskStatusDistribution || analytics.taskStatus)}`);
    console.log(`  - Journey Progress Distribution: ${JSON.stringify(analytics.journeyProgressDistribution || analytics.journeyProgress)}`);

    if (allPassed) {
      console.log('\n🎉 ALL DASHBOARD AND MODULE METRICS MATCH EXPECTATIONS EXACTLY (100% PASS)');
    } else {
      console.log('\n⚠️ SOME METRICS DIFFER - SEE COMPARISON TABLE ABOVE');
    }

  } catch (err: any) {
    console.error('\n❌ [SEED ERROR]:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    await seeder.dispose();
  }
}

runScenarioBSeeding();
