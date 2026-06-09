import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronRight,
  Trophy,
  Search,
  Package,
  TrendingUp,
  Tag,
  MessageCircle,
  Ticket,
  BedDouble,
  CreditCard,
  Percent,
} from 'lucide-react';
import apiClient from '@/services/apiClient';

// Real API response types
interface OrderedTicket {
  ticketName: string;
  ticketVenueName: string;
  ticketVenueThumbnail: string;
  amount: number;
  price: number;
  validStart: string;
  validEnd: string;
}

interface OrderedRoom {
  roomName?: string;
  hotelName?: string;
  hotelThumbnail?: string;
  thumbnail?: string;
  amount?: number;
  price?: number;
  startDate?: string;
  endDate?: string;
  checkIn?: string;
  checkOut?: string;
  [key: string]: any;
}

interface DiscountItem {
  name: string;
  code: string;
}

interface Order {
  orderID: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  totalPrice: number;
  discountPrice: number;
  finalPrice: number;
  guestPhone: string;
  orderedTickets: OrderedTicket[];
  orderedRooms: OrderedRoom[];
  discountList: DiscountItem[];
}

interface PagedResponse {
  content: Order[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const STATUS_MAP: Record<string, { label: string; bg: string; dot: string }> = {
  PENDING:   { label: 'Chờ xác nhận', bg: 'bg-amber-50 text-amber-700 border-amber-100',   dot: 'bg-amber-500' },
  ACCEPTED:  { label: 'Đã xác nhận',  bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' },
  SUCCESS:   { label: 'Hoàn thành',   bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  COMPLETED: { label: 'Hoàn thành',   bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Đã hủy',       bg: 'bg-rose-50 text-rose-700 border-rose-100',       dot: 'bg-rose-500' },
  CANCELED:  { label: 'Đã hủy',       bg: 'bg-rose-50 text-rose-700 border-rose-100',       dot: 'bg-rose-500' },
  FAILED:    { label: 'Thất bại',     bg: 'bg-rose-50 text-rose-700 border-rose-100',       dot: 'bg-rose-500' },
};

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  MOMO:  { label: 'MoMo',  cls: 'bg-pink-100 text-pink-700' },
  VNPAY: { label: 'VNPay', cls: 'bg-blue-100 text-blue-700' },
  CASH:  { label: 'Tiền mặt', cls: 'bg-gray-100 text-gray-600' },
};

const PAGE_SIZE = 8;

const UserBookingsPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<PagedResponse>({
    queryKey: ['userOrders', page],
    queryFn: async () => {
      const res = await apiClient.orders.getMyOrders(page, PAGE_SIZE);
      // Normalize: the endpoint may return the paged object directly or nested
      if (res?.content) return res as PagedResponse;
      if (res?.data?.content) return res.data as PagedResponse;
      // Fallback: treat array as single page
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      return { content: list, pageNo: 0, pageSize: PAGE_SIZE, totalElements: list.length, totalPages: 1, last: true };
    },
    staleTime: 2 * 60 * 1000,
  });

  const allOrders: Order[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filteredOrders = allOrders.filter(order => {
    const status = order.status?.toUpperCase() ?? '';
    if (selectedStatus !== 'all' && status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const serviceName = getServiceName(order).toLowerCase();
      const code = order.orderID?.toLowerCase() ?? '';
      return serviceName.includes(q) || code.includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN').format(n ?? 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đơn đặt của tôi</h1>
          </div>
          <p className="text-gray-500">Quản lý và theo dõi các hành trình của bạn</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all',       label: 'Tất cả' },
            { value: 'PENDING',   label: 'Chờ xác nhận' },
            { value: 'ACCEPTED',  label: 'Đã xác nhận' },
            { value: 'SUCCESS',   label: 'Hoàn thành' },
            { value: 'CANCELLED', label: 'Đã hủy' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setSelectedStatus(tab.value); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 cursor-pointer ${
                selectedStatus === tab.value
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 -translate-y-0.5'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {!isLoading && allOrders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng đơn',      value: data?.totalElements ?? allOrders.length, color: 'text-gray-500' },
            { label: 'Chờ xác nhận',  value: allOrders.filter(o => o.status === 'PENDING').length,   color: 'text-amber-500' },
            { label: 'Hoàn thành',    value: allOrders.filter(o => o.status === 'SUCCESS' || o.status === 'COMPLETED').length, color: 'text-emerald-500' },
            { label: 'Đã hủy',        value: allOrders.filter(o => o.status === 'CANCELLED' || o.status === 'CANCELED').length, color: 'text-rose-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${stat.color}`}>{stat.label}</p>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm theo tên dịch vụ hoặc mã đơn hàng..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-50/50 focus:border-orange-500 transition-all text-gray-700 font-medium"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredOrders.length === 0 ? (
        <EmptyState navigate={navigate} />
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order.orderID} order={order} navigate={navigate} formatDate={formatDate} formatPrice={formatPrice} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    page === i
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
                      : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer stats */}
      {!isLoading && allOrders.length > 0 && (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-100/50 shadow-sm">
            <Trophy className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-2xl font-black text-gray-800">{data?.totalElements ?? allOrders.length}</p>
            <p className="text-sm text-gray-500 font-medium">Tổng chuyến đi</p>
          </div>
          <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-100/50 shadow-sm">
            <TrendingUp className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-2xl font-black text-gray-800">
              {allOrders.filter(o => o.status === 'SUCCESS' || o.status === 'COMPLETED').length}
            </p>
            <p className="text-sm text-gray-500 font-medium">Đã hoàn thành</p>
          </div>
          <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-100/50 shadow-sm">
            <Tag className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-2xl font-black text-gray-800">
              {new Intl.NumberFormat('vi-VN').format(allOrders.reduce((s, o) => s + (o.finalPrice ?? 0), 0))}
            </p>
            <p className="text-sm text-gray-500 font-medium">Tổng đã chi (VNĐ)</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── helpers ────────────────────────────────────────────────────────────────

function getServiceName(order: Order): string {
  if (order.orderedTickets?.length) return order.orderedTickets[0].ticketVenueName || order.orderedTickets[0].ticketName;
  if (order.orderedRooms?.length) return (order.orderedRooms[0] as any).hotelName || (order.orderedRooms[0] as any).roomName || 'Phòng khách sạn';
  return 'Dịch vụ du lịch';
}

function getThumbnail(order: Order): string {
  if (order.orderedTickets?.length) return order.orderedTickets[0].ticketVenueThumbnail || '';
  if (order.orderedRooms?.length) return (order.orderedRooms[0] as any).hotelThumbnail || (order.orderedRooms[0] as any).thumbnail || '';
  return '';
}

function getDateRange(order: Order): { start: string; end: string } {
  if (order.orderedTickets?.length) {
    return { start: order.orderedTickets[0].validStart, end: order.orderedTickets[0].validEnd };
  }
  if (order.orderedRooms?.length) {
    const r = order.orderedRooms[0] as any;
    return { start: r.startDate || r.checkIn || '', end: r.endDate || r.checkOut || '' };
  }
  return { start: order.createdAt, end: '' };
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface CardProps {
  order: Order;
  navigate: ReturnType<typeof useNavigate>;
  formatDate: (s: string) => string;
  formatPrice: (n: number) => string;
}

const OrderCard: React.FC<CardProps> = ({ order, navigate, formatDate, formatPrice }) => {
  const statusCfg = STATUS_MAP[order.status?.toUpperCase()] ?? STATUS_MAP.PENDING;
  const paymentCfg = PAYMENT_BADGE[order.paymentMethod?.toUpperCase()] ?? { label: order.paymentMethod, cls: 'bg-gray-100 text-gray-600' };
  const thumbnail = getThumbnail(order);
  const serviceName = getServiceName(order);
  const dateRange = getDateRange(order);
  const hasDiscount = order.discountPrice > 0;
  const isTicket = order.orderedTickets?.length > 0;
  const isCancelled = order.status === 'CANCELLED' || order.status === 'CANCELED';

  return (
    <div className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-orange-100/40 hover:-translate-y-1">
      <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50/40 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-orange-100/50 transition-colors pointer-events-none" />

      <div className="flex flex-row">
        {/* Thumbnail */}
        <div className="relative w-28 md:w-36 shrink-0 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={serviceName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-orange-50 flex items-center justify-center min-h-[120px]">
              {isTicket
                ? <Ticket className="w-8 h-8 text-orange-200" />
                : <BedDouble className="w-8 h-8 text-orange-200" />}
            </div>
          )}
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-600/85 backdrop-blur-md text-white text-[9px] font-bold rounded-full uppercase tracking-widest leading-tight">
            {isTicket ? 'Vé' : 'KS'}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col justify-between p-3.5 md:p-4">
          {/* Top row: status + payment + code */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusCfg.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${paymentCfg.cls}`}>
              <CreditCard className="w-2.5 h-2.5" />
              {paymentCfg.label}
            </span>
            <span className="ml-auto text-[10px] font-mono text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded">
              #{order.orderID?.substring(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Service name */}
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-1">
            {serviceName}
          </h3>

          {/* Tickets / Rooms breakdown */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {order.orderedTickets?.map((t, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-[11px] font-semibold rounded-md">
                <Ticket className="w-2.5 h-2.5" />
                {t.ticketName} × {t.amount}
              </span>
            ))}
            {order.orderedRooms?.map((r: any, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md">
                <BedDouble className="w-2.5 h-2.5" />
                {r.roomName || 'Phòng'} × {r.amount ?? 1}
              </span>
            ))}
          </div>

          {/* Dates (compact inline) */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-orange-400" />
              <span className="font-semibold text-gray-700">{formatDate(dateRange.start)}</span>
            </span>
            {dateRange.end && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-300" />
                <span className="font-semibold text-gray-700">{formatDate(dateRange.end)}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-400">
              Đặt: {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Discount codes */}
          {order.discountList?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {order.discountList.map((d, idx) => (
                <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold rounded">
                  <Percent className="w-2.5 h-2.5" />
                  {d.code}
                </span>
              ))}
            </div>
          )}

          {/* Price + Chat button */}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-50">
            <div>
              {hasDiscount ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-orange-600">
                    {formatPrice(order.finalPrice)}₫
                  </span>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(order.totalPrice)}₫</span>
                </div>
              ) : (
                <span className="text-base font-black text-orange-600">
                  {formatPrice(order.finalPrice || order.totalPrice)}₫
                </span>
              )}
              {hasDiscount && (
                <p className="text-[10px] text-green-600 font-semibold">Tiết kiệm {formatPrice(order.discountPrice)}₫</p>
              )}
            </div>

            {!isCancelled && (
              <button
                onClick={() => navigate(`/user/messages?bookingId=${order.orderID}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-orange-200 text-orange-600 rounded-lg font-bold text-xs hover:bg-orange-50 hover:border-orange-400 transition-all shadow-sm cursor-pointer"
                title="Chat với nhà cung cấp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid gap-6 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-52 h-48 bg-gray-100" />
        <div className="flex-1 p-6 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 bg-gray-100 rounded-full w-28" />
            <div className="h-6 bg-gray-100 rounded-full w-16" />
          </div>
          <div className="h-7 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-4 pt-4 border-t border-gray-50">
            <div className="h-8 bg-gray-100 rounded-xl w-24" />
            <div className="ml-auto h-10 bg-gray-200 rounded-xl w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => (
  <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
    <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
      <Calendar className="w-10 h-10 text-orange-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn đặt nào</h3>
    <p className="text-gray-500 max-w-xs mx-auto mb-8">Bạn chưa có đơn đặt nào. Hãy bắt đầu khám phá và đặt dịch vụ nhé!</p>
    <button
      onClick={() => navigate('/destinations')}
      className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 cursor-pointer"
    >
      Khám phá ngay
    </button>
  </div>
);

export default UserBookingsPage;
