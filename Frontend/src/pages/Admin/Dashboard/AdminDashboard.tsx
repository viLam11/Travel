// src/pages/Admin/Dashboard/AdminDashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import {
    Building2,
    MapPin,
    Users,
    Banknote,
    TrendingUp,
    TrendingDown,
    Calendar,
    Eye,
    CheckCircle,
    XCircle,
    Inbox,
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
import { useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Loader2 } from 'lucide-react';

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Stats Card Component
function StatsCard({ stat }: { stat: any }) {
    const Icon = stat.icon;
    const trendBg = stat.trend === 'up' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10';
    const trendColor = stat.trend === 'up' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';

    // Dynamic font size based on text length
    const valueLength = stat.value.toString().length;
    let fontSizeClass = 'text-3xl'; // default
    if (valueLength > 15) {
        fontSizeClass = 'text-xl';
    } else if (valueLength > 10) {
        fontSizeClass = 'text-2xl';
    }

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-6 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className={`${fontSizeClass} font-bold mt-2 break-words leading-tight`}>{stat.value}</div>
                    {stat.change && (
                        <div className="mt-4 flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${trendBg} ${trendColor}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {stat.trend === 'up' ? '+' : ''}{stat.change}
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-3 ${stat.iconBg} rounded-xl flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
            </CardContent>
        </Card>
    );
}

// Mock data for services
const initialMockServices = [
    {
        id: 1,
        name: 'Khách sạn Majestic Sài Gòn',
        type: 'hotel',
        provider: 'Majestic Hotel Group',
        location: 'TP.HCM',
        status: 'active',
        rating: 4.8,
        bookings: 245,
        revenue: 125000000,
    },
    {
        id: 2,
        name: 'Tour Hạ Long Bay',
        type: 'place',
        provider: 'Hạ Long Tours',
        location: 'Quảng Ninh',
        status: 'active',
        rating: 4.6,
        bookings: 189,
        revenue: 89000000,
    },
    {
        id: 3,
        name: 'Khách sạn Rex Saigon',
        type: 'hotel',
        provider: 'Rex Hotel',
        location: 'TP.HCM',
        status: 'pending',
        rating: 4.4,
        bookings: 89,
        revenue: 45000000,
    },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { success } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState<any[]>([]);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<{ id: string | number; name: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [systemStats, setSystemStats] = useState({
        totalServices: 0,
        totalUsers: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch stats (some might fail if not fully implemented in BE, so we use Promise.allSettled or just try/catch individually)
                const [servicesRes, usersRes, revenueRes, ordersRes] = await Promise.allSettled([
                    apiClient.services.list(0, 1),
                    apiClient.users.getAll(),
                    apiClient.statistics.getSystemRevenue(),
                    apiClient.orders.getAll(0, 1)
                ]);

                const totalServices = servicesRes.status === 'fulfilled' ? (servicesRes.value.totalElements || servicesRes.value.length || 0) : 156;
                const totalUsers = usersRes.status === 'fulfilled' ? (usersRes.value.length || 0) : 48;
                const monthlyRevenue = revenueRes.status === 'fulfilled' ? (revenueRes.value.totalAmount || revenueRes.value.revenue || 0) : 2450000000;
                const monthlyOrders = ordersRes.status === 'fulfilled' ? (ordersRes.value.totalElements || ordersRes.value.length || 0) : 1247;

                setSystemStats({ totalServices, totalUsers, monthlyRevenue, monthlyOrders });

                // Fetch real services for approval
                const realServicesRes = await apiClient.services.list(0, 50);
                const fetchedServices = Array.isArray(realServicesRes) ? realServicesRes : (realServicesRes.content || []);
                
                if (fetchedServices.length > 0) {
                   const mapped = fetchedServices.map((s: any) => ({
                      id: s.id,
                      name: s.serviceName || "Dịch vụ mới",
                      type: s.serviceType?.toLowerCase() || 'hotel',
                      provider: s.provider?.fullname || s.provider?.username || "N/A",
                      location: s.province?.name || "N/A",
                      status: s.status?.toLowerCase() || 'pending',
                      rating: s.rating || 0,
                      bookings: 0,
                      revenue: 0,
                      createdAt: s.createdAt || new Date().toISOString()
                   }));
                   setServices(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch admin dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // System-wide stats
    const stats = [
        {
            title: 'Tổng dịch vụ',
            value: systemStats.totalServices.toString(),
            icon: Building2,
            color: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-500/20',
            change: '12',
            trend: 'up',
        },
        {
            title: 'Tổng người dùng',
            value: systemStats.totalUsers.toString(),
            icon: Users,
            color: 'text-green-600 dark:text-green-400',
            iconBg: 'bg-green-100 dark:bg-green-500/20',
            change: '5',
            trend: 'up',
        },
        {
            title: 'Doanh thu tháng này',
            value: formatCurrency(systemStats.monthlyRevenue),
            icon: Banknote,
            color: 'text-yellow-600 dark:text-yellow-400',
            iconBg: 'bg-yellow-100 dark:bg-yellow-500/20',
            change: '18%',
            trend: 'up',
        },
        {
            title: 'Tổng đơn hàng',
            value: systemStats.monthlyOrders.toLocaleString(),
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-500/20',
            change: '156',
            trend: 'up',
        },
    ];

    const pendingServices = services.filter((service: any) =>
        service.status === 'pending' &&
        (service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.provider.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleQuickApprove = async () => {
        if (!selectedService) return;
        try {
            await apiClient.users.handleServiceStatus(selectedService.id, 'APPROVED');
            setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: 'approved' } : s));
            success(`Đã duyệt thành công dịch vụ "${selectedService.name}"`);
            setIsApproveOpen(false);
        } catch (err) {
            console.error("Approve failed:", err);
        }
    };

    const handleQuickReject = async () => {
        if (!selectedService) return;
        try {
            await apiClient.users.handleServiceStatus(selectedService.id, 'REJECTED');
            setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: 'rejected' } : s));
            success(`Đã từ chối dịch vụ "${selectedService.name}"`);
            setIsRejectOpen(false);
            setRejectReason('');
        } catch (err) {
            console.error("Reject failed:", err);
        }
    };

    return (
        <div className="w-full space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tất cả dịch vụ và nhà cung cấp trong hệ thống
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                    <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
                    >
                        Duyệt dịch vụ mới
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} stat={stat} />
                ))}
            </div>

            {/* Services Management */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
                    <div>
                        <CardTitle className="text-xl font-semibold">Yêu cầu duyệt dịch vụ mới</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Các dịch vụ đang chờ Admin xem xét và cấp phép hoạt động
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
                    >
                        Xem chi tiết
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ hoặc nhà cung cấp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-96"
                        />
                    </div>

                    {/* Services Table/Card View */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground text-sm font-medium">Đang tải dữ liệu hệ thống...</p>
                            </div>
                        ) : pendingServices.length === 0 ? (
                            <div className="text-center p-12 text-muted-foreground bg-muted/10">
                                <Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Không có yêu cầu duyệt dịch vụ mới nào.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View (Cards) */}
                                <div className="block sm:hidden divide-y divide-border">
                                    {pendingServices.map((service) => (
                                        <div key={service.id} className="p-4 space-y-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-base leading-tight">{service.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            className={
                                                                service.type === 'hotel'
                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            }
                                                        >
                                                            {service.type === 'hotel' ? 'Khách sạn' : 'Tham quan'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(service.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
                                                        className="p-2 bg-muted rounded-lg text-muted-foreground"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                                <div>
                                                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Nhà cung cấp</p>
                                                    <p className="font-medium mt-1 truncate">{service.provider}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Địa điểm</p>
                                                    <div className="flex items-center gap-1 mt-1 font-medium truncate">
                                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {service.location}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                                    onClick={() => { setSelectedService({ id: service.id, name: service.name }); setIsApproveOpen(true); }}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                    onClick={() => { setSelectedService({ id: service.id, name: service.name }); setIsRejectOpen(true); setRejectReason(''); }}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Từ chối
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr className="border-b border-border">
                                                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tên dịch vụ</th>
                                                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Loại hình</th>
                                                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Nhà cung cấp</th>
                                                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Địa điểm</th>
                                                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Thời gian gửi</th>
                                                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingServices.map((service) => (
                                                <tr
                                                    key={service.id}
                                                    className="border-b border-border hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="p-4 text-sm font-medium">{service.name}</td>
                                                    <td className="p-4 text-sm">
                                                        <Badge
                                                            className={
                                                                service.type === 'hotel'
                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            }
                                                        >
                                                            {service.type === 'hotel' ? 'Khách sạn' : 'Tham quan'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-sm">{service.provider}</td>
                                                    <td className="p-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            {service.location}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm whitespace-nowrap text-muted-foreground">
                                                        {new Date(service.createdAt).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <div className="flex gap-1 justify-end">
                                                            <button
                                                                onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
                                                                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedService({ id: service.id, name: service.name }); setIsApproveOpen(true); }}
                                                                className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 cursor-pointer"
                                                                title="Duyệt nhanh"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedService({ id: service.id, name: service.name }); setIsRejectOpen(true); setRejectReason(''); }}
                                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 cursor-pointer"
                                                                title="Từ chối nhanh"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duyệt dịch vụ</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn duyệt nhanh dịch vụ <strong className="text-foreground">{selectedService?.name}</strong>?
                            Dịch vụ sẽ hiển thị ngay lập tức trên hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Hủy</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleQuickApprove}>
                            Duyệt ngay
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Quick Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối dịch vụ</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do từ chối dịch vụ <strong className="text-foreground">{selectedService?.name}</strong>.
                            Lý do này sẽ được gửi đến đối tác để họ khắc phục.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <label className="text-sm font-medium text-foreground">Lý do từ chối <span className="text-destructive">*</span></label>
                        <Input
                            placeholder="Nhập lý do chi tiết..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleQuickReject} disabled={!rejectReason.trim()}>
                            Thực hiện từ chối
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
