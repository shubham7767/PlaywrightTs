import { Locator, Page } from '@playwright/test';

export class InventoryPage {
    private page: Page;
    private inventoryItems: Locator;
    private cartBadge: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inventoryItems = page.locator('[data-test="inventory-item"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    }

    async getInventoryItemCount(): Promise<number> {
        return await this.inventoryItems.count();
    }

    async navigateToInventory(): Promise<void> {
        const baseUrl = process.env.BASE_URL ?? '';

        if (!baseUrl) {
            throw new Error('BASE_URL is not configured for the selected environment');
        }

        await this.page.goto(new URL('inventory.html', baseUrl).toString());
    }

    async addProductToCartByName(productName: string): Promise<void> {
        const productCard = this.page.locator('[data-test="inventory-item"]').filter({ hasText: productName }).first();
        await productCard.locator('button').click();
    }

    async getCartBadgeText(): Promise<string> {
        return (await this.cartBadge.textContent()) ?? '';
    }
}