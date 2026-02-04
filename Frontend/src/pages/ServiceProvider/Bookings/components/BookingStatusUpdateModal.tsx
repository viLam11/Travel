// src/pages/ServiceProvider/Bookings/components/BookingStatusUpdateModal.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { bookingApi } from '@/api/bookingApi';
import type { Booking, BookingStatus } from '@/types/booking.types';
import { Button } from '@/components/ui/admin/button';
import toast from 'react-hot-toast';

interface BookingStatusUpdateModalProps {
    booking: Booking;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookingStatusUpdateModal({
    booking,
    open,
    onClose,
    onSuccess,
}: BookingStatusUpdateModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('confirmed');
    const [note, setNote] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const updateStatusMutation = useMutation({
        mutationFn: (data: { status: BookingStatus; note?: string }) =>
            bookingApi.updateBookingStatus(booking.id, data.status, data.note),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái thành công!');
            onSuccess();
        },
        onError: (error) => {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
            console.error(error);
        },
    });

    const cancelBookingMutation = useMutation({
        mutationFn: (reason: string) => bookingApi.cancelBooking(booking.id, reason),
        onSuccess: () => {
            toast.success('Đã hủy đơn đặt thành công!');
            onSuccess();
        },
        onError: (error) => {
            toast.error('Có lỗi xảy ra khi hủy đơn đặt');
            console.error(error);
        },
    });

    const handleSubmit = () => {
        if (selectedStatus === 'cancelled') {
            if (!cancelReason.trim()) {
                toast.error('Vui lòng nhập lý do hủy đơn');
                return;
            }
            cancelBookingMutation.mutate(cancelReason);
        } else {
            updateStatusMutation.mutate({
                status: selectedStatus,
                note: note.trim() || undefined,
            });
        }
    };

    if (!open) return null;

    const statusOptions = [
        {
            value: 'confirmed' as BookingStatus,
            label: 'Xác nhận đơn',
            description: 'Xác nhận đơn đặt và thông báo cho khách hàng',
            icon: CheckCircle,
            color: 'text-green-600',
            disabled: booking.status !== 'pending',
        },
        {
            value: 'completed' as BookingStatus,
            label: 'Hoàn thành',
            description: 'Đánh dấu đơn đặt đã hoàn thành',
            icon: CheckCircle,
            color: 'text-blue-600',
            disabled: booking.status !== 'confirmed',
        },
        {
            value: 'cancelled' as BookingStatus,
            label: 'Hủy đơn',
            description: 'Hủy đơn đặt và hoàn tiền cho khách hàng',
            icon: XCircle,
            color: 'text-red-600',
            disabled: booking.status === 'completed' || booking.status === 'cancelled',
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="border-b border-border p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Cập nhật trạng thái</h2>
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

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Current Status */}
                    <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Trạng thái hiện tại</p>
                            <p className="font-medium">
                                {booking.status === 'pending' && 'Chờ xử lý'}
                                {booking.status === 'confirmed' && 'Đã xác nhận'}
                                {booking.status === 'completed' && 'Hoàn thành'}
                                {booking.status === 'cancelled' && 'Đã hủy'}
                            </p>
                        </div>
                    </div>

                    {/* Status Options */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Chọn trạng thái mới</label>
                        <div className="space-y-2">
                            {statusOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedStatus(option.value)}
                                        disabled={option.disabled}
                                        className={`w-full p-4 border rounded-lg text-left transition-all ${selectedStatus === option.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className={`w-5 h-5 mt-0.5 ${option.color}`} />
                                            <div className="flex-1">
                                                <p className="font-medium">{option.label}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {option.description}
                                                </p>
                                            </div>
                                            {selectedStatus === option.value && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Note/Reason Input */}
                    {selectedStatus === 'cancelled' ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-red-600">
                                Lý do hủy đơn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Nhập lý do hủy đơn (bắt buộc)..."
                                className="w-full px-4 py-3 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                rows={4}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Thêm ghi chú cho đơn đặt..."
                                className="w-full px-4 py-3 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Warning for Cancel */}
                    {selectedStatus === 'cancelled' && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-red-800 dark:text-red-200">
                                    Lưu ý khi hủy đơn
                                </p>
                                <ul className="list-disc list-inside text-red-700 dark:text-red-300 mt-1 space-y-1">
                                    <li>Khách hàng sẽ nhận được thông báo hủy đơn</li>
                                    <li>Tiền sẽ được hoàn lại cho khách hàng (nếu đã thanh toán)</li>
                                    <li>Hành động này không thể hoàn tác</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={updateStatusMutation.isPending || cancelBookingMutation.isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateStatusMutation.isPending || cancelBookingMutation.isPending}
                        className={selectedStatus === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {updateStatusMutation.isPending || cancelBookingMutation.isPending
                            ? 'Đang xử lý...'
                            : selectedStatus === 'cancelled'
                                ? 'Xác nhận hủy đơn'
                                : 'Cập nhật trạng thái'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
