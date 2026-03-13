// src/components/page/destinationFilter/DestinationFIlterCard.tsx
import React, { useState } from 'react';
import { useLazyImage } from '../../../hooks/useLazyImage';
import { MapPin, Star, Tag, Heart, Clock, BadgeCheck, Leaf } from 'lucide-react';

interface DestinationCardProps {
  destination: {
    id: string;
    title: string;
    location: string;
    rating: string;
    reviews: string;
    description: string;
    price: string;           // already-discounted display price
    originalPrice?: string;  // raw price before discount (if any)
    nights: string;
    image: string;
    discount?: string;       // badge label e.g. "-20%" or "-200.000₫"
  };
  onBook: (id: string) => void;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onBook, onClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);

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
  });

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">

        {/* ── LEFT: Image ── */}
        <div
          ref={ref}
          className="w-full sm:w-64 h-52 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-200"
        >
          {/* Skeleton */}
          {!imageLoaded && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* Error */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              Không tải được ảnh
            </div>
          )}

          {/* Image */}
          {!hasError && (
            <img
              src={currentSrc}
              alt={destination.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setHasError(true)}
              loading="lazy"
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/* Discount Badge — orange brand color */}
          {destination.discount && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md z-10">
              <Tag className="w-3 h-3" />
              {destination.discount}
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFavorite(p => !p); }}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-orange-500 text-orange-500' : 'text-orange-500'}`} />
          </button>
        </div>

        {/* ── MIDDLE + RIGHT: Content ── */}
        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 min-w-0">

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              {/* Location */}
              <p className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {destination.location}
              </p>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors duration-200">
                {destination.title}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                  <span className="text-sm font-bold text-orange-700">{destination.rating}</span>
                </div>
                {destination.reviews !== '0' && (
                  <span className="text-xs text-gray-400">({destination.reviews} đánh giá)</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 font-medium">
                <BadgeCheck className="w-3 h-3" /> Cam kết giá tốt
              </span>
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 font-medium">
                <Leaf className="w-3 h-3" /> Hủy miễn phí
              </span>
            </div>
          </div>

          {/* ── RIGHT: Price + CTA ── */}
          <div className="sm:w-44 flex-shrink-0 flex flex-col items-end justify-between text-right sm:border-l sm:border-gray-100 sm:pl-4">
            <div>
              {/* Duration */}
              <p className="flex items-center justify-end gap-1 text-xs text-gray-400 mb-3">
                <Clock className="w-3.5 h-3.5" />
                {destination.nights}
              </p>

              {/* Price */}
              <div>
                {destination.originalPrice && (
                  <p className="text-sm text-gray-400 line-through mb-0.5">{destination.originalPrice}</p>
                )}
                <p className="text-xs text-gray-500 mb-0.5">Từ</p>
                <p className={`text-2xl font-extrabold leading-tight ${destination.discount ? 'text-orange-500' : 'text-orange-500'}`}>
                  {destination.price}
                </p>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBook(destination.id);
              }}
              className="cursor-pointer mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Đặt ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;