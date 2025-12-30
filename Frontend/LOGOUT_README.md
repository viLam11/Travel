# Hướng dẫn sử dụng hàm Logout

## Tổng quan

Hệ thống logout được thiết kế với 3 tầng:

1. **AuthService**: Xử lý API calls và local storage cleanup
2. **AuthContext**: Quản lý authentication state
3. **useLogout Hook**: Interface dễ sử dụng cho components

## Cách sử dụng

### 1. Sử dụng useLogout Hook (Khuyến nghị)

```tsx
import { useLogout } from '@/hooks/useLogout';

const MyComponent = () => {
  const { logout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout({
      redirectTo: '/login',           // Trang chuyển hướng
      showToast: true,                // Hiển thị thông báo
      toastMessage: 'Tạm biệt!'       // Nội dung thông báo
    });
  };

  return (
    <button onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
    </button>
  );
};
```

### 2. Sử dụng trực tiếp AuthContext

```tsx
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect manually if needed
  };
};
```

### 3. Sử dụng AuthService trực tiếp

```tsx
import { authService } from '@/services/authService';

// Logout hoàn chỉnh (API + local cleanup)
await authService.logoutComplete();

// Chỉ logout API
await authService.logout();

// Chỉ cleanup local
authService.clearLocalAuthData();
```

## Các tính năng

- ✅ **API Integration**: Gọi server để invalidate token
- ✅ **Local Cleanup**: Xóa dữ liệu từ localStorage
- ✅ **State Management**: Cập nhật React state
- ✅ **Error Handling**: Xử lý lỗi graceful
- ✅ **Loading States**: Hiển thị trạng thái loading
- ✅ **Toast Notifications**: Thông báo cho user
- ✅ **Flexible Redirect**: Tùy chỉnh trang chuyển hướng

## Flow hoạt động

```
User clicks logout → useLogout hook → AuthContext.logout() → authService.logoutComplete()
    ↓
API call (invalidate token) + Local cleanup → Update React state → Show toast → Redirect
```

## Error Scenarios

1. **API fails**: Tiếp tục với local cleanup
2. **Network error**: Fallback to local logout
3. **State error**: Clear localStorage và reset state

## Best Practices

- Sử dụng `useLogout` hook cho components
- Luôn check `isLoggingOut` state để disable UI
- Sử dụng `toast` để thông báo cho user
- Redirect đến trang phù hợp (login/home)