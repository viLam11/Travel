// src/api/serviceApi.ts
import type { Service, ServiceStats, ServiceStatus, ServiceType } from '@/types/service.types';

const API_BASE_URL = 'http://localhost:8080';
const USE_MOCK = true; // Set to false to use real API

// Mock Data
const mockServices: Service[] = [
    {
        id: '1',
        serviceName: 'Khách sạn Majestic Saigon',
        type: 'hotel',
        status: 'active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        province: { id: 'hcm', fullName: 'Hồ Chí Minh' },
        address: '1 Đồng Khởi, Quận 1',
        description: 'Khách sạn sang trọng 5 sao tại trung tâm Sài Gòn',
        averagePrice: 2500000,
        rating: 4.8,
        reviewCount: 245,
        bookingCount: 1250,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-20T15:30:00Z',
    },
    {
        id: '2',
        serviceName: 'Dinh Độc Lập',
        type: 'place',
        status: 'active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
        province: { id: 'hcm', fullName: 'Hồ Chí Minh' },
        address: '135 Nam Kỳ Khởi Nghĩa, Quận 1',
        description: 'Di tích lịch sử nổi tiếng của Sài Gòn',
        averagePrice: 40000,
        rating: 4.6,
        reviewCount: 892,
        bookingCount: 3420,
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
        address: 'Nguyễn Đình Chiểu, Mũi Né',
        description: 'Resort view biển tuyệt đẹp tại Mũi Né',
        averagePrice: 1800000,
        rating: 4.5,
        reviewCount: 156,
        bookingCount: 680,
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
        description: 'Khách sạn lịch sử với vị trí đắc địa',
        averagePrice: 2200000,
        rating: 4.4,
        reviewCount: 89,
        bookingCount: 340,
        createdAt: '2024-12-01T12:00:00Z',
        updatedAt: '2024-12-20T14:30:00Z',
    },
];

const mockStats: ServiceStats = {
    total: 5,
    active: 3,
    inactive: 1,
    pending: 1,
    totalRevenue: 125000000,
    totalBookings: 10250,
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
            const queryParams = new URLSearchParams();
            if (params?.type) queryParams.append('type', params.type);
            if (params?.status) queryParams.append('status', params.status);
            if (params?.provinceId) queryParams.append('provinceId', params.provinceId);
            if (params?.search) queryParams.append('search', params.search);
            if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const response = await fetch(
                `${API_BASE_URL}/api/provider/services?${queryParams.toString()}`,
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
            console.error('Error fetching provider services:', error);
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
            const response = await fetch(
                `${API_BASE_URL}/api/provider/services/${serviceId}`,
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
            console.error('Error fetching service:', error);
            throw error;
        }
    },

    // Cập nhật service
    updateService: async (serviceId: string, data: Partial<Service>): Promise<Service> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/services/${serviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    // Xóa service
    deleteService: async (serviceId: string): Promise<void> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/services/${serviceId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    },

    // Toggle service status (active/inactive)
    toggleServiceStatus: async (serviceId: string, status: 'active' | 'inactive'): Promise<Service> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/provider/services/${serviceId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
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
            const response = await fetch(
                `${API_BASE_URL}/api/provider/services/stats`,
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
            console.error('Error fetching service stats:', error);
            throw error;
        }
    },
};
