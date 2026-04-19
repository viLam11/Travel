import apiClient from '@/services/apiClient';

export const roomApi = {
    /**
     * Lấy danh sách phòng theo hotelId
     */
    getRoomsByHotelId: async (hotelId: string | number) => {
        try {
            return await apiClient.rooms.getByHotelId(hotelId);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },

    /**
     * Tạo phòng mới
     */
    createRoom: async (hotelId: string | number, data: any) => {
        try {
            return await apiClient.rooms.create(hotelId, data);
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    },

    /**
     * Cập nhật phòng
     */
    updateRoom: async (roomId: string | number, data: any) => {
        try {
            return await apiClient.rooms.update(roomId, data);
        } catch (error) {
            console.error('Error updating room:', error);
            throw error;
        }
    },

    /**
     * Xóa phòng
     */
    deleteRoom: async (roomId: string | number) => {
        try {
            return await apiClient.rooms.delete(roomId);
        } catch (error) {
            console.error('Error deleting room:', error);
            throw error;
        }
    },

    /**
     * Thêm ảnh cho phòng
     */
    addRoomImages: async (roomId: string | number, photos: File[]) => {
        try {
            return await apiClient.rooms.addImage(roomId, photos);
        } catch (error) {
            console.error('Error adding room images:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách ảnh của phòng
     */
    getRoomImages: async (roomId: string | number) => {
        try {
            return await apiClient.rooms.getImages(roomId);
        } catch (error) {
            console.error('Error fetching room images:', error);
            throw error;
        }
    },
};
