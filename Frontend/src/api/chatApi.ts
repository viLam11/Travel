import type { Conversation, ChatMessage } from '@/types/chat.types';
import apiClient from '../services/apiClient';
import { mockConversations, mockMessagesByConversation } from '@/mocks/chat';

const USE_MOCK = false; // Set to false to use real backend APIs by default

interface BackendChatMessage {
    id: string;
    content: string;
    type: 'CHAT' | 'JOIN' | 'LEAVE' | 'text' | 'image' | 'system';
    createdAt: string;
    isRead: boolean;
    sender: {
        userId: string;
        username: string;
        avatarUrl: string;
    };
    receiver: {
        userId: string;
        username: string;
        avatarUrl: string;
    };
}

interface PageResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

const mapBackendToFrontendMessage = (msg: BackendChatMessage): ChatMessage => {
    const messageType = msg.type || 'CHAT';
    return {
        id: msg.id,
        conversationId: msg.sender?.userId || 'unknown',
        senderId: msg.sender?.userId || 'unknown',
        text: msg.content || '',
        timestamp: msg.createdAt || new Date().toISOString(),
        isRead: msg.isRead || false,
        type: messageType.toLowerCase() === 'chat' ? 'text' : (messageType.toLowerCase() as any)
    };
};

export const chatApi = {
    // Fetch all conversations for a user or provider
    getConversations: async (userId: string, _role: 'user' | 'provider'): Promise<Conversation[]> => {
        if (USE_MOCK || localStorage.getItem('token')?.startsWith('mock-token-')) {
            return mockConversations;
        }

        try {
            const lastMessages = await apiClient.get<BackendChatMessage[]>(`/api/chat/chat-list`);
            
            if (!Array.isArray(lastMessages)) {
                console.warn('Expected array for chat list, got:', lastMessages);
                return [];
            }

            return lastMessages.map(msg => {
                const otherUser = msg.sender.userId === userId ? msg.receiver : msg.sender;
                return {
                    id: otherUser.userId, // Use other user's ID as conversation ID for simplicity in 1-1 chat
                    participants: [
                        { id: msg.sender.userId, name: msg.sender.username, avatar: msg.sender.avatarUrl, role: 'user' },
                        { id: msg.receiver.userId, name: msg.receiver.username, avatar: msg.receiver.avatarUrl, role: 'user' }
                    ],
                    lastMessage: mapBackendToFrontendMessage(msg),
                    unreadCount: msg.isRead ? 0 : (msg.receiver.userId === userId ? 1 : 0),
                    updatedAt: msg.createdAt,
                    serviceName: 'Hỗ trợ khách hàng'
                };
            });
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            return [];
        }
    },

    // Fetch messages for a specific conversation
    getMessages: async (otherUserId: string): Promise<ChatMessage[]> => {
        if (USE_MOCK || localStorage.getItem('token')?.startsWith('mock-token-')) {
            return mockMessagesByConversation[otherUserId] || [];
        }

        const response = await apiClient.get<PageResponse<BackendChatMessage>>(`/api/chat/history/${otherUserId}`, {
            params: { pageSize: 50 }
        });

        return response.content.map(mapBackendToFrontendMessage).reverse(); // Reverse to get chronological order if backend sends newest first
    },

    // Mark messages as read
    markAsRead: async (senderId: string): Promise<void> => {
        if (USE_MOCK || localStorage.getItem('token')?.startsWith('mock-token-')) {
            return Promise.resolve();
        }
        return apiClient.put(`/api/chat/mark-read/${senderId}`, {});
    },

    // Create or get conversation for a specific service and provider
    getOrCreateConversation: async (_serviceId: string, providerId: string): Promise<Conversation> => {
        if (USE_MOCK || localStorage.getItem('token')?.startsWith('mock-token-')) {
            return mockConversations[0];
        }
        // Backend currently doesn't have an explicit conversation creation endpoint that returns a Conversation object
        // we just return a shell or the 1-1 history will be fetched by otherUserId
        return {
            id: providerId,
            participants: [],
            unreadCount: 0,
            updatedAt: new Date().toISOString()
        };
    },

    deleteMessage: async (messageId: string): Promise<void> => {
        return apiClient.delete(`/api/chat/delete/${messageId}`);
    },

    updateMessageContent: async (messageId: string, newContent: string): Promise<BackendChatMessage> => {
        return apiClient.patch(`/api/chat/update-content/${messageId}`, { content: newContent });
    }
};
