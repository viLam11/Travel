import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, Clock, CheckCircle, XCircle, 
  Calendar, Search, Loader2, ChevronRight, 
  Phone, Download, CreditCard,
  ArrowDownLeft,
  Filter,
  BarChart3
} from 'lucide-react';
import apiClient from "@/services/apiClient";
import { useNavigate } from 'react-router-dom';

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
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'CANCELLED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data: any = await apiClient.orders.getAll(); 
        console.log("Transactions data:", data);
        
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data?.content) {
          list = data.content;
        } else if (data?.orders) {
          list = data.orders;
        }
        
        setDataList(list.filter(item => item && (item.order || item.orderID)));
      } catch (error) {
        console.error("Lỗi fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
         <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
         <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full animate-pulse" />
      </div>
      <p className="mt-6 text-gray-500 font-bold tracking-wide animate-pulse uppercase text-xs">Đang lấy dữ liệu giao dịch...</p>
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
              const tourId = item.ticket?.ticketVenue?.id || item.serviceID;
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
                          {(status.label === 'Thành công') && (
                            <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer bg-white rounded-lg shadow-sm" title="Tải hóa đơn">
                              <Download className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => tourId && navigate(`/service/${tourId}`)}
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
                  onClick={() => handlePageChange(currentPage + totalPages > 1 ? totalPages : 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current cursor-pointer"
                  style={{ transform: currentPage === totalPages ? 'none' : '' }}
                  onClickCapture={() => { if(currentPage < totalPages) handlePageChange(currentPage + 1); }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

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