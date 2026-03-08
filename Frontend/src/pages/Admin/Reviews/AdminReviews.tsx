// src/pages/Admin/Reviews/AdminReviews.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/admin/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import { Check, X, Trash2, MessageSquare, Star } from 'lucide-react';
import { MOCK_REVIEWS, type MockReview } from '@/mocks/reviews';

const AdminReviews = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Filter reviews
    const filteredReviews = useMemo(() => {
        return MOCK_REVIEWS.filter(review => {
            const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
            const matchesType = typeFilter === 'all' || review.serviceType === typeFilter;
            return matchesStatus && matchesType;
        });
    }, [statusFilter, typeFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: MOCK_REVIEWS.length,
        pending: MOCK_REVIEWS.filter(r => r.status === 'pending').length,
        approved: MOCK_REVIEWS.filter(r => r.status === 'approved').length,
        rejected: MOCK_REVIEWS.filter(r => r.status === 'rejected').length,
    }), []);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            approved: { variant: 'default', label: 'Approved', className: 'bg-green-500' },
            pending: { variant: 'secondary', label: 'Pending' },
            rejected: { variant: 'outline', label: 'Rejected', className: 'bg-red-500 text-white' },
        };
        const config = variants[status] || variants.pending;
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

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

    const handleApprove = (review: MockReview) => {
        console.log('Approve review:', review.id);
        alert(`Approved review from ${review.userName}`);
    };

    const handleReject = (review: MockReview) => {
        console.log('Reject review:', review.id);
        alert(`Rejected review from ${review.userName}`);
    };

    const handleDelete = (review: MockReview) => {
        if (confirm(`Are you sure you want to delete this review from ${review.userName}?`)) {
            console.log('Delete review:', review.id);
            alert(`Deleted review from ${review.userName}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
                <p className="text-muted-foreground mt-1">
                    Approve, reject, or delete user reviews
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Service Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="hotel">Hotels</SelectItem>
                                <SelectItem value="tour">Tours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No reviews found
                        </CardContent>
                    </Card>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <Avatar>
                                                <AvatarImage src={review.userAvatar} />
                                                <AvatarFallback>{review.userName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{review.userName}</span>
                                                    {getStatusBadge(review.status)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {review.serviceName} ({review.serviceType})
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getRatingStars(review.rating)}
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {review.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2 text-green-600 hover:text-green-700"
                                                        onClick={() => handleApprove(review)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2 text-yellow-600 hover:text-yellow-700"
                                                        onClick={() => handleReject(review)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(review)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Review Comment */}
                                    <div className="pl-14">
                                        <p className="text-sm">{review.comment}</p>
                                    </div>

                                    {/* Provider Replies */}
                                    {review.replies && review.replies.length > 0 && (
                                        <div className="pl-14 space-y-3 border-l-2 border-muted ml-6">
                                            {review.replies.map((reply) => (
                                                <div key={reply.id} className="pl-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MessageSquare className="w-4 h-4 text-primary" />
                                                        <span className="font-medium text-sm">{reply.providerName}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground pl-6">{reply.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredReviews.length} of {MOCK_REVIEWS.length} reviews
            </div>
        </div>
    );
};

export default AdminReviews;
