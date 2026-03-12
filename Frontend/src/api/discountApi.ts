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
}

export const discountApi = {
    getAllDiscounts: async (): Promise<DiscountResponse[]> => {
        try {
            return await apiClient.get<DiscountResponse[]>('/api/discounts');
        } catch (error) {
            console.error('Failed to get discounts', error);
            throw error;
        }
    },


    getSatisfiedDiscounts: async (serviceID: string, placeCode: string): Promise<DiscountResponse[]> => {
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
        try {
            return await apiClient.get<DiscountResponse>(`/api/discounts/${id}`);
        } catch (error) {
            console.error('Failed to get discount by id', error);
            throw error;
        }
    },


    createDiscount: async (data: DiscountRequest): Promise<DiscountResponse> => {
        try {
            return await apiClient.post<DiscountResponse>('/api/discounts', data);
        } catch (error) {
            console.error('Failed to create discount', error);
            throw error;
        }
    },


    updateDiscount: async (id: string, data: DiscountRequest): Promise<DiscountResponse> => {
        try {
            return await apiClient.put<DiscountResponse>(`/api/discounts/${id}`, data);
        } catch (error) {
            console.error('Failed to update discount', error);
            throw error;
        }
    },


    deleteDiscount: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/discounts/${id}`);
        } catch (error) {
            console.error('Failed to delete discount', error);
            throw error;
        }
    },

};
