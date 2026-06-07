import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, MessageCircle, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { aiChatApi, type ServiceLink } from '@/api/aiChatApi';
import { useLocation, useNavigate } from 'react-router-dom';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    serviceLinks?: ServiceLink[];
}

const sanitizeUrl = (url: string) => url.replace(/([^:])\/\//g, '$1/');

const AIChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // ── Scroll helpers ──────────────────────────────────────────────────────────
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        const el = messagesContainerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    const handleScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBtn(distFromBottom > 100);
    };

    // Scroll to bottom instantly when widget opens
    useEffect(() => {
        if (isOpen) {
            scrollToBottom('instant');
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // Scroll to bottom on every new message
    useEffect(() => {
        if (!isOpen) return;
        const el = messagesContainerRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        // If user is near bottom (< 200px), auto-scroll; otherwise show button
        if (distFromBottom < 200) scrollToBottom('smooth');
        else setShowScrollBtn(true);
    }, [messages, isLoading]);

    // ── Events ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleServiceChatToggle = (e: any) => { if (e.detail) setIsOpen(false); };
        window.addEventListener('service-chat-open', handleServiceChatToggle);
        return () => window.removeEventListener('service-chat-open', handleServiceChatToggle);
    }, []);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('ai-chat-open', { detail: { open: isOpen } }));
    }, [isOpen]);

    // Welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                text: 'Chào bạn! Tôi là trợ lý AI của NTTravel 👋\n\nTôi có thể giúp bạn:\n* Tìm kiếm khách sạn, tour, vé tham quan\n* Lên kế hoạch du lịch\n* Tư vấn địa điểm phù hợp\n\nBạn muốn đi đâu hôm nay?',
                sender: 'ai',
                timestamp: new Date()
            }]);
        }
    }, [messages.length]);

    // ── Navigation ──────────────────────────────────────────────────────────────
    const handleLinkClick = (url: string) => {
        const clean = sanitizeUrl(url);
        if (clean.startsWith('/')) {
            setIsOpen(false);
            navigate(clean);
        } else {
            window.open(clean, '_blank', 'noopener,noreferrer');
        }
    };

    // ── Markdown renderer ───────────────────────────────────────────────────────
    const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
        const linkParts = text.split(/\[([^\]]+)\]\(([^)]+)\)/g);
        const nodes: React.ReactNode[] = [];

        for (let i = 0; i < linkParts.length; i += 3) {
            const plain = linkParts[i];
            if (plain) {
                const boldParts = plain.split(/\*\*(.*?)\*\*/g);
                boldParts.forEach((bp, bi) => {
                    if (bi % 2 === 1) {
                        nodes.push(<strong key={`${keyPrefix}-b${i}-${bi}`}>{bp}</strong>);
                    } else if (bp) {
                        const httpParts = bp.split(/(https?:\/\/[^\s<)]+)/g);
                        httpParts.forEach((hp, hi) => {
                            if (hi % 2 === 1) {
                                nodes.push(
                                    <a key={`${keyPrefix}-http${i}-${bi}-${hi}`} href={hp} target="_blank" rel="noopener noreferrer" className="underline opacity-80 hover:opacity-100 break-all">
                                        {hp}
                                    </a>
                                );
                            } else if (hp) {
                                nodes.push(<React.Fragment key={`${keyPrefix}-t${i}-${bi}-${hi}`}>{hp}</React.Fragment>);
                            }
                        });
                    }
                });
            }

            if (i + 1 < linkParts.length && linkParts[i + 1]) {
                const linkText = linkParts[i + 1];
                const url = sanitizeUrl(linkParts[i + 2] ?? '');
                nodes.push(
                    url.startsWith('/') ? (
                        <button key={`${keyPrefix}-rl${i}`} onClick={() => handleLinkClick(url)} className="underline font-medium opacity-90 hover:opacity-100 cursor-pointer">
                            {linkText}
                        </button>
                    ) : (
                        <a key={`${keyPrefix}-el${i}`} href={url} target="_blank" rel="noopener noreferrer" className="underline opacity-80 hover:opacity-100">
                            {linkText}
                        </a>
                    )
                );
            }
        }
        return nodes;
    };

    const renderMessage = (text: string) => {
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        const pendingList: React.ReactNode[] = [];

        const flushList = () => {
            if (pendingList.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-0.5 my-1">
                        {[...pendingList]}
                    </ul>
                );
                pendingList.length = 0;
            }
        };

        lines.forEach((line, li) => {
            const t = line.trim();
            if (t.startsWith('* ') || t.startsWith('- ')) {
                pendingList.push(<li key={`li-${li}`}>{renderInline(t.slice(2), `li-${li}`)}</li>);
            } else if (t === '') {
                flushList();
            } else {
                flushList();
                elements.push(<p key={`p-${li}`} className="leading-relaxed">{renderInline(t, `p-${li}`)}</p>);
            }
        });
        flushList();
        return <div className="space-y-1.5 text-sm">{elements}</div>;
    };

    const renderServiceLinks = (links: ServiceLink[]) => {
        if (!links?.length) return null;
        return (
            <div className="mt-3 pt-3 border-t border-orange-100 space-y-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Dịch vụ liên quan</p>
                {links.map(link => (
                    <div
                        key={link.id}
                        onClick={() => handleLinkClick(sanitizeUrl(link.url))}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all group"
                    >
                        {link.thumbnailUrl && (
                            <img
                                src={link.thumbnailUrl}
                                alt={link.name}
                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-orange-700 transition-colors">{link.name}</p>
                            {link.averagePrice > 0 && (
                                <p className="text-[11px] font-medium text-orange-500 mt-0.5">
                                    {link.averagePrice.toLocaleString('vi-VN')}₫
                                </p>
                            )}
                        </div>
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors">
                            <span className="text-base leading-none text-orange-500 group-hover:text-white font-bold">›</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // ── Send ────────────────────────────────────────────────────────────────────
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setIsLoading(true);

        try {
            const context = `User is on ${window.location.origin}${location.pathname}. Title: ${document.title}`;
            const response = await aiChatApi.ask({ question: userMsg.text, context });
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: response.answer,
                sender: 'ai',
                timestamp: new Date(),
                serviceLinks: response.serviceLinks,
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: 'error-' + Date.now(),
                text: 'Xin lỗi, tôi đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau nhé!',
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // ── Closed state ─────────────────────────────────────────────────────────
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-48 md:bottom-28 right-4 md:right-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2.5 md:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[9999] flex items-center justify-center group"
                aria-label="Chat với AI"
            >
                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white" />
                </div>
                <Bot className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap font-medium text-sm">
                    Hỏi Trợ Lý AI
                </span>
            </button>
        );
    }

    // ── Open state ───────────────────────────────────────────────────────────
    return (
        <div
            className="fixed bottom-4 right-4 md:bottom-28 md:right-6 w-[calc(100%-2rem)] sm:w-80 md:w-96 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-orange-100 z-[9999] flex flex-col overflow-hidden"
            style={{ height: 'min(calc(100vh - 2rem), 560px)' }}
        >
            {/* ── Header ── */}
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-sm flex items-center gap-1.5">
                            Trợ Lý AI
                            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                        </div>
                        <div className="text-[10px] text-orange-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Luôn sẵn sàng hỗ trợ
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* ── Messages ── */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 scroll-smooth"
                style={{ overscrollBehavior: 'contain' }}
            >
                {/* Spacer: pushes messages to bottom when list is short */}
                <div className="flex-1 min-h-0" />

                {messages.map((msg) => {
                    const isAi = msg.sender === 'ai';
                    return (
                        <div key={msg.id} className={`flex ${isAi ? 'items-start' : 'items-end justify-end'} gap-2`}>
                            {isAi && (
                                <div className="w-7 h-7 rounded-lg bg-orange-100 flex-shrink-0 flex items-center justify-center border border-orange-200 mt-0.5">
                                    <Bot className="w-3.5 h-3.5 text-orange-600" />
                                </div>
                            )}
                            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                                isAi
                                    ? 'bg-white border border-slate-100 rounded-tl-sm text-slate-700'
                                    : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-sm'
                            }`}>
                                {renderMessage(msg.text)}
                                {isAi && renderServiceLinks(msg.serviceLinks ?? [])}
                                <div className={`text-[9px] mt-1.5 ${isAi ? 'text-slate-400' : 'text-orange-100'} text-right`}>
                                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 flex-shrink-0 flex items-center justify-center border border-orange-200">
                            <Bot className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1 items-center h-4">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll anchor */}
                <div className="h-px" id="chat-bottom" />
            </div>

            {/* Scroll-to-bottom button */}
            {showScrollBtn && (
                <button
                    onClick={() => { scrollToBottom(); setShowScrollBtn(false); }}
                    className="absolute bottom-[76px] right-4 w-7 h-7 bg-white border border-orange-200 rounded-full shadow-md flex items-center justify-center hover:bg-orange-50 transition-colors z-10"
                    aria-label="Cuộn xuống"
                >
                    <ChevronDown className="w-4 h-4 text-orange-500" />
                </button>
            )}

            {/* ── Input ── */}
            <div className="flex-shrink-0 px-3 pb-3 pt-2 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Hỏi tôi bất cứ điều gì…"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all outline-none"
                            disabled={isLoading}
                        />
                        <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
                <p className="text-[9px] text-slate-300 mt-1.5 text-center">
                    AI có thể đưa ra thông tin không chính xác — hãy kiểm tra lại.
                </p>
            </div>
        </div>
    );
};

export default AIChatWidget;
