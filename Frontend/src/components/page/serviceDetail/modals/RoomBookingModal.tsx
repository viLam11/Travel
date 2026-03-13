import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { serviceDetailApi } from '../../../../api/serviceDetailApi';
import type { Discount } from '../../../../types/serviceDetail.types';

interface RoomBooking {
  roomId: number;
  checkIn: string;
  checkOut: string;
}

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  available: boolean;
  currentBookings?: RoomBooking[];
}

// interface Discount removed, now using centralized type

interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
  roomType: string;
  setRoomType: (type: string) => void;
  selectedRooms: number[];
  setSelectedRooms: (ids: number[]) => void;
  roomFirstName: string;
  setRoomFirstName: (name: string) => void;
  roomEmail: string;
  setRoomEmail: (email: string) => void;
  roomPhone: string;
  setRoomPhone: (phone: string) => void;
  roomAddress: string;
  setRoomAddress: (address: string) => void;
  roomCity: string;
  setRoomCity: (city: string) => void;
  roomCountry: string;
  setRoomCountry: (country: string) => void;
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
  allRooms: Room[];
  serviceId: string;
  provinceCode: string; // Add this
  roomPaymentMethod: 'MOMO' | 'VNPAY' | 'ZALOPAY';
  setRoomPaymentMethod: (method: 'MOMO' | 'VNPAY' | 'ZALOPAY') => void;
  showDiscountSection: boolean;
  setShowDiscountSection: (show: boolean) => void;
  availableDiscounts?: Discount[]; // Add this
  onConfirm: (discountIds: string[]) => void;
}

const RoomBookingModal: React.FC<RoomBookingModalProps> = ({
  isOpen,
  onClose,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guestCount,
  setGuestCount,
  roomType,
  setRoomType,
  selectedRooms,
  setSelectedRooms,
  roomFirstName,
  setRoomFirstName,
  roomEmail,
  setRoomEmail,
  roomPhone,
  setRoomPhone,
  roomAddress,
  setRoomAddress,
  roomCity,
  setRoomCity,
  roomCountry,
  setRoomCountry,
  specialRequests,
  setSpecialRequests,
  allRooms,
  serviceId,
  provinceCode, // Add this
  roomPaymentMethod,
  setRoomPaymentMethod,
  showDiscountSection,
  setShowDiscountSection,
  availableDiscounts: propDiscounts,
  onConfirm
}) => {
  const ROOMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [availableDiscounts, setAvailableDiscounts] = React.useState<Discount[]>(propDiscounts || []);
  const [selectedDiscounts, setSelectedDiscounts] = React.useState<string[]>([]);
  const [showGuestInfo, setShowGuestInfo] = useState(true);

  const datesOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && start2 < end1;
  };

  const { filteredRooms, totalPages } = useMemo(() => {
    let filtered = allRooms.filter(room => {
      if (!room.available) return false;
      if (roomType && roomType !== 'Bất kỳ phòng trống') {
        if (room.type !== roomType) return false;
      }
      if (room.capacity < guestCount) return false;
      if (checkInDate && checkOutDate && room.currentBookings) {
        const hasConflict = room.currentBookings.some(booking => 
          datesOverlap(checkInDate, checkOutDate, booking.checkIn, booking.checkOut)
        );
        if (hasConflict) return false;
      }
      return true;
    });
    const total = Math.ceil(filtered.length / ROOMS_PER_PAGE);
    return { filteredRooms: filtered, totalPages: total };
  }, [allRooms, roomType, guestCount, checkInDate, checkOutDate]);

  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * ROOMS_PER_PAGE;
    return filteredRooms.slice(start, start + ROOMS_PER_PAGE);
  }, [filteredRooms, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [roomType, guestCount, checkInDate, checkOutDate]);

  const toggleRoomSelection = (roomId: number) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return { nights: 0, subtotal: 0, tax: 0, total: 0 };
    
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const subtotal = selectedRooms.reduce((sum, id) => {
      const room = allRooms.find(r => r.id === id);
      return sum + (room ? room.price * nights : 0);
    }, 0);
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    return { nights, subtotal, tax, total };
  };

  const { nights, subtotal, tax, total } = calculateTotal();

  // Kiểm tra điều kiện ưu đãi
  const isDiscountEligible = (discount: Discount): boolean => {
    if (discount.minSpend && subtotal < discount.minSpend) {
      return false;
    }
    return true;
  };

  // Sync available discounts from props
  React.useEffect(() => {
    if (propDiscounts) {
      setAvailableDiscounts(propDiscounts);
    }
  }, [propDiscounts]);

  // Fetch real discounts
  React.useEffect(() => {
    const fetchDiscountsFromAPI = async () => {
      // Skip if discounts are provided via props
      if (propDiscounts && propDiscounts.length > 0) return;
      
      try {
        const data = await serviceDetailApi.getSatisfiedDiscounts(serviceId, provinceCode || '');
        setAvailableDiscounts(data);
      } catch (error) {
        console.error('Failed to fetch room discounts:', error);
      }
    };
    if (isOpen && serviceId) {
      fetchDiscountsFromAPI();
    }
  }, [isOpen, serviceId, provinceCode, propDiscounts]); 

  // Tự động chọn ưu đãi phù hợp
  React.useEffect(() => {
    if (availableDiscounts.length > 0) {
      const eligible = availableDiscounts.filter(d => isDiscountEligible(d));
      if (eligible.length > 0 && selectedDiscounts.length === 0) {
        setSelectedDiscounts([eligible[0].id]);
      }
    }
  }, [availableDiscounts, subtotal, selectedDiscounts.length]); // Added selectedDiscounts.length to dependencies

  const toggleDiscount = (discountId: string) => {
    const discount = availableDiscounts.find(d => d.id === discountId);
    if (!discount || !isDiscountEligible(discount)) return;

    setSelectedDiscounts(prev => 
      prev.includes(discountId)
        ? prev.filter(id => id !== discountId)
        : [...prev, discountId]
    );
  };

  const calculateDiscountAmount = (discount: Discount): number => {
    if (discount.percentage) {
      const amount = Math.round(subtotal * (discount.percentage / 100));
      return discount.maxDiscountAmount ? Math.min(amount, discount.maxDiscountAmount) : amount;
    }
    return discount.fixedPrice || 0;
  };

  const totalDiscount = selectedDiscounts.reduce((sum, id) => {
    const discount = availableDiscounts.find(d => d.id === id);
    return discount ? sum + calculateDiscountAmount(discount) : sum;
  }, 0);

  const finalTotal = Math.max(0, total - totalDiscount);

  const sortedDiscounts = [...availableDiscounts].sort((a, b) => {
    const aEligible = isDiscountEligible(a);
    const bEligible = isDiscountEligible(b);
    if (aEligible && !bEligible) return -1;
    if (!aEligible && bEligible) return 1;
    return 0;
  });

  if (!isOpen) return null;

  const guestOptions = [1, 2, 3, 4, 5, 6].map(n => ({
    value: n,
    label: `${n} khách`
  }));

  const roomTypeOptions = [
    { value: 'Bất kỳ phòng trống', label: 'Bất kỳ phòng trống' },
    { value: 'Tiêu chuẩn', label: 'Tiêu chuẩn' },
    { value: 'Cao cấp', label: 'Cao cấp' },
    { value: 'Suite', label: 'Suite' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300">
        {/* Header - More premium styling */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Xác nhận đặt phòng</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredRooms.length} phòng có sẵn • {selectedRooms.length} phòng đã chọn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
          </button>
        </div>

        <div className="overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-5">
              {/* Check-in & Check-out Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ngày nhận phòng
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ngày trả phòng
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all"
                  />
                </div>
              </div>

              {/* Guests & Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Số khách
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all"
                  >
                    {guestOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Loại phòng
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all"
                  >
                    {roomTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Information - Collapsible on Mobile */}
              <div>
                <button
                  onClick={() => setShowGuestInfo(!showGuestInfo)}
                  className="flex md:hidden items-center justify-between w-full text-left mb-3"
                >
                  <h3 className="text-base font-bold text-gray-900">Thông tin khách hàng</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-900 transition-transform ${showGuestInfo ? 'rotate-180' : ''}`}
                  />
                </button>
                
                <h3 className="hidden md:block text-base font-bold text-gray-900 mb-3">Thông tin khách hàng</h3>
                
                <div className={`space-y-3 ${showGuestInfo ? 'block' : 'hidden md:block'}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={roomFirstName}
                      onChange={(e) => setRoomFirstName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={roomEmail}
                      onChange={(e) => setRoomEmail(e.target.value)}
                      placeholder="guest@email.com"
                      className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={roomPhone}
                      onChange={(e) => setRoomPhone(e.target.value)}
                      placeholder="+84 123 456 789"
                      className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={roomAddress}
                      onChange={(e) => setRoomAddress(e.target.value)}
                      placeholder="Địa chỉ đường phố"
                      className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Thành phố
                      </label>
                      <input
                        type="text"
                        value={roomCity}
                        onChange={(e) => setRoomCity(e.target.value)}
                        placeholder="Thành phố"
                        className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Quốc gia
                      </label>
                      <input
                        type="text"
                        value={roomCountry}
                        onChange={(e) => setRoomCountry(e.target.value)}
                        placeholder="Quốc gia"
                        className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Yêu cầu đặc biệt hoặc ghi chú..."
                      rows={3}
                      className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={() => setShowGuestInfo(false)}
                    className="md:hidden w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronDown className="w-4 h-4 rotate-180" />
                    Thu gọn
                  </button>
                  
                </div>
              </div>
            </div>

            {/* Right Column - Rooms & Summary */}
            <div className="space-y-5">
              {/* Available Rooms */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Phòng có sẵn
                  {filteredRooms.length === 0 && (
                    <span className="ml-2 text-sm font-normal text-red-500">
                      (Không có phòng phù hợp)
                    </span>
                  )}
                </h3>
                
                {paginatedRooms.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedRooms.map((room) => {
                        const isSelected = selectedRooms.includes(room.id);
                        return (
                          <div
                            key={room.id}
                            onClick={() => toggleRoomSelection(room.id)}
                            className={`border-2 rounded-lg p-3 md:p-4 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-gray-900">{room.name}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                  {room.type}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  {room.capacity} khách
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">${room.price}/đêm</p>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                                  Trống
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {room.amenities.map((amenity, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-gray-200 text-xs text-gray-600 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                            {isSelected && (
                              <div className="mt-2 pt-2 border-t border-orange-200">
                                <span className="text-xs font-semibold text-orange-600">✓ Đã chọn</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Trước
                        </button>
                        <span className="text-sm text-gray-600">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sau
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Không tìm thấy phòng phù hợp với tiêu chí của bạn.</p>
                    <p className="text-xs mt-1">Vui lòng thay đổi bộ lọc hoặc chọn ngày khác.</p>
                  </div>
                )}
              </div>

              {/* Discounts Section */}
              <div>
                <button
                  onClick={() => setShowDiscountSection(!showDiscountSection)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-base font-bold text-gray-900">Ưu đãi</h3>
                  <Plus 
                    className={`w-5 h-5 text-gray-900 transition-transform ${showDiscountSection ? 'rotate-45' : ''}`}
                  />
                </button>

                {showDiscountSection && (
                  <div className="mt-3 space-y-2 max-h-[265px] overflow-y-auto pr-2">
                    {sortedDiscounts.length > 0 ? (
                      sortedDiscounts.map((discount) => {
                        const isEligible = isDiscountEligible(discount);
                        const isSelected = selectedDiscounts.includes(discount.id);
                        
                        return (
                          <button
                            key={discount.id}
                            onClick={() => toggleDiscount(discount.id)}
                            disabled={!isEligible}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              isSelected && isEligible
                                ? 'border-orange-500 bg-orange-50'
                                : isEligible
                                ? 'border-gray-200 hover:border-orange-300 bg-white'
                                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {isSelected && isEligible ? (
                                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                  ) : !isEligible ? (
                                    <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm font-semibold ${
                                    isEligible ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {discount.code}
                                  </span>
                                </div>
                                <p className={`text-xs ${isEligible ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {discount.description}
                                </p>
                                {!isEligible && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    {discount.minSpend && subtotal < discount.minSpend && (
                                      <p>Cần chi tiêu tối thiểu {(discount.minSpend || 0).toLocaleString()} VNĐ</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${
                                  isEligible ? 'text-orange-500' : 'text-gray-400'
                                }`}>
                                  {discount.percentage 
                                    ? `-${discount.percentage}%`
                                    : `-${(discount.fixedPrice || 0).toLocaleString()} VNĐ`}
                                </p>
                                {isEligible && isSelected && (
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    -{calculateDiscountAmount(discount).toLocaleString()} VNĐ
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-gray-500 border border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm italic">Hiện không có ưu đãi khả dụng</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Hình thức thanh toán</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* MoMo */}
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    roomPaymentMethod === 'MOMO' 
                      ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-500/20' 
                      : 'border-gray-100 bg-gray-50 hover:border-pink-300 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="roomPayment"
                      value="MOMO"
                      checked={roomPaymentMethod === 'MOMO'}
                      onChange={(e) => setRoomPaymentMethod(e.target.value as 'MOMO' | 'VNPAY' | 'ZALOPAY')}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        roomPaymentMethod === 'MOMO' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
                      }`}>
                        <span className="text-xs font-bold font-sans">M</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">MoMo</span>
                    </div>
                  </label>

                  {/* VNPAY */}
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    roomPaymentMethod === 'VNPAY' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' 
                      : 'border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="roomPayment"
                      value="VNPAY"
                      checked={roomPaymentMethod === 'VNPAY'}
                      onChange={(e) => setRoomPaymentMethod(e.target.value as 'MOMO' | 'VNPAY' | 'ZALOPAY')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        roomPaymentMethod === 'VNPAY' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="text-xs font-bold font-sans">V</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">VNPAY</span>
                    </div>
                  </label>

                  {/* ZaloPay */}
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    roomPaymentMethod === 'ZALOPAY' 
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20' 
                      : 'border-gray-100 bg-gray-50 hover:border-teal-300 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="roomPayment"
                      value="ZALOPAY"
                      checked={roomPaymentMethod === 'ZALOPAY'}
                      onChange={(e) => setRoomPaymentMethod(e.target.value as 'MOMO' | 'VNPAY' | 'ZALOPAY')}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        roomPaymentMethod === 'ZALOPAY' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-600'
                      }`}>
                        <span className="text-xs font-bold font-sans">Z</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">ZaloPay</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Booking Summary */}
              {selectedRooms.length > 0 && checkInDate && checkOutDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Tổng chi phí</h3>
                  <div className="space-y-2 text-sm">
                    {selectedRooms.map(id => {
                      const room = allRooms.find(r => r.id === id);
                      if (!room) return null;
                      return (
                        <div key={id} className="flex items-center justify-between">
                          <span className="text-gray-700">
                            {room.name} - {nights} đêm
                          </span>
                          <span className="font-semibold">${(room.price * nights).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-700">Phí phụ thu</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Thuế & Phí (10%)</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex items-center justify-between text-orange-600">
                        <span>Ưu đãi ({selectedDiscounts.length})</span>
                        <span className="font-semibold">
                          -${totalDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
                      <span className="font-bold text-gray-900">Tổng cộng</span>
                      <span className="font-bold text-orange-500 text-lg">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onConfirm(selectedDiscounts)}
                  disabled={selectedRooms.length === 0 || !checkInDate || !checkOutDate}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-lg font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận đặt phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomBookingModal;