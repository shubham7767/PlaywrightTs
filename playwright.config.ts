import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

const env = process.env.TEST_ENV || 'stage';
// Load the selected environment file so the same test command can run stage, uat, or CI.
const envFile = `.env.${env}`;

const envResult = dotenv.config({ path: envFile });

if (envResult.error) {
  throw envResult.error;
}

console.log(`Environment loaded: ${env}`);

export default defineConfig({

  testDir: './tests',
  reporter: [["html", { open: 'never' }], ["list"], ["allure-playwright"]],
  timeout: 30000,
  expect: {
    timeout: 40000
  },
  retries: 0,
  workers: 5,
 use: {
   browserName: 'chromium',
   viewport: { width: 1500, height: 1080 },
   screenshot: 'only-on-failure',
   video: 'retain-on-failure',
   trace: 'retain-on-failure',
   // Keep CI headless and local runs interactive.
   headless: !!process.env.CI,
   ignoreHTTPSErrors: true,
   baseURL: process.env.BASE_URL
  },
});

