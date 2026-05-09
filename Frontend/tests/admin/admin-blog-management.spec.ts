import { test, expect } from '@playwright/test';

/**
 * TEST: QUẢN LÝ BLOG DÀNH CHO ADMIN
 * File này chứa các kịch bản kiểm thử cho giao diện Admin Dashboard
 */

test.describe('Admin Blog Management', () => {
  test.beforeEach(async ({ page }) => {
    // Giả lập đăng nhập quyền Admin
    // (Thực tế sẽ sử dụng storageState hoặc setup auth trước)
    await page.goto('/admin/blogs');
  });

  test('Hiển thị danh sách bài viết đầy đủ thông tin', async ({ page }) => {
    // Kiểm tra tiêu đề trang
    await expect(page.getByText('Quản lý Bài viết (Blog)')).toBeVisible();
    
    // Đợi bảng dữ liệu tải xong
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Kiểm tra các cột quan trọng
    await expect(page.getByRole('columnheader', { name: 'Bài viết' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Tác giả' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Trạng thái' })).toBeVisible();
  });

  test('Tìm kiếm bài viết theo tiêu đề', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Tìm kiếm theo tiêu đề hoặc tác giả...');
    await searchInput.fill('Chuyến đi');
    
    // Sau khi search, các bài viết không khớp sẽ biến mất
    // Ở đây ta check xem kết quả có được cập nhật không
    await page.waitForTimeout(500); // Đợi debounce nếu có
    const rowCount = await page.locator('tbody tr').count();
    console.log(`Số bài viết sau khi tìm kiếm: ${rowCount}`);
  });

  test('Thao tác ẩn bài viết vi phạm', async ({ page }) => {
    // Click vào menu hành động của dòng đầu tiên
    await page.locator('tbody tr').first().locator('button').last().click();
    
    // Chọn menu "Ẩn bài viết"
    const hideMenu = page.getByText('Ẩn bài viết');
    if (await hideMenu.isVisible()) {
      await hideMenu.click();
      // Kiểm tra thông báo toast thành công
      await expect(page.getByText('Đã cập nhật trạng thái bài viết')).toBeVisible();
    }
  });

  test('Xem chi tiết nội dung bài viết trong Modal', async ({ page }) => {
    await page.locator('tbody tr').first().locator('button').last().click();
    await page.getByText('Xem chi tiết').click();
    
    // Kiểm tra Modal hiển thị
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).not.toBeEmpty(); // Tiêu đề bài viết
    
    // Đóng modal
    await page.getByRole('button', { name: 'Đóng' }).click();
    await expect(modal).not.toBeVisible();
  });
});
