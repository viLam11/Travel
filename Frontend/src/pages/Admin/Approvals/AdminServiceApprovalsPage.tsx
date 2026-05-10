import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    XSquare,
    AlertCircle,
    Search,
    X,
    Clock,
    CheckCircle,
    FileText,
    ArrowUpRight,
    Loader2,
    Tag,
    MapPin,
    Phone,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { useToast } from '@/contexts/ToastContext';
import apiClient from '@/services/apiClient';

// Types
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

interface ServiceUpdateReq {
    id: string;
    providerId: string;
    providerName: string;
    serviceName: string;
    serviceType: string;
    status: ApprovalStatus;
    submittedAt: string;
    description: string;
    address: string;
    contactNumber: string;
    thumbnailUrl: string;
    averagePrice: number;
    provinceName: string;
    tags?: string;
    rating?: number;
}

const STATUS_BADGE_CONFIG: Record<string, { label: string, className: string }> = {
    pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-700' },
    active: { label: 'Đang hoạt động', className: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Từ chối', className: 'bg-rose-100 text-rose-700' },
};

export const AdminServiceApprovalsPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [requests, setRequests] = useState<ServiceUpdateReq[]>([]);
    const [selectedReq, setSelectedReq] = useState<ServiceUpdateReq | null>(null);
    const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.services.getAll();
            const services = Array.isArray(res) ? res : [];
            const mapped: ServiceUpdateReq[] = services.map((s: any) => ({
                id: s.id,
                providerId: s.provider?.userID?.toString() || 'Unknown',
                providerName: s.provider?.fullname || s.provider?.username || 'Nhà cung cấp ẩn danh',
                serviceName: s.serviceName || 'Dịch vụ chưa đặt tên',
                serviceType: s.serviceType || 'HOTEL',
                status: s.status?.toLowerCase() || 'pending',
                submittedAt: s.createdAt || new Date().toISOString(),
                description: s.description || 'Không có mô tả',
                address: s.address || 'Không có địa chỉ cụ thể',
                contactNumber: s.contactNumber || 'Chưa cung cấp số điện thoại',
                thumbnailUrl: s.thumbnailUrl || '',
                averagePrice: s.averagePrice || 0,
                provinceName: s.province?.name || s.province?.fullName || 'Chưa rõ tỉnh thành',
                tags: s.tags,
                rating: s.rating
            }));
            
            setRequests(mapped);
        } catch (error) {
            console.error('Failed to fetch services', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const filteredRequests = requests.filter(req => {
        const reqStat = req.status.toLowerCase();
        // Normalize 'active' to 'approved' for filtering if needed, or keep separate
        const normalizedStat = reqStat === 'active' ? 'approved' : reqStat;
        const matchStatus = filterStatus === 'all' || normalizedStat === filterStatus;
        const matchSearch = searchTerm === '' ||
            req.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleApprove = async (id: string) => {
        setIsProcessing(id);
        try {
            await apiClient.post(`/users/${id}/handleServiceStatus`, "APPROVED", {
                headers: { 'Content-Type': 'application/json' }
            });
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            
            // Nếu đang chọn chính request này thì update state selected luôn
            if (selectedReq?.id === id) {
                setSelectedReq(prev => prev ? { ...prev, status: 'approved' } : null);
            }
            
            success('Đã phê duyệt dịch vụ thành công!');
        } catch (error) {
            console.error(error);
            toastError('Lỗi phê duyệt dịch vụ!');
        } finally {
            setIsProcessing(null);
        }
    };

    const confirmReject = async () => {
        if (selectedReq && rejectReason.trim()) {
            setIsProcessing(selectedReq.id);
            try {
                await apiClient.post(`/users/${selectedReq.id}/handleServiceStatus`, "REJECTED", {
                    headers: { 'Content-Type': 'application/json' }
                });
                setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: 'rejected' } : r));
                
                // Update selected request status
                setSelectedReq(prev => prev ? { ...prev, status: 'rejected' } : null);
                
                setShowRejectModal(false);
                setRejectReason('');
                success('Đã từ chối dịch vụ thành công!');
            } catch (error) {
                console.error(error);
                toastError('Lỗi từ chối dịch vụ!');
            } finally {
                setIsProcessing(null);
            }
        }
    };

    const stats = [
        { label: 'Chờ duyệt', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Tổng yêu cầu', value: requests.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Đã duyệt', value: requests.filter(r => r.status === 'approved' || r.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Phê duyệt dịch vụ</h1>
                    <p className="text-sm text-muted-foreground mt-1">Kiểm tra và phê duyệt các dịch vụ mới hoặc yêu cầu thay đổi từ nhà cung cấp.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-[96px] bg-muted/40 border border-border/40 animate-pulse rounded-xl p-5 flex flex-col justify-between">
                            <div className="w-24 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                            <div className="w-16 h-6 bg-muted-foreground/30 rounded animate-pulse" />
                        </div>
                    ))
                ) : (
                    stats.map((stat, idx) => (
                        <Card key={idx} className="bg-card border border-border/40 shadow-sm rounded-xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <Card className="shadow-sm overflow-hidden border-border/40">
                        <CardHeader className="bg-muted/20 border-b border-border/40 p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex bg-muted p-1 rounded-lg border border-border w-fit">
                                    {['pending', 'approved', 'rejected', 'all'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setFilterStatus(tab as any)}
                                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                                filterStatus === tab
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tab === 'pending' ? 'Chờ duyệt' : tab === 'approved' ? 'Đã duyệt' : tab === 'rejected' ? 'Từ chối' : 'Tất cả'}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Tìm kiếm..."
                                        className="pl-10 h-10 rounded-lg"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Mã & Dịch vụ</th>
                                        <th className="px-6 py-4">Đối tác</th>
                                        <th className="px-6 py-4">Thời gian</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-6 py-4"><div className="h-8 bg-muted rounded w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                                Không có yêu cầu nào
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map(req => (
                                            <tr 
                                                key={req.id} 
                                                className={`hover:bg-muted/50 transition-colors cursor-pointer ${selectedReq?.id === req.id ? 'bg-muted' : ''}`}
                                                onClick={() => setSelectedReq(req)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5">#{req.id}</div>
                                                        <h4 className="font-semibold text-foreground">{req.serviceName}</h4>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {req.providerName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {new Date(req.submittedAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${STATUS_BADGE_CONFIG[req.status]?.className || 'bg-muted text-muted-foreground'}`}>
                                                        {STATUS_BADGE_CONFIG[req.status]?.label || req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 text-primary font-medium hover:bg-primary/10">
                                                        Xem xét <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Detail Panel */}
                {selectedReq && (
                    <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0">
                        <Card className="sticky top-24 border border-border/40 shadow-sm rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                            <CardHeader className="p-6 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Chi tiết dịch vụ</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">Gửi lúc {new Date(selectedReq.submittedAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedReq(null)} className="h-8 w-8">
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Thumbnail Preview */}
                                {selectedReq.thumbnailUrl && (
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                                        <img 
                                            src={selectedReq.thumbnailUrl} 
                                            alt={selectedReq.serviceName} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-foreground">{selectedReq.serviceName}</h3>
                                        <Badge className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${STATUS_BADGE_CONFIG[selectedReq.status]?.className}`}>
                                            {STATUS_BADGE_CONFIG[selectedReq.status]?.label}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Loại dịch vụ</p>
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-sm font-semibold">{selectedReq.serviceType}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Giá trung bình</p>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-emerald-600">
                                                    {selectedReq.averagePrice.toLocaleString('vi-VN')} VNĐ
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" /> Mô tả
                                            </p>
                                            <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/40">
                                                {selectedReq.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40">
                                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Địa chỉ</p>
                                                    <p className="text-sm font-medium">{selectedReq.address}</p>
                                                    <p className="text-xs text-muted-foreground">{selectedReq.provinceName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40">
                                                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Liên hệ</p>
                                                    <p className="text-sm font-medium">{selectedReq.contactNumber}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40">
                                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                                    <Globe className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Đối tác</p>
                                                    <p className="text-sm font-medium">{selectedReq.providerName}</p>
                                                    <p className="text-[10px] text-muted-foreground">ID: {selectedReq.providerId}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedReq.status === 'pending' && (
                                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-800 text-sm flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <p className="leading-relaxed font-medium">Vui lòng kiểm tra kỹ các thông tin pháp lý và hình ảnh trước khi xác nhận phê duyệt dịch vụ mới.</p>
                                    </div>
                                )}
                            </div>

                            {selectedReq.status === 'pending' && (
                                <CardContent className="p-6 border-t border-border/40 bg-muted/20 flex gap-3">
                                    <Button
                                        onClick={() => selectedReq && handleApprove(selectedReq.id)}
                                        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer transition-all hover:scale-[1.02]"
                                        disabled={isProcessing === selectedReq?.id}
                                    >
                                        {isProcessing === selectedReq?.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                                        Duyệt ngay
                                    </Button>
                                    <Button
                                        onClick={() => setShowRejectModal(true)}
                                        variant="outline"
                                        className="flex-1 h-12 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl cursor-pointer transition-all"
                                        disabled={isProcessing === selectedReq?.id}
                                    >
                                        <XSquare className="w-4 h-4 mr-2" />
                                        Từ chối
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 border-b border-gray-50 text-center space-y-2">
                             <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Lý do từ chối</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Thông báo này sẽ được gửi đến đối tác để họ thực hiện điều chỉnh.</p>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <textarea
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Ví dụ: Hình ảnh quá mờ, thiếu tài liệu chứng minh, nội dung không phù hợp..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                            />
                            <div className="flex gap-4 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl font-bold cursor-pointer"
                                    onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-rose-500/20 cursor-pointer"
                                    onClick={confirmReject}
                                    disabled={!rejectReason.trim() || isProcessing !== null}
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi từ chối'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminServiceApprovalsPage;
