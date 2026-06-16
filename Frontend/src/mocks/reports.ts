import { type MockReview } from './reviews';

export interface MockReport {
    id: number;
    reporterId: number;
    reporterName: string;
    reporterType: 'user' | 'provider';
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
    reviewId: number;
    review: MockReview;
}

export const MOCK_REPORTS: MockReport[] = [
    {
        id: 1,
        reporterId: 105,
        reporterName: "Hoang Van E",
        reporterType: 'user',
        reason: "Ngôn từ đả kích, xúc phạm người khác",
        status: 'pending',
        createdAt: "2024-03-10T08:30:00",
        reviewId: 5,
        review: {
            id: 5,
            serviceId: 1,
            serviceName: "Grand Hotel Saigon",
            serviceType: "hotel",
            userId: 105,
            userName: "Hoang Van E",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
            rating: 1,
            comment: "Terrible experience! The staff was rude and the room had bugs.",
            status: "pending",
            createdAt: "2024-02-07T08:30:00"
        }
    },
    {
        id: 2,
        reporterId: 1,
        reporterName: "Saigon Hotels Group",
        reporterType: 'provider',
        reason: "Cạnh tranh không lành mạnh, đánh giá ảo",
        status: 'pending',
        createdAt: "2024-03-11T14:20:00",
        reviewId: 7,
        review: {
            id: 7,
            serviceId: 4,
            serviceName: "Hue Imperial Hotel",
            serviceType: "hotel",
            userId: 107,
            userName: "Dang Van G",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=7",
            rating: 2,
            comment: "Very disappointing. The photos online look much better than reality.",
            status: "pending",
            createdAt: "2024-02-04T13:20:00"
        }
    },
    {
        id: 3,
        reporterId: 112,
        reporterName: "Nguyen Thi E",
        reporterType: 'user',
        reason: "Spam quảng cáo tour khác trong phần bình luận",
        status: 'resolved',
        createdAt: "2024-03-09T09:15:00",
        reviewId: 3,
        review: {
            id: 3,
            serviceId: 2,
            serviceName: "Hanoi Boutique Hotel",
            serviceType: "hotel",
            userId: 103,
            userName: "Le Van C",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
            rating: 3,
            comment: "Liên hệ ngay Tour Giá Rẻ 0909xxxxxx để được giảm 50% nhé!",
            status: "pending",
            createdAt: "2024-02-06T09:15:00"
        }
    },
    {
        id: 4,
        reporterId: 109,
        reporterName: "Tran Van B",
        reporterType: 'user',
        reason: "Hình ảnh đính kèm có nội dung không phù hợp",
        status: 'pending',
        createdAt: "2024-03-12T10:45:00",
        reviewId: 9,
        review: {
            id: 9,
            serviceId: 1,
            serviceName: "Grand Hotel Saigon",
            serviceType: "hotel",
            userId: 109,
            userName: "Tran Van B",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=9",
            rating: 4,
            comment: "Phòng rất đẹp và sạch sẽ. Nhân viên thân thiện. Tuy nhiên giá hơi cao.",
            images: [
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400"
            ],
            status: "pending",
            createdAt: "2024-02-08T14:20:00"
        }
    },
    {
        id: 5,
        reporterId: 110,
        reporterName: "Le Thi C",
        reporterType: 'user',
        reason: "Bình luận chứa thông tin sai sự thật",
        status: 'dismissed',
        createdAt: "2024-03-07T09:30:00",
        reviewId: 10,
        review: {
            id: 10,
            serviceId: 1,
            serviceName: "Grand Hotel Saigon",
            serviceType: "hotel",
            userId: 110,
            userName: "Le Thi C",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=10",
            rating: 5,
            comment: "Khách sạn tuyệt vời! Vị trí thuận tiện, gần trung tâm.",
            images: [
                "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400"
            ],
            status: "approved",
            createdAt: "2024-02-09T09:15:00"
        }
    },
    {
        id: 6,
        reporterId: 6,
        reporterName: "Hoi An Cooking Class",
        reporterType: 'provider',
        reason: "Nội dung có lời lẽ xúc phạm hướng dẫn viên",
        status: 'resolved',
        createdAt: "2024-03-06T16:10:00",
        reviewId: 6,
        review: {
            id: 6,
            serviceId: 9,
            serviceName: "Hoi An Cooking Class",
            serviceType: "tour",
            userId: 106,
            userName: "Vo Thi F",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
            rating: 5,
            comment: "Best cooking class ever! Learned so much and the food was delicious.",
            status: "approved",
            createdAt: "2024-02-03T11:00:00"
        }
    },
    {
        id: 7,
        reporterId: 113,
        reporterName: "Le Van F",
        reporterType: 'user',
        reason: "Spam / liên kết quảng cáo trong phần bình luận",
        status: 'pending',
        createdAt: "2024-03-13T12:05:00",
        reviewId: 13,
        review: {
            id: 13,
            serviceId: 6,
            serviceName: "Ha Long Bay Cruise",
            serviceType: "tour",
            userId: 113,
            userName: "Le Van F",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=13",
            rating: 4,
            comment: "Trải nghiệm tốt, thuyền sạch sẽ. Tuy nhiên thời tiết không được đẹp lắm.",
            status: "approved",
            createdAt: "2024-02-10T10:15:00"
        }
    }
];