import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socketService';
import type { ChatMessage } from '@/types/chat.types';

export const useProviderChat = (providerId: string, userToken: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<string>('DISCONNECTED');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!userToken) return;

        setIsLoading(true);
        socketService.connect(userToken);

        const unsubStatus = socketService.onStatusChange((status) => {
            setConnectionStatus(status);
            if (status === 'CONNECTED' || status === 'ERROR') {
                setIsLoading(false);
            }
        });

        const unsubMessage = socketService.onMessage((msg: ChatMessage) => {
            setMessages(prev => {
                // Deduplicate by ID (real ID) or by content+sender for messages without a server ID
                const isDuplicate =
                    (msg.id && !msg.id.startsWith('msg_') && prev.some(p => p.id === msg.id)) ||
                    prev.some(p => !p.id.startsWith('msg_') && p.text.trim() === msg.text.trim() && p.senderId === msg.senderId && Math.abs(new Date(p.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 3000);
                if (isDuplicate) return prev;
                return [...prev, msg];
            });
        });

        const unsubNotification = socketService.onNotification((noti: any) => {
            setNotifications(prev => [noti, ...prev]);
        });

        return () => {
            unsubStatus();
            unsubMessage();
            unsubNotification();
            socketService.disconnect();
        };
    }, [providerId, userToken]);

    const sendMessage = useCallback((text: string, topic: string, attachmentId?: string) => {
        if (connectionStatus !== 'CONNECTED') return false;
        try {
            const result = socketService.sendMessage('system', providerId, `[${topic.toUpperCase()}] ${text}`, 'provider', 'text', attachmentId);
            // Do NOT add optimistically — the server echoes the message back via onMessage,
            // which is the single source of truth. Adding here + echo = duplicate.
            return !!result;
        } catch (e) {
            console.error('Failed to send message', e);
            return false;
        }
    }, [connectionStatus, providerId]);

    return {
        messages,
        notifications,
        isConnected: connectionStatus === 'CONNECTED',
        connectionStatus,
        isLoading,
        sendMessage
    };
};
