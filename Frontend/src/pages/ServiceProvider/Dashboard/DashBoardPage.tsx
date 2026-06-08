// src/pages/ServiceProvider/Dashboard/DashBoardPage.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import apiClient from '@/services/apiClient';
import { serviceDetailApi } from '@/api/serviceDetailApi';
import { discountApi } from '@/api/discountApi';
import { serviceApi } from '@/api/serviceApi';
import { ServicesTable } from '../Services/ServiceListPage';
import ServiceDeleteModal from '../Services/components/ServiceDeleteModal';
import type { Service } from '@/types/service.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import {
  Calendar, Banknote, Users, Eye, Edit,
  ArrowUpDown, ChevronLeft, ChevronRight,
  Briefcase, Loader2, Plus, X, Inbox,
  TrendingUp, TrendingDown, Building2, Ticket, MapPin,
} from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import RevenueByServiceChart from '@/components/ui/admin/charts/RevenueByServiceChart';
import ProviderDailyTrendsChart from '@/components/ui/admin/charts/ProviderDailyTrendsChart';
import { bookingTrendsData } from '@/data/dashboardData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceEntry {
  id: string;
  serviceName: string;
  serviceType: string;
  thumbnailUrl?: string;
}

interface OrderRow {
  id: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  service: string;
}

interface WalkInForm {
  name: string;
  phone: string;
  itemId: string;
  quantity: number;
  checkIn: string;
  checkOut: string;
  paymentMethod: 'CASH' | 'MOMO' | 'VNPAY';
  discountId: string;
  note: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_WALK_IN: WalkInForm = {
  name: '',
  phone: '',
  itemId: '',
  quantity: 1,
  checkIn: '',
  checkOut: '',
  paymentMethod: 'CASH',
  discountId: '',
  note: '',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-amber-500 text-white border-transparent' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-green-500 text-white border-transparent' },
  completed: { label: 'Hoàn thành', className: 'bg-blue-500  text-white border-transparent' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-500   text-white border-transparent' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

function mapOrderStatus(raw: string): OrderRow['status'] {
  const s = (raw || '').toUpperCase();
  if (s === 'SUCCESS' || s === 'COMPLETED') return 'completed';
  if (s === 'ACCEPTED' || s === 'CONFIRMED') return 'confirmed';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'FAILED') return 'cancelled';
  return 'pending';
}

// ─── OrderDetailModal ─────────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold">Chi tiết đơn #{order.id}</h2>
            <p className="text-sm text-muted-foreground">{order.service}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <Badge className={`${s.className} text-xs`}>{s.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Khách hàng</p>
              <p className="font-medium mt-1">{order.guest}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Số khách</p>
              <p className="font-medium mt-1">{order.guests} người</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Ngày nhận</p>
              <p className="font-medium mt-1">{new Date(order.checkIn).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Ngày trả</p>
              <p className="font-medium mt-1">{new Date(order.checkOut).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg col-span-2">
              <p className="text-muted-foreground">Tổng tiền</p>
              <p className="font-semibold text-primary mt-1">{formatCurrency(order.amount)}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-border bg-muted/40 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}

// ─── OrderStatusModal ─────────────────────────────────────────────────────────

function OrderStatusModal({
  order, onClose, onConfirm, onReject,
}: { order: OrderRow; onClose: () => void; onConfirm: () => void; onReject: () => void }) {
  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl">
          <h2 className="text-lg font-bold">Xử lý đơn #{order.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Khách hàng</span><span className="font-medium">{order.guest}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dịch vụ</span><span className="font-medium">{order.service}</span></div>
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

// ─── OrdersTable ──────────────────────────────────────────────────────────────

// Row model factories phải đặt ở module level — KHÔNG được gọi bên trong component body.
// Mỗi lần render sẽ tạo reference mới => TanStack Table dispatch internal state update
// => re-render loop => UI freeze/hang.
const ORDERS_CORE_ROW_MODEL = getCoreRowModel();
const ORDERS_SORTED_ROW_MODEL = getSortedRowModel();
const ORDERS_FILTERED_ROW_MODEL = getFilteredRowModel();
const ORDERS_PAGINATED_ROW_MODEL = getPaginationRowModel();

function OrdersTable({
  data,
  onViewDetail,
  onUpdateStatus,
}: {
  data: OrderRow[];
  onViewDetail: (o: OrderRow) => void;
  onUpdateStatus: (o: OrderRow) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<OrderRow>[] = useMemo(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2 hover:text-foreground font-semibold">
          Mã đơn <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">#{row.getValue('id')}</span>,
    },
    {
      accessorKey: 'guest',
      header: 'Khách hàng',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-accent-foreground">
            {String(row.getValue('guest') || '?').charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{row.getValue('guest')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'checkIn',
      header: 'Ngày nhận',
      cell: ({ row }) => <span>{new Date(row.getValue('checkIn') as string).toLocaleDateString('vi-VN')}</span>,
    },
    {
      accessorKey: 'checkOut',
      header: 'Ngày trả',
      cell: ({ row }) => <span>{new Date(row.getValue('checkOut') as string).toLocaleDateString('vi-VN')}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Tổng tiền',
      cell: ({ row }) => <span className="font-bold">{formatCurrency(row.getValue('amount') as number)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const conf = STATUS_CONFIG[row.getValue('status') as string] ?? STATUS_CONFIG.pending;
        return <Badge className={`${conf.className} text-xs`}>{conf.label}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button className="p-2 hover:bg-muted rounded-lg" title="Xem chi tiết" onClick={() => onViewDetail(row.original)}>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
          {row.original.status === 'pending' && (
            <button className="p-2 hover:bg-muted rounded-lg" title="Xử lý" onClick={() => onUpdateStatus(row.original)}>
              <Edit className="w-4 h-4 text-green-600" />
            </button>
          )}
        </div>
      ),
    },
  ], [onViewDetail, onUpdateStatus]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: ORDERS_CORE_ROW_MODEL,
    getSortedRowModel: ORDERS_SORTED_ROW_MODEL,
    getFilteredRowModel: ORDERS_FILTERED_ROW_MODEL,
    getPaginationRowModel: ORDERS_PAGINATED_ROW_MODEL,
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm đơn đặt..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-72 text-sm"
        />
        <span className="text-sm text-muted-foreground">
          {table.getRowModel().rows.length} / {data.length} đơn
        </span>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-border">
                  {hg.headers.map(h => (
                    <th key={h.id} className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Chưa có đơn đặt nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Trang {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { currentUser, isLoading: isAuthLoading } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Tạo stable query key từ danh sách service IDs (sorted) để tránh re-fetch vô hạn
  // khi currentUser?.user?.services là array reference mới sau mỗi render
  const serviceIdsKey = useMemo(() => {
    const ids = (currentUser?.user?.services as any[] | undefined) ?? [];
    return ids
      .map((s: any) => (typeof s === 'object' ? String(s.id) : String(s)))
      .filter(Boolean)
      .sort()
      .join(',');
  }, [currentUser?.user?.services]);

  // Fetch details of all services owned by the provider
  const { data: servicesList = [], isLoading: isLoadingServicesList } = useQuery<Service[]>({
    queryKey: ['provider-services-details', serviceIdsKey],
    queryFn: async () => {
      if (!serviceIdsKey) return [];
      const ids = serviceIdsKey.split(',');
      const fetchPromises = ids.map(async (id: string) => {
        try {
          return await serviceApi.getServiceById(id);
        } catch (err) {
          console.error(`Failed to fetch service ${id}:`, err);
          return null;
        }
      });
      const results = await Promise.all(fetchPromises);
      return results.filter(Boolean) as Service[];
    },
    enabled: !!serviceIdsKey,
    staleTime: 5 * 60 * 1000, // 5 phút — tránh re-fetch liên tục khi switch tab
    gcTime: 10 * 60 * 1000,
  });

  // ── Derived provider services list ──────────────────────────────────────────
  const providerServices = useMemo<ServiceEntry[]>(() => {
    return servicesList.map((s: any): ServiceEntry => ({
      id: String(s.id),
      serviceName: s.serviceName || s.name || `Dịch vụ #${s.id}`,
      serviceType: String(s.type || s.serviceType || '').toUpperCase(),
      thumbnailUrl: s.thumbnailUrl || undefined,
    }));
  }, [servicesList]);

  // ── Active service state ─────────────────────────────────────────────────────
  const [activeServiceId, setActiveServiceId] = useState<string>('');
  // Dùng ref để chỉ khởi tạo activeServiceId một lần duy nhất, tránh effect
  // chạy lại mỗi lần providerServices tạo ra reference mới
  const activeServiceInitialized = useRef(false);

  useEffect(() => {
    if (activeServiceInitialized.current || providerServices.length === 0) return;
    activeServiceInitialized.current = true;
    setActiveServiceId(providerServices[0].id);
  }, [providerServices]);

  const activeService = useMemo<ServiceEntry | undefined>(
    () => providerServices.find(s => s.id === activeServiceId) ?? providerServices[0],
    [providerServices, activeServiceId]
  );
  const isHotel = activeService?.serviceType === 'HOTEL';
  const providerType: 'hotel' | 'place' = isHotel ? 'hotel' : 'place';

  // ── Auth redirect guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;
    const role = (currentUser?.user?.role || '').toLowerCase();
    const isProvider = role === 'provider' || role.startsWith('provider_');
    if (isProvider && !currentUser?.user?.hasService) {
      navigate(ROUTES.PROVIDER_MY_SERVICE, { replace: true });
    }
  }, [currentUser, isAuthLoading, navigate]);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);
  const [statusOrder, setStatusOrder] = useState<OrderRow | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Walk-in form ─────────────────────────────────────────────────────────────
  const [walkIn, setWalkIn] = useState<WalkInForm>(EMPTY_WALK_IN);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset walk-in form whenever the active service changes
  useEffect(() => {
    setWalkIn(EMPTY_WALK_IN);
  }, [activeServiceId]);

  const setWalkInField = useCallback(<K extends keyof WalkInForm>(key: K, value: WalkInForm[K]) => {
    setWalkIn(prev => ({ ...prev, [key]: value }));
  }, []);

  // ── Queries ──────────────────────────────────────────────────────────────────

  // Items (rooms or tickets) + discounts for the active service
  const { data: itemsData } = useQuery({
    queryKey: ['provider-items', activeServiceId, isHotel],
    queryFn: async () => {
      if (!activeServiceId) return { items: [] as any[], discounts: [] as any[] };
      const [itemsRes, discountsRes] = await Promise.allSettled([
        isHotel
          ? apiClient.rooms.getByHotelId(activeServiceId)
          : apiClient.tickets.getByServiceId(activeServiceId),
        discountApi.getSatisfiedDiscounts(activeServiceId, 'ALL'),
      ]);
      const rawItems = itemsRes.status === 'fulfilled' ? itemsRes.value : [];
      const rawDiscounts = discountsRes.status === 'fulfilled' ? discountsRes.value : [];
      const items = Array.isArray(rawItems) ? rawItems : ((rawItems as any)?.content ?? []);
      const discounts = Array.isArray(rawDiscounts) ? rawDiscounts : [];
      return { items, discounts };
    },
    enabled: !!activeServiceId,
    staleTime: 5 * 60 * 1000,
  });
  const availableItems: any[] = itemsData?.items ?? [];
  const availableDiscounts: any[] = itemsData?.discounts ?? [];

  // Service detail (rating, name, etc.)
  const { data: serviceInfo } = useQuery({
    queryKey: ['service-detail', activeServiceId],
    queryFn: () => activeServiceId ? serviceDetailApi.getServiceDetail('', '', activeServiceId) : null,
    enabled: !!activeServiceId,
    staleTime: 30 * 60 * 1000,
  });

  // Orders for the active service
  const { data: ordersData = [], isLoading: isLoadingOrders } = useQuery<OrderRow[]>({
    queryKey: ['provider-orders', activeServiceId, isHotel],
    queryFn: async (): Promise<OrderRow[]> => {
      if (!activeServiceId) return [];
      let res: any;
      try {
        res = isHotel
          ? await apiClient.orders.getHotelOrders(activeServiceId)
          : await apiClient.orders.getTicketVenueOrders(activeServiceId);
      } catch {
        return [];
      }
      const list: any[] = res?.content ?? (Array.isArray(res) ? res : []);
      return list.map((o: any): OrderRow => ({
        id: String(o.orderID ?? o.id ?? ''),
        guest: o.user?.fullname ?? o.guestPhone ?? `Khách #${o.orderID ?? o.id}`,
        guests: (o.orderedRooms?.length || 0) + (o.orderedTickets?.length || 0) || 1,
        checkIn: o.orderedRooms?.[0]?.startDate ?? o.createdAt ?? new Date().toISOString(),
        checkOut: o.orderedRooms?.[0]?.endDate ?? o.createdAt ?? new Date().toISOString(),
        amount: Number(o.finalPrice ?? o.totalPrice ?? 0),
        status: mapOrderStatus(o.status ?? ''),
        service: o.orderedRooms?.[0]?.room?.hotel?.serviceName
          ?? o.orderedTickets?.[0]?.ticket?.ticketVenue?.serviceName
          ?? activeService?.serviceName
          ?? 'Dịch vụ của bạn',
      }));
    },
    enabled: !!activeServiceId,
    staleTime: 30 * 1000,
  });

  // (Legacy provider services query removed in favor of client-side resolution)

  // ── Mutations ────────────────────────────────────────────────────────────────

  const confirmOrderMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.orders.updateStatus(orderId, '"ACCEPTED"'),
    onSuccess: (_, orderId) => {
      queryClient.setQueryData<OrderRow[]>(
        ['provider-orders', activeServiceId, isHotel],
        old => old?.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o) ?? []
      );
      toast.success('Đã xác nhận đơn hàng');
      setStatusOrder(null);
    },
    onError: () => toast.error('Xác nhận thất bại'),
  });

  const rejectOrderMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.orders.updateStatus(orderId, '"CANCELLED"'),
    onSuccess: (_, orderId) => {
      queryClient.setQueryData<OrderRow[]>(
        ['provider-orders', activeServiceId, isHotel],
        old => old?.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o) ?? []
      );
      toast.success('Đã từ chối đơn hàng');
      setStatusOrder(null);
    },
    onError: () => toast.error('Từ chối thất bại'),
  });

  // ── Computed stats ───────────────────────────────────────────────────────────

  const totalRevenue = useMemo(() =>
    ordersData.reduce((sum, o) => (o.status === 'completed' || o.status === 'confirmed') ? sum + o.amount : sum, 0),
    [ordersData]
  );

  const trendsData = useMemo(() => {
    const map: Record<string, number> = {};
    ordersData.forEach(o => {
      const d = new Date(o.checkIn);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      map[key] = (map[key] || 0) + 1;
    });
    const entries = Object.entries(map).map(([date, bookings]) => ({ date, bookings }));
    return entries.length > 0 ? entries : bookingTrendsData;
  }, [ordersData]);

  const revenueData = useMemo(() => [{
    service: serviceInfo?.name ?? activeService?.serviceName ?? 'Dịch vụ của tôi',
    revenue: totalRevenue,
    bookings: ordersData.length,
  }], [serviceInfo, activeService, totalRevenue, ordersData.length]);

  const stats = useMemo(() => {
    const rating = serviceInfo?.rating != null ? Number(serviceInfo.rating).toFixed(1) : null;
    const reviewCount = serviceInfo?.reviews ?? null;

    return [
      {
        title: isHotel ? 'Số phòng' : 'Số loại vé',
        value: availableItems.length > 0 ? String(availableItems.length) : '—',
        icon: isHotel ? Building2 : Ticket,
        color: 'text-blue-600',
        iconBg: 'bg-blue-50',
        change: null,
        trend: 'neutral' as const,
      },
      {
        title: isHotel ? 'Lượt đặt phòng' : 'Vé đã bán',
        value: String(ordersData.length),
        icon: Calendar,
        color: 'text-green-600',
        iconBg: 'bg-green-50',
        change: null,
        trend: 'neutral' as const,
      },
      {
        title: 'Tổng doanh thu',
        value: formatCurrency(totalRevenue),
        icon: Banknote,
        color: 'text-amber-500',
        iconBg: 'bg-amber-50',
        change: null,
        trend: 'neutral' as const,
      },
      {
        title: 'Đánh giá',
        value: rating ? `${rating}/5` : '—',
        icon: Users,
        color: 'text-purple-600',
        iconBg: 'bg-purple-50',
        change: reviewCount != null ? `${reviewCount} lượt` : null,
        trend: 'neutral' as const,
      },
    ];
  }, [isHotel, availableItems.length, ordersData.length, totalRevenue, serviceInfo]);

  // ── Walk-in submit ───────────────────────────────────────────────────────────

  const handleWalkInSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkIn.itemId) { toast.error('Vui lòng chọn loại dịch vụ!'); return; }

    setIsSubmitting(true);
    try {
      const method = walkIn.paymentMethod === 'CASH' ? 'MOMO' : walkIn.paymentMethod;
      const payload: any = {
        guestPhone: walkIn.phone || '0000000000',
        note: `[Quầy] ${walkIn.name}. ${walkIn.note}`.trim(),
        paymentMethod: method,
        discountIds: walkIn.discountId ? [walkIn.discountId] : [],
        tickets: !isHotel ? [{ id: walkIn.itemId, quantity: walkIn.quantity }] : [],
        rooms: isHotel ? [{
          id: walkIn.itemId,
          quantity: 1,
          checkInDate: walkIn.checkIn ? new Date(walkIn.checkIn).toISOString() : new Date().toISOString(),
          checkOutDate: walkIn.checkOut ? new Date(walkIn.checkOut).toISOString() : new Date().toISOString(),
        }] : [],
      };

      const orderRes: any = await apiClient.orders.create(payload);
      const orderId = orderRes?.orderID ?? orderRes?.id;
      if (!orderId) throw new Error('Không nhận được orderID');

      try { await apiClient.orders.updateStatus(orderId, 'ACCEPTED'); } catch { /* auto-approve best-effort */ }

      if (walkIn.paymentMethod === 'VNPAY') {
        const payRes: any = await apiClient.payments.vnpay.createPaymentV2(orderRes.finalPrice ?? orderRes.totalPrice, String(orderId));
        const url = payRes?.paymentUrl ?? payRes?.payUrl;
        if (typeof url === 'string' && url.startsWith('http')) { window.location.href = url; return; }
      } else if (walkIn.paymentMethod === 'MOMO') {
        const payRes: any = await apiClient.payments.momo.createOrder(orderRes.finalPrice ?? orderRes.totalPrice, String(orderId));
        const url = payRes?.paymentUrl ?? payRes?.payUrl;
        if (typeof url === 'string' && url.startsWith('http')) { window.location.href = url; return; }
      }

      toast.success(isHotel ? 'Tạo đặt phòng thành công!' : 'Bán vé thành công!');
      setShowBookingModal(false);
      queryClient.invalidateQueries({ queryKey: ['provider-orders', activeServiceId, isHotel] });
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [walkIn, isHotel, activeServiceId, queryClient, toast]);

  // ── Services Table Handlers ─────────────────────────────────────────────────

  const handleViewService = useCallback((service: any) => {
    const name = (service.serviceName || '').toLowerCase().replace(/\s+/g, '-');
    const slug = `${service.id}-${name}`;
    navigate(`/destinations/${service.province?.fullName || 'unknown'}/${service.type}/${slug}`);
  }, [navigate]);

  const handleEditService = useCallback((service: any) => {
    navigate(`/provider/my-service?serviceId=${service.id}`);
  }, [navigate]);

  const handleDeleteService = useCallback((service: any) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  }, []);

  const handleToggleServiceStatus = useCallback(async (service: any) => {
    try {
      const next = service.status === 'active' ? 'inactive' : 'active';
      await serviceApi.toggleServiceStatus(service.id, next as any);
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      toast.error('Cập nhật trạng thái thất bại');
    }
  }, [queryClient, toast]);

  // ── Render ───────────────────────────────────────────────────────────────────

  const pageTitle = isHotel ? 'Tổng quan khách sạn' : 'Tổng quan dịch vụ tham quan';
  const createBtnText = isHotel ? 'Đặt phòng tại quầy' : 'Bán vé tại quầy';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeService?.serviceName ?? 'Đang tải...'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={() => setShowBookingModal(true)}
            disabled={!activeServiceId}
            className="text-sm px-4 h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createBtnText}
          </Button>
        </div>
      </div>

      {/* ── Service Switcher ── */}
      {providerServices.length > 1 && (
        <div className="flex flex-wrap gap-2 p-1 bg-muted/40 rounded-2xl border border-border/50">
          {providerServices.map(svc => {
            const active = svc.id === activeServiceId;
            const hotel = svc.serviceType === 'HOTEL';
            return (
              <button
                key={svc.id}
                onClick={() => setActiveServiceId(svc.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${active
                    ? 'bg-background shadow-sm border border-border text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
              >
                {svc.thumbnailUrl ? (
                  <img src={svc.thumbnailUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                ) : hotel ? (
                  <Building2 className="w-4 h-4 shrink-0 text-blue-500" />
                ) : (
                  <Ticket className="w-4 h-4 shrink-0 text-green-500" />
                )}
                <span className="truncate max-w-[140px]">{svc.serviceName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${hotel ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                  {hotel ? 'KS' : 'TQ'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoadingOrders
          ? [0, 1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse border border-border/40">
              <CardContent className="p-5">
                <div className="h-3 bg-muted rounded w-20 mb-3" />
                <div className="h-8 bg-muted rounded w-24 mb-3" />
                <div className="h-5 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))
          : stats.map((stat, i) => {
            const Icon = stat.icon;
            const valueLen = String(stat.value).length;
            const fontSize = valueLen > 15 ? 'text-xl' : valueLen > 10 ? 'text-2xl' : 'text-3xl';
            return (
              <Card key={i} className="border border-border/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-5 flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{stat.title}</p>
                    <div className={`${fontSize} font-semibold leading-tight break-words`}>{stat.value}</div>
                    {stat.change && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
                          {stat.change}
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
          })
        }
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueByServiceChart data={revenueData} />
        </div>
        <div>
          <ProviderDailyTrendsChart data={trendsData} providerType={providerType} />
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <Card className="border border-border/40 shadow-sm">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <CardTitle className="text-lg font-semibold">
            {isHotel ? 'Đặt phòng gần đây' : 'Đặt vé gần đây'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isHotel ? 'Theo dõi đơn đặt phòng' : 'Theo dõi đơn đặt vé'}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoadingOrders ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <OrdersTable
              data={ordersData}
              onViewDetail={setDetailOrder}
              onUpdateStatus={setStatusOrder}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Services Management Table ── */}
      <Card className="border border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4 bg-muted/30 border-b border-border">
          <div>
            <CardTitle className="text-lg font-semibold">Dịch vụ của tôi</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Quản lý và cập nhật dịch vụ</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-sm h-9"
            onClick={() => navigate(`/provider/my-service?type=${providerType}`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm dịch vụ
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoadingServicesList ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <ServicesTable
              data={servicesList}
              onView={handleViewService}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleStatus={handleToggleServiceStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Delete Service Modal ── */}
      {selectedService && (
        <ServiceDeleteModal
          service={selectedService}
          open={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedService(null); }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['provider-services-details'] });
            setShowDeleteModal(false);
            setSelectedService(null);
          }}
        />
      )}

      {/* ── Order Detail Modal ── */}
      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}

      {/* ── Order Status Modal ── */}
      {statusOrder && (
        <OrderStatusModal
          order={statusOrder}
          onClose={() => setStatusOrder(null)}
          onConfirm={() => confirmOrderMutation.mutate(statusOrder.id)}
          onReject={() => rejectOrderMutation.mutate(statusOrder.id)}
        />
      )}

      {/* ── Walk-in Booking Modal ── */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowBookingModal(false)}
        >
          <Card
            className="w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleWalkInSubmit} className="flex flex-col flex-1 min-h-0">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/40 border-b border-border pb-4 flex-shrink-0">
                <CardTitle className="text-lg">
                  {isHotel ? 'Đặt phòng tại quầy' : 'Bán vé tại quầy'}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>

              <CardContent className="pt-5 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tên khách hàng *</Label>
                    <Input
                      required
                      placeholder="Nguyễn Văn A"
                      value={walkIn.name}
                      onChange={e => setWalkInField('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Số điện thoại *</Label>
                    <Input
                      required
                      placeholder="09xxxxxxxx"
                      value={walkIn.phone}
                      onChange={e => setWalkInField('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>{isHotel ? 'Loại phòng *' : 'Loại vé *'}</Label>
                    <select
                      required
                      value={walkIn.itemId}
                      onChange={e => setWalkInField('itemId', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">-- Chọn --</option>
                      {availableItems.map((item: any) => {
                        const id = item.id ?? item.roomID ?? '';
                        const name = item.name ?? item.roomName ?? item.ticketType ?? `#${id}`;
                        const price = item.price ?? item.pricePerNight ?? 0;
                        return (
                          <option key={id} value={id}>
                            {name} — {formatCurrency(price)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Số lượng</Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={walkIn.quantity}
                      onChange={e => setWalkInField('quantity', Number(e.target.value))}
                      disabled={isHotel}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{isHotel ? 'Nhận phòng *' : 'Ngày tham quan *'}</Label>
                    <Input
                      type="date"
                      required
                      value={walkIn.checkIn}
                      onChange={e => setWalkInField('checkIn', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{isHotel ? 'Trả phòng *' : 'Khung giờ'}</Label>
                    <Input
                      type={isHotel ? 'date' : 'time'}
                      required={isHotel}
                      value={walkIn.checkOut}
                      onChange={e => setWalkInField('checkOut', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Thanh toán</Label>
                    <select
                      value={walkIn.paymentMethod}
                      onChange={e => setWalkInField('paymentMethod', e.target.value as WalkInForm['paymentMethod'])}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="MOMO">MoMo</option>
                      <option value="VNPAY">VNPay</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mã giảm giá</Label>
                    <select
                      value={walkIn.discountId}
                      onChange={e => setWalkInField('discountId', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Không áp dụng</option>
                      {availableDiscounts.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.code} —{' '}
                          {d.discountType === 'Percentage'
                            ? `${d.percentage}%`
                            : formatCurrency(d.fixedPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Ghi chú</Label>
                  <Input
                    placeholder="Yêu cầu đặc biệt..."
                    value={walkIn.note}
                    onChange={e => setWalkInField('note', e.target.value)}
                  />
                </div>
              </CardContent>

              <div className="flex gap-3 p-5 bg-muted/40 border-t border-border flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBookingModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xử lý...</>
                    : <><Plus className="w-4 h-4 mr-2" />{isHotel ? 'Lưu đặt phòng' : 'Lưu đơn vé'}</>
                  }
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
