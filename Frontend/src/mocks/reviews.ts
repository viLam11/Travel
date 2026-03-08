// src/mocks/reviews.ts
export interface MockReview {
    id: number;
    serviceId: number;
    serviceName: string;
    serviceType: 'hotel' | 'tour';
    userId: number;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    images?: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    replies?: {
        id: number;
        providerId: number;
        providerName: string;
        comment: string;
        createdAt: string;
    }[];
}

export const MOCK_REVIEWS: MockReview[] = [
    {
        id: 1,
        serviceId: 1,
        serviceName: "Grand Hotel Saigon",
        serviceType: "hotel",
        userId: 101,
        userName: "Nguyen Van A",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
        rating: 5,
        comment: "Excellent hotel! The service was outstanding and the room was very clean. Highly recommend!",
        status: "approved",
        createdAt: "2024-02-01T10:30:00",
        replies: [
            {
                id: 1,
                providerId: 1,
                providerName: "Saigon Hotels Group",
                comment: "Thank you for your wonderful feedback! We're glad you enjoyed your stay.",
                createdAt: "2024-02-01T14:00:00"
            }
        ]
    },
    {
        id: 2,
        serviceId: 6,
        serviceName: "Ha Long Bay Cruise",
        serviceType: "tour",
        userId: 102,
        userName: "Tran Thi B",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
        rating: 4,
        comment: "Great experience! The scenery was breathtaking. Only minor issue was the food could be better.",
        status: "approved",
        createdAt: "2024-02-02T15:20:00"
    },
    {
        id: 3,
        serviceId: 2,
        serviceName: "Hanoi Boutique Hotel",
        serviceType: "hotel",
        userId: 103,
        userName: "Le Van C",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
        rating: 3,
        comment: "The location is good but the room was smaller than expected. WiFi was slow.",
        status: "pending",
        createdAt: "2024-02-06T09:15:00"
    },
    {
        id: 4,
        serviceId: 7,
        serviceName: "Mekong Delta Discovery",
        serviceType: "tour",
        userId: 104,
        userName: "Pham Thi D",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
        rating: 5,
        comment: "Amazing tour! Our guide was very knowledgeable and friendly. The floating market was incredible!",
        status: "pending",
        createdAt: "2024-02-06T16:45:00"
    },
    {
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
    },
    {
        id: 6,
        serviceId: 9,
        serviceName: "Hoi An Cooking Class",
        serviceType: "tour",
        userId: 106,
        userName: "Vo Thi F",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
        rating: 5,
        comment: "Best cooking class ever! Learned so much and the food was delicious. Highly recommend!",
        status: "approved",
        createdAt: "2024-02-03T11:00:00"
    },
    {
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
    },
    {
        id: 8,
        serviceId: 10,
        serviceName: "Cu Chi Tunnels Tour",
        serviceType: "tour",
        userId: 108,
        userName: "Bui Thi H",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=8",
        rating: 4,
        comment: "Very educational and interesting tour. The guide explained the history very well.",
        status: "approved",
        createdAt: "2024-02-05T10:30:00"
    },
    {
        id: 9,
        serviceId: 1,
        serviceName: "Grand Hotel Saigon",
        serviceType: "hotel",
        userId: 109,
        userName: "Tran Van B",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=9",
        rating: 4,
        comment: "Phòng rất đẹp và sạch sẽ. Nhân viên thân thiện. Tuy nhiên giá hơi cao so với mặt bằng chung.",
        images: [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400"
        ],
        status: "approved",
        createdAt: "2024-02-08T14:20:00"
    },
    {
        id: 10,
        serviceId: 1,
        serviceName: "Grand Hotel Saigon",
        serviceType: "hotel",
        userId: 110,
        userName: "Le Thi C",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=10",
        rating: 5,
        comment: "Khách sạn tuyệt vời! Vị trí thuận tiện, gần trung tâm. Bữa sáng buffet rất phong phú và ngon.",
        images: [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400"
        ],
        status: "approved",
        createdAt: "2024-02-09T09:15:00"
    },
    {
        id: 11,
        serviceId: 1,
        serviceName: "Grand Hotel Saigon",
        serviceType: "hotel",
        userId: 111,
        userName: "Pham Van D",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=11",
        rating: 3,
        comment: "Khách sạn ổn nhưng không có gì đặc biệt. Wifi hơi chậm, điều hòa ồn.",
        status: "approved",
        createdAt: "2024-02-10T11:00:00"
    },
    {
        id: 12,
        serviceId: 6,
        serviceName: "Ha Long Bay Cruise",
        serviceType: "tour",
        userId: 112,
        userName: "Nguyen Thi E",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=12",
        rating: 5,
        comment: "Tour tuyệt vời! Cảnh đẹp mê hồn, hướng dẫn viên nhiệt tình. Rất đáng tiền!",
        images: [
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400"
        ],
        status: "approved",
        createdAt: "2024-02-09T16:30:00"
    },
    {
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
    },
];

export const getReviewsByStatus = (status: string): MockReview[] => {
    return MOCK_REVIEWS.filter(review => review.status === status);
};

export const getReviewsByService = (serviceId: number): MockReview[] => {
    return MOCK_REVIEWS.filter(review => review.serviceId === serviceId);
};

export const getPendingReviews = (): MockReview[] => {
    return MOCK_REVIEWS.filter(review => review.status === 'pending');
};
