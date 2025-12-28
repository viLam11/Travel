// src/components/layout/NavigationUser.tsx
import React, { useState } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Avatar from '@/components/common/avatar/Avatar';
import UserDropdownMenu from '@/components/common/UserDropdownMenu';

interface NavigationProps {
  onFilterClick?: () => void;
  onNavigateToDestinations?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  onFilterClick,
  onNavigateToDestinations
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/homepage');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer flex flex-row items-center"
            onClick={() => navigate('/homepage')}
          >
            <img src="/LOGO.png" alt="Logo" className="h-12" />
            <div className="font-bold text-xl sm:text-2xl text-[#eb662b]">Travello</div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm, hoạt động..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Mobile: Search + Filter/Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-orange-500"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (onFilterClick) {
                  onFilterClick();
                } else {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }
              }}
              className="p-2 text-gray-700 hover:text-orange-500"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => {
                if (onNavigateToDestinations) {
                  onNavigateToDestinations();
                } else {
                  navigate('/destinations');
                }
              }}
              className="text-sm lg:text-base text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap"
            >
              Địa điểm
            </button>
            <button
              onClick={() => toast('Tính năng đang phát triển')}
              className="text-sm lg:text-base text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap"
            >
              Hoạt động
            </button>
            <button
              onClick={() => toast('Tính năng đang phát triển')}
              className="text-sm lg:text-base text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap"
            >
              Bài viết
            </button>

            {isAuthenticated ? (
              <>
                {/* User Avatar + Name with Dropdown */}
                <UserDropdownMenu
                  isOpen={isUserDropdownOpen}
                  onClose={() => setIsUserDropdownOpen(false)}
                >
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors"
                  >
                    <Avatar
                      name={currentUser?.user?.name || 'User'}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser?.user?.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''
                      }`} />
                  </button>
                </UserDropdownMenu>

                {/* Admin Badge (nếu là admin) */}
                {currentUser?.user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 lg:px-6 py-2 rounded-full font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
                  >
                    Dashboard
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm lg:text-base text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 lg:px-6 py-2 rounded-full font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm, hoạt động..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && !onFilterClick && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <button
              onClick={() => navigate('/destinations')}
              className="block w-full text-left text-gray-700 hover:text-orange-500 font-medium transition-colors py-2"
            >
              Địa điểm
            </button>
            <button
              onClick={() => toast('Tính năng đang phát triển')}
              className="block w-full text-left text-gray-700 hover:text-orange-500 font-medium transition-colors py-2"
            >
              Hoạt động
            </button>
            <button
              onClick={() => toast('Tính năng đang phát triển')}
              className="block w-full text-left text-gray-700 hover:text-orange-500 font-medium transition-colors py-2"
            >
              Bài viết
            </button>

            {isAuthenticated ? (
              <>
                <div className="py-2 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Avatar name={currentUser?.user?.name || 'User'} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentUser?.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentUser?.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/user/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-orange-500 font-medium transition-colors py-2"
                >
                  Hồ sơ của tôi
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 font-medium transition-colors py-2"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="block w-full text-left text-gray-700 hover:text-orange-500 font-medium transition-colors py-2"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;