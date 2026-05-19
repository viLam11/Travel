import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
  });

  test('should view statistics and charts', async ({ page }) => {
    await expect(page.locator('text=Tổng quan')).toBeVisible();
    
    // Check if statistic cards exist
    await expect(page.locator('.stat-card, [class*="card"]').first()).toBeVisible();
  });
});
