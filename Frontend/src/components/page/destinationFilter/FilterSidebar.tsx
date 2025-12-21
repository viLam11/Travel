// src/components/destinations/FilterSidebar.tsx
import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface FilterSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isMobileOpen, onClose }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('all');

  const categories = [
    'Địa điểm',
    'Ẩm thực',
    'Hoạt động',
    'Khách sạn - Resort',
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="bg-orange-500 text-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-3">Chọn thời gian du lịch</h3>
        <div className="flex items-center gap-2 bg-white text-gray-900 px-3 py-2.5 rounded-md">
          <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-sm">5 Tháng 2 - 20 Tháng 3</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Danh mục</h3>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-orange-500 transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
        <button className="text-sm text-orange-500 font-medium mt-3 hover:text-orange-600 transition-colors">
          Xem thêm
        </button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Chọn theo giá</h3>
        <div className="space-y-2.5">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'under-500k', label: 'Dưới 500.000đ' },
            { value: '500k-1m', label: '500.000đ - 1.000.000đ' },
            { value: 'over-1m', label: 'Trên 1.000.000đ' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="priceRange"
                value={option.value}
                checked={priceRange === option.value}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-orange-500 transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time/Duration */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Thời gian</h3>
        <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white cursor-pointer">
          <option>Nổi bật</option>
          <option>1-2 ngày</option>
          <option>3-5 ngày</option>
          <option>Trên 5 ngày</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Xếp hạng</h3>
        <div className="flex items-center gap-1 text-yellow-500">
          <span>★★★★★</span>
          <span className="text-sm text-gray-600 ml-1">và cao hơn</span>
        </div>
      </div>

      {/* Review */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Review</h3>
        <p className="text-sm text-gray-600">Tất cả đánh giá</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed width bên trái */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 bg-white">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          ></div>
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto lg:hidden">
            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              {sidebarContent}
              
              {/* Apply Button */}
              <button 
                onClick={onClose}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FilterSidebar;