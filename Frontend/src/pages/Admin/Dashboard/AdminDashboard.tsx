// src/pages/Admin/Dashboard/AdminDashboard.tsx
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent, CardHeader } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import {
    Building2,
    MapPin,
    Users,
    Banknote,
    Calendar,
    Eye,
    CheckCircle,
    XCircle,
    Inbox,
    ArrowRight,
    Loader2,
    Search,
    FileText
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/admin/dialog';
import { Input } from '@/components/ui/admin/input';
import apiClient from '@/services/apiClient';

import MonthlyRevenueChart from '@/components/ui/admin/charts/MonthlyRevenueChart';
import BookingTrendsChart from '@/components/ui/admin/charts/BookingTrendsChart';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const FALLBACK_CITY_DATA = [
    { cityName: 'Đà Nẵng', totalVisits: 1872 },
    { cityName: 'Nha Trang', totalVisits: 1563 },
    { cityName: 'Phú Quốc', totalVisits: 1341 },
    { cityName: 'Hạ Long', totalVisits: 1124 },
    { cityName: 'Hội An', totalVisits: 815 },
];

const FALLBACK_REVENUE_DATA = [
    { month: 'Jan', revenue: 115000000, previousYear: 98000000 },
    { month: 'Feb', revenue: 132000000, previousYear: 112000000 },
    { month: 'Mar', revenue: 148000000, previousYear: 125000000 },
    { month: 'Apr', revenue: 138000000, previousYear: 118000000 },
    { month: 'May', revenue: 156000000, previousYear: 135000000 },
    { month: 'Jun', revenue: 171000000, previousYear: 148000000 },
];

// --- Stats Card Component (memoised — only re-renders when stat identity changes) ---
const StatsCard = memo(function StatsCard({ stat }: { stat: {
    title: string; value: string; icon: React.ElementType;
    color: string; iconBg: string; change?: string; trend?: string;
} }) {
    const Icon = stat.icon;
    return (
        <Card className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                    {stat.change && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">vs tháng trước</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
});

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { success } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<{ id: string | number; name: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const [systemStats, setSystemStats] = useState({ totalServices: 0, totalUsers: 0, monthlyRevenue: 0, monthlyOrders: 0 });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [cityTrafficData, setCityTrafficData] = useState<any[]>([]);
    const fetchedRef = useRef(false);

    useEffect(() => {
        // Prevent double-invoke from React StrictMode
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
                const endDate = new Date().toISOString();

                // Phase 1: fast calls that don't fetch large datasets
                const [servicesRes, revenueRes, ordersRes, topCitiesRes] = await Promise.allSettled([
                    apiClient.services.list(0, 5),
                    apiClient.statistics.getSystemRevenue(startDate, endDate),
                    apiClient.orders.getAll(0, 1),
                    apiClient.statistics.getTopCities(startDate, endDate),
                ]);

                // ── Stats ────────────────────────────────────────────────────
                const servicesPayload = servicesRes.status === 'fulfilled' ? (servicesRes.value as any) : null;
                const totalServices   = servicesPayload?.totalElements ?? (Array.isArray(servicesPayload) ? servicesPayload.length : 0);
                const revenuePayload  = revenueRes.status === 'fulfilled' ? (revenueRes.value as any) : null;
                const monthlyRevenue  = revenuePayload?.totalRevenue ?? 0;
                const ordersPayload   = ordersRes.status === 'fulfilled' ? (ordersRes.value as any) : null;
                const monthlyOrders   = ordersPayload?.totalElements ?? 0;

                setSystemStats(prev => ({ ...prev, totalServices, monthlyRevenue, monthlyOrders }));

                // ── Revenue chart ────────────────────────────────────────────
                const details = revenuePayload?.details;
                setRevenueData(
                    Array.isArray(details) && details.length > 0
                        ? details.map((item: any) => ({
                            month: item.date || item.month || 'Jan',
                            revenue: item.amount || item.revenue || 0,
                            previousYear: (item.amount || item.revenue || 0) * 0.8,
                        }))
                        : FALLBACK_REVENUE_DATA
                );

                // ── Top-cities chart ─────────────────────────────────────────
                const citiesPayload = topCitiesRes.status === 'fulfilled' ? (topCitiesRes.value as any) : null;
                const citiesArray   = Array.isArray(citiesPayload) ? citiesPayload
                    : Array.isArray(citiesPayload?.content) ? citiesPayload.content
                    : null;
                setCityTrafficData(citiesArray && citiesArray.length > 0 ? citiesArray : FALLBACK_CITY_DATA);

                // ── Pending services table (reuse the services call above) ───
                const rows: any[] = Array.isArray(servicesPayload)
                    ? servicesPayload
                    : (servicesPayload?.content ?? []);
                if (rows.length > 0) {
                    setServices(rows.map((s: any) => ({
                        id: s.id,
                        name: s.serviceName || 'Dịch vụ mới',
                        type: s.serviceType?.toLowerCase() || 'hotel',
                        provider: s.provider?.fullname || s.provider?.username || 'N/A',
                        location: s.province?.name || s.location || 'N/A',
                        status: s.status?.toLowerCase() || 'pending',
                        createdAt: s.createdAt || new Date().toISOString(),
                    })));
                }
            } catch (err) {
                console.error('Failed to fetch admin dashboard data:', err);
            } finally {
                setIsLoading(false);
            }

            // Phase 2: fetch user count separately — /users/all returns full User[] with no pagination
            // so we fire it after the page is already rendered to avoid blocking the main render.
            try {
                const usersPayload = await apiClient.users.getAll() as any;
                const totalUsers = usersPayload?.totalElements ?? (Array.isArray(usersPayload) ? usersPayload.length : 0);
                setSystemStats(prev => ({ ...prev, totalUsers }));
            } catch {
                // user count is non-critical, silently ignore
            }
        };

        fetchDashboardData();
    }, []);

    // Memoised — only recalculates when systemStats values change
    const stats = useMemo(() => [
        { title: 'Tổng dịch vụ',    value: systemStats.totalServices.toLocaleString(), icon: Building2, color: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-500/20',   change: '+12.5%', trend: 'up' },
        { title: 'Tổng người dùng', value: systemStats.totalUsers.toLocaleString(),    icon: Users,     color: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-100 dark:bg-indigo-500/20', change: '+8.2%',  trend: 'up' },
        { title: 'Doanh thu tháng', value: formatCurrency(systemStats.monthlyRevenue), icon: Banknote,  color: 'text-green-600 dark:text-green-400',   iconBg: 'bg-green-100 dark:bg-green-500/20',   change: '+24.3%', trend: 'up' },
        { title: 'Tổng đơn hàng',   value: systemStats.monthlyOrders.toLocaleString(), icon: Calendar,  color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-500/20', change: '+15.7%', trend: 'up' },
    ], [systemStats]);

    // Memoised filter — doesn't recalculate on unrelated state changes
    const pendingServices = useMemo(() =>
        services.filter(s =>
            s.status === 'pending' &&
            (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             s.provider.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
    [services, searchTerm]);

    const handleQuickApprove = useCallback(async () => {
        if (!selectedService) return;
        setIsActionLoading(selectedService.id.toString());
        try {
            await apiClient.users.handleServiceStatus(selectedService.id, 'APPROVED');
            setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: 'approved' } : s));
            success(`Đã duyệt thành công dịch vụ "${selectedService.name}"`);
            setIsApproveOpen(false);
        } catch (err) {
            console.error('Approve failed:', err);
        } finally {
            setIsActionLoading(null);
        }
    }, [selectedService, success]);

    const handleQuickReject = useCallback(async () => {
        if (!selectedService) return;
        setIsActionLoading(selectedService.id.toString());
        try {
            await apiClient.users.handleServiceStatus(selectedService.id, 'REJECTED');
            setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: 'rejected' } : s));
            success(`Đã từ chối dịch vụ "${selectedService.name}"`);
            setIsRejectOpen(false);
            setRejectReason('');
        } catch (err) {
            console.error('Reject failed:', err);
        } finally {
            setIsActionLoading(null);
        }
    }, [selectedService, success]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tổng quan hệ thống</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Chào Admin, hôm nay hệ thống đang hoạt động ổn định với{' '}
                        <span className="font-bold text-primary">{systemStats.monthlyOrders} đơn hàng mới</span>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-sm px-4 h-9">
                        <FileText className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                    <Button
                        onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
                        className="bg-primary hover:bg-primary/90 text-sm px-4 h-9 transition-all cursor-pointer shadow-sm"
                    >
                        Phê duyệt dịch vụ mới
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[128px] bg-muted/40 border border-border/40 animate-pulse rounded-2xl p-5 flex flex-col justify-between">
                            <div className="w-24 h-4 bg-muted-foreground/20 rounded" />
                            <div className="w-32 h-8 bg-muted-foreground/30 rounded" />
                            <div className="w-20 h-4 bg-muted-foreground/20 rounded" />
                        </div>
                    ))
                ) : (
                    stats.map((stat, i) => <StatsCard key={i} stat={stat} />)
                )}
            </div>

            {/* Charts — chart components already include their own Card+CardHeader */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isLoading ? (
                    <>
                        <div className="h-[420px] rounded-3xl bg-muted/40 border border-border/40 animate-pulse" />
                        <div className="h-[420px] rounded-3xl bg-muted/40 border border-border/40 animate-pulse" />
                    </>
                ) : (
                    <>
                        <MonthlyRevenueChart data={revenueData} />
                        <BookingTrendsChart data={cityTrafficData} />
                    </>
                )}
            </div>

            {/* Pending Services */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card">
                <CardHeader className="p-8 border-b border-border/40 bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Dịch vụ chờ phê duyệt</h2>
                            <p className="text-muted-foreground text-sm">Các yêu cầu đăng ký mới cần được xử lý để hiển thị trên hệ thống.</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Tìm dịch vụ, đối tác..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 w-full md:w-80 rounded-xl bg-background border-border shadow-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-8 py-5">Dịch vụ & Nhà cung cấp</th>
                                    <th className="px-8 py-5">Loại hình</th>
                                    <th className="px-8 py-5">Vị trí</th>
                                    <th className="px-8 py-5">Ngày đăng ký</th>
                                    <th className="px-8 py-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6">
                                                <div className="h-12 bg-muted rounded-xl" />
                                            </td>
                                        </tr>
                                    ))
                                ) : pendingServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <Inbox className="w-16 h-16" />
                                                <p className="text-lg font-medium italic">Không có yêu cầu nào đang chờ xử lý</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingServices.map(service => (
                                        <tr key={service.id} className="hover:bg-muted/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${service.type === 'hotel' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                                        {service.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{service.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{service.provider}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${service.type === 'hotel' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                                                    {service.type === 'hotel' ? 'Khách sạn' : 'Hoạt động'}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{service.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                                {new Date(service.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600 rounded-xl cursor-pointer" onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}>
                                                        <Eye className="w-5 h-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-green-600 rounded-xl cursor-pointer" onClick={() => { setSelectedService({ id: service.id, name: service.name }); setIsApproveOpen(true); }}>
                                                        <CheckCircle className="w-5 h-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600 rounded-xl cursor-pointer" onClick={() => { setSelectedService({ id: service.id, name: service.name }); setIsRejectOpen(true); setRejectReason(''); }}>
                                                        <XCircle className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {pendingServices.length > 0 && (
                        <div className="p-6 text-center border-t border-border/40">
                            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/10 rounded-xl" onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}>
                                Xem tất cả yêu cầu phê duyệt
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
                    <DialogHeader className="space-y-3">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">Phê duyệt dịch vụ</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Bạn có chắc chắn muốn duyệt dịch vụ <strong className="text-gray-900">{selectedService?.name}</strong>?
                            Sau khi duyệt, dịch vụ sẽ hiển thị ngay lập tức với khách hàng.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold cursor-pointer" onClick={() => setIsApproveOpen(false)}>Hủy bỏ</Button>
                        <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 cursor-pointer" onClick={handleQuickApprove} disabled={isActionLoading === selectedService?.id.toString()}>
                            {isActionLoading === selectedService?.id.toString() ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận duyệt'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
                    <DialogHeader className="space-y-3">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">Từ chối dịch vụ</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Vui lòng cung cấp lý do từ chối dịch vụ <strong className="text-gray-900">{selectedService?.name}</strong> để thông báo cho đối tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-3">
                        <label className="text-sm font-bold text-gray-700 ml-1">Lý do từ chối *</label>
                        <Input
                            placeholder="Ví dụ: Hình ảnh không rõ nét, thiếu thông tin pháp lý..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="h-12 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold cursor-pointer" onClick={() => setIsRejectOpen(false)}>Quay lại</Button>
                        <Button variant="destructive" className="flex-1 h-12 font-bold rounded-xl shadow-lg shadow-red-500/20 cursor-pointer" onClick={handleQuickReject} disabled={!rejectReason.trim() || isActionLoading === selectedService?.id.toString()}>
                            {isActionLoading === selectedService?.id.toString() ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi từ chối'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
