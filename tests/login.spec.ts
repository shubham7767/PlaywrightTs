declare function require(path: string): any;

import { test, expect } from '../fixtures/base.fixture'

const testData = require('../data/authData.json')

test.describe('Swag Labs login flow', () => {
    // Validate data contract once to fail fast if test data is malformed.
    test.beforeAll(() => {
        if (!testData.credentials?.valid?.username || !testData.credentials?.valid?.password) {
            throw new Error('authData.json must include valid credentials')
        }

        if (!Array.isArray(testData.credentials?.invalid) || !testData.credentials.invalid.length) {
            throw new Error('authData.json must include invalid credential cases')
        }

        for (const invalidUser of testData.credentials.invalid) {
            if (!invalidUser.type || typeof invalidUser.expectedError !== 'string') {
                throw new Error('each invalid credential case must include type and expectedError')
            }
        }
    })

    // Keep each test independent by always starting from login page.
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToApplication()
    })

    // Positive: valid standard user reaches the inventory page.
    test('allows login with valid credentials', async ({ page, loginPage }) => {
        await loginPage.login(testData.credentials.valid.username, testData.credentials.valid.password)

        await expect(page).toHaveURL(/inventory\.html/)
    })

    // Negative + edge: data-driven coverage for locked, invalid, unknown, and empty-field cases.
    for (const invalidUser of testData.credentials.invalid) {
        test(`blocks login and shows error for case: ${invalidUser.type}`, async ({ page, loginPage }) => {
            await loginPage.login(invalidUser.username, invalidUser.password)

            // User must remain on the login domain and never reach inventory.
            await expect(page).toHaveURL(/saucedemo\.com/)
            await expect(page).not.toHaveURL(/inventory\.html/)

            // Error banner is visible and matches the expected message for this case.
            await expect(await loginPage.isErrorDisplayed()).toBe(true)
            await expect(await loginPage.getErrorMessageText()).toContain(invalidUser.expectedError)
        })
    }
})