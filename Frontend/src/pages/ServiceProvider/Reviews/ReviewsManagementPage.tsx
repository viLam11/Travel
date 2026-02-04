import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Textarea } from '@/components/ui/admin/textarea';
import {
    Star,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Search,
    Filter,
    Reply,
    Trash2,
    User,
} from 'lucide-react';
import { reviewApi } from '@/api/reviewApi';
import type { Review, ReviewStatus } from '@/types/review.types';
import toast from 'react-hot-toast';

// Utility: Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Stats Card Component
function StatsCard({ stat }: { stat: { title: string; value: string | number; icon: any; color: string; iconBg: string } }) {
    const Icon = stat.icon;
    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.iconBg} p-4 rounded-xl`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Review Card Component
function ReviewCard({
    review,
    onReply,
    onApprove,
    onReject,
    onDelete,
}: {
    review: Review;
    onReply: (review: Review) => void;
    onApprove: (review: Review) => void;
    onReject: (review: Review) => void;
    onDelete: (review: Review) => void;
}) {
    const statusConfig = {
        approved: { bg: "bg-green-100", text: "text-green-700", label: "Đã duyệt" },
        pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" },
        rejected: { bg: "bg-red-100", text: "text-red-700", label: "Từ chối" },
    };
    const config = statusConfig[review.status];

    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {review.user.avatar ? (
                                <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold">{review.user.name}</p>
                            <p className="text-sm text-muted-foreground">{review.service.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                    </div>
                    <Badge className={`${config.bg} ${config.text}`}>
                        {config.label}
                    </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                    ))}
                    <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                </div>

                {/* Comment */}
                <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        {review.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Review ${idx + 1}`}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                        ))}
                    </div>
                )}

                {/* Reply */}
                {review.reply && (
                    <div className="bg-muted p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Phản hồi của bạn:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.reply}</p>
                        {review.repliedAt && (
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(review.repliedAt)}</p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                    {!review.reply && (
                        <Button size="sm" variant="outline" onClick={() => onReply(review)}>
                            <Reply className="w-4 h-4 mr-2" />
                            Trả lời
                        </Button>
                    )}
                    {review.status === 'pending' && (
                        <>
                            <Button size="sm" variant="outline" onClick={() => onApprove(review)} className="text-green-600 hover:text-green-700">
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Duyệt
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onReject(review)} className="text-red-600 hover:text-red-700">
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Từ chối
                            </Button>
                        </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onDelete(review)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Reply Modal Component
function ReplyModal({
    review,
    open,
    onClose,
    onSuccess,
}: {
    review: Review | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [reply, setReply] = useState('');

    const replyMutation = useMutation({
        mutationFn: () => reviewApi.replyToReview(review!.id, reply),
        onSuccess: () => {
            toast.success('Đã gửi phản hồi!');
            setReply('');
            onSuccess();
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi gửi phản hồi');
        },
    });

    if (!open || !review) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
                <div className="border-b border-border p-6">
                    <h2 className="text-xl font-bold">Trả lời đánh giá</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm font-medium mb-2">Đánh giá của {review.user.name}:</p>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Phản hồi của bạn:</label>
                        <Textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Nhập phản hồi..."
                            rows={4}
                        />
                    </div>
                </div>
                <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={replyMutation.isPending}>
                        Hủy
                    </Button>
                    <Button
                        onClick={() => replyMutation.mutate()}
                        disabled={replyMutation.isPending || !reply.trim()}
                    >
                        {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Main Component
export default function ReviewsManagementPage() {
    const queryClient = useQueryClient();
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
    const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch review stats
    const { data: stats } = useQuery({
        queryKey: ['review-stats'],
        queryFn: () => reviewApi.getReviewStats(),
    });

    // Fetch reviews
    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['provider-reviews', statusFilter, ratingFilter],
        queryFn: () => reviewApi.getProviderReviews({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        }),
    });

    // Mutations
    const approveMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.updateReviewStatus(reviewId, 'approved'),
        onSuccess: () => {
            toast.success('Đã duyệt đánh giá!');
            queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['review-stats'] });
        },
        onError: () => toast.error('Có lỗi xảy ra'),
    });

    const rejectMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.updateReviewStatus(reviewId, 'rejected'),
        onSuccess: () => {
            toast.success('Đã từ chối đánh giá!');
            queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['review-stats'] });
        },
        onError: () => toast.error('Có lỗi xảy ra'),
    });

    const deleteMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
        onSuccess: () => {
            toast.success('Đã xóa đánh giá!');
            queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['review-stats'] });
        },
        onError: () => toast.error('Có lỗi xảy ra'),
    });

    const handleReply = (review: Review) => {
        setSelectedReview(review);
        setShowReplyModal(true);
    };

    const handleApprove = (review: Review) => {
        approveMutation.mutate(review.id);
    };

    const handleReject = (review: Review) => {
        rejectMutation.mutate(review.id);
    };

    const handleDelete = (review: Review) => {
        if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
            deleteMutation.mutate(review.id);
        }
    };

    const filteredReviews = reviewsData?.reviews.filter(review =>
        review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.service.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const statsCards = [
        {
            title: "Tổng đánh giá",
            value: stats?.total || 0,
            icon: MessageSquare,
            color: "text-blue-600",
            iconBg: "bg-blue-100 dark:bg-blue-950",
        },
        {
            title: "Chờ duyệt",
            value: stats?.pending || 0,
            icon: Filter,
            color: "text-yellow-600",
            iconBg: "bg-yellow-100 dark:bg-yellow-950",
        },
        {
            title: "Đã duyệt",
            value: stats?.approved || 0,
            icon: ThumbsUp,
            color: "text-green-600",
            iconBg: "bg-green-100 dark:bg-green-950",
        },
        {
            title: "Đánh giá trung bình",
            value: stats?.averageRating.toFixed(1) || '0.0',
            icon: Star,
            color: "text-purple-600",
            iconBg: "bg-purple-100 dark:bg-purple-950",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý tất cả đánh giá từ khách hàng
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <StatsCard key={index} stat={stat} />
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm đánh giá..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
                            className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">Tất cả đánh giá</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            onReply={handleReply}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">Không tìm thấy đánh giá nào</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reply Modal */}
            <ReplyModal
                review={selectedReview}
                open={showReplyModal}
                onClose={() => {
                    setShowReplyModal(false);
                    setSelectedReview(null);
                }}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
                    setShowReplyModal(false);
                    setSelectedReview(null);
                }}
            />
        </div>
    );
}
