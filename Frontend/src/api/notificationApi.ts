import apiClient from '@/services/apiClient';
import type { NotificationResponse } from '@/types/notification.types';

export const notificationApi = {
    getUserNotifications: async (page = 0, size = 10): Promise<{
        content: NotificationResponse[];
        totalElements: number;
        totalPages: number;
        pageNo: number;
    }> => {
        try {
            return await apiClient.notifications.getUserNotifications(page, size);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    getUnreadCount: async (): Promise<number> => {
        try {
            return await apiClient.notifications.getUnreadCount();
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    markAsRead: async (id: string): Promise<void> => {
        try {
            await apiClient.notifications.markAsRead(id);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async (): Promise<void> => {
        try {
            await apiClient.notifications.markAllAsRead();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    deleteNotification: async (id: string): Promise<void> => {
        try {
            await apiClient.notifications.delete(id);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};
