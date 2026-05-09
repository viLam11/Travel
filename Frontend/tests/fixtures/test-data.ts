export const TEST_ACCOUNTS = {
  customer: {
    email: 'customer@test.com',
    password: 'Password123!',
    name: 'Test Customer',
  },
  provider: {
    email: 'provider@test.com',
    password: 'Password123!',
    name: 'Test Provider',
  },
  admin: {
    email: 'admin@test.com',
    password: 'Password123!',
    name: 'Test Admin',
  },
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Customer
  HOMEPAGE: '/homepage',
  DESTINATIONS: '/destinations',
  AI_PLANNER: '/ai-planner',
  BLOG: '/blog',
  PROFILE: '/profile',
  BOOKING_HISTORY: '/profile/bookings',
  
  // Provider
  PROVIDER_DASHBOARD: '/provider/dashboard',
  PROVIDER_SERVICES: '/provider/services/list',
  PROVIDER_BOOKINGS: '/provider/bookings',
  PROVIDER_DISCOUNTS: '/provider/discounts',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SYSTEM: '/admin/system',
};

export const TEST_DATA = {
  BOOKING: {
    customerName: 'Nguyen Van A',
    customerPhone: '0987654321',
    customerEmail: 'customer@test.com',
    customerNote: 'Test booking note',
    bookingDate: new Date().toISOString().split('T')[0],
  },
  SERVICE: {
    name: 'New Test Service',
    description: 'This is a test service description.',
    address: '123 Test St, Da Nang',
    price: 1000000,
  },
};
