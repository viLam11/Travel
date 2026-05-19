import { test, expect } from '@playwright/test';

test.describe('Provider Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/provider/messages');
  });

  test('should view message list and reply to customer', async ({ page }) => {
    await expect(page.locator('text=Tin nhắn')).toBeVisible();
    
    // Select first conversation if exists
    const conversation = page.locator('.conversation-list-item, .chat-list-item').first();
    if (await conversation.isVisible()) {
      await conversation.click();
      
      await page.locator('textarea, input[placeholder*="tin nhắn"]').fill('Test reply from provider');
      await page.getByRole('button', { name: /Gửi/i }).click();
      await expect(page.locator('text=Test reply from provider')).toBeVisible();
    }
  });
});
