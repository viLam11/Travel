// src/types/service.types.ts

export type ServiceType = 'hotel' | 'place';
export type ServiceStatus = 'active' | 'inactive' | 'pending' | 'rejected';

export interface Service {
    id: string;
    serviceName: string;
    type: ServiceType;
    status: ServiceStatus;
    thumbnailUrl?: string;
    province: {
        id: string;
        fullName: string;
    };
    address: string;
    description: string;
    averagePrice: number;
    rating?: number;
    reviewCount: number;
    bookingCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    totalRevenue: number;
    totalBookings: number;
}
