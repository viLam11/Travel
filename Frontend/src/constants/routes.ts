// src/constants/routes.ts

export const ROUTES = {
  // ==================== PUBLIC ROUTES ====================
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email',
  
  // ==================== USER ROUTES ====================
  HOMEPAGE: '/homepage',
  DESTINATIONS: '/destinations',
  DESTINATION_DETAIL: '/destinations/:destination',
  SERVICE_DETAIL: '/destinations/:destination/:serviceType/:idSlug',
  
  // User Profile Routes
  USER_ROOT: '/user',
  USER_PROFILE: '/user/profile',
  USER_BOOKINGS: '/user/bookings',
  USER_TRANSACTIONS: '/user/transactions',
  USER_SAVED: '/user/saved',
  USER_SETTINGS: '/user/settings',
  USER_NOTIFICATIONS: '/user/notifications',
  
  // ==================== ADMIN ROUTES ====================
  ADMIN_ROOT: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_USERS: '/admin/users',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_REVIEWS: '/admin/reviews',
} as const;

export const ROUTE_PERMISSIONS: Record<string, { roles: string[] }> = {
  // Admin routes require 'admin' role
  [ROUTES.ADMIN_DASHBOARD]: { roles: ['admin'] },
  [ROUTES.ADMIN_SERVICES]: { roles: ['admin'] },
  [ROUTES.ADMIN_USERS]: { roles: ['admin'] },
  [ROUTES.ADMIN_BOOKINGS]: { roles: ['admin'] },
  [ROUTES.ADMIN_REVIEWS]: { roles: ['admin'] },
  
  // User profile routes require authentication (user or admin)
  [ROUTES.USER_PROFILE]: { roles: ['user', 'admin'] },
  [ROUTES.USER_BOOKINGS]: { roles: ['user', 'admin'] },
  [ROUTES.USER_TRANSACTIONS]: { roles: ['user', 'admin'] },
  [ROUTES.USER_SAVED]: { roles: ['user', 'admin'] },
  [ROUTES.USER_SETTINGS]: { roles: ['user', 'admin'] },
  [ROUTES.USER_NOTIFICATIONS]: { roles: ['user', 'admin'] },
};

// Helper functions
export const isProtectedRoute = (path: string): boolean => {
  return path.startsWith('/admin') || path.startsWith('/user');
};

export const isPublicRoute = (path: string): boolean => {
  const publicPaths = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.VERIFY_EMAIL,
  ];
  return publicPaths.some(p => path.startsWith(p));
};

export const getRedirectPath = (role: 'admin' | 'user' | null): string => {
  if (role === 'admin') return ROUTES.ADMIN_DASHBOARD;
  if (role === 'user') return ROUTES.HOMEPAGE;
  return ROUTES.LOGIN;
};

// Route labels for breadcrumbs and navigation
export const ROUTE_LABELS: Record<string, string> = {
  // Admin routes
  [ROUTES.ADMIN_DASHBOARD]: 'Dashboard',
  [ROUTES.ADMIN_SERVICES]: 'Services',
  [ROUTES.ADMIN_USERS]: 'Users',
  [ROUTES.ADMIN_BOOKINGS]: 'Bookings',
  [ROUTES.ADMIN_REVIEWS]: 'Reviews',
  
  // Public routes
  [ROUTES.HOMEPAGE]: 'Trang chủ',
  [ROUTES.DESTINATIONS]: 'Địa điểm',
  
  // User profile routes
  [ROUTES.USER_PROFILE]: 'Chỉnh sửa hồ sơ',
  [ROUTES.USER_BOOKINGS]: 'Đặt chỗ của tôi',
  [ROUTES.USER_TRANSACTIONS]: 'Danh sách giao dịch',
  [ROUTES.USER_SAVED]: 'Đã lưu',
  [ROUTES.USER_SETTINGS]: 'Cài đặt',
  [ROUTES.USER_NOTIFICATIONS]: 'Thông báo',
};