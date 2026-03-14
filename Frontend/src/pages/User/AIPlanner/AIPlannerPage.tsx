// src/pages/User/AIPlanner/AIPlannerPage.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Sparkles, MapPin, Calendar, ChevronRight, ChevronLeft, Loader2,
    X, GripVertical, Plus, RotateCcw, Sun, Cloud, Moon,
    Clock, DollarSign, Wand2, ArrowRightLeft,
    Waves, Landmark, UtensilsCrossed, Mountain, ShoppingBag, Leaf, BedDouble, Camera,
    CalendarDays, Banknote, RefreshCw, MoveHorizontal, CheckCircle2, PlaneTakeoff, Compass, Receipt,
    BookOpen, BarChart2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiPlannerApi, USE_MOCK_AI_PLANNER } from '@/api/aiPlannerApi';
import { MOCK_LIBRARY_ACTIVITIES } from '@/mocks/aiPlanner';
import type { ItineraryDay, Activity, TimeSlot, PlanData } from '@/types/aiPlanner.types';

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

interface DragPayload {
    activityId: string;
    fromDayIdx: number | null;
    fromSlot: TimeSlot | null;
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity, onRemove, onDragStart, onMobileMove }: {
    activity: Activity;
    onRemove: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onMobileMove?: () => void;
}) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="group bg-white border border-gray-200 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-orange-300 transition-all duration-200 select-none"
        >
            <div className="flex items-start gap-2">
                <GripVertical className="hidden lg:block w-4 h-4 text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400 transition-colors" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 leading-tight truncate">{activity.name}</p>
                    {activity.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3 text-orange-400" />{activity.duration}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <DollarSign className="w-3 h-3 text-orange-400" />{activity.estimated_cost}
                        </span>
                        {activity.location && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3 text-orange-400" /><span className="truncate max-w-[100px]">{activity.location}</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {/* Mobile: move button always visible */}
                    {onMobileMove && (
                        <button
                            onClick={onMobileMove}
                            className="lg:hidden p-1.5 text-orange-400 hover:bg-orange-50 rounded-md"
                            title="Chuyển sang buổi khác"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {/* Remove button */}
                    <button
                        onClick={onRemove}
                        className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 hover:text-red-500 rounded-md text-gray-400"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({ dayIdx, slot, activities, onDrop, onRemove, onDragStartCard, onAddActivity, onMobileMove }: {
    dayIdx: number; slot: TimeSlot; activities: Activity[];
    onDrop: (e: React.DragEvent, toDayIdx: number, toSlot: TimeSlot) => void;
    onRemove: (dayIdx: number, slot: TimeSlot, actIdx: number) => void;
    onDragStartCard: (e: React.DragEvent, payload: DragPayload) => void;
    onAddActivity: (dayIdx: number, slot: TimeSlot) => void;
    onMobileMove?: (activityId: string, fromDayIdx: number, fromSlot: TimeSlot) => void;
}) {
    const [over, setOver] = useState(false);
    const meta = SLOT_META[slot];

    return (
        <div className="space-y-1.5">
            <div className={`flex items-center gap-1.5 mb-2 ${meta.color}`}>
                {meta.icon}
                <span className="text-xs font-semibold uppercase tracking-wide">{meta.label}</span>
                <span className="ml-auto text-xs text-gray-400">{activities.length}</span>
            </div>
            <div
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { setOver(false); onDrop(e, dayIdx, slot); }}
                className={`min-h-[72px] rounded-xl p-2 space-y-2 border-2 border-dashed transition-all duration-200 ${over ? 'border-orange-400 bg-orange-50 scale-[1.01]' : `${meta.border} ${meta.bg}`
                    }`}
            >
                {activities.map((act, idx) => (
                    <ActivityCard
                        key={act.id || idx}
                        activity={act}
                        onRemove={() => onRemove(dayIdx, slot, idx)}
                        onDragStart={e => onDragStartCard(e, { activityId: act.id!, fromDayIdx: dayIdx, fromSlot: slot })}
                        onMobileMove={onMobileMove ? () => onMobileMove(act.id!, dayIdx, slot) : undefined}
                    />
                ))}
                {activities.length === 0 && !over && (
                    <div className="hidden lg:flex items-center justify-center h-14 text-xs text-gray-400">
                        Kéo hoạt động vào đây
                    </div>
                )}
            </div>
            <button
                onClick={() => onAddActivity(dayIdx, slot)}
                className="w-full text-xs text-gray-400 hover:text-orange-500 py-1.5 flex items-center justify-center gap-1 hover:bg-orange-50 rounded-lg transition-colors"
            >
                <Plus className="w-3 h-3" /> Thêm thủ công
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
    const [place, setPlace] = useState('');
    const [days, setDays] = useState(3);
    const [interests, setInterests] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleInterest = (tag: string) =>
        setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const handleSubmit = async () => {
        if (!place.trim()) return;
        setLoading(true);
        // Normalize: capitalize first letter of each word to help restricted BE search
        const formattedPlace = place.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        
        const additionalInfo = [
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
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-orange-500" /> Bạn muốn đi đâu?
                            </label>
                            <input
                                type="text"
                                value={place}
                                onChange={e => setPlace(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="VD: Hà Nội, Đà Nẵng, Hội An, Phú Quốc..."
                                className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow text-base"
                            />
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
                    <div className="px-7 py-5 bg-gray-50 border-t border-gray-100">
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
    const [itinerary, setItinerary] = useState<ItineraryDay[]>(planData.itinerary);
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isPublic, setIsPublic] = useState(planData.isPublic);
    const place = planData.destination;
    const planId = planData.id;
    const isOwner = planData.isOwner;
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
        // Fetch real preferences based on destination
        if (place) {
            setIsLoadingLibrary(true);
            aiPlannerApi.getPreferences(place)
                .then(res => {
                    // Inject IDs for drag and drop
                    const withIds = res.map(a => ({ ...a, id: a.id || uid() }));
                    setLibraryActivities(withIds);
                })
                .catch(err => {
                    console.error("Fetch preferences error:", err);
                })
                .finally(() => {
                    setIsLoadingLibrary(false);
                });
        }
    }, [place]);

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

    const totalActivities = itinerary.reduce((s, d) =>
        s + d.morning_activities.length + d.afternoon_activities.length + d.evening_activities.length, 0);

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
    }, []);

    const handleRemove = useCallback((dayIdx: number, slot: TimeSlot, actIdx: number) => {
        setItinerary(prev => {
            const next = prev.map(d => ({
                ...d,
                morning_activities: [...d.morning_activities],
                afternoon_activities: [...d.afternoon_activities],
                evening_activities: [...d.evening_activities],
            }));
            next[dayIdx][slot].splice(actIdx, 1);
            return next;
        });
    }, []);

    const handleAddActivity = useCallback((dayIdx: number, slot: TimeSlot) => {
        const name = prompt('Tên hoạt động:');
        if (!name?.trim()) return;
        const newAct: Activity = { id: uid(), name: name.trim(), description: '', duration: '1 giờ', estimated_cost: 'Tùy ý', location: '' };
        setItinerary(prev => {
            const next = prev.map(d => ({
                ...d,
                morning_activities: [...d.morning_activities],
                afternoon_activities: [...d.afternoon_activities],
                evening_activities: [...d.evening_activities],
            }));
            next[dayIdx][slot].push(newAct);
            return next;
        });
    }, []);

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
    }, [mobilePicker, pickerDay, pickerSlot]);

    // ── Shared sub-components (reused in both mobile and desktop) ──

    const LibraryContent = () => (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    <p className="text-xs">Đang tải gợi ý...</p>
                </div>
            ) : libraryActivities.length > 0 ? (
                libraryActivities.map(lib => (
                    <div
                        key={lib.id}
                        draggable
                        onDragStart={e => {
                            dragPayload.current = { activityId: lib.id!, fromDayIdx: null, fromSlot: null };
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        className="bg-white border border-gray-200 rounded-xl p-3 hover:border-orange-300 hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-start gap-2">
                            <GripVertical className="hidden lg:block w-3.5 h-3.5 text-gray-300 mt-0.5 group-hover:text-orange-400 shrink-0 transition-colors cursor-grab" />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-800">{lib.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{lib.description}</p>
                                <div className="flex gap-2 mt-1.5">
                                    <span className="text-xs text-gray-500 flex items-center gap-0.5"><Clock className="w-3 h-3 text-orange-400" />{lib.duration}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-orange-400" />{lib.estimated_cost}</span>
                                </div>
                            </div>
                            {/* Mobile: add button */}
                            <button
                                onClick={() => {
                                    setMobilePicker({ type: 'add', libId: lib.id, name: lib.name });
                                    setPickerDay(0);
                                    setPickerSlot('morning_activities');
                                }}
                                className="lg:hidden p-1.5 bg-orange-50 text-orange-500 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-10 text-center px-4">
                    <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Không tìm thấy địa điểm gợi ý cho "{place}"</p>
                </div>
            )}
        </div>
    );

    const SummaryContent = () => (
        <>
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
                {isOwner && (
                    <div className="flex flex-col gap-2 mb-2">
                        <button
                            onClick={async () => {
                                try {
                                    setIsSaving(true);
                                    await aiPlannerApi.updatePlanItinerary(planId, itinerary);
                                    // Optionally show a success toast here
                                } catch (err) {
                                    console.error(err);
                                    alert('Lưu thất bại');
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            disabled={isSaving}
                            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-orange-200 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />} Lưu kế hoạch
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    setIsSharing(true);
                                    const res = await aiPlannerApi.toggleShare(planId, !isPublic);
                                    setIsPublic(res.isPublic);
                                    if (res.isPublic && res.shareUrl) {
                                        navigator.clipboard.writeText(res.shareUrl);
                                        alert('Đã copy link share!');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('Share thất bại');
                                } finally {
                                    setIsSharing(false);
                                }
                            }}
                            disabled={isSharing}
                            className={`w-full py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border ${isPublic ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'} disabled:opacity-50`}
                        >
                            {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            {isPublic ? '🔗 Đang chia sẻ (Bấm copy link)' : 'Chia sẻ Plan'}
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
            {itinerary.map((day, dayIdx) => (
                <div key={dayIdx} className={mobile ? 'w-full' : 'min-w-0'}>
                    <div className="bg-orange-500 text-white rounded-xl px-4 py-3 mb-3 text-center shadow-sm">
                        <p className="font-bold text-sm">{day.day_label}</p>
                    </div>
                    <div className="space-y-3">
                        {SLOT_ORDER.map(slot => (
                            <DropZone
                                key={slot}
                                dayIdx={dayIdx}
                                slot={slot}
                                activities={day[slot]}
                                onDrop={handleDrop}
                                onRemove={handleRemove}
                                onDragStartCard={handleDragStartCard}
                                onAddActivity={handleAddActivity}
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
            ))}
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
                        <h2 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Gợi ý địa điểm
                        </h2>
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
                <div className="shrink-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <h1 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2 truncate">
                            <PlaneTakeoff className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0" />
                            <span className="truncate">{place}</span>
                        </h1>
                        <p className="text-xs text-gray-500">{itinerary.length} ngày · {totalActivities} hoạt động</p>
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
                            <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                                <p className="text-xs text-gray-500">Nhấn vào thẻ để thêm vào lịch trình (kéo thả trên desktop)</p>
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
            // Bước 1: Gọi ChatGPT/Gemini sinh lịch trình
            const result = await aiPlannerApi.generatePlan({ place: p, numberOfDays: days, additionalInformation: info });

            // Bước 2: Bơm ID cho các hoạt động & Lưu vào cache
            const saveResult = await aiPlannerApi.savePlan({
                title: `Kế hoạch ${p} ${days} ngày`,
                destination: p,
                days: days,
                itinerary: injectIds(result.itinerary),
                isPublic: false
            });

            // Bước 3: Chuyển sang URL của Plan
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
