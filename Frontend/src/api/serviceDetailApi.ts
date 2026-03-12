import apiClient from '../services/apiClient';
import type { ServiceDetail } from '../types/serviceDetail.types';
import { mockServiceDetailApi } from '../mock/mockServiceDetailApi';

// Toggle này để switch giữa mock và real API
const USE_MOCK_API = false; // Set to false khi có backend thật

const realApi = {
  getServiceDetail: async (
    destination: string,
    serviceType: string,
    id: string
  ): Promise<ServiceDetail> => {
    try {
      console.log(`📡 Fetching real service detail for ID: ${id}`);
      // Fetch real data using centralized apiClient
      const backendData: any = await apiClient.get(`/services/${id}`);
      
      console.log('✅ Backend data received:', backendData);

      // Get mock data for this service to fill missing fields
      const mockData = await mockServiceDetailApi.getServiceDetail(destination, serviceType, id);

      // Merge: Use backend data where available, fall back to mock for missing fields
      const mergedData: ServiceDetail = {
        id: backendData.id?.toString() || mockData.id,
        name: backendData.serviceName || backendData.name || mockData.name,
        location: backendData.province?.full_name || backendData.province?.fullName || backendData.address || mockData.location,
        rating: backendData.rating?.toString() || mockData.rating,
        reviews: backendData.reviewCount?.toString() || backendData.review_count?.toString() || mockData.reviews,
        description: backendData.description || mockData.description,
        address: backendData.address || mockData.address,

        // Use mock data for fields not in backend
        images: (backendData.imageList?.length > 0
          ? backendData.imageList.map((img: any) => img.imageUrl)
          : backendData.thumbnailUrl
            ? [backendData.thumbnailUrl]
            : mockData.images),
        thumbnails: (backendData.imageList?.length > 0
          ? backendData.imageList.slice(0, 4).map((img: any) => img.imageUrl)
          : backendData.thumbnailUrl
            ? [backendData.thumbnailUrl, backendData.thumbnailUrl, backendData.thumbnailUrl, backendData.thumbnailUrl]
            : mockData.thumbnails),

        priceAdult: backendData.averagePrice || backendData.average_price || mockData.priceAdult,
        priceChild: Math.floor((backendData.averagePrice || backendData.average_price || mockData.priceChild) * 0.7), // 70% of adult price

        // Mock data for features not in backend yet
        type: mockData.type,
        openingHours: mockData.openingHours,
        duration: mockData.duration,
        features: mockData.features,
        additionalServices: mockData.additionalServices,
        discounts: mockData.discounts,
        availability: mockData.availability,
      };

      return mergedData;
    } catch (error) {
      console.error('Error fetching service detail:', error);
      
      // If mock is explicitly allowed, return mock
      if (USE_MOCK_API) {
        return mockServiceDetailApi.getServiceDetail(destination, serviceType, id);
      }
      
      // Otherwise, return mock but it's better to show the error or a better fallback
      // For now, let's keep falling back to mock so the app doesn't crash, 
      // but the log above will tell us WHY it failed.
      return mockServiceDetailApi.getServiceDetail(destination, serviceType, id);
    }
  },

  checkAvailability: async (
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, string>> => {
    try {
      return await apiClient.get(`/services/${serviceId}/availability`, {
        params: { start: startDate, end: endDate }
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },

  getSatisfiedDiscounts: async (
    serviceID: string,
    placeCode: string
  ): Promise<any[]> => {
    try {
      return await apiClient.get('/discounts/apply', {
        params: { serviceID, placeCode }
      });
    } catch (error) {
      console.error('Error fetching satisfied discounts:', error);
      return [];
    }
  }
};

// Export API dựa trên USE_MOCK_API flag
export const serviceDetailApi = USE_MOCK_API ? mockServiceDetailApi : realApi;