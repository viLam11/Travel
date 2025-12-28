// src/components/common/UserDropdownMenu.tsx
import React, { useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Receipt,
  Heart,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import Avatar from '@/components/common/avatar/Avatar';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface UserDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // Button trigger
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ isOpen, onClose, children }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/homepage');
    onClose();
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: 'Chỉnh sửa hồ sơ',
      path: '/user/profile',
      color: 'text-gray-700',
    },
    {
      icon: Calendar,
      label: 'Đặt chỗ của tôi',
      path: '/user/bookings',
      color: 'text-gray-700',
    },
    {
      icon: Receipt,
      label: 'Danh sách giao dịch',
      path: '/user/transactions',
      color: 'text-gray-700',
    },
    {
      icon: Heart,
      label: 'Đã lưu',
      path: '/user/saved',
      color: 'text-gray-700',
    },
    { divider: true },
    {
      icon: Settings,
      label: 'Cài đặt',
      path: '/user/settings',
      color: 'text-gray-700',
      disabled: true,
    },
    {
      icon: Bell,
      label: 'Thông báo',
      path: '/user/notifications',
      color: 'text-gray-700',
      disabled: true,
    },
    { divider: true },
  ];

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {children}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.user?.name || 'User'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {currentUser.user?.name || 'User'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {currentUser.user?.email || 'No email'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={`divider-${index}`} className="my-1 border-t border-gray-100" />
                );
              }

              const Icon = item.icon!;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.disabled) {
                      toast('Tính năng đang phát triển');
                      onClose();
                    } else {
                      handleMenuClick(item.path!);
                    }
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs text-gray-400">Sớm có</span>
                  )}
                </button>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdownMenu;