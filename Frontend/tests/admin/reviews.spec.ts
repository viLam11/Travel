import { test, expect } from '@playwright/test';

test.describe('Admin Reviews Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/reviews');
  });

  test('should list reviews and allow moderation', async ({ page }) => {
    await expect(page.locator('text=đánh giá')).toBeVisible();
    
    // Check if reviews are listed
    const tableRow = page.locator('table tbody tr').first();
    if (await tableRow.isVisible()) {
      // Delete/Hide a review
      const hideBtn = page.getByRole('button', { name: /Ẩn|Xóa/i }).first();
      if (await hideBtn.isVisible()) {
        await hideBtn.click();
        await page.getByRole('button', { name: /Xác nhận/i }).click();
        await expect(page.locator('text=thành công')).toBeVisible();
      }
    }
  });
});
