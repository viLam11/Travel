// src/components/destinations/DestinationCard.tsx
import React, { useState } from 'react';
import { useLazyImage } from '../../../hooks/useLazyImage';
import { useNavigate } from 'react-router-dom';

interface DestinationCardProps {
  destination: {
    id: string;
    title: string;
    location: string;
    rating: string;
    reviews: string;
    description: string;
    price: string;
    nights: string;
    image: string;
    discount?: string;
  };
  onBook: (id: string) => void;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onBook,onClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  // Removed duplicate onBook function declaration.
  // Use the onBook prop passed to the component instead.
  const { 
    ref, 
    imageLoaded, 
    hasError,
    currentSrc,
    setImageLoaded,
    setHasError 
  } = useLazyImage<HTMLDivElement>(destination.image, {
    rootMargin: '150px',
    once: true,
    priority: 'low',
    fallbackSrc: '/images/placeholder-destination.jpg',
    onLoad: () => {
      console.log(`✅ Image loaded: ${destination.title}`);
    },
    onError: () => {
      console.error(`❌ Image failed: ${destination.title}`);
    }
  });

  return (
    <div
    onClick={onClick} 
    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 p-5">
      
      {/* Card Layout: Image Left, Content Middle, Price Right */}
      <div className="flex flex-col sm:flex-row gap-5">
        
        {/* LEFT: Image Section */}
        <div 
          ref={ref}
          className="w-full sm:w-[280px] h-48 sm:h-[200px] flex-shrink-0 relative overflow-hidden bg-gray-200 rounded-xl"
        >
          {/* Loading State */}
          {!imageLoaded && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}

          {/* Actual Image */}
          {!hasError && (
            <img
              src={currentSrc}
              alt={destination.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setHasError(true)}
              loading="lazy"
              className={`
                w-full h-full object-cover 
                transition-all duration-500
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            />
          )}
          
          {/* Discount Badge */}
          {destination.discount && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
              {destination.discount}
            </div>
          )}
        </div>

        {/* MIDDLE: Content Section */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Location */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">{destination.location}</p>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
              {destination.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center justify-center gap-1 bg-gray-50 px-3 py-1.5 rounded-md w-fit mb-3">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-sm font-semibold text-gray-900">{destination.rating}</span>
              <span className="text-xs text-gray-500">({destination.reviews})</span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {destination.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1.5 bg-white text-orange-500 rounded-md border border-orange-200 font-medium">
              Cam Kết Giá Tốt
            </span>
            <span className="text-xs px-3 py-1.5 bg-white text-green-600 rounded-md border border-green-200 font-medium">
              Hủy Miễn Phí
            </span>
          </div>
        </div>

        {/* RIGHT: Price Section */}
        <div className="w-full sm:w-[200px] flex-shrink-0 flex flex-col items-end justify-between text-right">
          {/* Duration */}
          <p className="text-sm text-gray-600 mb-4">{destination.nights}</p>

          {/* Price */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 line-through mb-1">1.200.000 VND</p>
            <p className="text-sm text-gray-600 mb-1">Từ <span className="text-2xl font-bold text-orange-500">{destination.price}</span></p>
          </div>

          {/* Book Button */}
          <button
            onClick={() => onBook(destination.id)}
            className="w-full bg-white hover:bg-orange-500 text-orange-500 hover:text-white border-2 border-orange-500 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
          >
            ĐẶT NGAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;