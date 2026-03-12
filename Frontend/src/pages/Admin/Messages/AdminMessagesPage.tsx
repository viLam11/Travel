import React, { useState } from 'react';
import { Search, Send, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface SupportTicket {
    id: string;
    providerName: string;
    subject: string;
    lastMessage: string;
    timestamp: string;
    status: 'open' | 'closed';
    avatar?: string;
}

const mockTickets: SupportTicket[] = [
    {
        id: 'TICK-101',
        providerName: 'Khách sạn Majestic',
        subject: 'Hỗ trợ thay đổi thông tin pháp lý',
        lastMessage: 'Chào Admin, tôi cần hỗ trợ thay đổi Giấy phép kinh doanh...',
        timestamp: '2026-03-10T09:30:00Z',
        status: 'open',
    },
    {
        id: 'TICK-102',
        providerName: 'Hà Nội Tours',
        subject: 'Lỗi không hiển thị hình ảnh tour',
        lastMessage: 'Đã giải quyết, hình ảnh đã hiển thị bình thường. Cảm ơn.',
        timestamp: '2026-03-09T15:20:00Z',
        status: 'closed',
    }
];

export const AdminMessagesPage: React.FC = () => {
    const [tickets] = useState<SupportTicket[]>(mockTickets);
    const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
    const [replyText, setReplyText] = useState('');

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex h-[calc(100vh-140px)] min-h-[500px]">
                {/* Left Sidebar - Ticket List */}
                <div className="w-full md:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Hỗ trợ Chủ dịch vụ</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quản lý các yêu cầu hỗ trợ (Tickets)</p>
                        <div className="mt-4 relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm ticket..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-lg text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-0 transition-all dark:text-white"
                            />
                            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {tickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`w-full text-left p-4 hover:bg-white dark:hover:bg-gray-800/50 flex flex-col gap-2 transition-colors border-l-4 cursor-pointer ${activeTicket?.id === ticket.id ? 'bg-white dark:bg-gray-800 border-l-blue-600 shadow-sm' : 'border-l-transparent border-b border-gray-100 dark:border-gray-700'}`}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{ticket.providerName}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formatTime(ticket.timestamp)}</span>
                                </div>
                                <div className="pl-10">
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{ticket.subject}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ticket.lastMessage}</p>
                                    <div className="mt-2 flex items-center gap-1">
                                        {ticket.status === 'open' ? (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 text-[10px] rounded-full font-medium">
                                                <Clock className="w-3 h-3" /> Đang xử lý
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-[10px] rounded-full font-medium">
                                                <CheckCircle className="w-3 h-3" /> Đã đóng
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Area - Ticket Detail */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-gray-900/20">
                    {activeTicket ? (
                        <>
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shadow-sm z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Mã: {activeTicket.id}</span>
                                    <button className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                        Đóng Ticket
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activeTicket.subject}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                    Yêu cầu từ: <strong className="text-gray-800 dark:text-gray-200">{activeTicket.providerName}</strong>
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {/* Mock Ticket Messages History */}
                                <div className="flex justify-start">
                                    <div className="max-w-[70%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm text-sm text-gray-800 dark:text-gray-200 rounded-tl-none">
                                        <p>{activeTicket.lastMessage}</p>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 block">{formatTime(activeTicket.timestamp)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Soạn phản hồi hỗ trợ cho Chủ dịch vụ..."
                                        className="flex-1 bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none dark:text-white"
                                    />
                                    <button
                                        className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm font-medium gap-2 cursor-pointer"
                                    >
                                        Gửi <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-blue-300 dark:text-blue-500/50" />
                            </div>
                            <p>Chọn một Ticket để bắt đầu hỗ trợ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesPage;
