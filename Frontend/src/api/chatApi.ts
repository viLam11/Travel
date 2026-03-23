import type { Conversation, ChatMessage } from '@/types/chat.types';
import apiClient from '../services/apiClient';

export const chatApi = {
    // Fetch all conversations for a user or provider
    getConversations: async (userId: string, role: 'user' | 'provider'): Promise<Conversation[]> => {
        return apiClient.get<Conversation[]>(`/api/chat/conversations`, {
            params: { userId, role }
        });
    },

    // Fetch messages for a specific conversation
    getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
        return apiClient.get<ChatMessage[]>(`/api/chat/conversations/${conversationId}/messages`);
    },

    // Mark messages as read
    markAsRead: async (conversationId: string): Promise<void> => {
        return apiClient.post(`/api/chat/conversations/${conversationId}/read`, {});
    },

    // Create or get conversation for a specific service and provider
    getOrCreateConversation: async (serviceId: string, providerId: string): Promise<Conversation> => {
        return apiClient.post(`/api/chat/conversations`, { serviceId, providerId });
    }
};
