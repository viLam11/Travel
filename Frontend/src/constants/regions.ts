// src/constants/regions.ts

/**
 * REGIONS - Các vùng miền của Việt Nam
 */
export const REGIONS = {
  'mien-bac': {
    id: 'mien-bac',
    name: 'Miền Bắc',
    slug: 'mien-bac',
  },
  'mien-trung': {
    id: 'mien-trung',
    name: 'Miền Trung',
    slug: 'mien-trung',
  },
  'mien-nam': {
    id: 'mien-nam',
    name: 'Miền Nam',
    slug: 'mien-nam',
  }
} as const;

/**
 * DESTINATIONS - Mapping destinations to regions
 * Mỗi destination biết nó thuộc region nào
 */
export const DESTINATIONS = {
  // MIỀN BẮC
  'ha-noi': {
    id: 'ha-noi',
    name: 'Hà Nội',
    slug: 'ha-noi',
    region: 'mien-bac',
    regionName: 'Miền Bắc'
  },
  'ha-long': {
    id: 'ha-long',
    name: 'Hạ Long',
    slug: 'ha-long',
    region: 'mien-bac',
    regionName: 'Miền Bắc'
  },
  'sapa': {
    id: 'sapa',
    name: 'Sapa',
    slug: 'sapa',
    region: 'mien-bac',
    regionName: 'Miền Bắc'
  },
  'ninh-binh': {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    slug: 'ninh-binh',
    region: 'mien-bac',
    regionName: 'Miền Bắc'
  },
  'hai-phong': {
    id: 'hai-phong',
    name: 'Hải Phòng',
    slug: 'hai-phong',
    region: 'mien-bac',
    regionName: 'Miền Bắc'
  },
  
  // MIỀN TRUNG
  'da-nang': {
    id: 'da-nang',
    name: 'Đà Nẵng',
    slug: 'da-nang',
    region: 'mien-trung',
    regionName: 'Miền Trung'
  },
  'hoi-an': {
    id: 'hoi-an',
    name: 'Hội An',
    slug: 'hoi-an',
    region: 'mien-trung',
    regionName: 'Miền Trung'
  },
  'hue': {
    id: 'hue',
    name: 'Huế',
    slug: 'hue',
    region: 'mien-trung',
    regionName: 'Miền Trung'
  },
  'nha-trang': {
    id: 'nha-trang',
    name: 'Nha Trang',
    slug: 'nha-trang',
    region: 'mien-trung',
    regionName: 'Miền Trung'
  },
  'quy-nhon': {
    id: 'quy-nhon',
    name: 'Quy Nhơn',
    slug: 'quy-nhon',
    region: 'mien-trung',
    regionName: 'Miền Trung'
  },
  
  // MIỀN NAM
  'ho-chi-minh': {
    id: 'ho-chi-minh',
    name: 'TP. Hồ Chí Minh',
    slug: 'ho-chi-minh',
    region: 'mien-nam',
    regionName: 'Miền Nam'
  },
  'phu-quoc': {
    id: 'phu-quoc',
    name: 'Phú Quốc',
    slug: 'phu-quoc',
    region: 'mien-nam',
    regionName: 'Miền Nam'
  },
  'vung-tau': {
    id: 'vung-tau',
    name: 'Vũng Tàu',
    slug: 'vung-tau',
    region: 'mien-nam',
    regionName: 'Miền Nam'
  },
  'can-tho': {
    id: 'can-tho',
    name: 'Cần Thơ',
    slug: 'can-tho',
    region: 'mien-nam',
    regionName: 'Miền Nam'
  },
  'da-lat': {
    id: 'da-lat',
    name: 'Đà Lạt',
    slug: 'da-lat',
    region: 'mien-nam',
    regionName: 'Miền Nam'
  }
} as const;

/**
 * SERVICE TYPES - Loại dịch vụ
 */
export const SERVICE_TYPES = {
  'place': {
    id: 'place',
    name: 'Địa điểm',
    namePlural: 'Địa điểm tham quan',
    slug: 'place',
    icon: 'MapPin'
  },
  'hotel': {
    id: 'hotel',
    name: 'Khách sạn',
    namePlural: 'Khách sạn',
    slug: 'hotel',
    icon: 'Hotel'
  }
} as const;

/**
 * SORT OPTIONS - Các option sắp xếp
 */
export const SORT_OPTIONS = [
  {
    value: 'popular',
    label: 'Phổ biến nhất',
    description: 'Sắp xếp theo lượt xem và booking'
  },
  {
    value: 'rating-high',
    label: 'Đánh giá cao nhất',
    description: 'Từ 5 sao xuống 1 sao'
  },
  {
    value: 'price-low',
    label: 'Giá thấp nhất',
    description: 'Từ thấp đến cao'
  },
  {
    value: 'price-high',
    label: 'Giá cao nhất',
    description: 'Từ cao đến thấp'
  }
] as const;

/**
 * Type helpers
 */
export type RegionSlug = keyof typeof REGIONS;
export type DestinationSlug = keyof typeof DESTINATIONS;
export type ServiceTypeSlug = keyof typeof SERVICE_TYPES;
export type SortValue = typeof SORT_OPTIONS[number]['value'];

/**
 * Helper functions
 */
export const getRegionByDestination = (destinationSlug: string) => {
  const destination = DESTINATIONS[destinationSlug as DestinationSlug];
  if (!destination) return null;
  return REGIONS[destination.region];
};

export const getDestinationInfo = (destinationSlug: string) => {
  return DESTINATIONS[destinationSlug as DestinationSlug] || null;
};

export const getServiceTypeName = (serviceTypeSlug: string, plural = false) => {
  const serviceType = SERVICE_TYPES[serviceTypeSlug as ServiceTypeSlug];
  if (!serviceType) return serviceTypeSlug;
  return plural ? serviceType.namePlural : serviceType.name;
};