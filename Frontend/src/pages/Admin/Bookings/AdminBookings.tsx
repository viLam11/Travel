// src/pages/Admin/Bookings/AdminBookings.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Badge } from '@/components/ui/admin/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/admin/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import { Calendar, DollarSign, Users, Package } from 'lucide-react';
import { MOCK_BOOKINGS, getTotalRevenue } from '@/mocks/bookings';

const AdminBookings = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Filter bookings
    const filteredBookings = useMemo(() => {
        return MOCK_BOOKINGS.filter(booking => {
            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesType = typeFilter === 'all' || booking.serviceType === typeFilter;
            return matchesStatus && matchesType;
        });
    }, [statusFilter, typeFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: MOCK_BOOKINGS.length,
        pending: MOCK_BOOKINGS.filter(b => b.status === 'pending').length,
        confirmed: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length,
        completed: MOCK_BOOKINGS.filter(b => b.status === 'completed').length,
        revenue: getTotalRevenue(),
    }), []);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            pending: { variant: 'secondary', label: 'Pending' },
            confirmed: { variant: 'default', label: 'Confirmed', className: 'bg-blue-500' },
            completed: { variant: 'default', label: 'Completed', className: 'bg-green-500' },
            cancelled: { variant: 'outline', label: 'Cancelled', className: 'bg-red-500 text-white' },
        };
        const config = variants[status] || variants.pending;
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const getPaymentBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            paid: { variant: 'default', label: 'Paid' },
            pending: { variant: 'secondary', label: 'Pending' },
            refunded: { variant: 'outline', label: 'Refunded' },
        };
        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage all bookings in the system
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats.revenue / 1000000).toFixed(1)}M ₫
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Service Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="hotel">Hotels</SelectItem>
                                <SelectItem value="tour">Tours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No bookings found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">#{booking.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{booking.userName}</div>
                                                <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{booking.serviceName}</TableCell>
                                        <TableCell className="capitalize">{booking.serviceType}</TableCell>
                                        <TableCell className="text-sm">
                                            {booking.serviceType === 'hotel' ? (
                                                <div>
                                                    <div>In: {new Date(booking.checkIn!).toLocaleDateString('vi-VN')}</div>
                                                    <div className="text-muted-foreground">
                                                        Out: {new Date(booking.checkOut!).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>{new Date(booking.tourDate!).toLocaleDateString('vi-VN')}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>{booking.guests}</TableCell>
                                        <TableCell className="font-medium">
                                            {booking.totalPrice.toLocaleString('vi-VN')} ₫
                                        </TableCell>
                                        <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredBookings.length} of {MOCK_BOOKINGS.length} bookings
            </div>
        </div>
    );
};

export default AdminBookings;
