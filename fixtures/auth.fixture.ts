import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../pages/loginPage';
import { test as base, expect } from './base.fixture';
import testData from '../data/authData.json';

type AuthWorkerFixtures = {
  authStorageStatePath: string;
};

export const test = base.extend<{}, AuthWorkerFixtures>({
  // Worker-scoped: runs once per Playwright worker per test run.
  // Always creates a fresh session so stale files from previous runs never break isolated spec runs.
  authStorageStatePath: [async ({ browser }, use) => {
    const authDir = path.resolve(process.cwd(), 'playwright', '.auth');
    const statePath = path.join(authDir, 'valid-user.json');

    // Always recreate so running a single spec file in isolation works correctly.
    fs.mkdirSync(authDir, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigateToApplication();
    await loginPage.login(testData.credentials.valid.username, testData.credentials.valid.password);
    await page.waitForURL(/inventory\.html/);

    // Persist session: cookies + localStorage saved so the context fixture can reuse it.
    await context.storageState({ path: statePath });
    await context.close();

    await use(statePath);
  }, { scope: 'worker' }],

  context: async ({ browser, authStorageStatePath }, use) => {
    const context = await browser.newContext({ storageState: authStorageStatePath });
    await use(context);
    await context.close();
  },
});

export { expect };