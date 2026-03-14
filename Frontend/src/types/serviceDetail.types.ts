export interface ServiceDetail {
  id: string;
  name: string;
  type: 'place' | 'restaurant' | 'hotel' | 'event';
  rating: number;
  reviews: number;
  location: string;
  address: string;
  description: string;
  openingHours: string;
  duration: string;
  priceAdult: number;
  priceChild: number;
  additionalServices: AdditionalService[];
  discounts: Discount[];
  images: string[];
  thumbnails: string[];
  features: Feature[];
  availability: Record<string, Record<string, string>>;
  ticketTypes?: TicketType[];
}

export interface TicketType {
  id: string;
  title: string;
  description: string;
  price: number;
  inclusions: string[];
}

export interface AdditionalService {
  name: string;
  price: number;
}

export interface Discount {
  id: string;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  quantity: number;
  minSpend: number;
  fixedPrice?: number;
  percentage?: number;
  maxDiscountAmount?: number;
  applied?: boolean;
  isSystem?: boolean;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}