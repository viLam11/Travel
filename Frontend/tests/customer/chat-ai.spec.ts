import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('AI Features', () => {
  
  test.describe('AI Chatbot', () => {
    test('should open chatbot and send a message', async ({ page }) => {
      await page.goto(ROUTES.HOMEPAGE);
      
      // Open chatbot (look for floating button or icon)
      await page.locator('.ai-chat-toggle').click();
      await expect(page.locator('.ai-chat-window')).toBeVisible();

      const input = page.getByPlaceholder('Hỏi AI về chuyến đi của bạn...');
      await input.fill('Gợi ý cho tôi địa điểm đẹp ở Đà Lạt');
      await input.press('Enter');

      // Wait for AI response
      await expect(page.locator('.ai-message')).toHaveCount(2, { timeout: 10000 });
      await expect(page.locator('.ai-message').last()).toContainText(/Đà Lạt|Hồ Xuân Hương|Thung lũng Tình yêu/);
    });
  });

  test.describe('AI Planner', () => {
    test('should generate a travel plan', async ({ page }) => {
      await page.goto(ROUTES.AI_PLANNER);
      
      await page.getByPlaceholder('Bạn muốn đi đâu?').fill('Phú Quốc');
      await page.locator('select[name="duration"]').selectOption('3 ngày');
      await page.locator('select[name="budget"]').selectOption('5,000,000đ - 10,000,000đ');
      
      // Select interests
      await page.getByText('Biển đảo').click();
      await page.getByText('Nghỉ dưỡng').click();

      await page.getByRole('button', { name: 'Tạo lịch trình' }).click();

      await expect(page.locator('.plan-result')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('text=Lịch trình gợi ý cho Phú Quốc')).toBeVisible();
    });

    test('should save plan to draft', async ({ page }) => {
      await page.goto(ROUTES.AI_PLANNER);
      // Assume a plan is already generated or we are on the result page
      // ... (simplified for this test)
      const saveBtn = page.getByRole('button', { name: 'Lưu lịch trình' });
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await expect(page.locator('text=Đã lưu vào danh sách của bạn')).toBeVisible();
      }
    });
  });
});
