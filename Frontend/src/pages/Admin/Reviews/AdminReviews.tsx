import { useState, useMemo } from 'react';
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
import { MOCK_REPORTS, type MockReport } from '@/mocks/reports';
import { toast } from 'sonner';

const AdminReviews = () => {
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [reports, setReports] = useState<MockReport[]>(MOCK_REPORTS);

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

    const handleAction = (reportId: number, action: 'dismiss' | 'delete' | 'block', reporterName: string, authorName: string) => {
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
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Báo cáo & Đánh giá</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Xử lý các đánh giá/bình luận bị báo cáo vi phạm tiêu chuẩn cộng đồng
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-full flex-shrink-0">
                        <Flag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Tổng Báo cáo</span>
                        <div className="text-2xl font-bold leading-tight mt-1">{stats.total}</div>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3.5 rounded-full flex-shrink-0">
                        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Chờ xử lý</span>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 leading-tight mt-1">{stats.pending}</div>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-full flex-shrink-0">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Đã giải quyết</span>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 leading-tight mt-1">{stats.resolved}</div>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-muted p-3.5 rounded-full flex-shrink-0">
                        <X className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Đã bỏ qua</span>
                        <div className="text-2xl font-bold text-muted-foreground leading-tight mt-1">{stats.dismissed}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex gap-4 items-center">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[220px] cursor-pointer">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">Tất cả báo cáo</SelectItem>
                            <SelectItem value="pending" className="cursor-pointer text-amber-600 font-medium">Đang chờ xử lý</SelectItem>
                            <SelectItem value="resolved" className="cursor-pointer text-green-600 font-medium">Đã xử lý (Vi phạm)</SelectItem>
                            <SelectItem value="dismissed" className="cursor-pointer text-muted-foreground font-medium">Đã bỏ qua (Không vi phạm)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card py-12 text-center text-muted-foreground shadow-sm">
                        Không có báo cáo nào trong mục này
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-border bg-card shadow-sm p-6 overflow-hidden flex flex-col md:flex-row gap-6">

                            {/* Left Column: Report Info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-2 rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                                        <ShieldAlert className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Lý do báo cáo: {report.reason}</span>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <span>Được báo cáo bởi:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{report.reporterName}</span>
                                    <span className="text-gray-400 dark:text-gray-500">({report.reporterType === 'provider' ? 'Chủ dịch vụ' : 'Khách hàng'})</span>
                                    <span className="text-gray-400 dark:text-gray-500 mx-2">•</span>
                                    <span>{new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                                </div>

                                {/* The Context: Original Comment */}
                                <div className="mt-4 bg-muted/50 border border-border rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={report.review.userAvatar} />
                                            <AvatarFallback>{report.review.userName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-sm">{report.review.userName}</div>
                                            <div className="text-xs text-muted-foreground">Đã bình luận tại: <span className="font-medium text-primary">{report.review.serviceName}</span></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3 ml-1">
                                        "{report.review.comment}"
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Actions */}
                            {report.status === 'pending' && (
                                <div className="md:w-64 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Xử lý báo cáo</p>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => handleAction(report.id, 'dismiss', report.reporterName, report.review.userName)}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Bỏ qua (Giữ nguyên)
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-900/50 cursor-pointer"
                                        onClick={() => handleAction(report.id, 'delete', report.reporterName, report.review.userName)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Gỡ bỏ bình luận
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50 cursor-pointer"
                                        onClick={() => {
                                            if (window.confirm(`Bạn có chắc muốn gỡ bỏ bình luận và KHÓA vĩnh viễn tài khoản của ${report.review.userName} không?`)) {
                                                handleAction(report.id, 'block', report.reporterName, report.review.userName);
                                            }
                                        }}
                                    >
                                        <Ban className="w-4 h-4 mr-2" />
                                        Gỡ bỏ & Khóa User
                                    </Button>
                                </div>
                            )}

                        </div>
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

