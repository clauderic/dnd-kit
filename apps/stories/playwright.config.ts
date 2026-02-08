import {defineConfig} from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: CI ? 2 : 1,
  reporter: CI ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:6006',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {browserName: 'chromium'},
    },
  ],
  webServer: {
    command: CI
      ? 'npx serve storybook-static -l 6006'
      : 'bun run storybook dev -p 6006',
    port: 6006,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
