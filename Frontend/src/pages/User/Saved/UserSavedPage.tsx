// src/pages/User/Saved/UserSavedPage.tsx
import React, { useState } from 'react';
import { Heart, MapPin, Star, Trash2, Grid3x3, List } from 'lucide-react';
import toast from 'react-hot-toast';

interface SavedItem {
  id: string;
  type: 'hotel' | 'destination'; // Chỉ hỗ trợ Hotel và Destination
  // type: 'hotel' | 'tour' | 'activity' | 'destination'; // TODO: Uncomment khi cần thêm Tour & Activity
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price?: number;
  priceUnit?: string;
  image: string;
  savedDate: string;
  description: string;
}

const MOCK_SAVED_ITEMS: SavedItem[] = [
  {
    id: '2',
    type: 'hotel',
    name: 'Vinpearl Resort Phú Quốc',
    location: 'Phú Quốc',
    rating: 4.8,
    reviewCount: 1240,
    price: 3500000, // Giá trung bình 1 đêm
    priceUnit: '/đêm',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    savedDate: '2025-10-15',
    description: 'Khu nghỉ dưỡng sang trọng với bãi biển riêng và hồ bơi ngoài trời.',
  },
  {
    id: '3',
    type: 'destination', // Đã chuyển từ 'activity' sang 'destination' để khớp Interface
    name: 'Trải nghiệm Lặn biển Nha Trang',
    location: 'Nha Trang',
    rating: 4.7,
    reviewCount: 320,
    price: 500000,
    priceUnit: '/vé',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    savedDate: '2025-09-10',
    description: 'Khám phá rạn san hô Hòn Mun với hướng dẫn viên chuyên nghiệp.',
  },
  {
    id: '4',
    type: 'hotel',
    name: 'InterContinental Saigon',
    location: 'TP. Hồ Chí Minh',
    rating: 4.9,
    reviewCount: 2100,
    price: 4800000,
    priceUnit: '/đêm',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    savedDate: '2025-08-20',
    description: 'Khách sạn đẳng cấp quốc tế nằm ngay trung tâm Quận 1 sầm uất.',
  },
  {
    id: '5',
    type: 'destination',
    name: 'Phố cổ Hội An',
    location: 'Quảng Nam',
    rating: 4.9,
    reviewCount: 3421,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    savedDate: '2025-10-25',
    description: 'Di sản văn hóa thế giới với kiến trúc cổ kính',
  },
  {
    id: '6',
    type: 'hotel',
    name: 'Vinpearl Resort Phú Quốc',
    location: 'Phú Quốc',
    rating: 4.7,
    reviewCount: 2134,
    price: 3500000,
    priceUnit: '/đêm',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
    savedDate: '2025-10-15',
    description: 'Resort 5 sao với bãi biển riêng và spa cao cấp',
  },
  {
    id: '1',
    type: 'destination',
    name: 'Trải nghiệm Du lịch Vịnh Hạ Long',
    location: 'Quảng Ninh',
    rating: 4.5,
    reviewCount: 856,
    price: 3200000, // Giá ước tính cho 1 người/tour
    priceUnit: '/người',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
    savedDate: '2025-11-20',
    description: 'Du thuyền 5 sao, khám phá vẻ đẹp kỳ quan thiên nhiên và hang động.',
  },
  // TODO: Uncomment khi cần thêm Tour và Activity
  // {
  //   id: '2',
  //   type: 'tour',
  //   name: 'Tour Vịnh Hạ Long 2N1Đ',
  //   location: 'Quảng Ninh',
  //   rating: 4.8,
  //   reviewCount: 856,
  //   price: 2000000,
  //   priceUnit: '/người',
  //   image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600',
  //   savedDate: '2025-10-28',
  //   description: 'Du thuyền 5 sao, khám phá vẻ đẹp kỳ quan thiên nhiên',
  // },
  // {
  //   id: '4',
  //   type: 'activity',
  //   name: 'Trải nghiệm Lặn biển Nha Trang',
  //   location: 'Nha Trang',
  //   rating: 4.6,
  //   reviewCount: 542,
  //   price: 500000,
  //   priceUnit: '/người',
  //   image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
  //   savedDate: '2025-10-20',
  //   description: 'Khám phá thế giới đại dương sống động',
  // },
];

const UserSavedPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState(MOCK_SAVED_ITEMS);
  const [selectedType, setSelectedType] = useState<'all' | 'hotel' | 'destination'>('all');
  // const [selectedType, setSelectedType] = useState<'all' | 'hotel' | 'tour' | 'activity' | 'destination'>('all'); // TODO: Uncomment khi thêm Tour & Activity
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredItems = selectedType === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === selectedType);

  const handleRemove = (id: string) => {
    setSavedItems(savedItems.filter(item => item.id !== id));
    toast.success('Đã xóa khỏi danh sách yêu thích');
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      hotel: 'Khách sạn',
      destination: 'Địa điểm',
      // tour: 'Tour', // TODO: Uncomment khi thêm Tour
      // activity: 'Hoạt động', // TODO: Uncomment khi thêm Activity
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đã lưu</h1>
          <p className="text-sm text-gray-600">
            {filteredItems.length} mục đã lưu
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'Tất cả', count: savedItems.length },
          { value: 'hotel', label: 'Khách sạn', count: savedItems.filter(i => i.type === 'hotel').length },
          { value: 'destination', label: 'Địa điểm', count: savedItems.filter(i => i.type === 'destination').length },
          // TODO: Uncomment khi cần thêm Tour & Activity
          // { value: 'tour', label: 'Tour', count: savedItems.filter(i => i.type === 'tour').length },
          // { value: 'activity', label: 'Hoạt động', count: savedItems.filter(i => i.type === 'activity').length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedType(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedType === tab.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Saved Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có mục yêu thích</h3>
          <p className="text-gray-500">Hãy khám phá và lưu những địa điểm yêu thích của bạn</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
                <span className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {getTypeLabel(item.type)}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">{item.rating}</span>
                    <span className="text-sm text-gray-500">({item.reviewCount})</span>
                  </div>
                  
                  {item.price && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-600">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        {item.priceUnit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-900">{item.rating}</span>
                      <span className="text-sm text-gray-500">({item.reviewCount} đánh giá)</span>
                    </div>
                    
                    {item.price && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-600">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {item.priceUnit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSavedPage;