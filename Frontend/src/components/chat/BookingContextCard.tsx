import React, { useState, useEffect } from 'react';
import { Package, Tag, Loader2, Calendar, Phone, CreditCard, Ticket, BedDouble, FileText } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface BookingContextCardProps {
    attachmentId: string;
    attachmentData?: any;
    type?: 'service' | 'order' | string;
    mini?: boolean;
}

export const BookingContextCard: React.FC<BookingContextCardProps> = ({ attachmentId, attachmentData, type, mini }) => {
    const [localData, setLocalData] = useState<any>(null);
    const [loading, setLoading] = useState(!!attachmentId);

    useEffect(() => {
        if (!attachmentId) {
            if (attachmentData) {
                setLocalData(attachmentData);
                setLoading(false);
            }
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === 'order') {
                    const order = await apiClient.orders.getById(attachmentId);
                    if (order) {
                        const firstTicket = order?.orderedTickets?.[0];
                        const firstRoom = order?.orderedRooms?.[0];
                        const service = firstTicket?.ticket?.ticketVenue || firstRoom?.room?.hotel;

                        const title = service?.serviceName || 'Dịch vụ du lịch';
                        const detailName = firstTicket?.ticket?.name || firstRoom?.room?.name || '';
                        const thumbnailUrl = service?.thumbnailUrl || firstRoom?.room?.roomImgUrl || '';
                        const price = order?.totalPrice || 0;
                        const finalPrice = order?.finalPrice || order?.totalPrice || 0;
                        const discountPrice = order?.discountPrice || 0;
                        const deposit = order?.deposit || 0;
                        const status = order?.status || 'PENDING';
                        const bookingCode = (order?.orderID || attachmentId).substring(0, 8).toUpperCase();
                        const guestPhone = order?.guestPhone || order?.user?.phone || '';
                        const guestName = order?.user?.fullname || 'Khách hàng';
                        const guestEmail = order?.user?.email || '';
                        const note = order?.note || '';
                        const isHotel = !!firstRoom || service?.serviceType === 'HOTEL';
                        
                        const startDate = firstRoom?.startDate || firstTicket?.validStart || '';
                        const endDate = firstRoom?.endDate || firstTicket?.validEnd || '';
                        const amount = firstRoom?.amount || firstTicket?.amount || 1;

                        setLocalData({
                            title,
                            detailName,
                            thumbnailUrl,
                            price,
                            finalPrice,
                            discountPrice,
                            deposit,
                            status,
                            bookingCode,
                            guestName,
                            guestEmail,
                            guestPhone,
                            note,
                            isHotel,
                            startDate,
                            endDate,
                            amount
                        });
                    } else if (attachmentData) {
                        // Fallback to attachmentData if API call succeeds but returns null
                        setLocalData(attachmentData);
                    }
                } else if (type === 'service') {
                    const service = await apiClient.services.getById(attachmentId);
                    setLocalData({
                        title: service?.serviceName || 'Dịch vụ',
                        thumbnailUrl: service?.thumbnailUrl || '',
                        price: service?.averagePrice || service?.minPrice || 0,
                        status: service?.status || 'APPROVED',
                        isServiceOnly: true
                    });
                }
            } catch (err) {
                console.error('Failed to load attachment details in chat:', err);
                if (attachmentData) {
                    setLocalData(attachmentData);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [attachmentId, attachmentData, type]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    if (loading) {
        if (mini) {
            return (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-orange-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải...</span>
                </div>
            );
        }
        return (
            <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm flex items-center gap-2.5 justify-center w-80 max-w-full">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                <span className="text-sm text-gray-500 font-bold">Đang tải chi tiết đặt chỗ...</span>
            </div>
        );
    }

    if (localData) {
        if (mini) {
            return (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-orange-100 bg-orange-600/40 border border-orange-400/20 px-2 py-0.5 rounded-md w-fit select-none leading-none">
                    <Tag className="w-2.5 h-2.5 flex-shrink-0" />
                    <span>Hỏi về: {localData.title}</span>
                </div>
            );
        }
        if (localData.isServiceOnly) {
            return (
                <div className="mt-2 p-3.5 bg-white border border-gray-100 rounded-2xl shadow-md w-80 max-w-full text-gray-800">
                    <div className="flex gap-3">
                        {localData.thumbnailUrl ? (
                            <img 
                                src={localData.thumbnailUrl} 
                                alt="thumbnail" 
                                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Tag className="w-6 h-6 text-orange-500" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-0.5">Đang hỏi về dịch vụ</span>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                {localData.title}
                            </h4>
                            <p className="text-xs text-orange-600 font-extrabold mt-1">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(localData.price)}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        const statusConfig = {
            SUCCESS: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Thành công' },
            PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Chờ duyệt' },
            ACCEPTED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'Đã duyệt' },
            CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Đã hủy' }
        }[localData.status as string] || { bg: 'bg-gray-50 text-gray-700 border-gray-100', label: localData.status };

        return (
            <div className="mt-2.5 p-4 bg-white border border-gray-100 rounded-2xl shadow-lg w-80 max-w-full text-gray-800 font-sans">
                {/* Header: Code & Status */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
                    <span className="text-[10px] font-mono text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md font-bold">
                        #{localData.bookingCode}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusConfig.bg}`}>
                        {statusConfig.label}
                    </span>
                </div>

                {/* Service Info */}
                <div className="flex gap-3 mb-3 pb-3 border-b border-gray-100">
                    {localData.thumbnailUrl ? (
                        <img 
                            src={localData.thumbnailUrl} 
                            alt="thumbnail" 
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                        />
                    ) : (
                        <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            {localData.isHotel ? <BedDouble className="w-6 h-6 text-orange-500" /> : <Ticket className="w-6 h-6 text-orange-500" />}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">
                            {localData.isHotel ? 'Đặt phòng khách sạn' : 'Vé dịch vụ du lịch'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                            {localData.title}
                        </h4>
                        {localData.detailName && (
                            <p className="text-xs text-gray-500 font-semibold truncate mt-0.5">
                                {localData.detailName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Booking and Customer Details */}
                <div className="space-y-2 text-xs text-gray-600 pb-3 border-b border-gray-100">
                    {/* Guest Name & Contact */}
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-400 font-medium shrink-0">Khách hàng:</span>
                        <div className="text-right">
                            <p className="font-bold text-gray-800">{localData.guestName}</p>
                            {localData.guestPhone && (
                                <p className="text-[10px] font-medium text-gray-500 flex items-center justify-end gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-gray-400" /> {localData.guestPhone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {localData.isHotel ? 'Thời gian nhận/trả:' : 'Ngày sử dụng:'}
                        </span>
                        <span className="font-bold text-gray-800 text-right">
                            {localData.isHotel 
                                ? `${formatDate(localData.startDate)} - ${formatDate(localData.endDate)}`
                                : `${formatDate(localData.startDate)}`
                            }
                        </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-400 font-medium">
                            <FileText className="w-3.5 h-3.5" />
                            Số lượng đặt:
                        </span>
                        <span className="font-bold text-gray-800">
                            {localData.amount} {localData.isHotel ? 'phòng' : 'vé'}
                        </span>
                    </div>

                    {/* Guest Note */}
                    {localData.note && (
                        <div className="bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ghi chú từ khách:</span>
                            <p className="text-gray-700 italic leading-snug">{localData.note}</p>
                        </div>
                    )}
                </div>

                {/* Price and Deposit Breakdown */}
                <div className="pt-2.5 space-y-1.5 text-xs">
                    {localData.price > localData.finalPrice && (
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Giá tạm tính:</span>
                            <span className="line-through">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(localData.price)}
                            </span>
                        </div>
                    )}
                    {localData.discountPrice > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-medium">
                            <span>Giảm giá:</span>
                            <span>
                                -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(localData.discountPrice)}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between font-medium">
                        <span className="text-gray-500">Tổng thanh toán:</span>
                        <span className="text-sm font-black text-orange-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(localData.finalPrice)}
                        </span>
                    </div>
                    {localData.deposit > 0 && (
                        <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-1.5 mt-1.5 text-[11px]">
                            <span className="text-gray-400 font-medium">Đã cọc trước:</span>
                            <span className="font-bold text-emerald-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(localData.deposit)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Fallback if load fails
    return (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl shadow-sm flex items-center gap-2.5 w-80 max-w-full">
            {type === 'order' ? (
                <Package className="w-5 h-5 text-blue-500 flex-shrink-0" />
            ) : (
                <Tag className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
            <p className="text-xs text-blue-800 font-bold">
                {type === 'order' ? 'Đặt chỗ ID:' : 'Dịch vụ ID:'} {attachmentId}
            </p>
        </div>
    );
};
