// src/api/reviewApi.ts
import type { Review, ReviewStats, ReviewStatus } from '@/types/review.types';

const API_BASE_URL = 'http://localhost:8080';
const USE_MOCK = true;

// Mock Data
const mockReviews: Review[] = [
    {
        id: '1',
        user: { id: 'u1', name: 'Nguyễn Văn An', avatar: 'https://i.pravatar.cc/150?img=1' },
        service: { id: '1', name: 'Khách sạn Majestic Saigon', type: 'hotel' },
        rating: 5,
        comment: 'Khách sạn rất đẹp, phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại!',
        status: 'approved',
        reply: 'Cảm ơn quý khách đã tin tưởng và lựa chọn khách sạn!',
        repliedAt: '2024-12-21T10:00:00Z',
        createdAt: '2024-12-20T15:30:00Z',
        updatedAt: '2024-12-21T10:00:00Z',
    },
    {
        id: '2',
        user: { id: 'u2', name: 'Trần Thị Bình' },
        service: { id: '2', name: 'Dinh Độc Lập', type: 'place' },
        rating: 4,
        comment: 'Địa điểm lịch sử rất đẹp, nên đến tham quan một lần.',
        status: 'pending',
        createdAt: '2024-12-22T09:15:00Z',
        updatedAt: '2024-12-22T09:15:00Z',
    },
    {
        id: '3',
        user: { id: 'u3', name: 'Lê Minh Châu', avatar: 'https://i.pravatar.cc/150?img=3' },
        service: { id: '1', name: 'Khách sạn Majestic Saigon', type: 'hotel' },
        rating: 3,
        comment: 'Khách sạn ổn nhưng giá hơi cao so với chất lượng.',
        status: 'approved',
        createdAt: '2024-12-19T14:20:00Z',
        updatedAt: '2024-12-19T14:20:00Z',
    },
];

const mockStats: ReviewStats = {
    total: 3,
    pending: 1,
    approved: 2,
    rejected: 0,
    averageRating: 4.0,
    ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
};

export const reviewApi = {
    getProviderReviews: async (params?: {
        serviceId?: string;
        status?: ReviewStatus;
        rating?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        reviews: Review[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 400));
            let filtered = [...mockReviews];
            if (params?.status) filtered = filtered.filter(r => r.status === params.status);
            if (params?.rating) filtered = filtered.filter(r => r.rating === params.rating);
            return { reviews: filtered, total: filtered.length, page: 1, totalPages: 1 };
        }

        try {
            const queryParams = new URLSearchParams();
            if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
            if (params?.status) queryParams.append('status', params.status);
            if (params?.rating) queryParams.append('rating', params.rating.toString());
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const response = await fetch(
                `${API_BASE_URL}/api/provider/reviews?${queryParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching provider reviews:', error);
            throw error;
        }
    },

    // Reply to review
    replyToReview: async (reviewId: string, reply: string): Promise<Review> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/reviews/${reviewId}/reply`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ reply }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error replying to review:', error);
            throw error;
        }
    },

    // Update review status (approve/reject)
    updateReviewStatus: async (reviewId: string, status: ReviewStatus): Promise<Review> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/reviews/${reviewId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating review status:', error);
            throw error;
        }
    },

    // Delete review
    deleteReview: async (reviewId: string): Promise<void> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/reviews/${reviewId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    },

    // Get review stats
    getReviewStats: async (): Promise<ReviewStats> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockStats;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/reviews/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching review stats:', error);
            throw error;
        }
    },
};
