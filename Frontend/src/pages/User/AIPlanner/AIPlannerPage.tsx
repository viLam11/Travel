// src/pages/User/AIPlanner/AIPlannerPage.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Sparkles, MapPin, Calendar, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Loader2,
    X, GripVertical, Plus, RotateCcw, Sun, Moon,
    Clock, DollarSign, Wand2, ArrowRightLeft,
    Waves, Landmark, UtensilsCrossed, Mountain, ShoppingBag, Leaf, BedDouble, Camera,
    CalendarDays, Banknote, RefreshCw, MoveHorizontal, CheckCircle2, PlaneTakeoff, Compass, Receipt,
    BookOpen, BarChart2, Edit2, Share2, Cloud, CloudUpload, XCircle, Settings, Star, ExternalLink, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
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
    const [cost, setCost] = useState(initialData?.estimated_cost || 'Miễn phí');
    const [location, setLocation] = useState(initialData?.location || '');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setDescription(initialData?.description || '');
            setDuration(initialData?.duration || '1 giờ');
            setCost(initialData?.estimated_cost || 'Miễn phí');
            setLocation(initialData?.location || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), description, duration, estimated_cost: cost, location });
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
                                        <DollarSign className="w-4 h-4 text-orange-400" /> Chi phí
                                    </label>
                                    <input
                                        type="text"
                                        value={cost}
                                        onChange={e => setCost(e.target.value)}
                                        placeholder="VD: 50.000đ"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                                    />
                                </div>
                            </div>

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

function ActivityCard({ activity, onRemove, onEdit, onUpdate, onDragStart, onMobileMove }: {
    activity: Activity;
    onRemove: () => void;
    onEdit: () => void;
    onUpdate: (data: Partial<Activity>) => void;
    onDragStart: (e: React.DragEvent) => void;
    onMobileMove?: () => void;
}) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: activity.name, description: activity.description });
    const [isConfirming, setIsConfirming] = useState(false);

    const handleSave = () => {
        if (!editData.name.trim()) return;
        if (editData.name === activity.name && editData.description === activity.description) {
            setIsEditing(false);
            return;
        }
        setIsConfirming(true);
    };

    const confirmSave = () => {
        onUpdate(editData);
        setIsEditing(false);
        setIsConfirming(false);
    };

    // ── System service card (has thumbnail) ──
    if (activity.isSystemService && activity.thumbnailUrl && !isEditing) {
        return (
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group relative">
                <div
                    draggable
                    onDragStart={onDragStart}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 select-none cursor-grab active:cursor-grabbing"
                >
                    <div className="flex gap-0">
                        {/* Thumbnail */}
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
                        {/* Content */}
                        <div className="flex-1 p-2.5 min-w-0 flex flex-col justify-between">
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
                        {/* Actions */}
                        <div className="flex flex-col gap-0.5 p-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={onRemove} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors" title="Xóa">
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

    // ── Regular / editable card ──
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <div
                draggable={!isEditing}
                onDragStart={onDragStart}
                className={`bg-white border rounded-xl p-3 shadow-sm transition-all duration-200 select-none ${
                    isEditing ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200 hover:shadow-md hover:border-orange-300'
                }`}
            >
                <div className="flex items-start gap-2">
                    {!isEditing && (
                        <div className="mt-0.5 shrink-0 text-gray-300 group-hover:text-orange-400 transition-colors hidden lg:block cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    autoFocus
                                    className="w-full text-sm font-bold border-b border-orange-200 focus:outline-none focus:border-orange-500 bg-orange-50/30 px-1 py-0.5"
                                    value={editData.name}
                                    onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <textarea
                                    className="w-full text-[11px] border border-gray-200 rounded p-1 focus:outline-none focus:border-orange-500 resize-none"
                                    rows={3}
                                    value={editData.description}
                                    onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                />
                                <div className="flex justify-end gap-2 pt-1">
                                    <AnimatePresence mode="wait">
                                        {isConfirming ? (
                                            <motion.div
                                                key="confirm"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="text-[10px] text-orange-600 font-bold animate-pulse">Lưu thay đổi?</span>
                                                <button onClick={() => setIsConfirming(false)} className="text-[10px] text-gray-400 hover:text-gray-600 font-medium px-2 py-1">Quay lại</button>
                                                <button onClick={confirmSave} className="text-[10px] bg-green-500 text-white rounded px-3 py-1 font-bold hover:bg-green-600 shadow-sm shadow-green-100">Xác nhận</button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="edit-actions"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <button onClick={() => setIsEditing(false)} className="text-[10px] text-gray-400 hover:text-gray-600 font-medium px-2 py-1">Hủy</button>
                                                <button onClick={handleSave} className="text-[10px] bg-orange-500 text-white rounded px-3 py-1 font-bold hover:bg-orange-600 shadow-sm shadow-orange-200">Lưu</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="font-bold text-sm text-gray-800 leading-tight group-hover:text-orange-600 transition-colors">{activity.name}</p>
                                {activity.description && (
                                    <div className="relative mt-1">
                                        <p
                                            className={`text-[11px] text-gray-500 leading-relaxed italic transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}
                                            dangerouslySetInnerHTML={{ __html: activity.description || '' }}
                                        />
                                        {activity.description.length > 60 && (
                                            <button
                                                onClick={() => setIsExpanded(!isExpanded)}
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
                                    {activity.isSystemService && activity.serviceUrl && (
                                        <button
                                            onClick={e => { e.stopPropagation(); navigate(activity.serviceUrl!); }}
                                            className="flex items-center gap-0.5 text-[11px] text-orange-500 hover:text-orange-700 font-semibold"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Xem
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-md transition-colors"
                                title="Sửa nhanh (Tên/Mô tả)"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={onEdit}
                                className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-md transition-colors"
                                title="Sửa chi tiết (Vị trí/Chi phí...)"
                            >
                                <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={onRemove}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                title="Xóa"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

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

function DropZone({ dayIdx, slot, activities = [], onDrop, onRemove, onEditActivity, onUpdateActivity, onDragStartCard, onAddActivity, onMobileMove, onMoveSlot, canMoveUp, canMoveDown }: {
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
                            onUpdate={(data) => onUpdateActivity(dayIdx, slot, idx, data)}
                            onDragStart={e => onDragStartCard(e, { activityId: act.id!, fromDayIdx: dayIdx, fromSlot: slot })}
                            onMobileMove={onMobileMove ? () => onMobileMove(act.id!, dayIdx, slot) : undefined}
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

// ─── Input Screen ─────────────────────────────────────────────────────────────


const SAMPLE_PLAN = [
    { time: 'Buổi sáng', icon: <Sun className="w-3.5 h-3.5 text-amber-500" />, name: 'Hồ Hoàn Kiếm', loc: 'Hoàn Kiếm', cost: 'Miễn phí', duration: '2 giờ' },
    { time: 'Buổi chiều', icon: <Cloud className="w-3.5 h-3.5 text-sky-500" />, name: 'Văn Miếu Quốc Tử Giám', loc: 'Đống Đa', cost: '30.000đ', duration: '1.5 giờ' },
    { time: 'Buổi tối', icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />, name: 'Phố ăn đêm Tạ Hiện', loc: 'Hoàn Kiếm', cost: '150.000đ', duration: '2 giờ' },
];

function InputScreen({ onGenerate }: { onGenerate: (place: string, days: number, info: string) => Promise<void> }) {
    const navigate = useNavigate();
    const [place, setPlace] = useState('');
    const [days, setDays] = useState(3);
    const [interests, setInterests] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [specificLocation, setSpecificLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState<any[]>([]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const data = await apiClient.provinces.getAll();
                setProvinces(data);
                if (data && data.length > 0) {
                    setPlace(data[0].name);
                }
            } catch (err) {
                console.error("Failed to fetch provinces", err);
            }
        };
        fetchProvinces();
    }, []);

    const toggleInterest = (tag: string) =>
        setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const handleSubmit = async () => {
        if (!place.trim()) return;
        setLoading(true);
        // Normalize: capitalize first letter of each word to help restricted BE search
        const formattedPlace = place.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

        const additionalInfo = [
            specificLocation.trim() ? `Chi tiết vị trí mong muốn: ${specificLocation}` : '',
            interests.length ? `Sở thích: ${interests.join(', ')}` : '',
            notes.trim() ? `Ghi chú: ${notes}` : '',
        ].filter(Boolean).join('. ');
        await onGenerate(formattedPlace, days, additionalInfo);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-gray-50 to-white">
            {/* Hero */}
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
                        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                            Chế độ Demo
                        </span>
                    )}
                </div>
            </div>

            {/* ── CENTERED MAIN FORM ── */}
            <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10 pb-12">
                <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden">
                    <div className="p-7 space-y-5">
                        {/* Destination */}
                        <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-500" /> Tỉnh/Thành phố
                                </label>
                                <div className="relative">
                                    <select
                                        value={place}
                                        onChange={e => setPlace(e.target.value)}
                                        className="appearance-none w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow text-base bg-white cursor-pointer"
                                    >
                                        {provinces.length === 0 && <option value="">Đang tải...</option>}
                                        {provinces.map(prov => (
                                            <option key={prov.code} value={prov.name}>{prov.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

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
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                                    <button onClick={() => setDays(d => Math.max(1, d - 1))} className="px-5 h-11 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors font-bold text-xl">−</button>
                                    <span className="px-6 h-11 flex items-center justify-center font-bold text-xl text-gray-800 min-w-[56px] border-x border-gray-200">{days}</span>
                                    <button onClick={() => setDays(d => Math.min(14, d + 1))} className="px-5 h-11 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors font-bold text-xl">+</button>
                                </div>
                                <span className="text-gray-500 text-sm">{days} ngày · {days - 1} đêm</span>
                            </div>
                        </div>

                        {/* Interests */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Sở thích <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_TAGS.map(tag => (
                                    <button
                                        key={tag.label}
                                        onClick={() => toggleInterest(tag.label)}
                                        className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 font-medium ${interests.includes(tag.label)
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
                                            }`}
                                    >
                                        {tag.icon}{tag.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Ghi chú thêm <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="VD: Đi 2 người, budget 5 triệu..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="px-7 py-5 bg-gray-50 border-t border-gray-100 space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={!place.trim() || loading}
                            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 hover:-translate-y-0.5 text-base"
                        >
                            {loading
                                ? <><Loader2 className="w-5 h-5 animate-spin" /> AI đang lập kế hoạch...</>
                                : <><Wand2 className="w-5 h-5" /> Tạo kế hoạch ngay</>
                            }
                        </button>
                        
                        <div className="flex items-center gap-4 py-1">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-xs font-medium text-gray-400">hoặc</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        <button
                            onClick={() => navigate('/my-plans')}
                            className="w-full py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-orange-600 text-gray-600 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group"
                        >
                            <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" /> Quản lý kế hoạch của bạn
                        </button>
                    </div>
                </div>

            </div>

            {/* ── FEATURES & PREVIEW SECTION ── */}
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-800">Lên kế hoạch thông minh và dễ dàng</h2>
                    <p className="text-gray-500 mt-2">Dưới đây là một ví dụ về kế hoạch mà AI có thể tự động tạo cho bạn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Feature cards (Left) */}
                    <div className="flex flex-col gap-6 order-2 lg:order-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                { icon: <CalendarDays className="w-5 h-5 text-orange-500" />, title: 'Lịch trình rõ ràng', desc: 'Chia theo Ngày · Sáng · Chiều · Tối' },
                                { icon: <MoveHorizontal className="w-5 h-5 text-sky-500" />, title: 'Kéo thả tự do', desc: 'Di chuyển hoạt động giữa các ngày' },
                                { icon: <Banknote className="w-5 h-5 text-green-500" />, title: 'Ước tính ngân sách', desc: 'Chi phí ước tính cho từng điểm' },
                                { icon: <RefreshCw className="w-5 h-5 text-purple-500" />, title: 'Tạo lại ngay', desc: 'Không vừa ý? Click tạo là có plan mới' },
                            ].map(f => (
                                <div key={f.title} className="bg-white border text-left border-gray-100 rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="mb-3 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">{f.icon}</div>
                                    <p className="font-semibold text-gray-800">{f.title}</p>
                                    <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 justify-center sm:justify-start pl-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-600">Hoàn toàn miễn phí · Không cần tài khoản Pro</span>
                        </div>
                    </div>

                    {/* Sample plan card (Right) */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-transform hover:scale-[1.02] duration-300">
                            <div className="px-5 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Ví dụ kế hoạch AI tạo</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Hà Nội · Ngày 1</p>
                                </div>
                                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI Generated
                                </span>
                            </div>
                            <div className="p-4 space-y-3">
                                {SAMPLE_PLAN.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex items-center gap-1.5 w-24 shrink-0 pt-0.5">
                                            {item.icon}
                                            <span className="text-xs text-gray-500 font-medium">{item.time}</span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                            <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-orange-400" />{item.loc}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3 text-orange-400" />{item.duration}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1"><DollarSign className="w-3 h-3 text-orange-400" />{item.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs text-gray-400 text-center">Sau khi AI tạo — bạn có thể kéo thả để tùy chỉnh thoải mái</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Social Proof Banner ── */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 py-8 px-4 my-4">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
                    {[
                        { value: '50+', label: 'Điểm đến', sub: 'trong nước & quốc tế', icon: <MapPin className="w-6 h-6 mx-auto mb-1 opacity-80" /> },
                        { value: '1,200+', label: 'Kế hoạch đã tạo', sub: 'bởi người dùng thực', icon: <CalendarDays className="w-6 h-6 mx-auto mb-1 opacity-80" /> },
                        { value: 'Gemini', label: 'Powered by', sub: 'Google AI · Chính xác cao', icon: <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-80" /> },
                        { value: '100%', label: 'Miễn phí', sub: 'Không cần tài khoản Pro', icon: <CheckCircle2 className="w-6 h-6 mx-auto mb-1 opacity-80" /> },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center">
                            {s.icon}
                            <p className="text-2xl font-black tracking-tight">{s.value}</p>
                            <p className="text-sm font-semibold mt-0.5">{s.label}</p>
                            <p className="text-xs opacity-75 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── How it works ── */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                {/* Divider */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest px-2">Cách hoạt động</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                </div>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">3 bước đơn giản</h2>
                    <p className="text-gray-500 mt-1 text-sm">Từ ý tưởng đến kế hoạch hoàn chỉnh trong vài giây</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            step: '01',
                            icon: <MapPin className="w-6 h-6 text-orange-500" />,
                            title: 'Chọn điểm đến',
                            desc: 'Nhập tên thành phố, số ngày và sở thích của bạn.',
                            color: 'bg-orange-50 border-orange-200 hover:border-orange-300',
                            numColor: 'text-orange-200',
                        },
                        {
                            step: '02',
                            icon: <Sparkles className="w-6 h-6 text-amber-500" />,
                            title: 'AI lên kế hoạch',
                            desc: 'Gemini AI tự động tạo lịch trình chi tiết theo ngày.',
                            color: 'bg-amber-50 border-amber-200 hover:border-amber-300',
                            numColor: 'text-amber-200',
                        },
                        {
                            step: '03',
                            icon: <MoveHorizontal className="w-6 h-6 text-sky-500" />,
                            title: 'Tùy chỉnh theo ý',
                            desc: 'Kéo thả hoạt động, thêm/xóa, sắp xếp lại theo kế hoạch riêng.',
                            color: 'bg-sky-50 border-sky-200 hover:border-sky-300',
                            numColor: 'text-sky-200',
                        },
                    ].map((item, i) => (
                        <div key={i} className={`relative border rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${item.color}`}>
                            <span className={`absolute top-4 right-5 text-5xl font-black select-none leading-none ${item.numColor}`}>{item.step}</span>
                            <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 border border-white">
                                {item.icon}
                            </div>
                            <p className="font-bold text-gray-800 text-base">{item.title}</p>
                            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Plan Editor ─────────────────────────────────────────────────────────────

function PlanEditor({ planData, onReset }: { planData: PlanData; onReset: () => void }) {
    const { confirm } = useConfirm();
    const [itinerary, setItinerary] = useState<ItineraryDay[]>(planData.itinerary);
    const [isPublic, setIsPublic] = useState(planData.isPublic);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState(planData.shareUrl);
    const [members, setMembers] = useState(planData.members || []);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [planTitle, setPlanTitle] = useState(planData.title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [slotOrders, setSlotOrders] = useState<TimeSlot[][]>(() =>
        (planData.itinerary || []).map(() => [...SLOT_ORDER])
    );
    const firstRender = useRef(true);
    const place = planData.destination;
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
                itinerary: itinerary
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

    // Navigation Blockers
    const isDirty = hasUnsavedChanges || hasTitleChange || autoSaveStatus === 'saving' || autoSaveStatus === 'error';
    
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

    const [mobileTab, setMobileTab] = useState<'library' | 'timeline' | 'summary'>('timeline');
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
        // Fallback: fetch from legacy getPreferences endpoint
        if (place) {
            setIsLoadingLibrary(true);
            const mockWithIds = MOCK_LIBRARY_ACTIVITIES.map(a => ({ ...a, id: a.id || uid() }));
            setLibraryActivities(mockWithIds);
            aiPlannerApi.getPreferences(place)
                .then(res => {
                    if (res && res.length > 0) {
                        setLibraryActivities(res.map(a => ({ ...a, id: a.id || uid() })));
                    }
                })
                .catch(err => {
                    console.error("Fetch preferences error:", err);
                })
                .finally(() => {
                    setIsLoadingLibrary(false);
                });
        }
    }, [place, planData.preferenceServices]);

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
            if (res.shareUrl) setShareUrl(res.shareUrl);
        } catch (err) {
            console.error(err);
            toast.error('Cập nhật trạng thái chia sẻ thất bại');
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await aiPlannerApi.getPlan(planId);
            if (data.members) setMembers(data.members);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Shared sub-components (reused in both mobile and desktop) ──

    const LibraryContent = () => {
        const [search, setSearch] = useState('');
        const [typeFilter, setTypeFilter] = useState('ALL');
        const libNavigate = useNavigate();

        const serviceTypes = [...new Set(libraryActivities.map(l => l.serviceType).filter((t): t is string => Boolean(t)))];
        const filtered = libraryActivities.filter(lib => {
            if (search && !lib.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (typeFilter !== 'ALL' && lib.serviceType !== typeFilter) return false;
            return true;
        });

        return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Search */}
            <div className="px-3 pt-2 pb-1.5 shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm dịch vụ..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-gray-50"
                    />
                </div>
            </div>
            {/* Type filters */}
            {serviceTypes.length > 0 && (
                <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0 border-b border-gray-100">
                    {(['ALL', ...serviceTypes] as string[]).map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${typeFilter === type ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'}`}
                        >
                            {type === 'ALL' ? 'Tất cả' : SERVICE_TYPE_LABELS[type] || type}
                        </button>
                    ))}
                </div>
            )}
            {/* Cards list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {isLoadingLibrary ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                        <p className="text-xs">Đang tải gợi ý...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map(lib => (
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
                                    // ── Card with thumbnail (system service) ──
                                    <div className="flex gap-0">
                                        <div className="w-16 shrink-0 self-stretch relative">
                                            <img
                                                src={lib.thumbnailUrl}
                                                alt={lib.name}
                                                className="w-full h-full object-cover min-h-[68px]"
                                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                        <div className="flex-1 p-2 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <p className="font-bold text-xs text-gray-800 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2 flex-1">{lib.name}</p>
                                                <button
                                                    onClick={() => {
                                                        setMobilePicker({ type: 'add', libId: lib.id, name: lib.name });
                                                        setPickerDay(0);
                                                        setPickerSlot('morning_activities');
                                                    }}
                                                    className="lg:hidden p-1 bg-orange-50 text-orange-500 rounded-md shrink-0 active:scale-95 transition-transform"
                                                >
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
                                            {lib.serviceUrl && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); libNavigate(lib.serviceUrl!); }}
                                                    className="text-[9px] text-orange-400 hover:text-orange-600 font-semibold flex items-center gap-0.5 mt-0.5"
                                                >
                                                    <ExternalLink className="w-2.5 h-2.5" /> Xem chi tiết
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    // ── Text-only card (legacy activity) ──
                                    <div className="flex items-start gap-2 p-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-100 group-hover:bg-orange-400 transition-colors" />
                                        <GripVertical className="hidden lg:block w-3.5 h-3.5 text-gray-300 mt-0.5 group-hover:text-orange-400 shrink-0 transition-colors" />
                                        <div className="min-w-0 flex-1 pl-1">
                                            <p className="font-bold text-xs text-gray-800 group-hover:text-orange-600 transition-colors">{lib.name}</p>
                                            <div className="flex gap-2 mt-1.5">
                                                <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5"><Clock className="w-3 h-3 text-orange-400" />{lib.duration}</span>
                                                <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-orange-400" />{lib.estimated_cost}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setMobilePicker({ type: 'add', libId: lib.id, name: lib.name });
                                                setPickerDay(0);
                                                setPickerSlot('morning_activities');
                                            }}
                                            className="lg:hidden p-1.5 bg-orange-50 text-orange-500 rounded-lg shrink-0 active:scale-95 transition-transform"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-10 text-center px-4">
                        <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">
                            {search ? `Không tìm thấy "${search}"` : `Không có gợi ý cho "${place}"`}
                        </p>
                        {search && (
                            <button onClick={() => setSearch('')} className="text-[10px] text-orange-400 hover:text-orange-600 mt-1 font-semibold">Xóa bộ lọc</button>
                        )}
                    </div>
                )}
            </div>
        </div>
        );
    };

    const SummaryContent = () => (
        <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái lưu</span>
                <div className="flex items-center gap-1.5">
                    {autoSaveStatus === 'saving' && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-500 font-medium animate-pulse">
                            <CloudUpload className="w-3 h-3" /> Đang lưu...
                        </div>
                    )}
                    {autoSaveStatus === 'saved' && (
                        <div className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Đã lưu
                        </div>
                    )}
                    {autoSaveStatus === 'error' && (
                        <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
                            <XCircle className="w-3 h-3" /> Lỗi lưu
                        </div>
                    )}
                    {autoSaveStatus === 'idle' && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <Cloud className="w-3 h-3" /> Đã đồng bộ
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 px-4 py-4 space-y-0 overflow-y-auto text-sm divide-y divide-gray-100">
                {[
                    { label: 'Điểm đến', value: place, icon: <MapPin className="w-3.5 h-3.5 text-orange-400" /> },
                    { label: 'Số ngày', value: `${itinerary.length} ngày`, icon: <CalendarDays className="w-3.5 h-3.5 text-orange-400" /> },
                    { label: 'Hoạt động', value: `${totalActivities} địa điểm`, icon: <Compass className="w-3.5 h-3.5 text-orange-400" /> },
                ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2.5">
                        <span className="text-gray-500 flex items-center gap-1.5">{item.icon}{item.label}</span>
                        <span className="font-semibold text-gray-800">{item.value}</span>
                    </div>
                ))}
                <div className="pt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Chi phí</p>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500 flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5 text-green-400" />Ước tính
                        </span>
                        <span className="text-xs text-gray-400 italic">Xem trong từng HĐ</span>
                    </div>
                    <div className="space-y-1">
                        <label className="text-gray-500 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-orange-400" />Chi phí thực tế
                        </label>
                        <input
                            type="text"
                            placeholder="VD: 2.500.000đ"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-300 text-gray-700 placeholder-gray-300"
                        />
                    </div>
                </div>
                {USE_MOCK_AI_PLANNER && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 pt-3">
                        <p className="font-semibold">Demo Mode</p>
                        {/* <p className="mt-0.5">Đổi <code className="bg-amber-100 px-1 rounded">USE_MOCK = false</code> dùng AI thật.</p> */}
                    </div>
                )}
            </div>
            <div className="px-4 py-4 border-t border-gray-100 space-y-2">
                {isOwner && (() => {
                    const hasChanges = hasUnsavedChanges || hasTitleChange;
                    return (
                        <button
                            onClick={handleManualSave}
                            disabled={autoSaveStatus === 'saving' || (!hasChanges && autoSaveStatus !== 'error')}
                            className={`w-full py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                hasChanges || autoSaveStatus === 'error'
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200'
                                    : 'bg-gray-100 text-gray-400 cursor-default'
                            }`}
                        >
                            {autoSaveStatus === 'saving' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : autoSaveStatus === 'saved' || !hasChanges ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <CloudUpload className="w-4 h-4" />
                            )}
                            {autoSaveStatus === 'saving' ? 'Đang lưu...' : hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}
                        </button>
                    );
                })()}
                {isOwner && (
                    <div className="flex flex-col gap-2 mb-2">


                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className={`w-full py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border ${isPublic ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'} cursor-pointer`}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            {isPublic ? '🔗 Đang chia sẻ public' : 'Chia sẻ & Cộng tác'}
                        </button>
                    </div>
                )}

                {isOwner && (
                    <button
                        onClick={() => setItinerary(planData.itinerary)}
                        className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Khôi phục ban đầu
                    </button>
                )}
            </div>
        </>
    );

    const DayColumns = ({ mobile }: { mobile?: boolean }) => (
        <>
            {itinerary.map((day, dayIdx) => {
                const daySlotOrder = slotOrders[dayIdx] || SLOT_ORDER;
                return (
                <div key={dayIdx} className={mobile ? 'w-full' : 'min-w-0'}>
                    <div className="bg-orange-500 text-white rounded-xl px-4 py-3 mb-3 text-center shadow-sm">
                        <p className="font-bold text-sm">{day.day_label}</p>
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
                            />
                        ))}
                    </div>
                </div>
                );
            })}
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
                {showLibrary ? <LibraryContent /> : (
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
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-orange-500 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200 shrink-0 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Tạo lại</span>
                    </button>
                </div>

                {/* Desktop: CSS grid fills width, no unnecessary scroll */}
                <div className="hidden lg:block flex-1 overflow-x-auto overflow-y-auto">
                    <div
                        className="grid gap-4 p-5 items-start"
                        style={{ gridTemplateColumns: `repeat(${itinerary.length}, minmax(220px, 1fr))` }}
                    >
                        <DayColumns />
                    </div>
                </div>

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
                            <LibraryContent />
                        </div>
                    )}
                    {mobileTab === 'summary' && (
                        <div className="flex flex-col h-full pb-16">
                            <SummaryContent />
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

            {/* ── RIGHT: Summary (desktop, collapsible + resizable) ── */}
            <aside
                className="hidden lg:flex flex-col bg-white border-l border-gray-200 shadow-sm overflow-hidden shrink-0"
                style={{ width: showSummary ? sumWidth : 40 }}
            >
                <div className={`shrink-0 flex items-center border-b border-gray-100 bg-orange-50 ${showSummary ? 'px-3 py-3 justify-between' : 'py-3 justify-center'
                    }`}>
                    <button
                        onClick={() => {
                            const newShow = !showSummary;
                            setShowSummary(newShow);
                            if (newShow) {
                                setSumWidth(prev => Math.max(224, prev));
                            } else {
                                setSumWidth(40);
                            }
                        }}
                        className="p-1 rounded text-gray-400 hover:text-orange-500 transition-colors shrink-0 cursor-pointer"
                    >
                        {showSummary ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    {showSummary && (
                        <h2 className="font-bold text-sm text-gray-800 truncate">Tổng kết</h2>
                    )}
                </div>
                {showSummary ? <SummaryContent /> : (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium select-none"
                            style={{ writingMode: 'vertical-rl' }}>Tổng kết</span>
                    </div>
                )}
            </aside>

            {/* ── MOBILE Bottom Tab Bar ── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex shadow-lg">
                {([
                    { id: 'library', label: 'Địa điểm', icon: <BookOpen className="w-5 h-5" /> },
                    { id: 'timeline', label: 'Lịch trình', icon: <CalendarDays className="w-5 h-5" /> },
                    { id: 'summary', label: 'Tổng kết', icon: <BarChart2 className="w-5 h-5" /> },
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
                shareUrl={shareUrl}
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
        return null;
    }

    return <InputScreen onGenerate={handleGenerate} />;
}
