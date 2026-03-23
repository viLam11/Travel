import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, User, ChevronLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { socketService } from '@/services/socketService';
import { chatApi } from '@/api/chatApi';
import type { ChatMessage, Conversation } from '@/types/chat.types';

const UserMessagesPage: React.FC = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Mobile view state
    const [showChatArea, setShowChatArea] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Load initial conversations
        chatApi.getConversations(currentUser?.user?.userID?.toString() || 'user_123', 'user').then(data => {
            setConversations(data);
            setLoading(false);
            if (data.length > 0) {
                // Determine active conversation logic? Wait for user to click or auto-select first
                // Let's auto-select first for desktop
                if (window.innerWidth >= 768) {
                    handleSelectConversation(data[0]);
                }
            }
        });

        // Initialize socket
        const token = localStorage.getItem('token') || 'mock_token';
        socketService.connect(token);

        const destroyListener = socketService.onMessage((msg) => {
            // Update messages if it's the active conversation
            setMessages(prev => {
                // We need to check active conversation from ref or pass via dependency
                if (activeConversation?.id === msg.conversationId) {
                    setTimeout(() => scrollToBottom(), 100);
                    return [...prev, msg];
                }
                return prev;
            });

            // Update conversation list
            setConversations(prev => prev.map(conv => {
                if (conv.id === msg.conversationId) {
                    return {
                        ...conv,
                        lastMessage: msg,
                        unreadCount: activeConversation?.id === msg.conversationId ? conv.unreadCount : conv.unreadCount + 1,
                        updatedAt: msg.timestamp
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        });

        return () => {
            destroyListener();
            socketService.disconnect();
        };
    }, [isAuthenticated, currentUser?.user?.userID]); // Note: activeConversation is omitted intentionally to avoid re-binding socket, but handle it carefully

    const handleSelectConversation = async (conversation: Conversation) => {
        setActiveConversation(conversation);
        setShowChatArea(true);
        setLoadingMessages(true);

        // In real app, mark as read on BE
        if (conversation.unreadCount > 0) {
            await chatApi.markAsRead(conversation.id);
            setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
        }

        const msgs = await chatApi.getMessages(conversation.id);
        setMessages(msgs);
        setLoadingMessages(false);
        scrollToBottom();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !currentUser?.user) return;

        const sentMsg = socketService.sendMessage(
            activeConversation.id,
            currentUser.user.userID.toString() || 'user_123',
            newMessage,
            'provider'
        );

        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage('');

            // Update local conversation list
            setConversations(prev => prev.map(conv => {
                if (conv.id === activeConversation.id) {
                    return { ...conv, lastMessage: sentMsg, updatedAt: sentMsg.timestamp };
                }
                return conv;
            }));

            scrollToBottom();
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <p className="text-gray-500">Vui lòng đăng nhập để xem tin nhắn.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex h-[600px] sm:h-[700px]">

            {/* Left Sidebar - Chat List */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 ${showChatArea ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold text-gray-800">Tin nhắn</h2>
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm cuộc trò chuyện..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 text-sm">
                            Chưa có cuộc trò chuyện nào.
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const provider = conv.participants.find(p => p.role === 'provider');
                            const isActive = activeConversation?.id === conv.id;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full text-left p-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b border-gray-100 cursor-pointer ${isActive ? 'bg-orange-50' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                            {provider?.avatar ? (
                                                <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400 m-auto mt-3" />
                                            )}
                                        </div>
                                        {provider?.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                                {provider?.name || 'Nhà cung cấp'}
                                            </h3>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {formatTime(conv.lastMessage?.timestamp)}
                                            </span>
                                        </div>
                                        {conv.serviceName && (
                                            <p className="text-xs text-orange-500 truncate mb-0.5">
                                                Dịch vụ: {conv.serviceName}
                                            </p>
                                        )}
                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                            {conv.lastMessage?.senderId === (currentUser?.user?.userID?.toString() || 'user_123') ? 'Bạn: ' : ''}
                                            {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                                        </p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-3">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className={`flex-1 flex flex-col bg-white ${!showChatArea ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                            <button
                                onClick={() => setShowChatArea(false)}
                                className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {activeConversation.participants.find(p => p.role === 'provider')?.avatar ? (
                                    <img src={activeConversation.participants.find(p => p.role === 'provider')?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-gray-400 m-auto mt-2" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">
                                    {activeConversation.participants.find(p => p.role === 'provider')?.name || 'Nhà cung cấp'}
                                </h3>
                                <p className="text-xs text-green-500">Đang hoạt động</p>
                            </div>
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full cursor-pointer">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Service Context Banner */}
                        {activeConversation.serviceName && (
                            <div className="bg-orange-50 p-3 border-b border-orange-100 flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Đang tư vấn về: <span className="font-medium text-gray-900">{activeConversation.serviceName}</span>
                                </span>
                                {/* Could add a Link back to service here */}
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-400 my-auto text-sm">
                                    Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện.
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMine = msg.senderId === (currentUser?.user?.userID?.toString() || 'user_123');
                                    return (
                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMine
                                                ? 'bg-orange-500 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                }`}>
                                                {msg.text}
                                                <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMine ? 'text-orange-100' : 'text-gray-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn của bạn..."
                                    className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm cursor-pointer"
                                >
                                    <Send className="w-5 h-5 -ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMessagesPage;
