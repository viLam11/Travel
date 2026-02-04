// src/types/review.types.ts

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
    id: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    service: {
        id: string;
        name: string;
        type: 'hotel' | 'place';
    };
    rating: number;
    comment: string;
    images?: string[];
    status: ReviewStatus;
    reply?: string;
    repliedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}
