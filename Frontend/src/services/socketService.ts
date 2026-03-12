import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/types/chat.types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

type MessageCallback = (msg: ChatMessage) => void;

class SocketService {
    private client: Client | null = null;
    private messageListeners: MessageCallback[] = [];

    connect(userToken: string) {
        if (this.client?.active) return;

        const socket = new SockJS(`${BASE_URL}/ws`);
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
                    const chatMsg: ChatMessage = JSON.parse(message.body);
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

    sendMessage(conversationId: string, senderId: string, text: string, recipientRole: 'user' | 'provider', type: 'text' | 'image' = 'text') {
        if (!this.client?.connected) {
            console.warn('[SocketService] Cannot send message: Not connected');
            return;
        }

        const payload = {
            conversationId,
            senderId,
            text,
            recipientRole,
            type,
            timestamp: new Date().toISOString()
        };

        // Backend MessageMapping: /chat/send.message (example prefix /chat from applicationDestinationPrefixes)
        this.client.publish({
            destination: '/chat/send.message',
            body: JSON.stringify(payload)
        });
    }
}

export const socketService = new SocketService();
