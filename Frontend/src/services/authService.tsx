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
        await apiClient.auth.logout();
    }

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