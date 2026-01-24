// src/components/page/home/RegionSection.tsx
import React, { useState, useEffect } from 'react';
import { useLazyImage } from '../../../hooks/useLazyImage';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

interface Province {
  id: string | number;
  name: string; // Tên tỉnh (e.g., Hà Nội)
  fullName: string;
  code: string;
  codeName: string; // Slug (e.g., ha_noi)
  divisionType: string;
  thumbnailUrl: string;
  imageUrl?: string; // Image URL from database
  regionCode: string; // e.g., dong_bang_song_hong
  administrativeRegion?: {
    id: number;
    name: string;
    name_en: string;
    code_name_en: string;
    macroRegion: string;
  };
}

interface RegionCardProps {
  _id: string;
  _name: string;
  location: string;
  image: string;
  onClick: () => void;
  type?: 'main' | 'place';
  fallbackImage?: string;
  eager?: boolean; // Eager load image (no lazy loading)
}

const RegionCard: React.FC<RegionCardProps> = ({
  _id,
  _name,
  location,
  image,
  onClick,
  type = 'main',
  fallbackImage = '/images/placeholder-region.jpg',
  eager = false
}) => {
  const [actuallyLoaded, setActuallyLoaded] = React.useState(false);

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
    rootMargin: eager ? '0px' : '50px',
    once: true,
    priority: eager || type === 'main' ? 'high' : 'low',
    fallbackSrc: fallbackImage,
  });

  // Timeout fallback: Hide skeleton after 3s even if image not loaded
  React.useEffect(() => {
    if (shouldLoadImage && !imageLoaded && !hasError) {
      const timeout = setTimeout(() => {
        console.warn(`Image loading timeout, hiding skeleton: ${location}`);
        setImageLoaded(true); // Hide skeleton
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [shouldLoadImage, imageLoaded, hasError, location, setImageLoaded]);

  const heightClass = type === 'main'
    ? 'h-48 sm:h-56 lg:h-72'
    : 'h-40 sm:h-44 lg:h-52';

  const titleSize = type === 'main'
    ? 'text-lg sm:text-xl lg:text-2xl'
    : 'text-base sm:text-lg';

  // For eager loading, bypass lazy loading completely
  if (eager) {
    return (
      <div onClick={onClick} className="group cursor-pointer h-full">
        <div
          className={`relative ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-full`}
        >
          {/* Skeleton - show until image loads */}
          {!actuallyLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          <img
            src={image}
            alt={location}
            onLoad={() => setActuallyLoaded(true)}
            onError={() => setActuallyLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${actuallyLoaded ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Overlay - only show when loaded */}
          {actuallyLoaded && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white z-10">
                <h3 className={`${titleSize} font-bold mb-1 drop-shadow-lg`}>
                  {location}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="group cursor-pointer h-full">
      <div
        ref={ref}
        className={`relative ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-full`}
      >
        {/* Skeleton */}
        {showPlaceholder && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Actual Image */}
        {shouldLoadImage && (
          <img
            src={currentSrc}
            alt={location}
            onLoad={() => {
              setImageLoaded(true);
              setActuallyLoaded(true);
            }}
            onError={() => setHasError(true)}
            className={`
              w-full h-full object-cover 
              group-hover:scale-110 transition-transform duration-500
              ${actuallyLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}

        {/* Content Overlays - Only show when image actually loaded */}
        {actuallyLoaded && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white z-10">
              <h3 className={`${titleSize} font-bold mb-1 drop-shadow-lg`}>
                {location}
              </h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RegionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('north');
  const [allProvinces, setAllProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Mock Data for Fallback
  const mockProvinces: Province[] = [
    // North - dong_bac_bo (1), tay_bac_bo (2), dong_bang_song_hong (3)
    { code: '01', name: 'Hà Nội', fullName: 'Thành phố Hà Nội', codeName: 'ha-noi', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop', regionCode: 'dong_bang_song_hong', id: '01' },
    { code: '22', name: 'Hạ Long', fullName: 'Quảng Ninh', codeName: 'quang-ninh', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop', regionCode: 'dong_bac_bo', id: '22' },
    { code: '15', name: 'Sapa', fullName: 'Lào Cai', codeName: 'lao-cai', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop', regionCode: 'tay_bac_bo', id: '15' },
    { code: '37', name: 'Ninh Bình', fullName: 'Ninh Bình', codeName: 'ninh-binh', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1629562777178-577c25126fe8?w=600&h=400&fit=crop', regionCode: 'dong_bang_song_hong', id: '37' },
    { code: '31', name: 'Hải Phòng', fullName: 'Thành phố Hải Phòng', codeName: 'hai-phong', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1623869068579-a773d4a0f443?w=600&h=400&fit=crop', regionCode: 'dong_bang_song_hong', id: '31' },

    // Central - bac_trung_bo (4), duyen_hai_nam_trung_bo (5), tay_nguyen (6)
    { code: '48', name: 'Đà Nẵng', fullName: 'Thành phố Đà Nẵng', codeName: 'da-nang', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop', regionCode: 'duyen_hai_nam_trung_bo', id: '48' },
    { code: '49', name: 'Hội An', fullName: 'Quảng Nam', codeName: 'quang-nam', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop', regionCode: 'duyen_hai_nam_trung_bo', id: '49' },
    { code: '46', name: 'Huế', fullName: 'Thừa Thiên Huế', codeName: 'thua-thien-hue', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1629562777178-577c25126fe8?w=600&h=400&fit=crop', regionCode: 'bac_trung_bo', id: '46' },
    { code: '56', name: 'Nha Trang', fullName: 'Khánh Hòa', codeName: 'khanh-hoa', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop', regionCode: 'duyen_hai_nam_trung_bo', id: '56' },
    { code: '68', name: 'Đà Lạt', fullName: 'Lâm Đồng', codeName: 'lam-dong', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop', regionCode: 'tay_nguyen', id: '68' },

    // South - dong_nam_bo (7), dong_bang_song_cuu_long (8)
    { code: '79', name: 'Hồ Chí Minh', fullName: 'TP. Hồ Chí Minh', codeName: 'ho-chi-minh', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop', regionCode: 'dong_nam_bo', id: '79' },
    { code: '91', name: 'Phú Quốc', fullName: 'An Giang', codeName: 'an-giang', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop', regionCode: 'dong_bang_song_cuu_long', id: '91' },
    { code: '77', name: 'Vũng Tàu', fullName: 'Bà Rịa - Vũng Tàu', codeName: 'ba-ria-vung-tau', divisionType: 'tinh', thumbnailUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop', regionCode: 'dong_nam_bo', id: '77' },
    { code: '92', name: 'Cần Thơ', fullName: 'Thành phố Cần Thơ', codeName: 'can-tho', divisionType: 'thanh_pho_trung_uong', thumbnailUrl: 'https://images.unsplash.com/photo-1629562777178-577c25126fe8?w=600&h=400&fit=crop', regionCode: 'dong_bang_song_cuu_long', id: '92' },
  ];

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.provinces.getAll();

        if (Array.isArray(data) && data.length > 0) {
          // Ensure each province has imageUrl, use placeholder if missing
          const provincesWithImages = data.map(p => ({
            ...p,
            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&q=80'
          }));
          setAllProvinces(provincesWithImages);
        } else {
          setAllProvinces(mockProvinces);
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
        setAllProvinces(mockProvinces);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  const getFilteredData = (tab: string) => {
    let filtered = [];

    switch (tab) {
      case 'north':
        filtered = allProvinces.filter(p =>
          p.administrativeRegion && ['northest', 'northwest', 'red_river_delta'].includes(p.administrativeRegion.code_name_en)
        );
        break;
      case 'central':
        filtered = allProvinces.filter(p =>
          p.administrativeRegion && ['north_central_coast', 'south_central_coast', 'central_highlands'].includes(p.administrativeRegion.code_name_en)
        );
        break;
      case 'south':
        filtered = allProvinces.filter(p =>
          p.administrativeRegion && ['southeast', 'southwest'].includes(p.administrativeRegion.code_name_en)
        );
        break;
      default:
        filtered = allProvinces;
    }

    // Sort by imageUrl availability
    filtered.sort((a, b) => {
      if (a.imageUrl && !b.imageUrl) return -1;
      if (!a.imageUrl && b.imageUrl) return 1;
      return 0;
    });

    // Fallback if filtering returns nothing
    if (filtered.length < 5) {
      const fallbackRegion = mockProvinces.filter(p => {
        if (tab === 'north') return ['dong_bac_bo', 'tay_bac_bo', 'dong_bang_song_hong'].includes(p.regionCode);
        if (tab === 'central') return ['bac_trung_bo', 'duyen_hai_nam_trung_bo', 'tay_nguyen'].includes(p.regionCode);
        if (tab === 'south') return ['dong_nam_bo', 'dong_bang_song_cuu_long'].includes(p.regionCode);
        return false;
      });
      if (fallbackRegion.length > 0) filtered = fallbackRegion;
    }

    return {
      regions: filtered.slice(0, 3).map(p => ({
        id: p.code,
        name: p.name,
        location: p.name,
        image: p.imageUrl || '/images/placeholder-region.jpg',
        destinationSlug: p.codeName,
        regionSlug: tab
      })),
      places: filtered.slice(3, 5).map(p => ({
        id: p.code,
        name: p.name,
        location: p.name,
        image: p.imageUrl || '/images/placeholder-region.jpg',
        destinationSlug: p.codeName,
        regionSlug: tab
      }))
    };
  };

  const currentData = getFilteredData(activeTab);

  const handleRegionClick = (_slug: string, name: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('destination', name);
    navigate(`/destinations?${queryParams.toString()}`);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1D7A] mb-2 sm:mb-3">
            ĐIỂM ĐẾN YÊU THÍCH
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Trải nghiệm các điểm du lịch nổi tiếng với đa dạng
          </p>
        </div>

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

        {isLoading && currentData.regions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-7 lg:mb-8 animate-fadeIn">
              {currentData.regions.map((region, index) => (
                <RegionCard
                  key={region.id}
                  _id={region.id}
                  _name={region.name}
                  location={region.location}
                  image={region.image}
                  type="main"
                  onClick={() => handleRegionClick(region.destinationSlug, region.name)}
                  eager={index === 0} // Eager load first image
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6 animate-fadeIn mt-2">
              {currentData.places.map((place) => (
                <div key={place.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-md h-full">
                  <RegionCard
                    _id={place.id}
                    _name={place.name}
                    location={place.location}
                    image={place.image}
                    type="place"
                    onClick={() => handleRegionClick(place.destinationSlug, place.name)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
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