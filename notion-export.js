import { configDotenv } from 'dotenv';
import { chromium } from 'playwright';
configDotenv();
const { NOTION_USERNAME, NOTION_PASSWORD, NOT_HEADLESS, NOTION_ARCHIVE_URL } =
	process.env;

// Open a Chromium browser. We use headless: false
// to be able to watch the browser window.
const browser = await chromium.launch({
	headless: NOT_HEADLESS != 1,
});
const context = await browser.newContext({ acceptDownloads: true });
const page = await browser.newPage();

await login();
await page.waitForTimeout(3000);
await page.goto(NOTION_ARCHIVE_URL);
await page.waitForTimeout(1000);
page.locator('.notion-topbar-more-button').click();
await page.waitForTimeout(1000);
page.getByText('Export').click();
await page.waitForTimeout(1000);
// dialog
const dialog = page.locator('div[role="dialog"]');
await page.locator('div[role="button"]', { hasText: 'Export' }).click();

// await page.waitForTimeout(1000000);
const download = await page.waitForEvent('download');
await download.saveAs('./data');
await page.waitForTimeout(50000);

// await download.delete();
await browser.close();

async function login() {
	await page.goto('https://notion.so/login');
	await page.waitForTimeout(5000);

	const usernameLocator = page.locator('input[type="email"]');
	const passwordLocator = page.locator('input[type="password"]');

	usernameLocator.fill(NOTION_USERNAME);
	await page.waitForTimeout(1000);
	usernameLocator.press('Enter');
	await page.waitForTimeout(1000);
	passwordLocator.fill(NOTION_PASSWORD);
	await page.waitForTimeout(1000);
	passwordLocator.press('Enter');
	await page.waitForTimeout(1000);
}
