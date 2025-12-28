// src/components/page/home/RegionSection.tsx
import React, { useState } from 'react';
import { useLazyImage } from '../../../hooks/useLazyImage';
import { useNavigate } from 'react-router-dom';

interface Region {
  id: string;
  name: string;
  location: string;
  image: string;
  destinationSlug: string; //  Add slug
  regionSlug: string;      //  Add region slug
}

interface Place {
  id: string;
  name: string;
  image: string;
  destinationSlug: string; //  Add slug
  regionSlug: string;      //  Add region slug
}

interface RegionData {
  regions: Region[];
  places: Place[];
}

// RegionCard Component
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
  fallbackImage = '/images/placeholder-region.jpg'
}) => {
  const {
    ref,
    imageLoaded,
    showPlaceholder,
    shouldLoadImage,
    hasError,
    currentSrc,
    setImageLoaded,
    setHasError
  } = useLazyImage<HTMLDivElement>(image, {
    rootMargin: '150px',
    once: true,
    priority: 'low',
    fallbackSrc: fallbackImage,
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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 sm:w-16 h-12 sm:h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs sm:text-sm">Không thể tải hình</p>
          </div>
        )}

        {/* Actual Image */}
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

        {/* Content Overlays */}
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
      </div>
    </div>
  );
};

// Main RegionSection Component
const RegionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('north');
  const navigate = useNavigate();

  //  FIXED: Data với proper slugs
  const regionData: Record<string, RegionData> = {
    north: {
      regions: [
        {
          id: '1',
          name: 'Miền Bắc',
          location: 'Hạ Long',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop',
          destinationSlug: 'ha-long',
          regionSlug: 'mien-bac'
        },
        {
          id: '2',
          name: 'Miền Bắc',
          location: 'Sapa',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop',
          destinationSlug: 'sapa',
          regionSlug: 'mien-bac'
        },
        {
          id: '3',
          name: 'Miền Bắc',
          location: 'Hà Nội',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
          destinationSlug: 'ha-noi',
          regionSlug: 'mien-bac'
        }
      ],
      places: [
        {
          id: '4',
          name: 'Ninh Bình',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop',
          destinationSlug: 'ninh-binh',
          regionSlug: 'mien-bac'
        },
        {
          id: '5',
          name: 'Hải Phòng',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop',
          destinationSlug: 'hai-phong',
          regionSlug: 'mien-bac'
        }
      ]
    },
    central: {
      regions: [
        {
          id: '7',
          name: 'Miền Trung',
          location: 'Đà Nẵng',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
          destinationSlug: 'da-nang',
          regionSlug: 'mien-trung'
        },
        {
          id: '8',
          name: 'Miền Trung',
          location: 'Hội An',
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop',
          destinationSlug: 'hoi-an',
          regionSlug: 'mien-trung'
        },
        {
          id: '9',
          name: 'Miền Trung',
          location: 'Huế',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop',
          destinationSlug: 'hue',
          regionSlug: 'mien-trung'
        }
      ],
      places: [
        {
          id: '10',
          name: 'Nha Trang',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop',
          destinationSlug: 'nha-trang',
          regionSlug: 'mien-trung'
        },
        {
          id: '11',
          name: 'Quy Nhơn',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop',
          destinationSlug: 'quy-nhon',
          regionSlug: 'mien-trung'
        }
      ]
    },
    south: {
      regions: [
        {
          id: '13',
          name: 'Miền Nam',
          location: 'Phú Quốc',
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop',
          destinationSlug: 'phu-quoc',
          regionSlug: 'mien-nam'
        },
        {
          id: '14',
          name: 'Miền Nam',
          location: 'Vũng Tàu',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
          destinationSlug: 'vung-tau',
          regionSlug: 'mien-nam'
        },
        {
          id: '15',
          name: 'Miền Nam',
          location: 'TP. Hồ Chí Minh',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop',
          destinationSlug: 'ho-chi-minh',
          regionSlug: 'mien-nam'
        }
      ],
      places: [
        {
          id: '17',
          name: 'Đà Lạt',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop',
          destinationSlug: 'da-lat',
          regionSlug: 'mien-nam'
        },
        {
          id: '18',
          name: 'Cần Thơ',
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=300&fit=crop',
          destinationSlug: 'can-tho',
          regionSlug: 'mien-nam'
        }
      ]
    }
  };

  const currentData = regionData[activeTab];

  //  FIXED: Navigate với region + destination
  const handleRegionClick = (region: Region) => {
    console.log('Navigate to:', region.location);

    // Navigate with query params for filtering
    const queryParams = new URLSearchParams();
    queryParams.append('destination', region.location); // Use exact name for now

    navigate(`/destinations?${queryParams.toString()}`);
  };

  //  FIXED: Navigate với region + destination
  const handlePlaceClick = (place: Place) => {
    console.log('Navigate to:', place.name);

    // Navigate with query params for filtering
    const queryParams = new URLSearchParams();
    queryParams.append('destination', place.name);

    navigate(`/destinations?${queryParams.toString()}`);
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
                className={`pb-2 sm:pb-3 px-2 font-bold text-base sm:text-lg lg:text-xl transition-all whitespace-nowrap ${activeTab === tab
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
              onClick={() => handleRegionClick(region)}
            />
          ))}
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 animate-fadeIn">
          {currentData.places.map((place) => (
            <RegionCard
              key={place.id}
              name={place.name}
              location={place.name}
              image={place.image}
              type="place"
              onClick={() => handlePlaceClick(place)}
              id={place.id}
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