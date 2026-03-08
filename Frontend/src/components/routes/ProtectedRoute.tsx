// src/components/routes/ProtectedRoute.tsx
import type { FC, ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/feedback/LoadingSpinner";

interface ProtectedRouteProps {
    children?: ReactNode;
    requiredRole?: 'admin' | 'provider' | 'user';
    redirectTo?: string;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    redirectTo = "/login",
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
    if (requiredRole && currentUser?.user?.role) {
        const userRole = currentUser.user.role.toLowerCase();

        console.log('🔒 ProtectedRoute Check:', {
            requiredRole,
            userRole,
            currentUser: currentUser.user,
            match: userRole === requiredRole.toLowerCase()
        });

        // If specific role required, check exact match
        if (userRole !== requiredRole.toLowerCase()) {
            console.log('❌ Role mismatch - Redirecting...');
            // Redirect based on user role
            let redirectPath = '/homepage';
            if (userRole === 'admin') {
                redirectPath = '/admin/dashboard';
            } else if (userRole === 'provider') {
                redirectPath = '/provider/dashboard';
            }
            return <Navigate to={redirectPath} replace />;
        }
    } else if (!requiredRole && currentUser?.user?.role) {
        // No specific role required, but check if user should have access
        const userRole = currentUser.user.role.toLowerCase();

        // Block regular users from admin/provider panels
        if (userRole === 'user' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider'))) {
            return <Navigate to="/homepage" replace />;
        }
    }

    // Nếu có children (direct element), render children
    // Nếu không có children (layout route), render Outlet
    return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;