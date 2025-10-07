// src/components/home/PopularDestinations.tsx
import React, { useState } from 'react';
import DestinationCard from '../common/DestinationCard';

interface Destination {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
}

const PopularDestinations: React.FC = () => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial 6 items
  const initialDestinations: Destination[] = [
    {
      id: '1',
      title: 'NHÀ THỜ ĐỨC BÀ',
      location: '124 đường ABC',
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
    },
    {
      id: '4',
      title: 'ĐỒNG VĂN THẠCH',
      location: 'Tp. Quảng Ngãi (Quảng Ngãi)',
      priceRange: '700 - 1930',
      openingHours: '8:00 - 17:00',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'PHỐ CỔ HỘI AN',
      location: 'Tp. Hội An (Quảng Nam)',
      priceRange: '750 - 1700',
      openingHours: '7:00 - 22:00',
      image: 'https://th.bing.com/th/id/R.d73ab86bb1b4d3b887501c9b88bc6b4f?rik=ajEKq%2fY5iEMiSg&pid=ImgRaw&r=0'
    },
    {
      id: '6',
      title: 'CẦU RỒNG ĐÀ NẴNG',
      location: 'Tp. Đà Nẵng (Đà Nẵng)',
      priceRange: 'Miễn phí',
      openingHours: '21:00 - 22:00',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    }
  ];

  // Additional items for lazy load
  const additionalDestinations: Destination[] = [
    {
      id: '7',
      title: 'BẢO TÀNG HỒ CHÍ MINH',
      location: 'Số 19, Ngọc Hà, Ba Đình',
      priceRange: '50.000 VND',
      openingHours: '8:00 - 17:00',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      title: 'ĐỈNH FANSIPAN',
      location: 'Sapa, Lào Cai',
      priceRange: '600.000 VND',
      openingHours: '7:30 - 17:30',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
    },
    {
      id: '9',
      title: 'VỊNH HẠ LONG',
      location: 'Tp. Hạ Long, Quảng Ninh',
      priceRange: '300.000 - 1.500.000 VND',
      openingHours: '6:00 - 18:00',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'
    },
    {
      id: '10',
      title: 'PHÚ QUỐC',
      location: 'Kiên Giang',
      priceRange: '500.000 - 2.000.000 VND',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    {
      id: '11',
      title: 'ĐÀ LẠT',
      location: 'Lâm Đồng',
      priceRange: '400.000 - 1.200.000 VND',
      openingHours: '24/7',
      image: 'https://th.bing.com/th/id/R.d73ab86bb1b4d3b887501c9b88bc6b4f?rik=ajEKq%2fY5iEMiSg&pid=ImgRaw&r=0'
    },
    {
      id: '12',
      title: 'NHA TRANG',
      location: 'Khánh Hòa',
      priceRange: '300.000 - 1.000.000 VND',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop'
    }
  ];

  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);

  // Lazy load function
  const handleLoadMore = async (): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call delay (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDestinations([...destinations, ...additionalDestinations]);
    setShowAll(true);
    setIsLoading(false);
  };

  const handleBook = (id: string): void => {
    console.log('Booking destination:', id);
    // TODO: Implement booking logic
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Địa điểm yêu thích</h2>
          
          {!showAll && (
            <button 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Đang tải...' : 'Tất cả'}
            </button>
          )}
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};

export default PopularDestinations;