export interface DestinationItem {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
}

export interface Destination {
  id: string;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  description: string;
  price: string;
  oldPrice?: string;
  nights: string;
  image: string;
  discount?: string;
}


export interface RegionData {
  name: string;
  region: string;
  heroImage: string;
  description: string;
  highlights: DestinationItem[];
  food: DestinationItem[];
  hotels: DestinationItem[];
}

export interface ApiResponse {
  success: boolean;
  data?: RegionData;
  error?: string;
}

export interface FilterOptions {
  categories: string[];
  priceRange: string;
  duration: string;
  rating: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
}

