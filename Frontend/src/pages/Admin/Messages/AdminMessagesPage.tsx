import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MessageSquare, ShieldCheck } from 'lucide-react';
import { chatApi } from '@/api/chatApi';
import { socketService } from '@/services/socketService';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/admin/input';
import { Button } from '@/components/ui/admin/button';
import type { ChatMessage, Conversation } from '@/types/chat.types';

export const AdminMessagesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const activeConversationRef = useRef<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        const fetchInbox = async () => {
            setLoading(true);
            const data = await chatApi.getAdminInbox();
            setConversations(data);
            setLoading(false);
            if (data.length > 0 && window.innerWidth >= 768) {
                handleSelectConversation(data[0]);
            }
        };

        fetchInbox();

        // Socket setup
        const token = localStorage.getItem('token') || '';
        if (token) {
            socketService.connect(token);
        }

        const destroyListener = socketService.onMessage((msg) => {
            const currentActive = activeConversationRef.current;
            
            if (currentActive?.id === msg.conversationId) {
                setMessages(prev => [...prev, msg]);
                setTimeout(() => scrollToBottom(), 100);
            }

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

        return () => destroyListener();
    }, []);

    const handleSelectConversation = async (conv: Conversation) => {
        setActiveConversation(conv);
        setLoadingMessages(true);
        const msgs = await chatApi.getMessages(conv.id);
        setMessages(msgs);
        setLoadingMessages(false);
        setTimeout(() => scrollToBottom(), 100);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeConversation || !currentUser?.user) return;

        const sentMsg = socketService.sendMessage(
            activeConversation.id,
            currentUser.user.userID.toString(),
            replyText,
            'user' // In this context, admin is replying to a provider
        );

        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
            setReplyText('');
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500 p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hỗ trợ đối tác</h1>
                        <p className="text-sm text-muted-foreground mt-1">Kênh chat chung dành cho Quản trị viên hỗ trợ Nhà cung cấp</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border/40 rounded-xl shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[550px]">
                {/* Left Sidebar */}
                <div className="w-full md:w-80 flex flex-col border-r border-border/40 bg-muted/10">
                    <div className="p-4 bg-background border-b border-border/40">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm đối tác..."
                                className="pl-10 h-10 rounded-lg bg-muted border-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải danh sách...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">Không có yêu cầu hỗ trợ nào.</div>
                        ) : (
                            conversations.map(conv => {
                                const provider = conv.participants.find(p => p.role === 'provider');
                                const isActive = activeConversation?.id === conv.id;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`w-full text-left p-4 hover:bg-muted/50 flex gap-3 transition-all border-b border-border/40 cursor-pointer ${isActive ? 'bg-background shadow-sm z-10' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                                {provider?.avatar ? (
                                                    <img src={provider.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold text-primary' : 'font-semibold text-foreground'}`}>
                                                    {provider?.name || 'Nhà cung cấp'}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(conv.updatedAt).split(' ')[0]}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Area */}
                <div className="flex-1 flex flex-col bg-muted/5">
                    {activeConversation ? (
                        <>
                            <div className="p-4 border-b border-border/40 bg-background flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100/50">
                                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-none mb-1">
                                            {activeConversation.participants.find(p => p.role === 'provider')?.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Trực tuyến</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-100">
                                    Kết thúc hỗ trợ
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {loadingMessages ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                    </div>
                                ) : messages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser?.user?.userID?.toString();
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe 
                                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                            }`}>
                                                <p>{msg.text}</p>
                                                <span className={`text-[9px] mt-1 block ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-background border-t border-border/40">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <Input
                                        type="text"
                                        value={replyText}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value)}
                                        placeholder="Gửi phản hồi cho đối tác..."
                                        className="flex-1 h-11 bg-muted border-none rounded-xl"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="h-11 px-6 rounded-xl font-semibold flex items-center gap-2"
                                    >
                                        Gửi <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-6 rotate-12">
                                <MessageSquare className="w-10 h-10 text-blue-300 dark:text-blue-500/50" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hộp thư chung Quản trị viên</h3>
                            <p className="text-sm max-w-xs">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ đối tác của bạn.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesPage;
