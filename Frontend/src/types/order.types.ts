/**
 * Interface cho từng item trong order (vé hoặc phòng)
 */
export interface OrderItem {
  id: string | number;
  quantity: number;
  checkInDate?: string;  // ISO Format: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
  checkOutDate?: string; // ISO Format: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
  price?: number; // Tùy chọn nếu backend cần
}

/**
 * Interface gửi lên backend cho request CreateOrder
 */
export interface CreateOrderRequest {
  tickets: OrderItem[];
  rooms: OrderItem[];
  guestPhone: string;
  note?: string;
  discountIds?: string[];
}