import { Page } from '@playwright/test';

export class CartPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openCartFromHeader(): Promise<void> {
        await this.page.locator('[data-test="shopping-cart-link"]').click();
    }

    async removeProductByName(productName: string): Promise<void> {
        const cartItem = this.page.locator('[data-test="inventory-item"]').filter({ hasText: productName }).first();
        await cartItem.locator('button').click();
    }

    async getCartItemCount(): Promise<number> {
        return await this.page.locator('[data-test="inventory-item"]').count();
    }

    async isCartBadgeVisible(): Promise<boolean> {
        return await this.page.locator('[data-test="shopping-cart-badge"]').isVisible();
    }
}