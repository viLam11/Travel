import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Admin User Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.ADMIN_USERS);
  });

  test('should list users and search by email', async ({ page }) => {
    await expect(page.locator('text=Quản lý người dùng')).toBeVisible();
    
    await page.getByPlaceholder('Tìm kiếm người dùng...').fill('customer@test.com');
    await expect(page.locator('text=customer@test.com')).toBeVisible();
  });

  test('should block a user', async ({ page }) => {
    const userRow = page.locator('tr:has-text("customer@test.com")');
    const blockBtn = userRow.getByRole('button', { name: 'Chặn' });
    
    if (await blockBtn.isVisible()) {
      await blockBtn.click();
      await page.getByRole('button', { name: 'Xác nhận chặn' }).click();
      await expect(page.locator('text=Đã khóa tài khoản')).toBeVisible();
    }
  });

  test('should filter by role', async ({ page }) => {
    await page.locator('select[name="role"]').selectOption('PROVIDER_HOTEL');
    await expect(page.locator('text=Chủ khách sạn')).toBeVisible();
  });
});
