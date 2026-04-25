// src/types/service.types.ts

export type ServiceType = 'hotel' | 'place' | 'tour';
export type ServiceStatus = 'active' | 'inactive' | 'pending' | 'rejected';

export interface Service {
    id: string;
    serviceName: string;
    type?: ServiceType; // Legacy or UI-side
    serviceType?: string; // Backend-side (HOTEL, TICKET_VENUE, etc.)
    status: ServiceStatus;
    thumbnailUrl?: string; // Main image
    images?: string[]; // Additional images (Legacy)
    imageList?: any[]; // Additional images (Backend)
    province: {
        id: string;
        code?: string;
        fullName: string;
    };
    provinceCode?: string; // Added for flat update requests
    location?: string; // Short location name if diff from province
    address: string;
    contactNumber?: string;
    description: string;
    tags?: string;

    // Price
    averagePrice?: number; // Backend preferred
    price?: number; // UI/Legacy fallback
    minPrice?: number; 

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
    providerId?: string; 
}

export interface ServiceStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    totalRevenue: number;
    totalBookings: number;
}


export enum SERVICETYPE {
  HOTEL = "HOTEL",
  TICKET_VENUE = "TICKET_VENUE"
}
export interface Service2 {
  id: string;
  serviceName: string;
  description: string;
  province: string | null; // Cho phép null như trong ví dụ
  address: string;
  contactNumber: string;
  rating: number | null;    // Thường rating sẽ là number hoặc null
  tags: string;
  thumbnailUrl: string;
  averagePrice: number;
  serviceType: SERVICETYPE;
  minPrice: number;
  imageList: string[];      // Mảng các chuỗi URL hình ảnh
}