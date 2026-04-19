/**
 * Global Mock Configuration
 * 
 * Set this to `true` to force all APIs and features to use mock data by mặc định.
 * Set this to `false` để sử dụng dữ liệu thực từ Backend.
 */
export const GLOBAL_MOCK_ENABLED = false; // Đổi thành false để chạy live mode toàn cục, true để chạy test toàn cục

/**
 * Hàm kiểm tra xem một service cụ thể có nên dùng MOCK data hay không.
 * Nó ưu tiên biến cục bộ (nếu có), còn không sẽ lấy theo biến toàn cục.
 * 
 * @param localOverride - Truyền vào `true` hoặc `false` để tự đè biến cục bộ. Truyền `null` để lấy mặc định theo hệ thống.
 * @returns {boolean} - true (Dùng MOCK), false (Dùng REAL API)
 */
export const shouldUseMock = (localOverride: boolean | null = null): boolean => {
    if (localOverride !== null) {
        return localOverride;
    }
    return GLOBAL_MOCK_ENABLED;
};
