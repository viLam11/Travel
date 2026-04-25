// src/pages/ServiceProvider/Reviews/ProviderReviews.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/admin/dialog";
import { Star, MessageSquare, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { MOCK_REVIEWS } from '@/mocks/reviews';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/services/apiClient';
import { useEffect } from 'react';

const USE_MOCK = false;

const AVATAR_COLORS = [
    "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
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
    
    // API Data
    const [apiReviews, setApiReviews] = useState<any[]>([]);

    const REPORT_REASONS = [
        "Cạnh tranh không lành mạnh, đánh giá ảo",
        "Ngôn từ đả kích, xúc phạm",
        "Spam quảng cáo",
        "Khác"
    ];

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                if (USE_MOCK) return;
                const response: any = await apiClient.comments.getByServiceId(currentServiceId);
                const fetchedReviews = response?.content || (Array.isArray(response) ? response : (response?.data || response?.items || []));
                
                if (fetchedReviews && fetchedReviews.length > 0) {
                    setApiReviews(fetchedReviews);
                }
            } catch (error) {
                console.error("Failed to fetch provider reviews", error);
            }
        };
        if (currentServiceId) fetchReviews();
    }, [currentServiceId]);

    const providerReviews = useMemo(() => {
        const hasRealReviews = apiReviews.length > 0;
        if (hasRealReviews) {
            return apiReviews.map((r: any) => ({
                id: r.id,
                userId: r.user?.id || 0,
                userName: r.user?.fullname || r.user?.username || "Người dùng",
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
            ? (providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length).toFixed(1)
            : '0.0',
        replied: providerReviews.filter(r => r.replies && r.replies.length > 0).length,
        pending: providerReviews.filter(r => !r.replies || r.replies.length === 0).length,
    }), [providerReviews]);

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-500' : 'text-gray-200 dark:text-gray-700'}`}
                    />
                ))}
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

    const STAT_CARDS = [
        { title: 'Tổng đánh giá', value: stats.total, badge: 'Đánh giá hiển thị', iconColor: "text-blue-600", iconBg: "bg-blue-50 dark:bg-blue-950/40", accent: "border-blue-500", icon: MessageSquare },
        { title: 'Điểm trung bình', value: stats.avgRating, badge: 'Chất lượng', iconColor: "text-amber-500", iconBg: "bg-amber-50 dark:bg-amber-950/40", accent: "border-amber-400", icon: Star },
        { title: 'Đã phản hồi', value: stats.replied, badge: 'Đã tương tác', iconColor: "text-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-950/40", accent: "border-emerald-500", icon: CheckCircle2 },
        { title: 'Chưa phản hồi', value: stats.pending, badge: 'Đang đợi rep', iconColor: "text-orange-500", iconBg: "bg-orange-50 dark:bg-orange-950/40", accent: "border-orange-500", icon: Clock },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Đánh giá khách hàng</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý và tương tác đánh giá dịch vụ <span className="font-semibold text-foreground">{serviceName}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {STAT_CARDS.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="relative flex items-center justify-between p-5 rounded-xl bg-card shadow-[0_2px_12px_rgb(0,0,0,0.06)] dark:shadow-none border border-border/40 overflow-hidden">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">{stat.title}</p>
                                <div className="text-[28px] font-semibold text-foreground leading-none mb-2 truncate">{stat.value}</div>
                                <p className="text-[12px] text-muted-foreground truncate">{stat.badge}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor} ${stat.title === 'Điểm trung bình' ? 'fill-current' : ''}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reviews List */}
            <div className="bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl border border-border p-8 pb-2">
                <div className="flex flex-col divide-y divide-border -mx-8 px-8">
                    {providerReviews.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <MessageSquare className="w-12 h-12 opacity-20" />
                            <p className="text-[14px]">Chưa có đánh giá nào được tìm thấy</p>
                        </div>
                    ) : (
                        providerReviews.map((review, idx) => {
                            const hasReplied = review.replies && review.replies.length > 0;
                            const initial = review.userName ? review.userName[0].toUpperCase() : 'U';
                            const avatarClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                            return (
                                <div key={review.id} className="py-5">
                                    {/* User info row */}
                                    <div className="flex gap-4">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0 ${avatarClass}`}>
                                            {initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-[14px] text-foreground">{review.userName}</p>
                                                {hasReplied && (
                                                    <span className="rounded-full bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 px-2.5 py-0.5 text-[11px] font-medium">
                                                        Đã phản hồi
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getRatingStars(review.rating)}
                                                <span className="text-[13px] text-muted-foreground">
                                                    {Number(review.rating).toFixed(1)} • {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* Comment text */}
                                            <p className="text-[14px] text-foreground leading-relaxed mt-2">
                                                {review.comment}
                                            </p>

                                            {/* Images Gallery */}
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 pt-3">
                                                    {review.images.map((img: string, idx: number) => (
                                                        <div key={idx} className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-border bg-muted">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Replies */}
                                            {hasReplied && review.replies.map((reply: any) => (
                                                <div key={reply.id} className="border-l-[3px] border-blue-200 dark:border-blue-800 pl-3 mt-3 bg-transparent">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-[12px] font-medium text-muted-foreground">Phản hồi của khách sạn</span>
                                                        <span className="text-[12px] text-muted-foreground">• {new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <p className="text-[13px] text-foreground">{reply.comment}</p>
                                                </div>
                                            ))}

                                            {/* Actions */}
                                            {!editingReply[review.id] && (
                                                <div className="flex items-center gap-3 pt-4">
                                                    {hasReplied ? (
                                                        <Button size="sm" variant="outline" className="h-8">Xem phản hồi</Button>
                                                    ) : (
                                                        <Button size="sm" variant="default" className="h-8" onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: true }))}>
                                                            Phản hồi ngay
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setReportingReviewId(review.id)}
                                                        disabled={reportedReviews.has(review.id)}
                                                        className={`text-muted-foreground font-normal text-sm hover:text-destructive transition-colors ${reportedReviews.has(review.id) ? 'opacity-50' : ''}`}
                                                    >
                                                        {reportedReviews.has(review.id) ? 'Đã báo cáo' : 'Báo cáo vi phạm'}
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Reply Thread Input */}
                                            {editingReply[review.id] && (
                                                <div className="border-l-[3px] border-blue-200 dark:border-blue-800 pl-3 mt-4 bg-transparent max-w-2xl">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <span className="text-[12px] font-medium text-muted-foreground">Phản hồi mới</span>
                                                    </div>
                                                    <div className="border border-border rounded-md overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary/20">
                                                        <textarea
                                                            placeholder="Nhập nội dung phản hồi..."
                                                            className="flex min-h-[60px] w-full resize-none border-0 bg-transparent p-2.5 text-[13px] focus:outline-none placeholder:text-muted-foreground"
                                                            value={replyText[review.id] || ''}
                                                            onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                        />
                                                        <div className="flex items-center justify-end gap-2 bg-muted/20 p-2 border-t border-border">
                                                            <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: false }))}>
                                                                Hủy
                                                            </Button>
                                                            <Button size="sm" className="h-7 text-[12px] gap-1" onClick={() => handleReply(review.id)}>
                                                                <Send className="w-3 h-3" /> Gửi
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Provider Report Dialog */}
            <Dialog open={reportingReviewId !== null} onOpenChange={(open) => !open && setReportingReviewId(null)}>
                <DialogContent className="sm:max-w-md border-border bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Báo cáo vi phạm
                        </DialogTitle>
                        <DialogDescription className="text-[14px]">
                            Đánh giá này sẽ được hệ thống xem xét trong 24h.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 space-y-3">
                        {REPORT_REASONS.map((reason, idx) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="report_reason"
                                    value={reason}
                                    checked={reportReason === reason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-4 h-4 text-primary focus:ring-primary border-border bg-background"
                                />
                                <span className={`text-[14px] ${reportReason === reason ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                    {reason}
                                </span>
                            </label>
                        ))}
                        {reportReason === "Khác" && (
                            <textarea
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="Nhập lý do chi tiết..."
                                className="w-full h-20 p-3 mt-2 text-[13px] border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background"
                            />
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border mt-4">
                        <Button type="button" variant="ghost" onClick={() => setReportingReviewId(null)}>
                            Hủy bỏ
                        </Button>
                        <Button type="button" variant="destructive" onClick={submitReport} disabled={!reportReason || (reportReason === "Khác" && !otherReason.trim())}>
                            Gửi báo cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
