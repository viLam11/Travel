// src/pages/ServiceProvider/Services/EditServicePage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { serviceApi } from '@/api/serviceApi';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/admin/button';
import toast from 'react-hot-toast';

export default function EditServicePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch service data
    const { data: service, isLoading, error } = useQuery({
        queryKey: ['service', id],
        queryFn: () => serviceApi.getServiceById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (error) {
            toast.error('Không thể tải thông tin dịch vụ');
            navigate('/admin/services/list');
        }
    }, [error, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Đang tải thông tin dịch vụ...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Không tìm thấy dịch vụ</p>
                    <Button onClick={() => navigate('/admin/services/list')} className="mt-4">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate('/admin/services/list')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Chỉnh sửa dịch vụ</h1>
                        <p className="text-muted-foreground mt-1">
                            {service.serviceName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder - Will integrate with AddServicePage form */}
            <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-12 text-center">
                <p className="text-lg font-medium mb-2">Tính năng đang được phát triển</p>
                <p className="text-muted-foreground mb-6">
                    Trang chỉnh sửa dịch vụ sẽ sử dụng form từ AddServicePage với dữ liệu được điền sẵn
                </p>
                <div className="space-y-2 text-sm text-muted-foreground text-left max-w-md mx-auto">
                    <p>✅ API đã sẵn sàng</p>
                    <p>✅ Fetch dữ liệu thành công</p>
                    <p>⏳ Đang tích hợp form component</p>
                </div>
                <Button onClick={() => navigate('/admin/services/list')} className="mt-6">
                    Quay lại danh sách
                </Button>
            </div>
        </div>
    );
}
