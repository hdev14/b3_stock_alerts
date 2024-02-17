import { expect, test } from '@playwright/test';

test.describe('Index Page', () => {
  test('should redirect user to /pages/login if not authenticated', async ({ page }) => {
    page.goto('/pages/index');

    await page.waitForURL('**/pages/login');

    await expect(page).toHaveTitle('Login!');
  });
});
