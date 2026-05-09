import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Provider Discount Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.PROVIDER_DISCOUNTS);
  });

  test('should create a new percentage discount', async ({ page }) => {
    await page.getByRole('button', { name: 'Thêm mã giảm giá' }).click();

    await page.locator('input[name="code"]').fill('SUMMER2024');
    await page.locator('textarea[name="description"]').fill('Summer promotion 20% off');
    await page.locator('input[name="percentage"]').fill('20');
    await page.locator('input[name="minSpend"]').fill('500000');
    
    // Set dates
    await page.locator('input[name="startDate"]').fill('2024-06-01');
    await page.locator('input[name="endDate"]').fill('2024-08-31');

    await page.getByRole('button', { name: 'Tạo mã' }).click();

    await expect(page.locator('text=Tạo mã thành công')).toBeVisible();
    await expect(page.locator('text=SUMMER2024')).toBeVisible();
  });

  test('should delete a discount code', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const deleteBtn = firstRow.locator('button[title="Xóa mã"]');
    
    await deleteBtn.click();
    await page.getByRole('button', { name: 'Xác nhận' }).click();
    
    await expect(page.locator('text=Xóa mã thành công')).toBeVisible();
  });
});
