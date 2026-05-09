import { test, expect } from '@playwright/test';
import { ROUTES, TEST_DATA } from '../fixtures/test-data';

test.describe('Customer Booking Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from a service detail page
    // Using a sample service ID - this should ideally be dynamic or from setup
    await page.goto('/destinations/mien-nam/ho-chi-minh/ticket/1-khach-san-majestic-saigon');
  });

  test('should open booking modal and show validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'ĐẶT NGAY' }).click();
    await expect(page.locator('text=Xác nhận đặt dịch vụ')).toBeVisible();

    // Try to confirm without data
    await expect(page.getByRole('button', { name: 'VUI LÒNG ĐIỀN ĐẦY ĐỦ THÔNG TIN' })).toBeDisabled();
  });

  test('should fill booking form and apply discount', async ({ page }) => {
    await page.getByRole('button', { name: 'ĐẶT NGAY' }).click();

    // Fill info
    await page.getByPlaceholder('Nhập họ tên...').fill(TEST_DATA.BOOKING.customerName);
    await page.getByPlaceholder('Nhập số điện thoại...').fill(TEST_DATA.BOOKING.customerPhone);
    await page.getByPlaceholder('Nhập email...').fill(TEST_DATA.BOOKING.customerEmail);
    await page.locator('input[type="date"]').fill(TEST_DATA.BOOKING.bookingDate);

    // Toggle discount section if not open
    const discountBtn = page.getByRole('button', { name: 'Ưu đãi' });
    await discountBtn.click();

    // Select first eligible discount if available
    const firstDiscount = page.locator('button:has-text("Hệ thống")').first();
    if (await firstDiscount.isVisible()) {
      await firstDiscount.click();
      await expect(page.locator('text=Ưu đãi (1)')).toBeVisible();
    }

    // Confirm booking
    const confirmBtn = page.getByRole('button', { name: 'XÁC NHẬN' });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Should redirect to payment or success page
    await expect(page).toHaveURL(/.*payment|.*booking-success/);
  });

  test('should verify booking history', async ({ page }) => {
    await page.goto(ROUTES.BOOKING_HISTORY);
    await expect(page.locator('text=Danh sách đặt chỗ')).toBeVisible();
    
    // Check if at least one booking card is visible
    await expect(page.locator('.booking-card').first()).toBeVisible();
  });
});
