// src/types/service.types.ts

export type ServiceType = 'hotel' | 'place' | 'tour';
export type ServiceStatus = 'active' | 'inactive' | 'pending' | 'rejected';

export interface Service {
    id: string;
    serviceName: string;
    type: ServiceType;
    status: ServiceStatus;
    thumbnailUrl?: string; // Main image
    images?: string[]; // Additional images
    province: {
        id: string;
        fullName: string;
    };
    location?: string; // Short location name if diff from province
    address: string;
    description: string;

    // Price
    averagePrice?: number; // For list view or general
    price?: number; // Base price for service
    minPrice?: number; // For hotel

    // Ratings
    rating?: number;
    starRating?: number; // For hotels (1-5)
    reviewCount: number;
    bookingCount: number;

    // Hotel specific
    checkInTime?: string;
    checkOutTime?: string;
    amenities?: string[];

    // Tour specific
    duration?: string;
    difficulty?: 'easy' | 'moderate' | 'challenging';
    groupSize?: number;
    includedItems?: string[];

    createdAt: string;
    updatedAt: string;
    provider?: {
        userID: string;
        fullname?: string;
        avatarUrl?: string;
    };
    providerId?: string; // Optional direct field if BE decides to expose it this way
}

export interface ServiceStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    totalRevenue: number;
    totalBookings: number;
}
