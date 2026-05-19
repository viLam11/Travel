import { test, expect } from '@playwright/test';

test.describe('Admin Bookings Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/bookings');
  });

  test('should list all bookings and filter by status', async ({ page }) => {
    await expect(page.locator('text=đơn đặt')).toBeVisible();
    
    // Check if bookings are listed
    const tableRow = page.locator('table tbody tr').first();
    if (await tableRow.isVisible()) {
      // Filter
      const statusSelect = page.locator('select').first();
      await statusSelect.selectOption('completed');
      
      // Assuming table updates
      await expect(page.locator('table')).toBeVisible();
    }
  });
});
