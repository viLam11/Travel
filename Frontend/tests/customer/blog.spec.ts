import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Blog System', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.BLOG);
  });

  test('should view blog list and details', async ({ page }) => {
    await expect(page.locator('text=Blog Du Lịch')).toBeVisible();
    
    const firstBlog = page.locator('.blog-card').first();
    await expect(firstBlog).toBeVisible();
    
    const title = await firstBlog.locator('h3').textContent();
    await firstBlog.click();
    
    await expect(page).toHaveURL(/.*blog\/.+/);
    await expect(page.locator('h1')).toContainText(title || '');
  });

  test('should create a new blog post', async ({ page }) => {
    await page.getByRole('button', { name: 'Viết bài' }).click();
    await expect(page).toHaveURL('/blog/create');

    await page.getByPlaceholder('Tiêu đề bài viết').fill('Chuyến đi tuyệt vời tại Quy Nhơn');
    await page.locator('.ql-editor').fill('Nội dung chi tiết về chuyến đi Quy Nhơn 3 ngày 2 đêm...'); // Quill editor
    await page.getByPlaceholder('Thêm tags...').fill('quynhon, travel, bienda');
    
    await page.getByRole('button', { name: 'Đăng bài' }).click();

    await expect(page.locator('text=Bài viết đã được đăng')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.BLOG);
  });
});
