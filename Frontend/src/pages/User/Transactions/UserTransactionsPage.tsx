// src/pages/User/Transactions/UserTransactionsPage.tsx
import React, { useState } from 'react';
import { 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  CreditCard,
  Download,
  Search
} from 'lucide-react';

interface Transaction {
  id: string;
  bookingCode: string;
  serviceName: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'e_wallet';
  type: 'payment' | 'refund';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN001',
    bookingCode: 'VT001234',
    serviceName: 'Khách sạn Mường Thanh Luxury',
    date: '2025-11-10T14:30:00',
    amount: 3500000,
    status: 'completed',
    paymentMethod: 'credit_card',
    type: 'payment',
  },
  {
    id: 'TXN002',
    bookingCode: 'VT001235',
    serviceName: 'Tour Vịnh Hạ Long 2N1Đ',
    date: '2025-11-08T10:15:00',
    amount: 8000000,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    type: 'payment',
  },
  {
    id: 'TXN003',
    bookingCode: 'VT001200',
    serviceName: 'Vinpearl Resort Phú Quốc',
    date: '2025-10-10T16:45:00',
    amount: 6000000,
    status: 'completed',
    paymentMethod: 'e_wallet',
    type: 'payment',
  },
  {
    id: 'TXN004',
    bookingCode: 'VT001180',
    serviceName: 'Trải nghiệm Lặn biển Nha Trang',
    date: '2025-09-05T09:20:00',
    amount: 500000,
    status: 'completed',
    paymentMethod: 'credit_card',
    type: 'payment',
  },
  {
    id: 'TXN005',
    bookingCode: 'VT001150',
    serviceName: 'InterContinental Saigon',
    date: '2025-08-15T11:00:00',
    amount: 4000000,
    status: 'refunded',
    paymentMethod: 'credit_card',
    type: 'refund',
  },
  {
    id: 'TXN006',
    bookingCode: 'VT001240',
    serviceName: 'Tour Sapa 3N2Đ',
    date: '2025-11-12T13:30:00',
    amount: 5500000,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    type: 'payment',
  },
  {
    id: 'TXN007',
    bookingCode: 'VT001120',
    serviceName: 'Khách sạn Sheraton Saigon',
    date: '2025-07-20T15:45:00',
    amount: 3200000,
    status: 'failed',
    paymentMethod: 'e_wallet',
    type: 'payment',
  },
];

const UserTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');

  const filteredTransactions = MOCK_TRANSACTIONS.filter(transaction => {
    const matchesSearch = transaction.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      completed: { 
        icon: CheckCircle, 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        label: 'Thành công',
        iconColor: 'text-green-600'
      },
      pending: { 
        icon: Clock, 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        label: 'Đang xử lý',
        iconColor: 'text-yellow-600'
      },
      failed: { 
        icon: XCircle, 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        label: 'Thất bại',
        iconColor: 'text-red-600'
      },
      refunded: { 
        icon: CheckCircle, 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        label: 'Đã hoàn tiền',
        iconColor: 'text-blue-600'
      },
    };
    return configs[status as keyof typeof configs] || configs.completed;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      credit_card: 'Thẻ tín dụng',
      bank_transfer: 'Chuyển khoản',
      e_wallet: 'Ví điện tử',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
    return type === 'refund' ? `+ ${formatted}` : `- ${formatted}`;
  };

  const calculateTotalAmount = () => {
    return filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.type === 'payment' ? t.amount : -t.amount), 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách giao dịch</h1>
          <p className="text-sm text-gray-600">
            Tổng chi tiêu: <span className="font-bold text-orange-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalAmount())}
            </span>
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên dịch vụ hoặc mã đặt chỗ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Tất cả', count: MOCK_TRANSACTIONS.length },
            { value: 'completed', label: 'Thành công', count: MOCK_TRANSACTIONS.filter(t => t.status === 'completed').length },
            { value: 'pending', label: 'Đang xử lý', count: MOCK_TRANSACTIONS.filter(t => t.status === 'pending').length },
            { value: 'refunded', label: 'Đã hoàn tiền', count: MOCK_TRANSACTIONS.filter(t => t.status === 'refunded').length },
            { value: 'failed', label: 'Thất bại', count: MOCK_TRANSACTIONS.filter(t => t.status === 'failed').length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedStatus === tab.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giao dịch</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const statusConfig = getStatusConfig(transaction.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={transaction.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {transaction.serviceName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Receipt className="w-4 h-4" />
                              <span className="font-mono">{transaction.bookingCode}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(transaction.date)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                          </span>
                        </div>
                        <div className={`text-lg font-bold ${
                          transaction.type === 'refund' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {formatPrice(transaction.amount, transaction.type)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {transaction.status === 'completed' && (
                    <button className="ml-4 p-2 text-gray-400 hover:text-orange-500 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  )}
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