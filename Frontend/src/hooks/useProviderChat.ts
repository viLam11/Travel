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
            // For system chat, we might want to filter or just append
            setMessages(prev => [...prev, msg]);
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
            // System/Admin chat might have a specific receiver ID. Let's use 'admin' or something based on typical implementation.
            // But since the current socketService expects receiverId, we'll pass 'system'
            const newMsg = socketService.sendMessage('system', providerId, `[${topic.toUpperCase()}] ${text}`, 'provider', 'text', attachmentId);
            if (newMsg) {
                setMessages(prev => [...prev, newMsg]);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Failed to send message", e);
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
