import { Locator, Page } from '@playwright/test';

export class LoginPage {
    private page: Page;
    private usernameInput: Locator;
    private passwordInput: Locator;
    private loginButton: Locator;
    private errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async navigateToApplication(url: string = process.env.BASE_URL ?? ''): Promise<void> {
        if (!url) {
            throw new Error('BASE_URL is not configured for the selected environment');
        }

        await this.page.goto(url);
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async getErrorMessageText(): Promise<string> {
        return (await this.errorMessage.textContent()) ?? '';
    }

    async isErrorDisplayed(): Promise<boolean> {
        return await this.errorMessage.isVisible();
    }
}
