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


    getSatisfiedDiscounts: async (serviceID: string, placeCode: string): Promise<DiscountResponse[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_DISCOUNTS.map(mapMockToResponse).filter(d => 
                d.applyType === 'ALL' || 
                (d.applyType === 'SERVICE' && (d as any).serviceList?.includes(serviceID)) ||
                (d.applyType === 'PROVINCE' && (d as any).provinceList?.includes(placeCode))
            );
        }
        try {
            return await apiClient.get<DiscountResponse[]>('/api/discounts/apply', {
                params: { serviceID, placeCode },
            });
        } catch (error) {
            console.error('Failed to get satisfied discounts', error);
            throw error;
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
            return await apiClient.put<DiscountResponse>(`/api/discounts/${id}`, data);
        } catch (error) {
            console.error('Failed to update discount', error);
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

};
