// src/pages/Admin/Bookings/AdminBookings.tsx
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/admin/card';
import { Badge } from '@/components/ui/admin/badge';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import { 
    Calendar, 
    DollarSign, 
    Package, 
    CheckCircle, 
    Search, 
    Clock, 
    XCircle,
    FileText,
    Eye
} from 'lucide-react';
import apiClient from '@/services/apiClient';

// --- Stats Card Component ---
function StatsCard({ title, value, icon: Icon, color, bg, trend }: any) {
    return (
        <Card className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs font-bold text-green-600">
                                {trend}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">vs tháng trước</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

const AdminBookings = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.orders.getAll(0, 100);
                const data = res.content || [];
                
                const mapped = data.map((order: any) => {
                    const firstTicket = order.orderedTickets?.[0];
                    const firstRoom = order.orderedRooms?.[0];
                    const serviceName = firstTicket?.ticket?.name || firstRoom?.room?.hotel?.serviceName || 'Dịch vụ';
                    const serviceType = firstRoom ? 'hotel' : 'tour';
                    const date = firstTicket?.validStart || firstRoom?.startDate || order.createdAt;

                    return {
                        id: order.orderID,
                        userName: order.user?.fullname || order.user?.username || 'Khách',
                        userEmail: order.user?.email,
                        serviceName,
                        serviceType,
                        date,
                        totalPrice: order.finalPrice || order.totalPrice || 0,
                        status: order.status?.toLowerCase() || 'pending',
                        paymentStatus: order.status === 'SUCCESS' ? 'paid' : 'pending'
                    };
                });

                setBookings(mapped);
                setStats({
                    total: mapped.length,
                    pending: mapped.filter((b: any) => b.status === 'pending').length,
                    confirmed: mapped.filter((b: any) => b.status === 'accepted' || b.status === 'success').length,
                    revenue: mapped.reduce((acc: number, curr: any) => acc + curr.totalPrice, 0)
                });
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesType = typeFilter === 'all' || booking.serviceType === typeFilter;
            const matchesSearch = searchTerm === '' || 
                booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.id.toString().includes(searchTerm);
            return matchesStatus && matchesType && matchesSearch;
        });
    }, [bookings, statusFilter, typeFilter, searchTerm]);



    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string; className: string; icon: any }> = {
            pending: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-700', icon: Clock },
            accepted: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
            success: { label: 'Hoàn thành', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            failed: { label: 'Thất bại', className: 'bg-rose-100 text-rose-700', icon: XCircle },
            cancelled: { label: 'Đã hủy', className: 'bg-rose-100 text-rose-700', icon: XCircle },
        };
        const config = configs[status] || configs.pending;
        const Icon = config.icon;
        return (
            <Badge className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-none flex items-center gap-1 w-fit ${config.className}`}>
                <Icon className="w-3 h-3" /> {config.label}
            </Badge>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý đặt chỗ</h1>
                    <p className="text-sm text-muted-foreground mt-1">Theo dõi, kiểm tra và quản lý toàn bộ giao dịch đặt chỗ trên hệ thống.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-sm h-9">
                        <FileText className="w-4 h-4 mr-2" />
                        Báo cáo doanh thu
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Tổng đặt chỗ" 
                    value={stats.total} 
                    icon={Package} 
                    color="text-blue-600" 
                    bg="bg-blue-100" 
                    trend="+8.5%"
                />
                <StatsCard 
                    title="Doanh thu" 
                    value={formatCurrency(stats.revenue)} 
                    icon={DollarSign} 
                    color="text-green-600" 
                    bg="bg-green-100" 
                    trend="+24%"
                />
                <StatsCard 
                    title="Đang chờ" 
                    value={stats.pending} 
                    icon={Clock} 
                    color="text-yellow-600" 
                    bg="bg-yellow-100" 
                    trend="-12%"
                />
                <StatsCard 
                    title="Thành công" 
                    value={stats.confirmed} 
                    icon={CheckCircle} 
                    color="text-indigo-600" 
                    bg="bg-indigo-100" 
                    trend="+15%"
                />
            </div>

            <Card className="shadow-sm overflow-hidden border-border/40">
                <CardHeader className="bg-muted/20 border-b border-border/40 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex bg-muted p-1 rounded-lg border border-border w-fit">
                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        statusFilter === tab
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab === 'all' ? 'Tất cả' : tab === 'pending' ? 'Chờ duyệt' : tab === 'confirmed' ? 'Đã duyệt' : tab === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Tìm mã đơn, khách hàng..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 w-full md:w-64 rounded-xl bg-white border-gray-200"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="h-11 w-full md:w-[160px] rounded-xl bg-white border-gray-200 cursor-pointer">
                                    <SelectValue placeholder="Loại hình" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all" className="cursor-pointer">Tất cả</SelectItem>
                                    <SelectItem value="hotel" className="cursor-pointer">Khách sạn</SelectItem>
                                    <SelectItem value="tour" className="cursor-pointer">Tour du lịch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/30 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Mã đơn</th>
                                    <th className="px-8 py-5">Khách hàng</th>
                                    <th className="px-8 py-5">Dịch vụ</th>
                                    <th className="px-8 py-5">Thời gian</th>
                                    <th className="px-8 py-5">Thanh toán</th>
                                    <th className="px-8 py-5">Trạng thái</th>
                                    <th className="px-8 py-5 text-right">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-8 py-6"><div className="h-10 bg-gray-50 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Package className="w-16 h-16" />
                                                <p className="text-xl font-bold italic">Không tìm thấy đơn đặt chỗ nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-gray-400">#{booking.id}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {booking.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{booking.userName}</div>
                                                        <div className="text-[10px] text-muted-foreground">{booking.userEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">{booking.serviceName}</span>
                                                    <Badge variant="outline" className="p-0 text-[10px] h-auto uppercase tracking-tighter text-blue-500 font-black border-transparent bg-transparent hover:bg-transparent">
                                                        {booking.serviceType === 'hotel' ? 'Khách sạn' : 'Tour du lịch'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{new Date(booking.date).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900">{booking.totalPrice.toLocaleString('vi-VN')} ₫</span>
                                                    <span className={`text-[10px] font-bold uppercase ${booking.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-50 text-blue-600 cursor-pointer">
                                                    <Eye className="w-5 h-5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiển thị {filteredBookings.length} / {bookings.length} đơn hàng</span>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold cursor-pointer" disabled>Trước</Button>
                             <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold cursor-pointer">Tiếp theo</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBookings;
