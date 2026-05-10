// src/pages/ServiceProvider/Reviews/ProviderReviews.tsx
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/admin/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/admin/dialog";
import { Star, MessageSquare, Send, CheckCircle2, Clock, AlertTriangle, Reply, Loader2, Pencil, Trash2 } from 'lucide-react';
import { MOCK_REVIEWS } from '@/mocks/reviews';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/services/apiClient';
import toast from 'react-hot-toast';
import { serviceApi } from '@/api/serviceApi';

import { Card, CardContent } from '@/components/ui/admin/card';
import { useQuery } from '@tanstack/react-query';

const USE_MOCK = false;

// --- Stats Card Component ---
function StatsCard({ title, value, subValue, icon: Icon, color, bg }: any) {
    return (
        <Card className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    {subValue && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

const AVATAR_COLORS = [
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
];

export default function ProviderReviews() {
    const { currentUser } = useAuth();
    const currentServiceId = currentUser?.user?.serviceId || 1;
    // Fetch service detail to get the real name
    const { data: serviceDetail } = useQuery({
        queryKey: ['serviceDetail', currentServiceId],
        queryFn: async () => {
            const data = await serviceApi.getServiceById(currentServiceId.toString());
            return data;
        },
        enabled: !!currentServiceId
    });

    const serviceName = serviceDetail?.serviceName || (currentServiceId === 1 ? "Grand Hotel Saigon" : "Đang tải...");

    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [editingReply, setEditingReply] = useState<Record<number, boolean>>({});
    const [isSubmittingReply, setIsSubmittingReply] = useState<Record<number, boolean>>({});

    // State for editing/deleting existing replies
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editReplyValue, setEditReplyValue] = useState<string>('');
    const [isUpdatingReply, setIsUpdatingReply] = useState<boolean>(false);

    // Report State
    const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState<string>('');
    const [otherReason, setOtherReason] = useState<string>('');
    const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());

    const REPORT_REASONS = [
        "Cạnh tranh không lành mạnh, đánh giá ảo",
        "Ngôn từ đả kích, xúc phạm",
        "Spam quảng cáo",
        "Khác"
    ];

    // API Data with React Query to prevent refetching on tab switch
    const { data: apiReviews = [], isLoading, refetch } = useQuery({
        queryKey: ['providerReviews', currentServiceId],
        queryFn: async () => {
            if (USE_MOCK) return [];
            const response: any = await apiClient.comments.getByServiceId(currentServiceId);
            const fetchedReviews = response?.content || (Array.isArray(response) ? response : (response?.data || response?.items || []));
            return fetchedReviews || [];
        },
        enabled: !!currentServiceId,
        staleTime: 0, // Dữ liệu luôn "cũ", React Query sẽ render từ cache ngay lập tức sau đó fetch ngầm API mới
    });

    const providerReviews = useMemo(() => {
        if (USE_MOCK) {
            return MOCK_REVIEWS.filter(review => review.serviceId === currentServiceId && review.status === 'approved');
        }

        // Lọc bỏ các comment là reply (bị backend trả về ở top-level)
        const replyIds = new Set<number>();
        apiReviews.forEach((r: any) => {
            if (r.replies && Array.isArray(r.replies)) {
                r.replies.forEach((reply: any) => replyIds.add(reply.id));
            }
        });

        // Chỉ lấy các đánh giá gốc (không nằm trong danh sách replyIds) và tùy chọn lọc rating
        const topLevelReviews = apiReviews.filter((r: any) => !replyIds.has(r.id) && !r.parentCommentId);

        return topLevelReviews.map((r: any) => ({
            id: r.id,
            userId: r.user?.id || 0,
            userName: r.username || r.user?.fullname || r.user?.username || "Người dùng ẩn danh",
            userAvatar: r.user?.avatar || undefined,
            serviceId: r.serviceId || currentServiceId,
            rating: r.rating || 5,
            comment: r.content || "",
            images: Array.isArray(r.imageList)
                ? r.imageList.map((img: any) => typeof img === 'string' ? img : img?.url || img?.imageUrl || '')
                : (Array.isArray(r.images)
                    ? r.images.map((img: any) => typeof img === 'string' ? img : img?.url || img?.imageUrl || '')
                    : []),
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: r.updatedAt || new Date().toISOString(),
            status: 'approved',
            replies: r.replies ? r.replies.map((reply: any) => ({
                id: reply.id,
                comment: reply.content,
                createdAt: reply.createdAt || new Date().toISOString()
            })) : []
        }));
    }, [currentServiceId, apiReviews]);

    const [sortBy, setSortBy] = useState<string>('newest');
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const sortedReviews = useMemo(() => {
        const list = [...providerReviews];
        if (sortBy === 'newest') {
            return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (sortBy === 'oldest') {
            return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        if (sortBy === 'unreplied') {
            return list.sort((a, b) => {
                const aHasReply = a.replies && a.replies.length > 0;
                const bHasReply = b.replies && b.replies.length > 0;
                if (!aHasReply && bHasReply) return -1;
                if (aHasReply && !bHasReply) return 1;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
        }
        return list;
    }, [providerReviews, sortBy]);

    const paginatedReviews = useMemo(() => {
        return sortedReviews.slice(0, page * pageSize);
    }, [sortedReviews, page]);

    useEffect(() => {
        setPage(1);
    }, [sortBy]);

    const stats = useMemo(() => ({
        total: providerReviews.length,
        avgRating: providerReviews.length > 0
            ? (providerReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / providerReviews.length).toFixed(1)
            : '0.0',
        replied: providerReviews.filter((r: any) => r.replies && r.replies.length > 0).length,
        pending: providerReviews.filter((r: any) => !r.replies || r.replies.length === 0).length,
    }), [providerReviews]);

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                    ))}
                </div>
                <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300">{Number(rating).toFixed(1)}</span>
            </div>
        );
    };

    const handleReply = async (reviewId: number) => {
        const reply = replyText[reviewId]?.trim();
        if (!reply) return;

        setIsSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
        try {
            await apiClient.comments.reply(reviewId, { content: reply });
            toast.success("Phản hồi đã được gửi thành công");
            setReplyText(prev => ({ ...prev, [reviewId]: '' }));
            setEditingReply(prev => ({ ...prev, [reviewId]: false }));
            // Refresh the query so the new reply shows up immediately
            refetch();
        } catch (error) {
            console.error("Reply error:", error);
            toast.error("Không thể gửi phản hồi. Vui lòng thử lại.");
        } finally {
            setIsSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    const handleStartEdit = (replyId: number, content: string) => {
        setEditingReplyId(replyId);
        setEditReplyValue(content);
    };

    const handleUpdateReply = async (replyId: number) => {
        if (!editReplyValue.trim()) return;
        setIsUpdatingReply(true);
        try {
            await apiClient.comments.update(replyId, editReplyValue, 5); // Default rating 5 for replies
            toast.success("Đã cập nhật phản hồi");
            setEditingReplyId(null);
            refetch();
        } catch (error) {
            console.error("Update reply error:", error);
            toast.error("Không thể cập nhật phản hồi");
        } finally {
            setIsUpdatingReply(false);
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;
        try {
            await apiClient.comments.delete(replyId);
            toast.success("Đã xóa phản hồi");
            refetch();
        } catch (error) {
            console.error("Delete reply error:", error);
            toast.error("Không thể xóa phản hồi");
        }
    };

    const submitReport = () => {
        if (reportingReviewId !== null) {
            setReportedReviews(prev => new Set(prev).add(reportingReviewId));
            setReportingReviewId(null);
            setReportReason('');
            setOtherReason('');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Đánh giá khách hàng
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        Quản lý phản hồi cho dịch vụ <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">{serviceName}</span>
                    </p>
                </div>
            </div>

            {/* Standard Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse shadow-sm border-border/40 rounded-xl">
                            <CardContent className="p-6 space-y-3">
                                <div className="h-4 bg-muted rounded w-24"></div>
                                <div className="h-8 bg-muted rounded w-16"></div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <StatsCard title="Tổng đánh giá" value={stats.total} subValue="Đánh giá hiển thị" icon={MessageSquare} color="text-blue-600" bg="bg-blue-100" />
                        <StatsCard title="Điểm trung bình" value={stats.avgRating} subValue="Chất lượng" icon={Star} color="text-amber-600" bg="bg-amber-100" />
                        <StatsCard title="Đã phản hồi" value={stats.replied} subValue="Tương tác tốt" icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" />
                        <StatsCard title="Chưa phản hồi" value={stats.pending} subValue="Cần chú ý" icon={Clock} color="text-rose-600" bg="bg-rose-100" />
                    </>
                )}
            </div>

            {/* Premium Reviews Feed */}
            <div className="flex justify-end">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Sắp xếp:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="cursor-pointer bg-background text-foreground border border-border/80 rounded-xl px-3 h-10 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none min-w-[180px]"
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="unreplied">Chưa phản hồi (Cũ nhất trước)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    // Skeleton reviews
                    [1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : providerReviews.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 py-32 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">Hãy cung cấp dịch vụ tốt nhất để nhận được những phản hồi tích cực từ khách hàng của bạn.</p>
                    </div>
                ) : (
                    paginatedReviews.map((review: any, idx: number) => {
                        const hasReplied = review.replies && review.replies.length > 0;
                        const initial = review.userName ? review.userName[0].toUpperCase() : 'U';
                        const avatarClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                        return (
                            <Card key={review.id} className="shadow-sm border-border/60 hover:border-primary/20 transition-all duration-200 overflow-hidden group max-w-5xl">
                                <CardContent className="p-5">
                                    {/* Top Row: Avatar, Name, Rating */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {review.userAvatar ? (
                                                <img src={review.userAvatar} alt={review.userName} className="w-9 h-9 rounded-full object-cover ring-2 ring-background shadow-sm" />
                                            ) : (
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-background ${avatarClass}`}>
                                                    {initial}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-[14px] text-foreground leading-tight">{review.userName}</h4>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                        {getRatingStars(review.rating)}
                                    </div>

                                    {/* Content */}
                                    <div className="pl-[48px]">
                                        <p className="text-[13.5px] text-foreground leading-[1.5] font-normal">
                                            {review.comment}
                                        </p>

                                        {/* Images Gallery */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {review.images.map((img: string, idx: number) => (
                                                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-border/40 group/img cursor-zoom-in">
                                                        <img src={img} alt="Review attachment" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Existing Replies Thread */}
                                        {hasReplied && (
                                            <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
                                                {review.replies.map((reply: any) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        {/* Provider Avatar */}
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-background mt-1">
                                                            <Reply className="w-4 h-4 text-primary" />
                                                        </div>

                                                        <div className="flex-1 bg-primary/5 dark:bg-primary/10 rounded-2xl rounded-tl-none p-3.5 border border-primary/10 group/reply">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[13px] font-bold text-foreground">{serviceName}</span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/90 text-primary-foreground uppercase tracking-wider shadow-sm">
                                                                        Chủ dịch vụ
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                                        {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                    <div className="flex items-center gap-1 ml-1 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                                                        <button 
                                                                            onClick={() => handleStartEdit(reply.id, reply.comment)}
                                                                            className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                                                            title="Chỉnh sửa"
                                                                        >
                                                                            <Pencil className="w-3 h-3" />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDeleteReply(reply.id)}
                                                                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                                                            title="Xóa"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {editingReplyId === reply.id ? (
                                                                <div className="space-y-2">
                                                                    <textarea 
                                                                        className="w-full bg-white dark:bg-gray-800 border border-primary/30 rounded-lg p-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] text-foreground"
                                                                        value={editReplyValue}
                                                                        onChange={(e) => setEditReplyValue(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button size="sm" variant="ghost" onClick={() => setEditingReplyId(null)} className="h-7 text-xs cursor-pointer">
                                                                            Hủy
                                                                        </Button>
                                                                        <Button size="sm" onClick={() => handleUpdateReply(reply.id)} disabled={isUpdatingReply} className="h-7 text-xs px-4 cursor-pointer">
                                                                            {isUpdatingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Lưu'}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                                                    {reply.comment}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions & Reply Input */}
                                        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                                            <div className="flex items-center gap-2">
                                                {!editingReply[review.id] && !hasReplied && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: true }))}
                                                        className="text-primary hover:text-primary hover:bg-primary/5 font-semibold h-7 text-xs"
                                                    >
                                                        <Reply className="w-3.5 h-3.5 mr-1" /> Trả lời
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReportingReviewId(review.id)}
                                                    disabled={reportedReviews.has(review.id)}
                                                    className={`h-7 font-medium text-[12px] ${reportedReviews.has(review.id) ? 'text-muted-foreground' : 'text-muted-foreground hover:text-red-500 hover:bg-red-50/50'}`}
                                                >
                                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                                    {reportedReviews.has(review.id) ? 'Đã báo cáo' : 'Báo cáo'}
                                                </Button>
                                            </div>

                                            {hasReplied && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100/50 dark:border-emerald-900/50">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    Đã phản hồi
                                                </div>
                                            )}
                                        </div>

                                        {editingReply[review.id] && (
                                            <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                                    <Reply className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 bg-background rounded-2xl rounded-tl-none p-1 border border-primary/20 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                                    <textarea
                                                        placeholder="Viết phản hồi chuyên nghiệp..."
                                                        className="w-full min-h-[60px] bg-transparent border-0 text-[13px] text-foreground p-3 focus:ring-0 placeholder:text-muted-foreground resize-none outline-none"
                                                        value={replyText[review.id] || ''}
                                                        onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center justify-end gap-2 p-2 pt-0">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: false }))} className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground">
                                                            Hủy
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleReply(review.id)} disabled={isSubmittingReply[review.id]} className="h-7 px-4 text-xs shadow-none rounded-xl">
                                                            {isSubmittingReply[review.id] ? (
                                                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                            ) : (
                                                                <Send className="w-3.5 h-3.5 mr-1.5" />
                                                            )}
                                                            Gửi
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
                {providerReviews.length > paginatedReviews.length && (
                    <div className="flex justify-center pt-4">
                        <Button 
                            onClick={() => setPage(p => p + 1)}
                            className="bg-card hover:bg-muted text-foreground border border-border shadow-sm rounded-xl px-6 h-11 text-sm font-semibold transition-all"
                        >
                            Xem thêm đánh giá
                        </Button>
                    </div>
                )}
            </div>

            {/* Provider Report Dialog */}
            <Dialog open={reportingReviewId !== null} onOpenChange={(open) => !open && setReportingReviewId(null)}>
                <DialogContent className="sm:max-w-md border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            Báo cáo vi phạm
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-gray-500 dark:text-gray-400 pt-2">
                            Chúng tôi sẽ xem xét đánh giá này trong vòng 24 giờ. Đánh giá vi phạm tiêu chuẩn cộng đồng sẽ bị gỡ bỏ.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        {REPORT_REASONS.map((reason, idx) => (
                            <label key={idx} className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                <input
                                    type="radio"
                                    name="report_reason"
                                    value={reason}
                                    checked={reportReason === reason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                                />
                                <span className={`text-[14px] leading-tight ${reportReason === reason ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                                    {reason}
                                </span>
                            </label>
                        ))}
                        {reportReason === "Khác" && (
                            <div className="pl-7 pr-3">
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Nhập chi tiết lý do báo cáo để chúng tôi xử lý nhanh hơn..."
                                    className="w-full p-4 text-[14px] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="ghost" onClick={() => setReportingReviewId(null)} className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300">
                            Hủy bỏ
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={submitReport}
                            disabled={!reportReason || (reportReason === "Khác" && !otherReason.trim())}
                            className="rounded-xl shadow-md"
                        >
                            Gửi báo cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
