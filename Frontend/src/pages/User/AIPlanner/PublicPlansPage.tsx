// src/pages/User/AIPlanner/PublicPlansPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Globe, Search, MapPin, Users, Eye, Copy, Loader2,
    Sparkles, ChevronLeft, ChevronRight, X, RefreshCw, Wand2, FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiPlannerApi } from '@/api/aiPlannerApi';
import { useAuth } from '@/hooks/useAuth';
import type { PlanOverallResponse } from '@/types/aiPlanner.types';
import Avatar from '@/components/common/avatar/Avatar';
import Footer from '@/components/common/layout/Footer';
import toast from 'react-hot-toast';

// ─── Thumbnail system (same as MyPlansPage) ─────────────────────────────────

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

// ─── Plan Card ───────────────────────────────────────────────────────────────

interface PlanCardProps {
    plan: PlanOverallResponse;
    onView: (plan: PlanOverallResponse) => void;
    onClone: (plan: PlanOverallResponse) => void;
    cloningId: string | null;
}

function PlanCard({ plan, onView, onClone, cloningId }: PlanCardProps) {
    const thumbnail = getThumbnail(plan.place);
    const isCloning = cloningId === plan.planId;
    const canView = !!plan.shareToken;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col"
        >
            {/* Thumbnail */}
            <div className="relative h-44 bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                    src={thumbnail}
                    alt={plan.place}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-black/10" />

                {/* Destination badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 text-orange-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                        <MapPin className="w-3 h-3" />
                        {plan.place}
                    </span>
                </div>

                {/* Owner */}
                {plan.owner && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                            <Avatar name={plan.owner.fullname} size="sm" />
                            <span className="text-[10px] font-bold text-gray-700 max-w-[80px] truncate">{plan.owner.fullname}</span>
                        </div>
                    </div>
                )}

                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-base font-bold text-white leading-tight drop-shadow-md line-clamp-2 group-hover:text-amber-300 transition-colors">
                        {plan.tripTitle || `Kế hoạch đi ${plan.place}`}
                    </h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
                    {plan.overview || 'Khám phá những điểm đến thú vị và trải nghiệm văn hóa đặc sắc.'}
                </p>

                {/* Members row */}
                {plan.members && plan.members.length > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {plan.members.slice(0, 3).map((m, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-orange-600">
                                    {m.fullname?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {plan.members.length} thành viên
                        </span>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1 border-t border-gray-50">
                    <button
                        onClick={() => onView(plan)}
                        disabled={!canView}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            canView
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 cursor-pointer'
                                : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                        }`}
                        title={!canView ? 'Kế hoạch này chưa có liên kết chia sẻ' : undefined}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Xem kế hoạch
                    </button>
                    <button
                        onClick={() => onClone(plan)}
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
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export default function PublicPlansPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [plans, setPlans] = useState<PlanOverallResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [cloningId, setCloningId] = useState<string | null>(null);

    const fetchPlans = useCallback(async (page: number, silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setError(null);
        try {
            const response = await aiPlannerApi.getPublicPlans(page, PAGE_SIZE);
            // Handle both paginated ({ content, totalPages, totalElements }) and array responses
            if (response && Array.isArray(response.content)) {
                setPlans(response.content);
                setTotalPages(response.totalPages ?? 1);
                setTotalElements(response.totalElements ?? response.content.length);
            } else if (Array.isArray(response)) {
                setPlans(response);
                setTotalPages(1);
                setTotalElements(response.length);
            } else {
                setPlans([]);
            }
        } catch (err) {
            setError('Không thể tải danh sách kế hoạch. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans(currentPage);
    }, [currentPage, fetchPlans]);

    // Client-side filter on loaded page
    const filteredPlans = plans.filter(p => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (p.place || '').toLowerCase().includes(q) ||
            (p.tripTitle || '').toLowerCase().includes(q) ||
            (p.overview || '').toLowerCase().includes(q)
        );
    });

    const handleView = (plan: PlanOverallResponse) => {
        if (!plan.shareToken) {
            toast.error('Kế hoạch này chưa có liên kết chia sẻ công khai.');
            return;
        }
        navigate(`/ai-planner/share/${plan.shareToken}`);
    };

    const handleClone = async (plan: PlanOverallResponse) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để clone kế hoạch này về tài khoản của bạn.');
            navigate('/login');
            return;
        }
        setCloningId(plan.planId);
        try {
            const cloned = await aiPlannerApi.clonePlan(plan.planId);
            toast.success(`Đã clone "${plan.tripTitle || plan.place}" về kế hoạch của bạn!`);
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-white">
                <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Globe className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-white/80">Kế hoạch cộng đồng</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black mb-2">
                        Khám phá lịch trình du lịch
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base max-w-lg">
                        Tìm kiếm, xem và clone những kế hoạch du lịch được chia sẻ từ cộng đồng Travollo.
                    </p>

                    {/* Search bar */}
                    <div className="mt-6 relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo địa điểm, tên kế hoạch..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none shadow-lg text-sm font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Quick stats */}
                    {!isLoading && totalElements > 0 && (
                        <p className="mt-3 text-blue-200 text-xs font-medium">
                            {totalElements.toLocaleString('vi-VN')} kế hoạch đang được chia sẻ
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/ai-planner')}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            <Wand2 className="w-4 h-4" /> Tạo kế hoạch mới
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                            onClick={() => navigate('/my-plans')}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 font-medium transition-colors"
                        >
                            <FolderOpen className="w-4 h-4" /> Kế hoạch của tôi
                        </button>
                    </div>

                    <button
                        onClick={() => fetchPlans(currentPage, true)}
                        disabled={isRefreshing}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                {/* States */}
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center gap-4 text-blue-500">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <p className="text-sm font-medium text-gray-500">Đang tải kế hoạch...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                            <Globe className="w-8 h-8 text-red-300" />
                        </div>
                        <p className="text-gray-600 font-medium">{error}</p>
                        <button
                            onClick={() => fetchPlans(0)}
                            className="text-sm text-blue-600 font-semibold hover:underline"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-4 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                            <Search className="w-10 h-10 text-blue-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                            {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có kế hoạch nào'}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-sm">
                            {searchQuery
                                ? `Không có kế hoạch nào khớp với "${searchQuery}". Thử tìm với từ khóa khác.`
                                : 'Hiện chưa có kế hoạch nào được chia sẻ công khai. Hãy là người đầu tiên!'}
                        </p>
                        {searchQuery ? (
                            <button onClick={() => setSearchQuery('')} className="text-sm text-blue-600 font-semibold hover:underline">
                                Xóa bộ lọc
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/ai-planner')}
                                className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors text-sm"
                            >
                                Tạo kế hoạch đầu tiên
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Search result info */}
                        {searchQuery && (
                            <p className="text-xs text-gray-500 mb-4 font-medium">
                                Tìm thấy <span className="font-bold text-gray-800">{filteredPlans.length}</span> kết quả cho &ldquo;{searchQuery}&rdquo;
                            </p>
                        )}

                        {/* Grid */}
                        <AnimatePresence mode="popLayout">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredPlans.map(plan => (
                                    <PlanCard
                                        key={plan.planId}
                                        plan={plan}
                                        onView={handleView}
                                        onClone={handleClone}
                                        cloningId={cloningId}
                                    />
                                ))}
                            </div>
                        </AnimatePresence>

                        {/* Pagination — only show when not searching (server-side pages) */}
                        {!searchQuery && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    // Show pages around current
                                    let page = i;
                                    if (totalPages > 7) {
                                        if (currentPage < 4) page = i;
                                        else if (currentPage > totalPages - 4) page = totalPages - 7 + i;
                                        else page = currentPage - 3 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                                                page === currentPage
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                        >
                                            {page + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CTA banner */}
            {!isLoading && (
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-8 px-4 text-white">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold">Tạo kế hoạch du lịch bằng AI</p>
                                <p className="text-white/80 text-sm">Miễn phí · Nhanh chóng · Tuỳ chỉnh thoải mái</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/ai-planner')}
                            className="bg-white text-orange-600 font-bold px-6 py-2.5 rounded-full hover:shadow-lg transition-all hover:scale-105 text-sm shrink-0"
                        >
                            Thử ngay miễn phí
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
