import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, User, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { aiChatApi } from '@/api/aiChatApi';
import { useLocation } from 'react-router-dom';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const AIChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isServiceChatOpen, setIsServiceChatOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Sync Service Chat Widget visibility
    useEffect(() => {
        const handleServiceChatToggle = (e: any) => {
            if (e.detail) {
                setIsServiceChatOpen(e.detail.open);
            }
        };
        window.addEventListener('service-chat-open', handleServiceChatToggle);
        return () => window.removeEventListener('service-chat-open', handleServiceChatToggle);
    }, []);

    useEffect(() => {
        // Broadcast that the AI chat is open/closed
        window.dispatchEvent(new CustomEvent('ai-chat-open', { detail: { open: isOpen } }));
    }, [isOpen]);

    // Welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    text: `Chào bạn, NTTravel có thể giúp gì cho bạn hôm nay?

Bạn đang tìm kiếm dịch vụ gì? Chúng tôi có thể gợi ý một số khách sạn phổ biến:
*   **Furama Resort Danang**: Giá khoảng 4.500.000 VNĐ
*   **Caravelle Saigon**: Giá khoảng 4.000.000 VNĐ
*   **Naman Retreat**: Giá khoảng 7.000.000 VNĐ
*   **Park Hyatt Saigon**: Giá khoảng 8.500.000 VNĐ

Hãy cho chúng tôi biết bạn cần tìm gì hoặc để chúng tôi tạo kế hoạch du lịch cho bạn!

Nếu bạn cần tư vấn thêm, vui lòng liên hệ 1900-9999 hoặc truy cập https://nttravel.com/support.`,
                    sender: 'ai',
                    timestamp: new Date()
                }
            ]);
        }
    }, [messages.length]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Basic markdown parser for bold, bullet points and links
    const renderMessage = (text: string) => {
        // Handle bold: **text**
        let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Handle bullet points: * text
        processed = processed.split('\n').map(line => {
            if (line.trim().startsWith('* ')) {
                return `<li class="ml-4 list-disc">${line.trim().substring(2)}</li>`;
            }
            return line;
        }).join('\n');

        // Handle links: https://...
        processed = processed.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline hover:text-blue-200">$1</a>');

        return <div dangerouslySetInnerHTML={{ __html: processed.replace(/\n/g, '<br/>') }} />;
    };

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
        scrollToBottom();

        try {
            // Get current context (page title or URL)
            const context = `User is currently on ${window.location.origin}${location.pathname}. Page title: ${document.title}`;

            const response = await aiChatApi.ask({
                question: userMsg.text,
                context: context
            });

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: response.answer,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Failed to get AI response:', error);
            const errorMsg: ChatMessage = {
                id: 'error-' + Date.now(),
                text: 'Xin lỗi, tôi đang gặp một chút trục trặc kỹ thuật. Vui lòng thử lại sau nhé!',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    const toggleWidget = () => setIsOpen(!isOpen);

    if (!isOpen) {
        // Khi chat với chủ dịch vụ đang mở, ẩn nút AI chat để tránh đè lên
        return (
            <button
                onClick={toggleWidget}
                className="fixed bottom-48 md:bottom-28 right-4 md:right-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2.5 md:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[9999] flex items-center justify-center group"
                aria-label="Chat với AI"
            >
                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
                </div>
                <Bot className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap font-medium text-sm">
                    Hỏi Trợ Lý AI
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 md:bottom-28 md:right-6 w-[calc(100%-2rem)] sm:w-80 md:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(245,_158,_11,_0.2)] border border-orange-100 z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300" style={{ height: 'calc(100vh - 120px)', maxHeight: '520px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                            Trợ Lý AI Travollo
                            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-orange-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Luôn sẵn sàng hỗ trợ bạn
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleWidget}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-orange-50/20 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-orange-200">
                {messages.map((msg) => {
                    const isAi = msg.sender === 'ai';
                    return (
                        <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-${isAi ? 'left' : 'right'}-2 duration-300`}>
                            <div className={`flex gap-2 max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                                {isAi && (
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex-shrink-0 flex items-center justify-center border border-orange-200">
                                        <Bot className="w-4 h-4 text-orange-600" />
                                    </div>
                                )}
                                <div className={`group relative rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isAi
                                    ? 'bg-white text-slate-700 border border-orange-50/50 rounded-tl-none'
                                    : 'bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-tr-none'
                                    }`}>
                                    <div className="leading-relaxed">
                                        {renderMessage(msg.text)}
                                    </div>
                                    <div className={`text-[10px] mt-1.5 opacity-60 ${isAi ? 'text-slate-400' : 'text-orange-100'} font-medium`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex gap-2 max-w-[85%]">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex-shrink-0 flex items-center justify-center border border-orange-200">
                                <Bot className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="bg-white border border-orange-50/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập câu hỏi cho AI..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all outline-none"
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2.5 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
                <p className="text-[10px] text-slate-400 mt-2 text-center italic">
                    AI có thể đưa ra câu trả lời không chính xác. Hãy kiểm tra lại thông tin quan trọng.
                </p>
            </div>
        </div>
    );
};

export default AIChatWidget;
