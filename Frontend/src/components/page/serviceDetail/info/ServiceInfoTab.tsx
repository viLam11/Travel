// src/components/page/serviceDetail/info/ServiceInfoTab.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import { getTagIcon } from '@/utils/tagIconMapper';
import toast from 'react-hot-toast';

interface ServiceInfoTabProps {
    service: any;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    getDaysInMonth: (monthKey: string) => any[];
    getFeatureIcon: (iconName: string) => React.ReactNode;
    dynamicMonths: { label: string; value: string }[];
    onSelectDate?: (date: string) => void;
    isCalendarLoading?: boolean;
}

const ServiceInfoTab: React.FC<ServiceInfoTabProps> = ({
    service,
    selectedMonth,
    setSelectedMonth,
    getDaysInMonth,
    getFeatureIcon,
    dynamicMonths,
    onSelectDate,
    isCalendarLoading = false,
}) => {
    const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    // Hàm kiểm tra ngày có phải quá khứ không
    const isTodayOrPast = (monthKey: string, dayNum: number): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1, dayNum);
        return date < today;
    };

    const lat = service?.latitude || service?.location_lat;
    const lng = service?.longitude || service?.location_lng;
    const encodedAddress = encodeURIComponent(service?.address ?? "Hoàn Kiếm, Hà Nội");
    const mapSrc = (lat && lng) 
        ? `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`
        : `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="space-y-6">
            {/* Description */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Thông tin
                </h3>
                <div 
                    className="text-gray-700 leading-relaxed text-sm sm:text-base [&>p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.description) }}
                />

            </div>

            {/* Điểm nổi bật & Dịch vụ (Tags) */}
            {service.tags && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Điểm nổi bật & Dịch vụ
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {service.tags.split(',').filter((t: string) => t.trim()).map((tag: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100/50 hover:bg-orange-100 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    {getTagIcon(tag.trim(), 'w-4 h-4')}
                                </div>
                                <span className="text-sm font-medium text-gray-800 capitalize">{tag.trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar Booking */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Đặt lịch
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-gray-200">
                        {dynamicMonths.map((monthObj) => (
                            <button
                                key={monthObj.value}
                                onClick={() => setSelectedMonth(monthObj.value)}
                                className={`py-3 text-xs sm:text-sm font-medium transition-colors ${selectedMonth === monthObj.value
                                    ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {monthObj.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-3 sm:p-4 relative min-h-[300px]">
                        {isCalendarLoading && (
                            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-medium text-orange-600">Đang tải giá...</span>
                                </div>
                            </div>
                        )}
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
                            {getDaysInMonth(selectedMonth).map((day: any, idx: number) => {
                                const isPast = day ? isTodayOrPast(selectedMonth, day.day) : false;
                                return (
                                <div key={idx} className="aspect-square">
                                    {day ? (
                                        <button
                                            onClick={() => {
                                                if (isPast) {
                                                    toast.error('Không thể chọn ngày trong quá khứ');
                                                } else if (!day.available) {
                                                    toast.error('Dịch vụ đã hết chỗ trong thời gian này');
                                                } else if (onSelectDate) {
                                                    const dateStr = `${selectedMonth}-${String(day.day).padStart(2, '0')}`;
                                                    onSelectDate(dateStr);
                                                }
                                            }}
                                            className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-xs transition-all relative ${
                                                isPast
                                                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                                : day.available
                                                ? "bg-gray-50 hover:bg-orange-100 text-orange-600 font-medium cursor-pointer"
                                                : "bg-gray-100 text-gray-400 cursor-pointer"
                                                }`}
                                        >
                                            <span className={isPast || !day.available ? 'line-through opacity-50' : ''}>{day.day}</span>
                                            {isPast ? (
                                                <span className="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase mt-0.5">Đã qua</span>
                                            ) : day.available ? (
                                                <>
                                                    {day.price && (
                                                        <span className="text-[10px] sm:text-[11px] font-bold">
                                                            {day.price.includes('đ') ? day.price : `${new Intl.NumberFormat('vi-VN').format(Number(day.price))}đ`}
                                                        </span>
                                                    )}
                                                    {day.rooms !== null && (
                                                        <span className="text-[8px] sm:text-[9px] text-orange-500 font-semibold absolute bottom-1">
                                                            Còn {day.rooms}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase mt-0.5">Hết chỗ</span>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                                );
                            })}
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
