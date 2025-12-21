// src/services/mockServiceDetailApi.ts
import type { ServiceDetail } from '../types/serviceDetail.types';

const mockData: Record<string, ServiceDetail> = {
  // Data cho Hà Nội
  '1': {
    id: '1',
    name: 'VinWonders Phú Quốc',
    type: 'place',
    rating: 4.8,
    reviews: 269,
    location: 'Phú Quốc, Kiên Giang',
    address: 'VinWonders Phú Quốc, Gành Dầu, Phú Quốc, Kiên Giang',
    description: 'VinWonders Phú Quốc sở hữu 6 phân khu, tượng trưng cho 6 vùng lãnh địa với 12 chủ đề đặc sắc lấy cảm hứng từ các nền văn minh nổi tiếng của nhân loại và các câu chuyện cổ tích, giai thoại thế giới, kiến tạo nên trải nghiệm diệu kỳ, mới lạ đầy cuốn hút với hơn 100 trò chơi khủng. Tất cả mang đến nhiều trải nghiệm ấn tượng, hiếm có tại Việt Nam mà vẫn đậm tính giải trí, giáo dục và nghệ thuật cao, phù hợp với mọi lứa tuổi, mọi quốc tịch.',
    openingHours: '05-09-2025',
    duration: '1 ngày',
    priceAdult: 200000,
    priceChild: 80000,
    additionalServices: [
      { name: 'Bảo hiểm du lịch', price: 40000 }
    ],
    discounts: [
      { code: 'HCM_5090FF', value: 90000, applied: true }
    ],
    images: [
      '/WinWonder0.jpg', '/VinWonder 3.jpg', '/VinWonder 4.jpg', '/VinWonder 5.jpg', '/VinWonder 6.jpg', '/VinWonder2.jpg','/VinWonder.jpg',
    ],
    thumbnails: [
      '/WinWonder0.jpg','/VinWonder 3.jpg', '/VinWonder 4.jpg', '/VinWonder 5.jpg', '/VinWonder 6.jpg', '/VinWonder2.jpg','/VinWonder.jpg',
    ],
    features: [
      { icon: 'mapPin', title: 'Điểm tham quan và lân cận', desc: 'Nhà thờ, Cafe, Đường sách' },
      { icon: 'utensils', title: 'Ẩm thực', desc: 'Không' },
      { icon: 'users', title: 'Đối tượng thích hợp', desc: 'Gia đình, Cặp đôi, thanh thiếu niên' },
      { icon: 'clock', title: 'Thời điểm lý tưởng', desc: 'Quanh năm' },
      { icon: 'car', title: 'Phương tiện khi dùng', desc: 'Xe máy, Bus, Xe du lịch' },
      { icon: 'percent', title: 'Khuyến mãi', desc: 'Học sinh - Sinh viên: giảm 20%' }
    ],
    availability: {
      '2025-09': {
        '2': '100 K', '3': '100 K', '4': '100 K', '5': '100 K', '6': '100 K', '7': '100 K',
        '8': '100 K', '9': '100 K', '10': '100 K', '13': '100 K', '14': '100 K',
        '15': '100 K', '16': '100 K', '17': '100 K', '18': '100 K', '19': '100 K', '20': '100 K',
        '21': '100 K', '22': '100 K', '23': '100 K', '24': '100 K', '25': '100 K', '26': '100 K',
        '27': '100 K', '28': '100 K', '29': '100 K', '30': '100 K'
      },
      '2025-10': {
        '1': '100 K', '2': '100 K', '3': '100 K', '4': '100 K', '5': '100 K'
      },
      '2025-11': {}
    }
  },
  '2': {
    id: '2',
    name: 'Chùa Một Cột',
    type: 'place',
    rating: 4.7,
    reviews: 189,
    location: 'Ba Đình, Hà Nội',
    address: 'Số 5, đường Chùa Một Cột, Ba Đình',
    description: 'Chùa Một Cột là một ngôi chùa lịch sử nằm ở phía tây Thành phố Hà Nội, Việt Nam. Đây là một trong những công trình kiến trúc đặc sắc nhất của Việt Nam.',
    openingHours: '08-09-2025',
    duration: '2 giờ',
    priceAdult: 50000,
    priceChild: 25000,
    additionalServices: [
      { name: 'Hướng dẫn viên', price: 100000 }
    ],
    discounts: [],
    images: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop'
    ],
    thumbnails: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=150&h=150&fit=crop'
    ],
    features: [
      { icon: 'mapPin', title: 'Điểm tham quan', desc: 'Chùa Một Cột, Hồ Tây' },
      { icon: 'utensils', title: 'Ẩm thực', desc: 'Quán ăn lân cận' },
      { icon: 'users', title: 'Đối tượng', desc: 'Gia đình, Du khách' },
      { icon: 'clock', title: 'Thời điểm', desc: 'Mùa xuân, thu' },
      { icon: 'car', title: 'Phương tiện', desc: 'Xe máy, Taxi' },
      { icon: 'percent', title: 'Khuyến mãi', desc: 'Miễn phí cho trẻ dưới 6 tuổi' }
    ],
    availability: {
      '2025-09': {
        '2': '50 K', '3': '50 K', '4': '50 K', '5': '50 K', '6': '50 K',
        '9': '50 K', '10': '50 K', '11': '50 K', '12': '50 K', '13': '50 K'
      },
      '2025-10': {},
      '2025-11': {}
    }
  },
  '3': {
    id: '3',
    name: 'Hồ Hoàn Kiếm',
    type: 'place',
    rating: 4.9,
    reviews: 512,
    location: 'Hoàn Kiếm, Hà Nội',
    address: 'Quận Hoàn Kiếm, Hà Nội',
    description: 'Hồ Hoàn Kiếm là hồ nước ngọt tự nhiên nằm ở trung tâm thành phố Hà Nội, là một trong những danh lam thắng cảnh của thủ đô Việt Nam.',
    openingHours: '07-09-2025',
    duration: '3 giờ',
    priceAdult: 0,
    priceChild: 0,
    additionalServices: [
      { name: 'Thuê thuyền kayak', price: 150000 }
    ],
    discounts: [],
    images: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop'
    ],
    thumbnails: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=150&h=150&fit=crop'
    ],
    features: [
      { icon: 'mapPin', title: 'Địa điểm', desc: 'Hồ Hoàn Kiếm, Phố cổ' },
      { icon: 'utensils', title: 'Ẩm thực', desc: 'Nhiều quán cafe xung quanh' },
      { icon: 'users', title: 'Đối tượng', desc: 'Tất cả mọi người' },
      { icon: 'clock', title: 'Thời gian', desc: '24/7' },
      { icon: 'car', title: 'Phương tiện', desc: 'Đi bộ, xe đạp' },
      { icon: 'percent', title: 'Giá', desc: 'Miễn phí' }
    ],
    availability: {
      '2025-09': {
        '1': 'Free', '2': 'Free', '3': 'Free', '4': 'Free', '5': 'Free', '6': 'Free', '7': 'Free',
        '8': 'Free', '9': 'Free', '10': 'Free', '11': 'Free', '12': 'Free', '13': 'Free', '14': 'Free'
      },
      '2025-10': {},
      '2025-11': {}
    }
  },
  '4': {
    id: '4',
    name: 'Phở Bò Hà Nội',
    type: 'restaurant',
    rating: 4.6,
    reviews: 234,
    location: 'Hoàn Kiếm, Hà Nội',
    address: '10 Lý Quốc Sư, Hoàn Kiếm',
    description: 'Quán phở bò truyền thống với hương vị đặc trưng của Hà Nội. Nước dùng được ninh từ xương bò trong nhiều giờ.',
    openingHours: '06:00 - 22:00',
    duration: '1 giờ',
    priceAdult: 70000,
    priceChild: 50000,
    additionalServices: [],
    discounts: [
      { code: 'FOODLOVER', value: 10000, applied: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop'
    ],
    thumbnails: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=150&h=150&fit=crop'
    ],
    features: [
      { icon: 'mapPin', title: 'Vị trí', desc: 'Gần Hồ Hoàn Kiếm' },
      { icon: 'utensils', title: 'Món đặc sản', desc: 'Phở bò, Phở gà' },
      { icon: 'users', title: 'Phù hợp', desc: 'Gia đình, Bạn bè' },
      { icon: 'clock', title: 'Giờ vàng', desc: 'Sáng sớm 6-9h' },
      { icon: 'car', title: 'Đỗ xe', desc: 'Có chỗ đỗ xe máy' },
      { icon: 'percent', title: 'Ưu đãi', desc: 'Giảm 10% cho combo' }
    ],
    availability: {
      '2025-09': {},
      '2025-10': {},
      '2025-11': {}
    }
  }
};

export const mockServiceDetailApi = {
  getServiceDetail: async (
    destination: string,
    serviceType: string,
    id: string
  ): Promise<ServiceDetail> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`📡 Mock API called: ${destination}/${serviceType}/${id}`);
    
    const data = mockData[id];
    if (!data) {
      throw new Error(`Service with ID "${id}" not found`);
    }
    
    return data;
  },

  checkAvailability: async (
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, string>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      '2025-09-01': '100 K',
      '2025-09-02': '100 K',
      '2025-09-03': '100 K'
    };
  }
};