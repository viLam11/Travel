// src/services/serviceDetailApi.ts
import type { ServiceDetail } from '../types/serviceDetail.types';
import { mockServiceDetailApi } from '../mock/mockServiceDetailApi';

const API_BASE_URL = 'http://localhost:3000/api';

// ✅ Toggle này để switch giữa mock và real API
const USE_MOCK_API = true; // Set to false khi có backend thật

const realApi = {
  getServiceDetail: async (
    destination: string,
    serviceType: string,
    id: string
  ): Promise<ServiceDetail> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/destinations/${destination}/${serviceType}/${id}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching service detail:', error);
      throw error;
    }
  },

  checkAvailability: async (
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, string>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/services/${serviceId}/availability?start=${startDate}&end=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }
};

// Export API dựa trên USE_MOCK_API flag
export const serviceDetailApi = USE_MOCK_API ? mockServiceDetailApi : realApi;