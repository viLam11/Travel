import { test, expect } from '@playwright/test';

test.describe('Customer Reviews', () => {
  test('should view and write a review for a service', async ({ page }) => {
    // Assuming we are on a service detail page
    await page.goto('/service/1');
    
    await expect(page.locator('text=Đánh giá')).toBeVisible();
    
    // Write review if possible
    const writeReviewBtn = page.getByRole('button', { name: /Viết đánh giá/i });
    if (await writeReviewBtn.isVisible()) {
      await writeReviewBtn.click();
      
      const ratingStars = page.locator('.rating-stars-container > svg').nth(4); // 5 stars
      if (await ratingStars.isVisible()) {
        await ratingStars.click();
      }
      
      await page.locator('textarea[placeholder*="đánh giá"]').fill('Rất tuyệt vời!');
      await page.getByRole('button', { name: /Gửi đánh giá/i }).click();
      
      await expect(page.locator('text=thành công')).toBeVisible();
    }
  });
});
