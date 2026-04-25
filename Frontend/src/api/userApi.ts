import apiClient from '../services/apiClient';
import { MOCK_USERS_DATA, type MockUser } from '@/mocks/users';

const USE_MOCK = false; // Set to false to use real backend API

export const userApi = {
    getAllUsers: async (): Promise<any[]> => {
        try {
            return await apiClient.users.getAll();
        } catch (error) {
            console.error('Failed to get users', error);
            throw error;
        }
    },

    toggleUserStatus: async (userId: string | number): Promise<void> => {
        try {
            await apiClient.users.toggleUserStatus(userId);
        } catch (error) {
            console.error('Failed to toggle user status', error);
            throw error;
        }
    },

    updateUser: async (userId: string | number, data: any): Promise<void> => {
        try {
            await apiClient.users.update(Number(userId), data);
        } catch (error) {
            console.error('Failed to update user', error);
            throw error;
        }
    },

    deleteUser: async (userId: string | number): Promise<void> => {
        try {
            await apiClient.delete(`/users/${userId}`);
        } catch (error) {
            console.error('Failed to delete user', error);
            throw error;
        }
    }
};

