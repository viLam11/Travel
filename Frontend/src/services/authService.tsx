import type { LoginCredentials, UserPermissions } from '@/types';
import apiClient from './apiClient';

class AuthService {
    async login(credentials: LoginCredentials): Promise<UserPermissions> {
        const loginData = {
            email: credentials.email,
            password: credentials.password,
            remember_me: credentials.remember_me ?? false
        };
        return await apiClient.auth.login(loginData);
    }

    async refreshToken(): Promise<void> {
        return await apiClient.auth.refresh();
    }

    async logout(): Promise<void> {
        try {
            // Call logout API to invalidate token on server
            await apiClient.auth.logout();
            console.log('Đăng xuất thành công từ server');
        } catch (error) {
            console.error(' Lỗi khi đăng xuất từ server:', error);
            // Continue with local logout even if API fails
            throw error; // Re-throw để caller biết có lỗi
        }
    }

    /**
     * Utility function để logout hoàn chỉnh bao gồm cả local cleanup
     * Sử dụng khi cần logout từ service level
     */
    async logoutComplete(): Promise<void> {
        try {
            // 1. Gọi API logout trước
            await this.logout();
        } catch (error) {
            console.warn('⚠️ API logout thất bại, tiếp tục cleanup local');
        }

        // 2. Cleanup local storage (luôn thực hiện)
        this.clearLocalAuthData();

        console.log('Đăng xuất hoàn tất (local cleanup)');
    }

    /**
     * Xóa tất cả dữ liệu authentication từ localStorage
     */
    clearLocalAuthData(): void {
        const keysToRemove = ['token', 'currentUser', 'refreshToken', 'userPermissions'];
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log(' Đã xóa dữ liệu auth từ localStorage');
    }

    /**
     * Kiểm tra xem user có đang đăng nhập không
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    }

    /**
     * Lấy token hiện tại
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Lấy thông tin user hiện tại từ localStorage
     */
    // getCurrentUser(): any {
    //     const userStr = localStorage.getItem('currentUser');
    //     if (userStr) {
    //         try {
    //             return JSON.parse(userStr);
    //         } catch (error) {
    //             console.error('❌ Lỗi parse currentUser từ localStorage:', error);
    //             return null;
    //         }
    //     }
    //     return null;
    // }

    async getCurrentUser(): Promise<UserPermissions> {
        // return await apiClient.users.me();
        return {
            user: {
                name: "System Administrator",
                email: "admin@admin.com",
                role: "admin",
                id: "1",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            user_id: 1,
            global_role: "admin",
            global_permissions: [],
            team_roles: {},
            team_permissions: {},
        };
    }

    async getUserPermissions(): Promise<UserPermissions> {
        return {
            user: {
                name: "System Administrator",
                email: "admin@admin.com",
                role: "admin",
                id: "1",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            user_id: 1,
            global_role: "admin",
            global_permissions: [],
            team_roles: {},
            team_permissions: {},
        };
    }
}

export const authService = new AuthService();