import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import toast from 'react-hot-toast';

interface UseLogoutOptions {
    redirectTo?: string;
    showToast?: boolean;
    toastMessage?: string;
}

interface UseLogoutReturn {
    logout: (options?: UseLogoutOptions) => Promise<void>;
    isLoggingOut: boolean;
}

/**
 * Custom hook để xử lý logout với các tùy chọn linh hoạt
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout();
 *
 * const handleLogout = async () => {
 *   await logout({
 *     redirectTo: '/login',
 *     showToast: true,
 *     toastMessage: 'Đã đăng xuất thành công!'
 *   });
 * };
 * ```
 */
export const useLogout = (): UseLogoutReturn => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { logout: contextLogout } = useAuth();

    const logout = async (options: UseLogoutOptions = {}): Promise<void> => {
        const {
            redirectTo = ROUTES.HOMEPAGE,
            showToast = true,
            toastMessage = 'Đã đăng xuất thành công!'
        } = options;

        setIsLoggingOut(true);

        try {
            console.log('🚪 Bắt đầu quá trình đăng xuất...');

            // Sử dụng logout từ AuthContext (đã bao gồm cả API và local cleanup)
            await contextLogout();

            // Hiển thị toast nếu được yêu cầu
            if (showToast) {
                toast.success(toastMessage);
            }

            console.log('✅ Đăng xuất thành công, chuyển hướng đến:', redirectTo);

            // Chuyển hướng sau khi logout
            navigate(redirectTo, { replace: true });

        } catch (error) {
            console.error('❌ Lỗi trong quá trình đăng xuất:', error);

            // Thử logout local nếu API thất bại
            try {
                console.log('🔄 Thử logout local...');
                await authService.logoutComplete();

                if (showToast) {
                    toast.success('Đã đăng xuất (offline mode)');
                }

                navigate(redirectTo, { replace: true });
            } catch (localError) {
                console.error('❌ Logout local cũng thất bại:', localError);

                if (showToast) {
                    toast.error('Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.');
                }
            }
        } finally {
            setIsLoggingOut(false);
        }
    };

    return {
        logout,
        isLoggingOut
    };
};