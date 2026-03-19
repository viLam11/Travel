import type { Booking, BookingDetail, BookingStatus } from '@/types/booking.types';
import apiClient from '@/services/apiClient';

const USE_MOCK = false; // Set to false to use real API

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
    service: { id: 's1', name: 'Khách sạn Majestic Saigon', type: 'hotel' },
    checkIn: '2024-12-25',
    checkOut: '2024-12-28',
    guests: { adults: 2, children: 0 },
    rooms: [{ id: 'r1', name: 'Deluxe Room', quantity: 1, pricePerNight: 2500000 }],
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
    today: { total: 3, pending: 1, confirmed: 1, completed: 1, cancelled: 0 },
    thisMonth: { total: 24, revenue: 125000000 },
};

export const bookingApi = {
    /**
     * Lấy danh sách đơn hàng
     * Backend: GET /orders/all — trả về Page<Order> của user đang đăng nhập
     * ⚠️ NOTE: BE cần thêm GET /orders/provider để provider lọc đơn theo dịch vụ của mình
     */
    getProviderBookings: async (params?: {
        status?: BookingStatus;
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
            const response = await apiClient.orders.getAll(params?.page || 0, params?.limit || 10);
            const content = response.content || response || [];
            return {
                bookings: content,
                total: response.totalElements || content.length,
                page: response.number || 0,
                totalPages: response.totalPages || 1,
            };
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    getBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockBookingDetail;
        }
        // Backend: GET /orders/{id}
        try {
            return await apiClient.orders.getById(bookingId);
        } catch (error) {
            console.error('Error fetching booking detail:', error);
            throw error;
        }
    },

    /**
     * Cập nhật trạng thái đơn hàng
     * Backend: PATCH /orders/{orderID}/status — body là OrderStatus enum string
     * Các giá trị hợp lệ: PENDING, ACCEPTED, CANCELED, COMPLETED
     */
    updateBookingStatus: async (
        bookingId: string,
        status: BookingStatus,
        _note?: string
    ): Promise<any> => {
        try {
            const backendStatus = status.toUpperCase();
            return await apiClient.orders.updateStatus(bookingId, backendStatus);
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    },

    cancelBooking: async (bookingId: string, _reason: string): Promise<any> => {
        try {
            return await apiClient.orders.updateStatus(bookingId, 'CANCELED');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },

    getBookingStats: async (): Promise<typeof mockStats> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockStats;
        }
        // ⚠️ NOTE: BE chưa có API stats cho provider
        console.warn('[bookingApi] getBookingStats: No backend endpoint, returning mock data');
        return mockStats;
    },
};
