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
}

export interface AdditionalService {
  name: string;
  price: number;
}

export interface Discount {
  code: string;
  value: number;
  applied: boolean;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}