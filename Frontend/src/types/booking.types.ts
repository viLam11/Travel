// src/types/booking.types.ts

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    bookingCode: string;
    guest: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    service: {
        id: string;
        name: string;
        type: 'hotel' | 'place';
        thumbnailUrl?: string;
    };
    checkIn: string; // ISO date string
    checkOut: string; // ISO date string
    guests: {
        adults: number;
        children: number;
    };
    totalAmount: number;
    status: BookingStatus;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    createdAt: string;
    updatedAt: string;
    note?: string;
}

export interface BookingDetail extends Booking {
    rooms?: {
        id: string;
        name: string;
        quantity: number;
        pricePerNight: number;
    }[];
    tickets?: {
        type: 'adult' | 'child';
        quantity: number;
        price: number;
    }[];
    specialRequests?: string;
    paymentMethod?: string;
    transactionId?: string;
    statusHistory: {
        status: BookingStatus;
        note?: string;
        changedBy: string;
        changedAt: string;
    }[];
}

export interface BookingStats {
    today: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
    thisMonth: {
        total: number;
        revenue: number;
    };
}
