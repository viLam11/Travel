// import type { FC, ReactNode } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
// import { ROUTES } from "@/constants/routes";
// import { LoadingSpinner } from "@/components/common/feedback/LoadingSpinner";
import { AdminLayout } from "@/components/common/layout";

// interface ProtectedRouteProps {
//     children: ReactNode;
//     requiredRole?: string;
//     redirectTo?: string;
//     title?: string;
//     showHeader?: boolean;
// }

// const ProtectedRoute: FC<ProtectedRouteProps> = ({
//     children,
//     requiredRole,
//     redirectTo = ROUTES.LOGIN,
//     showHeader = true,
// }) => {
//     const location = useLocation();
//     const { isAuthenticated, currentUser, isLoading } = useAuth();

//     if (isLoading) {
//         return <LoadingSpinner />;
//     }

//     // if (!isAuthenticated) {
//     //     return <Navigate to={redirectTo} state={{ from: location }} replace />;
//     // }

//     // if (requiredRole && currentUser?.user?.role !== requiredRole) {
//     //     return <Navigate to={ROUTES.ROOT} replace />;
//     // }

//     return (
//         <AdminLayout showHeader={showHeader}>
//             {children}
//         </AdminLayout>
//     );
// };

// export default ProtectedRoute; 

// src/components/routes/ProtectedRoute.tsx
import type { FC, ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/feedback/LoadingSpinner";

interface ProtectedRouteProps {
    children?: ReactNode;
    requiredRole?: 'admin' | 'user';
    redirectTo?: string;
    showHeader?: boolean;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    redirectTo = "/login",
    showHeader = true,
}) => {
    const location = useLocation();
    const { isAuthenticated, currentUser, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role authorization
    if (requiredRole && currentUser?.user?.role !== requiredRole) {
        // Redirect based on user role
        const redirectPath = currentUser?.user?.role === 'admin' 
            ? '/admin/dashboard' 
            : '/homepage';
        return <Navigate to={redirectPath} replace />;
    }

    // Nếu có children (direct element), render children
    // Nếu không có children (layout route), render Outlet
    return <>{children || <Outlet />}</>;

    // return (
    //         <AdminLayout showHeader={showHeader}>
    //             {children}
    //         </AdminLayout>
    //     );
};

export default ProtectedRoute;