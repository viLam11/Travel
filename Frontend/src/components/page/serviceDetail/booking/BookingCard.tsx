// src/components/booking/BookingCard.tsx
import React from 'react';
import { MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
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
  onRoomBookNow
}) => {
  const isHotel = serviceType === 'hotel';
  return (
    <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-xl p-4 lg:p-5 shadow-md md:max-h-[85vh] overflow-y-auto">
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
        <h4 className="font-semibold text-gray-900 text-sm">Số lượng</h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">Người lớn (18+):</p>
              <p className="text-xs font-bold text-orange-500">{service.priceAdult.toLocaleString()} đ</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-sm">{adultCount}</span>
              <button
                onClick={() => setAdultCount(adultCount + 1)}
                className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">Trẻ em ({'<'}6 tuổi):</p>
              <p className="text-xs font-bold text-orange-500">{service.priceChild.toLocaleString()} đ</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChildCount(Math.max(0, childCount - 1))}
                className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-sm">{childCount}</span>
              <button
                onClick={() => setChildCount(childCount + 1)}
                className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-base"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 text-sm">Dịch vụ thêm</h4>
        {service.additionalServices.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-gray-700">{s.name}</span>
            <span className="font-semibold text-gray-900">{s.price.toLocaleString()} đ</span>
          </div>
        ))}
      </div>

      {service.discounts.map((d, idx) => (
        d.applied && (
          <div key={idx} className="mb-4 pb-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Mã giảm giá</h4>
            <div className="flex items-center justify-between bg-orange-50 p-2 rounded-lg">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900 text-xs">{d.code}</span>
              </div>
              <span className="font-semibold text-orange-600 text-xs">-{d.value.toLocaleString()} đ</span>
            </div>
          </div>
        )
      ))}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">Thành tiền:</span>
          <span className="font-bold text-orange-500 text-lg">{finalPrice.toLocaleString()} VNĐ</span>
        </div>
      </div>

      <button
        onClick={isHotel ? onRoomBookNow : onBookNow}
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
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