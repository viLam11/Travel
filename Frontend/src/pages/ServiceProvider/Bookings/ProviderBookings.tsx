// src/pages/ServiceProvider/Bookings/ProviderBookings.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Badge } from '@/components/ui/admin/badge';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Separator } from '@/components/ui/admin/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import {
    Calendar, Banknote, Users, Package,
    Eye, CheckCircle, XCircle, Search,
    X, User, CreditCard, Clock,
} from 'lucide-react';
import { type MockBooking } from '@/mocks/bookings';
import apiClient from '@/services/apiClient';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
    confirmed: { label: 'Đã xác nhận', className: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
    completed: { label: 'Hoàn thành', className: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
    cancelled: { label: 'Đã hủy', className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
};

const PAY_CONFIG: Record<string, { label: string; className: string }> = {
    paid: { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
    pending: { label: 'Chờ thanh toán', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
    refunded: { label: 'Đã hoàn tiền', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0' },
};

// ─── Inline Detail Modal ───────────────────────────────────────────────────────

function DetailModal({ booking, onClose }: { booking: MockBooking; onClose: () => void }) {
    const s = STATUS_CONFIG[booking.status];
    const p = PAY_CONFIG[booking.paymentStatus];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-sans">
            <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-8 py-6 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">Chi tiết đơn #{booking.id}</h2>
                        <p className="text-[13px] text-muted-foreground mt-1">{booking.serviceName}</p>
                        <div className="flex gap-2 mt-3">
                            <Badge className={s.className}>{s.label}</Badge>
                            <Badge className={p.className}>{p.label}</Badge>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-8 py-2 space-y-6">
                    {/* Customer */}
                    <div>
                        <h3 className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground mb-3">
                            <User className="w-[14px] h-[14px]" /> Thông tin khách hàng
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div><p className="text-[11px] text-muted-foreground tracking-wide">Họ tên</p><p className="text-[14px] font-medium text-foreground mt-1">{booking.userName}</p></div>
                            <div><p className="text-[11px] text-muted-foreground tracking-wide">Email</p><p className="text-[14px] font-medium text-foreground mt-1">{booking.userEmail}</p></div>
                            <div><p className="text-[11px] text-muted-foreground tracking-wide">Điện thoại</p><p className="text-[14px] font-medium text-foreground mt-1">{booking.userPhone}</p></div>
                            <div><p className="text-[11px] text-muted-foreground tracking-wide">Số khách</p><p className="text-[14px] font-medium text-foreground mt-1">{booking.guests} người</p></div>
                        </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div>
                        <h3 className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground mb-3">
                            <Calendar className="w-[14px] h-[14px]" /> Thông tin đặt chỗ
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {booking.serviceType === 'hotel' ? (
                                <>
                                    <div><p className="text-[11px] text-muted-foreground tracking-wide">Nhận phòng</p><p className="text-[14px] font-medium text-foreground mt-1">{formatDate(booking.checkIn)}</p></div>
                                    <div><p className="text-[11px] text-muted-foreground tracking-wide">Trả phòng</p><p className="text-[14px] font-medium text-foreground mt-1">{formatDate(booking.checkOut)}</p></div>
                                </>
                            ) : (
                                <div><p className="text-[11px] text-muted-foreground tracking-wide">Ngày tham quan</p><p className="text-[14px] font-medium text-foreground mt-1">{formatDate(booking.tourDate)}</p></div>
                            )}
                            <div><p className="text-[11px] text-muted-foreground tracking-wide">Ngày tạo đơn</p><p className="text-[14px] font-medium text-foreground mt-1">{formatDate(booking.createdAt)}</p></div>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment */}
                    <div>
                        <h3 className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground mb-3">
                            <CreditCard className="w-[14px] h-[14px]" /> Chi phí
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <p className="text-[11px] text-muted-foreground tracking-wide">Tổng tiền</p>
                                <p className="text-[16px] font-semibold text-foreground mt-1 tracking-tight">{formatCurrency(booking.totalPrice)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-8 py-6 flex-shrink-0 border-t border-border mt-4">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                    {booking.status !== 'confirmed' ? (
                        <Button variant="default">Xác nhận đơn</Button>
                    ) : (
                        <Button variant="outline" disabled>Đã xác nhận</Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Inline Status Update Modal ────────────────────────────────────────────────

function StatusModal({
    booking,
    onClose,
    onConfirm,
}: {
    booking: MockBooking;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-sans">
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full">
                <div className="px-8 py-6 border-b border-border">
                    <h2 className="text-lg font-semibold tracking-tight">Xác nhận đơn #{booking.id}</h2>
                </div>
                <div className="px-8 py-6 space-y-4">
                    <p className="text-[14px] text-foreground">Bạn có chắc chắn muốn xác nhận đơn đặt từ <span className="font-semibold">{booking.userName}</span> không?</p>
                </div>
                <div className="flex justify-end gap-2 px-8 py-6 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button variant="default" onClick={onConfirm} disabled={booking.status !== 'pending'}>
                        Xác nhận đơn
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ProviderBookings = () => {
    const { currentUser } = useAuth();
    const serviceId = currentUser?.user?.serviceId;
    const providerType = currentUser?.user?.providerType || 'hotel';

    const [bookings, setBookings] = useState<MockBooking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [detailBooking, setDetailBooking] = useState<MockBooking | null>(null);
    const [statusBooking, setStatusBooking] = useState<MockBooking | null>(null);

    // Dynamic service info
    const serviceType = bookings[0]?.serviceType || providerType;
    const serviceName = bookings[0]?.serviceName || 'Dịch vụ của tôi';

    useEffect(() => {
        const fetchBookings = async () => {
            if (!serviceId) return;
            setIsLoading(true);
            try {
                let response: any;
                if (providerType === 'hotel') {
                    response = await apiClient.orders.getHotelOrders(serviceId);
                } else {
                    response = await apiClient.orders.getTicketVenueOrders(serviceId);
                }
                
                const fetchedOrders = response?.content || (Array.isArray(response) ? response : (response?.data || response?.items || []));
                
                if (fetchedOrders.length > 0) {
                    const mappedBookings: MockBooking[] = fetchedOrders.map((o: any) => ({
                        id: o.orderID || o.id,
                        serviceId: serviceId as string,
                        serviceType: providerType as 'hotel' | 'place',
                        serviceName: o.orderedRooms?.[0]?.room?.hotel?.serviceName || o.orderedTickets?.[0]?.ticket?.ticketVenue?.serviceName || 'Dịch vụ của tôi',
                        userName: o.user?.fullname || o.guestPhone || `Khách #${o.orderID || o.id}`,
                        userEmail: o.user?.email || 'N/A',
                        userPhone: o.guestPhone || o.user?.phone || 'N/A',
                        guests: (o.orderedRooms?.length || 0) + (o.orderedTickets?.length || 0) || 1,
                        checkIn: o.orderedRooms?.[0]?.startDate || o.createdAt,
                        checkOut: o.orderedRooms?.[0]?.endDate || o.createdAt,
                        tourDate: o.orderedTickets?.[0]?.tourDate || o.createdAt,
                        totalPrice: o.finalPrice || o.totalPrice || 0,
                        status: o.status === 'SUCCESS' ? 'completed' : 
                                (o.status === 'ACCEPTED' || o.status === 'CONFIRMED') ? 'confirmed' : 
                                (o.status === 'CANCELLED' || o.status === 'CANCELED' || o.status === 'FAILED') ? 'cancelled' : 'pending',
                        paymentStatus: o.isPaid ? 'paid' : 'pending',
                        createdAt: o.createdAt || new Date().toISOString(),
                    }));
                    setBookings(mappedBookings);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách order: ", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [serviceId, providerType]);

    const filtered = useMemo(() => {
        return bookings.filter(b => {
            const matchStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchSearch = search === '' ||
                b.userName.toLowerCase().includes(search.toLowerCase()) ||
                b.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                String(b.id).includes(search);
            return matchStatus && matchSearch;
        });
    }, [bookings, statusFilter, search]);

    const stats = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        revenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalPrice, 0),
    }), [bookings]);

    const handleConfirm = async () => {
        if (!statusBooking) return;
        try {
            await apiClient.orders.updateStatus(statusBooking.id, '"ACCEPTED"');
            setBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'confirmed' } : b));
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setStatusBooking(null);
        }
    };

    const STAT_CARDS = [
        { title: 'Tổng số đơn', value: stats.total, badge: 'Tất cả đơn đặt', icon: Package, accent: 'border-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-950/40', iconColor: 'text-blue-600' },
        { title: 'Chờ xử lý', value: stats.pending, badge: 'Cần xác nhận', icon: Clock, accent: 'border-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-500' },
        { title: 'Đã xác nhận', value: stats.confirmed, badge: 'Đã duyệt', icon: Users, accent: 'border-indigo-500', iconBg: 'bg-indigo-50 dark:bg-indigo-950/40', iconColor: 'text-indigo-500' },
        { title: 'Hoàn thành', value: stats.completed, badge: 'Đơn thành công', icon: Calendar, accent: 'border-green-500', iconBg: 'bg-green-50 dark:bg-green-950/40', iconColor: 'text-green-600' },
        { title: 'Doanh thu', value: `${(stats.revenue / 1000000).toFixed(1)}M`, badge: 'Đã thanh toán', icon: Banknote, accent: 'border-yellow-400', iconBg: 'bg-yellow-50 dark:bg-yellow-950/40', iconColor: 'text-yellow-600' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Danh sách đặt chỗ</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý toàn bộ danh sách đơn đặt {serviceType === 'hotel' ? 'phòng' : 'vé'} cho cơ sở <span className="font-semibold text-foreground">{serviceName}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {STAT_CARDS.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="relative flex items-center justify-between p-5 rounded-xl bg-background shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-border/40 overflow-hidden">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">{stat.title}</p>
                                <div className="text-[28px] font-semibold text-foreground leading-none mb-2 truncate">{stat.value}</div>
                                <p className="text-[12px] text-muted-foreground truncate">{stat.badge}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Area */}
            <div className="bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl overflow-hidden border border-border">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
                    <h2 className="text-lg font-semibold tracking-tight">Tất cả đơn đặt</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm..."
                                className="pl-9 w-64 h-10 border-border rounded-lg"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-44 h-10 border-border rounded-lg">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="pending">Chờ duyệt</SelectItem>
                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm">
                        <thead className="bg-transparent border-b border-border">
                            <tr>
                                <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Mã đơn</th>
                                <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Khách hàng</th>
                                {serviceType === 'hotel' ? (
                                    <>
                                        <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Nhận phòng</th>
                                        <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Trả phòng</th>
                                    </>
                                ) : (
                                    <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Ngày</th>
                                )}
                                <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Số lượng</th>
                                <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Tổng tiền</th>
                                <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Thanh toán</th>
                                <th className="whitespace-nowrap text-left px-6 py-4 font-medium text-muted-foreground text-[14px]">Trạng thái</th>
                                <th className="whitespace-nowrap text-right px-6 py-4 font-medium text-muted-foreground text-[14px]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={serviceType === 'hotel' ? 9 : 8} className="text-center py-20 text-muted-foreground text-[14px]">
                                        Chưa có thông tin phù hợp
                                    </td>
                                </tr>
                            ) : filtered.map(booking => {
                                const s = STATUS_CONFIG[booking.status];
                                const p = PAY_CONFIG[booking.paymentStatus];

                                return (
                                    <tr key={booking.id} className="hover:bg-muted/40 transition-colors group bg-transparent">
                                        <td className="px-6 py-4 text-[14px] font-normal text-muted-foreground">#{booking.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-[200px]" title={`Điện thoại: ${booking.userPhone}`}>
                                                <span className="font-normal text-[14px] text-foreground truncate">{booking.userName}</span>
                                                <span className="text-[13px] font-normal text-muted-foreground truncate leading-relaxed">{booking.userEmail}</span>
                                            </div>
                                        </td>
                                        {serviceType === 'hotel' ? (
                                            <>
                                                <td className="px-6 py-4 text-[14px] font-normal text-foreground whitespace-nowrap">{formatDate(booking.checkIn)}</td>
                                                <td className="px-6 py-4 text-[14px] font-normal text-foreground whitespace-nowrap">{formatDate(booking.checkOut)}</td>
                                            </>
                                        ) : (
                                            <td className="px-6 py-4 text-[14px] font-normal text-foreground whitespace-nowrap">{formatDate(booking.tourDate)}</td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-normal text-[14px]">
                                                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <span>{booking.guests}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-[14px] text-foreground whitespace-nowrap">{formatCurrency(booking.totalPrice)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="secondary" className={p.className}>{p.label}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="secondary" className={s.className}>{s.label}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDetailBooking(booking)}
                                                    className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                
                                                {booking.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setStatusBooking(booking)}
                                                        className="w-8 h-8 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {detailBooking && (
                <DetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
            )}
            {statusBooking && (
                <StatusModal
                    booking={statusBooking}
                    onClose={() => setStatusBooking(null)}
                    onConfirm={handleConfirm}
                />
            )}
        </div>
    );
};

export default ProviderBookings;
