import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, User, ChevronLeft, MessageCircle, Tag, X, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { socketService } from '@/services/socketService';
import { chatApi } from '@/api/chatApi';
import type { ChatMessage, Conversation } from '@/types/chat.types';
import { BookingContextCard } from '@/components/chat/BookingContextCard';
import apiClient from '@/services/apiClient';

const UserMessagesPage: React.FC = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const incomingServiceId = searchParams.get('serviceId');
    const incomingBookingId = searchParams.get('bookingId');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const activeConversationRef = useRef<Conversation | null>(null);

    // Sync ref with state
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Tự động cuộn xuống dưới cùng khi danh sách tin nhắn thay đổi hoặc mở hội thoại mới
    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages.length, activeConversation?.id]);

    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Quick-chat suggestions state
    const [activeBookingType, setActiveBookingType] = useState<'hotel' | 'ticket' | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState<{ id: string; type: 'order' | 'service' } | null>(null);

    // Mobile view state
    const [showChatArea, setShowChatArea] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatInitializedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !currentUser?.user?.userID) return;

        const currentUserIdStr = currentUser.user.userID.toString();
        if (chatInitializedRef.current === currentUserIdStr) return;
        chatInitializedRef.current = currentUserIdStr;

        const initializeChat = async () => {
            try {
                // 1. Fetch conversations
                const data = await chatApi.getConversations(currentUserIdStr, 'user');
                setConversations(data);
                setLoading(false);
                
                // 2. Resolve target provider & service details
                let targetProviderId = '';
                let targetServiceId = incomingServiceId || '';
                let isBooking = false;

                if (incomingBookingId) {
                    try {
                        const order = await apiClient.orders.getById(incomingBookingId);
                        const firstTicket = order?.orderedTickets?.[0];
                        const firstRoom = order?.orderedRooms?.[0];
                        const service = firstTicket?.ticket?.ticketVenue || firstRoom?.room?.hotel;
                        
                        targetProviderId = service?.provider?.userID?.toString() || service?.provider?.id?.toString() || '';
                        targetServiceId = service?.id?.toString() || targetServiceId;
                        isBooking = true;

                        const isHotel = !!firstRoom || service?.serviceType === 'HOTEL';
                        setActiveBookingType(isHotel ? 'hotel' : 'ticket');
                        setShowSuggestions(true);
                    } catch (err) {
                        console.error('Failed to fetch order details for chat init:', err);
                    }
                }

                if (incomingServiceId && !targetProviderId) {
                    // Fallback to finding existing conversation for service
                    const existing = data.find(c => c.serviceId === incomingServiceId);
                    if (existing) {
                        targetProviderId = existing.id;
                    }
                }

                if (incomingBookingId && !targetProviderId && data.length > 0) {
                    // Fallback to the first conversation provider if backend details are incomplete
                    targetProviderId = data[0].id;
                }

                // 3. Select conversation or start new one
                if (targetProviderId || targetServiceId) {
                    const existingConv = data.find(c => c.id === targetProviderId || (targetServiceId && c.serviceId === targetServiceId));
                    const targetConv = existingConv || data[0];

                    if (targetConv) {
                        await handleSelectConversation(targetConv);
                        
                        const msgType = isBooking ? 'order' : 'service';
                        const attachId = isBooking ? incomingBookingId : targetServiceId;

                        if (attachId) {
                            setPendingAttachment({ id: attachId, type: msgType as 'order' | 'service' });
                            setShowSuggestions(true);

                            // Xóa query params trên URL để khi F5 không bị đính kèm lại bản nháp
                            const newParams = new URLSearchParams(window.location.search);
                            newParams.delete('bookingId');
                            newParams.delete('serviceId');
                            setSearchParams(newParams, { replace: true });
                        }
                    }
                } else if (data.length > 0 && window.innerWidth >= 768) {
                    handleSelectConversation(data[0]);
                }
            } catch (err) {
                console.error('Error initializing chat room:', err);
                setLoading(false);
            }
        };

        initializeChat();

        // Initialize socket
        const token = localStorage.getItem('token') || 'mock_token';
        socketService.connect(token);

        const destroyListener = socketService.onMessage((msg) => {
            const currentActive = activeConversationRef.current;
            
            // Update messages if it's the active conversation
            setMessages(prev => {
                if (currentActive?.id === msg.conversationId) {
                    setTimeout(() => scrollToBottom(), 100);
                    return [...prev, msg];
                }
                return prev;
            });

            // If the message is in the active conversation, mark it as read on the backend
            if (currentActive?.id === msg.conversationId && msg.senderId !== (currentUser?.user?.userID?.toString() || 'user_123')) {
                chatApi.markAsRead(msg.conversationId).then(() => {
                    window.dispatchEvent(new Event('chat_read_updated'));
                }).catch(console.error);
            }

            // Update conversation list
            setConversations(prev => prev.map(conv => {
                if (conv.id === msg.conversationId) {
                    return {
                        ...conv,
                        lastMessage: msg,
                        unreadCount: (currentActive?.id === msg.conversationId) ? 0 : conv.unreadCount + 1,
                        updatedAt: msg.timestamp
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        });

        return () => {
            destroyListener();
            // Keep socket connected for the entire session
        };
    }, [isAuthenticated, currentUser?.user?.userID]); // Note: activeConversation is omitted intentionally to avoid re-binding socket, but handle it carefully

    const handleSelectConversation = async (conversation: Conversation) => {
        setActiveConversation(conversation);
        setShowChatArea(true);
        setLoadingMessages(true);
        setShowSuggestions(false);
        setActiveBookingType(null);
        setPendingAttachment(null); // Clear draft attachment when switching rooms

        // In real app, mark as read on BE
        if (conversation.unreadCount > 0) {
            await chatApi.markAsRead(conversation.id);
            setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
            window.dispatchEvent(new Event('chat_read_updated'));
        }

        const msgs = await chatApi.getMessages(conversation.id);
        setMessages(msgs);
        setLoadingMessages(false);
        scrollToBottom();
    };

    const handleSendSuggestion = (text: string) => {
        if (!activeConversation || !currentUser?.user) return;

        const sentMsg = socketService.sendMessage(
            activeConversation.id,
            currentUser.user.userID.toString() || 'user_123',
            text,
            'provider',
            pendingAttachment ? pendingAttachment.type : 'text',
            pendingAttachment ? pendingAttachment.id : undefined
        );

        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setShowSuggestions(false);
            setPendingAttachment(null); // Clear draft after sending

            // Update local conversation list
            setConversations(prev => prev.map(conv => {
                if (conv.id === activeConversation.id) {
                    return { ...conv, lastMessage: sentMsg, updatedAt: sentMsg.timestamp };
                }
                return conv;
            }));

            setTimeout(() => scrollToBottom(), 100);
        }
    };

    const handleSendPendingAttachment = () => {
        if (!pendingAttachment || !activeConversation || !currentUser?.user) return;

        const text = pendingAttachment.type === 'order' 
            ? 'Tôi muốn hỏi về thông tin đặt chỗ này.' 
            : 'Tôi quan tâm đến dịch vụ này.';

        const sentMsg = socketService.sendMessage(
            activeConversation.id,
            currentUser.user.userID.toString() || 'user_123',
            text,
            'provider',
            pendingAttachment.type,
            pendingAttachment.id
        );

        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setPendingAttachment(null); // Clear draft after sending
            setShowSuggestions(false);

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
            'provider',
            pendingAttachment ? pendingAttachment.type : 'text',
            pendingAttachment ? pendingAttachment.id : undefined
        );

        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage('');
            setPendingAttachment(null); // Clear draft after sending
            setShowSuggestions(false);

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
        <div className="w-full h-full flex flex-col min-h-[600px] max-w-6xl mx-auto px-4 py-8">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-100 p-2.5 rounded-2xl shadow-sm">
                            <MessageCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tin nhắn</h1>
                    </div>
                    <p className="text-gray-500 font-medium tracking-wide">Trò chuyện và nhận hỗ trợ trực tiếp từ các nhà cung cấp dịch vụ</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-1 max-h-[700px] min-h-[500px]">

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
                                    const isMine = msg.senderId.toString() === (currentUser?.user?.userID?.toString() || 'user_123');
                                    return (
                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMine
                                                ? 'bg-orange-500 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                }`}>
                                                {(msg.type === 'service' || msg.type === 'order') && msg.attachmentId ? (
                                                    <div className="mb-1.5">
                                                        <p className="text-xs opacity-80 mb-1.5 flex items-center gap-1">
                                                            <Tag className="w-3 h-3" />
                                                            {msg.type === 'order' ? 'Hỏi về đặt chỗ' : 'Hỏi về dịch vụ'}
                                                        </p>
                                                        <BookingContextCard
                                                            attachmentId={msg.attachmentId}
                                                            attachmentData={msg.attachmentData}
                                                            type={msg.type}
                                                        />
                                                        {msg.text && <p className="mt-1.5">{msg.text}</p>}
                                                    </div>
                                                ) : (
                                                    msg.text
                                                )}
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
                            {pendingAttachment && (
                                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-3 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600 flex-shrink-0">
                                            {pendingAttachment.type === 'order' ? <FileText className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                {pendingAttachment.type === 'order' ? 'Đính kèm đặt chỗ của tôi' : 'Đính kèm thông tin dịch vụ'}
                                            </p>
                                            <p className="text-xs font-semibold text-gray-400 truncate mt-0.5">
                                                Mã đính kèm: #{pendingAttachment.id.substring(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSendPendingAttachment}
                                            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                                        >
                                            Gửi đính kèm
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPendingAttachment(null);
                                                setShowSuggestions(false);
                                            }}
                                            className="p-1.5 hover:bg-gray-250 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                                            title="Bỏ đính kèm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showSuggestions && pendingAttachment && (
                                <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto">
                                    {(() => {
                                        if (pendingAttachment.type === 'service') {
                                            return [
                                                'Có chương trình ưu đãi hay giảm giá nào hiện tại không?',
                                                'Tôi muốn xin thêm thông tin chi tiết về dịch vụ này.',
                                                'Giá hiển thị trên trang đã bao gồm thuế và phí chưa?',
                                                'Tôi có thể đặt trước dịch vụ và thanh toán sau không?'
                                            ];
                                        } else if (activeBookingType === 'hotel') {
                                            return [
                                                'Tôi muốn hỏi về hướng dẫn check-in và nhận phòng.',
                                                'Tôi muốn thay đổi ngày nhận hoặc trả phòng.',
                                                'Tôi muốn yêu cầu hủy đặt phòng này.',
                                                'Tôi muốn yêu cầu xuất hóa đơn VAT cho đặt phòng này.'
                                            ];
                                        } else {
                                            return [
                                                'Tôi muốn hỏi về cách đổi hoặc nhận vé cứng.',
                                                'Tôi muốn thay đổi ngày sử dụng vé dịch vụ.',
                                                'Tôi muốn yêu cầu hoàn hoặc hủy vé này.',
                                                'Tôi muốn hỏi địa chỉ hoặc điểm tập trung ở đâu.'
                                            ];
                                        }
                                    })().map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSendSuggestion(suggestion)}
                                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-[11px] font-bold rounded-full transition-all border border-orange-100/50 cursor-pointer active:scale-95 whitespace-nowrap"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
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
        </div>
    );
};

export default UserMessagesPage;
