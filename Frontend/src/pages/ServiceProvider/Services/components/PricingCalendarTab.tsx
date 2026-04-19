// src/pages/ServiceProvider/Services/components/PricingCalendarTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import { Card, CardContent } from '@/components/ui/admin/card';
import { ChevronLeft, ChevronRight, X, Check, Trash2 } from 'lucide-react';
import { MOCK_DAY_PRICING, type DayPricing } from '@/mocks/pricing';

interface PricingCalendarTabProps {
    serviceId: number;
    basePrice: number;
}

const PricingCalendarTab = ({ serviceId: _serviceId, basePrice }: PricingCalendarTabProps) => {
    // console.log("Rendering pricing for service", _serviceId);
    const [currentMonth, setCurrentMonth] = useState(new Date(2024, 1)); // February 2024
    const [dayPricing, setDayPricing] = useState<DayPricing[]>(MOCK_DAY_PRICING);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [customPrice, setCustomPrice] = useState('');
    const [customRooms, setCustomRooms] = useState('');

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getPriceForDate = (dateStr: string): number | null => {
        const pricing = dayPricing.find(p => p.date === dateStr);
        return pricing ? pricing.price : null;
    };

    const getRoomsForDate = (dateStr: string): number | null => {
        const pricing = dayPricing.find(p => p.date === dateStr);
        return pricing ? (pricing.remainingRooms ?? null) : null;
    };

    const handleDateClick = (dateStr: string) => {
        setSelectedDate(dateStr);
        const existingPrice = getPriceForDate(dateStr);
        const existingRooms = getRoomsForDate(dateStr);
        setCustomPrice(existingPrice ? existingPrice.toString() : '');
        setCustomRooms(existingRooms ? existingRooms.toString() : '');
    };

    const handleSaveParams = () => {
        if (!selectedDate) return;

        const price = customPrice ? parseInt(customPrice) : basePrice;
        const rooms = customRooms ? parseInt(customRooms) : undefined;
        
        const existing = dayPricing.find(p => p.date === selectedDate);

        if (existing) {
            setDayPricing(dayPricing.map(p =>
                p.date === selectedDate ? { ...p, price, remainingRooms: rooms, isSpecial: true } : p
            ));
        } else {
            setDayPricing([...dayPricing, {
                date: selectedDate,
                price,
                remainingRooms: rooms,
                isSpecial: true
            }]);
        }

        setSelectedDate(null);
        setCustomPrice('');
        setCustomRooms('');
    };

    const handleRemovePrice = (dateStr: string) => {
        setDayPricing(dayPricing.filter(p => p.date !== dateStr));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Lịch & Định giá</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Thiết lập giá và số lượng phòng/vé trống cho các ngày cụ thể
                    </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>
                        <span className="text-gray-600">Mặc định</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-50 border border-green-500 rounded-sm"></div>
                        <span className="text-gray-600">Đã tùy chỉnh giá/phòng</span>
                    </div>
                </div>
            </div>

            <Card className="shadow-sm border-gray-200 overflow-hidden">
                <CardContent className="p-0">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                        <Button variant="ghost" size="sm" onClick={prevMonth} className="hover:bg-gray-100">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                        <h4 className="text-lg font-bold text-gray-900 capitalize">
                            {monthNames[month]} {year}
                        </h4>
                        <Button variant="ghost" size="sm" onClick={nextMonth} className="hover:bg-gray-100">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </Button>
                    </div>

                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                        {dayNames.map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 bg-gray-100 gap-px border-b border-gray-200">
                        {/* Empty cells */}
                        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="bg-white min-h-[100px]" />
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const day = idx + 1;
                            const dateStr = formatDate(year, month, day);
                            const customPriceForDay = getPriceForDate(dateStr);
                            const customRoomsForDay = getRoomsForDate(dateStr);
                            const isSelected = selectedDate === dateStr;
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(dateStr)}
                                    className={`
                                        relative group min-h-[100px] p-2 text-left transition-all outline-none
                                        hover:z-10 bg-white hover:shadow-md
                                        ${isSelected ? 'ring-2 ring-inset ring-orange-500 z-10' : ''}
                                        ${(customPriceForDay || customRoomsForDay !== null) ? 'bg-green-50/30' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                            ${isToday ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700'}
                                            ${isSelected && !isToday ? 'bg-orange-100 text-orange-700' : ''}
                                        `}>
                                            {day}
                                        </span>
                                        {(customPriceForDay || customRoomsForDay !== null) && (
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        )}
                                    </div>

                                    <div className="mt-2 space-y-1 text-right">
                                        <div className={`text-xs font-bold ${customPriceForDay ? 'text-green-700' : 'text-gray-400'}`}>
                                            {formatPrice(customPriceForDay || basePrice)}
                                        </div>
                                        {customRoomsForDay !== null && (
                                            <div className="text-[10px] text-orange-600 font-semibold italic">
                                                Còn {customRoomsForDay} chỗ
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Price & Availability Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200" onClick={() => setSelectedDate(null)}>
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Thiết lập ngày cụ thể</h4>
                                    <p className="text-sm text-gray-500">Ngày {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)} className="h-8 w-8 p-0 rounded-full">
                                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Giá áp dụng (VND)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={customPrice}
                                                onChange={(e) => setCustomPrice(e.target.value)}
                                                placeholder={basePrice.toString()}
                                                className="font-semibold"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Số lượng trống</Label>
                                        <Input
                                            type="number"
                                            value={customRooms}
                                            onChange={(e) => setCustomRooms(e.target.value)}
                                            placeholder="Không giới hạn"
                                            className="font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button onClick={handleSaveParams} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                        <Check className="w-4 h-4 mr-2" />
                                        Lưu thay đổi
                                    </Button>
                                    {(getPriceForDate(selectedDate) || getRoomsForDate(selectedDate) !== null) && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                handleRemovePrice(selectedDate);
                                                setSelectedDate(null);
                                            }}
                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Xóa tùy chỉnh
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PricingCalendarTab;
