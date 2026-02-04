// src/routes/routes.tsx
import { lazy, type LazyExoticComponent, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { withSuspense } from "@/utils/withSuspense";
import { ROUTES, ROUTE_PERMISSIONS } from "@/constants/routes";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/error-boundary";
import UserLayout from "@/components/common/layout/UserLayout";
import AdminLayout from "@/components/common/layout/AdminLayout";
import UserProfileLayout from "@/components/common/layout/UserProfileLayout";

// ==================== LAZY IMPORTS ====================

// Public Pages
const LoginPage = lazy(() => import("@/pages/Auth/Login/LoginPage"));
const RegisterLandingPage = lazy(() => import("@/pages/Auth/Register/RegisterLandingPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/Register/RegisterPage"));
const HotelProviderRegisterPage = lazy(() => import("@/pages/Auth/Register/HotelProviderRegisterPage"));
const TourProviderRegisterPage = lazy(() => import("@/pages/Auth/Register/TourProviderRegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPassword/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/Auth/ResetPassword/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmail/VerifyEmailPage"));
const GoogleCallbackPage = lazy(() => import("@/pages/Auth/GoogleCallback/GoogleCallbackPage"));

// User Pages
const Homepage = lazy(() => import("@/pages/User/Homepage/Homepage"));
const DestinationFilterPage = lazy(() => import("@/pages/User/DestinationFilter/DestinationFilterPage"));
const HotelFilterPage = lazy(() => import("@/pages/User/HotelFilter/HotelFilterPage"));
const DestinationDetailPage = lazy(() => import("@/pages/User/DestinationDetail/DestinationDetailPage"));
const ServiceDetailPage = lazy(() => import("@/pages/User/ServiceDetail/ServiceDetailPage"));

// User Profile Pages
const UserProfilePage = lazy(() => import("@/pages/User/Profile/UserProfilePage"));
const UserBookingsPage = lazy(() => import("@/pages/User/Bookings/UserBookingsPage"));
const UserTransactionsPage = lazy(() => import("@/pages/User/Transactions/UserTransactionsPage"));
const UserSavedPage = lazy(() => import("@/pages/User/Saved/UserSavedPage"));

// Admin Pages
const HotelDashboard = lazy(() => import("@/pages/ServiceProvider/Dashboard/DashBoardPage"));
const AdminAddServicePage = lazy(() => import("@/pages/ServiceProvider/Services/AddServicePage"));
const AdminServiceListPage = lazy(() => import("@/pages/ServiceProvider/Services/ServiceListPage"));
const AdminEditServicePage = lazy(() => import("@/pages/ServiceProvider/Services/EditServicePage"));
const AdminAddHotelPage = lazy(() => import("@/pages/ServiceProvider/Hotels/AddHotelPage"));
const AdminHotelListPage = lazy(() => import("@/pages/ServiceProvider/Hotels/HotelListPage"));
const AdminEditHotelPage = lazy(() => import("@/pages/ServiceProvider/Hotels/EditHotelPage"));
const AdminRoomManagementPage = lazy(() => import("@/pages/ServiceProvider/Rooms/RoomManagementPage"));
const AdminBookingsManagementPage = lazy(() => import("@/pages/ServiceProvider/Bookings/BookingsManagementPage"));
const AdminReviewsManagementPage = lazy(() => import("@/pages/ServiceProvider/Reviews/ReviewsManagementPage"));
const NotFoundPage = lazy(() => import("@/pages/User/not-found/NotFoundPage"));


// ==================== HELPER FUNCTIONS ====================

const createProtectedRoute = (
  path: string,
  element: ReactNode,
  requiredRole?: 'admin' | 'user'
): ReactNode => {
  const permissions = ROUTE_PERMISSIONS[path];

  if (!permissions && !requiredRole) {
    return element;
  }

  return (
    <ProtectedRoute requiredRole={requiredRole || permissions?.roles[0] as 'admin' | 'user'}>
      {element}
    </ProtectedRoute>
  );
};

// ==================== ROUTE CONFIGURATION ====================

const routes: RouteObject[] = [
  // Root redirect
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.HOMEPAGE} replace />,
  },

  // ==================== PUBLIC AUTH ROUTES ====================
  {
    path: ROUTES.LOGIN,
    element: withSuspense(LoginPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: ROUTES.REGISTER,
    element: withSuspense(RegisterLandingPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: '/register/customer',
    element: withSuspense(RegisterPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: '/register/hotel-owner',
    element: withSuspense(HotelProviderRegisterPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: '/register/tour-provider',
    element: withSuspense(TourProviderRegisterPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: withSuspense(ForgotPasswordPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: withSuspense(ResetPasswordPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: withSuspense(VerifyEmailPage as LazyExoticComponent<ComponentType<unknown>>),
  },
  {
    path: '/auth/google/callback',
    element: withSuspense(GoogleCallbackPage as LazyExoticComponent<ComponentType<unknown>>),
  },

  // ==================== USER ROUTES (với UserLayout) ====================
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <UserLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: ROUTES.HOMEPAGE,
        element: withSuspense(Homepage as LazyExoticComponent<ComponentType<unknown>>),
      },
      // {
      //   path: ROUTES.DESTINATIONS,
      //   element: withSuspense(DestinationFilterPage as LazyExoticComponent<ComponentType<unknown>>),
      // },
      // {
      //   path: ROUTES.DESTINATION_DETAIL,
      //   element: withSuspense(DestinationDetailPage as LazyExoticComponent<ComponentType<unknown>>),
      // },
      // {
      //   path: ROUTES.SERVICE_DETAIL,
      //   element: withSuspense(ServiceDetailPage as LazyExoticComponent<ComponentType<unknown>>),
      // },

      // ==================== DESTINATION ROUTES - NEW STRUCTURE ====================

      // Filter Page - Có thể filter theo region hoặc destination
      // Example: /destinations?region=mien-bac
      // Example: /destinations/mien-trung/da-nang/hotel
      {
        path: 'destinations',
        element: withSuspense(DestinationFilterPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // Destination Detail Page - Hiển thị overview của 1 tỉnh
      // URL: /destinations/:region/:destination
      // Example: /destinations/mien-trung/da-nang
      {
        path: 'destinations/:region/:destination',
        element: withSuspense(DestinationFilterPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // Filter by Service Type - List hotels/places trong 1 tỉnh
      // URL: /destinations/:region/:destination/:serviceType
      // Example: /destinations/mien-trung/da-nang/hotel
      {
        path: 'destinations/:region/:destination/:serviceType',
        element: withSuspense(DestinationFilterPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // Service Detail Page - Chi tiết 1 hotel/place cụ thể
      // URL: /destinations/:region/:destination/:serviceType/:idSlug
      // Example: /destinations/mien-trung/da-nang/hotel/101-vinpearl-resort
      {
        path: 'destinations/:region/:destination/:serviceType/:idSlug',
        element: withSuspense(ServiceDetailPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // ==================== HOTEL ROUTES ====================

      // Hotel Filter Page - List all hotels
      // URL: /hotels
      // Example: /hotels?destination=Nha+Trang
      {
        path: 'hotels',
        element: withSuspense(HotelFilterPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // Hotel Filter by Region/Destination
      // URL: /hotels/:region/:destination
      // Example: /hotels/mien-trung/nha-trang
      {
        path: 'hotels/:region/:destination',
        element: withSuspense(HotelFilterPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // ==================== USER PROFILE ROUTES (Protected) ====================
      {
        path: ROUTES.USER_ROOT,
        element: (
          <ProtectedRoute requiredRole="user">
            <UserProfileLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.USER_PROFILE} replace />,
          },
          {
            path: "profile",
            element: withSuspense(UserProfilePage as LazyExoticComponent<ComponentType<unknown>>),
          },
          {
            path: "bookings",
            element: withSuspense(UserBookingsPage as LazyExoticComponent<ComponentType<unknown>>),
          },
          {
            path: "transactions",
            element: withSuspense(UserTransactionsPage as LazyExoticComponent<ComponentType<unknown>>),
          },
          {
            path: "saved",
            element: withSuspense(UserSavedPage as LazyExoticComponent<ComponentType<unknown>>),
          },
          {
            path: "success/payment",
            element: <div>SUCCESS PAYMENT</div>,
            // element: withSuspense(UserSavedPage as LazyExoticComponent<ComponentType<unknown>>),
          }
        ],
      },
    ],
  },

  // ==================== ADMIN ROUTES (Protected) ====================
  {
    path: ROUTES.ADMIN_ROOT,
    element: (
      <ErrorBoundary>
        <ProtectedRoute showHeader={true}>
          <AdminLayout />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      // Dashboard
      {
        index: true,
        element: <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />,
      },
      {
        path: "dashboard",
        element: withSuspense(HotelDashboard as LazyExoticComponent<ComponentType<unknown>>),
      },

      // ==================== SERVICES ROUTES ====================
      {
        path: "services",
        element: <div className="p-6 text-lg">Admin Services Dashboard</div>,
      },
      {
        path: "services/new",
        element: withSuspense(AdminAddServicePage as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "services/list",
        element: withSuspense(AdminServiceListPage as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "services/edit/:id",
        element: withSuspense(AdminEditServicePage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // ==================== HOTELS ROUTES ====================
      {
        path: "hotels",
        element: withSuspense(HotelDashboard as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "hotels/list",
        element: withSuspense(AdminHotelListPage as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "hotels/new",
        element: withSuspense(AdminAddHotelPage as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "hotels/rooms",
        element: withSuspense(AdminRoomManagementPage as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "hotels/edit/:id",
        element: withSuspense(AdminEditHotelPage as LazyExoticComponent<ComponentType<unknown>>),
      },

      // ==================== OTHER ADMIN ROUTES ====================
      {
        path: "users",
        element: <div className="p-6 text-lg">Admin Users Management Page</div>,
      },
      {
        path: "bookings",
        element: withSuspense(AdminBookingsManagementPage as LazyExoticComponent<ComponentType<unknown>>),
      },
      {
        path: "reviews",
        element: withSuspense(AdminReviewsManagementPage as LazyExoticComponent<ComponentType<unknown>>),
      },
    ],
  },

  // ==================== 404 NOT FOUND ====================
  {
    path: "*",
    element: withSuspense(NotFoundPage as LazyExoticComponent<ComponentType<unknown>>),
  },
];

// ==================== CREATE ROUTER ====================

const router = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
    v7_fetcherPersist: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default router;