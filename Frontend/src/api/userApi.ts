import apiClient from '../services/apiClient';
import { MOCK_USERS_DATA, type MockUser } from '@/mocks/users';

const USE_MOCK = false; // Set to false to use real backend API

export const userApi = {
    getAllUsers: async (): Promise<MockUser[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [...MOCK_USERS_DATA];
        }
        try {
            // BE might map this to GET /users or similar
            return await apiClient.get('/users/admin/all');
        } catch (error) {
            console.error('Failed to get users', error);
            throw error;
        }
    },

    updateUserStatus: async (userId: number, status: 'active' | 'blocked' | 'pending'): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        }
        try {
            await apiClient.patch(`/users/admin/${userId}/status`, { status });
        } catch (error) {
            console.error('Failed to update user status', error);
            throw error;
        }
    },

    updateUserRole: async (userId: number, role: 'admin' | 'provider' | 'user'): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        }
        try {
            await apiClient.patch(`/users/admin/${userId}/role`, { role });
        } catch (error) {
            console.error('Failed to update user role', error);
            throw error;
        }
    },

    deleteUser: async (userId: number): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        }
        try {
            await apiClient.delete(`/users/admin/${userId}`);
        } catch (error) {
            console.error('Failed to delete user', error);
            throw error;
        }
    }
};
