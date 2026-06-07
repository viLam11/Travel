import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Receipt, Clock, CheckCircle, XCircle, 
  Calendar, Search, Loader2, ChevronRight, 
  Phone, Download, CreditCard,
  ArrowDownLeft,
  Filter,
  BarChart3,
  X,
  MapPin,
  Tag
} from 'lucide-react';
import apiClient from "@/services/apiClient";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- Interfaces matching original BE behavior ---
interface Order {
  orderID: string;
  createdAt: string;
  status: 'PENDING' | 'SUCCESS' | 'CANCELLED' | 'REFUNDED';
  totalPrice: number;
  finalPrice: number;
  guestPhone: string;
  note: string;
}

interface OrderedTicket {
  id: string;
  amount: number;
  price: number;
  validStart: string;
  validEnd: string;
  order: Order;
  ticket?: any; 
}

const UserTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'CANCELLED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const { data: dataList = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['userTransactions'],
    queryFn: async () => {
      const data: any = await apiClient.orders.getAll(); 
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.content) {
        list = data.content;
      } else if (data?.orders) {
        list = data.orders;
      }
      return list.filter(item => item && (item.order || item.orderID));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });

  const filteredTransactions = useMemo(() => {
    return dataList.filter(item => {
      const order = item.order || item; 
      const tourName = item.ticket?.ticketVenue?.serviceName || item.serviceName || 'Vé tham quan';
      
      const matchesSearch = 
        (order.orderID || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.guestPhone || '').includes(searchTerm);
        
      const statusValue = (order.status || 'PENDING').toUpperCase();
      const matchesStatus = selectedStatus === 'ALL' || statusValue === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [dataList, searchTerm, selectedStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusConfig = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    const configs: Record<string, any> = {
      SUCCESS: { 
        icon: CheckCircle, 
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
        label: 'Thành công', 
        iconColor: 'text-emerald-500',
        glow: 'shadow-emerald-100'
      },
      PENDING: { 
        icon: Clock, 
        bg: 'bg-amber-50 text-amber-700 border-amber-100', 
        label: 'Đang xử lý', 
        iconColor: 'text-amber-500',
        glow: 'shadow-amber-100'
      },
      CANCELLED: { 
        icon: XCircle, 
        bg: 'bg-rose-50 text-rose-700 border-rose-100', 
        label: 'Đã hủy', 
        iconColor: 'text-rose-500',
        glow: 'shadow-rose-100'
      },
    };
    return configs[s] || configs.PENDING;
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const downloadReceipt = (item: any) => {
    const order = item.order || item;
    const tickets = order.orderedTickets || (item.ticket ? [item] : []);
    const rooms = order.orderedRooms || (item.room ? [item] : []);
    const orderID = order.orderID || 'N/A';
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A';
    const totalPrice = order.totalPrice || 0;
    const finalPrice = order.finalPrice || totalPrice;
    const discount = order.discountPrice || (totalPrice - finalPrice) || 0;
    const phone = order.guestPhone || 'N/A';
    const note = order.note || 'N/A';
    const statusConfig = getStatusConfig(order.status);

    let txt = `=========================================\n`;
    txt += `            HOÁ ĐƠN THANH TOÁN            \n`;
    txt += `                TRAVELLO                 \n`;
    txt += `=========================================\n\n`;
    txt += `Mã đơn hàng: #${orderID.toUpperCase()}\n`;
    txt += `Ngày đặt:    ${dateStr}\n`;
    txt += `Trạng thái:  ${statusConfig.label.toUpperCase()}\n`;
    txt += `Điện thoại:  ${phone}\n`;
    txt += `Ghi chú:     ${note}\n\n`;
    txt += `-----------------------------------------\n`;
    txt += `CHI TIẾT DỊCH VỤ:\n`;

    if (tickets.length > 0) {
      tickets.forEach((t: any, idx: number) => {
        const name = t.ticket?.ticketVenue?.serviceName || t.serviceName || 'Vé tham quan';
        const ticketName = t.ticket?.name || '';
        const amount = t.amount || 1;
        const price = t.price || 0;
        const start = t.validStart ? new Date(t.validStart).toLocaleDateString('vi-VN') : '';
        const end = t.validEnd ? new Date(t.validEnd).toLocaleDateString('vi-VN') : '';
        txt += `${idx + 1}. ${name}${ticketName ? ` - ${ticketName}` : ''}\n`;
        txt += `   Số lượng: ${amount} | Đơn giá: ${formatVND(price)}\n`;
        if (start || end) {
          txt += `   Hạn dùng: ${start} - ${end}\n`;
        }
      });
    }

    if (rooms.length > 0) {
      rooms.forEach((r: any, idx: number) => {
        const hotelName = r.room?.hotel?.serviceName || 'Khách sạn';
        const roomName = r.room?.name || 'Phòng';
        const amount = r.amount || 1;
        const price = r.price || 0;
        const start = r.startDate ? new Date(r.startDate).toLocaleDateString('vi-VN') : '';
        const end = r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : '';
        txt += `${idx + 1}. ${hotelName} - ${roomName}\n`;
        txt += `   Số lượng: ${amount} | Đơn giá: ${formatVND(price)}\n`;
        if (start || end) {
          txt += `   Thời gian: ${start} - ${end}\n`;
        }
      });
    }

    txt += `-----------------------------------------\n`;
    txt += `Tạm tính:    ${formatVND(totalPrice)}\n`;
    txt += `Giảm giá:    ${formatVND(discount)}\n`;
    txt += `Thành tiền:  ${formatVND(finalPrice)}\n`;
    txt += `=========================================\n`;
    txt += `Cảm ơn quý khách đã tin tưởng Travello!\n`;
    txt += `Chúc quý khách có một chuyến đi tuyệt vời!\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Travello-Receipt-${orderID.substring(0, 8).toUpperCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Hóa đơn đã được tải xuống!');
  };

  const handlePayAgain = async (item: any) => {
    const order = item.order || item;
    const orderID = order.orderID;
    const finalPrice = order.finalPrice || order.totalPrice || item.price || 0;
    
    if (!orderID) {
      toast.error('Không tìm thấy mã đơn hàng');
      return;
    }
    
    setIsPaying(true);
    const loadingToast = toast.loading('Đang chuẩn bị thanh toán lại...');
    try {
      const response = await apiClient.payments.vnpay.createPaymentV2(finalPrice, orderID);
      toast.dismiss(loadingToast);
      
      const payUrl = response?.paymentUrl || response?.order_url || response?.payUrl || response;
      if (typeof payUrl === 'string' && payUrl.startsWith('http')) {
        window.location.href = payUrl;
      } else {
        toast.error('Không tìm thấy link thanh toán VNPay');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Lỗi khi khởi tạo thanh toán. Vui lòng thử lại sau.');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-20 bg-gray-50 rounded-2xl mb-10 animate-pulse"></div>
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const totalSpent = filteredTransactions.reduce((sum, item) => sum + (item.price || item.totalPrice || item.order?.finalPrice || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-orange-500 rounded-full" />
          <h1 className="text-3xl font-black text-gray-900 mb-1 lg:text-4xl">Giao dịch</h1>
          <p className="text-sm text-gray-500 font-medium">Theo dõi các hoạt động thanh toán của bạn</p>
        </div>

        <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-2xl">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tổng giá trị</p>
            <p className="text-xl font-black text-gray-900">{formatVND(totalSpent)}</p>
          </div>
        </div>
      </div>

      {/* Modern Search & Tabs */}
      <div className="mb-10 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, dịch vụ hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-50/50 focus:border-orange-500 transition-all text-gray-700 font-semibold"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'SUCCESS', label: 'Thành công' },
              { value: 'PENDING', label: 'Chờ duyệt' },
              { value: 'CANCELLED', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform active:scale-95 cursor-pointer ${
                  selectedStatus === tab.value 
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors">
            <Filter className="w-4 h-4" />
            Lọc thêm
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="grid gap-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-orange-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy giao dịch</h3>
            <p className="text-sm text-gray-400">Dữ liệu hiện trống hoặc tiêu chí lọc không khớp</p>
          </div>
        ) : (
          <>
            {currentItems.map((item) => {
              const order = item.order || item;
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              const serviceName = item.ticket?.ticketVenue?.serviceName || item.serviceName || 'Vé tham quan';
              const price = item.price || item.totalPrice || order.finalPrice || 0;

              return (
                <div key={item.id || order.orderID} className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-2xl hover:shadow-orange-100/30 hover:-translate-y-0.5 box-border">
                  <div className="flex items-start gap-4 flex-col sm:flex-row">
                    {/* Status Indicator Area */}
                    <div className="flex sm:flex-col items-center gap-3 shrink-0">
                       <div className={`w-12 h-12 rounded-2xl ${status.bg} flex items-center justify-center border transition-all ${status.glow} shadow-lg`}>
                          <StatusIcon className={`w-6 h-6 ${status.iconColor}`} />
                        </div>
                        <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                        <div className="bg-orange-50 p-2 rounded-xl sm:hidden">
                          <ArrowDownLeft className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                            {serviceName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                             <span className="flex items-center gap-1">
                               <Receipt className="w-3.5 h-3.5"/> 
                               #{ (order.orderID || 'N/A').substring(0, 8).toUpperCase() }
                             </span>
                             <span className="flex items-center gap-1">
                               <Calendar className="w-3.5 h-3.5"/> 
                               { order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A' }
                             </span>
                             {order.guestPhone && (
                               <span className="flex items-center gap-1">
                                 <Phone className="w-3.5 h-3.5"/> {order.guestPhone}
                               </span>
                             )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex sm:block justify-between items-center">
                          <p className="text-xl font-black text-gray-900">{formatVND(price)}</p>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">SL: {item.amount || 1}</span>
                        </div>
                      </div>

                      {/* Secondary Detail Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-orange-50/30 rounded-2xl border border-orange-100/30">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${status.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.iconColor.replace('text', 'bg')}`} />
                            {status.label}
                          </div>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 underline decoration-orange-200 decoration-2 underline-offset-4">
                            <CreditCard className="w-3.5 h-3.5" /> 
                            Ví thanh toán
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {order.status === 'PENDING' && (
                            <button 
                              onClick={() => handlePayAgain(item)}
                              disabled={isPaying}
                              className="flex items-center gap-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm border border-orange-50 disabled:opacity-50"
                            >
                              Thanh toán tiếp
                            </button>
                          )}
                          <button 
                            onClick={() => downloadReceipt(item)}
                            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer bg-white rounded-lg shadow-sm border border-gray-100" 
                            title="Tải hóa đơn"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setSelectedTransaction(item)}
                            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline px-4 py-2 bg-white rounded-xl transition-all cursor-pointer shadow-sm border border-orange-50"
                          >
                            XEM CHI TIẾT <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-orange-600 text-white shadow-xl shadow-orange-100'
                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modern Detailed Modal */}
      {selectedTransaction && (() => {
        const order = selectedTransaction.order || selectedTransaction;
        const status = getStatusConfig(order.status);
        const StatusIcon = status.icon;
        const tickets = order.orderedTickets || (selectedTransaction.ticket ? [selectedTransaction] : []);
        const rooms = order.orderedRooms || (selectedTransaction.room ? [selectedTransaction] : []);
        const orderID = order.orderID || 'N/A';
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A';
        const totalPrice = order.totalPrice || 0;
        const finalPrice = order.finalPrice || totalPrice;
        const discount = order.discountPrice || (totalPrice - finalPrice) || 0;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 p-2.5 rounded-xl">
                    <Receipt className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Chi tiết giao dịch</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">#{orderID.toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Status and Summary Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-50/20 p-4 rounded-2xl border border-orange-100/30">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngày giao dịch</span>
                    <p className="text-sm font-bold text-gray-700">{dateStr}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm uppercase ${status.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${status.iconColor}`} />
                    {status.label}
                  </div>
                </div>

                {/* Contact & Note Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Số điện thoại liên hệ</span>
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-orange-500" />
                      {order.guestPhone || 'Chưa cung cấp'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Ghi chú từ khách hàng</span>
                    <span className="text-xs font-semibold text-gray-600 italic block">
                      "{order.note || 'Không có ghi chú'}"
                    </span>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh sách dịch vụ</h4>
                  
                  {/* Tickets */}
                  {tickets.map((t: any, idx: number) => {
                    const name = t.ticket?.ticketVenue?.serviceName || t.serviceName || 'Vé tham quan';
                    const ticketName = t.ticket?.name || '';
                    const venueLocation = t.ticket?.ticketVenue?.province?.name || '';
                    
                    return (
                      <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                        <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 shrink-0">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-gray-900 text-sm truncate">{name}</h5>
                          {ticketName && <p className="text-xs text-gray-500 font-medium mt-0.5">{ticketName}</p>}
                          {venueLocation && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1.5">
                              <MapPin className="w-3 h-3 text-orange-400" />
                              {venueLocation}
                            </span>
                          )}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-xs">
                            <span className="text-gray-400 font-medium">Hạn sử dụng: {t.validStart ? new Date(t.validStart).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            <span className="font-bold text-gray-800">SL: {t.amount || 1} x {formatVND(t.price || 0)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Rooms */}
                  {rooms.map((r: any, idx: number) => {
                    const name = r.room?.hotel?.serviceName || 'Khách sạn';
                    const roomName = r.room?.name || 'Phòng';
                    const venueLocation = r.room?.hotel?.province?.name || '';

                    return (
                      <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                        <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-gray-900 text-sm truncate">{name}</h5>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{roomName}</p>
                          {venueLocation && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1.5">
                              <MapPin className="w-3 h-3 text-orange-400" />
                              {venueLocation}
                            </span>
                          )}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-xs">
                            <span className="text-gray-400 font-medium">Từ: {r.startDate ? new Date(r.startDate).toLocaleDateString('vi-VN') : 'N/A'} - Đến: {r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            <span className="font-bold text-gray-800">SL: {r.amount || 1} x {formatVND(r.price || 0)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price calculations */}
                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Tạm tính</span>
                    <span className="text-gray-800 font-bold">{formatVND(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Giảm giá</span>
                    <span className="text-rose-500 font-bold">-{formatVND(discount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="text-gray-800 font-bold">Tổng thanh toán</span>
                    <span className="text-xl font-black text-gray-950">{formatVND(finalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadReceipt(selectedTransaction)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 font-bold text-sm border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Tải hóa đơn
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handlePayAgain(selectedTransaction)}
                      disabled={isPaying}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 text-white font-bold text-sm rounded-xl hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Thanh toán tiếp <ArrowDownLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="px-5 py-2.5 bg-gray-950 text-white font-bold text-sm rounded-xl hover:bg-gray-900 transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Decorative summary footer */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="mt-12 py-10 border-t border-gray-100 flex flex-col items-center">
            <p className="text-xs text-gray-400 font-medium opacity-50 mb-2">Đã hiển thị tất cả giao dịch trong lịch sử</p>
            <div className="bg-orange-100 w-12 h-1 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default UserTransactionsPage;