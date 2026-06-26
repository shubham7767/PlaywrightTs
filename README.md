# Swag Labs E2E Framework

This project targets Swag Labs (https://www.saucedemo.com) and is designed to be interview-ready.

It uses:
- Environment-based execution with `.env` files
- Playwright Page Object Model
- Separate fixture layer (`base` and `auth`)
- Worker-scoped `storageState` for session reuse
- Centralized JSON test data
- `beforeAll` and `beforeEach` hooks
- HTML + Allure reporting

## 1. Quick Setup (new machine)

```bash
git clone https://github.com/shubham7767/PlaywrightTs.git
cd PlaywrightTs
npm install
npx playwright install
```

## 2. Required Dependencies and Why

- `@playwright/test`: core runner, fixtures, hooks, assertions
- `dotenv`: loads env-specific URL and values
- `cross-env`: cross-platform env selection in npm scripts
- `allure-playwright` + `allure`: richer reporting

## 3. Environment Configuration (dotenv)

### Env files
- `.env.stage`
- `.env.uat`

Current value:

```env
BASE_URL=https://www.saucedemo.com/
```

### How dotenv is used (from `playwright.config.ts`)

```ts
const env = process.env.TEST_ENV || 'stage';
const envFile = `.env.${env}`;
const envResult = dotenv.config({ path: envFile });

if (envResult.error) {
  throw envResult.error;
}
```

### Env-driven commands

```bash
npm run test:stage
npm run test:uat
```

From `package.json`:

```json
"test:stage": "cross-env TEST_ENV=stage playwright test",
"test:uat": "cross-env TEST_ENV=uat playwright test"
```

## 4. Reporting and Trace (why and where)

From `playwright.config.ts`:

```ts
reporter: [["html", { open: 'never' }], ["line"], ["allure-playwright"]],
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure'
}
```

Why:
- `line`: clean terminal output
- `html`: local visual report
- `allure`: advanced timeline/history view
- failure-only screenshots/videos/traces: faster runs + useful debugging

## 5. Project Structure

```text
data/
  authData.json

fixtures/
  base.fixture.ts
  auth.fixture.ts

pages/
  loginPage.ts
  InventoryPage.ts
  CartPage.ts

tests/
  login.spec.ts
  inventory.spec.ts
  Cart.spec.ts
```

## 6. Base Fixture (shared objects)

From `fixtures/base.fixture.ts`:

```ts
export const test = base.extend<BaseFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
```

Why:
- Keeps test files clean
- Standard object injection in every test

## 7. Auth Fixture with storageState (session reuse)

From `fixtures/auth.fixture.ts`:

```ts
authStorageStatePath: [async ({ browser }, use) => {
  const statePath = path.join(authDir, 'valid-user.json');

  // Always recreate session — no stale-file guard.
  // This ensures isolated spec runs (e.g. npx playwright test tests/inventory.spec.ts)
  // never fail because of an expired session file from a previous run.
  fs.mkdirSync(authDir, { recursive: true });

  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.navigateToApplication();
  await loginPage.login(validUser, validPassword);
  await page.waitForURL(/inventory\.html/);

  // Save cookies + localStorage so context fixture can reuse the session.
  await context.storageState({ path: statePath });
  await context.close();

  await use(statePath);
}, { scope: 'worker' }],

context: async ({ browser, authStorageStatePath }, use) => {
  // Every test gets a fresh browser context pre-loaded with the saved session.
  const context = await browser.newContext({ storageState: authStorageStatePath });
  await use(context);
  await context.close();
}
```

Why this gives speed:
- Login runs once per Playwright worker per test run (not once per test)
- Every test in the worker reuses the saved session via `storageState`
- Single-spec runs also work correctly because session is always fresh

## 8. Centralized Test Data (single JSON)

From `data/authData.json`:

```json
{
  "credentials": {
    "valid": {
      "username": "standard_user",
      "password": "secret_sauce"
    },
    "invalid": [
      { "type": "locked-user", "username": "locked_out_user", "password": "secret_sauce" },
      { "type": "wrong-password", "username": "standard_user", "password": "wrong_password" }
    ]
  },
  "product": {
    "name": "Sauce Labs Backpack"
  }
}
```

Why:
- No hardcoded credentials in test logic
- Easy to extend invalid scenarios

## 9. Hooks Strategy (with snippets)

### `beforeAll` for data contract validation

```ts
test.beforeAll(() => {
  if (!testData.credentials?.valid?.username || !testData.credentials?.valid?.password) {
    throw new Error('authData.json must include valid credentials');
  }
});
```

### `beforeEach` for deterministic start state

```ts
test.beforeEach(async ({ inventoryPage }) => {
  await inventoryPage.navigateToInventory();
});
```

Why:
- Faster failure when setup is wrong
- Stable, repeatable test start

## 10. Page Object Examples

### Login page action

```ts
async login(username: string, password: string): Promise<void> {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
}
```

### Inventory action

```ts
async addProductToCartByName(productName: string): Promise<void> {
  const productCard = this.page.locator('[data-test="inventory-item"]').filter({ hasText: productName }).first();
  await productCard.locator('button').click();
}
```

Why:
- Business-level readable methods
- Selectors maintained in one place

## 11. E2E Flows Covered

### `tests/login.spec.ts`
- Valid login should navigate to inventory
- Invalid user types should show error

### `tests/inventory.spec.ts`
- Inventory list is visible
- Add product updates cart badge

### `tests/Cart.spec.ts`
- Add product
- Open cart
- Verify item count

## 12. AI Test Generation Agent

This workspace now includes a custom Copilot agent for enterprise-style Playwright generation:

- Agent: `.github/agents/enterprise-playwright-test-generator.agent.md`
- Prompt: `.github/prompts/generate-enterprise-playwright-tests.prompt.md`

Use it when you want new tests to follow the current framework standard:
- fixture-based setup
- page object ownership of selectors and actions
- env-driven `baseURL`
- JSON-backed test data where scenarios repeat
- readable positive, negative, and edge coverage

Suggested input shape:

```text
Feature: checkout with one in-stock item
Auth: logged-in user required
Preconditions: cart contains 1 backpack
Acceptance criteria:
- user can open checkout
- user can submit shipping details
- order confirmation is shown
Negative cases:
- missing postal code shows validation message
Data variants:
- standard_user
- missing postal code
Target file: tests/checkout.spec.ts
```

In chat, run the prompt by typing `/Generate Enterprise Playwright Tests`, then paste the feature details.

## 13. Useful Commands

Run all:

```bash
npm test
```

Run by env:

```bash
npm run test:stage
npm run test:uat
```

Run one suite (works for any spec individually):

```bash
npx playwright test tests/login.spec.ts
npx playwright test tests/inventory.spec.ts
npx playwright test tests/Cart.spec.ts
```

> Note: Authenticated specs (`inventory`, `Cart`) create a fresh login session automatically
> via the auth fixture, so they never fail when run in isolation.

Headed mode:

```bash
npx playwright test --headed
```

Playwright report:

```bash
npx playwright show-report
```

Allure report:

```bash
npm run allure:generate
npm run allure:open
```

## 14. CI Commands

```bash
npm ci
npx playwright install --with-deps
npm run test:stage
```

or

```bash
npm ci
npx playwright install --with-deps
npm run test:uat
```

## 15. Interview Pitch (30-60 seconds)

1. Framework is env-driven using `cross-env` + `dotenv`.
2. Fixture layer is separated into base and auth for clean architecture.
3. Auth fixture uses worker-scoped `storageState` for faster authenticated suites.
4. Test data is centralized in one JSON for maintainability.
5. POM + hooks + reporting stack make the framework scalable and production-friendly.
