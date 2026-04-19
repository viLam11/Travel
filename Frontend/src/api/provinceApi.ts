import apiClient from '@/services/apiClient';

export const provinceApi = {
    /**
     * Lấy tất cả tỉnh thành
     * Backend: GET /provinces/all
     */
    getAllProvinces: async () => {
        try {
            return await apiClient.provinces.getAll();
        } catch (error) {
            console.error('Error fetching provinces:', error);
            // Return empty array as fallback to prevent crash
            return [];
        }
    },

    /**
     * Tìm kiếm tỉnh thành
     * Backend: GET /provinces/search?query=
     */
    searchProvinces: async (query: string) => {
        try {
            return await apiClient.provinces.search(query);
        } catch (error) {
            console.error('Error searching provinces:', error);
            return [];
        }
    },
};
