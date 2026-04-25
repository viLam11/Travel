// src/types/review.types.ts

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * Interface cho Comment/Review từ Backend (CommentResponseDTO)
 */
export interface Review {
    id: string;
    content: string;
    rating: number;
    likes: number;
    dislikes: number;
    createdAt: string;
    userID: string;
    username: string;
    serviceID: string;
    serviceName?: string;
    imageList: string[];
    parentID?: string;
    replies?: any[]; 
}

export interface CreateCommentDTO {
    content: string;
    rating: number;
    photos?: File[];
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
