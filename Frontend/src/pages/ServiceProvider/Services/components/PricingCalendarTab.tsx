import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import { Card, CardContent } from '@/components/ui/admin/card';
import { ChevronLeft, ChevronRight, X, Trash2, Loader2, Save, ListFilter, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import availabilityApi, { type PriceCalendarResponse, type PriceSubCalendarResponse } from '@/api/availabilityApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/admin/select';

interface PricingCalendarTabProps {
    serviceId: string;
    basePrice: number;
}

const PricingCalendarTab = ({ serviceId, basePrice }: PricingCalendarTabProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState<PriceCalendarResponse | null>(null);
    const [selectedItem, setSelectedItem] = useState<PriceSubCalendarResponse | null>(null);
    const [dayPricing, setDayPricing] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [customPrice, setCustomPrice] = useState('');
    const [customRooms, setCustomRooms] = useState('');

    // Fetch calendar data from API
    const fetchCalendarData = async () => {
        setIsLoading(true);
        try {
            const data = await availabilityApi.getPriceCalendar(
                serviceId, 
                currentMonth.getFullYear(), 
                currentMonth.getMonth() + 1
            );
            setCalendarData(data);
            
            if (data?.subCalendars && data.subCalendars.length > 0) {
                const item = selectedItem 
                    ? data.subCalendars.find(s => s.id === selectedItem.id) || data.subCalendars[0]
                    : data.subCalendars[0];
                setSelectedItem(item);
                mapExceptionsToPricing(item);
            }
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
            toast.error('Không thể tải dữ liệu lịch giá');
        } finally {
            setIsLoading(false);
        }
    };

    const mapExceptionsToPricing = (item: PriceSubCalendarResponse) => {
        const pricing = item?.exceptions?.map((ex: any) => ({
            date: ex.date,
            price: ex.price,
            stock: ex.stock,
            isOpen: ex.isOpen,
            isSpecial: true
        })) || [];
        setDayPricing(pricing);
    };

    useEffect(() => {
        fetchCalendarData();
    }, [serviceId, currentMonth]);

    useEffect(() => {
        if (selectedItem) {
            mapExceptionsToPricing(selectedItem);
        }
    }, [selectedItem]);

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
        return pricing ? (pricing.stock ?? null) : null;
    };

    const handleDateClick = (dateStr: string) => {
        setSelectedDate(dateStr);
        const existingPrice = getPriceForDate(dateStr);
        const existingRooms = getRoomsForDate(dateStr);
        setCustomPrice(existingPrice !== null ? existingPrice.toString() : '');
        setCustomRooms(existingRooms !== null ? existingRooms.toString() : '');
    };

    const handleSaveParams = async () => {
        if (!selectedDate || !selectedItem) return;

        setIsSaving(true);
        try {
            const price = customPrice ? parseFloat(customPrice) : selectedItem.basePrice;
            
            const configs = [{
                date: selectedDate,
                price: price,
                stock: customRooms ? parseFloat(customRooms) : undefined,
                isOpen: true, // Default to open if we set price
                note: 'Updated from calendar'
            }];

            await availabilityApi.upsertPrices(serviceId, selectedItem.id, configs);
            toast.success('Cập nhật giá thành công');
            await fetchCalendarData();
            setSelectedDate(null);
        } catch (error) {
            console.error('Failed to save price:', error);
            toast.error('Lỗi khi lưu giá');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemovePrice = async (dateStr: string) => {
        if (!selectedItem) return;
        
        // If we had an ID from backend, we could call delete, 
        // but upsert with basePrice usually resets it.
        // For now, let's just refetch after a small delay or use a specific reset.
        setIsSaving(true);
        try {
            // Reset to base price
            await availabilityApi.upsertPrices(serviceId, selectedItem.id, [{
                date: dateStr,
                price: selectedItem.basePrice,
                isOpen: true
            }]);
            toast.success('Đã quay về giá mặc định');
            await fetchCalendarData();
        } catch (error) {
            toast.error('Lỗi khi xóa tùy chỉnh');
        } finally {
            setIsSaving(false);
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Lịch & Định giá</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Thiết lập giá và số lượng trống cho từng loại vé/phòng cụ thể
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {calendarData && calendarData.subCalendars?.length > 0 && (
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                            <ListFilter className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <Select 
                                value={selectedItem?.id} 
                                onValueChange={(val: string) => {
                                    const item = calendarData.subCalendars?.find(s => s.id === val);
                                    if (item) setSelectedItem(item);
                                }}
                            >
                                <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 px-0 text-xs font-bold text-gray-700 min-w-[180px] max-w-[260px]">
                                    <SelectValue placeholder="Chọn loại vé/phòng" />
                                </SelectTrigger>
                                <SelectContent className="z-[60]">
                                    {calendarData.subCalendars?.map(item => (
                                        <SelectItem key={item.id} value={item.id} className="text-xs">
                                            {item.name} ({item.basePrice.toLocaleString()}đ)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] sm:text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>
                            <span className="text-gray-600">Mặc định</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-green-50 border border-green-500 rounded-sm"></div>
                            <span className="text-gray-600">Tùy chỉnh</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl border border-dashed border-gray-200">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Đang tải dữ liệu lịch giá...</p>
                </div>
            ) : (
                <Card className="shadow-sm border-gray-200 overflow-hidden relative">
                    {isSaving && (
                        <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                                <span className="text-xs font-bold text-gray-700">Đang lưu...</span>
                            </div>
                        </div>
                    )}
                    <CardContent className="p-0">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-white">
                            <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 hover:bg-gray-100">
                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                            </Button>
                            <h4 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                                {monthNames[month]} {year}
                            </h4>
                            <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 hover:bg-gray-100">
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </Button>
                        </div>

                        {/* Day Names Header */}
                        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                            {dayNames.map((day) => (
                                <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 sm:py-3">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 bg-gray-100 gap-px border-b border-gray-200">
                            {/* Empty cells */}
                            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="bg-white min-h-[70px] sm:min-h-[100px]" />
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
                                            relative group min-h-[70px] sm:min-h-[100px] p-1.5 sm:p-2 text-left transition-all outline-none
                                            hover:z-10 bg-white hover:shadow-md
                                            ${isSelected ? 'ring-2 ring-inset ring-orange-500 z-10' : ''}
                                            ${(customPriceForDay || customRoomsForDay !== null) ? 'bg-green-50/30' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`
                                                text-[10px] sm:text-sm font-medium w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full
                                                ${isToday ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700'}
                                                ${isSelected && !isToday ? 'bg-orange-100 text-orange-700' : ''}
                                            `}>
                                                {day}
                                            </span>
                                            {(customPriceForDay || customRoomsForDay !== null) && (
                                                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                                            )}
                                        </div>

                                        <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-right">
                                            <div className={`text-[8px] sm:text-xs font-bold ${customPriceForDay ? 'text-green-700' : 'text-gray-400'}`}>
                                                {formatPrice(customPriceForDay || (selectedItem ? selectedItem.basePrice : basePrice))}
                                            </div>
                                            {customRoomsForDay !== null && (
                                                <div className="text-[7px] sm:text-[10px] text-orange-600 font-semibold italic">
                                                    Còn {customRoomsForDay}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Price & Availability Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200" onClick={() => setSelectedDate(null)}>
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Thiết lập ngày cụ thể</h4>
                                    <p className="text-sm text-gray-500">Ngày {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)} className="h-8 w-8 p-0 rounded-full">
                                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700">Giá áp dụng (VND)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={customPrice}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || parseFloat(val) >= 0) {
                                                        setCustomPrice(val);
                                                    }
                                                }}
                                                placeholder={selectedItem ? selectedItem.basePrice.toString() : (basePrice || 0).toString()}
                                                className="font-bold border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-9"
                                                autoFocus
                                            />
                                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700">Số lượng trống</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={customRooms}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || parseFloat(val) >= 0) {
                                                    setCustomRooms(val);
                                                }
                                            }}
                                            placeholder="Không giới hạn"
                                            className="font-bold border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        onClick={handleSaveParams} 
                                        disabled={isSaving}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold h-11"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
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
