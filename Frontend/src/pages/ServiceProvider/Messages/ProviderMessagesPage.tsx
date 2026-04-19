import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, User, Menu, MessageCircle, Zap, FileText, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { socketService } from '@/services/socketService';
import { chatApi } from '@/api/chatApi';
import type { ChatMessage, Conversation } from '@/types/chat.types';

const ProviderMessagesPage: React.FC = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const activeConversationRef = useRef<Conversation | null>(null);

    // Update ref whenever state changes
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const ADMIN_ID = '1';

    const handleContactAdmin = () => {
        let exists = conversations.find(c => c.id === ADMIN_ID);
        if (exists) {
            handleSelectConversation(exists);
        } else {
            const adminConv: Conversation = {
                id: ADMIN_ID,
                participants: [{ id: ADMIN_ID, name: 'Quản Trị Viên (Hỗ trợ)', role: 'admin', avatar: '' }],
                lastMessage: undefined,
                unreadCount: 0,
                updatedAt: new Date().toISOString()
            };
            setConversations(prev => [adminConv, ...prev]);
            handleSelectConversation(adminConv);
        }
    };

    // Mobile view state
    const [showSidebar, setShowSidebar] = useState(true);

    // Quick replies state
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const quickReplies = [
        "Xin chào! Cảm ơn bạn đã quan tâm. Mình có thể giúp gì cho bạn?",
        "Dạ bên mình vẫn còn phòng/dịch vụ cho ngày bạn chọn ạ. Bạn muốn đặt luôn không?",
        "Xin lỗi bạn, hiện tại bên mình đã hết chỗ cho ngày này rồi ạ.",
        "Giá dịch vụ hiển thị đã bao gồm thuế và phí, không có phụ thu thêm ạ.",
        "Bạn có thể xem chi tiết chính sách hoàn hủy trong phần thông tin của dịch vụ nhé."
    ];

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Load initial conversations for provider
        chatApi.getConversations(currentUser?.user?.userID?.toString() || 'provider_101', 'provider').then(data => {
            setConversations(data);
            setLoading(false);
            if (data.length > 0 && window.innerWidth >= 768) {
                handleSelectConversation(data[0]);
            }
        });

        // Initialize socket
        const token = localStorage.getItem('token') || 'mock_token';
        socketService.connect(token);

        const destroyListener = socketService.onMessage((msg) => {
            const currentActive = activeConversationRef.current;
            
            setMessages(prev => {
                if (currentActive?.id === msg.conversationId) {
                    setTimeout(() => scrollToBottom(), 100);
                    return [...prev, msg];
                }
                return prev;
            });

            setConversations(prev => {
                const existing = prev.find(conv => conv.id === msg.conversationId);
                if (existing) {
                    return prev.map(conv => {
                        if (conv.id === msg.conversationId) {
                            return {
                                ...conv,
                                lastMessage: msg,
                                unreadCount: currentActive?.id === msg.conversationId ? conv.unreadCount : conv.unreadCount + 1,
                                updatedAt: msg.timestamp
                            };
                        }
                        return conv;
                    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                } else {
                    const newConv: Conversation = {
                        id: msg.conversationId,
                        participants: [
                            { id: msg.senderId.toString(), name: msg.senderId.toString(), role: 'user', avatar: '' }
                        ],
                        lastMessage: msg,
                        unreadCount: currentActive?.id === msg.conversationId ? 0 : 1,
                        updatedAt: msg.timestamp,
                        serviceName: 'Hỗ trợ khách hàng'
                    };
                    return [newConv, ...prev].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                }
            });
        });

        return () => {
            destroyListener();
            // Keep socket connected for the entire session
        };
    }, [isAuthenticated, currentUser?.user?.userID]);

    const handleSelectConversation = async (conversation: Conversation) => {
        setActiveConversation(conversation);
        if (window.innerWidth < 768) setShowSidebar(false);
        setLoadingMessages(true);

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

        const receiver = activeConversation.participants.find(p => p.id?.toString() !== currentUser.user.userID.toString());
        const receiverId = receiver?.id?.toString() || activeConversation.id;

        const sentMsg = socketService.sendMessage(
            receiverId,
            currentUser.user.userID.toString() || 'provider_101',
            newMessage,
            (receiver?.role === 'admin' ? 'admin' : 'user') as 'user' | 'provider'
        );

        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage('');

            setConversations(prev => prev.map(conv => {
                if (conv.id === activeConversation.id) {
                    return { ...conv, lastMessage: sentMsg, updatedAt: sentMsg.timestamp };
                }
                return conv;
            }));

            scrollToBottom();
        }
    };

    const handleQuickReplySelect = (text: string) => {
        setNewMessage(text);
        setShowQuickReplies(false);
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <p className="text-gray-500">Vui lòng đăng nhập để xem hệ thống tin nhắn.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex h-[calc(100vh-140px)] min-h-[500px]">

            {/* Left Sidebar - Chat List */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 bg-gray-50/50 ${!showSidebar ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Quản lý tin nhắn</h2>
                    <div className="mt-4 flex gap-2 w-full">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm khách hàng..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <button onClick={handleContactAdmin} title="Liên hệ Hỗ trợ" className="flex-shrink-0 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center">
                            Admin
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 text-sm">
                            Chưa có cuộc trò chuyện nào từ khách hàng.
                        </div>
                    ) : (
                        conversations.map(conv => {
                            // Find the non-provider participant
                            const customer = conv.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101')) || conv.participants[0];
                            const isActive = activeConversation?.id === conv.id;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full text-left p-4 hover:bg-white flex items-start gap-3 transition-colors border-l-4 ${isActive ? 'bg-white border-l-indigo-600 shadow-sm' : 'border-l-transparent border-b border-gray-100'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200">
                                            {customer?.avatar ? (
                                                <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-indigo-400 m-auto mt-3" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                                {customer?.name || 'Khách hàng ẩn danh'}
                                            </h3>
                                            <span className="text-xs text-gray-400 flex-shrink-0 font-medium whitespace-nowrap">
                                                {formatTime(conv.lastMessage?.timestamp)}
                                            </span>
                                        </div>
                                        {conv.serviceName && (
                                            <p className="text-[11px] text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded truncate max-w-full mb-1">
                                                {conv.serviceName}
                                            </p>
                                        )}
                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                            {conv.lastMessage?.senderId === (currentUser?.user?.userID?.toString() || 'provider_101') ? 'Bạn: ' : ''}
                                            {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                                        </p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-3 shadow-sm">
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
            <div className={`flex-1 flex flex-col bg-slate-50 ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-white flex items-center shadow-sm z-10">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="md:hidden mr-3 p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex-shrink-0">
                                {activeConversation.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101'))?.avatar ? (
                                    <img src={activeConversation.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101'))?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-indigo-400 m-auto mt-2" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 ml-3">
                                <h3 className="font-bold text-gray-800 truncate">
                                    {activeConversation.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101'))?.name || 'Khách hàng'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-green-500 font-medium">Đang trực tuyến</p>
                                    <span className="text-gray-300 text-xs">•</span>
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 transition-colors">
                                        <FileText className="w-3 h-3" />
                                        Xem chi tiết/Đơn đặt
                                    </button>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Service Context Banner */}
                        {activeConversation.serviceName && (
                            <div className="bg-indigo-50/80 p-3 border-b border-indigo-100 flex items-center justify-between text-sm">
                                <span className="text-gray-700">
                                    Khách đang hỏi về: <span className="font-bold text-indigo-900">{activeConversation.serviceName}</span>
                                </span>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-400 my-auto text-sm bg-white p-4 rounded-lg border border-dashed border-gray-300 mx-auto max-w-xs">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    Bắt đầu hỗ trợ khách hàng ngay bây giờ.
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.senderId.toString() === (currentUser?.user?.userID?.toString() || 'provider_101');
                                    // Logic for grouping messages could go here

                                    return (
                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMine
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                }`}>
                                                <div className="leading-relaxed">{msg.text}</div>
                                                <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                    {isMine && (
                                                        <svg className={`w-3 h-3 ${msg.isRead ? 'text-blue-300' : 'text-indigo-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200 relative">
                            {/* Quick Replies Popup */}
                            {showQuickReplies && (
                                <div className="absolute bottom-full mb-2 left-4 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20 animate-in slide-in-from-bottom-2">
                                    <div className="bg-indigo-50 px-3 py-2 border-b border-indigo-100 flex justify-between items-center text-sm font-semibold text-indigo-900">
                                        <span>Câu trả lời nhanh</span>
                                        <button onClick={() => setShowQuickReplies(false)} className="text-indigo-400 hover:text-indigo-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {quickReplies.map((reply, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickReplySelect(reply)}
                                                className="w-full text-left p-3 text-sm hover:bg-indigo-50 border-b border-gray-100 last:border-0 transition-colors text-gray-700 hover:text-indigo-700"
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${showQuickReplies ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-500'}`}
                                    title="Câu trả lời nhanh"
                                >
                                    <Zap className="w-5 h-5" />
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Nhập câu trả lời..."
                                        className="w-full bg-gray-100 border border-transparent rounded-full pl-4 pr-12 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 text-white p-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 bg-slate-50">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                            <MessageCircle className="w-10 h-10 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Trung tâm tin nhắn</h3>
                        <p className="text-center max-w-sm text-gray-500">Chọn một cuộc trò chuyện từ danh sách bên trái để phản hồi yêu cầu của khách hàng.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderMessagesPage;
