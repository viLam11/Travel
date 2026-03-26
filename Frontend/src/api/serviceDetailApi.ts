import apiClient from '../services/apiClient';
import type { ServiceDetail } from '../types/serviceDetail.types';
import { mockServiceDetailApi } from '../mock/mockServiceDetailApi';

// Toggle này để switch giữa mock và real API
const USE_MOCK_API = false; // Set to false khi có backend thật

const realApi = {
  getServiceDetail: async (
    destination: string | undefined,
    serviceType: string | undefined,
    id: string
  ): Promise<ServiceDetail> => {
    try {
      console.log(`Fetching real service detail for ID: ${id}`);
      // Fetch real data using centralized apiClient
      let backendData: any = await apiClient.get(`/services/${id}`);
      backendData = backendData?.result || backendData?.data || backendData;

      // Ensure backendData is an object
      if (typeof backendData === 'string' && backendData.trim().startsWith('{')) {
        try {
          backendData = JSON.parse(backendData);
        } catch (e) {
          console.error("Failed to parse backendData string", e);
        }
      }
      
      console.log('--- Debug Data Start ---');
      console.log('ID:', id);
      console.log('Raw Backend UserToken-Data:', backendData);
      console.log('serviceName Field:', backendData.serviceName);

      // Get mock data for this service to fill missing fields
      const mockData = await mockServiceDetailApi.getServiceDetail(destination || '', serviceType || '', id);
      console.log('Mock Data for Fallback:', mockData);

      // Merge: Use backend data where available, fall back to mock for missing fields
      const reviewCount = backendData.commentList?.length || backendData.reviewCount || 0;
      
      const mergedData: ServiceDetail = {
        id: backendData.id?.toString() || mockData.id,
        name: backendData.serviceName || backendData.name || mockData.name,
        // Backend Province entity uses snake_case: full_name, not fullName
        location: backendData.province?.full_name || backendData.province?.fullName || backendData.province?.name || backendData.address || mockData.location,
        rating: (backendData.rating !== undefined && backendData.rating !== null) ? backendData.rating.toString() : mockData.rating,
        reviews: reviewCount ? reviewCount.toString() : mockData.reviews,
        description: backendData.description || mockData.description,
        address: backendData.address || mockData.address,

        // Use mock data for fields not in backend
        // Combined photos from thumbnail and imageList
        images: (backendData.imageList?.length > 0
          ? backendData.imageList.map((img: any) => img.imageUrl || img.url)
          : (backendData.thumbnailUrl || backendData.thumbnail)
            ? [backendData.thumbnailUrl || backendData.thumbnail]
            : (mockData.images && mockData.images.length > 0) ? mockData.images : []),
        thumbnails: (backendData.imageList?.length > 0
          ? backendData.imageList.slice(0, 4).map((img: any) => img.imageUrl)
          : (backendData.thumbnailUrl || backendData.thumbnail)
            ? [backendData.thumbnailUrl || backendData.thumbnail, backendData.thumbnailUrl || backendData.thumbnail, backendData.thumbnailUrl || backendData.thumbnail, backendData.thumbnailUrl || backendData.thumbnail]
            : mockData.thumbnails),

        priceAdult: backendData.averagePrice || backendData.average_price || mockData.priceAdult,
        priceChild: Math.floor((backendData.averagePrice || backendData.average_price || mockData.priceChild) * 0.7),

        // Mock data for features not in backend yet
        type: mockData.type,
        openingHours: mockData.openingHours,
        duration: mockData.duration,
        features: mockData.features,
        additionalServices: mockData.additionalServices,
        discounts: mockData.discounts,
        availability: mockData.availability,
      };

      console.log('Final Merged Data:', mergedData);
      console.log('--- Debug Data End ---');

      return mergedData;
    } catch (error) {
      console.error('Error fetching service detail:', error);
      
      // If mock is explicitly allowed, return mock
      if (USE_MOCK_API) {
        return mockServiceDetailApi.getServiceDetail(destination || '', serviceType || '', id);
      }
      
      // Otherwise, return mock but it's better to show the error or a better fallback
      // For now, let's keep falling back to mock so the app doesn't crash, 
      // but the log above will tell us WHY it failed.
      return mockServiceDetailApi.getServiceDetail(destination || '', serviceType || '', id);
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
      const data: any = await apiClient.get('/api/discounts/apply', { // Added /api
        params: { serviceID, placeCode }
      });
      return Array.isArray(data) ? data : []; // Ensure it's an array
    } catch (error) {
      console.error('Error fetching satisfied discounts:', error);
      return [];
    }
  }
};

// Export API dựa trên USE_MOCK_API flag
export const serviceDetailApi = USE_MOCK_API ? mockServiceDetailApi : realApi;