// src/api/bookingApi.ts
import type { Booking, BookingDetail, BookingStatus } from '@/types/booking.types';

const API_BASE_URL = 'http://localhost:8080';
const USE_MOCK = true; // Set to false to use real API

// Mock Data
const mockBookings: Booking[] = [
    {
        id: 'BK001',
        bookingCode: 'BK001',
        guest: { id: 'u1', name: 'Nguyễn Văn An', email: 'an@example.com', phone: '0901234567' },
        service: { id: 's1', name: 'Khách sạn Majestic Saigon', type: 'hotel' },
        checkIn: '2024-12-25',
        checkOut: '2024-12-28',
        guests: { adults: 2, children: 0 },
        totalAmount: 7500000,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: '2024-12-20T10:00:00Z',
        updatedAt: '2024-12-20T15:30:00Z',
    },
    {
        id: 'BK002',
        bookingCode: 'BK002',
        guest: { id: 'u2', name: 'Trần Thị Bình', email: 'binh@example.com', phone: '0912345678' },
        service: { id: 's2', name: 'Dinh Độc Lập', type: 'place' },
        checkIn: '2024-12-26',
        checkOut: '2024-12-26',
        guests: { adults: 3, children: 1 },
        totalAmount: 160000,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: '2024-12-22T09:15:00Z',
        updatedAt: '2024-12-22T09:15:00Z',
    },
    {
        id: 'BK003',
        bookingCode: 'BK003',
        guest: { id: 'u3', name: 'Lê Minh Châu', email: 'chau@example.com', phone: '0923456789' },
        service: { id: 's1', name: 'Khách sạn Majestic Saigon', type: 'hotel' },
        checkIn: '2024-12-20',
        checkOut: '2024-12-22',
        guests: { adults: 2, children: 0 },
        totalAmount: 5000000,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-12-15T14:20:00Z',
        updatedAt: '2024-12-22T11:00:00Z',
    },
];

const mockBookingDetail: BookingDetail = {
    id: 'BK001',
    bookingCode: 'BK001',
    guest: {
        id: 'u1',
        name: 'Nguyễn Văn An',
        email: 'an@example.com',
        phone: '0901234567',
        avatar: 'https://i.pravatar.cc/150?img=1'
    },
    service: {
        id: 's1',
        name: 'Khách sạn Majestic Saigon',
        type: 'hotel'
    },
    checkIn: '2024-12-25',
    checkOut: '2024-12-28',
    guests: { adults: 2, children: 0 },
    rooms: [
        { id: 'r1', name: 'Deluxe Room', quantity: 1, pricePerNight: 2500000 }
    ],
    totalAmount: 7500000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    specialRequests: 'Phòng tầng cao, view biển',
    statusHistory: [
        { status: 'pending', note: 'Đơn đặt mới', changedBy: 'system', changedAt: '2024-12-20T10:00:00Z' },
        { status: 'confirmed', note: 'Đã xác nhận', changedBy: 'admin', changedAt: '2024-12-20T15:30:00Z' },
    ],
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T15:30:00Z',
};

const mockStats = {
    today: {
        total: 3,
        pending: 1,
        confirmed: 1,
        completed: 1,
        cancelled: 0,
    },
    thisMonth: {
        total: 24,
        revenue: 125000000,
    },
};

export const bookingApi = {
    getProviderBookings: async (params?: {
        status?: BookingStatus;
        serviceId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        bookings: Booking[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            let filtered = [...mockBookings];
            if (params?.status) filtered = filtered.filter(b => b.status === params.status);
            return { bookings: filtered, total: filtered.length, page: 1, totalPages: 1 };
        }

        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
            if (params?.startDate) queryParams.append('startDate', params.startDate);
            if (params?.endDate) queryParams.append('endDate', params.endDate);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const response = await fetch(
                `${API_BASE_URL}/api/provider/bookings?${queryParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching provider bookings:', error);
            throw error;
        }
    },

    getBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockBookingDetail;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/bookings/${bookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching booking detail:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái booking
    updateBookingStatus: async (
        bookingId: string,
        status: BookingStatus,
        note?: string
    ): Promise<Booking> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/bookings/${bookingId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status, note }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    },

    // Hủy booking
    cancelBooking: async (bookingId: string, reason: string): Promise<Booking> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/bookings/${bookingId}/cancel`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ reason }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },

    getBookingStats: async (): Promise<{
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
    }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockStats;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/bookings/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching booking stats:', error);
            throw error;
        }
    },
};
