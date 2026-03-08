// src/pages/ServiceProvider/Bookings/BookingsManagementPage.tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
    Calendar,
    Users,
    Eye,
    CheckCircle,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    Download,
    Clock,
    DollarSign,
    Search,
} from 'lucide-react';
import { bookingApi } from '@/api/bookingApi';
import type { Booking, BookingStatus } from '@/types/booking.types';
import BookingDetailModal from '@/pages/ServiceProvider/Bookings/components/BookingDetailModal';
import BookingStatusUpdateModal from '@/pages/ServiceProvider/Bookings/components/BookingStatusUpdateModal';

// Utility: Format currency VND
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Utility: Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Stats Card Component
function StatsCard({ stat }: { stat: any }) {
    const Icon = stat.icon;
    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold mb-2">{stat.value}</p>
                        {stat.subtitle && (
                            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
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

// Bookings Table Component
function BookingsTable({
    data,
    onViewDetail,
    onUpdateStatus
}: {
    data: Booking[];
    onViewDetail: (booking: Booking) => void;
    onUpdateStatus: (booking: Booking) => void;
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

    const columns: ColumnDef<Booking>[] = [
        {
            accessorKey: "bookingCode",
            header: ({ column }) => (
                <button
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center gap-2 hover:text-foreground font-semibold"
                >
                    Mã đặt chỗ
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
            cell: ({ row }) => <span className="font-medium">{row.getValue("bookingCode")}</span>,
        },
        {
            accessorKey: "guest",
            header: "Khách hàng",
            cell: ({ row }) => {
                const guest = row.getValue("guest") as Booking['guest'];
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                            <span className="text-sm font-medium text-accent-foreground">
                                {guest.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium">{guest.name}</p>
                            <p className="text-xs text-muted-foreground">{guest.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "service",
            header: "Dịch vụ",
            cell: ({ row }) => {
                const service = row.getValue("service") as Booking['service'];
                return (
                    <div className="flex items-center gap-2">
                        {service.thumbnailUrl && (
                            <img
                                src={service.thumbnailUrl}
                                alt={service.name}
                                className="w-10 h-10 rounded object-cover"
                            />
                        )}
                        <div>
                            <p className="font-medium">{service.name}</p>
                            <Badge className={service.type === "hotel" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                                {service.type === "hotel" ? "Khách sạn" : "Vé tham quan"}
                            </Badge>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "checkIn",
            header: "Ngày nhận/đi",
            cell: ({ row }) => formatDate(row.getValue("checkIn")),
        },
        {
            accessorKey: "checkOut",
            header: "Ngày trả/về",
            cell: ({ row }) => formatDate(row.getValue("checkOut")),
        },
        {
            accessorKey: "guests",
            header: "Số khách",
            cell: ({ row }) => {
                const guests = row.getValue("guests") as Booking['guests'];
                return (
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{guests.adults + guests.children}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "totalAmount",
            header: "Tổng tiền",
            cell: ({ row }) => (
                <span className="font-semibold">{formatCurrency(row.getValue("totalAmount"))}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as BookingStatus;
                const statusConfig = {
                    confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Đã xác nhận" },
                    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ xử lý" },
                    cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
                    completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Hoàn thành" },
                };
                const config = statusConfig[status];

                return (
                    <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Xem chi tiết"
                        onClick={() => onViewDetail(row.original)}
                    >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {row.original.status === 'pending' && (
                        <button
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Cập nhật trạng thái"
                            onClick={() => onUpdateStatus(row.original)}
                        >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const filteredData = statusFilter === 'all'
        ? data
        : data.filter(booking => booking.status === statusFilter);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn đặt..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                        className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Hiển thị {table.getRowModel().rows.length} trên tổng số {filteredData.length} đơn
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-muted">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b border-border">
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="text-left p-4 font-semibold text-sm">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-border hover:bg-muted/50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-4 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center p-8 text-muted-foreground">
                                        Không tìm thấy dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount()}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Trước
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Tiếp
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Main Component
export default function BookingsManagementPage() {
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Fetch bookings stats
    const { data: stats } = useQuery({
        queryKey: ['booking-stats'],
        queryFn: () => bookingApi.getBookingStats(),
    });

    // Fetch bookings
    const { data: bookingsData, isLoading } = useQuery({
        queryKey: ['provider-bookings'],
        queryFn: () => bookingApi.getProviderBookings(),
    });

    const handleViewDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowStatusModal(true);
    };

    const statsCards = [
        {
            title: "Chờ xử lý",
            value: stats?.today.pending || 0,
            icon: Clock,
            color: "text-yellow-600",
            iconBg: "bg-yellow-100 dark:bg-yellow-950",
            subtitle: "Hôm nay",
        },
        {
            title: "Đã xác nhận",
            value: stats?.today.confirmed || 0,
            icon: CheckCircle,
            color: "text-green-600",
            iconBg: "bg-green-100 dark:bg-green-950",
            subtitle: "Hôm nay",
        },
        {
            title: "Hoàn thành",
            value: stats?.today.completed || 0,
            icon: Calendar,
            color: "text-blue-600",
            iconBg: "bg-blue-100 dark:bg-blue-950",
            subtitle: "Hôm nay",
        },
        {
            title: "Doanh thu tháng này",
            value: formatCurrency(stats?.thisMonth.revenue || 0),
            icon: DollarSign,
            color: "text-purple-600",
            iconBg: "bg-purple-100 dark:bg-purple-950",
            subtitle: `${stats?.thisMonth.total || 0} đơn`,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý đơn đặt</h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi và quản lý tất cả các đơn đặt dịch vụ
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Bộ lọc
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <StatsCard key={index} stat={stat} />
                ))}
            </div>

            {/* Bookings Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
                    <div>
                        <CardTitle className="text-xl font-semibold">Danh sách đơn đặt</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tổng số {bookingsData?.total || 0} đơn đặt
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <BookingsTable
                        data={bookingsData?.bookings || []}
                        onViewDetail={handleViewDetail}
                        onUpdateStatus={handleUpdateStatus}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            {selectedBooking && (
                <>
                    <BookingDetailModal
                        booking={selectedBooking}
                        open={showDetailModal}
                        onClose={() => {
                            setShowDetailModal(false);
                            setSelectedBooking(null);
                        }}
                    />
                    <BookingStatusUpdateModal
                        booking={selectedBooking}
                        open={showStatusModal}
                        onClose={() => {
                            setShowStatusModal(false);
                            setSelectedBooking(null);
                        }}
                        onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
                            queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
                            setShowStatusModal(false);
                            setSelectedBooking(null);
                        }}
                    />
                </>
            )}
        </div>
    );
}
