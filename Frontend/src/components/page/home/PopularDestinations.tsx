// src/components/page/home/PopularDestinations.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationCard from '../../common/DestinationCard';

interface Destination {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
  destinationSlug: string; //  Add slug
  regionSlug: string;      //  Add region slug
  serviceType: 'place' | 'hotel'; //  Add service type
}

const PopularDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  //  FIXED: Initial destinations with proper navigation data
  const initialDestinations: Destination[] = [
    {
      id: '1',
      title: 'NHÀ THỜ ĐỨC BÀ',
      location: 'TP. Hồ Chí Minh',
      priceRange: 'Miễn phí',
      openingHours: '8:00 - 11:00, 15:00 - 16:00',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      destinationSlug: 'ho-chi-minh',
      regionSlug: 'mien-nam',
      serviceType: 'place'
    },
    {
      id: '2',
      title: 'CHÙA MỘT CỘT',
      location: 'Hà Nội',
      priceRange: 'Miễn phí',
      openingHours: '6:00 - 18:00',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
      destinationSlug: 'ha-noi',
      regionSlug: 'mien-bac',
      serviceType: 'place'
    },
    {
      id: '3',
      title: 'HỒ HOÀN KIẾM',
      location: 'Hà Nội',
      priceRange: 'Miễn phí',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop',
      destinationSlug: 'ha-noi',
      regionSlug: 'mien-bac',
      serviceType: 'place'
    },
    {
      id: '4',
      title: 'PHỐ CỔ HỘI AN',
      location: 'Hội An',
      priceRange: '120.000 VND',
      openingHours: '7:00 - 22:00',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop',
      destinationSlug: 'hoi-an',
      regionSlug: 'mien-trung',
      serviceType: 'place'
    },
    {
      id: '5',
      title: 'CẦU RỒNG ĐÀ NẴNG',
      location: 'Đà Nẵng',
      priceRange: 'Miễn phí',
      openingHours: '21:00 - 22:00',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      destinationSlug: 'da-nang',
      regionSlug: 'mien-trung',
      serviceType: 'place'
    },
    {
      id: '6',
      title: 'VINPEARL NHA TRANG',
      location: 'Nha Trang',
      priceRange: '500.000 - 2.000.000 VND',
      openingHours: '9:00 - 22:00',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
      destinationSlug: 'nha-trang',
      regionSlug: 'mien-trung',
      serviceType: 'hotel'
    }
  ];

  //  FIXED: Additional destinations with proper navigation data
  const additionalDestinations: Destination[] = [
    {
      id: '7',
      title: 'BẢO TÀNG HỒ CHÍ MINH',
      location: 'Hà Nội',
      priceRange: '40.000 VND',
      openingHours: '8:00 - 17:00',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
      destinationSlug: 'ha-noi',
      regionSlug: 'mien-bac',
      serviceType: 'place'
    },
    {
      id: '8',
      title: 'ĐỈNH FANSIPAN',
      location: 'Sapa',
      priceRange: '600.000 VND',
      openingHours: '7:30 - 17:30',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop',
      destinationSlug: 'sapa',
      regionSlug: 'mien-bac',
      serviceType: 'place'
    },
    {
      id: '9',
      title: 'VỊNH HẠ LONG',
      location: 'Hạ Long',
      priceRange: '300.000 - 1.500.000 VND',
      openingHours: '6:00 - 18:00',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop',
      destinationSlug: 'ha-long',
      regionSlug: 'mien-bac',
      serviceType: 'place'
    },
    {
      id: '10',
      title: 'PHÚ QUỐC',
      location: 'Phú Quốc',
      priceRange: '500.000 - 2.000.000 VND',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      destinationSlug: 'phu-quoc',
      regionSlug: 'mien-nam',
      serviceType: 'place'
    },
    {
      id: '11',
      title: 'ĐÀ LẠT',
      location: 'Đà Lạt',
      priceRange: '400.000 - 1.200.000 VND',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
      destinationSlug: 'da-lat',
      regionSlug: 'mien-nam',
      serviceType: 'place'
    },
    {
      id: '12',
      title: 'VŨNG TÀU',
      location: 'Vũng Tàu',
      priceRange: '300.000 - 1.000.000 VND',
      openingHours: '24/7',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop',
      destinationSlug: 'vung-tau',
      regionSlug: 'mien-nam',
      serviceType: 'place'
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

  //  FIXED: Navigate với proper URL structure
  const handleBook = (id: string): void => {
    console.log('Booking destination:', id);
    
    // Find destination by id
    const destination = destinations.find(d => d.id === id);
    
    if (!destination) {
      console.error('Destination not found:', id);
      return;
    }

    // Create slug for service detail
    const titleSlug = destination.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const idSlug = `${id}-${titleSlug}`;

    // Navigate: /destinations/:region/:destination/:serviceType/:idSlug
    navigate(
      `/destinations/${destination.regionSlug}/${destination.destinationSlug}/${destination.serviceType}/${idSlug}`
    );
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