import React, { useState, useRef, useEffect } from 'react';
import { Bell, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/common/avatar/Avatar';
import { aiPlannerApi } from '@/api/aiPlannerApi';

// Định nghĩa cơ bản dựa trên API docs
interface NotificationInfo {
    id: number;
    senderName: string;
    senderAvatar?: string;
    message: string;
    targetUrl: string;
    isRead: boolean;
    createdAt: string;
}

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(1); // Giả lập có 1 thông báo
    const navRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Giả lập Dữ liệu Thông báo chưa đọc chờ ghép API thực
    const [notifications, setNotifications] = useState<NotificationInfo[]>([
        {
            id: 1,
            senderName: "Minh Khánh",
            message: "vừa mời bạn tham gia chỉnh sửa lịch trình đi Đà Lạt 4N3Đ.",
            targetUrl: "/my-plans?tab=shared",
            isRead: false,
            createdAt: new Date().toISOString(),
        }
    ]);

    useEffect(() => {
        // Fetch unread count from API (Supports mock/real)
        const fetchUnread = async () => {
            const count = await aiPlannerApi.getUnreadNotificationsCount();
            setUnreadCount(count);
        };
        fetchUnread();

        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleRead = (notif: NotificationInfo) => {
        // Mock đọc thông báo
        setNotifications(prev => 
            prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        setIsOpen(false);
        navigate(notif.targetUrl);
    };

    return (
        <div className="relative" ref={navRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                title="Thông báo"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => {
                                    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
                                    setUnreadCount(0);
                                }}
                                className="text-[10px] text-orange-500 font-bold uppercase hover:underline"
                            >
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-400 italic">
                                Bạn không có thông báo nào.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => handleRead(notif)}
                                    className={`p-4 flex gap-3 cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-50 last:border-0 ${notif.isRead ? 'opacity-60' : 'bg-orange-50/20'}`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar name={notif.senderName} size="md" />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white">
                                            <UserPlus className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] text-gray-800 leading-snug">
                                            <span className="font-bold text-gray-900">{notif.senderName}</span> {notif.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Vừa xong</p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
