import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../services/apiClient';
import bgImage from '../../../../assets/thumnail.png';

interface SearchFormData {
  destination: string;
  startDate: string;
  endDate: string;
  serviceType: 'DESTINATION' | 'HOTEL'; // Changed from tripType array to single serviceType
}

interface Province {
  code: string;
  name: string;
  full_name: string;
}

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
    serviceType: 'DESTINATION' // Default to destinations
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

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Click outside handler logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
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

        // Ensure fullList is an array
        if (Array.isArray(fullList) && fullList.length > 0) {
          setAllProvinces(fullList);
          setFilteredDestinations(fullList); // Initially show all
        } else {
          // Mock data fallback
          const mockProvinces = [
            { code: '01', name: 'Hà Nội', full_name: 'Thành phố Hà Nội', codeName: 'ha_noi' },
            { code: '79', name: 'Hồ Chí Minh', full_name: 'Thành phố Hồ Chí Minh', codeName: 'ho_chi_minh' },
            { code: '48', name: 'Đà Nẵng', full_name: 'Thành phố Đà Nẵng', codeName: 'da_nang' },
            { code: '46', name: 'Huế', full_name: 'Thành phố Huế', codeName: 'hue' },
            { code: '22', name: 'Quảng Ninh', full_name: 'Tỉnh Quảng Ninh', codeName: 'quang_ninh' },
            { code: '56', name: 'Khánh Hòa', full_name: 'Tỉnh Khánh Hòa', codeName: 'khanh_hoa' },
            { code: '68', name: 'Lâm Đồng', full_name: 'Tỉnh Lâm Đồng', codeName: 'lam_dong' },
            { code: '91', name: 'An Giang', full_name: 'Tỉnh An Giang', codeName: 'an_giang' },
          ];
          setAllProvinces(mockProvinces as any);
          setFilteredDestinations(mockProvinces as any);
        }
      } catch (error) {
        console.error("Failed to load provinces:", error);
        // Mock data fallback on error
        const mockProvinces = [
          { code: '01', name: 'Hà Nội', full_name: 'Thành phố Hà Nội', codeName: 'ha_noi' },
          { code: '79', name: 'Hồ Chí Minh', full_name: 'Thành phố Hồ Chí Minh', codeName: 'ho_chi_minh' },
          { code: '48', name: 'Đà Nẵng', full_name: 'Thành phố Đà Nẵng', codeName: 'da_nang' },
        ];
        setAllProvinces(mockProvinces as any);
        setFilteredDestinations(mockProvinces as any);
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

    // Safety check: ensure allProvinces is an array
    if (!Array.isArray(allProvinces)) {
      setFilteredDestinations([]);
      return;
    }

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
    if (!formData.destination && Array.isArray(allProvinces)) {
      setFilteredDestinations(allProvinces);
    }
  };

  const selectDestination = (province: Province) => {
    setFormData({ ...formData, destination: province.full_name });
    setSelectedProvinceCode(province.code);
    setShowDestinations(false);
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

    // Destination
    if (formData.destination) queryParams.append('destination', formData.destination);
    if (selectedProvinceCode) queryParams.append('provinceCode', selectedProvinceCode);

    // Dates (for future booking feature)
    if (formData.startDate) queryParams.append('startDate', formData.startDate);
    if (formData.endDate) queryParams.append('endDate', formData.endDate);

    // Service Type
    queryParams.append('serviceType', formData.serviceType);

    // Navigate based on service type
    const basePath = formData.serviceType === 'HOTEL' ? '/hotels' : '/destinations';
    console.log(`Navigating to ${basePath} with:`, queryParams.toString());
    navigate(`${basePath}?${queryParams.toString()}`);
  };

  const formatDateRange = () => {
    if (!formData.startDate && !formData.endDate) return '';
    if (formData.startDate && formData.endDate) {
      return `${new Date(formData.startDate).toLocaleDateString('vi-VN')} - ${new Date(formData.endDate).toLocaleDateString('vi-VN')}`;
    }
    return formData.startDate ? new Date(formData.startDate).toLocaleDateString('vi-VN') : '';
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

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 lg:p-6 w-full max-w-5xl overflow-visible">

          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr_auto] gap-2 sm:gap-3 overflow-visible items-end">

            {/* Service Type Select */}
            <div className="relative">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block text-left">
                Loại dịch vụ
              </label>
              <div className="relative">
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as 'DESTINATION' | 'HOTEL' })}
                  className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="DESTINATION">Địa điểm</option>
                  <option value="HOTEL">Khách sạn</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

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
                {formData.serviceType === 'HOTEL' ? 'Check-in - Check-out' : 'Thời gian'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={formData.serviceType === 'HOTEL' ? 'Chọn ngày nhận - trả phòng' : 'Chọn ngày đi - về'}
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
                      <label className="text-xs font-medium text-gray-600 block mb-1 text-left">
                        {formData.serviceType === 'HOTEL' ? 'Check-in' : 'Ngày đi'}
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1 text-left">
                        {formData.serviceType === 'HOTEL' ? 'Check-out' : 'Ngày về'}
                      </label>
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