import apiClient from '../services/apiClient';

export interface PriceConfig {
  date: string; // YYYY-MM-DD
  price: number;
  stock?: number;
  note?: string;
  isOpen: boolean;
}

export interface UpsertPriceRequest {
  itemID: string;
  configs: PriceConfig[];
}

export interface PriceException {
  id: string;
  date: string;
  price: number;
  stock?: number;
  note: string;
  isOpen: boolean;
}

export interface PriceSubCalendarResponse {
  id: string;
  name: string;
  basePrice: number;
  exceptions: PriceException[];
}

export interface PriceCalendarResponse {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  subCalendars: PriceSubCalendarResponse[];
}

const availabilityApi = {
  /**
   * Get pricing calendar for a specific month and year
   */
  getPriceCalendar: async (serviceId: string, year: number, month: number): Promise<PriceCalendarResponse> => {
    const response: any = await apiClient.get(`/availability/${serviceId}`, {
      params: { year, month }
    });
    return response?.result || response?.data || response;
  },

  /**
   * Upsert prices for a specific item (Ticket or Room)
   */
  upsertPrices: async (serviceId: string, itemID: string, configs: PriceConfig[]) => {
    const request: UpsertPriceRequest = {
      itemID,
      configs
    };
    const response: any = await apiClient.post(`/availability/${serviceId}`, request);
    return response?.result || response?.data || response;
  },

  /**
   * Delete specific price exception
   */
  deletePrice: async (id: string) => {
    const response: any = await apiClient.delete(`/availability/${id}`);
    return response?.result || response?.data || response;
  }
};

export default availabilityApi;
