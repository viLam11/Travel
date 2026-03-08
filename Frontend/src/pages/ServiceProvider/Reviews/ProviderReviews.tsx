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
import { Star, MessageSquare, Send, Reply, CheckCircle2, Clock } from 'lucide-react';
import { MOCK_REVIEWS } from '@/mocks/reviews';
import { useAuth } from '@/hooks/useAuth';

const ProviderReviews = () => {
    const { currentUser } = useAuth();

    // Get current provider's service ID from auth context
    const currentServiceId = currentUser?.user?.serviceId || 1;
    const serviceName = currentServiceId === 1 ? "Grand Hotel Saigon" : "Ha Long Bay Cruise";

    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [editingReply, setEditingReply] = useState<Record<number, boolean>>({});

    // Filter reviews for this provider's service only
    const providerReviews = useMemo(() => {
        return MOCK_REVIEWS.filter(review =>
            review.serviceId === currentServiceId && review.status === 'approved'
        );
    }, [currentServiceId]);

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
                <span className="ml-1 text-sm font-medium">{rating}.0</span>
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

            {/* Reviews Table */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4 bg-muted/30">
                    <CardTitle className="text-xl font-bold">Danh sách đánh giá</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="py-4 px-6 text-base font-semibold text-foreground">Khách hàng</TableHead>
                                    <TableHead className="py-4 px-6 text-base font-semibold text-foreground">Đánh giá</TableHead>
                                    <TableHead className="w-[40%] py-4 px-6 text-base font-semibold text-foreground">Bình luận</TableHead>
                                    <TableHead className="py-4 px-6 text-base font-semibold text-foreground">Ngày</TableHead>
                                    <TableHead className="py-4 px-6 text-base font-semibold text-foreground">Trạng thái</TableHead>
                                    <TableHead className="text-right py-4 px-6 text-base font-semibold text-foreground">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {providerReviews.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-lg text-muted-foreground">
                                            Không tìm thấy đánh giá nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    providerReviews.map((review) => {
                                        const hasReplied = review.replies && review.replies.length > 0;
                                        return (
                                            <TableRow key={review.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={review.userAvatar} />
                                                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-base">{review.userName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    {getRatingStars(review.rating)}
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <div className="space-y-3">
                                                        {/* Original Review */}
                                                        <div className="space-y-2">
                                                            <p className="text-base">{review.comment}</p>

                                                            {/* Review Images */}
                                                            {review.images && review.images.length > 0 && (
                                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                                    {review.images.slice(0, 3).map((img, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                                                                        >
                                                                            <img
                                                                                src={img}
                                                                                alt={`Review ${idx + 1}`}
                                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                            />
                                                                            {idx === 2 && review.images!.length > 3 && (
                                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                                    <span className="text-white font-bold text-sm">
                                                                                        +{review.images!.length - 3}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Replies Thread */}
                                                        {review.replies && review.replies.length > 0 && (
                                                            <div className="space-y-2 ml-4 border-l-2 border-primary/30 pl-4">
                                                                {review.replies.map((reply) => (
                                                                    <div key={reply.id} className="bg-muted/50 p-3 rounded-lg text-sm">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="font-semibold text-foreground">Bạn</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-muted-foreground">{reply.comment}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* New Reply Input (always show) */}
                                                        {editingReply[review.id] && (
                                                            <div className="ml-4 border-l-2 border-primary/30 pl-4">
                                                                <div className="flex gap-2 items-start">
                                                                    <input
                                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                                        placeholder="Viết phản hồi..."
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
                                                                    <Button size="icon" className="h-10 w-10 shrink-0" onClick={() => handleReply(review.id)}>
                                                                        <Send className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="outline" className="h-10 w-10 shrink-0" onClick={() => handleCancelEdit(review.id)}>
                                                                        <span className="text-xs">✕</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-base text-muted-foreground">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <Badge
                                                        className={`whitespace-nowrap text-xs font-medium border-transparent px-2.5 py-1 inline-flex items-center gap-1.5 ${hasReplied
                                                            ? 'bg-green-500 hover:bg-green-500 text-white'
                                                            : 'bg-amber-500 hover:bg-amber-500 text-white'
                                                            }`}
                                                    >
                                                        {hasReplied
                                                            ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" />{review.replies!.length} phản hồi</>
                                                            : <><Clock className="w-3.5 h-3.5 shrink-0" />Chưa phản hồi</>
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-4 px-6">
                                                    {!editingReply[review.id] && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setEditingReply(prev => ({ ...prev, [review.id]: true }))}
                                                            className={`text-xs gap-1.5 h-8 px-3 ${hasReplied
                                                                ? 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                                                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                                                }`}
                                                            variant={hasReplied ? 'ghost' : 'default'}
                                                        >
                                                            <Reply className="w-3.5 h-3.5" />
                                                            {hasReplied ? 'Trả lời thêm' : 'Phản hồi'}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Results count */}
            <div className="text-base text-muted-foreground p-1">
                Hiển thị {providerReviews.length} đánh giá đã được duyệt
            </div>
        </div>
    );
};

export default ProviderReviews;
