// src/components/common/UserDropdownMenu.tsx
import React, { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Receipt,
  Heart,
  Settings,
  Bell,
  LogOut,
  Compass,
  MessageCircle,
  BellOff
} from 'lucide-react';
import Avatar from '@/components/common/avatar/Avatar';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { chatApi } from '@/api/chatApi';
import { socketService } from '@/services/socketService';

interface UserDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // Button trigger
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ isOpen, onClose, children }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // Trạng thái bật/tắt thông báo
  const [notifyEnabled, setNotifyEnabled] = useState(() => {
    return localStorage.getItem('chat_notify_enabled') !== 'false';
  });

  const handleToggleNotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !notifyEnabled;
    setNotifyEnabled(newValue);
    localStorage.setItem('chat_notify_enabled', String(newValue));
    if (newValue) {
      toast.success('Đã bật thông báo tin nhắn!', { 
        icon: <Bell className="w-5 h-5 text-orange-500" /> 
      });
    } else {
      toast.success('Đã tắt thông báo tin nhắn!', { 
        icon: <BellOff className="w-5 h-5 text-gray-400" /> 
      });
    }
  };

  // Function to refresh unread count
  const fetchUnreadCount = () => {
    if (currentUser?.user?.userID) {
      chatApi.getConversations(currentUser.user.userID.toString(), 'user')
        .then(data => {
          const count = data.reduce((acc, current) => acc + (current.unreadCount || 0), 0);
          setUnreadMsgCount(count);
        })
        .catch(e => console.error("Failed to fetch conversations for unread count", e));
    }
  };

  // Lấy tin nhắn chưa đọc khi mở dropdown 
  useEffect(() => {
    if (isOpen) {
      fetchUnreadCount();
    }
  }, [isOpen, currentUser]);

  // Nghe sự kiện đánh dấu đã đọc từ các trang khác
  useEffect(() => {
    const handleReadUpdated = () => {
      fetchUnreadCount();
    };

    window.addEventListener('chat_read_updated', handleReadUpdated);
    
    // Gọi ngay 1 lần lúc component mount để khởi tạo số lượng tin nhắn chưa đọc 
    // Mặc dù menu chưa mở nhưng icon badge có thể vẫn cần hiển thị (nếu có red dot nhỏ outside, dù hiện tại dropdown mới có số 1)
    // Tùy thiết kế, nhưng ở đây có badge trong menu
    fetchUnreadCount();

    return () => {
      window.removeEventListener('chat_read_updated', handleReadUpdated);
    };
  }, [currentUser]);

  // Bổ sung lắng nghe Socket Real-time (Để vừa có tin nhắn là tự 'nảy' số đỏ mà KO CẦN GỌI LẠI TRÊN API)
  useEffect(() => {
    // Nếu đang tắt thông báo thì không cần canh me cập nhật số
    if (!notifyEnabled) return;

    const unsubscribe = socketService.onMessage((msg) => {
      const currentUserId = currentUser?.user?.userID?.toString();
      // Nếu có tin nhắn mới tới và không phải là tin do chính mình nhắn ra thì tăng số lượng chưa đọc + 1
      if (msg.senderId !== currentUserId) {
        setUnreadMsgCount(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [notifyEnabled, currentUser]);

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
      icon: Compass,
      label: 'Chuyến đi của tôi',
      path: '/my-plans',
      color: 'text-gray-700',
    },
    {
      icon: Calendar,
      label: 'Đặt chỗ của tôi',
      path: '/user/bookings',
      color: 'text-gray-700',
    },
    {
      icon: MessageCircle,
      label: 'Tin nhắn',
      path: '/user/messages',
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
      icon: notifyEnabled ? Bell : BellOff,
      label: 'Thông báo tin nhắn',
      color: notifyEnabled ? 'text-orange-500' : 'text-gray-400',
      isToggle: true,
    },
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

              if ((item as any).isToggle) {
                return (
                  <button
                    key="toggle-notify"
                    onClick={handleToggleNotify}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm text-gray-700 flex-1 text-left">{item.label}</span>
                    
                    {/* Switch / Toggle UI */}
                    <div className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${notifyEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
                      <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${notifyEnabled ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                );
              }

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
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                  
                  <div className="ml-auto flex items-center">
                    {item.path === '/user/messages' && unreadMsgCount > 0 && notifyEnabled && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center min-w-[20px] h-[20px]">
                        {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                      </span>
                    )}
                    {item.disabled && (
                      <span className="text-xs text-gray-400">Sớm có</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600 cursor-pointer"
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