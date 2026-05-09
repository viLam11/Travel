import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Customer Profile', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.PROFILE);
  });

  test('should view profile information', async ({ page }) => {
    await expect(page.locator('text=Thông tin cá nhân')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeDisabled(); // Email usually not editable
  });

  test('should update profile information', async ({ page }) => {
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();

    await page.locator('input[name="fullName"]').fill('Updated Name');
    await page.locator('input[name="phone"]').fill('0123456789');

    await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

    await expect(page.locator('text=Cập nhật thành công')).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toHaveValue('Updated Name');
  });

  test('should manage favorite services', async ({ page }) => {
    await page.goto('/profile/favorites');
    await expect(page.locator('text=Dịch vụ yêu thích')).toBeVisible();
    
    // Test un-favoriting if there are items
    const firstHeart = page.locator('.heart-icon').first();
    if (await firstHeart.isVisible()) {
      await firstHeart.click();
      await expect(page.locator('text=Đã xóa khỏi danh sách yêu thích')).toBeVisible();
    }
  });
});
