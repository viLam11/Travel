import { test, expect } from '@playwright/test';

test.describe('Provider Reviews Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/provider/reviews');
  });

  test('should view reviews list and reply', async ({ page }) => {
    await expect(page.locator('text=đánh giá')).toBeVisible();
    
    const replyBtn = page.getByRole('button', { name: /Phản hồi/i }).first();
    if (await replyBtn.isVisible()) {
      await replyBtn.click();
      await page.locator('textarea[placeholder*="phản hồi"]').fill('Cảm ơn bạn đã đánh giá!');
      await page.getByRole('button', { name: /Gửi|Lưu/i }).click();
      await expect(page.locator('text=Cảm ơn bạn đã đánh giá!')).toBeVisible();
    }
  });
});
