import { configDotenv } from 'dotenv';
import { chromium } from 'playwright';
configDotenv();
const {
	NOTION_USERNAME,
	NOTION_PASSWORD,
	NOT_HEADLESS,
	NOTION_ARCHIVE_URL,
	NOTION_TOKEN_V2,
	NOTION_FILE_TOKEN,
} = process.env;

// Open a Chromium browser. We use headless: false
// to be able to watch the browser window.
const browser = await chromium.launch({
	headless: NOT_HEADLESS != 1,
});
const context = await browser.newContext({ acceptDownloads: true });
await context.addCookies([
	{
		name: 'token_v2',
		value: NOTION_TOKEN_V2,
		domain: '.www.notion.so',
		path: '/',
	},
	{
		name: 'file_token',
		value: NOTION_FILE_TOKEN,
		domain: '.notion.so',
		path: '/f',
	},
]);
const page = await browser.newPage();

if (!NOTION_TOKEN_V2) {
	await login();
	await page.waitForTimeout(3000);
	await page.screenshot({ path: 'screenshot/after_login.png', fullPage: true });
}

await page.goto(NOTION_ARCHIVE_URL);
await page.waitForTimeout(1000);
await page.screenshot({
	path: 'screenshot/notion_archive_url.png',
	fullPage: true,
});
await page.waitForTimeout(1000);
await page.locator('.notion-topbar-more-button').click();
await page.screenshot({
	path: 'screenshot/notion_topbar_more_button.png',
	fullPage: true,
});
await page.getByText('Export').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'screenshot/opening_export_dialog.png', fullPage: true });
// dialog
const dialog = page.locator('div[role="dialog"]');
await page.locator('div[role="button"]', { hasText: 'Export' }).click();
await page.screenshot({ path: 'screenshot/after_confirming_export_dialog.png', fullPage: true });
// await page.waitForTimeout(1000000);
const download = await page.waitForEvent('download');
await download.saveAs('./data');
await page.waitForTimeout(50000);

// await download.delete();
await browser.close();

async function login() {
	await page.goto('https://notion.so/login');
	await page.waitForTimeout(5000);

	await page.screenshot({ path: 'screenshot/login.png', fullPage: true });
	const usernameLocator = page.locator('input[type="email"]');
	const passwordLocator = page.locator('input[type="password"]');

	usernameLocator.fill(NOTION_USERNAME);
	await page.waitForTimeout(1000);
	usernameLocator.press('Enter');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: 'screenshot/login_after_username.png', fullPage: true });
	passwordLocator.fill(NOTION_PASSWORD);
	await page.waitForTimeout(1000);
	passwordLocator.press('Enter');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: 'screenshot/login_after_password.png', fullPage: true });
}
