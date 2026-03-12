import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { socketService } from '@/services/socketService';
import { chatApi } from '@/api/chatApi';
import type { ChatMessage } from '@/types/chat.types';

interface ServiceChatWidgetProps {
    providerId: string;
    providerName: string;
    serviceId: string;
    serviceName: string;
}

const ServiceChatWidget: React.FC<ServiceChatWidgetProps> = ({ providerId, providerName, serviceId, serviceName }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && isAuthenticated && !conversationId) {
            setLoading(true);
            chatApi.getOrCreateConversation(serviceId, providerId)
                .then(conv => {
                    setConversationId(conv.id);
                })
                .catch(err => {
                    console.error('Failed to get conversation:', err);
                    setLoading(false);
                });
        }
    }, [isOpen, isAuthenticated, serviceId, providerId, conversationId]);

    useEffect(() => {
        if (isOpen && isAuthenticated && conversationId) {
            setLoading(true);
            // Load initial messages for this service if any exist
            chatApi.getMessages(conversationId).then(msgs => {
                setMessages(msgs || []);
                setLoading(false);
                scrollToBottom();
            });

            // Connect socket
            const token = localStorage.getItem('token');
            if (token) {
                socketService.connect(token);
            }

            // Listen for new messages
            const destroyListener = socketService.onMessage((msg) => {
                if (msg.conversationId === conversationId) {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                }
            });

            return () => {
                destroyListener();
                socketService.disconnect();
            };
        }
    }, [isOpen, isAuthenticated, conversationId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !isAuthenticated || !currentUser?.user || !conversationId) return;

        const currentUserId = currentUser.user.userID.toString();
        
        socketService.sendMessage(
            conversationId,
            currentUserId,
            newMessage,
            'provider'
        );

        // Optimistic update
        const optimisticMsg: ChatMessage = {
            id: `temp_${Date.now()}`,
            conversationId,
            senderId: currentUserId,
            text: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        scrollToBottom();
    };

    const toggleWidget = () => {
        if (!isAuthenticated) {
            // If not authenticated, let the parent handle logic or show a toast
            // For now just alert based on useAuth hook
            alert("Vui lòng đăng nhập để chat với chủ dịch vụ.");
            return;
        }
        setIsOpen(!isOpen);
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleWidget}
                className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-xl hover:bg-orange-600 transition-all z-50 flex items-center justify-center animate-bounce"
                aria-label="Chat với chủ dịch vụ"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden" style={{ height: '500px' }}>
            {/* Header */}
            <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{providerName}</h3>
                        <p className="text-xs text-orange-100 line-clamp-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                            Đang trực tuyến
                        </p>
                    </div>
                </div>
                <button onClick={toggleWidget} className="p-1 hover:bg-orange-600 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Info Context */}
            <div className="bg-orange-50 p-3 border-b border-orange-100 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <p className="text-xs text-orange-800">
                    Bạn đang hỏi về: <span className="font-medium">{serviceName}</span>
                </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 my-auto text-sm">
                        Hãy gửi tin nhắn đầu tiên để được tư vấn!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === (currentUser?.user?.userID?.toString() || 'user_123'); // Adjust user check
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                    {msg.text}
                                    <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-orange-100' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <Send className="w-5 h-5 -ml-0.5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceChatWidget;
