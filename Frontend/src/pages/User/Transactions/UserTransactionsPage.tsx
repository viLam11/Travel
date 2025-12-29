// // src/pages/User/Transactions/UserTransactionsPage.tsx
// import React, { useState } from 'react';
// import { 
//   Receipt, 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   Calendar,
//   CreditCard,
//   Download,
//   Search
// } from 'lucide-react';

// interface Transaction {
//   id: string;
//   bookingCode: string;
//   serviceName: string;
//   date: string;
//   amount: number;
//   status: 'pending' | 'completed' | 'failed' | 'refunded';
//   paymentMethod: 'credit_card' | 'bank_transfer' | 'e_wallet';
//   type: 'payment' | 'refund';
// }

// const MOCK_TRANSACTIONS: Transaction[] = [
//   {
//     id: '2',
//     bookingCode: 'TRX-HL8821',
//     serviceName: 'Tour Vịnh Hạ Long 2N1Đ',
//     date: '2025-11-20',
//     amount: 3200000,
//     status: 'completed',
//     paymentMethod: 'credit_card',
//     type: 'payment',
//   },
//   {
//     id: '3',
//     bookingCode: 'TRX-VP9902',
//     serviceName: 'Vinpearl Resort Phú Quốc',
//     date: '2025-10-15',
//     amount: 3500000,
//     status: 'completed',
//     paymentMethod: 'bank_transfer',
//     type: 'payment',
//   },
//   {
//     id: '4',
//     bookingCode: 'TRX-NT1156',
//     serviceName: 'Trải nghiệm Lặn biển Nha Trang',
//     date: '2025-09-10',
//     amount: 500000,
//     status: 'completed',
//     paymentMethod: 'e_wallet', // Ví điện tử (Momo/ZaloPay) thường dùng cho vé nhỏ
//     type: 'payment',
//   },
//   {
//     id: '5',
//     bookingCode: 'TRX-SG7734',
//     serviceName: 'InterContinental Saigon',
//     date: '2025-08-20',
//     amount: 4800000,
//     status: 'refunded', // Giả lập trường hợp đã hủy và được hoàn tiền
//     paymentMethod: 'credit_card',
//     type: 'refund',
//   },
// ];

// const UserTransactionsPage: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');

//   const filteredTransactions = MOCK_TRANSACTIONS.filter(transaction => {
//     const matchesSearch = transaction.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          transaction.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusConfig = (status: string) => {
//     const configs = {
//       completed: { 
//         icon: CheckCircle, 
//         bg: 'bg-green-100', 
//         text: 'text-green-700', 
//         label: 'Thành công',
//         iconColor: 'text-green-600'
//       },
//       pending: { 
//         icon: Clock, 
//         bg: 'bg-yellow-100', 
//         text: 'text-yellow-700', 
//         label: 'Đang xử lý',
//         iconColor: 'text-yellow-600'
//       },
//       failed: { 
//         icon: XCircle, 
//         bg: 'bg-red-100', 
//         text: 'text-red-700', 
//         label: 'Thất bại',
//         iconColor: 'text-red-600'
//       },
//       refunded: { 
//         icon: CheckCircle, 
//         bg: 'bg-blue-100', 
//         text: 'text-blue-700', 
//         label: 'Đã hoàn tiền',
//         iconColor: 'text-blue-600'
//       },
//     };
//     return configs[status as keyof typeof configs] || configs.completed;
//   };

//   const getPaymentMethodLabel = (method: string) => {
//     const labels = {
//       credit_card: 'Thẻ tín dụng',
//       bank_transfer: 'Chuyển khoản',
//       e_wallet: 'Ví điện tử',
//     };
//     return labels[method as keyof typeof labels] || method;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const formatPrice = (price: number, type: string) => {
//     const formatted = new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND',
//     }).format(price);
//     return type === 'refund' ? `+ ${formatted}` : `- ${formatted}`;
//   };

//   const calculateTotalAmount = () => {
//     return filteredTransactions
//       .filter(t => t.status === 'completed')
//       .reduce((sum, t) => sum + (t.type === 'payment' ? t.amount : -t.amount), 0);
//   };

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách giao dịch</h1>
//           <p className="text-sm text-gray-600">
//             Tổng chi tiêu: <span className="font-bold text-orange-600">
//               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalAmount())}
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="mb-6 space-y-4">
//         {/* Search */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Tìm kiếm theo tên dịch vụ hoặc mã đặt chỗ..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />
//         </div>

//         {/* Status Filter */}
//         <div className="flex gap-2 overflow-x-auto pb-2">
//           {[
//             { value: 'all', label: 'Tất cả', count: MOCK_TRANSACTIONS.length },
//             { value: 'completed', label: 'Thành công', count: MOCK_TRANSACTIONS.filter(t => t.status === 'completed').length },
//             { value: 'pending', label: 'Đang xử lý', count: MOCK_TRANSACTIONS.filter(t => t.status === 'pending').length },
//             { value: 'refunded', label: 'Đã hoàn tiền', count: MOCK_TRANSACTIONS.filter(t => t.status === 'refunded').length },
//             { value: 'failed', label: 'Thất bại', count: MOCK_TRANSACTIONS.filter(t => t.status === 'failed').length },
//           ].map((tab) => (
//             <button
//               key={tab.value}
//               onClick={() => setSelectedStatus(tab.value as any)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
//                 selectedStatus === tab.value
//                   ? 'bg-orange-500 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {tab.label} ({tab.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Transactions List */}
//       <div className="space-y-3">
//         {filteredTransactions.length === 0 ? (
//           <div className="text-center py-12 bg-gray-50 rounded-lg">
//             <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giao dịch</h3>
//             <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
//           </div>
//         ) : (
//           filteredTransactions.map((transaction) => {
//             const statusConfig = getStatusConfig(transaction.status);
//             const StatusIcon = statusConfig.icon;
            
//             return (
//               <div
//                 key={transaction.id}
//                 className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex gap-4 flex-1">
//                     {/* Icon */}
//                     <div className={`w-12 h-12 rounded-full ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
//                       <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
//                     </div>

//                     {/* Content */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-gray-900 mb-1 truncate">
//                             {transaction.serviceName}
//                           </h3>
//                           <div className="flex items-center gap-3 text-sm text-gray-600">
//                             <span className="flex items-center gap-1">
//                               <Receipt className="w-4 h-4" />
//                               <span className="font-mono">{transaction.bookingCode}</span>
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Calendar className="w-4 h-4" />
//                               <span>{formatDate(transaction.date)}</span>
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
//                         <div className="flex items-center gap-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
//                             {statusConfig.label}
//                           </span>
//                           <span className="flex items-center gap-1 text-sm text-gray-600">
//                             <CreditCard className="w-4 h-4" />
//                             <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
//                           </span>
//                         </div>
//                         <div className={`text-lg font-bold ${
//                           transaction.type === 'refund' ? 'text-green-600' : 'text-gray-900'
//                         }`}>
//                           {formatPrice(transaction.amount, transaction.type)}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   {transaction.status === 'completed' && (
//                     <button className="ml-4 p-2 text-gray-400 hover:text-orange-500 transition-colors">
//                       <Download className="w-5 h-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, Clock, CheckCircle, XCircle, 
  Calendar, Search, Loader2, ChevronRight, 
  Ticket, Phone, Download, CreditCard
} from 'lucide-react';
import apiClient from "@/services/apiClient";

// --- Interfaces ---
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
}

const UserTransactionsPage: React.FC = () => {
  const [tickets, setTickets] = useState<OrderedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'CANCELLED'>('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await apiClient.orders.getAll(); 
        setTickets(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Logic gom nhóm và lọc dữ liệu (Giống mẫu bạn gửi)
  const filteredOrders = useMemo(() => {
    const groups: Record<string, { info: Order; items: OrderedTicket[] }> = {};

    tickets.forEach((t) => {
      const orderId = t.order.orderID;
      if (!groups[orderId]) groups[orderId] = { info: t.order, items: [] };
      groups[orderId].items.push(t);
    });

    return Object.values(groups).filter(group => {
      const matchesSearch = group.info.orderID.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            group.info.guestPhone.includes(searchTerm);
      const matchesStatus = selectedStatus === 'ALL' || group.info.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, selectedStatus]);

  // Cấu hình trạng thái (Mapping từ code mẫu sang dữ liệu thực)
  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      SUCCESS: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Thành công', iconColor: 'text-green-600' },
      PENDING: { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Đang xử lý', iconColor: 'text-yellow-600' },
      CANCELLED: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy', iconColor: 'text-red-600' },
    };
    return configs[status] || configs.PENDING;
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
      <p className="text-gray-500">Đang tải lịch sử giao dịch...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Tiêu đề & Tổng quan */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lịch sử giao dịch</h1>
          <p className="text-sm text-gray-600">
            Tổng đơn hàng: <span className="font-bold text-orange-600">{filteredOrders.length}</span>
          </p>
        </div>
      </div>

      {/* Tìm kiếm & Bộ lọc (Style theo mẫu) */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'ALL', label: 'Tất cả' },
            { value: 'SUCCESS', label: 'Thành công' },
            { value: 'PENDING', label: 'Đang xử lý' },
            { value: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedStatus === tab.value ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách giao dịch */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">Không tìm thấy giao dịch</h3>
            <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          filteredOrders.map((group) => {
            const status = getStatusConfig(group.info.status);
            const StatusIcon = status.icon;

            return (
              <div key={group.info.orderID} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                {/* Body: Danh sách vé */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${status.bg} flex items-center justify-center shrink-0`}>
                      <StatusIcon className={`w-6 h-6 ${status.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 truncate">Đơn hàng #{group.info.orderID.substring(0, 8).toUpperCase()}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                             <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {new Date(group.info.createdAt).toLocaleDateString('vi-VN')}</span>
                             <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {group.info.guestPhone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-gray-900">{formatVND(group.info.finalPrice)}</p>
                        </div>
                      </div>

                      {/* Hiển thị tóm tắt các vé bên trong */}
                      <div className="space-y-2 mt-3">
                        {group.items.map(ticket => (
                          <div key={ticket.id} className="bg-gray-50 px-3 py-2 rounded-lg flex justify-between items-center text-sm">
                            <span className="text-gray-700 flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-orange-400" /> Vé tham quan x{ticket.amount}
                            </span>
                            <span className="font-medium text-gray-900">{formatVND(ticket.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Trạng thái & Action */}
                <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <CreditCard className="w-3.5 h-3.5" /> Chuyển khoản
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {group.info.status === 'SUCCESS' && (
                      <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors" title="Tải vé">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    <button className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:underline ml-2">
                      Chi tiết <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserTransactionsPage;