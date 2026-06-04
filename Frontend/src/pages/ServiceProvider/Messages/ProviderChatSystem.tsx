// src/pages/ServiceProvider/Messages/ProviderChatSystem.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, CheckCheck, Wifi, WifiOff, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProviderChat } from '@/hooks/useProviderChat';
import type { ChatMessage } from '@/types/chat.types';

interface Props {
    className?: string;
}
interface Props {
    onSwitchToAdminTab?: () => void;
}

const ProviderChatSystem: React.FC<Props> = ({ className = '' }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<'general' | 'support' | 'violation' | 'promotion'>('general');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const providerId = String(currentUser?.user?.serviceId || currentUser?.user?.userID || 'provider_unknown');
    const userToken = localStorage.getItem('token') || '';

    const {
        messages,
        notifications,
        isConnected,
        connectionStatus,
        isLoading,
        sendMessage
    } = useProviderChat(providerId, userToken);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim()) {
            return;
        }

        const success = sendMessage(newMessage, selectedTopic);

        if (success) {
            setNewMessage('');
            scrollToBottom();
        }
    };

    const topicOptions = [
        { value: 'general' as const, label: 'Thắc mắc chung' },
        { value: 'support' as const, label: 'Hỗ trợ kỹ thuật' },
        { value: 'violation' as const, label: 'Báo cáo vi phạm' },
        { value: 'promotion' as const, label: 'Quảng bá dịch vụ' }
    ];

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins}m trước`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h trước`;

        return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    };

    const isSent = (msg: ChatMessage) => msg.senderId === providerId;

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <p className="text-gray-500">Vui lòng đăng nhập để sử dụng tính năng chat.</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[calc(100vh-200px)] min-h-[500px] bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            {/* Header with status */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Chat với Hỗ Trợ Hệ Thống</h2>
                        <p className="text-sm text-gray-600 mt-1">Liên lạc trực tiếp với quản trị viên hệ thống</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
                                <Wifi className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Kết nối</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full">
                                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">{connectionStatus}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Unread notifications badge */}
                {notifications.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                            {notifications.filter(n => !n.read).length} thông báo mới
                        </span>
                    </div>
                )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Đang tải...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Chưa có tin nhắn</p>
                        <p className="text-gray-400 text-sm mt-1">Bắt đầu cuộc trò chuyện với hỗ trợ hệ thống</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isProvider = isSent(msg);
                        return (
                            <div key={msg.id} className={`flex ${isProvider ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-lg ${
                                        isProvider
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                    <div className={`flex items-center gap-1 mt-1.5 text-xs ${isProvider ? 'text-blue-100' : 'text-gray-500'}`}>
                                        <span>{formatTime(msg.timestamp)}</span>
                                        {isProvider && msg.isRead && (
                                            <CheckCheck className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Topic selector and message input */}
            <div className="border-t border-gray-200 p-4 bg-white">
                {/* Topic selector */}
                <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Loại yêu cầu:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {topicOptions.map((topic) => (
                            <button
                                key={topic.value}
                                onClick={() => setSelectedTopic(topic.value)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    selectedTopic === topic.value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {topic.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message input form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !newMessage.trim()}
                        className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
                    >
                        <Send className="w-4 h-4" />
                        <span>Gửi</span>
                    </button>
                </form>

                {/* Connection status message */}
                {!isConnected && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Không kết nối được. Vui lòng kiểm tra lại kết nối mạng.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProviderChatSystem;
