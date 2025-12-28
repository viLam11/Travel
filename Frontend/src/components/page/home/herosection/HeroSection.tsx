import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, ChevronDown, X, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../services/apiClient';
import bgImage from '../../../../assets/thumnail.png';

interface SearchFormData {
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string[];
}

interface Province {
  code: string;
  name: string;
  full_name: string;
}

const tripTypes = [
  { id: 'beach', label: 'Biển' },
  { id: 'mountain', label: 'Núi' },
  { id: 'city', label: 'Thành phố' },
  { id: 'culture', label: 'Văn hóa' },
  { id: 'adventure', label: 'Mạo hiểm' },
  { id: 'resort', label: 'Resort' }
];

const backgroundImages = [
  bgImage,
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=80', // Ha Long Bay
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&q=80', // Hoi An
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1920&q=80', // Hanoi
  'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=1920&q=80', // Beach
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SearchFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    tripType: []
  });

  // Slider states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Destination combobox states
  const [showDestinations, setShowDestinations] = useState(false);
  // Store all provinces fetched from API
  const [allProvinces, setAllProvinces] = useState<Province[]>([]);
  // Store filtered result locally
  const [filteredDestinations, setFilteredDestinations] = useState<Province[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Trip type dropdown state
  const [showTripTypes, setShowTripTypes] = useState(false);
  const tripTypeRef = useRef<HTMLDivElement>(null);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Click outside handler logic...
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ... (Keep existing outside click logic)
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (tripTypeRef.current && !tripTypeRef.current.contains(event.target as Node)) {
        setShowTripTypes(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch all provinces on first focus or mount (Optional: fetch on mount for faster UX)
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const fullList = await apiClient.provinces.getAll();
        setAllProvinces(fullList);
        setFilteredDestinations(fullList); // Initially show all
      } catch (error) {
        console.error("Failed to load provinces", error);
      }
    };
    fetchProvinces();
  }, []);


  // Slider controls...
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // CLIENT-SIDE FILTERING LOGIC
  const handleDestinationChange = (value: string) => {
    setFormData({ ...formData, destination: value });
    setSelectedProvinceCode(null);
    setShowDestinations(true);

    if (!value.trim()) {
      // If empty, show full list
      setFilteredDestinations(allProvinces);
    } else {
      // Filter locally
      const normalizedKeyword = value.toLowerCase();
      const filtered = allProvinces.filter(p =>
        p.name.toLowerCase().includes(normalizedKeyword) ||
        p.full_name.toLowerCase().includes(normalizedKeyword)
      );
      setFilteredDestinations(filtered);
    }
  };

  const handleDestinationFocus = () => {
    setShowDestinations(true);
    // Ensure we show full list or currently filtered list
    if (!formData.destination) {
      setFilteredDestinations(allProvinces);
    }
  };

  const selectDestination = (province: Province) => {
    setFormData({ ...formData, destination: province.full_name });
    setSelectedProvinceCode(province.code);
    setShowDestinations(false);
  };

  // Trip Type logic
  const toggleTripType = (typeId: string) => {
    const newTypes = formData.tripType.includes(typeId)
      ? formData.tripType.filter(t => t !== typeId)
      : [...formData.tripType, typeId];
    setFormData({ ...formData, tripType: newTypes });
  };

  const removeTripType = (typeId: string) => {
    setFormData({ ...formData, tripType: formData.tripType.filter(t => t !== typeId) });
  };

  // Search Action
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destination.trim()) {
      alert('Vui lòng nhập địa điểm');
      return;
    }

    // Build query params
    const queryParams = new URLSearchParams();

    // Nếu user chọn từ list -> dùng code, nếu không -> dùng keyword
    // Hiện tại filter page hỗ trợ keyword search
    if (formData.destination) queryParams.append('destination', formData.destination);
    if (selectedProvinceCode) queryParams.append('provinceCode', selectedProvinceCode);

    if (formData.startDate) queryParams.append('startDate', formData.startDate);
    if (formData.endDate) queryParams.append('endDate', formData.endDate);
    if (formData.tripType.length > 0) queryParams.append('types', formData.tripType.join(','));

    console.log('Navigating to destinations with:', queryParams.toString());
    navigate(`/destinations?${queryParams.toString()}`);
  };

  const formatDateRange = () => {
    if (!formData.startDate && !formData.endDate) return '';
    if (formData.startDate && formData.endDate) {
      return `${new Date(formData.startDate).toLocaleDateString('vi-VN')} - ${new Date(formData.endDate).toLocaleDateString('vi-VN')}`;
    }
    return formData.startDate ? new Date(formData.startDate).toLocaleDateString('vi-VN') : '';
  };

  const renderSelectedTripTypes = () => {
    const MAX_VISIBLE_TAGS = 2;
    const selectedTypes = formData.tripType
      .map(typeId => tripTypes.find(t => t.id === typeId))
      .filter((type): type is { id: string; label: string } => type !== undefined);

    if (selectedTypes.length === 0) {
      return (
        <>
          <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <span className="text-gray-400 text-sm sm:text-base pl-6">Tất cả</span>
        </>
      );
    }

    const visibleTags = selectedTypes.slice(0, MAX_VISIBLE_TAGS);
    const remainingCount = selectedTypes.length - MAX_VISIBLE_TAGS;

    return (
      <>
        <div className="flex sm:hidden items-center gap-2 overflow-x-auto scrollbar-hide max-w-full">
          {selectedTypes.map((type) => (
            <span
              key={type.id}
              className="inline-flex items-center bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-sm flex-shrink-0"
            >
              {type.label}
              <X
                className="ml-1 w-3 h-3 cursor-pointer hover:text-orange-900"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTripType(type.id);
                }}
              />
            </span>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1 pr-8 overflow-hidden max-w-[180px]">
          {visibleTags.map((type) => (
            <span
              key={type.id}
              className={`inline-flex items-center bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-sm flex-shrink-0 ${visibleTags.length > 1 ? 'max-w-[60px]' : ''
                }`}
            >
              <span className="truncate">{type.label}</span>
              <X
                className="ml-1 w-3 h-3 cursor-pointer hover:text-orange-900 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTripType(type.id);
                }}
              />
            </span>
          ))}

          {remainingCount > 0 && (
            <span className="inline-flex items-center bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-sm font-medium flex-shrink-0">
              +{remainingCount}
            </span>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="relative h-[400px] sm:h-[700px] overflow-visible pb-8 sm:pb-0">
      <div className="absolute inset-0 w-[90vw] rounded-b-[40px] mx-auto overflow-hidden pointer-events-none ">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-center bg-cover bg-no-repeat transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${image})`,
            }}
          />
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-[35%] lg:top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full transition-all hidden md:flex items-center justify-center pointer-events-auto"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-[35%] lg:top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full transition-all hidden md:flex items-center justify-center pointer-events-auto"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-auto">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <svg
          className="absolute block left-0 bottom-[-35px] w-full h-[80px] pointer-events-none"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 32C0 32 37 24 71 23C105 22 134 23 176 25C233 28 343 41 401 33C459 25 462 25 492 21C526 17 594 7 678 7C767 7 929 33 997 31C1004 31 1032 30 1052 28C1072 26 1103 22 1142 21C1157 20 1183 19 1213 19C1220 19 1245 20 1275 21C1305 22 1333 24 1358 25C1410 27 1440 25 1440 25V50H0V32Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center md:-mt-10 -mt-0 ">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
          Tận hưởng chuyến đi
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-white mb-6 sm:mb-8 lg:mb-10 drop-shadow max-w-2xl px-4">
          Trải nghiệm du lịch đầy màu sắc, khám phá mọi miền đất nước, tận hưởng kỳ nghỉ tại nơi bạn yêu thích
        </p>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 w-full max-w-4xl overflow-visible pt-5">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_auto] gap-2 sm:gap-3 overflow-visible items-end">

            <div className="relative overflow-visible" ref={destinationRef}>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block text-left">
                Địa điểm
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Chọn hoặc tìm địa điểm"
                  value={formData.destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={handleDestinationFocus}
                  className="w-full pl-9 pr-9 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all"
                />
                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-orange-500 transition-all duration-200 ${showDestinations ? 'rotate-180' : ''}`}
                  onClick={() => setShowDestinations(!showDestinations)}
                />
              </div>

              {showDestinations && filteredDestinations.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-45 overflow-y-auto">
                  {filteredDestinations.map((province) => (
                    <div
                      key={province.code}
                      onClick={() => selectDestination(province)}
                      className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer text-sm sm:text-base transition-colors text-left"
                    >
                      {province.full_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative overflow-visible" ref={datePickerRef}>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block text-left">
                Thời gian
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Chọn ngày đi - về"
                  value={formatDateRange()}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  readOnly
                  className="w-full pl-9 pr-9 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer hover:border-orange-400 transition-all"
                />
                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-orange-500 transition-all duration-200 ${showDatePicker ? 'rotate-180' : ''}`}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                />
              </div>

              {showDatePicker && (
                <div className="absolute z-[100] left-0 right-0 min-w-[auto] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1 text-left">Ngày đi</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1 text-left">Ngày về</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative overflow-visible" ref={tripTypeRef}>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block text-left">
                Loại hình
              </label>

              <div
                className={`relative border rounded-lg px-3 py-2.5 sm:py-3 cursor-pointer transition-all min-h-[42px] sm:min-h-[50px] flex items-center
                  ${showTripTypes
                    ? "border-transparent ring-2 ring-orange-500"
                    : "border-gray-300 hover:border-orange-400"}
                `}
                onClick={() => setShowTripTypes((prev) => !prev)}
              >
                {renderSelectedTripTypes()}

                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-all duration-200 ${showTripTypes ? 'rotate-180' : ''
                    }`}
                />
              </div>

              {showTripTypes && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-45 overflow-y-auto">
                  {tripTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center px-4 py-2.5 hover:bg-orange-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tripType.includes(type.id)}
                        onChange={() => toggleTripType(type.id)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mr-3"
                      />
                      <span className="text-sm sm:text-base">{type.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-colors h-[42px] sm:h-[50px] whitespace-nowrap text-sm sm:text-base mt-auto flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Tìm kiếm</span>
              <span className="sm:hidden">Tìm</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;