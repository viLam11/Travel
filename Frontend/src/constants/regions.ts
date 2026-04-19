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
  // MIỀN BẮC (Regions 1, 2, 3)
  'ha-noi': { id: '01', name: 'Hà Nội', slug: 'ha-noi', region: 'mien-bac', regionName: 'Miền Bắc' },
  '01': { id: '01', name: 'Hà Nội', slug: 'ha-noi', region: 'mien-bac', regionName: 'Miền Bắc' },
  'cao-bang': { id: '04', name: 'Cao Bằng', slug: 'cao-bang', region: 'mien-bac', regionName: 'Miền Bắc' },
  '04': { id: '04', name: 'Cao Bằng', slug: 'cao-bang', region: 'mien-bac', regionName: 'Miền Bắc' },
  'tuyen-quang': { id: '08', name: 'Tuyên Quang', slug: 'tuyen-quang', region: 'mien-bac', regionName: 'Miền Bắc' },
  '08': { id: '08', name: 'Tuyên Quang', slug: 'tuyen-quang', region: 'mien-bac', regionName: 'Miền Bắc' },
  'dien-bien': { id: '11', name: 'Điện Biên', slug: 'dien-bien', region: 'mien-bac', regionName: 'Miền Bắc' },
  '11': { id: '11', name: 'Điện Biên', slug: 'dien-bien', region: 'mien-bac', regionName: 'Miền Bắc' },
  'lai-chau': { id: '12', name: 'Lai Châu', slug: 'lai-chau', region: 'mien-bac', regionName: 'Miền Bắc' },
  '12': { id: '12', name: 'Lai Châu', slug: 'lai-chau', region: 'mien-bac', regionName: 'Miền Bắc' },
  'son-la': { id: '14', name: 'Sơn La', slug: 'son-la', region: 'mien-bac', regionName: 'Miền Bắc' },
  '14': { id: '14', name: 'Sơn La', slug: 'son-la', region: 'mien-bac', regionName: 'Miền Bắc' },
  'lao-cai': { id: '15', name: 'Lào Cai', slug: 'lao-cai', region: 'mien-bac', regionName: 'Miền Bắc' },
  '15': { id: '15', name: 'Lào Cai', slug: 'lao-cai', region: 'mien-bac', regionName: 'Miền Bắc' },
  'thai-nguyen': { id: '19', name: 'Thái Nguyên', slug: 'thai-nguyen', region: 'mien-bac', regionName: 'Miền Bắc' },
  '19': { id: '19', name: 'Thái Nguyên', slug: 'thai-nguyen', region: 'mien-bac', regionName: 'Miền Bắc' },
  'lang-son': { id: '20', name: 'Lạng Sơn', slug: 'lang-son', region: 'mien-bac', regionName: 'Miền Bắc' },
  '20': { id: '20', name: 'Lạng Sơn', slug: 'lang-son', region: 'mien-bac', regionName: 'Miền Bắc' },
  'quang-ninh': { id: '22', name: 'Quảng Ninh', slug: 'quang-ninh', region: 'mien-bac', regionName: 'Miền Bắc' },
  '22': { id: '22', name: 'Quảng Ninh', slug: 'quang-ninh', region: 'mien-bac', regionName: 'Miền Bắc' },
  'bac-ninh': { id: '24', name: 'Bắc Ninh', slug: 'bac-ninh', region: 'mien-bac', regionName: 'Miền Bắc' },
  '24': { id: '24', name: 'Bắc Ninh', slug: 'bac-ninh', region: 'mien-bac', regionName: 'Miền Bắc' },
  'phu-tho': { id: '25', name: 'Phú Thọ', slug: 'phu-tho', region: 'mien-bac', regionName: 'Miền Bắc' },
  '25': { id: '25', name: 'Phú Thọ', slug: 'phu-tho', region: 'mien-bac', regionName: 'Miền Bắc' },
  'hai-phong': { id: '31', name: 'Hải Phòng', slug: 'hai-phong', region: 'mien-bac', regionName: 'Miền Bắc' },
  '31': { id: '31', name: 'Hải Phòng', slug: 'hai-phong', region: 'mien-bac', regionName: 'Miền Bắc' },
  'hung-yen': { id: '33', name: 'Hưng Yên', slug: 'hung-yen', region: 'mien-bac', regionName: 'Miền Bắc' },
  '33': { id: '33', name: 'Hưng Yên', slug: 'hung-yen', region: 'mien-bac', regionName: 'Miền Bắc' },
  'ninh-binh': { id: '37', name: 'Ninh Bình', slug: 'ninh-binh', region: 'mien-bac', regionName: 'Miền Bắc' },
  '37': { id: '37', name: 'Ninh Bình', slug: 'ninh-binh', region: 'mien-bac', regionName: 'Miền Bắc' },

  // MIỀN TRUNG (Regions 4, 5, 6)
  'thanh-hoa': { id: '38', name: 'Thanh Hóa', slug: 'thanh-hoa', region: 'mien-trung', regionName: 'Miền Trung' },
  '38': { id: '38', name: 'Thanh Hóa', slug: 'thanh-hoa', region: 'mien-trung', regionName: 'Miền Trung' },
  'nghe-an': { id: '40', name: 'Nghệ An', slug: 'nghe-an', region: 'mien-trung', regionName: 'Miền Trung' },
  '40': { id: '40', name: 'Nghệ An', slug: 'nghe-an', region: 'mien-trung', regionName: 'Miền Trung' },
  'ha-tinh': { id: '42', name: 'Hà Tĩnh', slug: 'ha-tinh', region: 'mien-trung', regionName: 'Miền Trung' },
  '42': { id: '42', name: 'Hà Tĩnh', slug: 'ha-tinh', region: 'mien-trung', regionName: 'Miền Trung' },
  'quang-tri': { id: '44', name: 'Quảng Trị', slug: 'quang-tri', region: 'mien-trung', regionName: 'Miền Trung' },
  '44': { id: '44', name: 'Quảng Trị', slug: 'quang-tri', region: 'mien-trung', regionName: 'Miền Trung' },
  'hue': { id: '46', name: 'Huế', slug: 'hue', region: 'mien-trung', regionName: 'Miền Trung' },
  '46': { id: '46', name: 'Huế', slug: 'hue', region: 'mien-trung', regionName: 'Miền Trung' },
  'da-nang': { id: '48', name: 'Đà Nẵng', slug: 'da-nang', region: 'mien-trung', regionName: 'Miền Trung' },
  '48': { id: '48', name: 'Đà Nẵng', slug: 'da-nang', region: 'mien-trung', regionName: 'Miền Trung' },
  'quang-ngai': { id: '51', name: 'Quảng Ngãi', slug: 'quang-ngai', region: 'mien-trung', regionName: 'Miền Trung' },
  '51': { id: '51', name: 'Quảng Ngãi', slug: 'quang-ngai', region: 'mien-trung', regionName: 'Miền Trung' },
  'gia-lai': { id: '52', name: 'Gia Lai', slug: 'gia-lai', region: 'mien-trung', regionName: 'Miền Trung' },
  '52': { id: '52', name: 'Gia Lai', slug: 'gia-lai', region: 'mien-trung', regionName: 'Miền Trung' },
  'khanh-hoa': { id: '56', name: 'Khánh Hòa', slug: 'khanh-hoa', region: 'mien-trung', regionName: 'Miền Trung' },
  '56': { id: '56', name: 'Khánh Hòa', slug: 'khanh-hoa', region: 'mien-trung', regionName: 'Miền Trung' },
  'nha-trang': { id: '56', name: 'Nha Trang', slug: 'nha-trang', region: 'mien-trung', regionName: 'Miền Trung' },
  'dak-lak': { id: '66', name: 'Đắk Lắk', slug: 'dak-lak', region: 'mien-trung', regionName: 'Miền Trung' },
  '66': { id: '66', name: 'Đắk Lắk', slug: 'dak-lak', region: 'mien-trung', regionName: 'Miền Trung' },
  'lam-dong': { id: '68', name: 'Lâm Đồng', slug: 'lam-dong', region: 'mien-trung', regionName: 'Miền Trung' },
  '68': { id: '68', name: 'Lâm Đồng', slug: 'lam-dong', region: 'mien-trung', regionName: 'Miền Trung' },
  'da-lat': { id: '68', name: 'Đà Lạt', slug: 'da-lat', region: 'mien-trung', regionName: 'Miền Trung' },

  // MIỀN NAM (Regions 7, 8)
  'dong-nai': { id: '75', name: 'Đồng Nai', slug: 'dong-nai', region: 'mien-nam', regionName: 'Miền Nam' },
  '75': { id: '75', name: 'Đồng Nai', slug: 'dong-nai', region: 'mien-nam', regionName: 'Miền Nam' },
  'ho-chi-minh': { id: '79', name: 'TP. Hồ Chí Minh', slug: 'ho-chi-minh', region: 'mien-nam', regionName: 'Miền Nam' },
  '79': { id: '79', name: 'TP. Hồ Chí Minh', slug: 'ho-chi-minh', region: 'mien-nam', regionName: 'Miền Nam' },
  'tay-ninh': { id: '80', name: 'Tây Ninh', slug: 'tay-ninh', region: 'mien-nam', regionName: 'Miền Nam' },
  '80': { id: '80', name: 'Tây Ninh', slug: 'tay-ninh', region: 'mien-nam', regionName: 'Miền Nam' },
  'dong-thap': { id: '82', name: 'Đồng Tháp', slug: 'dong-thap', region: 'mien-nam', regionName: 'Miền Nam' },
  '82': { id: '82', name: 'Đồng Tháp', slug: 'dong-thap', region: 'mien-nam', regionName: 'Miền Nam' },
  'vinh-long': { id: '86', name: 'Vĩnh Long', slug: 'vinh-long', region: 'mien-nam', regionName: 'Miền Nam' },
  '86': { id: '86', name: 'Vĩnh Long', slug: 'vinh-long', region: 'mien-nam', regionName: 'Miền Nam' },
  'an-giang': { id: '91', name: 'An Giang', slug: 'an-giang', region: 'mien-nam', regionName: 'Miền Nam' },
  '91': { id: '91', name: 'An Giang', slug: 'an-giang', region: 'mien-nam', regionName: 'Miền Nam' },
  'can-tho': { id: '92', name: 'Cần Thơ', slug: 'can-tho', region: 'mien-nam', regionName: 'Miền Nam' },
  '92': { id: '92', name: 'Cần Thơ', slug: 'can-tho', region: 'mien-nam', regionName: 'Miền Nam' },
  'ca-mau': { id: '96', name: 'Cà Mau', slug: 'ca-mau', region: 'mien-nam', regionName: 'Miền Nam' },
  '96': { id: '96', name: 'Cà Mau', slug: 'ca-mau', region: 'mien-nam', regionName: 'Miền Nam' },
  'quang-nam': { id: '51', name: 'Quảng Nam', slug: 'quang-nam', region: 'mien-trung', regionName: 'Miền Trung' },
  'hoi-an': { id: '51', name: 'Hội An', slug: 'hoi-an', region: 'mien-trung', regionName: 'Miền Trung' },
  'kien-giang': { id: '91', name: 'Kiên Giang', slug: 'kien-giang', region: 'mien-nam', regionName: 'Miền Nam' },
  'phu-quoc': { id: '91', name: 'Phú Quốc', slug: 'phu-quoc', region: 'mien-nam', regionName: 'Miền Nam' }
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