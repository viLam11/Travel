// src/components/layouts/UserProfileLayout.tsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, Receipt, Heart, Settings, Bell, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const UserProfileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Chỉnh sửa hồ sơ',
      path: '/user/profile',
      icon: User,
    },
    {
      id: 'bookings',
      label: 'Đặt chỗ của tôi',
      path: '/user/bookings',
      icon: Calendar,
    },
    {
      id: 'transactions',
      label: 'Danh sách giao dịch',
      path: '/user/transactions',
      icon: Receipt,
    },
    {
      id: 'saved',
      label: 'Đã lưu',
      path: '/user/saved',
      icon: Heart,
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      path: '/user/settings',
      icon: Settings,
      disabled: true,
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      path: '/user/notifications',
      icon: Bell,
      disabled: true,
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.disabled) {
      toast('Tính năng đang phát triển');
    } else {
      navigate(item.path);
      setIsMobileSidebarOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] lg:h-auto
              w-72 bg-white rounded-lg shadow-sm p-6 space-y-2
              transform transition-transform duration-300 ease-in-out z-30
              ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0 lg:block
            `}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tài khoản của tôi</h2>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${active
                        ? 'bg-orange-50 text-orange-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.disabled && (
                      <span className="text-xs text-gray-400">Sớm có</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout;