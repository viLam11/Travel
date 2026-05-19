// src/pages/ServiceProvider/Messages/ProviderMessagesPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MoreVertical, Send, User, Menu, MessageCircle, Zap, FileText, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { socketService } from '@/services/socketService';
import { chatApi } from '@/api/chatApi';
import { userApi } from '@/api/userApi';
import { toast } from 'react-hot-toast';
import type { ChatMessage, Conversation } from '@/types/chat.types';
import { ROUTES } from '@/constants/routes';

const ProviderMessagesPage: React.FC = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const activeConversationRef = useRef<Conversation | null>(null);

    // Flag to track if we've handled the redirect state
    const handledRedirect = useRef(false);

    // Update ref whenever state changes
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const handleContactAdmin = async () => {
        try {
            // 1. Lấy danh sách users từ BE
            const users = await userApi.getAllUsers();
            
            // 2. Tìm một tài khoản Admin thật sự trong DB
            const adminUser = users.find((u: any) => u.role === 'ADMIN');
            
            if (!adminUser) {
                toast.error("Không tìm thấy Quản trị viên nào trong hệ thống!");
                return;
            }

            const realAdminId = adminUser.userID;

            // 3. Kiểm tra xem đã có hội thoại với Admin này chưa
            let exists = conversations.find(c => c.id === realAdminId || c.participants.some(p => p.role === 'admin'));
            
            if (exists) {
                handleSelectConversation(exists);
            } else {
                const adminConv: Conversation = {
                    id: realAdminId,
                    participants: [{ id: realAdminId, name: adminUser.fullname || 'Quản Trị Viên (Hỗ trợ)', role: 'admin', avatar: adminUser.avatarUrl || '' }],
                    lastMessage: undefined,
                    unreadCount: 0,
                    updatedAt: new Date().toISOString(),
                    serviceName: 'Hỗ trợ hệ thống'
                };
                setConversations(prev => [adminConv, ...prev]);
                handleSelectConversation(adminConv);
            }
        } catch (error) {
            console.error("Lỗi khi tìm Admin:", error);
            toast.error("Không thể kết nối đến Quản trị viên. Vui lòng thử lại sau.");
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

    // Handle redirect from Help page
    useEffect(() => {
        if (!loading && conversations.length >= 0 && !handledRedirect.current) {
            const state = location.state as { openAdminChat?: boolean };
            if (state?.openAdminChat) {
                handleContactAdmin();
                handledRedirect.current = true;
            }
        }
    }, [loading, conversations]);

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
            <div className="flex items-center justify-center min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Vui lòng đăng nhập để xem hệ thống tin nhắn.</p>
                </div>
            </div>
        );
    }

    if (!currentUser?.user?.hasService) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-gray-900/30 min-h-[500px] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 m-6">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-800/50 rotate-3">
                    <Zap className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sẵn sàng để bắt đầu?</h3>
                <p className="text-center max-w-md text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Bạn chưa có dịch vụ nào đang hoạt động, vì vậy chưa thể nhận tin nhắn từ khách hàng. Hãy thiết lập dịch vụ của bạn để bắt đầu kết nối nhé!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button 
                        onClick={() => window.location.href = ROUTES.PROVIDER_MY_SERVICE}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                        Thiết lập ngay
                    </button>
                    <button 
                        onClick={handleContactAdmin}
                        className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 h-12 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        Chat với Admin
                    </button>
                </div>
                <p className="mt-8 text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Hỗ trợ kỹ thuật 24/7 luôn sẵn sàng
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex h-[calc(100vh-140px)] min-h-[500px]">

            {/* Left Sidebar - Chat List */}
            <div className={`w-full md:w-80 lg:w-[380px] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 ${!showSidebar ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Tin nhắn</h2>
                        <button 
                            onClick={handleContactAdmin} 
                            title="Liên hệ Hỗ trợ" 
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center border shadow-sm ${activeConversation?.participants?.some(p => p.role === 'admin') ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100'}`}
                        >
                            Hỗ trợ Admin
                        </button>
                    </div>
                    {activeConversation?.participants?.some(p => p.role === 'admin') && (
                        <button 
                            onClick={() => {
                                // Filter out the admin support conversation from the list
                                const regularConvs = conversations.filter(c => !c.participants.some(p => p.role === 'admin'));
                                setConversations(regularConvs);
                                
                                // Select the first regular conversation if available, otherwise clear
                                if (regularConvs.length > 0) {
                                    handleSelectConversation(regularConvs[0]);
                                } else {
                                    setActiveConversation(null);
                                }
                            }}
                            className="w-full mb-4 py-2 text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-2 bg-gray-50 rounded-lg border border-dashed border-gray-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <X className="w-3 h-3" /> Thoát chế độ hỗ trợ
                        </button>
                    )}
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách hàng..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-sm focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-10 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
                            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Tin nhắn từ khách hàng sẽ xuất hiện ở đây.</p>
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
                                    className={`w-full text-left p-4 hover:bg-white dark:hover:bg-gray-800/80 flex items-start gap-4 transition-all border-l-4 ${isActive ? 'bg-white dark:bg-gray-800 border-l-indigo-600 shadow-sm' : 'border-l-transparent border-b border-gray-100 dark:border-gray-800'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                                            {customer?.avatar ? (
                                                <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-indigo-400 dark:text-indigo-500 m-auto mt-3" />
                                            )}
                                        </div>
                                        {/* Online indicator mock */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                                    </div>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>
                                                {customer?.name || 'Khách hàng ẩn danh'}
                                            </h3>
                                            <span className={`text-[11px] flex-shrink-0 font-medium whitespace-nowrap ${conv.unreadCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {formatTime(conv.lastMessage?.timestamp)}
                                            </span>
                                        </div>
                                        {conv.serviceName && (
                                            <div className="flex mb-1.5">
                                                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md truncate max-w-[90%] border border-indigo-100 dark:border-indigo-800/50">
                                                    {conv.serviceName}
                                                </span>
                                            </div>
                                        )}
                                        <p className={`text-[13px] truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {conv.lastMessage?.senderId === (currentUser?.user?.userID?.toString() || 'provider_101') ? 'Bạn: ' : ''}
                                            {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                                        </p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div className="bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0 mt-3 shadow-sm">
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
            <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-gray-900/30 relative ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex items-center shadow-sm z-10 sticky top-0">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="md:hidden mr-3 p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex-shrink-0">
                                {activeConversation.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101'))?.avatar ? (
                                    <img src={activeConversation.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101'))?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-indigo-400 dark:text-indigo-500 m-auto mt-2" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 ml-3">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                    {activeConversation.participants.find(p => p.id?.toString() !== (currentUser?.user?.userID?.toString() || 'provider_101'))?.name || 'Khách hàng'}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Đang trực tuyến</p>
                                    <span className="text-gray-300 dark:text-gray-600 text-xs mx-1">•</span>
                                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                        <FileText className="w-3 h-3" />
                                        Xem đơn đặt
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Service Context Banner */}
                        {activeConversation.serviceName && (
                            <div className="bg-indigo-50/80 dark:bg-indigo-900/20 p-3 flex items-center justify-center text-[13px] border-b border-indigo-100 dark:border-indigo-900/50">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    Khách đang quan tâm đến: <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md shadow-sm">{activeConversation.serviceName}</span>
                                </span>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-400 my-auto bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mx-auto max-w-sm backdrop-blur-sm">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <MessageCircle className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Bắt đầu trò chuyện</h4>
                                    <p className="text-sm">Hãy gửi tin nhắn đầu tiên để hỗ trợ khách hàng của bạn.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMine = msg.senderId.toString() === (currentUser?.user?.userID?.toString() || 'provider_101');
                                    // Logic for grouping messages could go here to remove duplicate avatars/timestamps
                                    const showTime = index === 0 || new Date(msg.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;

                                    return (
                                        <div key={msg.id} className="flex flex-col">
                                            {showTime && (
                                                <div className="flex justify-center mb-4 mt-2">
                                                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                        {new Date(msg.timestamp).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                                                {!isMine && (
                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 mb-1">
                                                        <User className="w-4 h-4 text-gray-400 m-auto mt-1" />
                                                    </div>
                                                )}
                                                
                                                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-[14.5px] shadow-sm relative group ${isMine
                                                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                                                    }`}>
                                                    <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                                    <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 font-medium ${isMine ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                                        {formatTime(msg.timestamp)}
                                                        {isMine && (
                                                            <svg className={`w-3.5 h-3.5 ${msg.isRead ? 'text-blue-300' : 'text-indigo-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                {msg.isRead ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7 M5 13l4 4L19 7" /> // Double check for read
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                )}
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative z-20">
                            {/* Quick Replies Popup */}
                            {showQuickReplies && (
                                <div className="absolute bottom-full mb-3 left-4 md:left-14 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 animate-in slide-in-from-bottom-2 origin-bottom-left">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/50 flex justify-between items-center text-sm font-bold text-indigo-900 dark:text-indigo-300">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                            Câu trả lời nhanh
                                        </div>
                                        <button onClick={() => setShowQuickReplies(false)} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 bg-white dark:bg-gray-800 rounded-full p-1 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                        {quickReplies.map((reply, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickReplySelect(reply)}
                                                className="w-full text-left p-3 text-[13px] leading-snug hover:bg-indigo-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300"
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                                    className={`p-3 rounded-full transition-all flex-shrink-0 ${showQuickReplies ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                                    title="Câu trả lời nhanh"
                                >
                                    <Zap className="w-5 h-5" />
                                </button>

                                <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-[24px] border border-transparent focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 transition-all flex items-end">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Nhập tin nhắn... (Nhấn Enter để gửi)"
                                        className="w-full bg-transparent border-0 pl-5 pr-14 py-3.5 text-[14.5px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 resize-none max-h-32 min-h-[52px]"
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="absolute right-1.5 bottom-1.5 bg-indigo-600 dark:bg-indigo-500 text-white p-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-transform disabled:opacity-50 disabled:scale-95 shadow-md hover:scale-105"
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-gray-900/30">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                            <MessageCircle className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trung tâm hỗ trợ khách hàng</h3>
                        <p className="text-center max-w-sm text-gray-500 dark:text-gray-400 text-sm">Chọn một cuộc trò chuyện từ danh sách bên trái để giải đáp thắc mắc và hỗ trợ khách hàng của bạn.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderMessagesPage;
