import { test, expect } from '../fixtures/auth.fixture';
import testData from '../data/authData.json';

test.describe('Swag Labs inventory flow', () => {
    test.beforeAll(() => {
        if (!testData.credentials?.valid?.username || !testData.credentials?.valid?.password) {
            throw new Error('authData.json must include valid credentials');
        }

        if (!testData.product?.name) {
            throw new Error('authData.json must include a product name');
        }
    });

    // With auth fixture, session is reused via storageState; just land on inventory page.
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigateToInventory();
    });

    test('shows inventory list after successful login', async ({ page, inventoryPage }) => {
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(await inventoryPage.getInventoryItemCount()).toBeGreaterThan(0);
    });

    test('adds two products to cart and updates cart badge', async ({ inventoryPage }) => {
        // Add both products from test data and assert badge shows 2.
        await inventoryPage.addProductToCartByName(testData.product.name);
        await inventoryPage.addProductToCartByName(testData.product.bikelight);
        await expect(await inventoryPage.getCartBadgeText()).toBe('2');
    });
});