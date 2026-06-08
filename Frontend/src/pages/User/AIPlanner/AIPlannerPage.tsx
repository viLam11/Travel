// src/pages/User/AIPlanner/AIPlannerPage.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Sparkles, MapPin, Calendar, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Loader2,
    X, GripVertical, Plus, RotateCcw, Sun, Moon,
    Clock, DollarSign, Wand2, ArrowRightLeft,
    Waves, Landmark, UtensilsCrossed, Mountain, ShoppingBag, Leaf, BedDouble, Camera,
    CalendarDays, Banknote, CheckCircle2, PlaneTakeoff, Compass, Receipt,
    BookOpen, BarChart2, Edit2, Share2, Cloud, CloudUpload, XCircle, Settings, ExternalLink, Search, Copy, Trash2,
    Globe, FolderOpen, TrendingUp, Wallet, Users, LayoutGrid, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/common/avatar/Avatar';
import { aiPlannerApi, USE_MOCK_AI_PLANNER } from '@/api/aiPlannerApi';
import apiClient from '@/services/apiClient';
import { MOCK_LIBRARY_ACTIVITIES } from '@/mocks/aiPlanner';
import type { ItineraryDay, Activity, TimeSlot, PlanData, PreferenceService } from '@/types/aiPlanner.types';
import SharePlanModal from './components/SharePlanModal';
import toast from 'react-hot-toast';
import { useConfirm } from '@/contexts/ConfirmContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────
let idCounter = 0;
const uid = () => `act-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`;

const injectIds = (itin: ItineraryDay[]) => {
    return itin.map(day => ({
        ...day,
        morning_activities: day.morning_activities.map(a => ({ ...a, id: a.id || uid() })),
        afternoon_activities: day.afternoon_activities.map(a => ({ ...a, id: a.id || uid() })),
        evening_activities: day.evening_activities.map(a => ({ ...a, id: a.id || uid() })),
    }));
};

// ─── Cost Helpers ─────────────────────────────────────────────────────────────
const parseCostAmount = (costStr?: string): number => {
    if (!costStr || costStr === 'Miễn phí' || costStr === 'Liên hệ') return 0;
    return parseInt(costStr.replace(/[^\d]/g, ''), 10) || 0;
};

const getActivityCost = (act: Activity): number =>
    act.cost_amount != null ? act.cost_amount : parseCostAmount(act.estimated_cost);

const formatVND = (n: number): string =>
    n === 0 ? '0₫' : `${n.toLocaleString('vi-VN')}₫`;

const calcDayCost = (day: ItineraryDay): number =>
    [...day.morning_activities, ...day.afternoon_activities, ...day.evening_activities]
        .reduce((s, a) => s + getActivityCost(a), 0);

const SLOT_META: Record<TimeSlot, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    morning_activities: { label: 'Buổi sáng', icon: <Sun className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    afternoon_activities: { label: 'Buổi chiều', icon: <Cloud className="w-4 h-4" />, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    evening_activities: { label: 'Buổi tối', icon: <Moon className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
};

const SLOT_ORDER: TimeSlot[] = ['morning_activities', 'afternoon_activities', 'evening_activities'];

const INTEREST_TAGS: { label: string; icon: React.ReactNode }[] = [
    { label: 'Biển', icon: <Waves className="w-3.5 h-3.5" /> },
    { label: 'Văn hóa', icon: <Landmark className="w-3.5 h-3.5" /> },
    { label: 'Ẩm thực', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { label: 'Mạo hiểm', icon: <Mountain className="w-3.5 h-3.5" /> },
    { label: 'Mua sắm', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { label: 'Thiên nhiên', icon: <Leaf className="w-3.5 h-3.5" /> },
    { label: 'Nghỉ dưỡng', icon: <BedDouble className="w-3.5 h-3.5" /> },
    { label: 'Chụp ảnh', icon: <Camera className="w-3.5 h-3.5" /> },
];

const SERVICE_TYPE_LABELS: Record<string, string> = {
    TICKET_VENUE: 'Vé/Điểm đến',
    HOTEL: 'Khách sạn',
    TOUR_SERVICE: 'Tour',
    RESTAURANT: 'Nhà hàng',
};

const SERVICE_TYPE_BADGE: Record<string, string> = {
    TICKET_VENUE: 'bg-amber-100 text-amber-700',
    HOTEL: 'bg-blue-100 text-blue-700',
    TOUR_SERVICE: 'bg-green-100 text-green-700',
    RESTAURANT: 'bg-rose-100 text-rose-700',
};

const prefToActivity = (pref: PreferenceService): Activity => ({
    id: pref.id,
    name: pref.serviceName,
    description: '',
    duration: '1-2 giờ',
    estimated_cost: pref.averagePrice != null && pref.averagePrice > 0
        ? `${Number(pref.averagePrice).toLocaleString('vi-VN')}₫`
        : 'Liên hệ',
    location: '',
    isSystemService: true,
    serviceUrl: pref.url,
    serviceId: pref.id,
    thumbnailUrl: pref.thumbnailUrl,
    serviceType: pref.serviceType,
});

const DESTINATION_THUMBNAILS: Record<string, string> = {
    'đà nẵng': 'https://images.unsplash.com/photo-1559592442-7e182c940340?q=80&w=800',
    'hà nội': 'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800',
    'hồ chí minh': 'https://images.unsplash.com/photo-1529158017274-924a61fe4178?q=80&w=800',
    'sài gòn': 'https://images.unsplash.com/photo-1529158017274-924a61fe4178?q=80&w=800',
    'đà lạt': 'https://images.unsplash.com/photo-1599354145952-45e3f4e1f760?q=80&w=800',
    'nha trang': 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=800',
    'phú quốc': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800',
    'hội an': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
    'hạ long': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800',
    'phong nha': 'https://images.unsplash.com/photo-1505353547171-d60f54518774?q=80&w=800',
    'huế': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=800',
    'vũng tàu': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800',
};

const getThumbnail = (place: string) => {
    const key = (place || '').toLowerCase().trim();
    if (key.length < 2 || /^\d+$/.test(key)) {
        return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800';
    }
    for (const [city, url] of Object.entries(DESTINATION_THUMBNAILS)) {
        if (key.includes(city)) return url;
    }
    return `https://loremflickr.com/600/400/landscape,travel,${encodeURIComponent(key)}/all`;
};

interface DragPayload {
    activityId: string;
    fromDayIdx: number | null;
    fromSlot: TimeSlot | null;
}

// ─── Activity Modal ──────────────────────────────────────────────────────────

function ActivityModal({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Activity>) => void;
    initialData?: Activity;
}) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [duration, setDuration] = useState(initialData?.duration || '1 giờ');
    const [costAmount, setCostAmount] = useState<number>(
        initialData?.cost_amount ?? parseCostAmount(initialData?.estimated_cost)
    );
    const [location, setLocation] = useState(initialData?.location || '');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setDescription(initialData?.description || '');
            setDuration(initialData?.duration || '1 giờ');
            setCostAmount(initialData?.cost_amount ?? parseCostAmount(initialData?.estimated_cost));
            setLocation(initialData?.location || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const formattedCost = costAmount > 0 ? formatVND(costAmount) : 'Miễn phí';
        onSave({ name: name.trim(), description, duration, cost_amount: costAmount, estimated_cost: formattedCost, location });
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-orange-500" />
                            {initialData ? 'Chỉnh sửa chi tiết' : 'Thêm hoạt động mới'}
                        </h3>
                        <button onClick={onClose} className="p-1.5 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tên địa điểm / Hoạt động</label>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="VD: Nhà thờ Đức Bà, Ăn tối tại..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all text-sm font-bold"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-orange-400" /> Thời gian
                                </label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    placeholder="VD: 1.5 giờ"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-orange-400" /> Chi phí (VND)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={costAmount || ''}
                                        onChange={e => setCostAmount(parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        min={0}
                                        step={10000}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm pr-6"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">₫</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap -mt-1">
                            {[0, 50000, 100000, 200000, 500000, 1000000].map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setCostAmount(preset)}
                                    className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all cursor-pointer ${costAmount === preset ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'}`}
                                >
                                    {preset === 0 ? 'Miễn phí' : preset >= 1000000 ? `${preset / 1000000}tr` : `${preset / 1000}k`}
                                </button>
                            ))}
                        </div>
                        {costAmount > 0 && (
                            <p className="text-xs text-orange-600 font-semibold -mt-1">{formatVND(costAmount)}</p>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-orange-400" /> Địa chỉ
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="Quận 1, TP. HCM..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Mô tả chi tiết</label>
                            <textarea
                                rows={5}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Ghi chú thêm về địa điểm này..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none italic leading-relaxed"
                            />
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-xl transition-colors border border-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-orange-200 hover:shadow-lg active:scale-[0.98]"
                            >
                                {initialData ? 'Lưu thay đổi' : 'Thêm vào plan'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity, onRemove, onEdit, onDragStart, onMobileMove, onSelect }: {
    activity: Activity;
    onRemove: () => void;
    onEdit?: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onMobileMove?: () => void;
    onSelect?: () => void;
}) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // ── System service card (has thumbnail) ──
    if (activity.isSystemService && activity.thumbnailUrl) {
        return (
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group relative">
                <div
                    draggable
                    onDragStart={onDragStart}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 select-none cursor-grab active:cursor-grabbing"
                >
                    <div className="flex gap-0">
                        <div className="w-20 shrink-0 relative self-stretch">
                            <img
                                src={activity.thumbnailUrl}
                                alt={activity.name}
                                className="w-full h-full object-cover min-h-[72px]"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                            {activity.serviceType && (
                                <span className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${SERVICE_TYPE_BADGE[activity.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                                    {SERVICE_TYPE_LABELS[activity.serviceType] || activity.serviceType}
                                </span>
                            )}
                        </div>
                        <div
                            className="flex-1 p-2.5 min-w-0 flex flex-col justify-between cursor-pointer"
                            onClick={e => { e.stopPropagation(); onSelect?.(); }}
                        >
                            <div>
                                <p className="font-bold text-sm text-gray-800 leading-tight group-hover:text-orange-600 transition-colors truncate">{activity.name}</p>
                                <p className="text-[11px] font-semibold text-orange-600 mt-0.5">{activity.estimated_cost}</p>
                                {activity.description && (
                                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 italic">{activity.description}</p>
                                )}
                            </div>
                            {activity.serviceUrl && (
                                <button
                                    onClick={e => { e.stopPropagation(); navigate(activity.serviceUrl!); }}
                                    className="text-[10px] text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-0.5 mt-1.5 w-fit"
                                >
                                    <ExternalLink className="w-3 h-3" /> Xem chi tiết
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 p-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                                <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1 hover:bg-orange-50 text-gray-300 hover:text-orange-500 rounded transition-colors" title="Chỉnh sửa">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); onRemove(); }} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors" title="Xóa">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
                {onMobileMove && (
                    <button onClick={onMobileMove} className="lg:hidden absolute top-1.5 right-1.5 p-1 bg-orange-50 text-orange-500 rounded-full shadow-sm">
                        <ArrowRightLeft className="w-3 h-3" />
                    </button>
                )}
            </motion.div>
        );
    }

    // ── Regular card ──
    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group relative">
            <div
                draggable
                onDragStart={onDragStart}
                className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 select-none"
            >
                <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0 text-gray-300 group-hover:text-orange-400 transition-colors hidden lg:block cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div
                        className="flex-1 min-w-0"
                        onClick={() => onSelect?.()}
                        style={onSelect ? { cursor: 'pointer' } : undefined}
                    >
                        <p className="font-bold text-sm text-gray-800 leading-tight group-hover:text-orange-600 transition-colors">{activity.name}</p>
                        {activity.description && (
                            <div className="relative mt-1">
                                <p
                                    className={`text-[11px] text-gray-500 leading-relaxed italic transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}
                                    dangerouslySetInnerHTML={{ __html: activity.description || '' }}
                                />
                                {activity.description.length > 60 && (
                                    <button
                                        onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                        className="cursor-pointer text-[10px] text-orange-500 hover:text-orange-600 font-semibold mt-0.5 flex items-center gap-0.5"
                                    >
                                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                <Clock className="w-3 h-3 text-orange-400" />{activity.duration}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                <DollarSign className="w-3 h-3 text-orange-400" />{activity.estimated_cost}
                            </span>
                            {activity.location && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                    <MapPin className="w-3 h-3 text-orange-400" /><span className="truncate max-w-[100px]">{activity.location}</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <button onClick={onEdit} className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-md transition-colors" title="Chỉnh sửa chi tiết">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={onRemove}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                            title="Xóa"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {onMobileMove && (
                        <button
                            onClick={onMobileMove}
                            className="lg:hidden absolute top-2 right-2 p-1.5 bg-orange-50 text-orange-500 rounded-full shadow-sm"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({ dayIdx, slot, activities = [], onDrop, onRemove, onEditActivity, onUpdateActivity, onDragStartCard, onAddActivity, onMobileMove, onMoveSlot, canMoveUp, canMoveDown, onSelectActivity }: {
    dayIdx: number; slot: TimeSlot; activities?: Activity[];
    onDrop: (e: React.DragEvent, toDayIdx: number, toSlot: TimeSlot) => void;
    onRemove: (dayIdx: number, slot: TimeSlot, actIdx: number) => void;
    onEditActivity: (dayIdx: number, slot: TimeSlot, actIdx: number) => void;
    onUpdateActivity: (dayIdx: number, slot: TimeSlot, actIdx: number, data: Partial<Activity>) => void;
    onDragStartCard: (e: React.DragEvent, payload: DragPayload) => void;
    onAddActivity: (dayIdx: number, slot: TimeSlot) => void;
    onMobileMove?: (activityId: string, fromDayIdx: number, fromSlot: TimeSlot) => void;
    onMoveSlot?: (direction: 'up' | 'down') => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    onSelectActivity?: (dayIdx: number, slot: TimeSlot, actIdx: number) => void;
}) {
    const [over, setOver] = useState(false);
    const meta = SLOT_META[slot];

    return (
        <div className="space-y-1.5">
            <div className={`flex items-center gap-1.5 mb-1 ${meta.color}`}>
                {meta.icon}
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{meta.label}</span>
                <span className="text-[10px] bg-white/50 px-1.5 rounded-full border border-current opacity-70">{activities.length}</span>
                {onMoveSlot && (
                    <div className="ml-auto flex gap-0.5">
                        <button
                            onClick={() => onMoveSlot('up')}
                            disabled={!canMoveUp}
                            className={`p-0.5 rounded transition-colors ${canMoveUp ? 'hover:bg-white/60 text-current opacity-60 hover:opacity-100' : 'opacity-20 cursor-not-allowed'}`}
                            title="Di lên"
                        >
                            <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onMoveSlot('down')}
                            disabled={!canMoveDown}
                            className={`p-0.5 rounded transition-colors ${canMoveDown ? 'hover:bg-white/60 text-current opacity-60 hover:opacity-100' : 'opacity-20 cursor-not-allowed'}`}
                            title="Di xuống"
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
            <div
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { setOver(false); onDrop(e, dayIdx, slot); }}
                className={`min-h-[80px] rounded-2xl p-2.5 space-y-2.5 border-2 border-dashed transition-all duration-300 ${over
                    ? 'border-orange-500 bg-orange-50/50 scale-[1.02] shadow-inner'
                    : `${meta.border} ${meta.bg.replace('bg-', 'bg-')}/40 hover:bg-white/50`
                    }`}
            >
                <AnimatePresence mode="popLayout">
                    {activities.map((act, idx) => (
                        <ActivityCard
                            key={act.id || idx}
                            activity={act}
                            onRemove={() => onRemove(dayIdx, slot, idx)}
                            onEdit={() => onEditActivity(dayIdx, slot, idx)}
                            onDragStart={e => onDragStartCard(e, { activityId: act.id!, fromDayIdx: dayIdx, fromSlot: slot })}
                            onMobileMove={onMobileMove ? () => onMobileMove(act.id!, dayIdx, slot) : undefined}
                            onSelect={onSelectActivity ? () => onSelectActivity(dayIdx, slot, idx) : undefined}
                        />
                    ))}
                </AnimatePresence>
                {activities.length === 0 && !over && (
                    <div className="hidden lg:flex items-center justify-center py-6 text-xs text-gray-400 italic font-medium">
                        <Plus className="w-3.5 h-3.5 mr-1 opacity-50" /> Thả địa điểm vào đây
                    </div>
                )}
            </div>
            <button
                onClick={() => onAddActivity(dayIdx, slot)}
                className="w-full text-[10px] sm:text-xs text-gray-400 hover:text-orange-500 py-1.5 flex items-center justify-center gap-1 hover:bg-white rounded-xl transition-all border border-transparent hover:border-orange-100 hover:shadow-sm"
            >
                <Plus className="w-3.5 h-3.5" /> Thêm thủ công
            </button>
        </div>
    );
}

// ─── Chat Panel ──────────────────────────────────────────────────────────────

// ─── Input Screen ─────────────────────────────────────────────────────────────

const SAMPLE_PREVIEW = [
    { time: 'Buổi sáng', icon: 'morning', name: 'Hồ Hoàn Kiếm', loc: 'Hoàn Kiếm', cost: 'Miễn phí', duration: '2 giờ' },
    { time: 'Buổi chiều', icon: 'afternoon', name: 'Văn Miếu Quốc Tử Giám', loc: 'Đống Đa', cost: '30.000đ', duration: '1.5 giờ' },
    { time: 'Buổi tối', icon: 'evening', name: 'Phố ăn đêm Tạ Hiện', loc: 'Hoàn Kiếm', cost: '150.000đ', duration: '2 giờ' },
];


function InputScreen({ onGenerate, onManualCreate }: { onGenerate: (place: string, days: number, info: string) => Promise<void>; onManualCreate: (place: string, days: number) => void; }) {
    const { isAuthenticated } = useAuth();
    const [cloningId, setCloningId] = useState<string | null>(null);
    const publicPlansRef = useRef<HTMLDivElement>(null);
    const [place, setPlace] = useState('');
    const [days, setDays] = useState(3);
    const [interests, setInterests] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [specificLocation, setSpecificLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
    const [provinceOpen, setProvinceOpen] = useState(false);
    const [provinceSearch, setProvinceSearch] = useState('');
    const provinceRef = useRef<HTMLDivElement>(null);
    const [filterCity, setFilterCity] = useState('');
    const [filterDays, setFilterDays] = useState('');
    const [apiPublicPlans, setApiPublicPlans] = useState<PlanData[]>([]);
    const [publicPlansLoading, setPublicPlansLoading] = useState(true);
    const navigate = useNavigate();

    const filteredProvinces = provinces.filter(p =>
        p.name.toLowerCase().includes(provinceSearch.toLowerCase())
    );

    const filteredPlans = apiPublicPlans.filter(p => {
        const cityMatch = !filterCity || p.destination.toLowerCase().includes(filterCity.toLowerCase()) || p.title.toLowerCase().includes(filterCity.toLowerCase());
        const daysMatch = !filterDays || (filterDays === '1-2' ? p.days <= 2 : filterDays === '3-4' ? (p.days >= 3 && p.days <= 4) : p.days >= 5);
        return cityMatch && daysMatch;
    });

    useEffect(() => {
        apiClient.provinces.getAll()
            .then(data => setProvinces(data))
            .catch(err => console.error('Failed to fetch provinces', err));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) {
                setProvinceOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        aiPlannerApi.getPublicPlans(0, 9)
            .then(res => setApiPublicPlans(res.content))
            .catch(() => setApiPublicPlans([]))
            .finally(() => setPublicPlansLoading(false));
    }, []);

    const toggleInterest = (tag: string) =>
        setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const handleClone = async (planId: string, title: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để clone kế hoạch này về tài khoản của bạn.');
            navigate('/login');
            return;
        }
        setCloningId(planId);
        try {
            const cloned = await aiPlannerApi.clonePlan(planId);
            toast.success(`Đã clone "${title}" về kế hoạch của bạn!`);
            navigate(`/ai-planner/${cloned.id}`);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || '';
            if (msg.toLowerCase().includes('own')) {
                toast.error('Bạn không thể clone kế hoạch của chính mình.');
            } else {
                toast.error('Clone thất bại, vui lòng thử lại.');
            }
        } finally {
            setCloningId(null);
        }
    };

    const handleSubmit = async () => {
        if (!place.trim()) return;
        setLoading(true);
        const formattedPlace = place.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        const additionalInfo = [
            specificLocation.trim() ? `Chi tiet vi tri mong muon: ${specificLocation}` : '',
            interests.length ? `So thich: ${interests.join(', ')}` : '',
            notes.trim() ? `Ghi chu: ${notes}` : '',
        ].filter(Boolean).join('. ');
        await onGenerate(formattedPlace, days, additionalInfo);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-gray-50 to-white">
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white py-14 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" /> Powered by Gemini AI
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-sm">
                        Lập kế hoạch du lịch<br />thông minh cùng AI
                    </h1>
                    <p className="text-lg text-white/90">Nhập điểm đến — AI tạo lịch trình, bạn chỉnh theo ý <b>nhanh chóng</b>.</p>
                    {USE_MOCK_AI_PLANNER && (
                        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">Chế độ Demo</span>
                    )}
                </div>
            </div>

            {/* ── 3-Column Layout: Features | Form | Sample Plan ── */}
            <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 items-start">

                    {/* LEFT: Feature highlights */}
                    <div className="hidden lg:flex flex-col gap-4 pt-10">
                        {[
                            { icon: <CalendarDays className="w-5 h-5 text-orange-500" />, title: 'Lịch trình rõ ràng', desc: 'Chia theo Ngày · Sáng · Chiều · Tối' },
                            { icon: <Compass className="w-5 h-5 text-sky-500" />, title: 'Kéo thả tự do', desc: 'Di chuyển hoạt động giữa các ngày' },
                            { icon: <Banknote className="w-5 h-5 text-green-500" />, title: 'Ước tính chi phí', desc: 'Chi phí ước tính cho từng điểm' },
                            { icon: <CheckCircle2 className="w-5 h-5 text-purple-500" />, title: 'Hoàn toàn miễn phí', desc: 'Không cần tài khoản Pro' },
                        ].map(f => (
                            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-2">{f.icon}</div>
                                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CENTER: Form */}
                    <div>
                        <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden">
                            <div className="px-7 pt-7 pb-5 space-y-5">
                                {/* Destination Row */}
                                <div className="flex gap-4">
                                    {/* Province Combobox */}
                                    <div className="space-y-2 flex-1" ref={provinceRef}>
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-orange-500" /> Điểm đến dự kiến
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={place}
                                                onChange={e => { setPlace(e.target.value); setProvinceSearch(e.target.value); setProvinceOpen(true); }}
                                                onFocus={() => { setProvinceSearch(''); setProvinceOpen(true); }}
                                                placeholder="Nhập tỉnh/thành phố..."
                                                className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow text-base bg-white"
                                            />
                                            <button type="button" onClick={() => setProvinceOpen(o => !o)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </button>
                                            {provinceOpen && filteredProvinces.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto">
                                                    {filteredProvinces.map(prov => (
                                                        <button key={prov.code} type="button" onClick={() => { setPlace(prov.name); setProvinceOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-0">
                                                            {prov.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Specific location */}
                                    <div className="space-y-2 flex-1">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Chi tiết vị trí <span className="text-gray-400 font-normal text-xs">(tùy chọn)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={specificLocation}
                                            onChange={e => setSpecificLocation(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                            placeholder="VD: Nhà thờ, Chợ nổi..."
                                            className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow text-base"
                                        />
                                    </div>
                                </div>

                                {/* Days */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" /> Số ngày
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm h-11">
                                            <button onClick={() => setDays(d => Math.max(1, d - 1))} className="w-11 h-full text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors font-bold text-xl flex items-center justify-center border-r border-gray-200">−</button>
                                            <input type="number" value={days} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 14) setDays(v); }} min={1} max={14} className="w-14 h-full font-bold text-lg text-gray-800 text-center focus:outline-none bg-transparent appearance-none" style={{ MozAppearance: 'textfield' }} />
                                            <button onClick={() => setDays(d => Math.min(14, d + 1))} className="w-11 h-full text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors font-bold text-xl flex items-center justify-center border-l border-gray-200">+</button>
                                        </div>
                                        <span className="text-gray-500 text-sm font-medium">{days} ngày · {days - 1} đêm</span>
                                    </div>
                                </div>

                                {/* Interests */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Sở thích <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_TAGS.map(tag => (
                                            <button key={tag.label} onClick={() => toggleInterest(tag.label)} className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 font-medium ${interests.includes(tag.label) ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'}`}>
                                                {tag.icon}{tag.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Ghi chú thêm <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Đi 2 người, budget 5 triệu..." rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow resize-none text-sm" />
                                </div>
                            </div>

                            {/* Submit Area */}
                            <div className="px-7 py-5 bg-gray-50 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!place.trim() || loading}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 hover:-translate-y-0.5 text-base cursor-pointer"
                                >
                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> AI đang lập kế hoạch...</> : <><Wand2 className="w-5 h-5" /> Tạo kế hoạch bằng AI</>}
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400 font-medium">hoặc</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                <button
                                    onClick={() => onManualCreate(place.trim() || 'Chưa xác định', days)}
                                    className="w-full py-2.5 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-medium rounded-xl flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
                                >
                                    <Edit2 className="w-4 h-4" /> Tự lập lịch trình thủ công
                                </button>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        onClick={() => navigate('/my-plans')}
                                        className="py-2 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-500 hover:text-orange-500 font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
                                    >
                                        <FolderOpen className="w-3.5 h-3.5" /> Kế hoạch của tôi
                                    </button>
                                    <button
                                        onClick={() => publicPlansRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                        className="py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
                                    >
                                        <Globe className="w-3.5 h-3.5" /> Khám phá công khai
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Sample AI plan preview */}
                    <div className="hidden lg:flex flex-col gap-4 pt-10">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Ví dụ AI tạo</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Hà Nội · Ngày 1</p>
                                </div>
                                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI
                                </span>
                            </div>
                            <div className="p-3 space-y-2">
                                {SAMPLE_PREVIEW.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="flex items-center gap-1 w-[72px] shrink-0 pt-0.5">
                                            {item.icon === 'morning' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                                            {item.icon === 'afternoon' && <Cloud className="w-3.5 h-3.5 text-sky-500" />}
                                            {item.icon === 'evening' && <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                                            <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                                            <p className="font-semibold text-xs text-gray-800">{item.name}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{item.duration}</span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" />{item.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 text-center">Sau khi tạo — kéo thả để tùy chỉnh thoải mái</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-4 text-white text-center">
                            <Sparkles className="w-5 h-5 mx-auto mb-1.5 opacity-90" />
                            <p className="font-bold text-sm">Gemini AI</p>
                            <p className="text-[11px] opacity-80 mt-0.5">Tạo lịch trình chi tiết trong vài giây</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PUBLIC PLANS DISCOVERY ── */}
            <div ref={publicPlansRef} className="max-w-6xl mx-auto px-4 pb-20">
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                    <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-widest px-2 flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5" /> Khám phá lịch trình cộng đồng
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 mb-6 items-center">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm min-w-[220px] flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Tìm theo địa điểm, tên lịch trình..."
                            value={filterCity}
                            onChange={e => setFilterCity(e.target.value)}
                            className="flex-1 text-sm text-gray-700 focus:outline-none bg-transparent placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { label: 'Tất cả', value: '' },
                            { label: '1–2 ngày', value: '1-2' },
                            { label: '3–4 ngày', value: '3-4' },
                            { label: '5+ ngày', value: '5+' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterDays(opt.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${filterDays === opt.value ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{publicPlansLoading ? '...' : `${filteredPlans.length} lịch trình`}</span>
                    <button
                        onClick={() => navigate('/my-plans')}
                        className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                        <FolderOpen className="w-3.5 h-3.5" /> Quản lý lịch trình của tôi
                    </button>
                </div>

                {/* Plan Cards */}
                {publicPlansLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                                <div className="h-28 bg-gray-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    <div className="h-3 bg-gray-100 rounded w-full mt-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredPlans.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlans.map((plan, i) => {
                            const actCount = plan.itinerary.reduce(
                                (sum, d) => sum + d.morning_activities.length + d.afternoon_activities.length + d.evening_activities.length, 0
                            );
                            const authorName = plan.members?.[0]?.fullname || 'Cộng đồng';
                            const thumbnail = getThumbnail(plan.destination);
                            const isCloning = cloningId === plan.id;
                            
                            return (
                                <motion.div
                                    key={plan.id}
                                    layout
                                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-44 bg-gray-200 overflow-hidden flex-shrink-0">
                                        <img
                                            src={thumbnail}
                                            alt={plan.destination}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-black/10" />

                                        {/* Destination badge */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/95 text-orange-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                                                <MapPin className="w-3 h-3" />
                                                {plan.destination}
                                            </span>
                                        </div>

                                        {/* Days badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                                                {plan.days} ngày
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <div className="absolute bottom-4 left-4 right-4 z-10">
                                            <h3 className="text-base font-bold text-white leading-tight drop-shadow-md line-clamp-2 group-hover:text-amber-300 transition-colors">
                                                {plan.title || `Kế hoạch đi ${plan.destination}`}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 flex-1 flex flex-col gap-3">
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
                                            {plan.overview || 'Khám phá những điểm đến thú vị và trải nghiệm văn hóa đặc sắc.'}
                                        </p>

                                        {/* Author / Info row */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                                                Bởi: <span className="font-semibold text-gray-700">{authorName}</span>
                                            </span>
                                            <span className="text-[10px] bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                                                {actCount} HĐ
                                            </span>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2 pt-2 border-t border-gray-50">
                                            <button
                                                onClick={() => navigate(`/ai-planner/${plan.id}`)}
                                                className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-all cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Xem chi tiết
                                            </button>
                                            <button
                                                onClick={() => handleClone(plan.id, plan.title || plan.destination)}
                                                disabled={isCloning}
                                                className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isCloning
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <Copy className="w-3.5 h-3.5" />
                                                }
                                                {isCloning ? 'Đang clone...' : 'Clone về'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Compass className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Không tìm thấy lịch trình phù hợp</p>
                        <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc tìm kiếm</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Plan Editor ─────────────────────────────────────────────────────────────

function PlanEditor({ planData, onReset }: { planData: PlanData; onReset: () => void }) {
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState<ItineraryDay[]>(planData.itinerary);
    const [isPublic, setIsPublic] = useState(planData.isPublic);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareToken, setShareToken] = useState(planData.shareUrl);
    const [members, setMembers] = useState(planData.members || []);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [planTitle, setPlanTitle] = useState(planData.title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [slotOrders, setSlotOrders] = useState<TimeSlot[][]>(() =>
        (planData.itinerary || []).map(() => [...SLOT_ORDER])
    );
    const [localPlace, setLocalPlace] = useState(planData.destination || '');
    const [budget, setBudget] = useState<number>(planData.budget ?? 0);
    const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
    const [provinceOpen, setProvinceOpen] = useState(false);
    const [provinceSearch, setProvinceSearch] = useState('');
    const provinceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        apiClient.provinces.getAll()
            .then(data => setProvinces(data))
            .catch(err => console.error('Failed to fetch provinces', err));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) {
                setProvinceOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const place = localPlace;
    const planId = planData.id;
    const isOwner = planData.isOwner;

    const originalItineraryRef = useRef<string>('');
    useEffect(() => {
        originalItineraryRef.current = JSON.stringify(planData.itinerary);
    }, []);

    // Track changes
    useEffect(() => {
        if (originalItineraryRef.current && JSON.stringify(itinerary) !== originalItineraryRef.current) {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }
    }, [itinerary]);

    const handleManualSave = async () => {
        if (!isOwner || planId.startsWith('mock-')) {
            setHasUnsavedChanges(false);
            return;
        }
        setAutoSaveStatus('saving');
        try {
            await aiPlannerApi.updatePlan(planId, {
                tripTitle: planTitle,
                overview: planData.overview || '',
                itinerary: itinerary,
                destination: localPlace,
                budget,
            });
            setAutoSaveStatus('saved');
            originalItineraryRef.current = JSON.stringify(itinerary);
            setHasUnsavedChanges(false);
            setTimeout(() => setAutoSaveStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setAutoSaveStatus('error');
            toast.error('Lưu thay đổi thất bại');
        }
    };

    const hasTitleChange = planTitle !== planData.title;
    const hasPlaceChange = localPlace !== planData.destination;

    // Navigation Blockers
    const isDirty = hasUnsavedChanges || hasTitleChange || hasPlaceChange || autoSaveStatus === 'saving' || autoSaveStatus === 'error';
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        const checkBlocker = async () => {
            if (blocker.state === 'blocked') {
                const isConfirmed = await confirm({
                    title: 'Chưa lưu thay đổi',
                    message: 'Quá trình lưu chưa hoàn tất. Nếu rời đi bạn có thể mất dữ liệu vừa chỉnh sửa. Tiếp tục rời trang?',
                    variant: 'warning',
                    confirmText: 'Rời đi',
                    cancelText: 'Ở lại'
                });
                if (isConfirmed) {
                    blocker.proceed();
                } else {
                    blocker.reset();
                }
            }
        };
        checkBlocker();
    }, [blocker]);

    const handleRemoveDay = (dayIdx: number) => {
        setItinerary(prev => {
            const next = prev.filter((_, idx) => idx !== dayIdx);
            return next.map((day, idx) => ({ ...day, day_label: `Ngày ${idx + 1}` }));
        });
        setSelectedDayIdx(prev => Math.max(0, prev >= dayIdx ? prev - 1 : prev));
    };

    const handleAddDay = () => {
        setItinerary(prev => {
            if (prev.length >= 14) return prev;
            const newDayNum = prev.length + 1;
            const newDay: ItineraryDay = {
                day_label: `Ngày ${newDayNum}`,
                morning_activities: [],
                afternoon_activities: [],
                evening_activities: []
            };
            return [...prev, newDay];
        });
    };

    const [selectedDayIdx, setSelectedDayIdx] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [selectedActivityPos, setSelectedActivityPos] = useState<{ dayIdx: number; slot: TimeSlot; actIdx: number } | null>(null);
    // Lifted edit state to avoid remount when ActivityDetailContent is re-created each render
    const [detailEdit, setDetailEdit] = useState({ name: '', description: '', duration: '1 giờ', cost: 0, location: '' });
    const [detailSaved, setDetailSaved] = useState(false);
    const [viewMode, setViewMode] = useState<'day' | 'overview'>('day');
    const [mobileTab, setMobileTab] = useState<'library' | 'timeline' | 'summary' | 'members'>('timeline');
    const [rightTab, setRightTab] = useState<'summary' | 'members' | 'detail'>('summary');
    // Library search
    const [libMode, setLibMode] = useState<'suggest' | 'search'>('suggest');
    const [libSearchText, setLibSearchText] = useState('');
    const [libSearchProvCode, setLibSearchProvCode] = useState('');
    const [libSearchProvName, setLibSearchProvName] = useState('');
    const [libSearchResults, setLibSearchResults] = useState<Activity[]>([]);
    const [isLoadingLibSearch, setIsLoadingLibSearch] = useState(false);
    const [libSearchProvOpen, setLibSearchProvOpen] = useState(false);
    const [libSearchProvInput, setLibSearchProvInput] = useState('');
    // Lifted from LibraryContent to prevent remount-on-rerender losing focus
    const [libSuggestSearch, setLibSuggestSearch] = useState('');
    const [libTypeFilter, setLibTypeFilter] = useState('ALL');
    const [showLibrary, setShowLibrary] = useState(true);
    const [showSummary, setShowSummary] = useState(true);
    const [libWidth, setLibWidth] = useState(288); // px, w-72 = 288
    const [sumWidth, setSumWidth] = useState(224); // px, w-56 = 224
    const draggingLeft = useRef(false);
    const draggingRight = useRef(false);

    const [libraryActivities, setLibraryActivities] = useState<Activity[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    useEffect(() => {
        // If the plan already carries preferenceServices (from generate response), use them directly
        if (planData.preferenceServices && planData.preferenceServices.length > 0) {
            setLibraryActivities(planData.preferenceServices.map(prefToActivity));
            setIsLoadingLibrary(false);
            return;
        }
        // Fetch services from API using province filter
        if (place) {
            setIsLoadingLibrary(true);
            const province = provinces.find(p => p.name === place || p.name.toLowerCase() === place.toLowerCase());
            const provinceCode = province?.code?.toString();
            apiClient.services.filterByLocation({
                provinceCode,
                page: 0,
                size: 40,
            })
                .then(res => {
                    const services: Activity[] = (res?.services ?? []).map((s: any) => ({
                        id: s.id?.toString() || uid(),
                        name: s.serviceName || '',
                        description: '',
                        duration: '1-2 giờ',
                        estimated_cost: s.averagePrice && s.averagePrice > 0 ? formatVND(s.averagePrice) : 'Liên hệ',
                        cost_amount: s.averagePrice ?? 0,
                        location: s.province?.full_name || s.province?.fullName || s.address || '',
                        isSystemService: true,
                        serviceId: s.id?.toString(),
                        thumbnailUrl: s.thumbnailUrl,
                        serviceType: s.serviceType,
                    }));
                    if (services.length > 0) {
                        setLibraryActivities(services);
                    } else {
                        // Fall back to AI preferences if filter returns empty
                        return aiPlannerApi.getPreferences(place).then(pref => {
                            if (pref?.length) setLibraryActivities(pref.map(a => ({ ...a, id: a.id || uid() })));
                        });
                    }
                })
                .catch(() => {
                    aiPlannerApi.getPreferences(place)
                        .then(res => { if (res?.length) setLibraryActivities(res.map(a => ({ ...a, id: a.id || uid() }))); })
                        .catch(() => {});
                })
                .finally(() => setIsLoadingLibrary(false));
        }
    }, [place, provinces, planData.preferenceServices]);

    // Sync detail edit fields when a different activity is selected (avoid remount issue)
    useEffect(() => {
        if (selectedActivity) {
            setDetailEdit({
                name: selectedActivity.name || '',
                description: selectedActivity.description || '',
                duration: selectedActivity.duration || '1 giờ',
                cost: selectedActivity.cost_amount ?? parseCostAmount(selectedActivity.estimated_cost),
                location: selectedActivity.location || '',
            });
            setDetailSaved(false);
        }
    }, [selectedActivity?.id]);

    // Library search mode — debounced API call
    useEffect(() => {
        if (libMode !== 'search') return;
        if (!libSearchText && !libSearchProvCode) { setLibSearchResults([]); return; }
        setIsLoadingLibSearch(true);
        const ctrl = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = libSearchText
                    ? await apiClient.services.search({ keyword: libSearchText, provinceCode: libSearchProvCode || undefined, page: 0, size: 40, signal: ctrl.signal })
                    : await apiClient.services.filterByLocation({ provinceCode: libSearchProvCode, page: 0, size: 40, signal: ctrl.signal });
                const services: Activity[] = (res?.services ?? []).map((s: any) => ({
                    id: s.id?.toString() || uid(),
                    name: s.serviceName || '',
                    description: '',
                    duration: '1-2 giờ',
                    estimated_cost: s.averagePrice && s.averagePrice > 0 ? formatVND(s.averagePrice) : 'Liên hệ',
                    cost_amount: s.averagePrice ?? 0,
                    location: s.province?.full_name || s.province?.fullName || s.address || '',
                    isSystemService: true,
                    serviceId: s.id?.toString(),
                    thumbnailUrl: s.thumbnailUrl,
                    serviceType: s.serviceType,
                }));
                setLibSearchResults(services);
            } catch (err: any) {
                if (err?.name !== 'AbortError') setLibSearchResults([]);
            } finally {
                setIsLoadingLibSearch(false);
            }
        }, 500);
        return () => { clearTimeout(timer); ctrl.abort(); };
    }, [libMode, libSearchText, libSearchProvCode]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (draggingLeft.current) {
                setLibWidth(prev => {
                    const rawNext = prev + e.movementX;
                    if (rawNext < 200) {
                        // console.log("rawNext", rawNext);
                        setShowLibrary(false);
                        draggingLeft.current = false;
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        // console.log("showLibrary", showLibrary);
                        return 40;
                    }
                    setShowLibrary(true);
                    // console.log("showLibrary", showLibrary);
                    return Math.max(250, Math.min(480, rawNext));
                });
            }
            if (draggingRight.current) {
                setSumWidth(prev => {
                    const rawNext = prev - e.movementX;
                    if (rawNext < 180) {
                        setShowSummary(false);
                        draggingRight.current = false;
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        return 40;
                    }
                    setShowSummary(true);
                    return Math.max(224, Math.min(480, rawNext));
                });
            }
        };
        const onUp = () => { draggingLeft.current = false; draggingRight.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    }, []);
    const [mobilePicker, setMobilePicker] = useState<{
        type: 'move' | 'add';
        name: string;
        activityId?: string; fromDayIdx?: number; fromSlot?: TimeSlot;
        libId?: string;
    } | null>(null);
    const [pickerDay, setPickerDay] = useState(0);
    const [pickerSlot, setPickerSlot] = useState<TimeSlot>('morning_activities');
    const dragPayload = useRef<DragPayload | null>(null);

    const totalActivities = (itinerary || []).reduce((s, d) =>
        s + (d?.morning_activities?.length || 0) + (d?.afternoon_activities?.length || 0) + (d?.evening_activities?.length || 0), 0);

    const handleDragStartCard = useCallback((e: React.DragEvent, payload: DragPayload) => {
        dragPayload.current = payload;
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, toDayIdx: number, toSlot: TimeSlot) => {
        e.preventDefault();
        const p = dragPayload.current;
        if (!p) return;
        setItinerary(prev => {
            const next = prev.map(d => ({
                ...d,
                morning_activities: [...d.morning_activities],
                afternoon_activities: [...d.afternoon_activities],
                evening_activities: [...d.evening_activities],
            }));
            let activity: Activity;
            if (p.fromDayIdx === null) {
                const lib = libraryActivities.find(a => a.id === p.activityId);
                if (!lib) return prev;
                activity = { ...lib, id: uid() };
            } else {
                const slot = next[p.fromDayIdx][p.fromSlot!];
                const idx = slot.findIndex(a => a.id === p.activityId);
                if (idx === -1) return prev;
                [activity] = slot.splice(idx, 1);
            }
            next[toDayIdx][toSlot].push(activity);
            return next;
        });
        dragPayload.current = null;
    }, [libraryActivities]);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        dayIdx: number;
        slot: TimeSlot;
        actIdx?: number;
        initialData?: Activity;
    }>({ isOpen: false, dayIdx: 0, slot: 'morning_activities' });

    const handleRemove = useCallback((dayIdx: number, slot: TimeSlot, actIdx: number) => {
        setItinerary(prev => {
            const next = prev.map((d, i) => i === dayIdx ? ({
                ...d,
                [slot]: d[slot].filter((_, idx) => idx !== actIdx)
            }) : d);
            return next;
        });
    }, []);

    const handleEditActivity = useCallback((dayIdx: number, slot: TimeSlot, actIdx: number) => {
        const act = itinerary[dayIdx][slot][actIdx];
        setModalConfig({ isOpen: true, dayIdx, slot, actIdx, initialData: act });
    }, [itinerary]);

    const handleUpdateActivity = useCallback((dayIdx: number, slot: TimeSlot, actIdx: number, data: Partial<Activity>) => {
        setItinerary(prev => {
            const next = [...prev];
            const currentDay = { ...next[dayIdx] };
            const currentSlot = [...currentDay[slot]];
            currentSlot[actIdx] = { ...currentSlot[actIdx], ...data };
            currentDay[slot] = currentSlot;
            next[dayIdx] = currentDay;
            return next;
        });
    }, []);

    const handleAddActivity = useCallback((dayIdx: number, slot: TimeSlot) => {
        setModalConfig({ isOpen: true, dayIdx, slot });
    }, []);

    const handleMoveSlot = useCallback((dayIdx: number, slot: TimeSlot, direction: 'up' | 'down') => {
        setSlotOrders(prev => {
            const next = prev.map(o => [...o]);
            const order = next[dayIdx];
            const idx = order.indexOf(slot);
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= order.length) return prev;
            [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
            return next;
        });
    }, []);

    const handleSaveActivity = (data: Partial<Activity>) => {
        const { dayIdx, slot, actIdx } = modalConfig;
        setItinerary(prev => {
            const next = [...prev];
            const currentDay = { ...next[dayIdx] };
            const currentSlot = [...currentDay[slot]];

            if (actIdx !== undefined) {
                // Editing
                currentSlot[actIdx] = { ...currentSlot[actIdx], ...data };
            } else {
                // Adding
                currentSlot.push({ id: uid(), ...data } as Activity);
            }

            currentDay[slot] = currentSlot;
            next[dayIdx] = currentDay;
            return next;
        });
    };

    const handleMobilePick = useCallback(() => {
        if (!mobilePicker) return;
        setItinerary(prev => {
            const next = prev.map(d => ({
                ...d,
                morning_activities: [...d.morning_activities],
                afternoon_activities: [...d.afternoon_activities],
                evening_activities: [...d.evening_activities],
            }));
            if (mobilePicker.type === 'move' && mobilePicker.fromDayIdx !== undefined && mobilePicker.fromSlot && mobilePicker.activityId) {
                const fromArr = next[mobilePicker.fromDayIdx][mobilePicker.fromSlot];
                const idx = fromArr.findIndex(a => a.id === mobilePicker.activityId);
                if (idx === -1) return prev;
                const [act] = fromArr.splice(idx, 1);
                next[pickerDay][pickerSlot].push(act);
            } else if (mobilePicker.type === 'add' && mobilePicker.libId) {
                const lib = libraryActivities.find(a => a.id === mobilePicker.libId);
                if (!lib) return prev;
                next[pickerDay][pickerSlot].push({ ...lib, id: uid() });
            }
            return next;
        });
        setMobilePicker(null);
    }, [mobilePicker, pickerDay, pickerSlot, libraryActivities]);

    const handleTogglePublic = async (newPublic: boolean) => {
        try {
            const res = await aiPlannerApi.toggleShare(planId, newPublic);
            setIsPublic(res.isPublic);
            if (res.shareToken) setShareToken(res.shareToken);
        } catch (err) {
            console.error(err);
            toast.error('Cập nhật trạng thái chia sẻ thất bại');
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await aiPlannerApi.getPlanMembers(planId);
            setMembers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClone = async () => {
        try {
            setAutoSaveStatus('saving');
            const newPlan = await aiPlannerApi.clonePlan(planId);
            toast.success('Đã nhân bản kế hoạch');
            window.location.href = `/ai-planner/${newPlan.id}`;
        } catch (err) {
            console.error(err);
            toast.error('Nhân bản thất bại');
            setAutoSaveStatus('error');
        }
    };

    // ── Shared sub-components (reused in both mobile and desktop) ──

    const LibraryContent = () => {
        // No hooks here — all state lives in PlanEditor to prevent remount-on-rerender focus loss
        const suggestSearch = libSuggestSearch;
        const setSuggestSearch = setLibSuggestSearch;
        const typeFilter = libTypeFilter;
        const setTypeFilter = setLibTypeFilter;

        // Suggest mode
        const suggestTypes = [...new Set(libraryActivities.map(l => l.serviceType).filter((t): t is string => Boolean(t)))];
        const suggestFiltered = libraryActivities.filter(lib => {
            if (suggestSearch && !lib.name.toLowerCase().includes(suggestSearch.toLowerCase())) return false;
            if (typeFilter !== 'ALL' && lib.serviceType !== typeFilter) return false;
            return true;
        });

        // Search mode
        const searchTypes = [...new Set(libSearchResults.map(l => l.serviceType).filter((t): t is string => Boolean(t)))];
        const searchFiltered = libSearchResults.filter(lib =>
            typeFilter === 'ALL' || lib.serviceType === typeFilter
        );

        const displayList = libMode === 'suggest' ? suggestFiltered : searchFiltered;
        const displayTypes = libMode === 'suggest' ? suggestTypes : searchTypes;
        const isLoading = libMode === 'suggest' ? isLoadingLibrary : isLoadingLibSearch;

        const filteredProvinces = provinces.filter(p => p.name.toLowerCase().includes(provinceSearch.toLowerCase()));
        const libSearchProvinceList = provinces.filter(p => p.name.toLowerCase().includes(libSearchProvInput.toLowerCase()));

        const renderCard = (lib: Activity) => (
            <motion.div key={lib.id} layout className="group relative">
                <div
                    draggable
                    onDragStart={e => {
                        dragPayload.current = { activityId: lib.id!, fromDayIdx: null, fromSlot: null };
                        e.dataTransfer.effectAllowed = 'copy';
                        e.dataTransfer.setData('text/plain', lib.id!);
                    }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                >
                    {lib.thumbnailUrl ? (
                        <div className="flex gap-0">
                            <div className="w-16 shrink-0 self-stretch relative">
                                <img src={lib.thumbnailUrl} alt={lib.name} className="w-full h-full object-cover min-h-[68px]"
                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <div className="flex-1 p-2 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                    <p className="font-bold text-xs text-gray-800 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2 flex-1">{lib.name}</p>
                                    <button onClick={() => { setMobilePicker({ type: 'add', libId: lib.id, name: lib.name }); setPickerDay(0); setPickerSlot('morning_activities'); }}
                                        className="lg:hidden p-1 bg-orange-50 text-orange-500 rounded-md shrink-0 active:scale-95 transition-transform">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                {lib.serviceType && (
                                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${SERVICE_TYPE_BADGE[lib.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                                        {SERVICE_TYPE_LABELS[lib.serviceType] || lib.serviceType}
                                    </span>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-semibold text-orange-600">{lib.estimated_cost}</span>
                                </div>
                                {lib.location && <p className="text-[9px] text-gray-400 mt-0.5 truncate">{lib.location}</p>}
                                {lib.serviceUrl && (
                                    <button onClick={e => { e.stopPropagation(); navigate(lib.serviceUrl!); }}
                                        className="text-[9px] text-orange-400 hover:text-orange-600 font-semibold flex items-center gap-0.5 mt-0.5">
                                        <ExternalLink className="w-2.5 h-2.5" /> Xem chi tiết
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2 p-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-100 group-hover:bg-orange-400 transition-colors" />
                            <GripVertical className="hidden lg:block w-3.5 h-3.5 text-gray-300 mt-0.5 group-hover:text-orange-400 shrink-0 transition-colors cursor-grab" />
                            <div className="min-w-0 flex-1 pl-1">
                                <p className="font-bold text-xs text-gray-800 group-hover:text-orange-600 transition-colors">{lib.name}</p>
                                <div className="flex gap-2 mt-1.5">
                                    <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5"><Clock className="w-3 h-3 text-orange-400" />{lib.duration}</span>
                                    <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-orange-400" />{lib.estimated_cost}</span>
                                </div>
                            </div>
                            <button onClick={() => { setMobilePicker({ type: 'add', libId: lib.id, name: lib.name }); setPickerDay(0); setPickerSlot('morning_activities'); }}
                                className="lg:hidden p-1.5 bg-orange-50 text-orange-500 rounded-lg shrink-0 active:scale-95 transition-transform">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        );

        return (
            <div className="flex flex-col flex-1 min-h-0">
                {/* Mode toggle */}
                <div className="px-3 pt-2 pb-1.5 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => { setLibMode('suggest'); setTypeFilter('ALL'); }}
                            className={`flex-1 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${libMode === 'suggest' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}>
                            <MapPin className="w-3 h-3" /> Gợi ý
                        </button>
                        <button onClick={() => { setLibMode('search'); setTypeFilter('ALL'); }}
                            className={`flex-1 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1 border-l border-gray-200 transition-colors cursor-pointer ${libMode === 'search' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}>
                            <Search className="w-3 h-3" /> Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Suggest mode controls */}
                {libMode === 'suggest' && (
                    <>
                        <div className="px-3 pb-1 shrink-0" ref={provinceRef}>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500 z-10" />
                                <input type="text"
                                    value={provinceOpen ? provinceSearch : localPlace}
                                    onChange={e => { setProvinceSearch(e.target.value); setProvinceOpen(true); }}
                                    onFocus={() => { setProvinceSearch(''); setProvinceOpen(true); }}
                                    placeholder="Chọn tỉnh/thành..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white" />
                                {provinceOpen && filteredProvinces.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[70] max-h-40 overflow-y-auto">
                                        {filteredProvinces.map(prov => (
                                            <button key={prov.code} type="button" onClick={() => { setLocalPlace(prov.name); setProvinceOpen(false); }}
                                                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-0 font-medium">
                                                {prov.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-3 pb-1.5 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input value={suggestSearch} onChange={e => setSuggestSearch(e.target.value)}
                                    placeholder="Lọc trong danh sách..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-gray-50" />
                            </div>
                        </div>
                    </>
                )}

                {/* Search mode controls */}
                {libMode === 'search' && (
                    <>
                        <div className="px-3 pb-1 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input value={libSearchText} onChange={e => setLibSearchText(e.target.value)}
                                    placeholder="Tìm dịch vụ toàn hệ thống..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-gray-50" />
                            </div>
                        </div>
                        <div className="px-3 pb-1.5 shrink-0 relative">
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                                <input type="text"
                                    value={libSearchProvOpen ? libSearchProvInput : libSearchProvName}
                                    onChange={e => { setLibSearchProvInput(e.target.value); setLibSearchProvOpen(true); }}
                                    onFocus={() => { setLibSearchProvInput(''); setLibSearchProvOpen(true); }}
                                    placeholder="Tỉnh/thành (tùy chọn)..."
                                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-gray-50" />
                                {libSearchProvName && !libSearchProvOpen && (
                                    <button onClick={() => { setLibSearchProvCode(''); setLibSearchProvName(''); }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {libSearchProvOpen && libSearchProvinceList.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[70] max-h-40 overflow-y-auto">
                                        {libSearchProvinceList.map(prov => (
                                            <button key={prov.code} type="button"
                                                onClick={() => { setLibSearchProvCode(prov.code.toString()); setLibSearchProvName(prov.name); setLibSearchProvOpen(false); }}
                                                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-0 font-medium">
                                                {prov.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {libSearchProvName && libSearchText && (
                                <p className="text-[10px] text-orange-500 mt-1">
                                    Tìm <span className="font-bold">"{libSearchText}"</span> tại {libSearchProvName}
                                </p>
                            )}
                            {libSearchProvName && !libSearchText && (
                                <p className="text-[10px] text-orange-500 mt-1">Dịch vụ tại {libSearchProvName}</p>
                            )}
                        </div>
                    </>
                )}

                {/* Type filters */}
                {displayTypes.length > 0 && (
                    <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0 border-b border-gray-100">
                        {(['ALL', ...displayTypes] as string[]).map(type => (
                            <button key={type} onClick={() => setTypeFilter(type)}
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${typeFilter === type ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'}`}>
                                {type === 'ALL' ? 'Tất cả' : SERVICE_TYPE_LABELS[type] || type}
                            </button>
                        ))}
                    </div>
                )}

                {/* Cards list */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                            <p className="text-xs">{libMode === 'suggest' ? 'Đang tải gợi ý...' : 'Đang tìm kiếm...'}</p>
                        </div>
                    ) : libMode === 'search' && !libSearchText && !libSearchProvCode ? (
                        <div className="py-10 text-center px-4">
                            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400 font-medium">Nhập từ khóa để tìm kiếm</p>
                            <p className="text-[10px] text-gray-400 mt-1">Hoặc chọn tỉnh/thành để xem dịch vụ theo vùng</p>
                        </div>
                    ) : displayList.length > 0 ? (
                        displayList.map(lib => renderCard(lib))
                    ) : (
                        <div className="py-10 text-center px-4">
                            <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">
                                {libMode === 'suggest' ? `Không có gợi ý cho "${place}"` : 'Không tìm thấy kết quả'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const SummaryContent = () => {
        const dayCosts = itinerary.map(calcDayCost);
        const totalEstimated = dayCosts.reduce((s, c) => s + c, 0);
        const budgetPct = budget > 0 ? Math.min(100, Math.round(totalEstimated / budget * 100)) : 0;
        const hasChanges = hasUnsavedChanges || hasTitleChange || hasPlaceChange;

        return (
            <div className="flex flex-col h-full">
                {/* Save status header */}
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</span>
                    <div className="flex items-center gap-1">
                        {autoSaveStatus === 'saving' && <div className="flex items-center gap-1 text-[10px] text-orange-500 font-medium animate-pulse"><CloudUpload className="w-3 h-3" /> Đang lưu...</div>}
                        {autoSaveStatus === 'saved' && <div className="flex items-center gap-1 text-[10px] text-green-500 font-medium"><CheckCircle2 className="w-3 h-3" /> Đã lưu</div>}
                        {autoSaveStatus === 'error' && <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium"><XCircle className="w-3 h-3" /> Lỗi lưu</div>}
                        {autoSaveStatus === 'idle' && <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium"><Cloud className="w-3 h-3" /> Đã đồng bộ</div>}
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Trip info */}
                    <div className="px-4 py-3 space-y-0 border-b border-gray-100 divide-y divide-gray-50">
                        {[
                            { label: 'Điểm đến', value: place || '—', icon: <MapPin className="w-3.5 h-3.5 text-orange-400" /> },
                            { label: 'Số ngày', value: `${itinerary.length} ngày`, icon: <CalendarDays className="w-3.5 h-3.5 text-orange-400" /> },
                            { label: 'Hoạt động', value: `${totalActivities} địa điểm`, icon: <Compass className="w-3.5 h-3.5 text-orange-400" /> },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between items-center py-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1.5">{item.icon}{item.label}</span>
                                <span className="text-xs font-semibold text-gray-800">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Budget & Cost section */}
                    <div className="px-4 py-3 space-y-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ngân sách & Chi phí</span>
                        </div>

                        {/* Budget input */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-medium">Ngân sách dự kiến (₫)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={budget || ''}
                                    onChange={e => setBudget(parseInt(e.target.value) || 0)}
                                    placeholder="Nhập ngân sách..."
                                    min={0}
                                    step={100000}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 pr-5"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">₫</span>
                            </div>
                            {budget > 0 && (
                                <p className="text-[10px] text-green-600 font-semibold">{formatVND(budget)}</p>
                            )}
                        </div>

                        {/* Budget progress */}
                        {budget > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-gray-500">Đã dùng</span>
                                    <span className={`font-bold ${budgetPct > 90 ? 'text-red-500' : budgetPct > 70 ? 'text-amber-500' : 'text-green-600'}`}>{budgetPct}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                                        style={{ width: `${budgetPct}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>Ước tính: {formatVND(totalEstimated)}</span>
                                    <span>Còn: {formatVND(Math.max(0, budget - totalEstimated))}</span>
                                </div>
                            </div>
                        )}

                        {/* Total estimated */}
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-orange-400" />Tổng ước tính
                                </span>
                                <span className="text-sm font-black text-orange-600">{totalEstimated > 0 ? formatVND(totalEstimated) : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Per-day cost breakdown */}
                    {itinerary.length > 0 && (
                        <div className="px-4 py-3 space-y-2 border-b border-gray-100">
                            <div className="flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Chi phí theo ngày</span>
                            </div>
                            <div className="space-y-1">
                                {itinerary.map((day, i) => {
                                    const cost = dayCosts[i];
                                    const actCount = day.morning_activities.length + day.afternoon_activities.length + day.evening_activities.length;
                                    return (
                                        <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                                            <div>
                                                <span className="text-[11px] font-semibold text-gray-700">{day.day_label}</span>
                                                <span className="text-[9px] text-gray-400 ml-1">({actCount} HĐ)</span>
                                            </div>
                                            <span className={`text-[11px] font-bold ${cost > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                                {cost > 0 ? formatVND(cost) : '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {USE_MOCK_AI_PLANNER && (
                        <div className="mx-4 my-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                            <p className="font-semibold">Demo Mode</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-gray-100 space-y-2 shrink-0">
                    {isOwner && (
                        <button
                            onClick={handleManualSave}
                            disabled={autoSaveStatus === 'saving' || (!hasChanges && autoSaveStatus !== 'error')}
                            className={`w-full py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${hasChanges || autoSaveStatus === 'error'
                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200'
                                : 'bg-gray-100 text-gray-400 cursor-default'
                            }`}
                        >
                            {autoSaveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : hasChanges ? <CloudUpload className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {autoSaveStatus === 'saving' ? 'Đang lưu...' : hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}
                        </button>
                    )}
                    {isOwner && (
                        <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={handleClone} className="py-1.5 text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-xl flex items-center justify-center gap-1 hover:bg-gray-100 cursor-pointer">
                                <Copy className="w-3 h-3" /> Nhân bản
                            </button>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className={`py-1.5 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 border cursor-pointer transition-colors ${isPublic ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <Share2 className="w-3 h-3" /> {isPublic ? 'Đang chia sẻ' : 'Chia sẻ'}
                            </button>
                        </div>
                    )}
                    {isOwner && (
                        <button onClick={() => setItinerary(planData.itinerary)} className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-500 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục ban đầu
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const MembersContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {(!members || members.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                        <Users className="w-8 h-8 opacity-25 mb-2" />
                        <p className="text-xs font-medium">Chưa có thành viên</p>
                        <p className="text-[10px] mt-1 text-center">Mời cộng tác viên qua nút Chia sẻ</p>
                    </div>
                ) : members.map(m => (
                    <div key={m.userID} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {m.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{m.fullname}</p>
                            <p className="text-[10px] text-gray-400 truncate">{m.email}</p>
                        </div>
                    </div>
                ))}
            </div>
            {isOwner && (
                <div className="px-4 py-3 border-t border-gray-100 shrink-0">
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="w-full py-2 text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 rounded-xl flex items-center justify-center gap-1.5 hover:bg-orange-100 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" /> Mời thêm thành viên
                    </button>
                </div>
            )}
        </div>
    );

    const ActivityDetailContent = () => {
        const act = selectedActivity;
        const pos = selectedActivityPos;

        if (!act || !pos) return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <Compass className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs font-medium">Chọn một hoạt động</p>
                <p className="text-[10px] mt-1">Nhấp vào bất kỳ hoạt động nào để chỉnh sửa chi tiết</p>
            </div>
        );

        const origCost = act.cost_amount ?? parseCostAmount(act.estimated_cost);
        const hasChanges = detailEdit.name !== act.name || detailEdit.description !== (act.description || '') ||
            detailEdit.duration !== act.duration || detailEdit.cost !== origCost || detailEdit.location !== (act.location || '');

        const handleSave = () => {
            if (!detailEdit.name.trim()) return;
            const formattedCost = detailEdit.cost > 0 ? formatVND(detailEdit.cost) : 'Miễn phí';
            const updated: Partial<Activity> = {
                name: detailEdit.name.trim(), description: detailEdit.description,
                duration: detailEdit.duration, cost_amount: detailEdit.cost,
                estimated_cost: formattedCost, location: detailEdit.location,
            };
            handleUpdateActivity(pos.dayIdx, pos.slot, pos.actIdx, updated);
            setSelectedActivity(prev => prev ? { ...prev, ...updated } : prev);
            setDetailSaved(true);
            setTimeout(() => setDetailSaved(false), 2000);
        };

        return (
            <div className="flex flex-col h-full">
                {act.thumbnailUrl && (
                    <div className="h-24 shrink-0 overflow-hidden relative">
                        <img src={act.thumbnailUrl} alt={act.name} className="w-full h-full object-cover" />
                        {act.serviceType && (
                            <span className={`absolute bottom-1.5 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${SERVICE_TYPE_BADGE[act.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                                {SERVICE_TYPE_LABELS[act.serviceType] || act.serviceType}
                            </span>
                        )}
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tên hoạt động</label>
                        <input
                            value={detailEdit.name}
                            onChange={e => setDetailEdit(p => ({ ...p, name: e.target.value }))}
                            className="mt-1 w-full text-sm font-bold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                            placeholder="Tên hoạt động..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-400" /> Thời gian
                            </label>
                            <input
                                value={detailEdit.duration}
                                onChange={e => setDetailEdit(p => ({ ...p, duration: e.target.value }))}
                                className="mt-1 w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                                placeholder="VD: 2 giờ"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-orange-400" /> Chi phí (₫)
                            </label>
                            <input
                                type="number"
                                value={detailEdit.cost || ''}
                                onChange={e => setDetailEdit(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))}
                                min={0} step={10000}
                                className="mt-1 w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {[0, 50000, 100000, 200000, 500000, 1000000].map(p => (
                            <button key={p} type="button" onClick={() => setDetailEdit(prev => ({ ...prev, cost: p }))}
                                className={`px-2 py-0.5 text-[10px] rounded-full border transition-all cursor-pointer ${detailEdit.cost === p ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'}`}>
                                {p === 0 ? 'Miễn phí' : p >= 1000000 ? `${p / 1000000}tr` : `${p / 1000}k`}
                            </button>
                        ))}
                    </div>
                    {detailEdit.cost > 0 && <p className="text-xs text-orange-600 font-semibold">{formatVND(detailEdit.cost)}</p>}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange-400" /> Địa chỉ
                        </label>
                        <input
                            value={detailEdit.location}
                            onChange={e => setDetailEdit(p => ({ ...p, location: e.target.value }))}
                            className="mt-1 w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                            placeholder="Địa chỉ cụ thể..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ghi chú</label>
                        <textarea
                            value={detailEdit.description}
                            onChange={e => setDetailEdit(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            className="mt-1 w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none italic bg-white"
                            placeholder="Ghi chú thêm..."
                        />
                    </div>
                    {act.serviceUrl && (
                        <button onClick={() => navigate(act.serviceUrl!)}
                            className="w-full py-2 border border-orange-300 text-orange-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-orange-50 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> Xem dịch vụ
                        </button>
                    )}
                </div>
                <div className="px-3 py-3 border-t border-gray-100 shrink-0 space-y-1.5">
                    <button onClick={handleSave} disabled={!hasChanges || !detailEdit.name.trim()}
                        className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                            detailSaved ? 'bg-green-500 text-white' :
                            hasChanges && detailEdit.name.trim() ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200' :
                            'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {detailSaved ? 'Đã lưu!' : 'Lưu thay đổi'}
                    </button>
                    <button onClick={() => { setSelectedActivity(null); setSelectedActivityPos(null); setRightTab('summary'); }}
                        className="w-full py-1.5 text-xs text-gray-400 hover:text-orange-500 flex items-center justify-center gap-1 transition-colors">
                        <ChevronLeft className="w-3.5 h-3.5" /> Quay lại
                    </button>
                </div>
            </div>
        );
    };

    const DayColumns = ({ mobile, overview }: { mobile?: boolean; overview?: boolean }) => (
        <>
            {itinerary.map((day, dayIdx) => {
                const daySlotOrder = slotOrders[dayIdx] || SLOT_ORDER;
                return (
                    <div key={dayIdx} className={mobile ? 'w-full' : overview ? 'min-w-[280px] w-[280px]' : 'min-w-0'}>
                        <div className="bg-orange-500 text-white rounded-xl px-4 py-3 mb-3 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="font-bold text-sm">{day.day_label}</p>
                                {(() => {
                                    const cost = calcDayCost(day);
                                    return cost > 0 ? (
                                        <p className="text-[10px] text-white/75 mt-0.5 flex items-center gap-1">
                                            <Banknote className="w-3 h-3" />{formatVND(cost)}
                                        </p>
                                    ) : null;
                                })()}
                            </div>
                            {isOwner && itinerary.length > 1 && (
                                <button
                                    onClick={() => handleRemoveDay(dayIdx)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
                                    title="Xóa ngày này"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {daySlotOrder.map((slot, slotIdx) => (
                                <DropZone
                                    key={slot}
                                    dayIdx={dayIdx}
                                    slot={slot}
                                    activities={day[slot] || []}
                                    onDrop={handleDrop}
                                    onRemove={handleRemove}
                                    onEditActivity={handleEditActivity}
                                    onUpdateActivity={handleUpdateActivity}
                                    onDragStartCard={handleDragStartCard}
                                    onAddActivity={handleAddActivity}
                                    onMoveSlot={(dir) => handleMoveSlot(dayIdx, slot, dir)}
                                    canMoveUp={slotIdx > 0}
                                    canMoveDown={slotIdx < daySlotOrder.length - 1}
                                    onMobileMove={mobile ? (actId, fDay, fSlot) => {
                                        const act = itinerary[fDay][fSlot].find(a => a.id === actId);
                                        setMobilePicker({ type: 'move', activityId: actId, fromDayIdx: fDay, fromSlot: fSlot, name: act?.name || '' });
                                        setPickerDay(fDay);
                                        setPickerSlot(fSlot);
                                    } : undefined}
                                    onSelectActivity={(dIdx, s, aIdx) => {
                                        setSelectedActivity(itinerary[dIdx][s][aIdx]);
                                        setSelectedActivityPos({ dayIdx: dIdx, slot: s, actIdx: aIdx });
                                        setRightTab('detail');
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
            {isOwner && itinerary.length < 14 && (
                <div className={mobile ? 'w-full' : 'min-w-[280px]'}>
                    <button
                        onClick={handleAddDay}
                        className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-500 hover:text-orange-500 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors bg-white/50 hover:bg-orange-50/50"
                    >
                        <Plus className="w-5 h-5" /> Thêm ngày mới
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

            {/* ── LEFT: Library (desktop, collapsible + resizable) ── */}
            <aside
                className="hidden lg:flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden shrink-0"
                style={{ width: showLibrary ? libWidth : 40 }}
            >
                <div className={`shrink-0 flex items-center border-b border-gray-100 bg-orange-50 ${showLibrary ? 'px-3 py-3 justify-between' : 'py-3 justify-center'
                    }`}>
                    {showLibrary && (
                        <div className="min-w-0">
                            <h2 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Dịch vụ gợi ý
                            </h2>
                            <p className="text-[10px] text-gray-400 truncate">{libraryActivities.length} dịch vụ · kéo vào lịch trình</p>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            const newShow = !showLibrary;
                            setShowLibrary(newShow);
                            // console.log("newShow", newShow);
                            // console.log("libWidth", libWidth);
                            // console.log("showLibrary", showLibrary);   
                            if (newShow) {
                                setLibWidth(prev => Math.max(288, prev));
                            } else {
                                setLibWidth(40);
                            }
                        }}
                        className="p-1 rounded text-gray-400 hover:text-orange-500 transition-colors shrink-0"
                    >
                        {showLibrary ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
                {showLibrary ? LibraryContent() : (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium select-none"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Kho HĐ</span>
                    </div>
                )}
            </aside>

            {/* Left resize handle */}
            {showLibrary && (
                <div
                    className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-gray-200 hover:bg-orange-400 active:bg-orange-500 transition-colors"
                    onMouseDown={e => { e.preventDefault(); draggingLeft.current = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; }}
                />
            )}

            {/* ── CENTER: Timeline ── */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header bar */}
                <div className="shrink-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        {isEditingTitle ? (
                            <input
                                autoFocus
                                value={planTitle}
                                onChange={e => setPlanTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') setIsEditingTitle(false);
                                    if (e.key === 'Escape') { setPlanTitle(planData.title); setIsEditingTitle(false); }
                                }}
                                className="font-bold text-base sm:text-lg text-gray-800 bg-orange-50 border-b-2 border-orange-400 focus:outline-none w-full px-1"
                                placeholder="Tên kế hoạch..."
                            />
                        ) : (
                            <button
                                onClick={() => isOwner && setIsEditingTitle(true)}
                                className={`group flex items-center gap-1.5 font-bold text-base sm:text-lg text-gray-800 max-w-full text-left ${isOwner ? 'hover:text-orange-600 cursor-text' : 'cursor-default'}`}
                                title={isOwner ? 'Nhấn để đổi tên kế hoạch' : undefined}
                            >
                                <PlaneTakeoff className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0" />
                                <span className="truncate">{planTitle}</span>
                                {isOwner && <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-orange-400 shrink-0 transition-colors" />}
                                {autoSaveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-orange-400 shrink-0" />}
                            </button>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5 pl-0.5">
                            <span className="text-gray-400">{place}</span>
                            <span className="mx-1.5 text-gray-300">·</span>
                            {itinerary.length} ngày · {totalActivities} hoạt động
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => navigate('/my-plans')}
                            className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-orange-500 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200 cursor-pointer"
                            title="Quản lý kế hoạch của tôi"
                        >
                            <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Kế hoạch</span>
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-orange-500 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Tạo lại</span>
                        </button>
                    </div>
                </div>

                {/* Desktop: view toggle bar */}
                <div className="hidden lg:flex shrink-0 items-center gap-2 overflow-x-auto px-4 py-2 border-b border-gray-100 bg-white">
                    {/* View mode toggle */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'day' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
                        >
                            <CalendarDays className="w-3 h-3" /> Từng ngày
                        </button>
                        <button
                            onClick={() => setViewMode('overview')}
                            className={`px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 border-l border-gray-200 transition-colors cursor-pointer ${viewMode === 'overview' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
                        >
                            <LayoutGrid className="w-3 h-3" /> Tổng quan
                        </button>
                    </div>
                    {viewMode === 'day' && <div className="w-px h-5 bg-gray-200 shrink-0" />}
                    {viewMode === 'day' && itinerary.map((day, i) => {
                        const cost = calcDayCost(day);
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDayIdx(i)}
                                className={`shrink-0 flex flex-col items-start px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${selectedDayIdx === i ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'}`}
                            >
                                <span className="text-xs font-bold whitespace-nowrap">{day.day_label}</span>
                                {cost > 0 && <span className={`text-[9px] font-medium ${selectedDayIdx === i ? 'text-white/70' : 'text-orange-500'}`}>{formatVND(cost)}</span>}
                            </button>
                        );
                    })}
                    {viewMode === 'day' && isOwner && itinerary.length < 14 && (
                        <button
                            onClick={handleAddDay}
                            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-orange-500 border-2 border-dashed border-gray-200 hover:border-orange-300 flex items-center gap-1 transition-all cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" /> Thêm ngày
                        </button>
                    )}
                </div>

                {/* Desktop: single-day view */}
                {viewMode === 'day' && (
                    <div className="hidden lg:block flex-1 overflow-y-auto">
                        <div className="max-w-2xl mx-auto px-5 py-4 space-y-4">
                            {itinerary[selectedDayIdx] && (() => {
                                const day = itinerary[selectedDayIdx];
                                const daySlotOrder = slotOrders[selectedDayIdx] || SLOT_ORDER;
                                return (
                                    <>
                                        {isOwner && itinerary.length > 1 && (
                                            <div className="flex items-center justify-between pb-1">
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {day.morning_activities.length + day.afternoon_activities.length + day.evening_activities.length} hoạt động
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveDay(selectedDayIdx)}
                                                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Xóa ngày này
                                                </button>
                                            </div>
                                        )}
                                        {daySlotOrder.map((slot, slotIdx) => (
                                            <DropZone
                                                key={slot}
                                                dayIdx={selectedDayIdx}
                                                slot={slot}
                                                activities={day[slot] || []}
                                                onDrop={handleDrop}
                                                onRemove={handleRemove}
                                                onEditActivity={handleEditActivity}
                                                onUpdateActivity={handleUpdateActivity}
                                                onDragStartCard={handleDragStartCard}
                                                onAddActivity={handleAddActivity}
                                                onMoveSlot={(dir) => handleMoveSlot(selectedDayIdx, slot, dir)}
                                                canMoveUp={slotIdx > 0}
                                                canMoveDown={slotIdx < daySlotOrder.length - 1}
                                                onSelectActivity={(dIdx, s, aIdx) => {
                                                    setSelectedActivity(itinerary[dIdx][s][aIdx]);
                                                    setSelectedActivityPos({ dayIdx: dIdx, slot: s, actIdx: aIdx });
                                                    setRightTab('detail');
                                                }}
                                            />
                                        ))}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Desktop: overview — all days side by side */}
                {viewMode === 'overview' && (
                    <div className="hidden lg:flex flex-1 overflow-x-auto overflow-y-auto">
                        <div className="flex gap-4 px-4 py-4 items-start" style={{ minWidth: 'max-content' }}>
                            <DayColumns overview />
                        </div>
                    </div>
                )}

                {/* Mobile: tab content */}
                <div className="lg:hidden flex-1 overflow-y-auto">
                    {mobileTab === 'timeline' && (
                        <div className="p-4 space-y-6 pb-20">
                            <DayColumns mobile />
                        </div>
                    )}
                    {mobileTab === 'library' && (
                        <div className="flex flex-col h-full pb-16">
                            <div className="px-4 py-2 border-b border-gray-100 bg-orange-50 flex items-center justify-between">
                                <p className="text-xs text-gray-500">Nhấn <Plus className="inline w-3 h-3 text-orange-400" /> để thêm vào lịch trình</p>
                                <span className="text-[10px] text-gray-400 font-medium">{libraryActivities.length} dịch vụ</span>
                            </div>
                            {LibraryContent()}
                        </div>
                    )}
                    {mobileTab === 'summary' && (
                        <div className="flex flex-col h-full pb-16">
                            <SummaryContent />
                        </div>
                    )}
                    {mobileTab === 'members' && (
                        <div className="flex flex-col h-full pb-16">
                            <MembersContent />
                        </div>
                    )}
                </div>
            </main>

            {/* Right resize handle */}
            {showSummary && (
                <div
                    className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-gray-200 hover:bg-orange-400 active:bg-orange-500 transition-colors"
                    onMouseDown={e => { e.preventDefault(); draggingRight.current = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; }}
                />
            )}

            {/* ── RIGHT: Summary / Chat (desktop, collapsible + resizable) ── */}
            <aside
                className="hidden lg:flex flex-col bg-white border-l border-gray-200 shadow-sm overflow-hidden shrink-0"
                style={{ width: showSummary ? sumWidth : 40 }}
            >
                <div className={`shrink-0 flex items-center border-b border-gray-100 bg-orange-50 ${showSummary ? 'px-2 py-2 justify-between' : 'py-3 justify-center'}`}>
                    <button
                        onClick={() => { const n = !showSummary; setShowSummary(n); if (n) setSumWidth(prev => Math.max(240, prev)); else setSumWidth(40); }}
                        className="p-1 rounded text-gray-400 hover:text-orange-500 transition-colors shrink-0 cursor-pointer"
                    >
                        {showSummary ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    {showSummary && (
                        <div className="flex gap-1 flex-1 ml-1">
                            {([
                                { id: 'summary' as const, label: 'Chi phí', icon: <BarChart2 className="w-3 h-3" /> },
                                { id: 'members' as const, label: 'Thành viên', icon: <Users className="w-3 h-3" /> },
                                { id: 'detail' as const, label: 'Chi tiết', icon: <Compass className="w-3 h-3" /> },
                            ]).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setRightTab(t.id)}
                                    className={`flex-1 py-1 text-[9px] font-semibold rounded-lg flex items-center justify-center gap-0.5 transition-colors cursor-pointer ${rightTab === t.id ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-white hover:text-orange-500'}`}
                                >
                                    {t.icon}{t.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {showSummary ? (
                    rightTab === 'summary' ? <SummaryContent /> :
                    rightTab === 'members' ? <MembersContent /> :
                    <ActivityDetailContent />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium select-none" style={{ writingMode: 'vertical-rl' }}>Chi phí</span>
                    </div>
                )}
            </aside>

            {/* ── MOBILE Bottom Tab Bar ── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex shadow-lg">
                {([
                    { id: 'library', label: 'Địa điểm', icon: <BookOpen className="w-5 h-5" /> },
                    { id: 'timeline', label: 'Lịch trình', icon: <CalendarDays className="w-5 h-5" /> },
                    { id: 'summary', label: 'Chi phí', icon: <BarChart2 className="w-5 h-5" /> },
                    { id: 'members', label: 'Thành viên', icon: <Users className="w-5 h-5" /> },
                ] as const).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setMobileTab(tab.id)}
                        className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors cursor-pointer ${mobileTab === tab.id
                            ? 'text-orange-500 border-t-2 border-orange-500 -mt-px'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── Mobile Picker Overlay ── */}
            {mobilePicker && (
                <div
                    className="fixed inset-0 z-[60] lg:hidden flex items-end"
                    onClick={() => setMobilePicker(null)}
                >
                    <div className="absolute inset-0 bg-black/30" />
                    <div
                        className="relative w-full bg-white rounded-t-2xl shadow-2xl p-5 pb-8 space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-1 mb-2" />
                        <p className="font-bold text-gray-800">
                            {mobilePicker.type === 'move'
                                ? `Chuyển "${mobilePicker.name}" đến`
                                : `Thêm "${mobilePicker.name}" vào`}
                        </p>
                        <div>
                            <p className="text-xs text-gray-500 mb-2 font-medium">Chọn ngày</p>
                            <div className="flex gap-2 flex-wrap">
                                {itinerary.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPickerDay(i)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${pickerDay === i
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        Ngày {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-2 font-medium">Chọn buổi</p>
                            <div className="flex gap-2">
                                {SLOT_ORDER.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setPickerSlot(s)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${pickerSlot === s
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {SLOT_META[s].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleMobilePick}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-orange-200 cursor-pointer"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}
            {/* ── Activity Modal Overlay ── */}
            <ActivityModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveActivity}
                initialData={modalConfig.initialData}
            />
            {/* ── Share & Collab Modal ── */}
            <SharePlanModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                planId={planId}
                isPublic={isPublic}
                shareToken={shareToken}
                onTogglePublic={handleTogglePublic}
                members={members}
                onMemberChange={fetchMembers}
            />
        </div>
    );
}



// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIPlannerPage() {
    const { planId } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState<'input' | 'plan'>('input');
    const [loadingPlan, setLoadingPlan] = useState(false);

    // Legacy states purely for generating without auth 
    const [planData, setPlanData] = useState<PlanData | null>(null);

    // Effect: Load plan from URL if planId is present
    useEffect(() => {
        if (planId) {
            setStep('plan');
            setLoadingPlan(true);

            aiPlannerApi.getPlan(planId)
                .then(data => {
                    setPlanData(data);
                })
                .catch(err => {
                    console.error(err);
                    alert('Không thể tải kế hoạch này, có thể bạn không có quyền truy cập hoặc link đã hỏng.');
                    navigate('/ai-planner');
                })
                .finally(() => {
                    setLoadingPlan(false);
                });
        } else {
            setStep('input');
            setPlanData(null);
        }
    }, [planId, navigate]);

    const handleGenerate = async (p: string, days: number, info: string) => {
        try {
            const result = await aiPlannerApi.generatePlan({ place: p, numberOfDays: days, additionalInformation: info });

            // Case A: Backend already saved and returned an ID
            if (result.id) {
                navigate(`/ai-planner/${result.id}`);
                return;
            }

            // Case B: Mock mode or needs manual save — preserve preferenceServices in the cached plan
            const saveResult = await aiPlannerApi.savePlan({
                title: `Kế hoạch ${p} ${days} ngày`,
                destination: p,
                days: days,
                itinerary: injectIds(result.itinerary),
                isPublic: false,
                preferenceServices: (result as any).preferenceServices || [],
            });

            navigate(`/ai-planner/${saveResult.id}`);
        } catch (error) {
            console.error(error);
            alert('Tạo plan thất bại, vui lòng thử lại.');
        }
    };

    const handleManualCreate = async (p: string, days: number) => {
        try {
            const emptyItinerary = Array.from({ length: days }).map((_, i) => ({
                day: i + 1,
                day_label: `Ngày ${i + 1}`,
                morning_activities: [],
                afternoon_activities: [],
                evening_activities: []
            }));

            const saveResult = await aiPlannerApi.savePlan({
                title: `Kế hoạch thủ công - ${p} ${days} ngày`,
                destination: p,
                days: days,
                itinerary: emptyItinerary,
                isPublic: false
            });

            navigate(`/ai-planner/${saveResult.id}`);
        } catch (error) {
            console.error(error);
            alert('Tạo lịch trình thủ công thất bại, vui lòng thử lại.');
        }
    };

    if (step === 'plan') {
        if (loadingPlan) {
            return (
                <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4 text-orange-500">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-semibold text-gray-600">Đang tải kế hoạch...</p>
                </div>
            );
        }
        if (planData) {
            return <PlanEditor planData={planData} onReset={() => navigate('/ai-planner')} />;
        }
        return <div className="text-center p-10">Lỗi không tải được kế hoạch.</div>;
    }

    return <InputScreen onGenerate={handleGenerate} onManualCreate={handleManualCreate} />;
}
