// src/pages/ServiceProvider/Reviews/ProviderReviews.tsx
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/admin/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/admin/dialog";
import { Star, MessageSquare, Send, CheckCircle2, Clock, AlertTriangle, Reply } from 'lucide-react';
import { MOCK_REVIEWS } from '@/mocks/reviews';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/services/apiClient';

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
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300"
];

export default function ProviderReviews() {
    const { currentUser } = useAuth();
    const currentServiceId = currentUser?.user?.serviceId || 1;
    const serviceName = currentServiceId === 1 ? "Grand Hotel Saigon" : "Ha Long Bay Cruise";

    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [editingReply, setEditingReply] = useState<Record<number, boolean>>({});

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
    const { data: apiReviews = [], isLoading } = useQuery({
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
        const hasRealReviews = apiReviews.length > 0;
        if (hasRealReviews) {
            return apiReviews.map((r: any) => ({
                id: r.id,
                userId: r.user?.id || 0,
                userName: r.user?.fullname || r.user?.username || "Người dùng ẩn danh",
                userAvatar: r.user?.avatar || undefined,
                serviceId: r.serviceId || currentServiceId,
                rating: r.rating || 5,
                comment: r.content || "",
                images: r.images?.map((img: any) => img.url) || [],
                createdAt: r.createdAt || new Date().toISOString(),
                updatedAt: r.updatedAt || new Date().toISOString(),
                status: 'approved',
                replies: r.replies ? r.replies.map((reply: any) => ({
                    id: reply.id,
                    comment: reply.content,
                    createdAt: reply.createdAt || new Date().toISOString()
                })) : []
            }));
        }
        return MOCK_REVIEWS.filter(review => review.serviceId === currentServiceId && review.status === 'approved');
    }, [currentServiceId, apiReviews]);

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
            <div className="flex items-center gap-0.5 shrink-0 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-200/50 dark:border-yellow-700/50">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                ))}
                <span className="ml-1 text-xs font-bold text-yellow-700 dark:text-yellow-500">{Number(rating).toFixed(1)}</span>
            </div>
        );
    };

    const handleReply = (reviewId: number) => {
        const reply = replyText[reviewId]?.trim();
        if (!reply) return;
        alert(`Phản hồi đã được gửi:\n\n"${reply}"`);
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
        setEditingReply(prev => ({ ...prev, [reviewId]: false }));
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
                    providerReviews.map((review: any, idx: number) => {
                        const hasReplied = review.replies && review.replies.length > 0;
                        const initial = review.userName ? review.userName[0].toUpperCase() : 'U';
                        const avatarClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                        return (
                            <Card key={review.id} className="shadow-sm border-border/40 hover:border-primary/20 transition-colors overflow-hidden">
                                <CardContent className="p-5 flex flex-col md:flex-row gap-6 mt-4">
                                    {/* Left: Avatar & Info */}
                                    <div className="flex items-start gap-4 md:w-64 shrink-0">
                                        {review.userAvatar ? (
                                            <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm ${avatarClass}`}>
                                                {initial}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-foreground truncate">{review.userName}</h4>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            {hasReplied && (
                                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Đã phản hồi
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Content */}
                                    <div className="flex-1 min-w-0">
                                        {getRatingStars(review.rating)}

                                        <p className="text-sm text-foreground mt-3 leading-relaxed">
                                            {review.comment}
                                        </p>

                                        {/* Images Gallery */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {review.images.map((img: string, idx: number) => (
                                                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                                                        <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Existing Replies Thread */}
                                        {hasReplied && (
                                            <div className="mt-4 pt-4 border-t border-border/50 space-y-3 pl-4 border-l-2 border-l-muted">
                                                {review.replies.map((reply: any) => (
                                                    <div key={reply.id} className="relative">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="w-5 h-5 rounded flex items-center justify-center bg-orange-100 text-orange-600">
                                                                <Reply className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-xs font-bold text-foreground">Phản hồi của bạn</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                • {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground">{reply.comment}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions & Reply Input */}
                                        <div className="mt-5">
                                            {!editingReply[review.id] ? (
                                                <div className="flex items-center gap-2">
                                                    {!hasReplied && (
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: true }))}
                                                            className="font-semibold"
                                                        >
                                                            <Reply className="w-4 h-4 mr-2" /> Trả lời đánh giá
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setReportingReviewId(review.id)}
                                                        disabled={reportedReviews.has(review.id)}
                                                        className={`font-semibold ${reportedReviews.has(review.id) ? 'text-muted-foreground' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                                                    >
                                                        <AlertTriangle className="w-4 h-4 mr-2" /> 
                                                        {reportedReviews.has(review.id) ? 'Đã báo cáo' : 'Báo cáo vi phạm'}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="bg-muted/30 rounded-xl p-4 border border-border mt-3">
                                                    <textarea
                                                        placeholder="Nhập nội dung phản hồi của bạn..."
                                                        className="w-full min-h-[80px] bg-transparent border-0 text-sm text-foreground focus:ring-0 placeholder:text-muted-foreground resize-none outline-none"
                                                        value={replyText[review.id] || ''}
                                                        onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border/50">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: false }))}>
                                                            Hủy
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleReply(review.id)}>
                                                            <Send className="w-4 h-4 mr-2" /> Gửi phản hồi
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
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
