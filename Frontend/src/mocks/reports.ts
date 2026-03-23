// src/mocks/reports.ts
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
            comment: "Terrible experience! The staff was rude and the room had bugs. Not worth the price at all!",
            status: "pending",
            createdAt: "2024-02-07T08:30:00"
        }
    },
    {
        id: 2,
        reporterId: 1,
        reporterName: "Saigon Hotels Group",
        reporterType: 'provider',
        reason: "Cạnh tranh không lành mạnh, đánh giá ảo dìm sao khách sạn",
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
            comment: "Very disappointing. The photos online look much better than reality. Overpriced.",
            status: "rejected",
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
            comment: "Liên hệ ngay Tour Giá Rẻ 0909xxxxxx để được giảm 50% nhé mọi người ơi!!!",
            status: "pending",
            createdAt: "2024-02-06T09:15:00"
        }
    }
];
