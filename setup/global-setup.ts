import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Setup hook that executes automatically before tests run.
 * Automatically clears previous test-results and report artifacts so each rerun starts with clean data.
 */
async function globalSetup(): Promise<void> {
  const dirs = ['test-results', 'playwright-report'];
  for (const dir of dirs) {
    const fullPath = path.resolve(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`[CLEANUP] Successfully cleaned up old directory: ${dir}`);
      } catch (err: any) {
        console.warn(`[CLEANUP] Note: Could not delete ${dir} (${err?.message || err})`);
      }
    }
  }

  // Ensure .auth directory exists
  const authDir = path.resolve(process.cwd(), '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
}

export default globalSetup;
