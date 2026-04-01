import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Filter, 
  ChevronRight, 
  Trophy, 
  Star,
  Search,
  Loader2,
  Package,
  History,
  TrendingUp,
  Tag
} from 'lucide-react';
import apiClient from '@/services/apiClient';

interface BookingDisplay {
  id: string;
  serviceId: string;
  type: string;
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  totalPrice: number;
  image: string;
  bookingCode: string;
}

const UserBookingsPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled' | 'pending'>('all');
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data: any = await apiClient.orders.getAll();
        console.log("Raw orders data:", data);
        
        // Handle both Array of Orders or Array of OrderedTickets
        const list: any[] = Array.isArray(data) ? data : (data?.content ?? data?.orders ?? []);

        const mapped: BookingDisplay[] = list.map((item: any) => {
          // Check if it's an OrderedTicket (original BE) or Order (my previous refactor)
          const isOrderedTicket = !!item.order;
          
          let status: BookingDisplay['status'] = 'pending';
          const rawStatus = (isOrderedTicket ? item.order?.status : item.status) || 'PENDING';
          const s = rawStatus.toUpperCase();
          
          if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'DONE') {
            status = 'completed';
          } else if (s === 'CANCELLED' || s === 'CANCELED' || s === 'FAILED') {
            status = 'cancelled';
          } else if (s === 'PENDING') {
            status = 'pending';
          }

          // Extraction logic
          let serviceName = 'Dịch vụ';
          let location = '';
          let serviceId = '';
          let type = 'activity';
          let image = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600';
          let checkIn = '';
          let checkOut = '';

          if (isOrderedTicket) {
            // It's an OrderedTicket
            const ticket = item.ticket;
            const venue = ticket?.ticketVenue;
            if (venue) {
              serviceName = venue.serviceName || ticket.name || 'Vé tham quan';
              location = venue.province?.name || '';
              serviceId = venue.id || '';
              type = (venue.serviceType || 'activity').toLowerCase();
              image = venue.thumbnailUrl || image;
            }
            checkIn = item.validStart || item.order?.createdAt || '';
            checkOut = item.validEnd || '';
          } else {
            // It's an Order (with nested tickets/rooms)
            const firstTicket = item.orderedTickets?.[0];
            const firstRoom = item.orderedRooms?.[0];
            const service = firstTicket?.ticket?.ticketVenue || firstRoom?.room?.hotel;
            
            if (service) {
              serviceName = service.serviceName || 'Dịch vụ';
              location = service.province?.name || '';
              serviceId = service.id || '';
              type = (service.serviceType || (firstRoom ? 'hotel' : 'activity')).toLowerCase();
              image = service.thumbnailUrl || image;
            }
            checkIn = item.createdAt || firstTicket?.validStart || firstRoom?.startDate || '';
            checkOut = firstTicket?.validEnd || firstRoom?.endDate || '';
          }

          return {
            id: String(item.id || item.orderID || Math.random()),
            serviceId: String(serviceId),
            type,
            name: serviceName,
            location,
            checkIn: checkIn ? checkIn.split('T')[0] : '',
            checkOut: checkOut ? checkOut.split('T')[0] : '',
            status,
            totalPrice: item.price || item.totalPrice || 0,
            image,
            bookingCode: (item.order?.orderID || item.orderID || 'N/A').substring(0, 8).toUpperCase(),
          };
        });

        setBookings(mapped);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusConfig = (status: BookingDisplay['status']) => {
    const configs = {
      upcoming: { 
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', 
        label: 'Sắp tới',
        dot: 'bg-indigo-500'
      },
      pending: { 
        bg: 'bg-amber-50 text-amber-700 border-amber-100', 
        label: 'Chờ xác nhận',
        dot: 'bg-amber-500'
      },
      completed: { 
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
        label: 'Hoàn thành',
        dot: 'bg-emerald-500'
      },
      cancelled: { 
        bg: 'bg-rose-50 text-rose-700 border-rose-100', 
        label: 'Đã hủy',
        dot: 'bg-rose-500'
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date: string) => {
    if (!date) return 'Chưa xác định';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đặt chỗ của tôi</h1>
          </div>
          <p className="text-gray-500">Quản lý và theo dõi các hành trình của bạn</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'upcoming', label: 'Sắp tới' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'completed', label: 'Xong' },
            { value: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 cursor-pointer ${
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

      {/* Stats Section */}
      {!isLoading && bookings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tổng cộng</p>
            <p className="text-xl font-black text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-1">Sắp tới</p>
            <p className="text-xl font-black text-gray-900">{bookings.filter(b => b.status === 'upcoming' || b.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Đã xong</p>
            <p className="text-xl font-black text-gray-900">{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Đã hủy</p>
            <p className="text-xl font-black text-gray-900">{bookings.filter(b => b.status === 'cancelled').length}</p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm theo tên dịch vụ hoặc mã đặt chỗ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-50/50 focus:border-orange-500 transition-all text-gray-700 font-medium"
        />
      </div>

      {/* Bookings Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-50">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">Đang tải hành trình của bạn...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-orange-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chuyến đi nào</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">Bạn chưa có đơn đặt chỗ nào trong danh mục này. Hãy bắt đầu khám phá nhé!</p>
          <button 
            onClick={() => navigate('/destinations')}
            className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 cursor-pointer"
          >
            Khám phá ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {currentItems.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            return (
              <div
                key={booking.id}
                onClick={() => booking.serviceId && navigate(`/service/${booking.serviceId}`)}
                className="group relative bg-white border border-gray-100 rounded-3xl p-5 md:p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-100/40 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/40 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-100/50 transition-colors" />
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden rounded-2xl">
                    <img
                      src={booking.image}
                      alt={booking.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className="px-3 py-1 bg-orange-600/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {booking.type}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${statusConfig.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </div>
                        <span className="text-[11px] font-mono text-orange-400 bg-orange-50 px-2 py-1 rounded">#{booking.bookingCode}</span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {booking.name}
                      </h3>

                      {booking.location && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold">{booking.location}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày đến</p>
                            <p className="text-sm font-bold text-gray-700">{formatDate(booking.checkIn)}</p>
                          </div>
                        </div>
                        {booking.checkOut && (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày về</p>
                              <p className="text-sm font-bold text-gray-700">{formatDate(booking.checkOut)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Tổng thanh toán</p>
                        <span className="text-2xl font-black text-orange-600">
                          {formatPrice(booking.totalPrice)}
                          <span className="text-sm ml-1">VNĐ</span>
                        </span>
                      </div>

                      <div className="flex gap-2">
                         <button 
                          onClick={(e) => { e.stopPropagation(); booking.serviceId && navigate(`/service/${booking.serviceId}`); }}
                          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 group/btn cursor-pointer"
                        >
                          Chi tiết
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
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
        </div>
      )}

      {/* Stats / Footer (Optional Modern Touch) */}
      {!isLoading && bookings.length > 0 && (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-100/50 shadow-sm shadow-orange-100/50">
            <Trophy className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-2xl font-black text-gray-800">{bookings.length}</p>
            <p className="text-sm text-gray-500 font-medium">Tổng chuyến đi</p>
          </div>
          <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-100/50 shadow-sm shadow-orange-100/50">
            <TrendingUp className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-2xl font-black text-gray-800">{bookings.filter(b => b.status === 'completed').length}</p>
            <p className="text-sm text-gray-500 font-medium">Đã hoàn thành</p>
          </div>
          <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-100/50 shadow-sm shadow-orange-100/50">
            <Tag className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-2xl font-black text-gray-800">{formatPrice(bookings.reduce((sum, b) => sum + b.totalPrice, 0))}</p>
            <p className="text-sm text-gray-500 font-medium">Tổng tích lũy (VNĐ)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;