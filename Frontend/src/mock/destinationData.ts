import type { RegionData } from '../types/destination.types';

export const MOCK_REGION_DATA: Record<string, RegionData> = {
   'ha-noi': {
    name: 'Hà Nội',
    region: 'Miền Bắc',
    heroImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=600&fit=crop',
    description: 'Thủ đô ngàn năm văn hiến với những di tích lịch sử độc đáo',
    highlights: [
      {
        id: '1',
        title: 'NHÀ THỜ ĐỨC BÀ',
        location: '124 đường ABC, Hà Nội',
        priceRange: '100.000 VND',
        openingHours: '7:00 - 17:00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '2',
        title: 'CHÙA MỘT CỘT',
        location: 'Số 5, đường Chùa Một Cột',
        priceRange: '780 - 1970',
        openingHours: '6:00 - 18:00',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      },
      {
        id: '3',
        title: 'HỒ HOÀN KIẾM',
        location: 'Quận Hoàn Kiếm, Hà Nội',
        priceRange: 'Miễn phí',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ],
    food: [
      {
        id: '4',
        title: 'PHỞ BÒ HÀ NỘI',
        location: 'Phố Cổ, Hà Nội',
        priceRange: '50.000 - 80.000 VND',
        openingHours: '6:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
      },
      {
        id: '5',
        title: 'BÚN CHẢ',
        location: 'Đống Đa, Hà Nội',
        priceRange: '40.000 - 60.000 VND',
        openingHours: '10:00 - 20:00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '6',
        title: 'CÀ PHÊ TRỨNG',
        location: 'Hàng Gai, Hà Nội',
        priceRange: '35.000 - 50.000 VND',
        openingHours: '7:00 - 23:00',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      }
    ],
    hotels: [
      {
        id: '7',
        title: 'KHÁCH SẠN SOFITEL LEGEND',
        location: '15 Phố Ngô Quyền, Hoàn Kiếm',
        priceRange: '3.000.000 - 8.000.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '8',
        title: 'KHÁCH SẠN NIKKO',
        location: '84 Trần Nhân Tông, Hai Bà Trưng',
        priceRange: '2.500.000 - 6.000.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      },
      {
        id: '9',
        title: 'HOMESTAY PHỐ CỔ',
        location: 'Hàng Buồm, Hoàn Kiếm',
        priceRange: '400.000 - 800.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ]
  },
  'da-nang': {
    name: 'Đà Nẵng',
    region: 'Miền Trung',
    heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop',
    description: 'Thành phố đáng sống với bãi biển tuyệt đẹp và cầu Rồng nổi tiếng',
    highlights: [
      {
        id: '1',
        title: 'CẦU RỒNG',
        location: 'Sông Hàn, Đà Nẵng',
        priceRange: 'Miễn phí',
        openingHours: '21:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '2',
        title: 'BÀ NÀ HILLS',
        location: 'Hòa Vang, Đà Nẵng',
        priceRange: '750.000 - 900.000 VND',
        openingHours: '7:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      },
      {
        id: '3',
        title: 'NGŨ HÀNH SƠN',
        location: 'Ngũ Hành Sơn, Đà Nẵng',
        priceRange: '40.000 - 100.000 VND',
        openingHours: '7:00 - 17:30',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ],
    food: [
      {
        id: '4',
        title: 'MÌ QUẢNG',
        location: 'Hải Châu, Đà Nẵng',
        priceRange: '30.000 - 50.000 VND',
        openingHours: '6:00 - 20:00',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
      },
      {
        id: '5',
        title: 'BÁN XÈO BÀ DƯỠNG',
        location: '23 Hoàng Diệu',
        priceRange: '20.000 - 40.000 VND',
        openingHours: '10:00 - 21:00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '6',
        title: 'HẢI SẢN BIỂN MỸ KHÊ',
        location: 'Mỹ Khê, Đà Nẵng',
        priceRange: '200.000 - 500.000 VND',
        openingHours: '10:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      }
    ],
    hotels: [
      {
        id: '7',
        title: 'VINPEARL LUXURY',
        location: 'Ngũ Hành Sơn, Đà Nẵng',
        priceRange: '4.000.000 - 10.000.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '8',
        title: 'NOVOTEL DANANG',
        location: 'Mỹ Khê, Đà Nẵng',
        priceRange: '1.500.000 - 3.500.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      },
      {
        id: '9',
        title: 'HOMESTAY AN THƯỢNG',
        location: 'An Thượng, Sơn Trà',
        priceRange: '300.000 - 700.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ]
  },
  'phu-quoc': {
    name: 'Phú Quốc',
    region: 'Miền Nam',
    heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&h=600&fit=crop',
    description: 'Đảo ngọc với bãi biển thiên đường và hoàng hôn tuyệt đẹp',
    highlights: [
      {
        id: '1',
        title: 'BÃI SAO',
        location: 'An Thới, Phú Quốc',
        priceRange: 'Miễn phí',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      },
      {
        id: '2',
        title: 'VINPEARL SAFARI',
        location: 'Gành Dầu, Phú Quốc',
        priceRange: '500.000 - 650.000 VND',
        openingHours: '9:00 - 16:00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '3',
        title: 'DINH CẬU',
        location: 'Dương Đông, Phú Quốc',
        priceRange: 'Miễn phí',
        openingHours: '6:00 - 18:00',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ],
    food: [
      {
        id: '4',
        title: 'HẢI SẢN TƯƠI SỐNG',
        location: 'Chợ Đêm Phú Quốc',
        priceRange: '300.000 - 800.000 VND',
        openingHours: '17:00 - 23:00',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
      },
      {
        id: '5',
        title: 'GỎI CÁ TRÍCH',
        location: 'Dương Đông',
        priceRange: '50.000 - 100.000 VND',
        openingHours: '10:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '6',
        title: 'BÚN QUẬY',
        location: 'Dương Đông',
        priceRange: '30.000 - 50.000 VND',
        openingHours: '6:00 - 20:00',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      }
    ],
    hotels: [
      {
        id: '7',
        title: 'JW MARRIOTT PHÚ QUỐC',
        location: 'Bãi Ông Lang',
        priceRange: '5.000.000 - 15.000.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      },
      {
        id: '8',
        title: 'SUNSET SANATO RESORT',
        location: 'Bãi Trường',
        priceRange: '2.000.000 - 5.000.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      },
      {
        id: '9',
        title: 'HOMESTAY DƯƠNG ĐÔNG',
        location: 'Dương Đông, Phú Quốc',
        priceRange: '400.000 - 900.000 VND',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ]
  },
  // Thêm các vùng khác
  'ha-long': {
    name: 'Hạ Long',
    region: 'Miền Bắc',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=600&fit=crop',
    description: 'Di sản thiên nhiên thế giới với vịnh biển đẹp như tranh',
    highlights: [
      {
        id: '1',
        title: 'VỊNH HẠ LONG',
        location: 'Vịnh Hạ Long, Quảng Ninh',
        priceRange: '300.000 - 1.500.000 VND',
        openingHours: '6:00 - 18:00',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
      }
    ],
    food: [],
    hotels: []
  },
  'sapa': {
    name: 'Sapa',
    region: 'Miền Bắc',
    heroImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=600&fit=crop',
    description: 'Thị trấn miền núi với ruộng bậc thang tuyệt đẹp',
    highlights: [
      {
        id: '1',
        title: 'ĐỈNH FANSIPAN',
        location: 'Sapa, Lào Cai',
        priceRange: '600.000 VND',
        openingHours: '7:30 - 17:30',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
      }
    ],
    food: [],
    hotels: []
  },
  'hoi-an': {
    name: 'Hội An',
    region: 'Miền Trung',
    heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&h=600&fit=crop',
    description: 'Phố cổ di sản với đèn lồng rực rỡ',
    highlights: [
      {
        id: '1',
        title: 'PHỐ CỔ HỘI AN',
        location: 'Tp. Hội An (Quảng Nam)',
        priceRange: '120.000 VND',
        openingHours: '7:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
      }
    ],
    food: [],
    hotels: []
  },
  'hue': {
    name: 'Huế',
    region: 'Miền Trung',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=600&fit=crop',
    description: 'Cố đô với di sản văn hóa phong phú',
    highlights: [
      {
        id: '1',
        title: 'ĐẠI NỘI HUẾ',
        location: 'Huế, Thừa Thiên Huế',
        priceRange: '200.000 VND',
        openingHours: '6:30 - 17:30',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
      }
    ],
    food: [],
    hotels: []
  },
  'vung-tau': {
    name: 'Vũng Tàu',
    region: 'Miền Nam',
    heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop',
    description: 'Thành phố biển gần Sài Gòn',
    highlights: [
      {
        id: '1',
        title: 'BÃI SAU',
        location: 'Vũng Tàu, Bà Rịa - Vũng Tàu',
        priceRange: 'Miễn phí',
        openingHours: '24/7',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      }
    ],
    food: [],
    hotels: []
  },
  'can-tho': {
    name: 'Cần Thơ',
    region: 'Miền Nam',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=600&fit=crop',
    description: 'Trái tim đồng bằng sông Cửu Long',
    highlights: [
      {
        id: '1',
        title: 'CHỢ NỔI CÁI RĂNG',
        location: 'Cần Thơ',
        priceRange: 'Miễn phí',
        openingHours: '5:00 - 9:00',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
      }
    ],
    food: [],
    hotels: []
  }
};