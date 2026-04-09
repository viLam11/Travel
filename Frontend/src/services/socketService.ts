import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/types/chat.types';

const BASE_URL = import.meta.env.VITE_API_DEPLOY_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';

type MessageCallback = (msg: ChatMessage) => void;

class SocketService {
    private client: Client | null = null;
    private messageListeners: MessageCallback[] = [];
    private statusListeners: ((status: string) => void)[] = [];
    public connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' = 'DISCONNECTED';

    private updateStatus(status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR') {
        this.connectionStatus = status;
        this.statusListeners.forEach(cb => cb(status));
    }

    onStatusChange(callback: (status: string) => void) {
        this.statusListeners.push(callback);
        return () => {
            this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
        };
    }

    connect(userToken: string) {
        if (this.client?.active && this.connectionStatus !== 'DISCONNECTED') {
            console.log('[SocketService] Already active/connecting, skipping connect call. Status:', this.connectionStatus);
            return;
        }

        const normalizedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        const connectionUrl = `${normalizedBaseUrl}/ws`;
        
        console.log('[SocketService] Starting connection to:', connectionUrl);
        this.updateStatus('CONNECTING');

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
            console.log('[SocketService] Successfully connected!', frame);
            this.updateStatus('CONNECTED');

            // Subscribe to private messages for the current user
            this.client?.subscribe('/user/queue/messages', (message) => {
                if (message.body) {
                    try {
                        const backendMsg = JSON.parse(message.body);
                        console.log('[SocketService] Received private message raw:', backendMsg);
                        
                        const chatMsg: ChatMessage = {
                            id: backendMsg.id || ('msg_' + Date.now()),
                            conversationId: backendMsg.senderId?.toString() || 'unknown',
                            senderId: backendMsg.senderId?.toString() || 'unknown',
                            text: backendMsg.content || backendMsg.text || '',
                            type: backendMsg.type?.toString().toLowerCase() === 'chat' ? 'text' : (backendMsg.type?.toString().toLowerCase() as any || 'text'),
                            timestamp: backendMsg.timestamp || backendMsg.createdAt || new Date().toISOString(),
                            isRead: backendMsg.isRead || false
                        };
                        
                        this.messageListeners.forEach(cb => cb(chatMsg));
                    } catch (e) {
                        console.error('[SocketService] Error parsing message body:', e, message.body);
                    }
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('[SocketService] STOMP error:', frame.headers['message']);
            this.updateStatus('ERROR');
        };

        this.client.onWebSocketClose = () => {
            console.log('[SocketService] Web Socket closed');
            this.updateStatus('DISCONNECTED');
        };

        this.client.activate();
    }

    disconnect() {
        console.log('[SocketService] Disconnecting...');
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.updateStatus('DISCONNECTED');
        this.messageListeners = [];
    }

    onMessage(callback: MessageCallback) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
        };
    }

    sendMessage(receiverId: string, senderId: string, text: string, _recipientRole: 'user' | 'provider', type: 'text' | 'image' = 'text'): ChatMessage | void {
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

        console.log(`[SocketService] sendMessage attempt:`, {
            status: this.connectionStatus,
            active: this.client?.active,
            connected: this.client?.connected
        });

        if (this.client?.connected) {
            try {
                this.client.publish({
                    destination: '/chat/chat.sendPrivateMessage',
                    body: JSON.stringify(backendPayload)
                });
                console.log(`[SocketService] Message published successfully`);
                return frontendPayload;
            } catch (error) {
                console.error(`[SocketService] Failed to publish message:`, error);
                return;
            }
        } else {
            console.warn(`[SocketService] Cannot send message - status: ${this.connectionStatus}`);
            // If it's a mock token, we definitely want to return the payload so the UI updates
            if (localStorage.getItem('token')?.startsWith('mock-token-') || localStorage.getItem('token') === 'mock_token') {
                console.info('[SocketService] Mock mode: showing message in UI');
                return frontendPayload;
            }
            return;
        }
    }
}

export const socketService = new SocketService();
