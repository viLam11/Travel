// src/components/booking/BookingCard.tsx
import React, { useState } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, ChevronDown, Users } from 'lucide-react';
import type { ServiceDetail } from '@/types/serviceDetail.types';

interface BookingCardProps {
  service: ServiceDetail;
  serviceType?: string; // 'hotel' or 'place'
  adultCount: number;
  setAdultCount: (count: number) => void;
  childCount: number;
  setChildCount: (count: number) => void;
  finalPrice: number;
  onBookNow: () => void;
  onRoomBookNow?: () => void;
  // Hotel specific props
  checkInDate?: string;
  setCheckInDate?: (date: string) => void;
  checkOutDate?: string;
  setCheckOutDate?: (date: string) => void;
  guestCount?: number;
  setGuestCount?: (count: number) => void;
  ticketList: any[];
  setTicketList: (tickets: any[]) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  service,
  serviceType = 'place',
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  finalPrice,
  onBookNow,
  onRoomBookNow,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guestCount,
  setGuestCount,
  ticketList,
  setTicketList
}) => {
  const isHotel = serviceType === 'hotel';
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllDiscounts, setShowAllDiscounts] = useState(false);

  return (
    <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-xl shadow-md flex flex-col max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Fixed Header */}
      <div className="text-center p-4 pb-3 border-b border-gray-100 flex-none bg-white">
        <h2 className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
          {isHotel ? 'Đơn đặt phòng' : 'Đơn đặt dịch vụ'}
        </h2>
        <h3 className="text-sm font-semibold text-gray-700 line-clamp-2">{service.name}</h3>
      </div>

      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 pt-2 custom-scrollbar space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-500 uppercase">Địa điểm:</p>
              <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{service.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-medium text-gray-500 uppercase">Thời gian:</p>
              <p className="text-xs text-gray-700 font-medium">{service.openingHours}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-medium text-gray-500 uppercase">{isHotel ? 'Giờ nhận phòng:' : 'Thời hạn:'}</p>
              <p className="text-xs text-gray-700 font-medium">{isHotel ? 'Từ 14:00' : service.duration}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50">
          {isHotel ? (
            // Hotel Interface: Dates & Guests
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase block">Từ ngày</label>
                  <input
                    type="date"
                    value={checkInDate || ''}
                    onChange={(e) => setCheckInDate?.(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase block">Đến ngày</label>
                  <input
                    type="date"
                    value={checkOutDate || ''}
                    onChange={(e) => setCheckOutDate?.(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase block">Số khách</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guestCount || 1}
                    onChange={(e) => setGuestCount?.(parseInt(e.target.value) || 1)}
                    className="w-full text-sm outline-none bg-transparent font-medium"
                    placeholder="1 khách"
                  />
                </div>
              </div>

              <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-100/50">
                <p className="text-[10px] sm:text-[11px] text-blue-700 leading-relaxed font-medium">
                  Lưu ý: Giá phòng có thể thay đổi tùy thuộc vào ngày bạn chọn.
                </p>
              </div>
            </div>
          ) : (
            // Standard Interface: Dynamic Ticket List
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Số lượng</h4>
              <div className="space-y-3">
                {ticketList.length > 0 ? (
                  ticketList.map((ticket, idx) => (
                    <div key={ticket.id || idx} className="flex items-center justify-between gap-3 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {ticket.name}
                        </p>
                        <p className="text-xs font-bold text-orange-500">
                          {(ticket.price || 0).toLocaleString()} <span className="text-[10px]">đ</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            const newList = [...ticketList];
                            newList[idx] = { ...newList[idx], count: Math.max(0, (newList[idx].count || 0) - 1) };
                            setTicketList(newList);
                          }}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-colors text-base font-bold text-gray-600 hover:text-orange-500 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold text-sm text-gray-900">{ticket.count || 0}</span>
                        <button
                          onClick={() => {
                            const newList = [...ticketList];
                            newList[idx] = { ...newList[idx], count: (newList[idx].count || 0) + 1 };
                            setTicketList(newList);
                          }}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-colors text-base font-bold text-gray-600 hover:text-orange-500 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4 font-inter">
                    {/* Người lớn */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">Người lớn (18+)</p>
                        <p className="text-xs font-bold text-orange-500">{(service.priceAdult || 0).toLocaleString()} <span className="text-[10px]">đ</span></p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-colors text-base font-bold text-gray-600 hover:text-orange-500 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold text-sm text-gray-900">{adultCount}</span>
                        <button
                          onClick={() => setAdultCount(adultCount + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-colors text-base font-bold text-gray-600 hover:text-orange-500 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Trẻ em */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">Trẻ em ({'<'}6 tuổi)</p>
                        <p className="text-xs font-bold text-orange-500">{(service.priceChild || 0).toLocaleString()} <span className="text-[10px]">đ</span></p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setChildCount(Math.max(0, childCount - 1))}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-colors text-base font-bold text-gray-600 hover:text-orange-500 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold text-sm text-gray-900">{childCount}</span>
                        <button
                          onClick={() => setChildCount(childCount + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-colors text-base font-bold text-gray-600 hover:text-orange-500 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Additional Services */}
        {service.additionalServices.length > 0 && (
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="w-full flex items-center justify-between mb-2.5 hover:bg-gray-50 -mx-1 px-1 py-1 rounded transition-colors group cursor-pointer"
            >
              <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Dịch vụ thêm</h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-all ${showAllServices ? 'rotate-180' : ''}`}
              />
            </button>
            <div className="space-y-2">
              {service.additionalServices
                .slice(0, showAllServices ? undefined : 1)
                .map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs animate-in fade-in duration-300">
                    <span className="text-gray-600 font-medium">{s.name}</span>
                    <span className="font-bold text-gray-900">{(s.price || 0).toLocaleString()} đ</span>
                  </div>
                ))}
              {!showAllServices && service.additionalServices.length > 1 && (
                <p className="text-[11px] text-orange-500 font-medium italic mt-1.5 flex items-center gap-1 cursor-pointer" onClick={() => setShowAllServices(true)}>
                  <span>+ {service.additionalServices.length - 1} dịch vụ khác</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Discounts */}
        {service.discounts.some(d => d.applied) && (
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={() => setShowAllDiscounts(!showAllDiscounts)}
              className="w-full flex items-center justify-between mb-2.5 hover:bg-gray-50 -mx-1 px-1 py-1 rounded transition-colors group cursor-pointer"
            >
              <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider font-inter">Mã giảm giá</h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-all ${showAllDiscounts ? 'rotate-180' : ''}`}
              />
            </button>
            <div className="space-y-2.5">
              {service.discounts
                .filter(d => d.applied)
                .slice(0, showAllDiscounts ? undefined : 1)
                .map((d, idx) => {
                  const discountVal = d.fixedPrice || (d.percentage ? Math.round(service.priceAdult * (d.percentage / 100)) : 0);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-orange-50/70 p-2.5 rounded-lg border border-orange-100/50 animate-in slide-in-from-right-2 duration-300">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-xs">{d.code}</span>
                      </div>
                      <span className="font-bold text-orange-600 text-xs">-{discountVal.toLocaleString()} đ</span>
                    </div>
                  );
                })}
              {!showAllDiscounts && service.discounts.filter(d => d.applied).length > 1 && (
                <p className="text-[11px] text-orange-500 font-medium italic mt-1.5 cursor-pointer" onClick={() => setShowAllDiscounts(true)}>
                  + {service.discounts.filter(d => d.applied).length - 1} mã khác
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="p-4 lg:p-5 border-t border-gray-100 flex-none bg-white">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">Thành tiền:</span>
            <span className="font-extrabold text-orange-500 text-xl tracking-tight">{(finalPrice || 0).toLocaleString()} <span className="text-xs">VNĐ</span></span>
          </div>
        </div>

        <button
          onClick={isHotel ? () => onRoomBookNow?.() : onBookNow}
          className="cursor-pointer w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
        >
          {isHotel ? 'Đặt phòng ngay' : 'Đặt vé ngay'}
        </button>
      </div>
    </div>
  );
};

export default BookingCard;