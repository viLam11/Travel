// src/components/booking/BookingCard.tsx
import React, { useState } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, ChevronDown, Users } from 'lucide-react';
import type { ServiceDetail } from '@/types/serviceDetail.types';

  guestCount?: number;
  setGuestCount?: (count: number) => void;
  ticketList: any[];
  setTicketList: (tickets: any[]) => void;
}

  guestCount,
  setGuestCount,
  ticketList,
  setTicketList
}) => {
  const isHotel = serviceType === 'hotel';
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllDiscounts, setShowAllDiscounts] = useState(false);

  return (
    <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-xl p-4 lg:p-5 shadow-md md:max-h-[85vh] overflow-y-auto scrollbar-hide">
      <div className="text-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 mb-1">
          {isHotel ? 'ĐƠN ĐẶT PHÒNG' : 'ĐƠN ĐẶT DỊCH VỤ'}
        </h2>
        <h3 className="text-xs font-semibold text-gray-700 line-clamp-2">{service.name}</h3>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900">Địa điểm:</p>
            <p className="text-xs text-gray-600 line-clamp-2">{service.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900">Thời gian:</p>
            <p className="text-xs text-gray-600">{service.openingHours}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900">{isHotel ? 'Giờ nhận phòng:' : 'Thời hạn:'}</p>
            <p className="text-xs text-gray-600">{isHotel ? 'Từ 14:00' : service.duration}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
        {isHotel ? (
          // Hotel Interface: Dates & Guests
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-900 block">Ngày nhận phòng</label>
                <input
                  type="date"
                  value={checkInDate || ''}
                  onChange={(e) => setCheckInDate?.(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-900 block">Ngày trả phòng</label>
                <input
                  type="date"
                  value={checkOutDate || ''}
                  onChange={(e) => setCheckOutDate?.(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-900 block">Số lượng khách</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Users className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guestCount || 1}
                  onChange={(e) => setGuestCount?.(parseInt(e.target.value) || 1)}
                  className="w-full text-sm outline-none"
                  placeholder="1 khách"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
              Lưu ý: Giá phòng có thể thay đổi tùy thuộc vào ngày bạn chọn.
            </div>
          </div>
        ) : (
          // Standard Interface: Dynamic Ticket List
          <>
            <h4 className="font-semibold text-gray-900 text-sm">Số lượng</h4>
            <div className="space-y-3">
              {ticketList.length > 0 ? (
                ticketList.map((ticket, idx) => (
                  <div key={ticket.id || idx} className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {ticket.name}:
                      </p>
                      <p className="text-xs font-bold text-orange-500">
                        {(ticket.price || 0).toLocaleString()} đ
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newList = [...ticketList];
                          newList[idx] = { ...newList[idx], count: Math.max(0, (newList[idx].count || 0) - 1) };
                          setTicketList(newList);
                        }}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{ticket.count || 0}</span>
                      <button
                        onClick={() => {
                          const newList = [...ticketList];
                          newList[idx] = { ...newList[idx], count: (newList[idx].count || 0) + 1 };
                          setTicketList(newList);
                        }}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">Người lớn (18+):</p>
                        <p className="text-xs font-bold text-orange-500">{(service.priceAdult || 0).toLocaleString()} đ</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold text-sm">{adultCount}</span>
                        <button
                          onClick={() => setAdultCount(adultCount + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
                        >
                          +
                        </button>
                      </div>
                    </div>
      
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">Trẻ em ({'<'}6 tuổi):</p>
                        <p className="text-xs font-bold text-orange-500">{(service.priceChild || 0).toLocaleString()} đ</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setChildCount(Math.max(0, childCount - 1))}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold text-sm">{childCount}</span>
                        <button
                          onClick={() => setChildCount(childCount + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Collapsible Additional Services */}
      {service.additionalServices.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowAllServices(!showAllServices)}
            className="w-full flex items-center justify-between mb-2 hover:bg-gray-50 -mx-1 px-1 py-1 rounded transition-colors"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Dịch vụ thêm</h4>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${showAllServices ? 'rotate-180' : ''}`}
            />
          </button>
          <div className="space-y-1.5">
            {service.additionalServices
              .slice(0, showAllServices ? undefined : 1)
              .map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="font-semibold text-gray-900">{(s.price || 0).toLocaleString()} đ</span>
                </div>
              ))}
            {!showAllServices && service.additionalServices.length > 1 && (
              <p className="text-xs text-gray-500 italic">+{service.additionalServices.length - 1} dịch vụ khác</p>
            )}
          </div>
        </div>
      )}

      {/* Collapsible Discounts */}
      {service.discounts.some(d => d.applied) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowAllDiscounts(!showAllDiscounts)}
            className="w-full flex items-center justify-between mb-2 hover:bg-gray-50 -mx-1 px-1 py-1 rounded transition-colors"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Mã giảm giá</h4>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${showAllDiscounts ? 'rotate-180' : ''}`}
            />
          </button>
          <div className="space-y-2">
            {service.discounts
              .filter(d => d.applied)
              .slice(0, showAllDiscounts ? undefined : 1)
              .map((d, idx) => {
                const discountVal = d.fixedPrice || (d.percentage ? Math.round(service.priceAdult * (d.percentage / 100)) : 0);
                return (
                  <div key={idx} className="flex items-center justify-between bg-orange-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-900 text-xs">{d.code}</span>
                    </div>
                    <span className="font-semibold text-orange-600 text-xs">-{discountVal.toLocaleString()} đ</span>
                  </div>
                );
              })}
            {!showAllDiscounts && service.discounts.filter(d => d.applied).length > 1 && (
              <p className="text-xs text-gray-500 italic">+{service.discounts.filter(d => d.applied).length - 1} mã khác</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">Thành tiền:</span>
          <span className="font-bold text-orange-500 text-lg">{(finalPrice || 0).toLocaleString()} VNĐ</span>
        </div>
      </div>

      <button
        onClick={isHotel ? () => onRoomBookNow?.() : onBookNow}
        className="cursor-pointer w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {isHotel ? 'ĐẶT PHÒNG' : 'ĐẶT NGAY'}
      </button>

      {/* Test Room Booking Button */}
      {/* {onRoomBookNow && (
        <button 
          onClick={onRoomBookNow}
          className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          ĐẶT PHÒNG (TEST)
        </button>
      )} */}
    </div>
  );
};

export default BookingCard;