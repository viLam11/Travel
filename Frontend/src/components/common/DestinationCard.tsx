// src/components/common/DestinationCard.tsx
import React, { useState } from 'react';
import { MapPin, Calendar, Heart } from 'lucide-react';
import { useLazyImage } from '../../hooks/useLazyImage';

interface DestinationCardProps {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
  fallbackImage?: string; // 2️⃣ Optional fallback
  onBook: (id: string) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  title,
  location,
  priceRange,
  openingHours,
  image,
  fallbackImage = '/images/placeholder-destination.jpg', // 2️⃣ Default fallback
  onBook
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  // ✨ Enhanced hook với fallback support
  const { 
    ref, 
    imageLoaded, 
    showPlaceholder,
    shouldLoadImage,
    hasError,
    currentSrc, // 2️⃣ Có thể là original hoặc fallback
    setImageLoaded,
    setHasError 
  } = useLazyImage<HTMLDivElement>(image, {
    rootMargin: '150px',
    once: true,
    priority: 'low',
    fallbackSrc: fallbackImage, // 2️⃣ Auto fallback on error
    onLoad: () => {
      console.log(`✅ Image loaded: ${title}`);
    },
    onError: () => {
      console.error(`❌ Image failed (using fallback): ${title}`);
    },
    onInView: () => {
      console.log(`👀 Card in view: ${title}`);
    }
  });

  return (
    <div className="animate-fadeIn bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group h-auto cursor-pointer">
      
      {/* Image Section */}
      <div 
        ref={ref}
        className="w-full sm:w-[40%] h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-200"
      >
        {/* Skeleton Loading State */}
        {showPlaceholder && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Error State - Chỉ show nếu cả fallback cũng fail */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Không thể tải hình</p>
            </div>
          </div>
        )}

        {/* Actual Image - 2️⃣ Dùng currentSrc (có thể là fallback) */}
        {shouldLoadImage && (
          <img
            src={currentSrc}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
            className={`
              w-full h-full object-cover 
              group-hover:scale-110 transition-all duration-500
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}
        
        {/* Gradient Overlay */}
        {imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Heart Icon */}
        {imageLoaded && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white rounded-full p-2 sm:p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 z-10"
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isFavorite ? 'fill-orange-500 text-orange-500' : 'text-orange-500'
              }`}
            />
          </div>
        )}

        {/* 2️⃣ Fallback indicator (optional, for debugging) */}
        {imageLoaded && currentSrc === fallbackImage && process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Fallback
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="w-full sm:w-[60%] p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors duration-200">
            {title}
          </h3>
          
          <div className="space-y-1.5 sm:space-y-2">
            {/* Location */}
            <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="flex-1">
                <span className="font-medium">Địa chỉ:</span> {location}
              </span>
            </p>
            
            {/* Opening Hours */}
            <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="flex-1">
                <span className="font-medium">Thời gian mở cửa:</span> {openingHours}
              </span>
            </p>
          </div>
        </div>

        {/* Price & Booking Button */}
        <div className="mt-3 sm:mt-4 flex justify-between items-center gap-2">
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm text-gray-500">Giá từ:</p>
            <p className="text-xs sm:text-sm font-bold text-orange-500">
              {priceRange}
            </p>
          </div>

          <button
            onClick={() => onBook(id)}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
          >
            ĐẶT NGAY
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default DestinationCard;