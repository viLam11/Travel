// src/services/serviceDetailApi.ts
import type { ServiceDetail } from '../types/serviceDetail.types';
import { mockServiceDetailApi } from '../mock/mockServiceDetailApi';

// const API_BASE_URL = 'http://localhost:3000/api' ;
const API_BASE_URL = 'http://localhost:8080';

// Toggle này để switch giữa mock và real API
const USE_MOCK_API = false; // Set to false khi có backend thật

const realApi = {
  getServiceDetail: async (
    destination: string,
    serviceType: string,
    id: string
  ): Promise<ServiceDetail> => {
    try {
      // Fetch real data from backend
      const response = await fetch(`${API_BASE_URL}/services/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const backendData = await response.json();

      // Get mock data for this service to fill missing fields
      const mockData = await mockServiceDetailApi.getServiceDetail(destination, serviceType, id);

      // Merge: Use backend data where available, fall back to mock for missing fields
      const mergedData: ServiceDetail = {
        id: backendData.id || mockData.id,
        name: backendData.serviceName || mockData.name,
        location: backendData.province?.fullName || backendData.address || mockData.location,
        rating: backendData.rating?.toString() || mockData.rating,
        reviews: backendData.reviewCount?.toString() || mockData.reviews,
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

        priceAdult: backendData.averagePrice || mockData.priceAdult,
        priceChild: Math.floor((backendData.averagePrice || mockData.priceChild) * 0.7), // 70% of adult price

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
      // If backend fails, fall back to mock completely
      return mockServiceDetailApi.getServiceDetail(destination, serviceType, id);
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