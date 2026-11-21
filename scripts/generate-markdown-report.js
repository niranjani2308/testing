const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, '../test-results/test-results.json');
const outputPath = path.resolve(__dirname, '../TEST_EXECUTION_REPORT.md');

if (!fs.existsSync(jsonPath)) {
  console.log('[REPORT GEN] No test-results.json found at: ' + jsonPath);
  process.exit(0);
}

try {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let totalDurationMs = 0;

  const suites = [];

  function traverseSuites(suite) {
    if (suite.suites && suite.suites.length > 0) {
      for (const sub of suite.suites) {
        traverseSuites(sub);
      }
    }

    if (suite.specs && suite.specs.length > 0) {
      const suiteTitle = suite.title || 'General';
      const file = suite.file ? path.basename(suite.file) : 'Unknown File';
      const tests = [];

      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          totalTests++;
          const result = test.results && test.results.length > 0 ? test.results[0] : null;
          const status = result ? result.status : 'skipped';
          const duration = result ? result.duration : 0;
          totalDurationMs += duration;

          if (status === 'passed') passedTests++;
          else if (status === 'failed' || status === 'timedOut') failedTests++;
          else skippedTests++;

          const isNegative =
            spec.title.includes('Negative') ||
            spec.title.includes('VAL') ||
            spec.title.includes('reject') ||
            spec.title.includes('error') ||
            spec.title.includes('fail') ||
            spec.title.includes('invalid') ||
            spec.title.includes('mismatch') ||
            spec.title.includes('exceed');

          tests.push({
            title: spec.title,
            status,
            duration: (duration / 1000).toFixed(2) + 's',
            type: isNegative ? '🔴 Negative' : '🟢 Positive',
          });
        }
      }

      if (tests.length > 0) {
        suites.push({ title: suiteTitle, file, tests });
      }
    }
  }

  if (data.suites) {
    for (const root of data.suites) {
      traverseSuites(root);
    }
  }

  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  const executionDate = new Date().toLocaleString();

  let md = `# Comprehensive Authentication Module Test Execution Report\n\n`;
  md += `**Execution Date:** ${executionDate}  \n`;
  md += `**Environment:** Localhost (Frontend: Port 3000, Backend: Port 5000)  \n`;
  md += `**Browser:** Chromium (Desktop Chrome)  \n\n`;

  md += `## Overall Summary\n\n`;
  md += `| Metric | Count | Percentage |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Total Tests Executed** | **${totalTests}** | 100% |\n`;
  md += `| **Passed** | **${passedTests}** | ${passRate}% |\n`;
  md += `| **Failed** | **${failedTests}** | ${totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(1) : 0}% |\n`;
  md += `| **Skipped** | **${skippedTests}** | ${totalTests > 0 ? ((skippedTests / totalTests) * 100).toFixed(1) : 0}% |\n`;
  md += `| **Total Execution Time** | **${(totalDurationMs / 1000).toFixed(1)}s** | - |\n\n`;

  md += `## Test Suites Breakdown\n\n`;

  for (const s of suites) {
    md += `### ${s.title} (\`${s.file}\`)\n\n`;
    md += `| Type | Status | Duration | Test Scenario Description |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const t of s.tests) {
      const statusIcon = t.status === 'passed' ? '✅ Passed' : t.status === 'failed' ? '❌ Failed' : '⚠️ Skipped';
      md += `| ${t.type} | ${statusIcon} | ${t.duration} | ${t.title} |\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(outputPath, md, 'utf8');
  console.log(`[REPORT GEN] Successfully generated markdown report at: ${outputPath}`);
} catch (err) {
  console.error('[REPORT GEN] Error generating markdown report:', err);
}
