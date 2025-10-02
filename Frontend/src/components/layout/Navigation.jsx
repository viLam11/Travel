// src/components/layout/Navigation.jsx
import React from 'react';
import { Search } from 'lucide-react';

const Navigation = ({ isLoggedIn }) => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4V17c0 4.52-3.03 8.77-7 10.12V4.18z"/>
              <path d="M12 6L6 9v6c0 3.31 2.12 6.36 5 7.41V6z" opacity="0.7"/>
            </svg>
            <span className="text-xl font-bold text-gray-800">viatours</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm, hoạt động..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Địa điểm
            </a>
            <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Hoạt động
            </a>
            <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Bài viết
            </a>

            {isLoggedIn ? (
              <>
                <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Đăng xuất
                </a>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                  Người dùng
                </button>
              </>
            ) : (
              <>
                <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Đăng ký
                </a>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;