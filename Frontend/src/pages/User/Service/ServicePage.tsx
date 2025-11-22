// src/pages/DestinationDetailPage.tsx
import React, { useState } from 'react';
import Navigation from '../../../components/common/layout/NavigationUser';
import Footer from '../../../components/common/layout/Footer';
import DestinationCard from '../../../components/common/DestinationCard';
import { MapPin, Calendar, ChevronDown, Users, Star, Globe } from 'lucide-react';

interface Destination {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
}

const DestinationDetailPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [dateRange] = useState({ start: 'February 05', end: 'March 14' });
  const [tourType] = useState('All tour');

  const destinationName = 'Hồ Chí Minh';

  // Danh sách các địa điểm du lịch
  const attractions: Destination[] = [
    {
      id: '1',
      title: 'DINH ĐỘC LẬP',
      location: '135 Nam Kỳ Khởi Nghĩa',
      priceRange: '40.000 VND',
      openingHours: '7:30 - 11:00, 13:00 - 16:00',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'CHỢ BẾN THÀNH',
      location: 'Lê Lợi, Quận 1',
      priceRange: 'Miễn phí',
      openingHours: '6:00 - 18:00',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'NHÀ THỜ ĐỨC BÀ',
      location: '01 Công xã Paris',
      priceRange: 'Miễn phí',
      openingHours: '8:00 - 11:00, 15:00 - 16:00',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'BẢO TÀNG CHỨNG TÍCH CHIẾN TRANH',
      location: '28 Võ Văn Tần',
      priceRange: '40.000 VND',
      openingHours: '7:30 - 18:00',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'PHỐ ĐI BỘ NGUYỄN HUỆ',
      location: 'Đường Nguyễn Huệ, Quận 1',
      priceRange: 'Miễn phí',
      openingHours: '24/7',
      image: 'https://th.bing.com/th/id/R.d73ab86bb1b4d3b887501c9b88bc6b4f?rik=ajEKq%2fY5iEMiSg&pid=ImgRaw&r=0'
    },
    {
      id: '6',
      title: 'BƯU ĐIỆN TRUNG TÂM',
      location: '02 Công xã Paris',
      priceRange: 'Miễn phí',
      openingHours: '7:00 - 19:00',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
    },
    {
      id: '7',
      title: 'NHÀ HÁT THÀNH PHỐ',
      location: '07 Công Trường Lam Sơn',
      priceRange: '100.000 - 500.000 VND',
      openingHours: '9:00 - 20:00',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      title: 'PHỐ TÂY BÙI VIỆN',
      location: 'Đường Bùi Viện, Quận 1',
      priceRange: 'Miễn phí',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
    },
    {
      id: '9',
      title: 'KHU PHỐ CỔ',
      location: 'Quận 1',
      priceRange: 'Miễn phí',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
    }
  ];

  const categories = ['Tất cả', 'Lịch sử', 'Văn hóa', 'Giải trí', 'Mua sắm', 'Tôn giáo', 'Bảo tàng', 'Kiến trúc'];

  const handleBook = (id: string): void => {
    console.log('Booking destination:', id);
    // TODO: Implement booking logic
  };

  return (
    <div className="min-h-screen bg-white">
      {/* <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Location Header */}
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">{destinationName}</h1>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_auto] gap-3">
              {/* Destination */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Địa điểm</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={destinationName}
                    readOnly
                    className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">When</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={`${dateRange.start} - ${dateRange.end}`}
                    readOnly
                    className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Tour Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tour Type</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tourType}
                    readOnly
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Search Button */}
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium mt-auto">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Địa điểm nổi bật</h2>
          <p className="text-gray-600">Khám phá những điểm đến hấp dẫn tại {destinationName}</p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Destinations Grid - Sử dụng DestinationCard component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((dest) => (
            <DestinationCard
              key={dest.id}
              id={dest.id}
              title={dest.title}
              location={dest.location}
              priceRange={dest.priceRange}
              openingHours={dest.openingHours}
              image={dest.image}
              onBook={handleBook}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">932M</p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">24M</p>
            <p className="text-sm text-gray-600 mt-1">Total Destinations</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">10M</p>
            <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">65M</p>
            <p className="text-sm text-gray-600 mt-1">Total Activities</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetailPage;