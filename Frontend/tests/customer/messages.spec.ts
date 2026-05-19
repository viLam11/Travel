import { test, expect } from '@playwright/test';

test.describe('Customer Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/messages');
  });

  test('should view message list and send message', async ({ page }) => {
    await expect(page.locator('text=Tin nhắn')).toBeVisible();
    
    const input = page.locator('textarea, input[placeholder*="tin nhắn"]').first();
    if (await input.isVisible()) {
      await input.fill('Test message from customer');
      await page.getByRole('button', { name: /Gửi/i }).click();
      await expect(page.locator('text=Test message from customer')).toBeVisible();
    }
  });
});
