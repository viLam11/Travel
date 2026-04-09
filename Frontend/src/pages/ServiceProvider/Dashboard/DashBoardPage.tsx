// src/pages/ServiceProvider/Dashboard/DashBoardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
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
  Banknote, // Đã thay thế DollarSign bằng Banknote
  Users,
  Eye,
  Edit,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

// Import Chart Components
import RevenueByServiceChart from '@/components/ui/admin/charts/RevenueByServiceChart';
import BookingTrendsChart from '@/components/ui/admin/charts/BookingTrendsChart';

// Import Data
import {
  bookingsData,
  revenueByServiceData,
  bookingTrendsData,
  type Booking,
} from '@/data/dashboardData';
import { useAuthContext } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';
import { serviceDetailApi } from '@/api/serviceDetailApi';

// --- Utility: Hàm định dạng tiền tệ VND ---
const formatCurrency = (value: number | string) => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// ─── Inline Modals ────────────────────────────────────────────────────────────

const STATUS_CONF: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-amber-500 hover:bg-amber-500 text-white border-transparent' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-green-500 hover:bg-green-500 text-white border-transparent' },
  completed: { label: 'Hoàn thành', className: 'bg-blue-500  hover:bg-blue-500  text-white border-transparent' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-500   hover:bg-red-500   text-white border-transparent' },
};

function BookingDetailPanel({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const s = STATUS_CONF[booking.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold">Chi tiết đơn #{booking.id}</h2>
            <p className="text-sm text-muted-foreground">{booking.service}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <Badge className={`${s.className} text-xs`}>{s.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground">Khách hàng</p><p className="font-medium mt-1">{booking.guest}</p></div>
            <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground">Số khách</p><p className="font-medium mt-1">{booking.guests} người</p></div>
            <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground">Ngày nhận</p><p className="font-medium mt-1">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</p></div>
            <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground">Ngày trả</p><p className="font-medium mt-1">{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</p></div>
            <div className="p-3 bg-muted/50 rounded-lg col-span-2"><p className="text-muted-foreground">Tổng tiền</p><p className="font-semibold text-primary mt-1">{formatCurrency(booking.amount)}</p></div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-border bg-muted/40 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Dóng</Button>
        </div>
      </div>
    </div>
  );
}

function BookingStatusPanel({
  booking, onClose, onConfirm, onReject
}: { booking: Booking; onClose: () => void; onConfirm: () => void; onReject: () => void }) {
  const s = STATUS_CONF[booking.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl">
          <h2 className="text-lg font-bold">Xử lý đơn #{booking.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Khách hàng</span><span className="font-medium">{booking.guest}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dịch vụ</span><span className="font-medium">{booking.service}</span></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Trạng thái</span><Badge className={`${s.className} text-xs`}>{s.label}</Badge></div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/40 rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
          <Button onClick={onReject} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">Từ chối</Button>
          <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Xác nhận</Button>
        </div>
      </div>
    </div>
  );
}

// Bookings Table Component
function BookingsTable({
  data,
  onViewDetail,
  onUpdateStatus,
}: {
  data: Booking[];
  onViewDetail: (b: Booking) => void;
  onUpdateStatus: (b: Booking) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 hover:text-foreground font-semibold text-base"
        >
          Mã đặt chỗ
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium text-base">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "guest",
      header: "Tên khách",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-base">
            <span className="font-medium text-accent-foreground">
              {(row.getValue("guest") as string).charAt(0)}
            </span>
          </div>
          <span className="text-base font-medium">{row.getValue("guest")}</span>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: "Dịch vụ",
      cell: ({ row }) => <span className="font-medium text-base">{row.getValue("service")}</span>,
    },
    {
      accessorKey: "serviceType",
      header: "Loại hình",
      cell: ({ row }) => {
        const type = row.getValue("serviceType") as string;
        return (
          <Badge
            className={`text-sm px-2.5 py-0.5 ${type === "hotel" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
          >
            {type === "hotel" ? "Khách sạn" : "Vé tham quan"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "checkIn",
      header: "Ngày nhận/đi",
      cell: ({ row }) => {
        const date = new Date(row.getValue("checkIn"));
        return <span className="text-base">{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      accessorKey: "checkOut",
      header: "Ngày trả/về",
      cell: ({ row }) => {
        const date = new Date(row.getValue("checkOut"));
        return <span className="text-base">{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      accessorKey: "guests",
      header: "Số khách",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{row.getValue("guests")}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Tổng tiền",
      cell: ({ row }) => {
        const amount = row.getValue("amount");
        return <span className="font-bold text-base">{formatCurrency(amount as number)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const conf = STATUS_CONF[status] || STATUS_CONF.pending;
        return <Badge className={`${conf.className} text-xs`}>{conf.label}</Badge>;
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
            <Eye className="w-5 h-5 text-muted-foreground" />
          </button>
          {row.original.status === 'pending' && (
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Xử lý đơn"
              onClick={() => onUpdateStatus(row.original)}
            >
              <Edit className="w-5 h-5 text-green-600" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
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
        pageSize: 8,
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm đơn đặt..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-4 py-3 border border-input bg-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-80 text-base shadow-sm"
        />
        <div className="text-base text-muted-foreground">
          Hiển thị <strong>{table.getRowModel().rows.length}</strong> trên tổng số <strong>{data.length}</strong> đơn
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left px-6 py-4 font-semibold text-base text-muted-foreground">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-base">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center p-10 text-lg text-muted-foreground">
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-base text-muted-foreground">
          Trang <strong>{table.getState().pagination.pageIndex + 1}</strong> trên <strong>{table.getPageCount()}</strong>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-10 px-4 text-base"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-10 px-4 text-base"
          >
            Tiếp
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function TravelServicesDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { toast } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookingsData);


  // Check if provider has completed service setup
  useEffect(() => {
    const userRole = currentUser?.user?.role?.toLowerCase() || '';
    const isProvider = userRole === 'provider' || userRole.startsWith('provider_');
    
    if (isProvider && !currentUser?.user?.hasService) {
      // Redirect to service setup if not completed
      navigate(ROUTES.PROVIDER_MY_SERVICE, { replace: true });
    }
  }, [currentUser, navigate]);

  // Derive provider type based on specific role or providerType field
  const userRole = currentUser?.user?.role?.toLowerCase() || '';
  let providerType: 'hotel' | 'place' = 'place';
  
  if (userRole === 'provider_venue' || currentUser?.user?.providerType === 'place') {
    providerType = 'place';
  } else if (userRole === 'provider_hotel' || currentUser?.user?.providerType === 'hotel') {
    providerType = 'hotel';
  }

  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<any>(null);

  useEffect(() => {
    const fetchServiceInfo = async () => {
      const serviceId = currentUser?.user?.serviceId;
      if (!serviceId) return;
      try {
        const data = await serviceDetailApi.getServiceDetail('', '', serviceId.toString());
        setServiceInfo(data);
      } catch (err) {
        console.error("Failed to fetch service info for dashboard:", err);
      }
    };
    fetchServiceInfo();
  }, [currentUser]);

  useEffect(() => {
    const fetchApiBookings = async () => {
      const serviceId = currentUser?.user?.serviceId;
      if (!serviceId) return;
      
      setIsLoadingBookings(true);
      try {
        let response: any;
        if (providerType === 'hotel') {
          response = await apiClient.orders.getHotelOrders(serviceId);
        } else {
          response = await apiClient.orders.getTicketVenueOrders(serviceId);
        }
        
        const fetchedOrders = response?.content || (Array.isArray(response) ? response : (response?.data || response?.items || []));
        
        if (fetchedOrders.length > 0) {
           const mappedBookings = fetchedOrders.map((o: any) => ({
             id: o.orderID || o.id,
             guest: o.user?.fullname || o.guestPhone || `Khách #${o.orderID || o.id}`,
             guests: (o.orderedRooms?.length || 0) + (o.orderedTickets?.length || 0), // Logic tạm thời cho số lượng
             checkIn: o.orderedRooms?.[0]?.startDate || o.createdAt,
             checkOut: o.orderedRooms?.[0]?.endDate || o.createdAt,
             service: o.orderedRooms?.[0]?.room?.hotel?.serviceName || o.orderedTickets?.[0]?.ticket?.ticketVenue?.serviceName || "Dịch vụ của bạn",
             serviceType: providerType,
             amount: o.finalPrice || o.totalPrice || 0,
             status: o.status === 'SUCCESS' ? 'completed' : 
                     (o.status === 'ACCEPTED' || o.status === 'CONFIRMED') ? 'confirmed' : 
                     (o.status === 'CANCELLED' || o.status === 'CANCELED' || o.status === 'FAILED') ? 'cancelled' : 'pending'
           }));
           setLocalBookings(mappedBookings);
        }
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng của nhà cung cấp:", error);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    
    fetchApiBookings();
  }, [currentUser, providerType]);

  // Filter bookings by providerType
  const filteredBookings = localBookings.filter(b => {
    if (providerType === 'hotel') return b.serviceType === 'hotel';
    if (providerType === 'place') return b.serviceType === 'ticket';
    return true; // admin / other → all
  });

  // Dynamic Stats based on provider type
  const getStats = () => {
    if (providerType === 'hotel') {
      return [
        {
          title: "Tỷ lệ lấp đầy",
          value: "78%",
          icon: Briefcase,
          color: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-500/20",
          change: "+5%",
          trend: "up",
        },
        {
          title: "Check-in hôm nay",
          value: "24",
          icon: Calendar,
          color: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-100 dark:bg-green-500/20",
          change: "+3",
          trend: "up",
        },
        {
          title: "Doanh thu hôm nay",
          value: formatCurrency(18500000),
          icon: Banknote,
          color: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
          change: "+12%",
          trend: "up",
        },
        {
          title: "Đánh giá khách hàng",
          value: "4.8/5",
          icon: Users,
          color: "text-purple-600 dark:text-purple-400",
          iconBg: "bg-purple-100 dark:bg-purple-500/20",
          change: "+0.2",
          trend: "up",
        },
      ];
    } else if (providerType === 'place') {
      return [
        {
          title: "Dịch vụ hoạt động",
          value: "12",
          icon: Briefcase,
          color: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-500/20",
          change: "+3",
          trend: "up",
        },
        {
          title: "Vé bán hôm nay",
          value: "156",
          icon: Calendar,
          color: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-100 dark:bg-green-500/20",
          change: "+24",
          trend: "up",
        },
        {
          title: "Doanh thu hôm nay",
          value: formatCurrency(12400000),
          icon: Banknote,
          color: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
          change: "+15%",
          trend: "up",
        },
        {
          title: "Lượt đánh giá",
          value: "4.7/5",
          icon: Users,
          color: "text-purple-600 dark:text-purple-400",
          iconBg: "bg-purple-100 dark:bg-purple-500/20",
          change: "+0.3",
          trend: "up",
        },
      ];
    } else {
      // Both types - combined stats
      return [
        {
          title: "Tổng dịch vụ",
          value: "17",
          icon: Briefcase,
          color: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-500/20",
          change: "+5",
          trend: "up",
        },
        {
          title: "Đơn đặt hôm nay",
          value: "180",
          icon: Calendar,
          color: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-100 dark:bg-green-500/20",
          change: "+27",
          trend: "up",
        },
        {
          title: "Doanh thu hôm nay",
          value: formatCurrency(30900000),
          icon: Banknote,
          color: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
          change: "+13%",
          trend: "up",
        },
        {
          title: "Đánh giá trung bình",
          value: "4.75/5",
          icon: Users,
          color: "text-purple-600 dark:text-purple-400",
          iconBg: "bg-purple-100 dark:bg-purple-500/20",
          change: "+0.25",
          trend: "up",
        },
      ];
    }
  };

  const stats = getStats();

  const handleExportReports = () => {
    setIsExporting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsExporting(false);
      toast("Đã xuất báo cáo tổng quan. File đang được tải xuống.", "success");
    }, 1500);
  };

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBookingModal(false);
    toast("Đã tạo đơn đặt phòng mới trên hệ thống.", "success");
  };

  // Dynamic header text
  const getHeaderText = () => {
    if (providerType === 'hotel') {
      return {
        title: "Tổng quan khách sạn",
        subtitle: "Quản lý phòng và đặt chỗ của khách sạn bạn.",
        buttonText: "Tạo đặt phòng"
      };
    } else if (providerType === 'place') {
      return {
        title: "Tổng quan dịch vụ tham quan",
        subtitle: "Quản lý các điểm tham quan và dịch vụ du lịch của bạn.",
        buttonText: "Tạo dịch vụ mới"
      };
    } else {
      return {
        title: "Tổng quan dịch vụ",
        subtitle: "Quản lý tất cả dịch vụ khách sạn và tham quan của bạn.",
        buttonText: "Tạo dịch vụ mới"
      };
    }
  };

  const headerText = getHeaderText();

  // Dynamic bookings table title
  const getBookingsTitle = () => {
    if (providerType === 'hotel') {
      return {
        title: "Đặt phòng gần đây",
        subtitle: "Theo dõi các đơn đặt phòng của khách sạn"
      };
    } else if (providerType === 'place') {
      return {
        title: "Đặt vé gần đây",
        subtitle: "Theo dõi các đơn đặt vé tham quan"
      };
    } else {
      return {
        title: "Đơn đặt gần đây",
        subtitle: "Theo dõi tất cả đơn đặt phòng và vé tham quan"
      };
    }
  };

  const bookingsTitle = getBookingsTitle();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{headerText.title}</h1>
          <p className="text-lg text-muted-foreground mt-1">{headerText.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-base px-4 h-11" onClick={handleExportReports} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Calendar className="w-5 h-5 mr-2" />}
            {isExporting ? 'Đang xử lý...' : 'Xuất báo cáo'}
          </Button>
          <Button variant="default" onClick={() => setShowBookingModal(true)} className="bg-primary hover:bg-primary/90 text-base px-4 h-11">
            {headerText.buttonText}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card rounded-xl overflow-hidden">
              <CardContent className="p-6 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className={`${fontSizeClass} font-bold text-foreground mt-2 break-words leading-tight`}>{stat.value}</div>
                  {stat.change && (
                    <div className="mt-4 flex items-center">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${trendBg} ${trendColor}`}>
                        {stat.trend === 'up' ? '+' : ''}{stat.change} so với hôm qua
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
        })}
      </div>

      {/* Charts Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueByServiceChart data={revenueByServiceData} />
        </div>
        <div className="lg:col-span-1">
          <BookingTrendsChart data={bookingTrendsData} />
        </div>
      </div>

      {/* Charts Section - Row 2
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <TopProvidersChart data={topProvidersData} />
        </div>
        <div className="xl:col-span-1">
          <BookingStatusChart data={bookingStatusData} />
        </div>
        <div className="xl:col-span-1">
          <PopularDestinationsChart data={popularDestinationsData} />
        </div>
      </div> */}

      {/* Charts Section - Row 3
      <div className="grid grid-cols-1">
        <MonthlyRevenueChart data={monthlyRevenueData} />
      </div> */}

      {/* Recent Bookings Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">{bookingsTitle.title}</CardTitle>
            <p className="text-base text-muted-foreground mt-1">{bookingsTitle.subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-base h-10 px-4"
            onClick={() => navigate(ROUTES.PROVIDER_BOOKINGS)}
          >
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm font-medium">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : (
            <BookingsTable
              data={filteredBookings}
              onViewDetail={(b) => setDetailBooking(b)}
              onUpdateStatus={(b) => setStatusBooking(b)}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailPanel booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}

      {/* Status Modal */}
      {statusBooking && (
        <BookingStatusPanel
          booking={statusBooking}
          onClose={() => setStatusBooking(null)}
          onConfirm={() => {
            setLocalBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'confirmed' } : b));
            setStatusBooking(null);
          }}
          onReject={() => {
            setLocalBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'cancelled' } : b));
            setStatusBooking(null);
          }}
        />
      )}

      {/* Booking Modal Overlay */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowBookingModal(false)}>
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateBookingSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Sticky header */}
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 bg-muted/30 pb-4">
                <CardTitle className="text-xl">Tạo đặt phòng mới (Offline)</CardTitle>
                <button type="button" onClick={() => setShowBookingModal(false)} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </CardHeader>
              {/* Scrollable body */}
              <CardContent className="pt-6 space-y-4 overflow-y-auto flex-1 pr-5">
                <div className="space-y-2">
                  <Label>Tên khách hàng *</Label>
                  <Input required placeholder="Nhập tên khách hàng" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input placeholder="09xxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại phòng</Label>
                    <select className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <option>Phòng Standard</option>
                      <option>Phòng Superior</option>
                      <option>Phòng VIP</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kỳ nghỉ</Label>
                    <Input type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Đến hết ngày</Label>
                    <Input type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú thêm</Label>
                  <Input placeholder="Ví dụ: Khách yêu cầu giường đôi, view đẹp..." />
                </div>
              </CardContent>
              {/* Fixed footer */}
              <div className="flex gap-3 p-6 pt-4 bg-muted/30 flex-shrink-0">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowBookingModal(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Lưu đặt phòng
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}