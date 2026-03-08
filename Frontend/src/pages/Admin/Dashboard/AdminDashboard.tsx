// src/pages/Admin/Dashboard/AdminDashboard.tsx
import { useState } from 'react';
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
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
} from 'lucide-react';

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Stats Card Component
function StatsCard({ stat }: { stat: any }) {
    const Icon = stat.icon;
    const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
    const trendColor = stat.trend === 'up' ? 'text-chart-2' : 'text-destructive';

    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold mb-2">{stat.value}</p>
                        {stat.change && (
                            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                                <TrendIcon className="w-4 h-4" />
                                <span className="font-medium">{stat.change}</span>
                                <span className="text-muted-foreground">so với tháng trước</span>
                            </div>
                        )}
                    </div>
                    <div className={`${stat.iconBg} p-4 rounded-xl`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Mock data for services
const mockServices = [
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
    const [searchTerm, setSearchTerm] = useState('');

    // System-wide stats
    const stats = [
        {
            title: 'Tổng dịch vụ',
            value: '156',
            icon: Building2,
            color: 'text-chart-1',
            iconBg: 'bg-blue-100 dark:bg-blue-950',
            change: '+12',
            trend: 'up',
        },
        {
            title: 'Nhà cung cấp',
            value: '48',
            icon: Users,
            color: 'text-chart-2',
            iconBg: 'bg-green-100 dark:bg-green-950',
            change: '+5',
            trend: 'up',
        },
        {
            title: 'Doanh thu tháng này',
            value: formatCurrency(2450000000),
            icon: Banknote,
            color: 'text-chart-3',
            iconBg: 'bg-yellow-100 dark:bg-yellow-950',
            change: '+18%',
            trend: 'up',
        },
        {
            title: 'Đơn đặt tháng này',
            value: '1,247',
            icon: Calendar,
            color: 'text-chart-4',
            iconBg: 'bg-purple-100 dark:bg-purple-950',
            change: '+156',
            trend: 'up',
        },
    ];

    const filteredServices = mockServices.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Button variant="default" className="bg-primary hover:bg-primary/90">
                        Thêm dịch vụ mới
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, index) => (
                    <StatsCard key={index} stat={stat} />
                ))}
            </div>

            {/* Services Management */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
                    <div>
                        <CardTitle className="text-xl font-semibold">Quản lý dịch vụ</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Danh sách tất cả dịch vụ trong hệ thống
                        </p>
                    </div>
                    <Button variant="outline" size="sm">
                        Xem tất cả
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
                                        <th className="text-left p-4 font-semibold text-sm">Trạng thái</th>
                                        <th className="text-left p-4 font-semibold text-sm">Đánh giá</th>
                                        <th className="text-left p-4 font-semibold text-sm">Doanh thu</th>
                                        <th className="text-left p-4 font-semibold text-sm">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredServices.map((service) => (
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
                                            <td className="p-4 text-sm">
                                                <Badge
                                                    className={
                                                        service.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }
                                                >
                                                    {service.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-sm">⭐ {service.rating}</td>
                                            <td className="p-4 text-sm font-semibold">
                                                {formatCurrency(service.revenue)}
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className="flex gap-1">
                                                    <button
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    {service.status === 'pending' && (
                                                        <>
                                                            <button
                                                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                                title="Duyệt"
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            </button>
                                                            <button
                                                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                                title="Từ chối"
                                                            >
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
