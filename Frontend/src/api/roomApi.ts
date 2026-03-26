import apiClient from '../services/apiClient';
import { MOCK_ROOM_TYPES } from '@/mocks/roomTypes';

const USE_MOCK = false; // Set to false to use real backend API

export const roomApi = {
    getRoomsByHotel: async (hotelId: string): Promise<any[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_ROOM_TYPES.filter((r: any) => r.hotelId === hotelId);
        }
        try {
            return await apiClient.get(`/services/${hotelId}/rooms`);
        } catch (error) {
            console.error('Error fetching rooms', error);
            throw error;
        }
    },

    createRoom: async (hotelId: string, data: any): Promise<any> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { id: Date.now().toString(), ...data, hotelId } as any;
        }
        try {
            return await apiClient.post(`/services/${hotelId}/rooms`, data);
        } catch (error) {
            console.error('Error creating room', error);
            throw error;
        }
    },

    updateRoom: async (roomId: string, data: any): Promise<any> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { id: roomId, ...data } as any;
        }
        try {
            return await apiClient.patch(`/rooms/${roomId}`, data);
        } catch (error) {
            console.error('Error updating room', error);
            throw error;
        }
    },

    deleteRoom: async (roomId: string): Promise<void> => {
        if (USE_MOCK) {
             await new Promise(resolve => setTimeout(resolve, 300));
             return;
        }
        try {
            await apiClient.delete(`/rooms/${roomId}`);
        } catch (error) {
            console.error('Error deleting room', error);
            throw error;
        }
    }
};
