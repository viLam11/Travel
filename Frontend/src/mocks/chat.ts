import type { Conversation, ChatMessage } from '@/types/chat.types';

export const mockCurrentUser = {
    id: 'user_123',
    name: '79kcaJ',
    avatar: 'https://www.invert.vn/media/uploads/uploads/2022/10/24145445-jack-4.jpg',
    role: 'user' as const,
};

export const mockLocalProvider = {
    id: 'provider_101',
    name: 'Vinpearl Resort Nha Trang',
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=100&h=100',
    role: 'provider' as const,
    isOnline: true
};

export const mockConversations: Conversation[] = [
    {
        id: 'conv_1',
        participants: [mockCurrentUser, mockLocalProvider],
        lastMessage: {
            id: 'msg_2',
            conversationId: 'conv_1',
            senderId: 'provider_101',
            text: 'Chào bạn, bên mình hiện vẫn còn phòng cho ngày 20/10 nhé.',
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
        },
        unreadCount: 1,
        serviceId: '101',
        serviceName: 'Vinpearl Resort Nha Trang',
        updatedAt: new Date().toISOString()
    },
    {
        id: 'conv_2',
        participants: [
            mockCurrentUser,
            { id: 'provider_102', name: 'Ha Long Bay Tour Guide', avatar: 'https://i.pravatar.cc/150?u=provider_102', role: 'provider' }
        ],
        lastMessage: {
            id: 'msg_3',
            conversationId: 'conv_2',
            senderId: 'user_123',
            text: 'Cảm ơn bạn. Mình sẽ báo lại sau.',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            isRead: true,
            type: 'text'
        },
        unreadCount: 0,
        serviceId: '102',
        serviceName: 'Tour Vịnh Hạ Long 2 ngày 1 đêm',
        updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
];

export const mockMessagesByConversation: Record<string, ChatMessage[]> = {
    'conv_1': [
        {
            id: 'msg_1',
            conversationId: 'conv_1',
            senderId: 'user_123',
            text: 'Cho mình hỏi còn phòng view biển ngày 20/10 không ạ?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: true,
            type: 'text'
        },
        {
            id: 'msg_2',
            conversationId: 'conv_1',
            senderId: 'provider_101',
            text: 'Chào bạn, bên mình hiện vẫn còn phòng cho ngày 20/10 nhé.',
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
        }
    ],
    'conv_2': [
        {
            id: 'msg_0',
            conversationId: 'conv_2',
            senderId: 'user_123',
            text: 'Tour này có bao gồm ăn trưa trên tàu không?',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            isRead: true,
            type: 'text'
        },
        {
            id: 'msg_1',
            conversationId: 'conv_2',
            senderId: 'provider_102',
            text: 'Dạ có ạ, thực đơn bao gồm các món hải sản địa phương.',
            timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
            isRead: true,
            type: 'text'
        },
        {
            id: 'msg_3',
            conversationId: 'conv_2',
            senderId: 'user_123',
            text: 'Cảm ơn bạn. Mình sẽ báo lại sau.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            isRead: true,
            type: 'text'
        }
    ]
};
