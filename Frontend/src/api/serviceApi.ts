import type { Service, ServiceStats, ServiceStatus, ServiceType } from '@/types/service.types';
import apiClient from '@/services/apiClient';

import { shouldUseMock } from '@/config/mockConfig';

// ─── CẤU HÌNH MOCK DỮ LIỆU CỤC BỘ ──────────────────────────────────────────────
const LOCAL_MOCK_OVERRIDE: boolean | null = false;
const USE_MOCK = shouldUseMock(LOCAL_MOCK_OVERRIDE);
// ──────────────────────────────────────────────────────────────────────────────

// Mock Data (kept for fallback)
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
    /**
     * Lấy danh sách dịch vụ của provider đang đăng nhập
     * Backend: GET /services/data?page=&size= (trả về tất cả services có phân trang)
     * NOTE: BE cần thêm GET /services/my (chỉ lấy services của provider đang đăng nhập)
     */
    getProviderServices: async (params?: {
        type?: ServiceType;
        status?: ServiceStatus;
        provinceId?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }): Promise<{
        services: Service[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            let filtered = [...mockServices];
            if (params?.type) filtered = filtered.filter(s => s.type === params.type);
            if (params?.status) filtered = filtered.filter(s => s.status === params.status);
            if (params?.search) {
                const search = params.search.toLowerCase();
                filtered = filtered.filter(s =>
                    s.serviceName.toLowerCase().includes(search) ||
                    (s.description || '').toLowerCase().includes(search)
                );
            }
            return { services: filtered, total: filtered.length, page: 1, totalPages: 1 };
        }

        try {
            // Backend: GET /services/data?page=&size= — trả về Page<TService>
            const response = await apiClient.get<any>('/services/data', {
                params: {
                    page: params?.page || 0,
                    size: params?.limit || 10
                }
            });
            const content = response.content || (Array.isArray(response) ? response : []);
            return {
                services: content,
                total: response.totalElements || (Array.isArray(response) ? response.length : 0),
                page: response.pageNo ?? response.number ?? 0,
                totalPages: response.totalPages || 1,
            };
        } catch (error) {
            console.error('Error fetching provider services:', error);
            throw error;
        }
    },

    // Lấy chi tiết 1 service — Backend: GET /services/{serviceID}
    getServiceById: async (serviceId: string): Promise<Service> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const service = mockServices.find(s => s.id === serviceId);
            if (!service) throw new Error('Service not found');
            return service;
        }

        try {
            return await apiClient.get(`/services/${serviceId}`);
        } catch (error) {
            console.error('Error fetching service:', error);
            throw error;
        }
    },

    // Xóa service — Backend: DELETE /services/{id}
    deleteService: async (serviceId: string): Promise<void> => {
        try {
            await apiClient.delete(`/services/${serviceId}`);
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    },

    /**
     * Lấy thống kê services
     * NOTE: BE chưa có endpoint này — trả về mock tạm thời
     */
    getServiceStats: async (): Promise<ServiceStats> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockStats;
        }
        console.warn('[serviceApi] getServiceStats: No backend endpoint, returning mock data');
        return mockStats;
    },

    /**
     * Cập nhật service
     * Đã nối BE: PATCH /services/{id}
     */
    updateService: async (serviceId: string, data: Partial<Service>): Promise<Service> => {
        try {
            return await apiClient.services.update(serviceId, data);
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    toggleServiceStatus: async (serviceId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Service> => {
        try {
            return await apiClient.users.handleServiceStatus(serviceId, status);
        } catch (error) {
            console.error('Error toggling service status:', error);
            throw error;
        }
    },
    /**
     * Tạo service mới
     * Backend: POST /services/{hotelID}/rooms (Note: API create service in apiClient is different)
     */
    createService: async (params: any, thumbnail: File, photos: File[]): Promise<any> => {
        try {
            return await apiClient.services.create(params, thumbnail, photos);
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    },

    /**
     * Upload ảnh cho service
     * Backend: PATCH /services/upload/img/{id}
     */
    uploadImages: async (serviceId: number | string, photos: File[]): Promise<any> => {
        try {
            return await apiClient.services.uploadImages(Number(serviceId), photos);
        } catch (error) {
            console.error('Error uploading service images:', error);
            throw error;
        }
    },

    /**
     * Tìm kiếm dịch vụ (public)
     */
    searchServices: async (params: any): Promise<any> => {
        try {
            const res = await apiClient.services.search(params);
            return {
                data: res.services || res.content || [],
                total: res.totalElements || 0,
                page: res.pageNo || 0
            };
        } catch (error) {
            console.error('Error searching services:', error);
            throw error;
        }
    },
};
