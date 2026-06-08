// src/pages/User/AIPlanner/SharedPlanViewPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Clock, DollarSign, Sun, Moon, Cloud,
    Loader2, ArrowLeft, Copy, Check, Users, Globe, PlaneTakeoff,
    Banknote, TrendingUp, Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import { aiPlannerApi } from '@/api/aiPlannerApi';
import type { PlanData, ItineraryDay, Activity } from '@/types/aiPlanner.types';
import toast from 'react-hot-toast';
import Avatar from '@/components/common/avatar/Avatar';

const parseCost = (s?: string): number => {
    if (!s || s === 'Miễn phí' || s === 'Liên hệ') return 0;
    return parseInt(s.replace(/[^\d]/g, ''), 10) || 0;
};
const fmtVND = (n: number) => n === 0 ? '0₫' : `${n.toLocaleString('vi-VN')}₫`;

const SLOT_META = {
    morning_activities: { label: 'Buổi sáng', icon: <Sun className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    afternoon_activities: { label: 'Buổi chiều', icon: <Cloud className="w-4 h-4" />, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    evening_activities: { label: 'Buổi tối', icon: <Moon className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
} as const;

type SlotKey = keyof typeof SLOT_META;

function ActivityItem({ activity }: { activity: Activity }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <p className="font-bold text-sm text-gray-800">{activity.name}</p>
            {activity.description && (
                <p className="text-[11px] text-gray-500 mt-1 italic leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: activity.description }} />
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
                        <MapPin className="w-3 h-3 text-orange-400" />
                        <span className="truncate max-w-[140px]">{activity.location}</span>
                    </span>
                )}
            </div>
        </div>
    );
}

function DayCard({ day, dayIndex }: { day: ItineraryDay; dayIndex: number }) {
    const slots: SlotKey[] = ['morning_activities', 'afternoon_activities', 'evening_activities'];
    const dayCost = [...day.morning_activities, ...day.afternoon_activities, ...day.evening_activities]
        .reduce((s, a) => s + (a.cost_amount ?? parseCost(a.estimated_cost)), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white px-5 py-3 flex items-center justify-between">
                <p className="font-bold">{day.day_label}</p>
                {dayCost > 0 && (
                    <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Banknote className="w-3 h-3" />{fmtVND(dayCost)}
                    </span>
                )}
            </div>
            <div className="p-4 space-y-4">
                {slots.map(slot => {
                    const acts = day[slot];
                    if (!acts || acts.length === 0) return null;
                    const meta = SLOT_META[slot];
                    return (
                        <div key={slot}>
                            <div className={`flex items-center gap-1.5 mb-2 ${meta.color}`}>
                                {meta.icon}
                                <span className="text-xs font-bold uppercase tracking-wider">{meta.label}</span>
                                <span className="text-[10px] ml-1 opacity-60">({acts.length})</span>
                            </div>
                            <div className="space-y-2">
                                {acts.map((act, i) => <ActivityItem key={act.id || i} activity={act} />)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default function SharedPlanViewPage() {
    const { shareToken } = useParams<{ shareToken: string }>();
    const navigate = useNavigate();
    const [planData, setPlanData] = useState<PlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!shareToken) {
            setError('Link chia sẻ không hợp lệ.');
            setIsLoading(false);
            return;
        }
        aiPlannerApi.getPlanByShareToken(shareToken)
            .then(data => setPlanData(data))
            .catch(() => setError('Không tìm thấy kế hoạch. Link có thể đã hết hạn hoặc không hợp lệ.'))
            .finally(() => setIsLoading(false));
    }, [shareToken]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success('Đã copy liên kết!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Không thể copy liên kết');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-orange-500">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-semibold text-gray-600">Đang tải kế hoạch...</p>
                </div>
            </div>
        );
    }

    if (error || !planData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-red-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy kế hoạch</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const totalActivities = planData.itinerary.reduce((s, d) =>
        s + d.morning_activities.length + d.afternoon_activities.length + d.evening_activities.length, 0);

    const dayCosts = planData.itinerary.map(day =>
        [...day.morning_activities, ...day.afternoon_activities, ...day.evening_activities]
            .reduce((s, a) => s + (a.cost_amount ?? parseCost(a.estimated_cost)), 0)
    );
    const totalCost = dayCosts.reduce((s, c) => s + c, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" /> Kế hoạch công khai
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-sm mb-2 flex items-center gap-2">
                                <PlaneTakeoff className="w-6 h-6 shrink-0" />
                                {planData.title}
                            </h1>
                            {planData.overview && (
                                <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{planData.overview}</p>
                            )}
                        </div>

                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'}`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Đã copy' : 'Copy link'}
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-5 flex-wrap">
                        <div className="flex items-center gap-1.5 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span className="font-semibold">{planData.destination}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/90 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{planData.days} ngày</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{totalActivities} hoạt động</span>
                        </div>
                        {totalCost > 0 && (
                            <div className="flex items-center gap-1.5 text-white/90 text-sm">
                                <Receipt className="w-4 h-4" />
                                <span>~{fmtVND(totalCost)}</span>
                            </div>
                        )}
                        {planData.members && planData.members.length > 0 && (
                            <div className="flex items-center gap-1.5 text-white/90 text-sm">
                                <Users className="w-4 h-4" />
                                <span>{planData.members.length} người</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Members */}
            {planData.members && planData.members.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 py-5">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nhóm du lịch:</span>
                        {planData.members.map(m => (
                            <div key={m.userID} className="flex items-center gap-2 bg-orange-50 rounded-full px-3 py-1.5">
                                <Avatar name={m.fullname} size="sm" />
                                <span className="text-xs font-semibold text-gray-800">{m.fullname}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cost Summary */}
            {totalCost > 0 && (
                <div className="max-w-4xl mx-auto px-4 pt-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-800 text-sm">Tổng chi phí ước tính</span>
                            <span className="ml-auto text-lg font-black text-green-700">{fmtVND(totalCost)}</span>
                        </div>
                        <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {planData.itinerary.map((day, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[10px] text-gray-500 font-medium">{day.day_label}</p>
                                    <p className={`text-sm font-bold mt-0.5 ${dayCosts[i] > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                        {dayCosts[i] > 0 ? fmtVND(dayCosts[i]) : '—'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Itinerary */}
            <div className="max-w-4xl mx-auto px-4 pb-16 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {planData.itinerary.map((day, idx) => (
                        <DayCard key={idx} day={day} dayIndex={idx} />
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-10 bg-gradient-to-r from-orange-500 to-amber-400 rounded-3xl p-6 text-white text-center">
                    <h3 className="text-xl font-black mb-2">Bạn muốn tạo kế hoạch riêng?</h3>
                    <p className="text-white/80 text-sm mb-5">Sử dụng AI Planner để tạo lịch trình du lịch trong vài giây.</p>
                    <button
                        onClick={() => navigate('/ai-planner')}
                        className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
                    >
                        Thử ngay miễn phí
                    </button>
                </div>
            </div>
        </div>
    );
}
