// src/components/home/RegionSection.tsx
import React, { useState } from 'react';
import { useLazyImage } from '../../../hooks/useLazyImage';
import { useNavigate } from 'react-router-dom';

interface Region {
  id: string;
  name: string;
  location: string;
  image: string;
}

interface Place {
  id: string;
  name: string;
  image: string;
}

interface RegionData {
  regions: Region[];
  places: Place[];
}

// RegionCard Component với final enhanced hook
interface RegionCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  onClick: () => void;
  type?: 'main' | 'place';
  fallbackImage?: string;
}

const RegionCard: React.FC<RegionCardProps> = ({
  id,
  name,
  location,
  image,
  onClick,
  type = 'main',
  fallbackImage = '/images/placeholder-region.jpg' //Default fallback
}) => {
  // ✨ Final enhanced hook với fallback support
  const { 
    ref, 
    imageLoaded, 
    showPlaceholder,
    shouldLoadImage,
    hasError,
    currentSrc, //Có thể là fallback
    setImageLoaded,
    setHasError 
  } = useLazyImage<HTMLDivElement>(image, {
    rootMargin: '150px',
    once: true, // Disconnect sau lần đầu
    priority: 'low',
    fallbackSrc: fallbackImage, //Auto fallback on error
    onInView: () => {
      console.log(`👀 Region in view: ${type === 'main' ? location : name}`);
    },
    onError: () => {
      console.error(`❌ Region image failed: ${type === 'main' ? location : name}`);
    }
  });

  const heightClass = type === 'main' 
    ? 'h-48 sm:h-56 lg:h-72' 
    : 'h-40 sm:h-44 lg:h-52';

  const titleSize = type === 'main'
    ? 'text-lg sm:text-xl lg:text-2xl'
    : 'text-base sm:text-lg';

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div 
        ref={ref}
        className={`relative ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden shadow-lg`}
      >
        {/* Skeleton với Shimmer Effect */}
        {showPlaceholder && (
          // <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200">
          //   <div className="absolute inset-0">
          //     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer"></div>
          //   </div>
          //   <div className="absolute inset-0 flex items-center justify-center">
          //     <div className="text-gray-400 text-sm font-medium">Đang tải...</div>
          //   </div>
          // </div>
           <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Error State - Chỉ show nếu fallback cũng fail */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 sm:w-16 h-12 sm:h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs sm:text-sm">Không thể tải hình</p>
          </div>
        )}

        {/* Actual Image - 2️⃣ Dùng currentSrc */}
        {shouldLoadImage && (
          <img 
            src={currentSrc}
            alt={type === 'main' ? location : name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
            className={`
              w-full h-full object-cover 
              group-hover:scale-110 transition-transform duration-500
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}

        {/* Content Overlays - Chỉ hiện khi image loaded */}
        {imageLoaded && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white z-10">
              <h3 className={`${titleSize} font-bold mb-1 drop-shadow-lg`}>
                {type === 'main' ? location : name}
              </h3>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}

        {/* Progress Bar */}
        {showPlaceholder && shouldLoadImage && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 overflow-hidden">
            <div className="h-full bg-orange-500 progress-bar"></div>
          </div>
        )}

        {/* 2️⃣ Fallback indicator (dev only) */}
        {imageLoaded && currentSrc === fallbackImage && process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded z-20">
            Fallback
          </div>
        )}
      </div>
    </div>
  );
};

// Main RegionSection Component
const RegionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('north');

  const navigate = useNavigate();
  const regionData: Record<string, RegionData> = {
    north: {
      regions: [
        { id: '1', name: 'Miền Bắc', location: 'Hạ Long', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop' },
        { id: '2', name: 'Miền Bắc', location: 'Sapa', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop' },
        { id: '3', name: 'Miền Bắc', location: 'Hà Nội', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop' }
      ],
      places: [
        { id: '4', name: 'Tam Cốc', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop' },
        { id: '5', name: 'Ninh Bình', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop' },
        { id: '6', name: 'Mai Châu', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=300&fit=crop' }
      ]
    },
    central: {
      regions: [
        { id: '7', name: 'Miền Trung', location: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop' },
        { id: '8', name: 'Miền Trung', location: 'Hội An', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop' },
        { id: '9', name: 'Miền Trung', location: 'Huế', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop' }
      ],
      places: [
        { id: '10', name: 'Huế', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop' },
        { id: '11', name: 'Phong Nha', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop' },
        { id: '12', name: 'Quy Nhơn', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=300&fit=crop' }
      ]
    },
    south: {
      regions: [
        { id: '13', name: 'Miền Nam', location: 'Phú Quốc', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop' },
        { id: '14', name: 'Miền Nam', location: 'Vũng Tàu', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop' },
        { id: '15', name: 'Miền Nam', location: 'Cần Thơ', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop' }
      ],
      places: [
        { id: '16', name: 'Nha Trang', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=300&fit=crop' },
        { id: '17', name: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop' },
        { id: '18', name: 'Mũi Né', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=300&fit=crop' }
      ]
    }
  };

  const currentData = regionData[activeTab];

  const handleRegionClick = (location: string) => {
    console.log('Navigate to:', location);
    // TODO: Implement navigation
    // const urlLocation = location.toLowerCase().replace(/\s+/g, '-');
 
     const urlSlug = location
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-');
    
    // Navigate: /destination/ha-noi
       // navigate(`/destination/${urlLocation}`, { state: { location } });
    navigate(`/destinations/${urlSlug}`);
  };

  const handlePlaceClick = (name: string) => {
    console.log('Navigate to:', name);
    // TODO: Implement navigation
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1D7A] mb-2 sm:mb-3">
            ĐIỂM ĐẾN YÊU THÍCH
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Trải nghiệm các điểm du lịch nổi tiếng với đa dạng
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 lg:mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center gap-6 sm:gap-12 lg:gap-16 min-w-max px-4 sm:px-0">
            {['north', 'central', 'south'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 sm:pb-3 px-2 font-bold text-base sm:text-lg lg:text-xl transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-[#1A1D7A] border-b-3 sm:border-b-4 border-blue-600'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                {tab === 'north' ? 'Miền Bắc' : tab === 'central' ? 'Miền Trung' : 'Miền Nam'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Region Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-7 lg:mb-8 animate-fadeIn">
          {currentData.regions.map((region) => (
            <RegionCard
              key={region.id}
              {...region}
              type="main"
              onClick={() => handleRegionClick(region.location)}
            />
          ))}
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 animate-fadeIn">
          {currentData.places.map((place) => (
            <RegionCard
              key={place.id}
              {...place}
              location={place.name}
              type="place"
              onClick={() => handlePlaceClick(place.name)}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .progress-bar {
          animation: progress 2s ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default RegionSection;