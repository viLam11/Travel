import { test, expect } from '@playwright/test';

test.describe('Admin Promotions Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/promotions');
  });

  test('should list promotions and create new one', async ({ page }) => {
    await expect(page.locator('text=khuyến mãi')).toBeVisible();
    
    // Create new
    const createBtn = page.getByRole('button', { name: /Thêm mới|Tạo/i });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.locator('input[name="code"], input[placeholder*="Mã"]').fill('TESTPROMO2026');
      await page.locator('input[name="discount"], input[placeholder*="giảm"]').fill('10');
      await page.getByRole('button', { name: /Lưu|Xác nhận/i }).click();
      
      await expect(page.locator('text=thành công')).toBeVisible();
    }
  });
});
