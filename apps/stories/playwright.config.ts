import {defineConfig} from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: CI ? 2 : 1,
  reporter: CI ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:6006',
    actionTimeout: 5_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {browserName: 'chromium'},
    },
  ],
  webServer: {
    command: 'npx http-server storybook-static --port 6006 --silent',
    port: 6006,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
