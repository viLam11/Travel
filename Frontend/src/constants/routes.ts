// src/constants/routes.ts

export const ROUTES = {
  // ==================== PUBLIC ROUTES ====================
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
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

  // ==================== ADMIN ROUTES (System Admin) ====================
  ADMIN_ROOT: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_EDIT_SERVICE: '/admin/services/edit/:id',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_USERS: '/admin/users',
  ADMIN_APPROVALS: '/admin/approvals',
  ADMIN_PROMOTIONS: '/admin/promotions',
  ADMIN_MESSAGES: '/admin/messages',

  // ==================== SERVICE PROVIDER ROUTES ====================
  PROVIDER_ROOT: '/provider',
  PROVIDER_DASHBOARD: '/provider/dashboard',
  PROVIDER_MY_SERVICE: '/provider/my-service',
  PROVIDER_EDIT_SERVICE: '/provider/service/edit',
  PROVIDER_ROOMS: '/provider/rooms',
  PROVIDER_TICKETS: '/provider/tickets',
  PROVIDER_BOOKINGS: '/provider/bookings',
  PROVIDER_REVIEWS: '/provider/reviews',

  // ==================== AI PLANNER ====================
  AI_PLANNER: '/ai-planner',

  // ==================== BLOG ====================
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:id',
  BLOG_CREATE: '/blog/create',
} as const;

export const ROUTE_PERMISSIONS: Record<string, { roles: string[] }> = {
  // Admin routes require 'admin' role ONLY
  [ROUTES.ADMIN_DASHBOARD]: { roles: ['admin'] },
  [ROUTES.ADMIN_SERVICES]: { roles: ['admin'] },
  [ROUTES.ADMIN_REVIEWS]: { roles: ['admin'] },
  [ROUTES.ADMIN_USERS]: { roles: ['admin'] },
  [ROUTES.ADMIN_APPROVALS]: { roles: ['admin'] },
  [ROUTES.ADMIN_PROMOTIONS]: { roles: ['admin'] },
  [ROUTES.ADMIN_MESSAGES]: { roles: ['admin'] },

  // Provider routes require 'provider' role
  [ROUTES.PROVIDER_DASHBOARD]: { roles: ['provider'] },
  [ROUTES.PROVIDER_MY_SERVICE]: { roles: ['provider'] },
  [ROUTES.PROVIDER_EDIT_SERVICE]: { roles: ['provider'] },
  [ROUTES.PROVIDER_ROOMS]: { roles: ['provider'] },
  [ROUTES.PROVIDER_TICKETS]: { roles: ['provider'] },
  [ROUTES.PROVIDER_BOOKINGS]: { roles: ['provider'] },
  [ROUTES.PROVIDER_REVIEWS]: { roles: ['provider'] },

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
  return path.startsWith('/admin') || path.startsWith('/provider') || path.startsWith('/user');
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

export const getRedirectPath = (role: 'admin' | 'provider' | 'user' | null): string => {
  if (role === 'admin') return ROUTES.ADMIN_DASHBOARD;
  if (role === 'provider') return ROUTES.PROVIDER_DASHBOARD;
  if (role === 'user') return ROUTES.HOMEPAGE;
  return ROUTES.LOGIN;
};

// Route labels for breadcrumbs and navigation
export const ROUTE_LABELS: Record<string, string> = {
  // Admin routes
  [ROUTES.ADMIN_DASHBOARD]: 'Quản trị hệ thống',
  [ROUTES.ADMIN_SERVICES]: 'Quản lý dịch vụ',
  [ROUTES.ADMIN_REVIEWS]: 'Kiểm duyệt đánh giá',
  [ROUTES.ADMIN_USERS]: 'Quản lý người dùng',
  [ROUTES.ADMIN_APPROVALS]: 'Duyệt dịch vụ',
  [ROUTES.ADMIN_PROMOTIONS]: 'Ưu đãi hệ thống',
  [ROUTES.ADMIN_MESSAGES]: 'Hỗ trợ Chủ dịch vụ',

  // Provider routes
  [ROUTES.PROVIDER_DASHBOARD]: 'Tổng quan',
  [ROUTES.PROVIDER_MY_SERVICE]: 'Dịch vụ của tôi',
  [ROUTES.PROVIDER_EDIT_SERVICE]: 'Chỉnh sửa dịch vụ',
  [ROUTES.PROVIDER_ROOMS]: 'Quản lý phòng',
  [ROUTES.PROVIDER_TICKETS]: 'Quản lý vé',
  [ROUTES.PROVIDER_BOOKINGS]: 'Đơn đặt',
  [ROUTES.PROVIDER_REVIEWS]: 'Đánh giá',

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