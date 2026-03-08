// src/pages/ServiceProvider/Bookings/ProviderBookings.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
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
    Calendar, Banknote, Users, Package,
    Eye, CheckCircle, XCircle, Search,
    X, User, CreditCard, Clock,
} from 'lucide-react';
import { MOCK_BOOKINGS, type MockBooking } from '@/mocks/bookings';
import { useAuth } from '@/hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Chờ xử lý', className: 'bg-amber-500 hover:bg-amber-500 text-white border-transparent' },
    confirmed: { label: 'Đã xác nhận', className: 'bg-green-500 hover:bg-green-500 text-white border-transparent' },
    completed: { label: 'Hoàn thành', className: 'bg-blue-500  hover:bg-blue-500  text-white border-transparent' },
    cancelled: { label: 'Đã hủy', className: 'bg-red-500   hover:bg-red-500   text-white border-transparent' },
};

const PAY_CONFIG: Record<string, { label: string; className: string }> = {
    paid: { label: 'Đã thanh toán', className: 'bg-blue-600  hover:bg-blue-600  text-white border-transparent' },
    pending: { label: 'Chờ thanh toán', className: 'bg-slate-600 hover:bg-slate-600 text-white border-transparent' },
    refunded: { label: 'Đã hoàn tiền', className: 'bg-purple-500 hover:bg-purple-500 text-white border-transparent' },
};

// ─── Inline Detail Modal ───────────────────────────────────────────────────────

function DetailModal({ booking, onClose }: { booking: MockBooking; onClose: () => void }) {
    const s = STATUS_CONFIG[booking.status];
    const p = PAY_CONFIG[booking.paymentStatus];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold">Chi tiết đơn #{booking.id}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{booking.serviceName}</p>
                        <Badge className={`${s.className} mt-2 text-xs`}>{s.label}</Badge>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    {/* Payment status row */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <span className="font-medium text-sm text-muted-foreground">Thanh toán</span>
                        <Badge className={`${p.className} text-xs`}>{p.label}</Badge>
                    </div>

                    {/* Customer */}
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                            <User className="w-4 h-4" /> Thông tin khách hàng
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                            <div><p className="text-muted-foreground">Họ tên</p><p className="font-medium mt-0.5">{booking.userName}</p></div>
                            <div><p className="text-muted-foreground">Email</p><p className="font-medium mt-0.5">{booking.userEmail}</p></div>
                            <div><p className="text-muted-foreground">Điện thoại</p><p className="font-medium mt-0.5">{booking.userPhone}</p></div>
                            <div><p className="text-muted-foreground">Số khách</p><p className="font-medium mt-0.5">{booking.guests} người</p></div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                            <Calendar className="w-4 h-4" /> Thông tin đặt chỗ
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                            {booking.serviceType === 'hotel' ? (
                                <>
                                    <div><p className="text-muted-foreground">Ngày nhận phòng</p><p className="font-medium mt-0.5">{formatDate(booking.checkIn)}</p></div>
                                    <div><p className="text-muted-foreground">Ngày trả phòng</p><p className="font-medium mt-0.5">{formatDate(booking.checkOut)}</p></div>
                                </>
                            ) : (
                                <div><p className="text-muted-foreground">Ngày tham quan</p><p className="font-medium mt-0.5">{formatDate(booking.tourDate)}</p></div>
                            )}
                            <div><p className="text-muted-foreground">Ngày đặt</p><p className="font-medium mt-0.5">{formatDate(booking.createdAt)}</p></div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                            <CreditCard className="w-4 h-4" /> Thanh toán
                        </h3>
                        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-3">
                            <div className="flex justify-between border-t border-border pt-3">
                                <span className="font-semibold text-base">Tổng tiền</span>
                                <span className="font-bold text-base text-primary">{formatCurrency(booking.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-border bg-muted/40 rounded-b-xl flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
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
    onReject,
}: {
    booking: MockBooking;
    onClose: () => void;
    onConfirm: () => void;
    onReject: () => void;
}) {
    const s = STATUS_CONFIG[booking.status];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl">
                    <h2 className="text-lg font-bold">Xử lý đơn đặt #{booking.id}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Khách hàng</span><span className="font-medium">{booking.userName}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Dịch vụ</span><span className="font-medium">{booking.serviceName}</span></div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trạng thái hiện tại</span>
                            <Badge className={`${s.className} text-xs`}>{s.label}</Badge>
                        </div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tổng tiền</span><span className="font-semibold text-primary">{formatCurrency(booking.totalPrice)}</span></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Chọn hành động để cập nhật trạng thái đơn đặt này:</p>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/40 rounded-b-xl">
                    <Button variant="outline" onClick={onClose} className="flex-1">Hủy bỏ</Button>
                    <Button onClick={onReject} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <XCircle className="w-4 h-4 mr-2" /> Từ chối
                    </Button>
                    <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" /> Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ProviderBookings = () => {
    const { currentUser } = useAuth();
    const currentServiceId = currentUser?.user?.serviceId || 1;

    // Xác định loại dịch vụ từ booking đầu tiên của provider
    const allServiceBookings = MOCK_BOOKINGS.filter(b => b.serviceId === currentServiceId);
    const serviceType = allServiceBookings[0]?.serviceType || 'hotel';
    const serviceName = allServiceBookings[0]?.serviceName || 'Dịch vụ của tôi';

    const [bookings, setBookings] = useState<MockBooking[]>(allServiceBookings);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [detailBooking, setDetailBooking] = useState<MockBooking | null>(null);
    const [statusBooking, setStatusBooking] = useState<MockBooking | null>(null);

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

    const handleConfirm = () => {
        if (!statusBooking) return;
        setBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'confirmed' } : b));
        setStatusBooking(null);
    };

    const handleReject = () => {
        if (!statusBooking) return;
        setBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'cancelled' } : b));
        setStatusBooking(null);
    };

    const STAT_CARDS = [
        { title: 'Tổng đơn', value: stats.total, badge: 'Tất cả', badgeColor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', icon: Package },
        { title: 'Chờ xử lý', value: stats.pending, badge: 'Cần xử lý', badgeColor: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-500/20', iconColor: 'text-orange-600 dark:text-orange-400', icon: Clock },
        { title: 'Đã xác nhận', value: stats.confirmed, badge: 'Sắp tới', badgeColor: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400', iconBg: 'bg-indigo-100 dark:bg-indigo-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400', icon: Users },
        { title: 'Hoàn thành', value: stats.completed, badge: 'Đã xong', badgeColor: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-500/20', iconColor: 'text-green-600 dark:text-green-400', icon: Calendar },
        { title: 'Doanh thu', value: `${(stats.revenue / 1000000).toFixed(1)}M`, badge: 'Tổng thu nhập', badgeColor: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', iconBg: 'bg-yellow-100 dark:bg-yellow-500/20', iconColor: 'text-yellow-600 dark:text-yellow-400', icon: Banknote },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Đơn đặt của tôi</h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý đơn đặt {serviceType === 'hotel' ? 'phòng khách sạn' : 'vé tham quan'} — {serviceName}
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                {STAT_CARDS.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                            <CardContent className="p-5 flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <div className="text-2xl font-bold mt-1.5 leading-tight">{stat.value}</div>
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mt-3 ${stat.badgeColor}`}>
                                        {stat.badge}
                                    </span>
                                </div>
                                <div className={`p-2.5 ${stat.iconBg} rounded-xl flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Table */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/30 pb-4">
                    <CardTitle className="text-xl font-bold">Danh sách đơn đặt</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm khách, email, mã..."
                                className="pl-9 w-64 h-10 bg-background"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48 h-10 bg-background">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Mã đơn</th>
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Khách hàng</th>
                                    {serviceType === 'hotel' ? (
                                        <>
                                            <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Nhận phòng</th>
                                            <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Trả phòng</th>
                                        </>
                                    ) : (
                                        <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Ngày tham quan</th>
                                    )}
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Số khách</th>
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Tổng tiền</th>
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Thanh toán</th>
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Trạng thái</th>
                                    <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={serviceType === 'hotel' ? 9 : 8} className="text-center py-16 text-muted-foreground">
                                            Không tìm thấy đơn đặt nào
                                        </td>
                                    </tr>
                                ) : filtered.map(booking => {
                                    const s = STATUS_CONFIG[booking.status];
                                    const p = PAY_CONFIG[booking.paymentStatus];
                                    return (
                                        <tr key={booking.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-5 py-4 font-medium">#{booking.id}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium">{booking.userName}</p>
                                                <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                                                <p className="text-xs text-muted-foreground">{booking.userPhone}</p>
                                            </td>
                                            {serviceType === 'hotel' ? (
                                                <>
                                                    <td className="px-5 py-4">{formatDate(booking.checkIn)}</td>
                                                    <td className="px-5 py-4">{formatDate(booking.checkOut)}</td>
                                                </>
                                            ) : (
                                                <td className="px-5 py-4">{formatDate(booking.tourDate)}</td>
                                            )}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-muted-foreground" />
                                                    {booking.guests}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-primary">{formatCurrency(booking.totalPrice)}</td>
                                            <td className="px-5 py-4">
                                                <Badge className={`${p.className} text-xs`}>{p.label}</Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className={`${s.className} text-xs`}>{s.label}</Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-1">
                                                    {/* Xem chi tiết */}
                                                    <button
                                                        onClick={() => setDetailBooking(booking)}
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    {/* Xử lý (chỉ khi pending) */}
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => setStatusBooking(booking)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                            title="Xác nhận / Từ chối"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 text-sm text-muted-foreground border-t border-border">
                        Hiển thị {filtered.length} / {bookings.length} đơn đặt
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            {detailBooking && (
                <DetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
            )}
            {statusBooking && (
                <StatusModal
                    booking={statusBooking}
                    onClose={() => setStatusBooking(null)}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default ProviderBookings;
