// src/pages/User/Bookings/UserBookingsPage.tsx
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, DollarSign, ChevronRight, Filter } from 'lucide-react';

interface Booking {
  id: string;
  type: 'hotel' | 'tour' | 'activity';
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  totalPrice: number;
  image: string;
  bookingCode: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '2',
    type: 'tour',
    name: 'Tour Vịnh Hạ Long 2N1Đ',
    location: 'Quảng Ninh',
    checkIn: '2025-11-20',
    checkOut: '2025-11-22',
    guests: 4,
    status: 'upcoming',
    totalPrice: 8000000,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
    bookingCode: 'VT001235',
  },
  {
    id: '3',
    type: 'hotel',
    name: 'Vinpearl Resort Phú Quốc',
    location: 'Phú Quốc',
    checkIn: '2025-10-15',
    checkOut: '2025-10-18',
    guests: 2,
    status: 'completed',
    totalPrice: 6000000,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    bookingCode: 'VT001200',
  },
  {
    id: '4',
    type: 'activity',
    name: 'Trải nghiệm Lặn biển Nha Trang',
    location: 'Nha Trang',
    checkIn: '2025-09-10',
    checkOut: '2025-09-10',
    guests: 1,
    status: 'completed',
    totalPrice: 500000,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    bookingCode: 'VT001180',
  },
  {
    id: '5',
    type: 'hotel',
    name: 'InterContinental Saigon',
    location: 'TP. Hồ Chí Minh',
    checkIn: '2025-08-20',
    checkOut: '2025-08-22',
    guests: 2,
    status: 'cancelled',
    totalPrice: 4000000,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    bookingCode: 'VT001150',
  },
];

const UserBookingsPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredBookings = selectedStatus === 'all' 
    ? MOCK_BOOKINGS 
    : MOCK_BOOKINGS.filter(b => b.status === selectedStatus);

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sắp tới' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      hotel: 'Khách sạn',
      tour: 'Tour',
      activity: 'Hoạt động',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      // style: 'currency',
      // currency: 'VND',
    }).format(price);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đặt chỗ của tôi</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Lọc theo:</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'Tất cả', count: MOCK_BOOKINGS.length },
          { value: 'upcoming', label: 'Sắp tới', count: MOCK_BOOKINGS.filter(b => b.status === 'upcoming').length },
          { value: 'completed', label: 'Hoàn thành', count: MOCK_BOOKINGS.filter(b => b.status === 'completed').length },
          { value: 'cancelled', label: 'Đã hủy', count: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length },
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

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đặt chỗ nào</h3>
            <p className="text-gray-500">Bạn chưa có đặt chỗ nào trong danh mục này</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            
            return (
              <div
                key={booking.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={booking.image}
                      alt={booking.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {getTypeLabel(booking.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Check-in: {formatDate(booking.checkIn)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Check-out: {formatDate(booking.checkOut)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">Mã đặt chỗ: </span>
                        <span className="text-xs font-mono font-semibold text-gray-900">
                          {booking.bookingCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 font-bold">
                        <span className="text-lg">{formatPrice(booking.totalPrice)} VND</span>
                      </div>
                    </div>
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

export default UserBookingsPage;