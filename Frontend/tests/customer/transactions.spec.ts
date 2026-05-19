import { test, expect } from '@playwright/test';

test.describe('Customer Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming logged in state is handled by global setup
    await page.goto('/profile/transactions');
  });

  test('should view transaction history', async ({ page }) => {
    await expect(page.locator('text=giao dịch')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });
});
