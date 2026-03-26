import apiClient from '../services/apiClient';
import { MOCK_TICKETS } from '@/mocks/tickets';

const USE_MOCK = false; // Set to false to use real backend API

export const ticketApi = {
    getTicketsByService: async (serviceId: string): Promise<any[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_TICKETS.filter((t: any) => t.tourId === serviceId);
        }
        try {
            return await apiClient.get(`/services/${serviceId}/tickets`);
        } catch (error) {
            console.error('Error fetching tickets', error);
            throw error;
        }
    },

    createTicket: async (serviceId: string, data: any): Promise<any> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { id: Date.now().toString(), ...data, tourId: serviceId } as any;
        }
        try {
            return await apiClient.post(`/services/${serviceId}/tickets`, data);
        } catch (error) {
            console.error('Error creating ticket', error);
            throw error;
        }
    },

    updateTicket: async (ticketId: string, data: any): Promise<any> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { id: ticketId, ...data } as any;
        }
        try {
            return await apiClient.patch(`/tickets/${ticketId}`, data);
        } catch (error) {
            console.error('Error updating ticket', error);
            throw error;
        }
    },

    deleteTicket: async (ticketId: string): Promise<void> => {
        if (USE_MOCK) {
             await new Promise(resolve => setTimeout(resolve, 300));
             return;
        }
        try {
            await apiClient.delete(`/tickets/${ticketId}`);
        } catch (error) {
            console.error('Error deleting ticket', error);
            throw error;
        }
    }
};
