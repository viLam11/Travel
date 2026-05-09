import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Admin Service Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.ADMIN_SERVICES);
  });

  test('should approve a pending service', async ({ page }) => {
    await expect(page.locator('text=Duyệt dịch vụ')).toBeVisible();
    
    const pendingRow = page.locator('tr:has-text("PENDING")').first();
    const approveBtn = pendingRow.getByRole('button', { name: 'Duyệt' });
    
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.locator('text=Đã duyệt dịch vụ thành công')).toBeVisible();
    }
  });

  test('should reject a service with reason', async ({ page }) => {
    const pendingRow = page.locator('tr:has-text("PENDING")').first();
    const rejectBtn = pendingRow.getByRole('button', { name: 'Từ chối' });
    
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await page.getByPlaceholder('Lý do từ chối...').fill('Hình ảnh không rõ nét');
      await page.getByRole('button', { name: 'Xác nhận từ chối' }).click();
      
      await expect(page.locator('text=Đã từ chối dịch vụ')).toBeVisible();
    }
  });

  test('should search globally for a service', async ({ page }) => {
    await page.getByPlaceholder('Tìm theo tên dịch vụ hoặc provider...').fill('Majestic');
    await expect(page.locator('text=Majestic')).toBeVisible();
  });
});
