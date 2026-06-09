import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, ChevronLeft, MessageCircle, Tag, X, FileText } from 'lucide-react';
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

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showChatArea, setShowChatArea] = useState(false);

    const [pendingAttachment, setPendingAttachment] = useState<{ id: string; type: 'order' | 'service' } | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeBookingType, setActiveBookingType] = useState<'hotel' | 'ticket' | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ── 1. Load conversations ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || !currentUser?.user?.userID) return;
        chatApi.getConversations(currentUser.user.userID.toString(), 'user').then(data => {
            setConversations(data);
            setLoading(false);
            if (data.length > 0 && window.innerWidth >= 768) {
                handleSelectConversation(data[0]);
            }
        }).catch(() => setLoading(false));
    }, [isAuthenticated, currentUser?.user?.userID]);

    // ── 2. Handle incoming URL params (from bookings/services page) ────────────
    useEffect(() => {
        if (loading || (!incomingServiceId && !incomingBookingId)) return;

        const handleIncoming = async () => {
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
                    setActiveBookingType(!!firstRoom || service?.serviceType === 'HOTEL' ? 'hotel' : 'ticket');
                    setShowSuggestions(true);
                } catch (err) {
                    console.error('Failed to fetch order for chat:', err);
                }
            }

            if (incomingServiceId && !targetProviderId) {
                const existing = conversations.find(c => c.serviceId === incomingServiceId);
                if (existing) targetProviderId = existing.id;
            }

            if (targetProviderId || targetServiceId) {
                const targetConv = conversations.find(c => c.id === targetProviderId || (targetServiceId && c.serviceId === targetServiceId)) || conversations[0];
                if (targetConv) {
                    await handleSelectConversation(targetConv);
                    const attachId = isBooking ? incomingBookingId : targetServiceId;
                    if (attachId) {
                        setPendingAttachment({ id: attachId, type: isBooking ? 'order' : 'service' });
                        setShowSuggestions(true);
                        const p = new URLSearchParams(window.location.search);
                        p.delete('bookingId');
                        p.delete('serviceId');
                        setSearchParams(p, { replace: true });
                    }
                }
            }
        };

        handleIncoming();
    }, [loading]);

    // ── 3. Socket listener — separated so it always re-attaches on mount ──────
    useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('token') || 'mock_token';
        socketService.connect(token);

        const destroy = socketService.onMessage((msg) => {
            const currentActive = activeConversationRef.current;

            setMessages(prev => {
                if (currentActive?.id !== msg.conversationId) return prev;
                if (msg.id && !msg.id.startsWith('msg_') && prev.some(p => p.id === msg.id)) return prev;
                const isDuplicate = prev.some(p =>
                    p.text.trim() === msg.text.trim() &&
                    p.senderId?.toString() === msg.senderId?.toString() &&
                    Math.abs(new Date(p.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 3000
                );
                if (isDuplicate) return prev;
                setTimeout(() => scrollToBottom(), 100);
                return [...prev, msg];
            });

            if (currentActive?.id === msg.conversationId && msg.senderId?.toString() !== currentUser?.user?.userID?.toString()) {
                chatApi.markAsRead(msg.conversationId).then(() => {
                    window.dispatchEvent(new Event('chat_read_updated'));
                }).catch(console.error);
            }

            setConversations(prev => {
                const exists = prev.find(c => c.id === msg.conversationId);
                if (exists) {
                    return prev.map(conv => conv.id === msg.conversationId
                        ? { ...conv, lastMessage: msg, unreadCount: currentActive?.id === msg.conversationId ? 0 : conv.unreadCount + 1, updatedAt: msg.timestamp }
                        : conv
                    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                }
                const newConv: Conversation = {
                    id: msg.conversationId,
                    participants: [{ id: msg.senderId.toString(), name: msg.senderId.toString(), role: 'provider', avatar: '' }],
                    lastMessage: msg,
                    unreadCount: 1,
                    updatedAt: msg.timestamp,
                    serviceName: 'Hỗ trợ khách hàng'
                };
                return [newConv, ...prev];
            });
        });

        return () => { destroy(); };
    }, [isAuthenticated, currentUser?.user?.userID]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleSelectConversation = async (conversation: Conversation) => {
        setActiveConversation(conversation);
        setShowChatArea(true);
        setLoadingMessages(true);
        setShowSuggestions(false);
        setActiveBookingType(null);
        setPendingAttachment(null);

        if (conversation.unreadCount > 0) {
            await chatApi.markAsRead(conversation.id);
            setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
            window.dispatchEvent(new Event('chat_read_updated'));
        }

        const msgs = await chatApi.getMessages(conversation.id);
        setMessages(msgs);
        setLoadingMessages(false);
        scrollToBottom();

        const attachMsgs = msgs.filter(m => (m.type === 'service' || m.type === 'order') && m.attachmentId);
        const latest = attachMsgs[attachMsgs.length - 1];
        if (latest?.attachmentId) {
            try {
                if (latest.type === 'service') {
                    const svc = await apiClient.services.getById(latest.attachmentId);
                    if (svc?.serviceName) {
                        setActiveConversation(prev => prev ? { ...prev, serviceName: svc.serviceName } : prev);
                        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, serviceName: svc.serviceName } : c));
                    }
                } else {
                    const order = await apiClient.orders.getById(latest.attachmentId);
                    const svc = order?.orderedTickets?.[0]?.ticket?.ticketVenue || order?.orderedRooms?.[0]?.room?.hotel;
                    if (svc?.serviceName) {
                        setActiveConversation(prev => prev ? { ...prev, serviceName: svc.serviceName } : prev);
                        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, serviceName: svc.serviceName } : c));
                    }
                }
            } catch { /* ignore */ }
        }
    };

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

    const doSend = (text: string, type: 'text' | 'order' | 'service' = 'text', attachId?: string) => {
        if (!activeConversation || !currentUser?.user) return;
        const sentMsg = socketService.sendMessage(
            activeConversation.id,
            currentUser.user.userID.toString(),
            text,
            'provider',
            type,
            attachId
        );
        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setConversations(prev => prev.map(conv =>
                conv.id === activeConversation.id ? { ...conv, lastMessage: sentMsg, updatedAt: sentMsg.timestamp } : conv
            ));
            setTimeout(() => scrollToBottom(), 100);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text) return;
        doSend(text, pendingAttachment?.type ?? 'text', pendingAttachment?.id);
        setNewMessage('');
        setPendingAttachment(null);
        setShowSuggestions(false);
    };

    const handleSendSuggestion = (text: string) => {
        doSend(text, pendingAttachment?.type ?? 'text', pendingAttachment?.id);
        setShowSuggestions(false);
        setPendingAttachment(null);
    };

    const handleSendPendingAttachment = () => {
        if (!pendingAttachment) return;
        doSend(
            pendingAttachment.type === 'order' ? 'Tôi muốn hỏi về thông tin đặt chỗ này.' : 'Tôi quan tâm đến dịch vụ này.',
            pendingAttachment.type,
            pendingAttachment.id
        );
        setPendingAttachment(null);
        setShowSuggestions(false);
    };

    const formatTime = (iso?: string) => {
        if (!iso) return '';
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <p className="text-gray-500">Vui lòng đăng nhập để xem tin nhắn.</p>
            </div>
        );
    }

    const myIdStr = currentUser?.user?.userID?.toString() || '';

    return (
        <div className="w-full h-full flex flex-col min-h-[600px] max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 shrink-0">
                <div className="bg-orange-100 p-2.5 rounded-2xl shadow-sm">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tin nhắn</h1>
                    <p className="text-gray-500 font-medium">Trò chuyện và nhận hỗ trợ trực tiếp từ các nhà cung cấp dịch vụ</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-1 max-h-[700px] min-h-[500px]">

                {/* ── Left Sidebar ─────────────────────────────────────────── */}
                <div className={`w-full md:w-80 lg:w-[380px] flex flex-col border-r border-gray-200 bg-gray-50/50 ${showChatArea ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 md:p-5 border-b border-gray-200 bg-white">
                        <h2 className="text-xl font-black text-gray-900 mb-4">Tin nhắn</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm cuộc trò chuyện..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center p-10 text-gray-500 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
                                <p className="text-xs mt-1 text-gray-400">Nhắn tin với nhà cung cấp từ trang dịch vụ</p>
                            </div>
                        ) : (
                            conversations.map(conv => {
                                const provider = conv.participants.find(p => p.role === 'provider') || conv.participants.find(p => p.id?.toString() !== myIdStr) || conv.participants[0];
                                const isActive = activeConversation?.id === conv.id;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`w-full text-left p-4 hover:bg-white flex items-start gap-4 transition-all border-l-4 ${isActive ? 'bg-white border-l-orange-500 shadow-sm' : 'border-l-transparent border-b border-gray-100'}`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-50 border border-orange-100">
                                                {provider?.avatar
                                                    ? <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                                                    : <User className="w-6 h-6 text-orange-400 m-auto mt-3" />}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                                    {provider?.name || 'Nhà cung cấp'}
                                                </h3>
                                                <span className={`text-[11px] flex-shrink-0 ${conv.unreadCount > 0 ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                                                    {formatTime(conv.lastMessage?.timestamp)}
                                                </span>
                                            </div>
                                            {conv.serviceName && conv.serviceName !== 'Hỗ trợ khách hàng' && (
                                                <p className="text-[10px] font-medium text-orange-500 truncate mb-1">
                                                    Dịch vụ: {conv.serviceName}
                                                </p>
                                            )}
                                            <p className={`text-[13px] truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                                {conv.lastMessage?.senderId?.toString() === myIdStr ? 'Bạn: ' : ''}
                                                {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="bg-orange-500 text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0 mt-3">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Right Side — Chat Area ────────────────────────────────── */}
                <div className={`flex-1 flex flex-col bg-slate-50/50 relative ${!showChatArea ? 'hidden md:flex' : 'flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 bg-white/90 backdrop-blur-md flex items-center shadow-sm sticky top-0 z-10">
                                <button onClick={() => setShowChatArea(false)} className="md:hidden mr-3 p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-50 border border-orange-100 flex-shrink-0">
                                    {activeConversation.participants.find(p => p.role === 'provider')?.avatar
                                        ? <img src={activeConversation.participants.find(p => p.role === 'provider')?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        : <User className="w-6 h-6 text-orange-400 m-auto mt-2" />}
                                </div>
                                <div className="flex-1 min-w-0 ml-3">
                                    <h3 className="font-bold text-gray-900 truncate">
                                        {activeConversation.participants.find(p => p.role === 'provider')?.name || 'Nhà cung cấp'}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-xs text-emerald-600 font-medium">Đang trực tuyến</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Context Banner */}
                            {activeConversation.serviceName && activeConversation.serviceName !== 'Hỗ trợ khách hàng' && (
                                <div className="bg-orange-50 p-3 flex items-center justify-center text-[13px] border-b border-orange-100">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        Đang tư vấn về: <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md shadow-sm">{activeConversation.serviceName}</span>
                                    </span>
                                </div>
                            )}

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-gray-400 my-auto text-sm bg-white/50 p-6 rounded-2xl border border-dashed border-gray-200 mx-auto max-w-sm">
                                        <MessageCircle className="w-10 h-10 text-orange-200 mx-auto mb-3" />
                                        <p>Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMine = msg.senderId?.toString() === myIdStr;
                                        const showTime = index === 0 || new Date(msg.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;
                                        const msgTypeLower = msg.type?.toLowerCase();
                                        const isAttachment = (msgTypeLower === 'service' || msgTypeLower === 'order' || msgTypeLower === 'service_attachment' || msgTypeLower === 'order_attachment') && (!!msg.attachmentId || !!msg.attachmentData);
                                        const resolvedAttachmentType = (msgTypeLower === 'order' || msgTypeLower === 'order_attachment') ? 'order' : 'service';

                                        let isFirstTimeForThisAttachment = true;
                                        if (isAttachment) {
                                            const curId = msg.attachmentId || msg.attachmentData?.id;
                                            for (let j = index - 1; j >= 0; j--) {
                                                const prev = messages[j];
                                                const pt = prev.type?.toLowerCase();
                                                const isPrevAttach = (pt === 'service' || pt === 'order' || pt === 'service_attachment' || pt === 'order_attachment') && (!!prev.attachmentId || !!prev.attachmentData);
                                                if (isPrevAttach) {
                                                    if ((prev.attachmentId || prev.attachmentData?.id) === curId) isFirstTimeForThisAttachment = false;
                                                    break;
                                                }
                                            }
                                        }

                                        return (
                                            <div key={msg.id} className="flex flex-col">
                                                {showTime && (
                                                    <div className="flex justify-center mb-4 mt-2">
                                                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                                            {new Date(msg.timestamp).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                                                    {!isMine && (
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-1">
                                                            <User className="w-4 h-4 text-gray-400 m-auto mt-1" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-[14.5px] shadow-sm ${isMine
                                                        ? 'bg-orange-500 text-white rounded-br-sm'
                                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                                        {isAttachment ? (
                                                            <div className="mb-1.5">
                                                                {isFirstTimeForThisAttachment ? (
                                                                    <>
                                                                        <p className={`text-xs mb-1.5 flex items-center gap-1 font-semibold ${isMine ? 'text-orange-100' : 'text-orange-500'}`}>
                                                                            <Tag className="w-3 h-3" />
                                                                            {resolvedAttachmentType === 'order' ? 'Hỏi về đặt chỗ' : 'Hỏi về dịch vụ'}
                                                                        </p>
                                                                        <BookingContextCard
                                                                            attachmentId={msg.attachmentId || ''}
                                                                            attachmentData={msg.attachmentData}
                                                                            type={resolvedAttachmentType}
                                                                            mini={true}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <div className={`text-[11px] font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1 mb-1.5 ${isMine ? 'bg-orange-400/30 text-orange-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                                        <Tag className="w-2.5 h-2.5" />
                                                                        <span>Hỏi tiếp về {resolvedAttachmentType === 'order' ? 'đặt chỗ này' : 'dịch vụ này'}</span>
                                                                    </div>
                                                                )}
                                                                {msg.text && <p className="mt-1.5 leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                                                            </div>
                                                        ) : (
                                                            <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                                        )}
                                                        <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 font-medium ${isMine ? 'text-orange-100' : 'text-gray-400'}`}>
                                                            {formatTime(msg.timestamp)}
                                                            {isMine && (
                                                                <svg className="w-3.5 h-3.5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                            <div className="p-4 bg-white border-t border-gray-200 relative z-20">
                                {pendingAttachment && (
                                    <div className="mb-3 p-3 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600 flex-shrink-0">
                                                {pendingAttachment.type === 'order' ? <FileText className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    {pendingAttachment.type === 'order' ? 'Đính kèm đặt chỗ của tôi' : 'Đính kèm thông tin dịch vụ'}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                                    Mã: #{pendingAttachment.id.substring(0, 8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={handleSendPendingAttachment}
                                                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95">
                                                Gửi đính kèm
                                            </button>
                                            <button type="button" onClick={() => { setPendingAttachment(null); setShowSuggestions(false); }}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showSuggestions && pendingAttachment && (
                                    <div className="flex flex-wrap gap-2 mb-3 max-h-28 overflow-y-auto">
                                        {(pendingAttachment.type === 'service'
                                            ? ['Có chương trình ưu đãi hay giảm giá nào hiện tại không?', 'Tôi muốn xin thêm thông tin chi tiết về dịch vụ này.', 'Giá hiển thị đã bao gồm thuế và phí chưa?', 'Tôi có thể đặt trước và thanh toán sau không?']
                                            : activeBookingType === 'hotel'
                                                ? ['Tôi muốn hỏi về hướng dẫn check-in và nhận phòng.', 'Tôi muốn thay đổi ngày nhận hoặc trả phòng.', 'Tôi muốn yêu cầu hủy đặt phòng này.', 'Tôi muốn yêu cầu xuất hóa đơn VAT.']
                                                : ['Tôi muốn hỏi về cách đổi hoặc nhận vé cứng.', 'Tôi muốn thay đổi ngày sử dụng vé.', 'Tôi muốn yêu cầu hoàn hoặc hủy vé này.', 'Tôi muốn hỏi địa chỉ hoặc điểm tập trung ở đâu.']
                                        ).map((s, i) => (
                                            <button key={i} type="button" onClick={() => handleSendSuggestion(s)}
                                                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-[11px] font-bold rounded-full border border-orange-100 transition-all whitespace-nowrap active:scale-95 cursor-pointer">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                                    <div className="flex-1 relative bg-gray-100 rounded-[24px] border border-transparent focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:bg-white transition-all flex items-end">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); }
                                            }}
                                            placeholder="Nhập tin nhắn của bạn... (Enter để gửi)"
                                            className="w-full bg-transparent border-0 pl-5 pr-14 py-3.5 text-[14.5px] text-gray-900 placeholder-gray-500 focus:ring-0 resize-none max-h-32 min-h-[52px]"
                                            rows={1}
                                        />
                                        <button type="submit" disabled={!newMessage.trim()}
                                            className="absolute right-1.5 bottom-1.5 bg-orange-500 text-white p-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-600 transition-transform disabled:opacity-50 disabled:scale-95 shadow-md hover:scale-105">
                                            <Send className="w-4 h-4 ml-0.5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 border border-orange-100">
                                <MessageCircle className="w-10 h-10 text-orange-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn cuộc trò chuyện</h3>
                            <p className="text-sm text-center max-w-xs text-gray-500">Chọn một cuộc trò chuyện từ danh sách để nhắn tin với nhà cung cấp dịch vụ.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserMessagesPage;
