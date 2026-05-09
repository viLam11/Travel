import React, { useState } from 'react';
import { Ticket, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { TicketType } from '@/types/serviceDetail.types';

interface TicketsTabProps {
    tickets?: TicketType[];
    onTicketBookNow?: (ticketId: string) => void;
    isLoading?: boolean;
}

const TicketsTab: React.FC<TicketsTabProps> = ({ tickets = [], onTicketBookNow, isLoading = false }) => {
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTickets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!isLoading && (!tickets || tickets.length === 0)) {
        return (
            <div className="bg-orange-50 rounded-xl p-6 text-center">
                <p className="text-gray-600">Hiện chưa có thông tin về các loại vé cho địa điểm này.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Các loại vé tham quan
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Lựa chọn loại vé phù hợp với nhu cầu của bạn
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        // Skeleton for tickets
                        [1, 2].map((i) => (
                            <div key={i} className="border border-gray-100 rounded-xl p-5 animate-pulse">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-100 rounded-lg w-9 h-9"></div>
                                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        <div className="flex gap-2">
                                            <div className="h-7 bg-gray-100 rounded w-20"></div>
                                            <div className="h-7 bg-gray-100 rounded w-24"></div>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-32 space-y-2">
                                        <div className="h-3 bg-gray-100 rounded w-1/2 ml-auto"></div>
                                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                                        <div className="h-10 bg-gray-100 rounded w-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className={`border rounded-xl p-4 sm:p-5 transition-all cursor-pointer ${selectedTicket === ticket.id
                                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                                : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                                }`}
                            onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                            <Ticket className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {ticket.title}
                                        </h4>
                                    </div>
                                    <div className="text-gray-600 text-sm mb-3">
                                        <p className="inline">
                                            {expandedTickets[ticket.id]
                                                ? ticket.description
                                                : (ticket.description.length > 120
                                                    ? `${ticket.description.slice(0, 120)}...`
                                                    : ticket.description)}
                                        </p>
                                        {ticket.description.length > 120 && (
                                            <button
                                                onClick={(e) => toggleExpand(ticket.id, e)}
                                                className="ml-1 text-orange-500 font-bold hover:text-orange-600 inline-flex items-center gap-0.5"
                                            >
                                                {expandedTickets[ticket.id] ? (
                                                    <>Rút gọn <ChevronUp className="w-3 h-3" /></>
                                                ) : (
                                                    <>Xem thêm <ChevronDown className="w-3 h-3" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 sm:gap-4">
                                        {ticket.inclusions?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-100">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                                    <p className="text-xs text-gray-500 mb-0.5">Giá vé</p>
                                    <div className="flex items-center gap-2 sm:block">
                                        <p className="text-xl sm:text-2xl font-bold text-orange-500">
                                            {(ticket.price || 0).toLocaleString()} đ
                                        </p>
                                    </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onTicketBookNow) onTicketBookNow(ticket.id);
                                            }}
                                            className="cursor-pointer mt-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 w-full sm:w-auto"
                                        >
                                            Đặt ngay
                                        </button>
                                    </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Lưu ý khi đặt vé</h4>
                    <p className="text-sm text-blue-800">
                        Vé điện tử sẽ được gửi qua email sau khi thanh toán thành công. Vui lòng xuất trình mã QR tại cổng soát vé.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TicketsTab;
