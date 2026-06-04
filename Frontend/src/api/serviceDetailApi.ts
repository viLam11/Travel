import apiClient from '../services/apiClient';
import type { ServiceDetail } from '../types/serviceDetail.types';

const realApi = {
  getServiceDetail: async (
    destination: string | undefined,
    serviceType: string | undefined,
    id: string
  ): Promise<ServiceDetail> => {
    try {
      const idStr = id?.toString();
      console.log(`Fetching service detail from: /services/${idStr}`);
      let backendData: any = await apiClient.get(`/services/${idStr}`);
      backendData = backendData?.result || backendData?.data || backendData;

      if (typeof backendData === 'string' && backendData.trim().startsWith('{')) {
        try {
          backendData = JSON.parse(backendData);
        } catch (e) {
          console.error("Failed to parse backendData string", e);
        }
      }

      console.log('Backend Data received:', backendData);

      // Helper to map backend serviceType to frontend type
      const mapServiceType = (bt: string): 'hotel' | 'place' | 'restaurant' | 'event' => {
        const type = bt?.toUpperCase();
        if (type === 'HOTEL') return 'hotel';
        if (type === 'RESTAURANT') return 'restaurant';
        if (type === 'TICKET_VENUE') return 'place';
        return 'place';
      };

      // Helper to format opening hours
      const formatTime = (time: string | undefined) => {
        if (!time) return '';
        // If it's already in HH:mm:ss format, just return HH:mm
        if (time.includes(':')) {
          const parts = time.split(':');
          return `${parts[0]}:${parts[1]}`;
        }
        // If it's a date-time string
        try {
          const date = new Date(time);
          if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
          }
        } catch (e) { }
        return time;
      };

      const openingHours = backendData.startTime && backendData.endTime
        ? `${formatTime(backendData.startTime)} - ${formatTime(backendData.endTime)}`
        : (backendData.openingHours || '08:00 - 22:00');

      const reviewCount = backendData.commentList?.length || backendData.reviewCount || 0;

      const imageObjects: Array<{ id: string; url: string }> =
        backendData.imageList?.length > 0
          ? backendData.imageList.map((img: any) => ({
              id: img.imageID || img.id || '',
              url: img.imageUrl || img.url || '',
            }))
          : (backendData.thumbnailUrl || backendData.thumbnail)
            ? [{ id: '', url: backendData.thumbnailUrl || backendData.thumbnail }]
            : [];

      const images = imageObjects.map((o) => o.url);

      const mappedData: ServiceDetail = {
        id: backendData.id?.toString() || id,
        name: backendData.serviceName || backendData.name || 'Dịch vụ chưa rõ tên',
        type: mapServiceType(backendData.serviceType || serviceType || ''),
        location: backendData.province?.full_name || backendData.province?.fullName || backendData.province?.name || backendData.address || 'Việt Nam',
        rating: (backendData.rating !== undefined && backendData.rating !== null) ? Number(backendData.rating) : 0,
        reviews: Number(reviewCount),
        description: backendData.description || 'Chưa có mô tả cho dịch vụ này.',
        address: backendData.address || '',

        provider: backendData.provider ? {
          userID: backendData.provider.userID || backendData.provider.id,
          fullname: backendData.provider.fullname || backendData.provider.username || backendData.provider.email,
          avatarUrl: backendData.provider.avatarUrl
        } : undefined,
        providerId: backendData.provider?.userID || backendData.provider?.id,

        images: images,
        thumbnails: images.length > 0 ? images.slice(0, 4) : [],
        imageObjects,

        // Collect all potential price points for robust minimum price detection
        priceAdult: (() => {
          const potentialPrices: number[] = [
            backendData.averagePrice,
            backendData.minPrice,
            backendData.price,
            backendData.lowestPrice,
            backendData.priceAdult
          ].filter((p): p is number => typeof p === 'number' && p > 0);

          // Also check nested items if the main fields are missing
          if (backendData.roomList || backendData.roomTypes) {
            const rooms = backendData.roomList || backendData.roomTypes;
            if (Array.isArray(rooms)) {
              rooms.forEach((r: any) => {
                const p = r.price || r.pricePerNight || 0;
                if (p > 0) potentialPrices.push(p);
              });
            }
          }

          if (backendData.ticketList || backendData.ticketTypes) {
            const tickets = backendData.ticketList || backendData.ticketTypes;
            if (Array.isArray(tickets)) {
              tickets.forEach((t: any) => {
                const p = t.price || 0;
                if (p > 0) potentialPrices.push(p);
              });
            }
          }

          return potentialPrices.length > 0 ? Math.min(...potentialPrices) : 0;
        })(),
        priceChild: (() => {
          const base = backendData.averagePrice || backendData.minPrice || backendData.price || 0;
          return backendData.priceChild || Math.floor(base * 0.7);
        })(),
        tags: backendData.tags || '',

        openingHours: openingHours,
        duration: backendData.duration || '1 ngày',
        features: backendData.features || [
          { icon: 'mapPin', title: 'Điểm tham quan', desc: 'Vị trí thuận tiện' },
          { icon: 'clock', title: 'Thời gian lý tưởng', desc: 'Quanh năm' },
          { icon: 'users', title: 'Đối tượng', desc: 'Mọi lứa tuổi' }
        ],
        additionalServices: backendData.additionalServices || [],
        discounts: backendData.discounts || [],
        availability: backendData.availability || {},
      };

      return mappedData;
    } catch (error) {
      console.error('Error in realApi.getServiceDetail:', error);
      throw error;
    }
  },

  checkAvailability: async (
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, string>> => {
    try {
      const response: any = await apiClient.get(`/services/${serviceId}/availability`, {
        params: { start: startDate, end: endDate }
      });
      return response?.result || response?.data || response || {};
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
      const response: any = await apiClient.get('/api/discounts/apply', {
        params: { serviceID, placeCode }
      });
      const data = response?.result || response?.data || response;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching satisfied discounts:', error);
      return [];
    }
  },

  getPriceCalendar: async (
    serviceId: string,
    year: number,
    month: number
  ): Promise<any> => {
    try {
      const response: any = await apiClient.get(`/availability/${serviceId}`, {
        params: { year, month }
      });
      return response?.result || response?.data || response;
    } catch (error) {
      console.error('Error fetching price calendar:', error);
      return null;
    }
  }
};

export const serviceDetailApi = realApi;
