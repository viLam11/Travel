// src/pages/ServiceProvider/Reviews/ProviderReviews.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/admin/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/admin/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/admin/dialog";
import { Star, MessageSquare, Send, Reply, CheckCircle2, Clock, Flag, AlertTriangle, X } from 'lucide-react';
import { MOCK_REVIEWS } from '@/mocks/reviews';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/services/apiClient';
import { useEffect } from 'react';

const USE_MOCK = false;

const ProviderReviews = () => {
    const { currentUser } = useAuth();

    // Get current provider's service ID from auth context
    const currentServiceId = currentUser?.user?.serviceId || 1;
    const serviceName = currentServiceId === 1 ? "Grand Hotel Saigon" : "Ha Long Bay Cruise";

    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [editingReply, setEditingReply] = useState<Record<number, boolean>>({});

    // Report State
    const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState<string>('');
    const [otherReason, setOtherReason] = useState<string>('');
    const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
    
    // API Data Tracking
    const [apiReviews, setApiReviews] = useState<any[]>([]);

    const REPORT_REASONS = [
        "Cạnh tranh không lành mạnh, đánh giá ảo dìm sao",
        "Ngôn từ đả kích, xúc phạm cá nhân/doanh nghiệp",
        "Spam quảng cáo tour/khách sạn khác trong phần bình luận",
        "Khác"
    ];

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                if (USE_MOCK) return;
                const response = await apiClient.comments.getByServiceId(currentServiceId);
                if (response?.data?.content?.length > 0) {
                    setApiReviews(response.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch provider reviews", error);
            }
        };

        if (currentServiceId) {
            fetchReviews();
        }
    }, [currentServiceId]);

    // Format & Filter reviews for this provider's service only
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
                replies: []
            }));
        }

        // Fallback or Mock
        return MOCK_REVIEWS.filter(review =>
            review.serviceId === currentServiceId && review.status === 'approved'
        );
    }, [currentServiceId, apiReviews]);

    // Stats
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
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
                <span className="ml-1 text-sm font-medium text-muted-foreground">{rating}.0</span>
            </div>
        );
    };

    const handleReply = (reviewId: number) => {
        const reply = replyText[reviewId]?.trim();
        if (!reply) {
            alert('Vui lòng nhập nội dung phản hồi');
            return;
        }

        console.log('Reply to review:', reviewId, reply);
        alert(`Phản hồi đã được gửi thành công!\n\nNội dung: "${reply}"`);

        // Clear reply text and exit edit mode
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
        setEditingReply(prev => ({ ...prev, [reviewId]: false }));
    };

    const handleCancelEdit = (reviewId: number) => {
        setEditingReply(prev => ({ ...prev, [reviewId]: false }));
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    };

    const submitReport = () => {
        if (reportingReviewId !== null) {
            setReportedReviews(prev => new Set(prev).add(reportingReviewId));
            alert('Báo cáo đã được gửi đến Ban Quản Trị để xem xét.');
            console.log('Submitted Report:', {
                reviewId: reportingReviewId,
                reason: reportReason === 'Khác' ? otherReason : reportReason,
                reporterId: currentServiceId,
                reporterType: 'provider'
            });
            setReportingReviewId(null);
            setReportReason('');
            setOtherReason('');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Đánh giá của khách hàng</h1>
                <p className="text-lg text-muted-foreground mt-1">
                    Xem và phản hồi đánh giá cho {serviceName}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { title: 'Tổng đánh giá', value: stats.total, badge: 'Tất cả', badgeColor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', icon: MessageSquare },
                    { title: 'Điểm trung bình', value: stats.avgRating, badge: 'Trên 5.0', badgeColor: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', iconBg: 'bg-yellow-100 dark:bg-yellow-500/20', iconColor: 'text-yellow-600 dark:text-yellow-400', icon: Star, fillIcon: true },
                    { title: 'Đã trả lời', value: stats.replied, badge: 'Đã phản hồi', badgeColor: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-500/20', iconColor: 'text-green-600 dark:text-green-400', icon: MessageSquare },
                    { title: 'Chờ trả lời', value: stats.pending, badge: 'Cần xử lý', badgeColor: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-500/20', iconColor: 'text-orange-600 dark:text-orange-400', icon: MessageSquare },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    const valueLength = stat.value.toString().length;
                    let fontSizeClass = 'text-3xl';
                    if (valueLength > 15) {
                        fontSizeClass = 'text-xl';
                    } else if (valueLength > 10) {
                        fontSizeClass = 'text-2xl';
                    }

                    return (
                        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                            <CardContent className="p-6 flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <div className={`${fontSizeClass} font-bold mt-2 break-words leading-tight`}>{stat.value}</div>
                                    <div className="mt-4 flex items-center">
                                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${stat.badgeColor}`}>
                                            {stat.badge}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-3 ${stat.iconBg} rounded-2xl`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor} ${stat.fillIcon ? 'fill-current' : ''}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Reviews List — Card per row */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-4 bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">Danh sách đánh giá</CardTitle>
                        <span className="text-sm text-muted-foreground font-medium">{providerReviews.length} đánh giá</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border">
                    {providerReviews.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <MessageSquare className="w-12 h-12 opacity-20" />
                            <p className="text-base">Chưa có đánh giá nào</p>
                        </div>
                    ) : (
                        providerReviews.map((review) => {
                            const hasReplied = review.replies && review.replies.length > 0;
                            return (
                                <div key={review.id} className="flex gap-0 hover:bg-muted/20 transition-colors group">
                                    {/* Main content */}
                                    <div className="flex-1 p-6 space-y-4">
                                        {/* User info row */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-11 w-11 ring-2 ring-border">
                                                    <AvatarImage src={review.userAvatar} />
                                                    <AvatarFallback className="font-semibold text-base">{review.userName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground leading-tight">{review.userName}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                {getRatingStars(review.rating)}
                                                <Badge
                                                    className={`whitespace-nowrap text-xs font-semibold border-transparent px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${hasReplied
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        }`}
                                                >
                                                    {hasReplied
                                                        ? <><CheckCircle2 className="w-3 h-3 shrink-0" />{review.replies!.length} phản hồi</>
                                                        : <><Clock className="w-3 h-3 shrink-0" />Chờ phản hồi</>
                                                    }
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Comment */}
                                        <p className="text-[15px] text-foreground leading-relaxed">{review.comment}</p>

                                        {/* Review Images */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2">
                                                {review.images.slice(0, 4).map((img: string, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="w-20 h-20 rounded-lg overflow-hidden relative group/img cursor-pointer shrink-0 border border-border"
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`Review ${idx + 1}`}
                                                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                                        />
                                                        {idx === 3 && review.images!.length > 4 && (
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                                                <span className="text-white font-bold text-sm">+{review.images!.length - 4}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Replies Thread */}
                                        {review.replies && review.replies.length > 0 && (
                                            <div className="space-y-3 mt-1">
                                                {review.replies.map((reply) => (
                                                    <div key={reply.id} className="flex gap-3 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10 dark:border-primary/20">
                                                        <div className="bg-primary/15 dark:bg-primary/25 rounded-full p-1.5 h-fit text-primary mt-0.5 shrink-0">
                                                            <Reply className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-sm text-foreground">Phản hồi của bạn</span>
                                                                <span className="text-xs text-muted-foreground">•</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-foreground leading-relaxed">{reply.comment}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply Input */}
                                        {editingReply[review.id] && (
                                            <div className="flex gap-2 items-center bg-muted/30 rounded-xl p-3 border border-border">
                                                <input
                                                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                    placeholder="Viết phản hồi của bạn..."
                                                    value={replyText[review.id] || ''}
                                                    onChange={(e) => setReplyText(prev => ({
                                                        ...prev,
                                                        [review.id]: e.target.value
                                                    }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleReply(review.id);
                                                        }
                                                        if (e.key === 'Escape') handleCancelEdit(review.id);
                                                    }}
                                                    autoFocus
                                                />
                                                <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={() => handleReply(review.id)}>
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:bg-muted" onClick={() => handleCancelEdit(review.id)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Sidebar */}
                                    <div className="w-[140px] shrink-0 border-l border-border flex flex-col items-center justify-start gap-2.5 p-4 pt-5 bg-muted/10">
                                        <Button
                                            size="sm"
                                            onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: true }))}
                                            className={`w-full text-xs gap-1.5 h-9 justify-center shadow-sm font-medium ${hasReplied
                                                ? 'bg-background border border-border text-foreground hover:bg-muted'
                                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                                }`}
                                            variant={hasReplied ? 'outline' : 'default'}
                                        >
                                            <Reply className="w-3.5 h-3.5" />
                                            {hasReplied ? 'Trả lời thêm' : 'Phản hồi'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setReportingReviewId(review.id)}
                                            disabled={reportedReviews.has(review.id)}
                                            className={`w-full text-xs gap-1.5 h-9 justify-center cursor-pointer font-medium ${reportedReviews.has(review.id)
                                                ? 'text-muted-foreground bg-muted border-transparent opacity-60'
                                                : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30 bg-transparent'
                                                }`}
                                        >
                                            <Flag className="w-3.5 h-3.5" />
                                            {reportedReviews.has(review.id) ? 'Đã báo cáo' : 'Báo cáo'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* Results count */}
            <div className="text-sm text-muted-foreground px-1">
                Hiển thị {providerReviews.length} đánh giá đã được duyệt
            </div>

            {/* Provider Report Dialog */}
            <Dialog open={reportingReviewId !== null} onOpenChange={(open) => !open && setReportingReviewId(null)}>
                <DialogContent className="sm:max-w-[425px] border-border bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                            Báo cáo vi phạm
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Vui lòng cho chúng tôi biết lý do bạn báo cáo đánh giá này. Hệ thống sẽ ẩn đánh giá và kiểm duyệt lại.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-3">
                            {REPORT_REASONS.map((reason, idx) => (
                                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input
                                            type="radio"
                                            name="report_reason"
                                            value={reason}
                                            checked={reportReason === reason}
                                            onChange={(e) => setReportReason(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 group-hover:border-primary peer-checked:border-primary transition-colors"></div>
                                        <div className="absolute w-2 h-2 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                                    </div>
                                    <span className={`text-sm ${reportReason === reason ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                        {reason}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {reportReason === "Khác" && (
                            <div className="mt-2">
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Vui lòng cung cấp thêm chi tiết để Admin dễ dàng xác minh..."
                                    className="w-full h-24 p-3 text-sm border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReportingReviewId(null)}
                            className="mt-2 sm:mt-0 cursor-pointer"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={submitReport}
                            disabled={!reportReason || (reportReason === "Khác" && !otherReason.trim())}
                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 cursor-pointer"
                        >
                            Gửi báo cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProviderReviews;
