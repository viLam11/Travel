import React, { useState } from 'react';
import {
    CheckSquare,
    XSquare,
    ArrowRight,
    AlertCircle,
    Search,
    Eye,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { ApiClient } from '@/services/apiClient';

// Types
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ServiceUpdateReq {
    id: string;
    providerId: string;
    providerName: string;
    serviceName: string;
    serviceType: 'hotel' | 'tour' | 'place';
    status: ApprovalStatus;
    submittedAt: string;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
}

// No more Mock Data

const STATUS_BADGE_CONFIG: Record<string, { label: string, className: string }> = {
    pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400' },
    approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' },
    rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' },
};

export const AdminServiceApprovalsPage: React.FC = () => {
    const [requests, setRequests] = useState<ServiceUpdateReq[]>([]);
    const [selectedReq, setSelectedReq] = useState<ServiceUpdateReq | null>(null);
    const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const apiClient = new ApiClient();

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.services.getAll();
            const data = response as any;
            
            const services = Array.isArray(data) ? data : (data?.items || []);
            const mapped: ServiceUpdateReq[] = services.map((s: any) => ({
                id: s.serviceID || s.id,
                providerId: s.userID?.toString() || 'Unknown',
                providerName: 'Provider ' + (s.userID || 'Unknown'),
                serviceName: s.serviceName || s.name || 'Unnamed Service',
                serviceType: s.serviceType?.toLowerCase() || 'hotel',
                status: s.status?.toLowerCase() || 'pending',
                submittedAt: s.createdAt || new Date().toISOString(),
                changes: [
                    { field: 'Loại Dịch Vụ', oldValue: '(Tạo mới)', newValue: s.serviceType || 'Chưa rõ' },
                    { field: 'Mô Tả', oldValue: '(Trống)', newValue: s.description || 'Không có mô tả' },
                    { field: 'Địa chỉ', oldValue: '(Trống)', newValue: s.address || 'Không có địa chỉ' }
                ]
            }));
            
            setRequests(mapped);
        } catch (error) {
            console.error('Failed to fetch services', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRequests();
    }, []);

    // Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const filteredRequests = requests.filter(req => {
        const reqStat = req.status.toLowerCase();
        const matchStatus = filterStatus === 'all' || reqStat === filterStatus;
        const matchSearch = searchTerm === '' ||
            req.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleApprove = async (id: string) => {
        try {
            await apiClient.post(`/users/${id}/handleServiceStatus`, "APPROVED", {
                headers: { 'Content-Type': 'application/json' }
            });
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            setSelectedReq(null);
            alert('Đã phê duyệt thành công!');
        } catch (error) {
            console.error(error);
            alert('Lỗi phê duyệt dịch vụ!');
        }
    };

    const handleRejectClick = () => {
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (selectedReq && rejectReason.trim()) {
            try {
                await apiClient.post(`/users/${selectedReq.id}/handleServiceStatus`, "REJECTED", {
                    headers: { 'Content-Type': 'application/json' }
                });
                setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: 'rejected' } : r));
                setShowRejectModal(false);
                setSelectedReq(null);
                setRejectReason('');
                alert('Từ chối thành công!');
            } catch (error) {
                console.error(error);
                alert('Lỗi từ chối dịch vụ!');
            }
        }
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        const statLower = status.toLowerCase();
        const conf = STATUS_BADGE_CONFIG[statLower] || { label: statLower, className: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${conf.className}`}>
                {conf.label}
            </span>
        );
    };

    const FILTER_TABS = [
        { value: 'pending', label: 'Chờ duyệt' },
        { value: 'approved', label: 'Đã duyệt' },
        { value: 'rejected', label: 'Đã từ chối' },
        { value: 'all', label: 'Tất cả' },
    ] as const;

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Duyệt thông tin Dịch vụ</h1>
                    <p className="text-muted-foreground mt-1">
                        Kiểm duyệt các thay đổi thông tin do Chủ dịch vụ đề xuất trước khi hiển thị công khai.
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilterStatus(tab.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                    filterStatus === tab.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm theo tên hoặc mã..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Request List */}
                <Card className="flex-1 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                                    <th className="px-5 py-3.5 font-semibold">Mã YC</th>
                                    <th className="px-5 py-3.5 font-semibold">Chủ dịch vụ</th>
                                    <th className="px-5 py-3.5 font-semibold">Tên dịch vụ</th>
                                    <th className="px-5 py-3.5 font-semibold">Thời gian gửi</th>
                                    <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                                    <th className="px-5 py-3.5 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            Đang tải dữ liệu chờ duyệt...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length > 0 ? (
                                    filteredRequests.map(req => (
                                    <tr
                                        key={req.id}
                                        className={`hover:bg-accent/30 transition-colors ${
                                            selectedReq?.id === req.id ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <td className="px-5 py-4 text-sm font-mono font-medium">{req.id}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{req.providerName}</td>
                                        <td className="px-5 py-4 text-sm font-medium">{req.serviceName}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">
                                            {new Date(req.submittedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-4">{getStatusBadge(req.status)}</td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => setSelectedReq(req)}
                                                className="flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm font-medium transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Xem xét
                                            </button>
                                        </td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            Không có yêu cầu nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Right Side: Detail Panel (Side-by-side DIFF) */}
                {selectedReq && (
                    <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 flex flex-col sticky top-6">
                        <Card className="flex-1 flex flex-col overflow-hidden border-primary/30 max-h-[calc(100vh-220px)]">
                            {/* Panel Header */}
                            <div className="px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-start flex-shrink-0">
                                <div>
                                    <h3 className="font-bold text-base">Chi tiết yêu cầu {selectedReq.id}</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {selectedReq.serviceName} · {selectedReq.providerName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedReq.status)}
                                    <button
                                        onClick={() => setSelectedReq(null)}
                                        className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-900/10 text-sm text-amber-800 dark:text-amber-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
                                    <p>Nhà cung cấp yêu cầu cập nhật <strong>{selectedReq.changes.length}</strong> mục thông tin. Đối chiếu kỹ trước khi phê duyệt.</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                        Nội dung thay đổi
                                    </h4>

                                    {selectedReq.changes.map((change, idx) => (
                                        <div key={idx} className="border border-border rounded-lg overflow-hidden">
                                            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider" style={{ backgroundColor: 'var(--muted)' }}>
                                                {change.field}
                                            </div>
                                            <div className="grid grid-cols-2 divide-x divide-border">
                                                <div className="p-3 bg-red-50/40 dark:bg-red-900/10">
                                                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase mb-1 block">Cũ</span>
                                                    <p className="text-sm text-muted-foreground line-through decoration-red-400 decoration-2">{change.oldValue}</p>
                                                </div>
                                                <div className="p-3 bg-green-50/40 dark:bg-green-900/10">
                                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1 block">Mới</span>
                                                    <p className="text-sm font-medium">{change.newValue}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel Footer Actions */}
                            {selectedReq.status === 'pending' && (
                                <div className="p-4 border-t border-border bg-muted/20 flex gap-3 flex-shrink-0">
                                    <Button
                                        onClick={() => handleApprove(selectedReq.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                        Phê duyệt
                                    </Button>
                                    <Button
                                        onClick={handleRejectClick}
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <XSquare className="w-4 h-4" />
                                        Từ chối
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <Card className="max-w-md w-full">
                        <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="text-lg font-bold">Lý do từ chối</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Thông báo này sẽ được gửi đến chủ dịch vụ.</p>
                        </CardHeader>
                        <CardContent className="py-4">
                            <textarea
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do chi tiết để chủ dịch vụ có thể chỉnh sửa lại..."
                                className="w-full border border-input rounded-lg p-3 text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none resize-none transition-[color,box-shadow]"
                                style={{ backgroundColor: 'var(--input)', color: 'var(--foreground)' }}
                            />
                        </CardContent>
                        <div className="px-6 pb-5 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReject}
                                disabled={!rejectReason.trim()}
                            >
                                Xác nhận từ chối
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminServiceApprovalsPage;
