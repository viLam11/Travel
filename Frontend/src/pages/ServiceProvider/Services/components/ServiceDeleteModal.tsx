// src/pages/ServiceProvider/Services/components/ServiceDeleteModal.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { serviceApi } from '@/api/serviceApi';
import type { Service } from '@/types/service.types';
import { Button } from '@/components/ui/admin/button';
import toast from 'react-hot-toast';

interface ServiceDeleteModalProps {
    service: Service;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ServiceDeleteModal({
    service,
    open,
    onClose,
    onSuccess,
}: ServiceDeleteModalProps) {
    const [confirmText, setConfirmText] = useState('');

    const deleteMutation = useMutation({
        mutationFn: () => serviceApi.deleteService(service.id),
        onSuccess: () => {
            toast.success('Xóa dịch vụ thành công!');
            onSuccess();
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi xóa dịch vụ');
        },
    });

    const handleDelete = () => {
        if (confirmText !== service.serviceName) {
            toast.error('Tên dịch vụ không khớp!');
            return;
        }
        deleteMutation.mutate();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="border-b border-border p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Xóa dịch vụ</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Hành động này không thể hoàn tác
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Service Info */}
                    <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start gap-3">
                            {service.thumbnailUrl && (
                                <img
                                    src={service.thumbnailUrl}
                                    alt={service.serviceName}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold">{service.serviceName}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {service.province.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {service.type === 'hotel' ? 'Khách sạn' : 'Vé tham quan'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                                    Cảnh báo: Xóa dịch vụ sẽ ảnh hưởng đến:
                                </p>
                                <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1">
                                    <li>Tất cả đơn đặt liên quan ({service.bookingCount} đơn)</li>
                                    <li>Tất cả đánh giá ({service.reviewCount} đánh giá)</li>
                                    <li>Dữ liệu thống kê và báo cáo</li>
                                    <li>Không thể khôi phục sau khi xóa</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Để xác nhận, vui lòng nhập tên dịch vụ:{' '}
                            <span className="font-bold text-red-600">{service.serviceName}</span>
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Nhập tên dịch vụ để xác nhận"
                            className="w-full px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            disabled={deleteMutation.isPending}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteMutation.isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending || confirmText !== service.serviceName}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa dịch vụ'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
