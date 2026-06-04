import apiClient from '../services/apiClient';


export interface DiscountRequest {
    name: string;
    code: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    quantity: number;
    minSpend: number;
    applyType: 'ALL' | 'CATEGORY' | 'SERVICE' | 'PROVINCE';
    serviceList?: string[];
    categoryType?: 'ALL' | 'HOTEL' | 'RESTAURANT' | 'TICKET_VENUE';
    provinceList?: string[];
    discountType: 'Fixed' | 'Percentage';
    fixedPrice?: number;
    percentage?: number;
    maxDiscountAmount?: number;
}

export interface DiscountResponse {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    quantity: number;
    minSpend: number;
    discountType: 'Fixed' | 'Percentage';
    fixedPrice: number;
    percentage: number;
    maxDiscountAmount: number;
    applyType: 'ALL' | 'CATEGORY' | 'SERVICE' | 'PROVINCE';
    serviceList?: string[];   // danh sách serviceId nếu applyType = 'SERVICE'
    provinceList?: string[];  // danh sách tỉnh nếu applyType = 'PROVINCE'
    isSystem?: boolean;
}

import { MOCK_DISCOUNTS } from '@/mocks/discounts';

import { shouldUseMock } from '@/config/mockConfig';

// ─── CẤU HÌNH MOCK DỮ LIỆU CỤC BỘ ──────────────────────────────────────────────
const LOCAL_MOCK_OVERRIDE: boolean | null = false;
const USE_MOCK = shouldUseMock(LOCAL_MOCK_OVERRIDE);
// ──────────────────────────────────────────────────────────────────────────────

const mapMockToResponse = (mock: any): DiscountResponse => ({
    ...mock,
    discountType: mock.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
    quantity: mock.quantity || 100,
    applyType: mock.applyType || 'ALL',
    percentage: mock.percentage || 0,
    fixedPrice: mock.fixedPrice || 0,
    maxDiscountAmount: mock.maxDiscountAmount || 0,
    serviceList: mock.serviceList || [],
    provinceList: mock.provinceList || []
});

export const discountApi = {
    getAllDiscounts: async (): Promise<DiscountResponse[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_DISCOUNTS.map(mapMockToResponse);
        }
        try {
            return await apiClient.get<DiscountResponse[]>('/api/discounts');
        } catch (error) {
            console.error('Failed to get discounts', error);
            throw error;
        }
    },

    // Lấy ưu đãi dành cho 1 dịch vụ cụ thể (ALL + SERVICE match)
    getDiscountsByService: async (serviceId: string): Promise<DiscountResponse[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_DISCOUNTS.map(mapMockToResponse).filter(d =>
                d.applyType === 'ALL' ||
                (d.applyType === 'SERVICE' && d.serviceList?.includes(serviceId))
            );
        }
        try {
            const raw = await apiClient.get<any>('/api/discounts/my-discounts', {
                params: { serviceID: serviceId }
            });
            console.log('[DiscountAPI] Raw response from /api/discounts/my-discounts:', raw);

            // Normalize: server có thể trả array thẳng hoặc wrapped trong {data, content, items}
            if (Array.isArray(raw)) return raw as DiscountResponse[];
            if (raw && Array.isArray(raw.result)) return raw.result as DiscountResponse[];
            if (raw && Array.isArray(raw.data)) return raw.data as DiscountResponse[];
            if (raw && Array.isArray(raw.content)) return raw.content as DiscountResponse[];
            if (raw && Array.isArray(raw.items)) return raw.items as DiscountResponse[];

            console.warn('[DiscountAPI] Unexpected response shape:', raw);
            return [];
        } catch (error) {
            console.error('Failed to get discounts by service', error);
            throw error;
        }
    },


    getSatisfiedDiscounts: async (serviceID: string, placeCode: string, categoryType: string = 'ALL'): Promise<DiscountResponse[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_DISCOUNTS.map(mapMockToResponse).filter(d =>
                d.applyType === 'ALL' ||
                (d.applyType === 'SERVICE' && (d as any).serviceList?.includes(serviceID)) ||
                (d.applyType === 'PROVINCE' && (d as any).provinceList?.includes(placeCode))
            );
        }
        try {
            const raw = await apiClient.get<any>('/api/discounts/apply', {
                params: { serviceID, placeCode, categoryType },
            });
            console.log('[DiscountAPI] /apply raw response:', raw);

            // Normalize: Spring Boot có thể trả {result:[...]}, {data:[...]}, hoặc array thẳng
            if (Array.isArray(raw)) return raw as DiscountResponse[];
            if (raw && Array.isArray(raw.result)) return raw.result as DiscountResponse[];
            if (raw && Array.isArray(raw.data)) return raw.data as DiscountResponse[];
            if (raw && Array.isArray(raw.content)) return raw.content as DiscountResponse[];
            if (raw && Array.isArray(raw.items)) return raw.items as DiscountResponse[];
            console.warn('[DiscountAPI] /apply unexpected shape:', raw);
            return [];
        } catch (error: any) {
            // BE đang có lỗi SQL với endpoint này → trả về [] để UI hiện empty state
            console.warn('[DiscountAPI] /apply lỗi (có thể do BE), trả về []:', error?.message || error);
            return [];
        }
    },


    getDiscountById: async (id: string): Promise<DiscountResponse> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const discount = MOCK_DISCOUNTS.find(d => d.id === id);
            if (!discount) throw new Error('Discount not found');
            return mapMockToResponse(discount);
        }
        try {
            return await apiClient.get<DiscountResponse>(`/api/discounts/${id}`);
        } catch (error) {
            console.error('Failed to get discount by id', error);
            throw error;
        }
    },


    createDiscount: async (data: DiscountRequest): Promise<DiscountResponse> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                id: `mock-discount-${Date.now()}`,
                ...data,
                quantity: data.quantity || 100,
                isSystem: false,
            } as DiscountResponse;
        }
        try {
            return await apiClient.post<DiscountResponse>('/api/discounts', data);
        } catch (error) {
            console.error('Failed to create discount', error);
            throw error;
        }
    },


    updateDiscount: async (id: string, data: DiscountRequest): Promise<DiscountResponse> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { id, ...data } as unknown as DiscountResponse;
        }
        try {
            return await apiClient.patch<DiscountResponse>(`/api/discounts/${id}`, data);
        } catch (error) {
            console.error('Failed to update discount', error);
            throw error;
        }
    },

    updateDiscountWithPermission: async (id: string, data: DiscountRequest): Promise<DiscountResponse> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { id, ...data } as unknown as DiscountResponse;
        }
        try {
            return await apiClient.put<DiscountResponse>(`/api/discounts/${id}/with-permission`, data);
        } catch (error) {
            console.error('Failed to update discount with permission', error);
            throw error;
        }
    },

    deleteDiscount: async (id: string): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        }
        try {
            await apiClient.delete(`/api/discounts/${id}`);
        } catch (error) {
            console.error('Failed to delete discount', error);
            throw error;
        }
    },

    deleteDiscountWithPermission: async (id: string): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        }
        try {
            await apiClient.delete(`/api/discounts/${id}/with-permission`);
        } catch (error) {
            console.error('Failed to delete discount with permission', error);
            throw error;
        }
    },

};
