/**
 * Ví dụ sử dụng hàm logout trong các component khác
 *
 * Import và sử dụng useLogout hook:
 * ```tsx
 * import { useLogout } from '@/hooks/useLogout';
 *
 * const MyComponent = () => {
 *   const { logout, isLoggingOut } = useLogout();
 *
 *   const handleLogout = async () => {
 *     await logout({
 *       redirectTo: '/login',           // Chuyển hướng đến trang login
 *       showToast: true,                // Hiển thị toast thông báo
 *       toastMessage: 'Tạm biệt!'       // Nội dung toast
 *     });
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleLogout}
 *       disabled={isLoggingOut}
 *     >
 *       {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
 *     </button>
 *   );
 * };
 * ```
 *
 * Các tùy chọn có sẵn:
 * - `redirectTo`: Đường dẫn chuyển hướng sau khi logout (mặc định: ROUTES.HOMEPAGE)
 * - `showToast`: Có hiển thị toast thông báo không (mặc định: true)
 * - `toastMessage`: Nội dung toast (mặc định: 'Đã đăng xuất thành công!')
 *
 * Logout flow:
 * 1. Gọi API logout để invalidate token trên server
 * 2. Xóa dữ liệu auth từ localStorage
 * 3. Cập nhật AuthContext state
 * 4. Hiển thị toast (nếu được bật)
 * 5. Chuyển hướng đến trang chỉ định
 *
 * Error handling:
 * - Nếu API logout thất bại, sẽ thử logout local
 * - Luôn đảm bảo cleanup local data
 * - Hiển thị toast lỗi nếu cần
 */