export type ChatUserRole = 'user' | 'provider' | 'admin';

export interface ChatUser {
    id: string; // Could be userId or providerId
    name: string;
    avatar: string;
    role: ChatUserRole;
    isOnline?: boolean;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string; // Matches ChatUser.id
    text: string;
    timestamp: string; // ISO string
    isRead: boolean;
    type: 'text' | 'image' | 'system';
}

export interface Conversation {
    id: string;
    participants: ChatUser[]; // Usually 2 people: 1 user & 1 provider
    lastMessage?: ChatMessage;
    unreadCount: number;
    serviceId?: string; // Optional: If the chat is specifically linked to a service inquiry
    serviceName?: string;
    updatedAt: string; // ISO string
}
