import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Forgot Password Flow', () => {
  test('should request password reset successfully', async ({ page }) => {
    await page.goto(ROUTES.FORGOT_PASSWORD);
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.getByRole('button', { name: /Gửi yêu cầu|Xác nhận/i }).click();
    await expect(page.locator('text=thành công')).toBeVisible();
  });

  test('should reset password with valid token', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token');
    await page.locator('input[name="password"]').fill('NewPassword123!');
    await page.locator('input[name="confirmPassword"]').fill('NewPassword123!');
    await page.getByRole('button', { name: /Đổi mật khẩu|Xác nhận/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});
