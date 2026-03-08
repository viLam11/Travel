// src/components/page/serviceDetail/info/HotelInfoTab.tsx
import React from 'react';
import { Wifi, Wind, Tv, Coffee, Car, UtensilsCrossed, Dumbbell, Waves } from 'lucide-react';

interface HotelInfoTabProps {
    service: any;
}

const HotelInfoTab: React.FC<HotelInfoTabProps> = ({ service }) => {
    const encodedAddress = encodeURIComponent(service?.address ?? "Hoàn Kiếm, Hà Nội");
    const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    // Hotel amenities data
    const hotelAmenities = [
        { icon: <Wifi className="w-5 h-5" />, name: "WiFi miễn phí", available: true },
        { icon: <Wind className="w-5 h-5" />, name: "Điều hòa", available: true },
        { icon: <Tv className="w-5 h-5" />, name: "TV màn hình phẳng", available: true },
        { icon: <Coffee className="w-5 h-5" />, name: "Minibar", available: true },
        { icon: <Car className="w-5 h-5" />, name: "Bãi đậu xe", available: true },
        { icon: <UtensilsCrossed className="w-5 h-5" />, name: "Nhà hàng", available: true },
        { icon: <Dumbbell className="w-5 h-5" />, name: "Phòng gym", available: true },
        { icon: <Waves className="w-5 h-5" />, name: "Hồ bơi", available: true },
    ];

    return (
        <div className="space-y-6">
            {/* Description */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Giới thiệu
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {service.description}
                </p>
            </div>

            {/* Hotel Amenities */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Tiện nghi khách sạn
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {hotelAmenities.map((amenity, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-lg ${amenity.available
                                ? "bg-orange-50 text-gray-900"
                                : "bg-gray-50 text-gray-400"
                                }`}
                        >
                            <div className={amenity.available ? "text-orange-500" : "text-gray-400"}>
                                {amenity.icon}
                            </div>
                            <span className="text-sm font-medium">{amenity.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Check-in/Check-out Policies */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Chính sách khách sạn
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Nhận phòng
                            </h4>
                            <p className="text-sm text-gray-600">Từ 14:00</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Trả phòng
                            </h4>
                            <p className="text-sm text-gray-600">Trước 12:00</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Lưu ý quan trọng</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>Vui lòng xuất trình CMND/CCCD khi nhận phòng</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>Không hút thuốc trong phòng</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>Không được mang thú cưng</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>Hủy miễn phí trước 24h</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Vị trí khách sạn
                </h3>
                <div className="bg-gray-200 rounded-xl overflow-hidden aspect-video relative shadow-sm border border-gray-100">
                    {service.address ? (
                        <iframe
                            title={`Bản đồ ${service.name}`}
                            width="100%"
                            height="100%"
                            src={mapSrc}
                            className="absolute inset-0 w-full h-full"
                            loading="lazy"
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <p>Chưa có thông tin bản đồ</p>
                        </div>
                    )}
                </div>
                <p className="mt-3 text-sm text-gray-600 flex items-start gap-2">
                    Địa chỉ: <span>{service.address}</span>
                </p>
            </div>
        </div>
    );
};

export default HotelInfoTab;
