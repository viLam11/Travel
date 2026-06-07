import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Footer from '../../../components/common/layout/Footer';
import DestinationCard from '../../../components/common/DestinationCard';
import { MapPin, Calendar, Users, Star, Globe, Loader2 } from 'lucide-react';
import apiClient from '@/services/apiClient';

const MAX_PRICE = 10_000_000;
const STALE_MS = 5 * 60 * 1000;

const formatVND = (value: number): string =>
  value > 0 ? value.toLocaleString('vi-VN') : '';

const parseVND = (str: string): number =>
  parseInt(str.replace(/\./g, '').replace(/[^\d]/g, '')) || 0;

// "Địa điểm" (TICKET_VENUE) is the primary type for this destinations page.
// Hotels have their own /hotels route; showing them here is secondary.
const CATEGORY_TYPE_MAP: Record<string, string | undefined> = {
  'Địa điểm': 'TICKET_VENUE',
  'Tour': 'TOUR',
  'Khách sạn': 'HOTEL',
  'Nhà hàng': 'RESTAURANT',
  'Tất cả': undefined,
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col sm:flex-row animate-pulse h-44">
    <div className="w-full sm:w-[40%] bg-gray-200 flex-shrink-0" />
    <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-9 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

const ServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Địa điểm');

  // Slider UI state — updates instantly on drag
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState(formatVND(MAX_PRICE));

  // Debounced price range — query key only updates 400ms after user stops dragging
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>([0, MAX_PRICE]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(priceRange), 400);
    return () => clearTimeout(t);
  }, [priceRange]);

  const destinationName = 'Hồ Chí Minh';
  const categories = Object.keys(CATEGORY_TYPE_MAP);

  // ─── TanStack Query ──────────────────────────────────────────────────────────
  // queryKey encodes all filter params — cache hit = instant result, no network call
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['services', 'filter', selectedCategory, debouncedPrice],
    queryFn: ({ signal }) =>
      apiClient.services.filterByLocation({
        serviceType: CATEGORY_TYPE_MAP[selectedCategory],
        minPrice: debouncedPrice[0] > 0 ? debouncedPrice[0] : undefined,
        maxPrice: debouncedPrice[1] < MAX_PRICE ? debouncedPrice[1] : undefined,
        page: 0,
        size: 12,
        signal, // TanStack passes AbortSignal automatically
      }),
    placeholderData: keepPreviousData, // show old results while fetching new ones
    staleTime: STALE_MS,              // same params within 5 min = no network call
  });

  const destinations = data?.services ?? [];
  const totalItems = data?.totalElements ?? destinations.length;

  // ─── Price input handlers ────────────────────────────────────────────────────
  const applyMinInput = () => {
    const v = Math.max(0, Math.min(MAX_PRICE, parseVND(minInput)));
    const newRange: [number, number] = [v, Math.max(v, priceRange[1])];
    setPriceRange(newRange);
    setMinInput(v > 0 ? formatVND(v) : '');
    setMaxInput(formatVND(newRange[1]));
  };

  const applyMaxInput = () => {
    const v = Math.max(0, Math.min(MAX_PRICE, parseVND(maxInput)));
    const newRange: [number, number] = [Math.min(priceRange[0], v), v];
    setPriceRange(newRange);
    setMinInput(newRange[0] > 0 ? formatVND(newRange[0]) : '');
    setMaxInput(formatVND(v));
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value.replace(/\./g, '').replace(/[^\d]/g, '')) || 0;
    setMinInput(num > 0 ? num.toLocaleString('vi-VN') : '');
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value.replace(/\./g, '').replace(/[^\d]/g, '')) || 0;
    setMaxInput(num > 0 ? num.toLocaleString('vi-VN') : '');
  };

  const handleSliderMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    const newRange: [number, number] = [v, Math.max(v, priceRange[1])];
    setPriceRange(newRange);
    setMinInput(v > 0 ? formatVND(v) : '');
    setMaxInput(formatVND(newRange[1]));
  };

  const handleSliderMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    const newRange: [number, number] = [Math.min(priceRange[0], v), v];
    setPriceRange(newRange);
    setMinInput(newRange[0] > 0 ? formatVND(newRange[0]) : '');
    setMaxInput(formatVND(v));
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const handleCardClick = (item: any) => {
    const titleSlug = (item.serviceName || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const provinceCode = item.province?.code || 'vietnam';
    const typeSlug = (item.serviceType || '').toUpperCase() === 'HOTEL' ? 'hotel' : 'ticket';
    const idSlug = `${item.id}-${titleSlug}`;
    const url = typeSlug === 'hotel'
      ? `/hotels/vietnam/${provinceCode}/${idSlug}`
      : `/destinations/vietnam/${provinceCode}/${typeSlug}/${idSlug}`;
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">{destinationName}</h1>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Địa điểm</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={destinationName}
                    readOnly
                    className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Thời gian</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    defaultValue="February 05 - March 14"
                    readOnly
                    className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => refetch()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium mt-auto"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Khoảng giá (VND)</label>
                <span className="text-xs text-orange-500 font-medium">
                  {priceRange[0] > 0 || priceRange[1] < MAX_PRICE
                    ? `${formatVND(priceRange[0]) || '0'} ₫ — ${formatVND(priceRange[1])} ₫`
                    : `Tất cả mức giá (tối đa ${formatVND(MAX_PRICE)} ₫)`}
                </span>
              </div>

              {/* Dual Range Slider */}
              <div className="relative h-6 mb-3">
                <div className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full bg-gray-200 rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                  style={{
                    left: `${(priceRange[0] / MAX_PRICE) * 100}%`,
                    right: `${100 - (priceRange[1] / MAX_PRICE) * 100}%`,
                  }}
                />
                <input
                  type="range" min={0} max={MAX_PRICE} step={100000}
                  value={priceRange[0]}
                  onChange={handleSliderMin}
                  className="absolute w-full h-1.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                />
                <input
                  type="range" min={0} max={MAX_PRICE} step={100000}
                  value={priceRange[1]}
                  onChange={handleSliderMax}
                  className="absolute w-full h-1.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>

              {/* Manual Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Từ</label>
                  <input
                    type="text" inputMode="numeric"
                    value={minInput}
                    onChange={handleMinInputChange}
                    onBlur={applyMinInput}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Đến</label>
                  <input
                    type="text" inputMode="numeric"
                    value={maxInput}
                    onChange={handleMaxInputChange}
                    onBlur={applyMaxInput}
                    placeholder={formatVND(MAX_PRICE)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
                <span>0 ₫</span>
                <span>{formatVND(MAX_PRICE)} ₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Địa điểm nổi bật</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1.5">
              {isFetching && !isLoading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
              )}
              {isLoading ? 'Đang tải...' : `${totalItems} kết quả tại ${destinationName}`}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid — skeleton only on first load; old data stays visible while refetching */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : destinations.length === 0
            ? (
              <div className="col-span-full text-center py-20 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-600">Không tìm thấy dịch vụ</p>
                <p className="text-sm mt-1">Thử điều chỉnh bộ lọc giá hoặc chọn danh mục khác</p>
              </div>
            )
            : destinations.map((item) => {
              const rawPrice = item.minPrice || item.averagePrice || item.price || 0;
              return (
                <DestinationCard
                  key={item.id}
                  destination={{
                    id: item.id?.toString() || '',
                    title: item.serviceName,
                    location: item.province?.full_name || item.province?.fullName || item.address || 'Việt Nam',
                    rating: item.rating?.toString() || '0',
                    reviews: item.reviewCount?.toString() || '0',
                    price: rawPrice > 0 ? rawPrice.toLocaleString('vi-VN') + ' ₫' : 'Miễn phí',
                    image: item.thumbnailUrl || '',
                  }}
                  onBook={() => handleCardClick(item)}
                  onClick={() => handleCardClick(item)}
                />
              );
            })
          }
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">932M</p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">24M</p>
            <p className="text-sm text-gray-600 mt-1">Total Destinations</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">10M</p>
            <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">65M</p>
            <p className="text-sm text-gray-600 mt-1">Total Activities</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicePage;
