import type { Review, ReviewStats, ReviewStatus } from '@/types/review.types';
import apiClient from '@/services/apiClient';

import { shouldUseMock } from '@/config/mockConfig';

// ─── CẤU HÌNH MOCK DỮ LIỆU CỤC BỘ ──────────────────────────────────────────────
const LOCAL_MOCK_OVERRIDE: boolean | null = false;
const USE_MOCK = shouldUseMock(LOCAL_MOCK_OVERRIDE);
// ──────────────────────────────────────────────────────────────────────────────

// Mock Data
const mockReviews: Review[] = [
    {
        id: '1',
        content: 'Khách sạn rất đẹp, phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại!',
        rating: 5,
        likes: 12,
        dislikes: 0,
        createdAt: '2024-12-20T15:30:00Z',
        userID: 'u1',
        username: 'Nguyễn Văn An',
        serviceID: '1',
        serviceName: 'Khách sạn Majestic Saigon',
        imageList: [],
        replies: [
            { id: 'r1', content: 'Cảm ơn quý khách đã tin tưởng và lựa chọn khách sạn!', createdAt: '2024-12-21T10:00:00Z' }
        ]
    },
    {
        id: '2',
        content: 'Địa điểm lịch sử rất đẹp, nên đến tham quan một lần.',
        rating: 4,
        likes: 3,
        dislikes: 0,
        createdAt: '2024-12-22T09:15:00Z',
        userID: 'u2',
        username: 'Trần Thị Bình',
        serviceID: '2',
        serviceName: 'Dinh Độc Lập',
        imageList: [],
    },
    {
        id: '3',
        content: 'Khách sạn ổn nhưng giá hơi cao so với chất lượng.',
        rating: 3,
        likes: 1,
        dislikes: 0,
        createdAt: '2024-12-19T14:20:00Z',
        userID: 'u3',
        username: 'Lê Minh Châu',
        serviceID: '1',
        serviceName: 'Khách sạn Majestic Saigon',
        imageList: [],
    },
];

const mockStats: ReviewStats = {
    total: 3,
    pending: 1,
    approved: 2,
    rejected: 0,
    averageRating: 4,
    ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
};

export const reviewApi = {
    /**
     * Lấy danh sách review theo service
     * Backend: GET /comment/{serviceID}?page=&size=&sortBy=&direction=
     * ⚠️ NOTE: BE chưa có endpoint lọc review theo provider (chỉ có theo serviceID)
     *          Cần BE thêm: GET /comment/provider/all để lấy tất cả review của provider
     */
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
                if (params?.status) filtered = filtered.filter(r => (r as any).status === params.status);
            if (params?.rating) filtered = filtered.filter(r => r.rating === params.rating);
            return { reviews: filtered, total: filtered.length, page: 1, totalPages: 1 };
        }

        // Nếu có serviceId cụ thể thì lấy theo serviceId
        if (params?.serviceId) {
            try {
                const response = await apiClient.comments.getByServiceId(
                    params.serviceId,
                    params.page || 0,
                    params.limit || 10,
                    'createdAt',
                    'desc'
                );
                const content = response.content || (Array.isArray(response) ? response : []);
                return {
                    reviews: content,
                    total: response.totalElements || (Array.isArray(response) ? response.length : 0),
                    page: response.pageNo ?? response.number ?? 0,
                    totalPages: response.totalPages || 1,
                };
            } catch (error) {
                console.error('Error fetching reviews:', error);
                throw error;
            }
        }

        // Nếu không có serviceId => chưa có endpoint phù hợp, dùng mock
        console.warn('[reviewApi] getProviderReviews without serviceId: No backend endpoint, returning mock');
        return { reviews: mockReviews, total: mockReviews.length, page: 1, totalPages: 1 };
    },

    /**
     * Tạo comment/review mới
     * Backend: POST /comment/{serviceID} — multipart/form-data
     */
    createReview: async (
        serviceId: string,
        content: string,
        rating: number,
        photos?: File[]
    ): Promise<Review> => {
        try {
            return await apiClient.comments.create(serviceId, content, rating, photos);
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    /**
     * Xóa review
     * Backend: DELETE /comment/{commentID}
     */
    deleteReview: async (reviewId: string): Promise<void> => {
        try {
            await apiClient.comments.delete(reviewId);
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    },

    /**
     * Like/Unlike/Dislike review
     * Backend: POST /comment/like/{commentID}, /comment/unlike/{commentID}, /comment/dislike/{commentID}
     */
    likeReview: async (reviewId: string): Promise<void> => {
        return apiClient.comments.like(reviewId);
    },

    unlikeReview: async (reviewId: string): Promise<void> => {
        return apiClient.comments.unlike(reviewId);
    },

    dislikeReview: async (reviewId: string): Promise<void> => {
        return apiClient.comments.dislike(reviewId);
    },

    /**
     * Cập nhật trạng thái review (approve/reject)
     * ⚠️ NOTE: BE chưa có endpoint này
     */
    updateReviewStatus: async (reviewId: string, _status: ReviewStatus): Promise<Review> => {
        console.warn('[reviewApi] updateReviewStatus: No backend endpoint available');
        const mock = mockReviews.find(r => r.id === reviewId);
        return mock || mockReviews[0];
    },

    /**
     * Trả lời review
     * ⚠️ NOTE: BE chưa có endpoint này
     */
    replyToReview: async (_reviewId: string, _reply: string): Promise<Review> => {
        console.warn('[reviewApi] replyToReview: No backend endpoint available');
        return mockReviews[0];
    },

    getReviewStats: async (): Promise<ReviewStats> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockStats;
        }
        // ⚠️ NOTE: BE chưa có API stats review
        console.warn('[reviewApi] getReviewStats: No backend endpoint, returning mock data');
        return mockStats;
    },
};
