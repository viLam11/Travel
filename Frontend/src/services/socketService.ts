import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/types/chat.types';

const BASE_URL = import.meta.env.VITE_API_DEPLOY_URL;
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type MessageCallback = (msg: ChatMessage) => void;
type NotificationCallback = (noti: any) => void;

class SocketService {
    private client: Client | null = null;
    private messageListeners: MessageCallback[] = [];
    private notificationListeners: NotificationCallback[] = [];
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

        this.client = new Client({
            webSocketFactory: () => new SockJS(connectionUrl),
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
            console.log('[SocketService] Connected to server');
            this.updateStatus('CONNECTED');

            this.client?.subscribe('/user/queue/messages', (message) => {
                if (message.body) {
                    try {
                        console.log('[SocketService] Raw WebSocket message body:', message.body);
                        const backendMsg = JSON.parse(message.body);
                        
                        let finalType = backendMsg.attachmentType;
                        if (backendMsg.type === 'ORDER_ATTACHMENT') {
                            finalType = 'order';
                        } else if (backendMsg.type === 'SERVICE_ATTACHMENT') {
                            finalType = 'service';
                        } else if (backendMsg.type?.toString().toLowerCase() === 'chat') {
                            finalType = 'text';
                        } else if (!finalType) {
                            finalType = backendMsg.type?.toString().toLowerCase() as any || 'text';
                        }

                        const resolvedSenderId = backendMsg.sender?.userId?.toString() || backendMsg.senderId?.toString() || 'unknown';
                        const resolvedReceiverId = backendMsg.receiver?.userId?.toString() || backendMsg.receiverId?.toString() || 'unknown';
                        
                        const currentUserStr = localStorage.getItem('currentUser');
                        let currentUserId = '';
                        if (currentUserStr) {
                            try {
                                const parsed = JSON.parse(currentUserStr);
                                currentUserId = parsed?.user?.userID?.toString() || '';
                            } catch (e) {
                                console.error('[SocketService] Error parsing currentUser from localStorage:', e);
                            }
                        }
                        
                        const conversationId = resolvedSenderId === currentUserId ? resolvedReceiverId : resolvedSenderId;

                        const chatMsg: ChatMessage = {
                            id: backendMsg.id || ('msg_' + Date.now()),
                            conversationId: conversationId,
                            senderId: resolvedSenderId,
                            text: backendMsg.content || backendMsg.text || '',
                            type: finalType as any,
                            timestamp: backendMsg.timestamp || backendMsg.createdAt || new Date().toISOString(),
                            isRead: backendMsg.isRead || false,
                            attachmentId: backendMsg.attachmentId || backendMsg.attachment_id || undefined,
                            attachmentData: backendMsg.attachment || backendMsg.attachmentData || backendMsg.attachment_data || undefined
                        };
                        
                        console.log('[SocketService] Mapped (frontend):', chatMsg);
                        console.log(`[SocketService] Broadcasting to ${this.messageListeners.length} active listeners`);
                        this.messageListeners.forEach(cb => cb(chatMsg));
                        console.log(`======================================================\n`);
                    } catch (e) {
                        console.error('[SocketService] Error parsing message body:', e, message.body);
                    }
                }
            });

            // Subscribe to notifications for the current user
            this.client?.subscribe('/user/queue/notifications', (message) => {
                if (message.body) {
                    try {
                        const notification = JSON.parse(message.body);
                        console.log('[SocketService] Received notification:', notification);
                        this.notificationListeners.forEach(cb => cb(notification));
                    } catch (e) {
                        console.error('[SocketService] Error parsing notification body:', e, message.body);
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
        this.notificationListeners = [];
    }

    onMessage(callback: MessageCallback) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
        };
    }

    onNotification(callback: NotificationCallback) {
        this.notificationListeners.push(callback);
        return () => {
            this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
        };
    }

    sendMessage(
        receiverId: string,
        senderId: string,
        text: string,
        _recipientRole: 'user' | 'provider',
        type: 'text' | 'image' | 'system' | 'service' | 'order' = 'text',
        attachmentId?: string
    ): ChatMessage | void {
        console.log('[SocketService] sendMessage called with:', { receiverId, senderId, text, type, attachmentId });

        let backendType = 'CHAT';
        if (attachmentId) {
            if (type === 'order') {
                backendType = 'ORDER_ATTACHMENT';
            } else if (type === 'service') {
                backendType = 'SERVICE_ATTACHMENT';
            }
        }

        const backendPayload: any = {
            senderId,
            receiverId,
            content: text,
            type: backendType,
            read: false
        };

        if (attachmentId) {
            backendPayload.attachmentId = attachmentId;
            backendPayload.attachmentType = type === 'order' ? 'ORDER' : 'SERVICE';
        }

        console.log('[SocketService] Constructed backendPayload:', backendPayload);
        const frontendPayload: ChatMessage = {
            id: 'msg_' + Date.now(),
            conversationId: receiverId,
            senderId,
            text,
            type: type,
            timestamp: new Date().toISOString(),
            isRead: false,
            attachmentId: attachmentId
        };



        if (this.client?.connected) {
            try {
                const sendDestination = '/chat/chat.sendPrivateMessage';
                const userToken = localStorage.getItem('token');

                this.client.publish({
                    destination: sendDestination,
                    headers: userToken ? { Authorization: `Bearer ${userToken}` } : undefined,
                    body: JSON.stringify(backendPayload)
                });

                return frontendPayload;
            } catch (error) {
                console.error(`[SocketService] Failed to publish message:`, error);
                console.log(`======================================================\n`);
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

