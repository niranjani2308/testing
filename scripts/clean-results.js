const fs = require('fs');
const path = require('path');

const dirs = ['test-results', 'playwright-report'];

dirs.forEach((dir) => {
  const targetDir = path.resolve(process.cwd(), dir);
  if (fs.existsSync(targetDir)) {
    try {
      fs.rmSync(targetDir, { recursive: true, force: true });
      console.log(`[CLEANUP] Cleared: ${dir}`);
    } catch (err) {
      console.warn(`[CLEANUP] Could not delete ${dir}: ${err.message}`);
    }
  }
});
