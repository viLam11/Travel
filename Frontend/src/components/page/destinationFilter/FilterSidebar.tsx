// src/components/page/destinationFilter/FilterSidebar.tsx
import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, Star, TrendingUp, MapPin } from 'lucide-react';
import { SORT_OPTIONS, type SortValue } from '@/constants/regions';
import LocationSelector from '@/components/common/LocationSelector';

interface FilterSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;

  // Location
  selectedLocation?: string;
  onLocationChange?: (code: string, name: string) => void;

  // Price filter
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  minPrice?: number;
  maxPrice?: number;

  // Sort
  sortBy: SortValue;
  onSortChange: (sort: SortValue) => void;

  // Rating filter
  minRating: number;
  onRatingChange: (rating: number) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isMobileOpen,
  onClose,
  selectedLocation,
  onLocationChange,
  priceRange,
  onPriceChange,
  minPrice = 0,
  maxPrice = 10000000,
  sortBy,
  onSortChange,
  minRating,
  onRatingChange
}) => {
  const [isPriceExpanded, setIsPriceExpanded] = useState(true);
  const [isSortExpanded, setIsSortExpanded] = useState(true);
  const [isRatingExpanded, setIsRatingExpanded] = useState(true);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);

  // Local state cho input fields
  const [minInput, setMinInput] = useState(priceRange[0].toString());
  const [maxInput, setMaxInput] = useState(priceRange[1].toString());

  // Format currency VND
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} tr`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} k`;
    }
    return price.toString();
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value);
    const newRange: [number, number] = type === 'min'
      ? [value, Math.max(value, priceRange[1])]
      : [Math.min(value, priceRange[0]), value];

    onPriceChange(newRange);
    setMinInput(newRange[0].toString());
    setMaxInput(newRange[1].toString());
  };

  // Handle input change
  const handleInputChange = (value: string, type: 'min' | 'max') => {
    if (type === 'min') {
      setMinInput(value);
    } else {
      setMaxInput(value);
    }
  };

  // Handle input blur (apply changes)
  const handleInputBlur = (type: 'min' | 'max') => {
    const value = parseInt(type === 'min' ? minInput : maxInput) || 0;
    const clampedValue = Math.max(minPrice, Math.min(maxPrice, value));

    const newRange: [number, number] = type === 'min'
      ? [clampedValue, Math.max(clampedValue, priceRange[1])]
      : [Math.min(clampedValue, priceRange[0]), clampedValue];

    onPriceChange(newRange);
    setMinInput(newRange[0].toString());
    setMaxInput(newRange[1].toString());
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Bộ lọc
        </h3>
        {isMobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* LOCATION SELECTOR */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => setIsLocationExpanded(!isLocationExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Địa điểm
          </span>
          {isLocationExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isLocationExpanded && (
          <div className="space-y-4">
            <LocationSelector
              selectedCode={selectedLocation}
              onSelect={(code, name) => onLocationChange?.(code, name)}
              placeholder="Chọn tỉnh/thành phố"
              showIcon={false}
              selectClassName="bg-gray-50 border-2 border-transparent hover:border-gray-300 text-gray-900 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* SORT BY */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => setIsSortExpanded(!isSortExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            Sắp xếp theo
          </span>
          {isSortExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isSortExpanded && (
          <div className="space-y-2">
            {SORT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${sortBy === option.value
                  ? 'bg-orange-50 border-2 border-orange-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  } `}
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => onSortChange(e.target.value as SortValue)}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* PRICE RANGE */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => setIsPriceExpanded(!isPriceExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Giá
          </span>
          {isPriceExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isPriceExpanded && (
          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {formatPrice(priceRange[0])} VND
              </span>
              <span className="text-gray-400">—</span>
              <span className="text-gray-600">
                {priceRange[1] >= maxPrice ? `${formatPrice(maxPrice)} + VND` : `${formatPrice(priceRange[1])} VND`}
              </span>
            </div>

            {/* Dual Range Slider */}
            <div className="relative pt-2 pb-4">
              {/* Background track */}
              <div className="absolute h-2 w-full bg-gray-200 rounded-full" style={{ top: '50%', transform: 'translateY(-50%)' }} />

              {/* Active track */}
              <div
                className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                style={{
                  left: `${(priceRange[0] / maxPrice) * 100}% `,
                  right: `${100 - (priceRange[1] / maxPrice) * 100}% `,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />

              {/* Min slider */}
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step={100000}
                value={priceRange[0]}
                onChange={(e) => handleSliderChange(e, 'min')}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />

              {/* Max slider */}
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step={100000}
                value={priceRange[1]}
                onChange={(e) => handleSliderChange(e, 'max')}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Manual Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Từ (VND)</label>
                <input
                  type="number"
                  value={minInput}
                  onChange={(e) => handleInputChange(e.target.value, 'min')}
                  onBlur={() => handleInputBlur('min')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Đến (VND)</label>
                <input
                  type="number"
                  value={maxInput}
                  onChange={(e) => handleInputChange(e.target.value, 'max')}
                  onBlur={() => handleInputBlur('max')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={maxPrice.toString()}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RATING FILTER */}
      <div className="pb-6">
        <button
          onClick={() => setIsRatingExpanded(!isRatingExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            Đánh giá
          </span>
          {isRatingExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isRatingExpanded && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${minRating === rating
                  ? 'bg-orange-50 border-2 border-orange-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  } `}
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={minRating === rating}
                  onChange={(e) => onRatingChange(parseInt(e.target.value))}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'
                        } `}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">trở lên</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          onPriceChange([minPrice, maxPrice]);
          onSortChange('popular');
          onRatingChange(0);
          setMinInput(minPrice.toString());
          setMaxInput(maxPrice.toString());
        }}
        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-80 bg-white shadow-xl lg:shadow-none
          z-50 lg:z-0
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
          p-6
        `}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default FilterSidebar;