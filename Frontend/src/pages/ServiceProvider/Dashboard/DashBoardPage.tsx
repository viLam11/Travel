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
  Banknote,
  Users,
  Eye,
  Edit,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Loader2,
  Plus,
  X,
  Inbox,
  TrendingUp,
  TrendingDown,
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
import { discountApi } from '@/api/discountApi';
import { shouldUseMock } from '@/config/mockConfig';



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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 rounded-t-xl">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 rounded-t-xl">
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

      {/* Table/Card View */}
      <div className="rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-border bg-card">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              const b = row.original;
              const conf = STATUS_CONF[b.status] || STATUS_CONF.pending;
              return (
                <div key={row.id} className="p-4 space-y-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">#{b.id}</span>
                        <Badge className={`${conf.className} text-[10px] px-2 py-0`}>{conf.label}</Badge>
                      </div>
                      <p className="font-medium text-sm text-muted-foreground">{b.service}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-2 bg-muted rounded-lg"
                        onClick={() => onViewDetail(b)}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {b.status === 'pending' && (
                        <button
                          className="p-2 bg-muted rounded-lg"
                          onClick={() => onUpdateStatus(b)}
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="flex items-center gap-3 col-span-2 py-1 bg-muted/20 px-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs">
                        <span className="font-medium">{b.guest.charAt(0)}</span>
                      </div>
                      <span className="font-bold">{b.guest}</span>
                    </div>
                    
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Ngày nhận</p>
                      <p className="font-medium">{new Date(b.checkIn).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Ngày trả</p>
                      <p className="font-medium">{new Date(b.checkOut).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Số khách</p>
                      <p className="font-medium">{b.guests} người</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Tổng tiền</p>
                      <p className="font-bold text-primary">{formatCurrency(b.amount)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">Không có dữ liệu</div>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="whitespace-nowrap text-left px-6 py-3.5 text-sm font-medium text-muted-foreground">
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
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Inbox className="w-10 h-10 opacity-25" />
                      <p className="text-[14px] font-medium">Không tìm thấy dữ liệu</p>
                      <p className="text-[12px] text-muted-foreground/70">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
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
  const toastObj = useToast();

  const USE_MOCK = shouldUseMock(null);

  const [isExporting, setIsExporting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(USE_MOCK ? bookingsData : []);

  // --- Walk-in Booking State ---
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInItemId, setWalkInItemId] = useState('');
  const [walkInQuantity, setWalkInQuantity] = useState(1);
  const [walkInCheckIn, setWalkInCheckIn] = useState('');
  const [walkInCheckOut, setWalkInCheckOut] = useState('');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'CASH' | 'MOMO' | 'VNPAY' | 'ZALOPAY'>('CASH');
  const [walkInNote, setWalkInNote] = useState('');
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [walkInDiscountId, setWalkInDiscountId] = useState('');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);



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

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);

  useEffect(() => {
    if (!showBookingModal) return;
    const fetchItems = async () => {
      const serviceId = currentUser?.user?.serviceId;
      if (!serviceId) return;
      try {
        if (providerType === 'hotel') {
          const rooms: any = await apiClient.rooms.getByHotelId(serviceId);
          setAvailableItems(Array.isArray(rooms) ? rooms : rooms?.content || []);
        } else {
          const tickets: any = await apiClient.tickets.getByServiceId(serviceId);
          setAvailableItems(Array.isArray(tickets) ? tickets : tickets?.content || []);
        }

        // Fetch discounts
        const discounts = await discountApi.getSatisfiedDiscounts(serviceId.toString(), "ALL");
        setAvailableDiscounts(Array.isArray(discounts) ? discounts : []);
      } catch (err) {
        console.error("Failed to fetch available items/discounts for walk-in booking", err);
      }
    };
    fetchItems();
  }, [showBookingModal, providerType, currentUser]);

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
    const fetchDashboardStats = async () => {
      const serviceId = currentUser?.user?.serviceId;
      if (!serviceId) return;

      if (USE_MOCK) {
        setTotalRevenue(156000000);
        setTotalBookings(45);
        setTrendsData(bookingTrendsData);
        setRevenueData(revenueByServiceData);
        return;
      }

      try {
        let stats: any;
        if (providerType === 'hotel') {
          stats = await apiClient.statistics.getHotelStats(serviceId);
        } else {
          stats = await apiClient.statistics.getVenueStats(serviceId);
        }

        const dataArr = Array.isArray(stats) ? stats : (stats?.items || []);
        let sumRev = 0;
        let sumBkg = 0;

        const mappedTrends = dataArr.map((day: any) => {
           const rev = day.revenue || 0;
           const ord = day.totalOrders || 0;
           sumRev += rev;
           sumBkg += ord;
           return { date: day.date || 'unknown', bookings: ord };
        });

        setTotalRevenue(sumRev);
        setTotalBookings(sumBkg);
        setTrendsData(mappedTrends);

        setRevenueData([
          { service: serviceInfo?.name || 'Dịch vụ của tôi', revenue: sumRev, bookings: sumBkg }
        ]);

      } catch (error) {
         console.error("Lỗi khi tải thống kê Dashboard:", error);
      }
    };
    fetchDashboardStats();
  }, [currentUser, providerType, serviceInfo, USE_MOCK]);

  useEffect(() => {
    const fetchApiBookings = async () => {
      const serviceId = currentUser?.user?.serviceId;
      if (!serviceId) return;
      
      if (USE_MOCK) {
        setLocalBookings(bookingsData);
        return;
      }

      setIsLoadingBookings(true);
      try {
        let response: any;
        if (providerType === 'hotel') {
          response = await apiClient.orders.getHotelOrders(serviceId);
        } else {
          response = await apiClient.orders.getTicketVenueOrders(serviceId);
        }
        
        const fetchedOrders = response?.content || (Array.isArray(response) ? response : (response?.data || response?.items || []));
        
        // Mapped always, even if length is 0, to clear the state/mock data
        const mappedBookings = fetchedOrders.map((o: any) => ({
          id: o.orderID || o.id,
          guest: o.user?.fullname || o.guestPhone || `Khách #${o.orderID || o.id}`,
          guests: (o.orderedRooms?.length || 0) + (o.orderedTickets?.length || 0),
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
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng của nhà cung cấp:", error);
        setLocalBookings([]); // Clear on error if not in mock mode
      } finally {
        setIsLoadingBookings(false);
      }
    };
    
    fetchApiBookings();
  }, [currentUser, providerType, USE_MOCK]);

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
          iconBg: "bg-blue-50 dark:bg-blue-950/40",
          change: "+5%",
          trend: "up",
        },
        {
          title: "Check-in hôm nay",
          value: totalBookings.toString(),
          icon: Calendar,
          color: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-50 dark:bg-green-950/40",
          change: "+3",
          trend: "up",
        },
        {
          title: "Tổng doanh thu",
          value: formatCurrency(totalRevenue),
          icon: Banknote,
          color: "text-amber-500 dark:text-amber-400",
          iconBg: "bg-amber-50 dark:bg-amber-950/40",
          change: "+12%",
          trend: "up",
        },
        {
          title: "Đánh giá khách hàng",
          value: "4.8/5",
          icon: Users,
          color: "text-purple-600 dark:text-purple-400",
          iconBg: "bg-purple-50 dark:bg-purple-950/40",
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
          iconBg: "bg-blue-50 dark:bg-blue-950/40",
          change: "+2",
          trend: "up",
        },
        {
          title: "Vé bán hôm nay",
          value: totalBookings.toString(),
          icon: Calendar,
          color: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-50 dark:bg-green-950/40",
          change: "+45",
          trend: "up",
        },
        {
          title: "Tổng doanh thu",
          value: formatCurrency(totalRevenue),
          icon: Banknote,
          color: "text-amber-500 dark:text-amber-400",
          iconBg: "bg-amber-50 dark:bg-amber-950/40",
          change: "+15%",
          trend: "up",
        },
        {
          title: "Lượt đánh giá",
          value: "4.7/5",
          icon: Users,
          color: "text-purple-600 dark:text-purple-400",
          iconBg: "bg-purple-50 dark:bg-purple-950/40",
          change: "+0.4",
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
          title: "Tổng doanh thu",
          value: formatCurrency(totalRevenue),
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
      toastObj.success("Đã xuất báo cáo tổng quan. File đang được tải xuống.");
    }, 1500);
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInItemId) {
      toastObj.error("Vui lòng chọn loại dịch vụ!");
      return;
    }
    
    setIsSubmittingWalkIn(true);
    try {
      // Map CASH to MOMO or VNPAY for backend compatibility if required, 
      // but if the backend accepts CASH we can send it. We'll send what user selects.
      let mappedMethod = walkInPaymentMethod;
      if (mappedMethod === 'CASH') mappedMethod = 'MOMO' as any; // fallback for backend validation
      
      const payload: any = {
        guestPhone: walkInPhone || "0000000000",
        note: `Khách điền tại quầy: ${walkInName}. ${walkInNote}`,
        paymentMethod: mappedMethod,
        discountIds: walkInDiscountId ? [walkInDiscountId] : [],
        tickets: providerType === 'place' ? [{ id: walkInItemId, quantity: walkInQuantity }] : [],
        rooms: providerType === 'hotel' ? [{ 
          id: walkInItemId, 
          quantity: 1, 
          checkInDate: walkInCheckIn ? new Date(walkInCheckIn).toISOString() : new Date().toISOString(), 
          checkOutDate: walkInCheckOut ? new Date(walkInCheckOut).toISOString() : new Date().toISOString() 
        }] : []
      };

      const orderRes = await apiClient.orders.create(payload);
      const orderId = orderRes?.orderID || orderRes?.id;

      if (!orderId) throw new Error("Không nhận được orderID");

      // Auto approve since it's walk in
      try {
        await apiClient.orders.updateStatus(orderId, "ACCEPTED");
      } catch (e) {
        console.log("Auto approve might fail if already accepted", e);
      }

      if (walkInPaymentMethod === 'VNPAY') {
        const payRes: any = await apiClient.payments.vnpay.createPaymentV2(orderRes.finalPrice || orderRes.totalPrice, orderId.toString());
        const url = payRes?.paymentUrl || payRes?.payUrl || payRes;
        if (typeof url === 'string' && url.startsWith('http')) {
           window.location.href = url;
           return;
        }
      } else if (walkInPaymentMethod === 'MOMO') {
        const payRes: any = await apiClient.payments.momo.createOrder(orderRes.finalPrice || orderRes.totalPrice, orderId.toString());
        const url = payRes?.paymentUrl || payRes?.payUrl || payRes;
        if (typeof url === 'string' && url.startsWith('http')) {
           window.location.href = url;
           return;
        }
      }

      toastObj.success(providerType === 'place' ? "Đã bán vé ngoại tuyến thành công." : "Đã tạo đơn đặt phòng mới trên hệ thống.");
      setShowBookingModal(false);
      // Giả lập refetch nhẹ bằng cách reload
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      toastObj.error("Có lỗi xảy ra khi tạo đơn.");
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  const getHeaderText = () => {
    if (providerType === 'hotel') {
      return {
        title: "Tổng quan khách sạn",
        subtitle: "Quản lý phòng và đặt chỗ của khách sạn bạn.",
        buttonText: "Đặt phòng tại quầy"
      };
    } else if (providerType === 'place') {
      return {
        title: "Tổng quan dịch vụ tham quan",
        subtitle: "Quản lý các điểm tham quan và dịch vụ du lịch của bạn.",
        buttonText: "Bán vé tại quầy"
      };
    } else {
      return {
        title: "Tổng quan dịch vụ",
        subtitle: "Quản lý tất cả dịch vụ khách sạn và tham quan của bạn.",
        buttonText: "Tạo đơn ngoại tuyến"
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{headerText.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{headerText.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm px-4 h-9" onClick={handleExportReports} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
            {isExporting ? 'Đang xử lý...' : 'Xuất báo cáo'}
          </Button>
          <Button variant="default" onClick={() => setShowBookingModal(true)} className="bg-primary hover:bg-primary/90 text-sm px-4 h-9">
            {headerText.buttonText}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          const isDown = stat.trend === 'down';
          const trendBg = isUp
            ? 'bg-green-50 dark:bg-green-950/40'
            : isDown
            ? 'bg-red-50 dark:bg-red-950/40'
            : 'bg-muted';
          const trendColor = isUp
            ? 'text-green-700 dark:text-green-400'
            : isDown
            ? 'text-red-700 dark:text-red-400'
            : 'text-muted-foreground';
          const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null;

          // Dynamic font size based on text length
          const valueLength = stat.value.toString().length;
          let fontSizeClass = 'text-3xl';
          if (valueLength > 15) {
            fontSizeClass = 'text-xl';
          } else if (valueLength > 10) {
            fontSizeClass = 'text-2xl';
          }

          return (
            <Card key={index} className="bg-card shadow-[0_2px_12px_rgb(0,0,0,0.06)] dark:shadow-none border border-border/40 rounded-xl hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:hover:shadow-none transition-all overflow-hidden">
              <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">{stat.title}</p>
                  <div className={`${fontSizeClass} font-semibold text-foreground mt-1 break-words leading-tight`}>{stat.value}</div>
                  {stat.change && (
                    <div className="mt-4 flex items-center">
                      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-0.5 text-[11px] font-medium ${trendBg} ${trendColor}`}>
                        {TrendIcon && <TrendIcon className="w-3 h-3" />}
                        {isUp ? '' : isDown ? '' : ''}{stat.change} so với hôm qua
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 ${stat.iconBg} rounded-2xl flex-shrink-0`}>
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
          <RevenueByServiceChart data={revenueData.length > 0 ? revenueData : revenueByServiceData} />
        </div>

        <div>
          <BookingTrendsChart data={trendsData.length > 0 ? trendsData : bookingTrendsData} />
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
      <Card className="shadow-sm overflow-hidden">
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
          onConfirm={async () => {
            try {
              await apiClient.orders.updateStatus(statusBooking.id, '"ACCEPTED"');
              setLocalBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'confirmed' } : b));
              toastObj.success("Đã xác nhận đơn hàng " + statusBooking.id);
            } catch (err) {
              console.error(err);
              toastObj.error("Lỗi khi xác nhận đơn hàng " + statusBooking.id);
            } finally {
              setStatusBooking(null);
            }
          }}
          onReject={async () => {
             try {
              await apiClient.orders.updateStatus(statusBooking.id, '"CANCELLED"');
              setLocalBookings(prev => prev.map(b => b.id === statusBooking.id ? { ...b, status: 'cancelled' } : b));
              toastObj.success("Đã từ chối đơn hàng " + statusBooking.id);
            } catch (err) {
              console.error(err);
              toastObj.error("Lỗi khi từ chối đơn hàng " + statusBooking.id);
            } finally {
              setStatusBooking(null);
            }
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
                <CardTitle className="text-xl">
                  {providerType === 'place' ? 'Bán vé tại quầy (Offline)' : 'Tạo đặt phòng mới (Offline)'}
                </CardTitle>
                <button type="button" onClick={() => setShowBookingModal(false)} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </CardHeader>
              {/* Scrollable body */}
              <CardContent className="pt-6 space-y-4 overflow-y-auto flex-1 pr-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên khách hàng *</Label>
                    <Input required placeholder="Nhập tên khách hàng" value={walkInName} onChange={e => setWalkInName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại *</Label>
                    <Input required placeholder="09xxxxxxx" value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>{providerType === 'place' ? 'Loại vé / Vị trí' : 'Loại phòng'}</Label>
                    <select 
                      required
                      value={walkInItemId}
                      onChange={e => setWalkInItemId(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {availableItems.map(item => (
                        <option key={item.id || item.roomID} value={item.id || item.roomID}>
                          {item.name || item.roomName || item.ticketType || `Dịch vụ #${item.id || item.roomID}`} - {formatCurrency(item.price || item.pricePerNight || 0)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượng</Label>
                    <Input type="number" min="1" required value={walkInQuantity} onChange={e => setWalkInQuantity(parseInt(e.target.value))} disabled={providerType === 'hotel'} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{providerType === 'place' ? 'Ngày tham quan' : 'Nhận phòng'}</Label>
                    <Input type="date" required value={walkInCheckIn} onChange={e => setWalkInCheckIn(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{providerType === 'place' ? 'Khung giờ' : 'Trả phòng'}</Label>
                    {providerType === 'place' ? (
                      <Input type="time" value={walkInCheckOut} onChange={e => setWalkInCheckOut(e.target.value)} />
                    ) : (
                      <Input type="date" required value={walkInCheckOut} onChange={e => setWalkInCheckOut(e.target.value)} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phương thức thanh toán</Label>
                    <select 
                      value={walkInPaymentMethod}
                      onChange={e => setWalkInPaymentMethod(e.target.value as any)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="CASH">Tiền mặt (Tại quầy)</option>
                      <option value="MOMO">Quét mã MoMo</option>
                      <option value="VNPAY">Quét mã VNPay</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mã giảm giá (Nếu có)</Label>
                    <select 
                      value={walkInDiscountId}
                      onChange={e => setWalkInDiscountId(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">-- Không áp dụng --</option>
                      {availableDiscounts.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.code} - Giảm {d.discountType === 'Percentage' ? `${d.percentage}%` : formatCurrency(d.fixedPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú thêm</Label>
                  <Input placeholder="Ví dụ: Yêu cầu đặc biệt..." value={walkInNote} onChange={e => setWalkInNote(e.target.value)} />
                </div>
              </CardContent>
              {/* Fixed footer */}
              <div className="flex gap-3 p-6 pt-4 bg-muted/30 flex-shrink-0">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowBookingModal(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={isSubmittingWalkIn}>
                  {isSubmittingWalkIn ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isSubmittingWalkIn ? 'Đang xử lý...' : (providerType === 'place' ? 'Lưu đơn vé' : 'Lưu đặt phòng')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}