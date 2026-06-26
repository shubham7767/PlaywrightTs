import { expect, Locator, test } from '@playwright/test';

let searchBox: Locator;

test.describe('search functionality', () => {
    // beforeEach runs before every test in this describe block.
    test.beforeEach(async ({ page }) => {
        // Open target application.
        await page.goto('https://www.amazon.in/');
        // Create locator once and reuse it in this test setup.
        searchBox = page.locator('#twotabsearchtextbox');
        // Type query to trigger Amazon suggestion dropdown.
        await searchBox.fill('iphone 17');
    });

    test('search from suggestions', async ({ page }) => {
        // Locator pointing to all visible suggestion rows.
        const suggestionContainer = page.locator('.s-suggestion-container');

        // Explicit wait so count/text reads happen after suggestions render.
        await suggestionContainer.first().waitFor();

        console.log('Count:', await suggestionContainer.count());
        console.log('Suggestions:', await suggestionContainer.allTextContents());

        const count = await suggestionContainer.count()

        // Iterate over suggestions and click the first matching one.
        for (let i = 0; i < count; i++) {
            const text = await suggestionContainer.nth(i).textContent()
            console.log(text)


            if(text?.trim().toLowerCase().includes('iphone 17')) {
                await suggestionContainer.nth(i).click();
                break;
            }

            // Basic assertion intent: confirm result page marker is present.
            await expect(await page.getByText("Results"))

        }
    });
});