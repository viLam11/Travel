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
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card rounded-xl overflow-hidden">
            <CardContent className="p-6 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className={`${fontSizeClass} font-bold text-foreground mt-2 break-words leading-tight`}>{stat.value}</div>
                    {stat.change && (
                        <div className="mt-4 flex items-center">
                            <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${trendBg} ${trendColor}`}>
                                {stat.trend === 'up' ? '+' : ''}{stat.change} so với tháng trước
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-3 ${stat.iconBg} rounded-2xl`}>
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
    const [services, setServices] = useState(initialMockServices);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<{ id: number; name: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // System-wide stats
    const stats = [
        {
            title: 'Tổng dịch vụ',
            value: '156',
            icon: Building2,
            color: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-500/20',
            change: '12',
            trend: 'up',
        },
        {
            title: 'Nhà cung cấp',
            value: '48',
            icon: Users,
            color: 'text-green-600 dark:text-green-400',
            iconBg: 'bg-green-100 dark:bg-green-500/20',
            change: '5',
            trend: 'up',
        },
        {
            title: 'Doanh thu tháng này',
            value: formatCurrency(2450000000),
            icon: Banknote,
            color: 'text-yellow-600 dark:text-yellow-400',
            iconBg: 'bg-yellow-100 dark:bg-yellow-500/20',
            change: '18%',
            trend: 'up',
        },
        {
            title: 'Đơn đặt tháng này',
            value: '1,247',
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-500/20',
            change: '156',
            trend: 'up',
        },
    ];

    const pendingServices = services.filter(service =>
        service.status === 'pending' &&
        (service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.provider.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleQuickApprove = () => {
        if (!selectedService) return;
        setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: 'active' } : s));
        success(`Đã duyệt thành công dịch vụ "${selectedService.name}"`);
        setIsApproveOpen(false);
    };

    const handleQuickReject = () => {
        if (!selectedService) return;
        setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: 'rejected' } : s));
        success(`Đã từ chối dịch vụ "${selectedService.name}"`);
        setIsRejectOpen(false);
        setRejectReason('');
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
            <Card className="border-0 shadow-sm">
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

                    {/* Services Table */}
                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-muted">
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 font-semibold text-sm">Tên dịch vụ</th>
                                        <th className="text-left p-4 font-semibold text-sm">Loại hình</th>
                                        <th className="text-left p-4 font-semibold text-sm">Nhà cung cấp</th>
                                        <th className="text-left p-4 font-semibold text-sm">Địa điểm</th>
                                        <th className="text-left p-4 font-semibold text-sm">Thời gian gửi</th>
                                        <th className="text-right p-4 font-semibold text-sm">Thao tác nhanh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingServices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                                Không có yêu cầu duyệt dịch vụ mới nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingServices.map((service) => (
                                            <tr
                                                key={service.id}
                                                className="border-b border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="p-4 text-sm font-medium">{service.name}</td>
                                                <td className="p-4 text-sm">
                                                    <Badge
                                                        className={
                                                            service.type === 'hotel'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-green-100 text-green-700'
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
                                                    Hôm nay, 09:30
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex gap-1 justify-end">
                                                        <button
                                                            onClick={() => navigate(ROUTES.ADMIN_APPROVALS)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title="Xem chi tiết để duyệt"
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duyệt dịch vụ</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn duyệt nhanh dịch vụ <strong className="text-gray-900">{selectedService?.name}</strong>?
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
                            Vui lòng nhập lý do từ chối dịch vụ <strong className="text-gray-900">{selectedService?.name}</strong>.
                            Lý do này sẽ được gửi đến đối tác để họ khắc phục.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Lý do từ chối <span className="text-red-500">*</span></label>
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
