// src/pages/ServiceProvider/Bookings/components/BookingDetailModal.tsx
import { useQuery } from '@tanstack/react-query';
import { X, User, MapPin, Calendar, CreditCard, Clock } from 'lucide-react';
import { bookingApi } from '@/api/bookingApi';
import type { Booking } from '@/types/booking.types';
import { Badge } from '@/components/ui/admin/badge';

interface BookingDetailModalProps {
    booking: Booking;
    open: boolean;
    onClose: () => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function BookingDetailModal({ booking, open, onClose }: BookingDetailModalProps) {
    const { data: bookingDetail, isLoading } = useQuery({
        queryKey: ['booking-detail', booking.id],
        queryFn: () => bookingApi.getBookingDetail(booking.id),
        enabled: open,
    });

    if (!open) return null;

    const statusConfig = {
        confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Đã xác nhận" },
        pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ xử lý" },
        cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
        completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Hoàn thành" },
    };

    const currentStatus = statusConfig[booking.status];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Chi tiết đơn đặt</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Mã đơn: <span className="font-medium">{booking.bookingCode}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Đang tải chi tiết...
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Status */}
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <span className="font-medium">Trạng thái:</span>
                            <Badge className={`${currentStatus.bg} ${currentStatus.text}`}>
                                {currentStatus.label}
                            </Badge>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Thông tin khách hàng
                            </h3>
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Họ tên</p>
                                    <p className="font-medium">{booking.guest.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{booking.guest.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                    <p className="font-medium">{booking.guest.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Số khách</p>
                                    <p className="font-medium">
                                        {booking.guests.adults} người lớn, {booking.guests.children} trẻ em
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Service Info */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Thông tin dịch vụ
                            </h3>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-start gap-4">
                                    {booking.service.thumbnailUrl && (
                                        <img
                                            src={booking.service.thumbnailUrl}
                                            alt={booking.service.name}
                                            className="w-24 h-24 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg">{booking.service.name}</h4>
                                        <Badge className={booking.service.type === "hotel" ? "bg-blue-100 text-blue-700 mt-2" : "bg-green-100 text-green-700 mt-2"}>
                                            {booking.service.type === "hotel" ? "Khách sạn" : "Vé tham quan"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Chi tiết đặt chỗ
                            </h3>
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày nhận/đi</p>
                                    <p className="font-medium">{formatDate(booking.checkIn)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày trả/về</p>
                                    <p className="font-medium">{formatDate(booking.checkOut)}</p>
                                </div>
                            </div>

                            {/* Rooms/Tickets */}
                            {bookingDetail?.rooms && bookingDetail.rooms.length > 0 && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Phòng đã đặt</p>
                                    <div className="space-y-2">
                                        {bookingDetail.rooms.map((room: { id: string; name: string; quantity: number; pricePerNight: number }) => (
                                            <div key={room.id} className="flex justify-between items-center">
                                                <span>{room.name} x{room.quantity}</span>
                                                <span className="font-medium">{formatCurrency(room.pricePerNight)}/đêm</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bookingDetail?.tickets && bookingDetail.tickets.length > 0 && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Vé đã đặt</p>
                                    <div className="space-y-2">
                                        {bookingDetail.tickets.map((ticket: { type: 'adult' | 'child'; quantity: number; price: number }, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span>{ticket.type === 'adult' ? 'Người lớn' : 'Trẻ em'} x{ticket.quantity}</span>
                                                <span className="font-medium">{formatCurrency(ticket.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bookingDetail?.specialRequests && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Yêu cầu đặc biệt</p>
                                    <p className="text-sm">{bookingDetail.specialRequests}</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Info */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Thông tin thanh toán
                            </h3>
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phương thức thanh toán</span>
                                    <span className="font-medium">{bookingDetail?.paymentMethod || 'Chưa xác định'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Trạng thái thanh toán</span>
                                    <Badge className={
                                        booking.paymentStatus === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : booking.paymentStatus === 'refunded'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                    }>
                                        {booking.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                            booking.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chờ thanh toán'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="font-semibold text-lg">Tổng tiền</span>
                                    <span className="font-bold text-lg text-primary">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status History */}
                        {bookingDetail?.statusHistory && bookingDetail.statusHistory.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Lịch sử thay đổi
                                </h3>
                                <div className="space-y-2">
                                    {bookingDetail.statusHistory.map((history: { status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; note?: string; changedBy: string; changedAt: string }, idx: number) => (
                                        <div key={idx} className="p-3 bg-muted/50 rounded-lg flex justify-between items-start">
                                            <div>
                                                <Badge className={statusConfig[history.status].bg + ' ' + statusConfig[history.status].text}>
                                                    {statusConfig[history.status].label}
                                                </Badge>
                                                {history.note && (
                                                    <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                <p>{formatDateTime(history.changedAt)}</p>
                                                <p>Bởi: {history.changedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Note */}
                        {booking.note && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Ghi chú</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{booking.note}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 bg-background border-t border-border p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
