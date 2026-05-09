import { test, expect } from '@playwright/test';

/**
 * TEST: QUẢN LÝ BÀI VIẾT DÀNH CHO NGƯỜI DÙNG
 * File này chứa các kịch bản kiểm thử cho User Profile và Chi tiết bài viết
 */

test.describe('User Blog Management & Interaction', () => {
  
  test.describe('Tại trang Profile - Bài viết của tôi', () => {
    test.beforeEach(async ({ page }) => {
      // Giả lập vào trang quản lý bài viết cá nhân
      await page.goto('/user/profile/blogs');
    });

    test('Hiển thị danh sách bài viết cá nhân', async ({ page }) => {
      await expect(page.getByText('Bài viết của tôi')).toBeVisible();
      const blogCards = page.locator('.group.bg-white.rounded-2xl');
      const count = await blogCards.count();
      console.log(`Số bài viết cá nhân tìm thấy: ${count}`);
    });

    test('Chuyển trạng thái bài viết thành Bản nháp', async ({ page }) => {
      // Click menu More
      await page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first().click();
      
      const draftMenu = page.getByText('Chuyển thành nháp');
      if (await draftMenu.isVisible()) {
        await draftMenu.click();
        await expect(page.getByText('Đã cập nhật trạng thái bài viết')).toBeVisible();
      }
    });
  });

  test.describe('Tại trang Chi tiết bài viết - Tương tác', () => {
    const TEST_BLOG_ID = 'any-id'; // Cần ID thực tế hoặc mock

    test('Trả lời bình luận và kiểm tra UI', async ({ page }) => {
      await page.goto(`/blog/${TEST_BLOG_ID}`);
      
      // Cuộn xuống phần bình luận
      await page.locator('#comments-section').scrollIntoViewIfNeeded();
      
      // Click nút "Trả lời" của bình luận đầu tiên
      await page.getByRole('button', { name: 'Trả lời' }).first().click();
      
      // Kiểm tra banner "Đang trả lời..." xuất hiện
      await expect(page.getByText('Đang trả lời')).toBeVisible();
      
      // Nhập nội dung
      const input = page.locator('#comment-input');
      await input.fill('Đây là một phản hồi thử nghiệm từ Playwright');
      await page.keyboard.press('Enter');
      
      // Kiểm tra toast thành công
      await expect(page.getByText('Đã phản hồi bình luận!')).toBeVisible();
    });

    test('Chủ bài viết có quyền xóa bình luận', async ({ page }) => {
      await page.goto(`/blog/${TEST_BLOG_ID}`);
      
      // Giả sử ta đang log in với tư cách chủ bài viết
      // Tìm nút xóa (thùng rác) trong phần bình luận
      const deleteBtn = page.locator('button[title="Xóa bình luận"]').first();
      
      // Nút xóa chỉ hiển thị nếu là chủ bài viết hoặc tác giả comment
      await expect(deleteBtn).toBeVisible();
      
      // Click xóa và chấp nhận dialog confirm
      page.on('dialog', dialog => dialog.accept());
      await deleteBtn.click();
      
      await expect(page.getByText('Đã xóa bình luận')).toBeVisible();
    });
  });
});
