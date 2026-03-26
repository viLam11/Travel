import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/types/chat.types';

const BASE_URL = import.meta.env.VITE_API_DEPLOY_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';

type MessageCallback = (msg: ChatMessage) => void;

class SocketService {
    private client: Client | null = null;
    private messageListeners: MessageCallback[] = [];

    connect(userToken: string) {
        if (this.client?.active) return;

        const normalizedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        const connectionUrl = `${normalizedBaseUrl}/ws`;
        console.log('[SocketService] Connecting to:', connectionUrl);
        const socket = new SockJS(connectionUrl);
        this.client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${userToken}`
            },
            debug: (str) => {
                console.log('[SocketService Debug]', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('[SocketService] Connected:', frame);

            // Subscribe to private messages for the current user
            // Backend config: registry.setUserDestinationPrefix("/user");
            // registry.enableSimpleBroker("/topic", "/queue");
            this.client?.subscribe('/user/queue/messages', (message) => {
                if (message.body) {
                    const backendMsg = JSON.parse(message.body);
                    
                    // Map backendDTO to frontend ChatMessage
                    const chatMsg: ChatMessage = {
                        id: backendMsg.id || ('msg_' + Date.now()),
                        conversationId: backendMsg.senderId, // Derive from sender for 1-1
                        senderId: backendMsg.senderId,
                        text: backendMsg.content || backendMsg.text, // Handle both
                        type: backendMsg.type?.toLowerCase() === 'chat' ? 'text' : (backendMsg.type?.toLowerCase() || 'text'),
                        timestamp: backendMsg.timestamp || new Date().toISOString(),
                        isRead: backendMsg.isRead || false
                    };
                    
                    this.messageListeners.forEach(cb => cb(chatMsg));
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('[SocketService] Broker reported error: ' + frame.headers['message']);
            console.error('[SocketService] Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.messageListeners = [];
    }

    onMessage(callback: MessageCallback) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
        };
    }

    sendMessage(receiverId: string, senderId: string, text: string, _recipientRole: 'user' | 'provider', type: 'text' | 'image' = 'text'): ChatMessage | void {
        // Backend ChatMessageDTO: senderId, receiverId, content, type (MessageType), isRead
        const backendPayload = {
            senderId,
            receiverId,
            content: text,
            type: 'CHAT',
            isRead: false
        };

        const frontendPayload: ChatMessage = {
            id: 'msg_' + Date.now(),
            conversationId: receiverId,
            senderId,
            text,
            type: type as 'text' | 'image' | 'system',
            timestamp: new Date().toISOString(),
            isRead: false
        };

        console.log(`[SocketService] Preparing to send message to ${receiverId}:`, backendPayload);

        if (this.client?.connected) {
            this.client.publish({
                destination: '/chat/chat.sendPrivateMessage',
                body: JSON.stringify(backendPayload)
            });
            return frontendPayload;
        } else {
            console.warn('[SocketService] Not connected to socket server');
            // If it's a mock token, we definitely want to return the payload so the UI updates
            if (localStorage.getItem('token')?.startsWith('mock-token-') || localStorage.getItem('token') === 'mock_token') {
                return frontendPayload;
            }
            return;
        }
    }
}

export const socketService = new SocketService();
