// src/components/common/DestinationCard.tsx
import React, { useState } from 'react';
import { MapPin, Calendar, Heart, Star } from 'lucide-react';
import { useLazyImage } from '../../hooks/useLazyImage';

export interface Destination {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  rating?: string;
  reviews?: string;
  description?: string;
  nights?: string;
  discount?: string;
  openingHours?: string;
}

interface DestinationCardProps {
  destination: Destination;
  fallbackImage?: string;
  onBook: (id: string) => void;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  fallbackImage = '/images/placeholder-destination.jpg',
  onBook,
  onClick
}) => {
  const {
    id,
    title,
    location,
    price,
    openingHours,
    image,
    rating,
    reviews,
    discount
  } = destination;

  const [isFavorite, setIsFavorite] = useState(false);

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
    rootMargin: '100px', // Reduced for faster loading
    once: true,
    priority: 'low',
    fallbackSrc: fallbackImage,
    onInView: () => {
      // console.log(`👀 Card in view: ${title}`);
    },
    onLoad: () => {
      // console.log(` Image loaded: ${title}`);
    },
    onError: () => {
      // console.error(`❌ Image failed: ${title}`);
    }
  });

  return (
    <div
      className="animate-fadeIn bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group h-auto cursor-pointer"
      onClick={onClick}
    >

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

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xs">Không thể tải hình</p>
            </div>
          </div>
        )}

        {/* Actual Image */}
        {shouldLoadImage && (
          <img
            src={currentSrc}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            className={`
              w-full h-full object-cover 
              group-hover:scale-110 transition-all duration-500
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}

        {/* Discount Badge */}
        {imageLoaded && discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
            {discount}
          </div>
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
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isFavorite ? 'fill-orange-500 text-orange-500' : 'text-orange-500'
                }`}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="w-full sm:w-[60%] p-3 sm:p-4 flex flex-col justify-between">
        <div>
          {/* Title & Rating */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors duration-200">
              {title}
            </h3>
            {rating && rating !== '0' && (
              <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded text-xs shrink-0">
                <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-700">{rating}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {/* Location */}
            <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="flex-1 line-clamp-1">
                {/* <span className="font-medium">Địa chỉ:</span>  */}
                {location}
              </span>
            </p>

            {/* Opening Hours or Reviews */}
            {openingHours ? (
              <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="flex-1">
                  <span className="font-medium">Mở cửa:</span> {openingHours}
                </span>
              </p>
            ) : reviews ? (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span>📝</span> {reviews} đánh giá
              </p>
            ) : null}
          </div>
        </div>

        {/* Price & Booking Button */}
        <div className="mt-3 sm:mt-4 flex justify-between items-center gap-2">
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm text-gray-500">Giá chỉ từ:</p>
            <p className="text-sm sm:text-base font-bold text-orange-500">
              {price}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(id);
            }}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
          >
            ĐẶT NGAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;