import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, ShoppingBag, Info, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/admin/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/admin/dropdown-menu";
import { aiPlannerApi } from '@/api/aiPlannerApi';
import { socketService } from '@/services/socketService';
import toast from 'react-hot-toast';
import { shouldUseMock } from '@/config/mockConfig';

// CẤU HÌNH MOCK
const LOCAL_MOCK_OVERRIDE: boolean | null = null;
const NOTIFICATION_MODE: 'MOCK' | 'SOCKET' = shouldUseMock(LOCAL_MOCK_OVERRIDE) ? 'MOCK' : 'SOCKET';

interface NotificationInfo {
    id: string | number;
    senderName: string;
    senderAvatar?: string;
    message: string;
    targetUrl: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
}

export const NotificationDropdown = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Helper: Map backend notification to frontend UI notification
    const mapBackendNoti = (noti: any): NotificationInfo => {
        const uRole = currentUser?.user?.role?.toLowerCase() || 'user';
        const isP = uRole === 'provider' || uRole.startsWith('provider_');
        const defaultChatUrl = uRole === 'admin' ? '/admin/messages' : (isP ? '/provider/messages' : '/user/messages');

        let url = (noti.targetUrl && noti.targetUrl !== '/') ? noti.targetUrl : '/';
        const type = noti.type?.toUpperCase();
        
        switch (type) {
            case 'PLAN_INVITATION':
                url = (noti.targetUrl && noti.targetUrl !== '/') ? noti.targetUrl : '/my-plans?tab=shared';
                break;
            case 'ORDER_ACCEPTED':
            case 'ORDER_CREATED':
            case 'ORDER_CANCELED':
            case 'NEW_ORDER':
                const defaultOrderUrl = uRole === 'admin' ? '/admin/bookings' : (isP ? '/provider/bookings' : '/user/bookings');
                url = (noti.targetUrl && noti.targetUrl !== '/') ? noti.targetUrl : defaultOrderUrl;
                break;
            case 'NEW_MESSAGE':
            case 'CHAT':
            case 'MESSAGE':
                url = (noti.targetUrl && noti.targetUrl !== '/') ? noti.targetUrl : defaultChatUrl;
                break;
            default:
                const content = (noti.content || '').toLowerCase();
                const title = (noti.title || '').toLowerCase();
                if (content.includes('tin nhắn') || content.includes('chat') || 
                    title.includes('tin nhắn') || title.includes('chat')) {
                    url = defaultChatUrl;
                }
                break;
        }

        return {
            id: noti.id,
            senderName: noti.creatorName || noti.title || "Hệ thống",
            senderAvatar: noti.creatorAvatar,
            message: noti.content || noti.title,
            targetUrl: url,
            isRead: noti.read || false,
            createdAt: noti.createdAt || new Date().toISOString(),
            type: type
        };
    };

    const fetchNotifications = async () => {
        try {
            if (NOTIFICATION_MODE === 'SOCKET') {
                const count = await aiPlannerApi.getUnreadNotificationsCount();
                setUnreadCount(count);

                const response = await aiPlannerApi.getUserNotifications(0, 10);
                if (response && response.content) {
                    const mappedList = response.content.map(mapBackendNoti);
                    setNotifications(mappedList);
                }
            } else {
                const uRole = currentUser?.user?.role?.toLowerCase() || 'user';
                const isP = uRole === 'provider' || uRole.startsWith('provider_');
                const defaultChatUrl = uRole === 'admin' ? '/admin/messages' : (isP ? '/provider/messages' : '/user/messages');

                setUnreadCount(2);
                setNotifications([{
                    id: 'mock-1',
                    senderName: 'Hệ thống Travollo',
                    message: 'Chào mừng bạn đến với trang quản trị hệ thống.',
                    targetUrl: '/',
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    type: 'INFO'
                },
                {
                    id: 'mock-chat',
                    senderName: 'Khách hàng',
                    message: 'Bạn có một tin nhắn mới từ khách hàng.',
                    targetUrl: defaultChatUrl,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    type: 'CHAT'
                }]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleNewIncomingNotification = (noti: any) => {
        const newNoti = mapBackendNoti(noti);
        
        setNotifications(prev => [newNoti, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        
        toast.success(
            <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <div>
                    <p className="font-bold text-xs">{newNoti.senderName}</p>
                    <p className="text-[10px] line-clamp-1">{newNoti.message}</p>
                </div>
            </div>,
            { duration: 4000, position: 'top-right' }
        );
    };

    useEffect(() => {
        fetchNotifications();

        let unsubscribe = () => {};

        if (NOTIFICATION_MODE === 'SOCKET') {
            unsubscribe = socketService.onNotification((noti) => {
                console.log('[NotificationDropdown] Received real-time notification:', noti);
                handleNewIncomingNotification(noti);
            });
        }

        return () => {
            unsubscribe();
        };
    }, []);

    const handleRead = async (notif: NotificationInfo) => {
        setNotifications(prev => 
            prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (NOTIFICATION_MODE === 'SOCKET') {
            try {
                await aiPlannerApi.markNotificationAsRead(notif.id.toString());
            } catch (e) {
                console.error("Failed to mark notification as read", e);
            }
        }

        setIsOpen(false);
        navigate(notif.targetUrl);
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        setUnreadCount(0);

        if (NOTIFICATION_MODE === 'SOCKET') {
            try {
                await aiPlannerApi.markAllNotificationsAsRead();
            } catch (e) {
                console.error("Failed to mark all as read", e);
            }
        }
    };

    const getIcon = (type?: string) => {
        switch(type) {
            case 'ORDER_ACCEPTED':
            case 'ORDER_CREATED':
            case 'NEW_ORDER': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'REPORT': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'CHAT':
            case 'MESSAGE':
            case 'NEW_MESSAGE': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'PLAN_INVITATION': return <UserPlus className="w-4 h-4 text-purple-500" />;
            default: return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] dark:bg-gray-900 dark:border-gray-800">
                <DropdownMenuLabel className="font-semibold text-base py-3 dark:text-white">Thông báo</DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-800" />
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-400 italic">Bạn không có thông báo nào.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem 
                                key={notification.id} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRead(notification);
                                }}
                                className={`flex items-start gap-3 p-3 cursor-pointer ${notification.isRead ? 'opacity-70 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800' : 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="space-y-1 w-full">
                                    <p className={`text-sm ${notification.isRead ? 'font-medium text-gray-700 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white'}`}>
                                        {notification.senderName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        {new Date(notification.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator className="dark:bg-gray-800" />
                <div className="p-2 text-center">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        className="text-blue-600 dark:text-blue-400 w-full text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
