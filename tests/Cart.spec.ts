declare function require(path: string): any;

import { test, expect } from '../fixtures/auth.fixture';

const testData = require('../data/authData.json');

test.describe('Swag Labs cart flow', () => {
    test.beforeAll(() => {
        if (!testData.credentials?.valid?.username || !testData.credentials?.valid?.password) {
            throw new Error('authData.json must include valid credentials');
        }

        if (!testData.product?.name) {
            throw new Error('authData.json must include product.name');
        }
    });

    // Uses persisted valid-user session from auth fixture to reduce repeated login time.
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigateToInventory();
    });

    test('removes an added inventory item from the cart and clears the badge', async ({ inventoryPage, cartPage }) => {
        await inventoryPage.addProductToCartByName(testData.product.name);
        await expect(await inventoryPage.getCartBadgeText()).toBe('1');

        await cartPage.openCartFromHeader();
        await expect(await cartPage.getCartItemCount()).toBe(1);

        await cartPage.removeProductByName(testData.product.name);

        await expect(await cartPage.getCartItemCount()).toBe(0);
        await expect(await cartPage.isCartBadgeVisible()).toBe(false);
    });
});