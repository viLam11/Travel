import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';
import { serviceApi } from '@/api/serviceApi';
import type { Service } from '@/types/service.types';
import { ROUTES } from '@/constants/routes';
import toast from 'react-hot-toast';
import {
  Building2, Ticket, Briefcase, Calendar, Banknote,
  Plus, Star, MapPin,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  guest: string;
  checkIn: string;
  amount: number;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const toStatus = (raw: string): string => {
  const s = (raw || '').toUpperCase();
  if (s === 'SUCCESS' || s === 'COMPLETED') return 'completed';
  if (s === 'ACCEPTED' || s === 'CONFIRMED') return 'confirmed';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'FAILED') return 'cancelled';
  return 'pending';
};

const STATUS_LABEL: Record<string, string> = {
  pending:   'Chờ xử lý',
  confirmed: 'Xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};
const STATUS_CLS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};
const SVC_STATUS_LABEL: Record<string, string> = {
  active:   'Hoạt động',
  inactive: 'Tạm dừng',
  pending:  'Chờ duyệt',
  rejected: 'Từ chối',
};
const SVC_STATUS_CLS: Record<string, string> = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  pending:  'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { currentUser, isLoading: isAuthLoading } = useAuthContext();

  const [services, setServices]               = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [orders, setOrders]                   = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders]     = useState(false);
  const [activeId, setActiveId]               = useState('');

  const redirectDone = useRef(false);

  // Redirect check — once after auth resolves
  useEffect(() => {
    if (isAuthLoading || redirectDone.current) return;
    redirectDone.current = true;
    const role = (currentUser?.user?.role ?? '').toLowerCase();
    const isProvider = role === 'provider' || role.startsWith('provider_');
    if (isProvider && !currentUser?.user?.hasService) {
      navigate(ROUTES.PROVIDER_MY_SERVICE, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading]);

  // Fetch provider services once on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingServices(true);
    serviceApi
      .getProviderServices()
      .then(res => {
        if (!cancelled) setServices(res.services ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Không thể tải danh sách dịch vụ');
      })
      .finally(() => {
        if (!cancelled) setLoadingServices(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Derived active service — computed inline, no state needed
  const effectiveId = activeId || services[0]?.id || '';
  const activeSvc   = services.find(s => s.id === effectiveId) ?? services[0];
  const isHotel     = (activeSvc?.type ?? '') === 'hotel';

  // Fetch orders whenever the active service changes
  useEffect(() => {
    if (!effectiveId) return;
    let cancelled = false;
    setLoadingOrders(true);
    setOrders([]);

    const call = isHotel
      ? apiClient.orders.getHotelOrders(effectiveId)
      : apiClient.orders.getTicketVenueOrders(effectiveId);

    call
      .then((res: any) => {
        if (cancelled) return;
        const list: any[] = res?.content ?? (Array.isArray(res) ? res : []);
        setOrders(
          list.map((o: any): OrderRow => ({
            id:      String(o.orderID ?? o.id ?? ''),
            guest:   o.user?.fullname ?? o.guestPhone ?? `Khách #${o.orderID ?? o.id}`,
            checkIn: o.orderedRooms?.[0]?.startDate ?? o.createdAt ?? '',
            amount:  Number(o.finalPrice ?? o.totalPrice ?? 0),
            status:  toStatus(String(o.status ?? '')),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOrders(false);
      });

    return () => { cancelled = true; };
  // effectiveId and isHotel are primitives — safe as deps
  }, [effectiveId, isHotel]);

  // Stats derived from orders
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const revenue = orders.reduce(
    (s, o) => (o.status === 'completed' || o.status === 'confirmed' ? s + o.amount : s),
    0
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isHotel ? 'Tổng quan khách sạn' : 'Tổng quan dịch vụ tham quan'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeSvc?.serviceName ?? (loadingServices ? 'Đang tải...' : 'Chưa có dịch vụ')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors shrink-0"
          onClick={() => navigate('/provider/my-service')}
        >
          <Plus className="w-4 h-4" />
          Thêm dịch vụ
        </button>
      </div>

      {/* Service Switcher */}
      {services.length > 1 && (
        <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/50">
          {services.map(svc => {
            const isActive = svc.id === effectiveId;
            const hotel    = svc.type === 'hotel';
            return (
              <button
                key={svc.id}
                onClick={() => setActiveId(svc.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-background shadow-sm border border-border text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                {hotel
                  ? <Building2 className="w-4 h-4 shrink-0 text-blue-500" />
                  : <Ticket    className="w-4 h-4 shrink-0 text-green-500" />}
                <span className="truncate max-w-[130px]">{svc.serviceName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Dịch vụ',
            value: loadingServices ? '…' : String(services.length),
            Icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            title: isHotel ? 'Lượt đặt phòng' : 'Lượt đặt vé',
            value: loadingOrders ? '…' : String(orders.length),
            Icon: Calendar, color: 'text-green-600', bg: 'bg-green-50',
          },
          {
            title: 'Chờ xử lý',
            value: loadingOrders ? '…' : String(pendingCount),
            Icon: isHotel ? Building2 : Ticket, color: 'text-amber-500', bg: 'bg-amber-50',
          },
          {
            title: 'Doanh thu',
            value: loadingOrders ? '…' : fmtCurrency(revenue),
            Icon: Banknote, color: 'text-purple-600', bg: 'bg-purple-50',
          },
        ].map(({ title, value, Icon, color, bg }, i) => (
          <div key={i} className="border border-border/40 shadow-sm rounded-xl bg-card">
            <div className="p-5 flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">
                  {title}
                </p>
                <p className="text-2xl font-semibold leading-tight break-words">{value}</p>
              </div>
              <div className={`p-2.5 ${bg} rounded-xl shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="border border-border/40 shadow-sm rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-muted/20 border-b border-border">
          <h2 className="text-base font-semibold">
            {isHotel ? 'Đặt phòng gần đây' : 'Đặt vé gần đây'}
          </h2>
          <span className="text-xs text-muted-foreground">{orders.length} đơn</span>
        </div>

        {loadingOrders ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chưa có đơn đặt nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {['Mã đơn', 'Khách hàng', 'Ngày nhận', 'Tổng tiền', 'Trạng thái'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 20).map(o => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3">{o.guest}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {o.checkIn ? new Date(o.checkIn).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{fmtCurrency(o.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLS[o.status] ?? ''}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Services */}
      <div className="border border-border/40 shadow-sm rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-muted/20 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">Dịch vụ của tôi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loadingServices ? 'Đang tải...' : `${services.length} dịch vụ`}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
            onClick={() => navigate('/provider/my-service')}
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm
          </button>
        </div>

        {loadingServices ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải dịch vụ...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chưa có dịch vụ nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {['Dịch vụ', 'Loại', 'Trạng thái', 'Lượt đặt', 'Đánh giá'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map(svc => {
                  const statusKey = (svc.status ?? 'inactive').toLowerCase();
                  return (
                    <tr key={svc.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {svc.thumbnailUrl ? (
                            <img
                              src={svc.thumbnailUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Briefcase className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{svc.serviceName}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{svc.province?.fullName || ''}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${svc.type === 'hotel' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {svc.type === 'hotel' ? 'Khách sạn' : 'Vé tham quan'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${SVC_STATUS_CLS[statusKey] ?? SVC_STATUS_CLS.inactive}`}>
                          {SVC_STATUS_LABEL[statusKey] ?? 'Không xác định'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{svc.bookingCount ?? 0}</td>
                      <td className="px-4 py-3">
                        {svc.rating != null ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{svc.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
