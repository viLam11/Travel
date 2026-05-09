import { test, expect } from '@playwright/test';
import { ROUTES, TEST_DATA } from '../fixtures/test-data';

test.describe('Provider Service Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.PROVIDER_SERVICES);
  });

  test('should list services and filter by status', async ({ page }) => {
    await expect(page.locator('text=Quản lý dịch vụ')).toBeVisible();
    
    const statusSelect = page.locator('select').nth(1); // Second select is status
    await statusSelect.selectOption('active');
    
    // Verify results
    await expect(page.locator('text=Hoạt động')).toBeVisible();
  });

  test('should search for a service', async ({ page }) => {
    await page.getByPlaceholder('Tìm kiếm dịch vụ...').fill('Majestic');
    
    await expect(page.locator('text=Majestic')).toBeVisible();
  });

  test('should toggle service status', async ({ page }) => {
    const firstServiceRow = page.locator('tbody tr').first();
    const toggleBtn = firstServiceRow.locator('button[title*="Kích hoạt"], button[title*="Tạm dừng"]');
    
    await toggleBtn.click();
    
    await expect(page.locator('text=Cập nhật trạng thái thành công')).toBeVisible();
  });

  test('should delete a service', async ({ page }) => {
    const firstServiceRow = page.locator('tbody tr').first();
    const deleteBtn = firstServiceRow.locator('button[title="Xóa dịch vụ"]');
    
    await deleteBtn.click();
    
    // Confirm in modal
    await page.getByRole('button', { name: 'Xác nhận xóa' }).click();
    
    await expect(page.locator('text=Xóa dịch vụ thành công')).toBeVisible();
  });
});
