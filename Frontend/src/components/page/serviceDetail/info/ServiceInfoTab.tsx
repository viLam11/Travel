// src/components/page/serviceDetail/info/ServiceInfoTab.tsx
import React from 'react';

interface ServiceInfoTabProps {
    service: any;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    getDaysInMonth: (monthKey: string) => any[];
    getFeatureIcon: (iconName: string) => React.ReactNode;
}

const ServiceInfoTab: React.FC<ServiceInfoTabProps> = ({
    service,
    selectedMonth,
    setSelectedMonth,
    getDaysInMonth,
    getFeatureIcon,
}) => {
    const months = ["Tháng 9/2025", "Tháng 10/2025", "Tháng 11/2025"];
    const monthKeys = ["2025-09", "2025-10", "2025-11"];
    const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const encodedAddress = encodeURIComponent(service?.address ?? "Hoàn Kiếm, Hà Nội");
    const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="space-y-6">
            {/* Description */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Thông tin
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {service.description}
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {service.features.map((feature: any, idx: number) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                            {getFeatureIcon(feature.icon)}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                            {feature.title}:
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Calendar Booking */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Đặt lịch
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-gray-200">
                        {months.map((month, idx) => (
                            <button
                                key={month}
                                onClick={() => setSelectedMonth(monthKeys[idx])}
                                className={`py-3 text-xs sm:text-sm font-medium transition-colors ${selectedMonth === monthKeys[idx]
                                    ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {month}
                            </button>
                        ))}
                    </div>

                    <div className="p-3 sm:p-4">
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs sm:text-sm font-medium text-gray-600 py-2"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {getDaysInMonth(selectedMonth).map((day: any, idx: number) => (
                                <div key={idx} className="aspect-square">
                                    {day ? (
                                        <button
                                            disabled={!day.available}
                                            className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-xs transition-all ${day.available
                                                ? "bg-gray-50 hover:bg-orange-100 text-orange-600 font-medium cursor-pointer"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            <span>{day.day}</span>
                                            {day.price && (
                                                <span className="text-[10px] sm:text-xs font-semibold">
                                                    {day.price}
                                                </span>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Vị trí bản đồ
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

export default ServiceInfoTab;
