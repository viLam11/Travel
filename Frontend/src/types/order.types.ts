/**
 * Interface cho từng item trong order (vé hoặc phòng)
 */
export interface OrderItem {
  id: number;
  quantity: number;
  price?: number; // Tùy chọn nếu backend cần
}

/**
 * Interface gửi lên backend cho request CreateOrder
 */
export interface CreateOrderRequest {
  tickets: OrderItem[];
  rooms: OrderItem[];
  checkInDate: string;  // ISO Format: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
  checkOutDate: string; // ISO Format: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
  guestPhone: string;
  note?: string;
  discountIds?: number[];
}