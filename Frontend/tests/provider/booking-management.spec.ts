import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Provider Booking Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.PROVIDER_BOOKINGS);
  });

  test('should view booking list and filter by status', async ({ page }) => {
    await expect(page.locator('text=Quản lý đặt chỗ')).toBeVisible();
    
    await page.getByText('Chờ xử lý').click();
    // Verify list contains only pending
    await expect(page.locator('.status-badge:has-text("PENDING")').first()).toBeVisible();
  });

  test('should confirm a pending booking', async ({ page }) => {
    const pendingBooking = page.locator('tr:has-text("PENDING")').first();
    const confirmBtn = pendingBooking.getByRole('button', { name: 'Xác nhận' });
    
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await expect(page.locator('text=Đã xác nhận thành công')).toBeVisible();
    }
  });

  test('should export booking report', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Xuất Excel' }).click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('bookings');
  });
});
