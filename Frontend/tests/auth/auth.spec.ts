import { test, expect } from '@playwright/test';
import { ROUTES, TEST_ACCOUNTS } from '../fixtures/test-data';

test.describe('Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
  });

  test.describe('Login', () => {
    test('should login successfully with valid customer credentials', async ({ page }) => {
      await page.locator('input[name="email"]').fill(TEST_ACCOUNTS.customer.email);
      await page.locator('input[name="password"]').fill(TEST_ACCOUNTS.customer.password);
      await page.getByRole('button', { name: 'LOGIN' }).click();

      await expect(page).toHaveURL(/.*homepage|.*dashboard/);
    });

    test('should show error message with invalid credentials', async ({ page }) => {
      await page.locator('input[name="email"]').fill('wrong@test.com');
      await page.locator('input[name="password"]').fill('WrongPass123!');
      await page.getByRole('button', { name: 'LOGIN' }).click();

      // Check for toast error or error message in UI
      // Since it's react-hot-toast, we might look for text or a specific class
      await expect(page.locator('text=đăng nhập thất bại|Sai email hoặc mật khẩu')).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.getByText('TẠO TÀI KHOẢN').first().click();
      await expect(page).toHaveURL(ROUTES.REGISTER);
    });
  });

  test.describe('Register', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(ROUTES.REGISTER);
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click();
      
      // Check for validation messages
      await expect(page.locator('text=Vui lòng nhập tên người dùng')).toBeVisible();
      await expect(page.locator('text=Vui lòng nhập email')).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await page.locator('input[name="username"]').fill('testuser');
      await page.locator('input[name="email"]').fill('newuser@test.com');
      await page.locator('input[name="password"]').fill('Password123!');
      await page.locator('input[name="confirmPassword"]').fill('Different123!');
      await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click();

      await expect(page.locator('text=Mật khẩu không khớp')).toBeVisible();
    });

    test('should register successfully as customer', async ({ page }) => {
      const randomUser = `user_${Math.floor(Math.random() * 10000)}`;
      await page.locator('input[name="username"]').fill(randomUser);
      await page.locator('input[name="email"]').fill(`${randomUser}@test.com`);
      await page.locator('input[name="password"]').fill('Password123!');
      await page.locator('input[name="confirmPassword"]').fill('Password123!');
      
      const agreeToTerms = page.locator('input[name="agreeToTerms"]');
      if (await agreeToTerms.isVisible()) {
        await agreeToTerms.check();
      }
      
      await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click();

      // Should redirect to customer registration detail or login
      await expect(page).toHaveURL(/.*register\/customer|.*login|.*verify-email/);
    });

    test('should register successfully as hotel owner', async ({ page }) => {
      await page.goto('/register/hotel-owner');
      const randomUser = `hotel_${Math.floor(Math.random() * 10000)}`;
      await page.locator('input[name="username"]').fill(randomUser);
      await page.locator('input[name="email"]').fill(`${randomUser}@test.com`);
      await page.locator('input[name="password"]').fill('Password123!');
      await page.locator('input[name="confirmPassword"]').fill('Password123!');
      await page.locator('input[name="agreeToTerms"]').check();
      await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click();

      await expect(page).toHaveURL(/.*verify-email|.*login/);
    });

    test('should register successfully as tour provider', async ({ page }) => {
      await page.goto('/register/tour-provider');
      const randomUser = `tour_${Math.floor(Math.random() * 10000)}`;
      await page.locator('input[name="username"]').fill(randomUser);
      await page.locator('input[name="email"]').fill(`${randomUser}@test.com`);
      await page.locator('input[name="password"]').fill('Password123!');
      await page.locator('input[name="confirmPassword"]').fill('Password123!');
      await page.locator('input[name="agreeToTerms"]').check();
      await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click();

      await expect(page).toHaveURL(/.*verify-email|.*login/);
    });
  });
});
