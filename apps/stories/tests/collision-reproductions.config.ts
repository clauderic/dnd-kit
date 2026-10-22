import {defineConfig} from '@playwright/test';

// Regression cases for layout feedback and immediate sortable reversal.
export default defineConfig({
  testDir: '.',
  testMatch: [
    'collision-reproductions.spec.ts',
    'nested-collections.spec.ts',
    'feedback-clone.spec.ts',
  ],
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: 'list',
  outputDir: '../test-results/collision-reproductions',
  use: {
    baseURL: 'http://localhost:6006',
    viewport: {width: 1440, height: 1100},
    channel: process.env.DND_BROWSER_CHANNEL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{name: 'current'}],
  webServer: {
    command: 'bun run dev -- --ci --no-open',
    cwd: new URL('..', import.meta.url).pathname,
    port: 6006,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
