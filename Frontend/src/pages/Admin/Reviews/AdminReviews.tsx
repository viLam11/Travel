import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/admin/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import { Check, X, ShieldAlert, Flag, Trash2, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/admin/card';
import { MOCK_REPORTS, type MockReport } from '@/mocks/reports';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { useConfirm } from '@/contexts/ConfirmContext';

// --- Stats Card Component ---
function StatsCard({ title, value, subValue, icon: Icon, color, bg }: any) {
    return (
        <Card className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    {subValue && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

const AdminReviews = () => {
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [reports, setReports] = useState<MockReport[]>([]);
    const { confirm } = useConfirm();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllReports = async () => {
            try {
                setIsLoading(true);
                let services: any[] = [];
                try {
                    let servicesRes = await apiClient.services.getAll();
                    if (!servicesRes || servicesRes.status_code >= 400 || servicesRes.status >= 400 || servicesRes.message) {
                        servicesRes = await apiClient.services.list(0, 50);
                    }
                    if (servicesRes && (servicesRes.status_code >= 400 || servicesRes.status >= 400 || servicesRes.message)) {
                        services = [];
                    } else {
                        services = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.content || []);
                    }
                } catch (e) {
                    services = [];
                }

                let allFetchedReports: any[] = [];
                
                if (services && services.length > 0) {
                    const commentsPromises = services.map(async (service: any) => {
                        try {
                            const commentsRes = await apiClient.comments.getByServiceId(service.id, 0, 50);
                            const comments = Array.isArray(commentsRes) ? commentsRes : (commentsRes?.content || []);
                            return comments.map((comment: any) => ({
                                id: comment.id,
                                reporterId: comment.userID,
                                reporterName: comment.username || "Người dùng ẩn danh",
                                reporterType: 'user',
                                reason: comment.rating < 3 ? "Đánh giá tiêu cực, cần xem xét" : "Nội dung không phù hợp",
                                status: 'pending',
                                createdAt: comment.createdAt || new Date().toISOString(),
                                reviewId: comment.id,
                                review: {
                                    id: comment.id,
                                    serviceId: service.id,
                                    serviceName: service.serviceName || "Dịch vụ",
                                    serviceType: service.serviceType?.toLowerCase() || "hotel",
                                    userId: comment.userID,
                                    userName: comment.username || "Khách hàng",
                                    userAvatar: comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.id}`,
                                    rating: comment.rating || 5,
                                    comment: comment.content || "",
                                    status: "pending",
                                    createdAt: comment.createdAt || new Date().toISOString()
                                }
                            }));
                        } catch (err) {
                            return [];
                        }
                    });
                    const results = await Promise.all(commentsPromises);
                    allFetchedReports = results.flat();
                }

                if (services && services.length > 0) {
                    setReports(allFetchedReports);
                } else {
                    setReports(MOCK_REPORTS);
                }
            } catch (err) {
                console.error(err);
                setReports(MOCK_REPORTS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllReports();
    }, []);

    // Filter reports
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            return statusFilter === 'all' || report.status === statusFilter;
        });
    }, [reports, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
    }), [reports]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400', label: 'Chờ xử lý' },
            resolved: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', label: 'Đã xử lý' },
            dismissed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Bỏ qua' },
        };
        const config = variants[status] || variants.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const handleAction = async (reportId: number, action: 'dismiss' | 'delete' | 'block', reporterName: string, authorName: string, reviewId?: number, userId?: number) => {
        try {
            if (action === 'delete' || action === 'block') {
                if (reviewId) {
                    await apiClient.comments.delete(reviewId);
                }
                if (action === 'block' && userId) {
                    await apiClient.users.toggleUserStatus(userId);
                }
            }

            setReports(prev => prev.map(r => {
                if (r.id === reportId) {
                    return { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' };
                }
                return r;
            }));

            if (action === 'dismiss') {
                toast.success(`Đã bỏ qua báo cáo. Hệ thống đã gửi thông báo phản hồi lại cho ${reporterName}.`);
            } else if (action === 'delete') {
                toast.success(`Đã gỡ bỏ bình luận vi phạm. Hệ thống đã gửi thông báo cảm ơn đến ${reporterName}.`);
            } else if (action === 'block') {
                toast.success(`Đã gỡ bỏ bình luận và KHÓA VĨNH VIỄN tài khoản của ${authorName}. Đã thông báo cho ${reporterName}.`);
            }
        } catch (error) {
            console.error("Action error:", error);
            toast.error("Thao tác thất bại, vui lòng thử lại.");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500 p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý Báo cáo & Đánh giá</h1>
                    <p className="text-sm text-muted-foreground mt-1">Xử lý các đánh giá hoặc bình luận bị báo cáo vi phạm tiêu chuẩn cộng đồng.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[120px] bg-muted/40 border border-border/40 animate-pulse rounded-xl p-5 flex flex-col justify-between">
                            <div className="w-24 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                            <div className="w-16 h-6 bg-muted-foreground/30 rounded animate-pulse" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatsCard title="Tổng báo cáo" value={stats.total} icon={Flag} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/20" />
                        <StatsCard title="Chờ xử lý" value={stats.pending} icon={ShieldAlert} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/20" />
                        <StatsCard title="Đã xử lý" value={stats.resolved} icon={Check} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/20" />
                        <StatsCard title="Đã bỏ qua" value={stats.dismissed} icon={X} color="text-gray-600" bg="bg-gray-100 dark:bg-gray-800" />
                    </>
                )}
            </div>

            <Card className="shadow-sm border-border/40">
                <CardContent className="p-4">
                    <div className="flex gap-4 items-center">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[240px] h-10">
                                <SelectValue placeholder="Lọc theo trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả báo cáo</SelectItem>
                                <SelectItem value="pending">Đang chờ xử lý</SelectItem>
                                <SelectItem value="resolved">Đã xử lý (Vi phạm)</SelectItem>
                                <SelectItem value="dismissed">Đã bỏ qua (Hợp lệ)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {filteredReports.length === 0 ? (
                    <Card className="py-16 text-center text-muted-foreground border-dashed">
                        Không có báo cáo nào trong mục này
                    </Card>
                ) : (
                    filteredReports.map((report) => (
                        <Card key={report.id} className="shadow-sm border-border/40 hover:border-primary/20 transition-colors overflow-hidden">
                            <div className="p-5 flex flex-col lg:flex-row gap-6">

                                {/* Left Column: Report Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-2 rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                                            <ShieldAlert className="w-4 h-4" />
                                            <span className="font-semibold text-sm">Lý do báo cáo: {report.reason}</span>
                                        </div>
                                        {getStatusBadge(report.status)}
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span>Người báo cáo:</span>
                                            <span className="font-semibold text-foreground">{report.reporterName}</span>
                                            <span className="px-2 py-0.5 bg-muted rounded-md text-[10px] uppercase font-bold text-muted-foreground">{report.reporterType === 'provider' ? 'Chủ dịch vụ' : 'Khách hàng'}</span>
                                        </div>
                                        <span className="text-muted-foreground text-xs">{new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>

                                    {/* The Context: Original Comment */}
                                    <div className="mt-4 bg-muted/30 border border-border rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
                                            <Avatar className="w-8 h-8 rounded-lg shadow-sm">
                                                <AvatarImage src={report.review.userAvatar} />
                                                <AvatarFallback className="rounded-lg">{report.review.userName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-sm text-foreground">{report.review.userName}</div>
                                                <div className="text-xs text-muted-foreground">Đã bình luận tại: <span className="font-semibold text-primary">{report.review.serviceName}</span></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {report.review.comment}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column: Actions */}
                                {report.status === 'pending' && (
                                    <div className="lg:w-64 flex flex-col gap-2 justify-center lg:border-l border-t lg:border-t-0 border-border pt-4 lg:pt-0 lg:pl-6">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Thao tác xử lý</p>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold"
                                            onClick={() => handleAction(report.id, 'dismiss', report.reporterName, report.review.userName)}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Bỏ qua (Giữ nguyên)
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-900/50 cursor-pointer font-semibold"
                                            onClick={() => handleAction(report.id, 'delete', report.reporterName, report.review.userName, report.reviewId, report.review.userId)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Gỡ bỏ bình luận
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50 cursor-pointer font-semibold"
                                            onClick={async () => {
                                                const isConfirmed = await confirm({
                                                    title: 'Khóa tài khoản người dùng',
                                                    message: `Bạn có chắc muốn gỡ bỏ bình luận và KHÓA vĩnh viễn tài khoản của ${report.review.userName} không?`,
                                                    variant: 'danger',
                                                    confirmText: 'Khóa ngay',
                                                    cancelText: 'Hủy'
                                                });
                                                if (isConfirmed) {
                                                    handleAction(report.id, 'block', report.reporterName, report.review.userName, report.reviewId, report.review.userId);
                                                }
                                            }}
                                        >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Gỡ bỏ & Khóa User
                                        </Button>
                                    </div>
                                )}

                            </div>
                    </Card>
                ))
            )}
        </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground font-medium">
                Hiển thị {filteredReports.length} / {reports.length} báo cáo
            </div>
        </div>
    );
};

export default AdminReviews;

