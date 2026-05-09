import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Customer Search & Filters', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.HOMEPAGE);
  });

  test('should search for a destination from hero section', async ({ page }) => {
    await page.getByPlaceholder('Chọn hoặc tìm địa điểm').fill('Đà Nẵng');
    // Wait for dropdown and select if necessary, or just click Search
    await page.getByRole('button', { name: 'Tìm' }).click();

    await expect(page).toHaveURL(/.*destinations.*destination=Đà Nẵng/);
    await expect(page.locator('text=Kết quả cho: Đà Nẵng|Đà Nẵng')).toBeVisible();
  });

  test('should apply category filters', async ({ page }) => {
    await page.goto(ROUTES.DESTINATIONS);
    
    // Select a category (e.g., "Thiên nhiên")
    await page.getByLabel('Thiên nhiên').check();
    
    // Verify results updated (check for tag or URL change)
    await expect(page).toHaveURL(/.*category=nature|.*Thiên nhiên/);
  });

  test('should apply sorting', async ({ page }) => {
    await page.goto(ROUTES.DESTINATIONS);
    
    // Select "Giá thấp nhất"
    await page.getByLabel('Giá thấp nhất').check();
    
    // Verify sorting in URL
    await expect(page).toHaveURL(/.*sort=price_asc/);
  });

  test('should apply price range filter', async ({ page }) => {
    await page.goto(ROUTES.DESTINATIONS);
    
    // Target the price slider (this might be tricky depending on implementation)
    // For now, let's assume we can interact with input or slider
    const slider = page.locator('input[type="range"]').first();
    if (await slider.isVisible()) {
      await slider.fill('500000');
    }
    
    await expect(page.locator('text=Từ 0đ - 500.000đ')).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto(ROUTES.DESTINATIONS + '?category=hotel&sort=price_desc');
    
    await page.getByRole('button', { name: 'Xóa tất cả' }).click();
    
    await expect(page).toHaveURL(ROUTES.DESTINATIONS);
  });
});
