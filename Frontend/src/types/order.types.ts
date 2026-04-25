import type { User } from "./models.types";



/**
 * Interface cho từng item trong order (vé hoặc phòng)
 */
export interface OrderItem {
  id: string;
  quantity: number;
  checkInDate?: string;  // ISO Format
  checkOutDate?: string; // ISO Format
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'SUCCESS' | 'FAILED';
export type PaymentMethod = 'MOMO' | 'VNPAY';

/**
 * Interface gửi lên backend cho request CreateOrder
 */
export interface CreateOrderRequest {
  tickets: OrderItem[];
  rooms: OrderItem[];
  guestPhone: string;
  note?: string;
  discountIds?: string[];
  paymentMethod: PaymentMethod;
}

/**
 * Interface nhận về từ backend cho Order
 */
export interface OrderResponse {
    orderID: string;
    createdAt: string;
    status: OrderStatus;
    totalPrice: number;
    discountPrice: number;
    finalPrice: number;
    deposit: number;
    guestPhone: string;
    note: string;
    discountList: any[]; // Link to DiscountResponse if needed
    orderedTickets: any[]; // Link to OrderedTicket if needed
    orderedRooms: any[]; // Link to OrderedRoom if needed
    user: User;
}