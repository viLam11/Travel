import type { Service, ServiceStats, ServiceStatus, ServiceType } from '@/types/service.types';
import apiClient from '@/services/apiClient';

const USE_MOCK = false; // Set to false to use real API

// Mock Data
const mockServices: Service[] = [
    {
        id: '1',
        serviceName: 'Khách sạn Majestic Saigon',
        type: 'hotel',
        status: 'active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        images: [
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'
        ],
        province: { id: 'hcm', fullName: 'Hồ Chí Minh' },
        location: 'Hồ Chí Minh',
        address: '1 Đồng Khởi, Quận 1',
        description: 'Khách sạn sang trọng 5 sao tại trung tâm Sài Gòn with river view.',
        price: 2500000,
        averagePrice: 2500000,
        rating: 4.8,
        starRating: 5,
        reviewCount: 245,
        bookingCount: 1250,
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
        checkInTime: '14:00',
        checkOutTime: '12:00',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-20T15:30:00Z',
    },
    {
        id: '2',
        serviceName: 'Dinh Độc Lập Tour',
        type: 'tour',
        status: 'active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
        images: ['https://images.unsplash.com/photo-1599708153386-52e85a6296b9?w=400'],
        province: { id: 'hcm', fullName: 'Hồ Chí Minh' },
        location: 'Hồ Chí Minh',
        address: '135 Nam Kỳ Khởi Nghĩa, Quận 1',
        description: 'Tham quan di tích lịch sử nổi tiếng của Sài Gòn với hướng dẫn viên.',
        price: 40000,
        averagePrice: 40000,
        rating: 4.6,
        reviewCount: 892,
        bookingCount: 3420,
        duration: '3 hours',
        difficulty: 'easy',
        groupSize: 20,
        createdAt: '2024-02-10T09:00:00Z',
        updatedAt: '2024-12-18T11:20:00Z',
    },
    {
        id: '3',
        serviceName: 'Resort Mũi Né Paradise',
        type: 'hotel',
        status: 'inactive',
        thumbnailUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        province: { id: 'binhthuan', fullName: 'Bình Thuận' },
        location: 'Phan Thiet',
        address: 'Nguyễn Đình Chiểu, Mũi Né',
        description: 'Resort view biển tuyệt đẹp tại Mũi Né',
        price: 1800000,
        averagePrice: 1800000,
        rating: 4.5,
        starRating: 4,
        reviewCount: 156,
        bookingCount: 680,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Bar'],
        createdAt: '2024-03-05T14:00:00Z',
        updatedAt: '2024-12-15T16:45:00Z',
    },
    {
        id: '4',
        serviceName: 'Bảo tàng Chứng tích Chiến tranh',
        type: 'place',
        status: 'active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400',
        province: { id: 'hcm', fullName: 'Hồ Chí Minh' },
        address: '28 Võ Văn Tần, Quận 3',
        description: 'Bảo tàng lịch sử chiến tranh Việt Nam',
        averagePrice: 40000,
        rating: 4.7,
        reviewCount: 1024,
        bookingCount: 4560,
        createdAt: '2024-01-20T08:30:00Z',
        updatedAt: '2024-12-22T10:15:00Z',
    },
    {
        id: '5',
        serviceName: 'Khách sạn Rex Saigon',
        type: 'hotel',
        status: 'pending',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        province: { id: 'hcm', fullName: 'Hồ Chí Minh' },
        address: '141 Nguyễn Huệ, Quận 1',
        description: 'Khách sạn lịch sử with vị trí đắc địa',
        averagePrice: 2200000,
        rating: 4.4,
        starRating: 5,
        reviewCount: 89,
        bookingCount: 340,
        createdAt: '2024-12-01T12:00:00Z',
        updatedAt: '2024-12-20T14:30:00Z',
    },
    {
        id: '6',
        serviceName: 'Ha Long Bay Cruise',
        type: 'tour',
        status: 'active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506606401543-2e73709cebb4?w=400',
        province: { id: 'quangninh', fullName: 'Quảng Ninh' },
        address: 'Ha Long Bay',
        description: '2 days 1 night cruise in Ha Long Bay',
        price: 3500000,
        averagePrice: 3500000,
        rating: 4.9,
        reviewCount: 500,
        bookingCount: 2000,
        duration: '2 days',
        difficulty: 'easy',
        groupSize: 30,
        createdAt: '2024-01-05T08:00:00Z',
        updatedAt: '2024-12-25T10:00:00Z'
    }
];

const mockStats: ServiceStats = {
    total: 6,
    active: 4,
    inactive: 1,
    pending: 1,
    totalRevenue: 156000000,
    totalBookings: 12450,
};

export const serviceApi = {
    getProviderServices: async (params?: {
        type?: ServiceType;
        status?: ServiceStatus;
        provinceId?: string;
        search?: string;
        sortBy?: 'name' | 'price' | 'rating' | 'bookings' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }): Promise<{
        services: Service[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        // Use mock data if enabled
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            let filtered = [...mockServices];

            // Apply filters
            if (params?.type) {
                filtered = filtered.filter(s => s.type === params.type);
            }
            if (params?.status) {
                filtered = filtered.filter(s => s.status === params.status);
            }
            if (params?.search) {
                const search = params.search.toLowerCase();
                filtered = filtered.filter(s =>
                    s.serviceName.toLowerCase().includes(search) ||
                    s.description.toLowerCase().includes(search)
                );
            }

            return {
                services: filtered,
                total: filtered.length,
                page: 1,
                totalPages: 1,
            };
        }

        try {
            return await apiClient.get('/api/provider/services', { params });
        } catch (error) {
            console.error('Error fetching provider services:', error);
            // Fallback to mock on error if needed, or rethrow
            if (USE_MOCK) return {
                services: mockServices,
                total: mockServices.length,
                page: 1,
                totalPages: 1,
            };
            throw error;
        }
    },

    // Lấy chi tiết 1 service
    getServiceById: async (serviceId: string): Promise<Service> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const service = mockServices.find(s => s.id === serviceId);
            if (!service) throw new Error('Service not found');
            return service;
        }

        try {
            return await apiClient.get(`/api/provider/services/${serviceId}`);
        } catch (error) {
            console.error('Error fetching service:', error);
            throw error;
        }
    },

    // Cập nhật service
    updateService: async (serviceId: string, data: Partial<Service>): Promise<Service> => {
        try {
            return await apiClient.put(`/api/provider/services/${serviceId}`, data);
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    // Xóa service
    deleteService: async (serviceId: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/provider/services/${serviceId}`);
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    },

    // Toggle service status (active/inactive)
    toggleServiceStatus: async (serviceId: string, status: 'active' | 'inactive'): Promise<Service> => {
        try {
            return await apiClient.patch(`/api/provider/services/${serviceId}/status`, { status });
        } catch (error) {
            console.error('Error toggling service status:', error);
            throw error;
        }
    },

    // Lấy thống kê services
    getServiceStats: async (): Promise<ServiceStats> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockStats;
        }

        try {
            return await apiClient.get('/api/provider/services/stats');
        } catch (error) {
            console.error('Error fetching service stats:', error);
            throw error;
        }
    },
};
