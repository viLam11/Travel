import type { ApiResponse } from '../types/destination.types';
import { MOCK_REGION_DATA } from '../mock/destinationData';

/**
 * Config: Đặt useApi = true để dùng API thật
 * Đặt useApi = false để dùng mock data
 */
export const API_CONFIG = {
  useApi: false, //  Thay đổi thành true khi có API thật
  baseUrl: 'https://api.example.com', // URL API của bạn
  timeout: 5000
};

/**
 * Fetch destination data
 * @param destination - Tên destination (vd: 'ha-noi', 'da-nang')
 * @returns Promise<ApiResponse>
 */
export const fetchDestinationData = async (
  destination: string
): Promise<ApiResponse> => {
  // MODE 1: Sử dụng mock data (Development)
  if (!API_CONFIG.useApi) {
    return new Promise((resolve) => {
      // Giả lập delay của API call
      setTimeout(() => {
        const data = MOCK_REGION_DATA[destination];
        
        if (data) {
          resolve({
            success: true,
            data
          });
        } else {
          resolve({
            success: false,
            error: `Không tìm thấy dữ liệu cho "${destination}"`
          });
        }
      }, 800); // Giả lập 800ms network delay
    });
  }

  // MODE 2: Sử dụng API thật (Production)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/data?destination=${destination}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    };
  }
};