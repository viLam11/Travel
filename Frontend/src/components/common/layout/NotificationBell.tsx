import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, UserPlus, ShoppingBag, Info, MessageSquare, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/common/avatar/Avatar';
import { aiPlannerApi } from '@/api/aiPlannerApi';
import { socketService } from '@/services/socketService';
import toast from 'react-hot-toast';
import { shouldUseMock } from '@/config/mockConfig';
import { useAuth } from '@/hooks/useAuth';

interface NotificationInfo {
    id: string | number;
    senderName: string;
    senderAvatar?: string;
    message: string;
    targetUrl: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
    referenceInvitationID?: string;
    // Local UI state
    handledStatus?: 'ACCEPTED' | 'DENIED';
}

const LOCAL_MOCK_OVERRIDE: boolean | null = null;
const NOTIFICATION_MODE: 'MOCK' | 'SOCKET' = shouldUseMock(LOCAL_MOCK_OVERRIDE) ? 'MOCK' : 'SOCKET';

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { currentUser } = useAuth();
    const navRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // notif id being processed

    const mapBackendNoti = useCallback((noti: any): NotificationInfo => {
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
            case 'NEW_ORDER': {
                const defaultOrderUrl = uRole === 'admin' ? '/admin/bookings' : (isP ? '/provider/bookings' : '/user/bookings');
                url = (noti.targetUrl && noti.targetUrl !== '/') ? noti.targetUrl : defaultOrderUrl;
                break;
            }
            case 'NEW_MESSAGE':
            case 'CHAT':
            case 'MESSAGE':
                url = (noti.targetUrl && noti.targetUrl !== '/') ? noti.targetUrl : defaultChatUrl;
                break;
            default: {
                const content = (noti.content || '').toLowerCase();
                const title = (noti.title || '').toLowerCase();
                if (content.includes('tin nhắn') || content.includes('chat') ||
                    title.includes('tin nhắn') || title.includes('chat')) {
                    url = defaultChatUrl;
                }
                break;
            }
        }

        return {
            id: noti.id,
            senderName: noti.creatorName || noti.title || "Hệ thống",
            senderAvatar: noti.creatorAvatar,
            message: noti.content || noti.title,
            targetUrl: url,
            isRead: noti.read || false,
            createdAt: noti.createdAt || new Date().toISOString(),
            type,
            referenceInvitationID: noti.referenceInvitationID,
        };
    }, [currentUser]);

    const fetchNotifications = useCallback(async () => {
        try {
            if (NOTIFICATION_MODE === 'SOCKET') {
                const count = await aiPlannerApi.getUnreadNotificationsCount();
                setUnreadCount(count);
                const response = await aiPlannerApi.getUserNotifications(0, 10);
                if (response && response.content) {
                    setNotifications(response.content.map(mapBackendNoti));
                }
            } else {
                const uRole = currentUser?.user?.role?.toLowerCase() || 'user';
                const isP = uRole === 'provider' || uRole.startsWith('provider_');
                const defaultChatUrl = uRole === 'admin' ? '/admin/messages' : (isP ? '/provider/messages' : '/user/messages');
                setUnreadCount(1);
                setNotifications([
                    {
                        id: 'mock-init',
                        senderName: 'Hệ thống Travollo',
                        message: 'Chào mừng bạn đến với phiên bản thử nghiệm.',
                        targetUrl: '/',
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        type: 'INFO',
                    },
                    {
                        id: 'mock-chat',
                        senderName: 'Hỗ trợ khách hàng',
                        message: 'Bạn có một tin nhắn mới từ bộ phận chăm sóc.',
                        targetUrl: defaultChatUrl,
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        type: 'CHAT',
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [currentUser, mapBackendNoti]);

    // Mount effect: fetch once + subscribe socket (NOT tied to isOpen)
    useEffect(() => {
        fetchNotifications();

        let unsubscribeNoti = () => {};

        if (NOTIFICATION_MODE === 'SOCKET') {
            unsubscribeNoti = socketService.onNotification((noti) => {
                console.log('[NotificationBell] Real-time notification:', noti);
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
            });
        }

        return () => {
            unsubscribeNoti();
        };
    }, [fetchNotifications, mapBackendNoti]);

    // Separate effect: click-outside listener (tied to isOpen)
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const handleRead = async (notif: NotificationInfo, shouldNavigate = true) => {
        // Optimistic: mark as read locally
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
        if (shouldNavigate) {
            navigate(notif.targetUrl);
        }
    };

    const handleCollabAction = async (notif: NotificationInfo, status: 'ACCEPTED' | 'DENIED') => {
        if (!notif.referenceInvitationID || actionLoading) return;

        setActionLoading(notif.id.toString());
        try {
            await aiPlannerApi.handleInvitation(notif.referenceInvitationID.toString(), status);

            // Mark as read optimistically — buttons disappear, notification stays visible
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (NOTIFICATION_MODE === 'SOCKET') {
                try {
                    await aiPlannerApi.markNotificationAsRead(notif.id.toString());
                } catch (_) { /* swallow */ }
            }

            toast.success(status === 'ACCEPTED' ? '✓ Đã chấp nhận lời mời!' : '✗ Đã từ chối lời mời!');
            setIsOpen(false);

            if (status === 'ACCEPTED') {
                navigate('/my-plans?tab=shared');
            } else if (window.location.pathname.includes('/my-plans')) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Lỗi khi xử lý lời mời cộng tác:", error);
            toast.error("Không thể thực hiện thao tác này. Vui lòng thử lại.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
        switch (type) {
            case 'PLAN_INVITATION': return <UserPlus className="w-3 h-3" />;
            case 'ORDER_ACCEPTED':
            case 'ORDER_CREATED':
            case 'NEW_ORDER': return <ShoppingBag className="w-3 h-3" />;
            case 'CHAT':
            case 'MESSAGE':
            case 'NEW_MESSAGE': return <MessageSquare className="w-3 h-3" />;
            default: return <Info className="w-3 h-3" />;
        }
    };

    const getIconBg = (type?: string) => {
        switch (type) {
            case 'PLAN_INVITATION': return 'bg-blue-500';
            case 'ORDER_ACCEPTED': return 'bg-green-500';
            case 'ORDER_CREATED': return 'bg-orange-500';
            case 'NEW_ORDER': return 'bg-purple-500';
            case 'CHAT':
            case 'MESSAGE':
            case 'NEW_MESSAGE': return 'bg-blue-400';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="relative" ref={navRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors cursor-pointer"
                title="Thông báo"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-white rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] text-orange-500 font-bold uppercase hover:underline cursor-pointer"
                            >
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400 italic">Bạn không có thông báo nào.</p>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const isThisLoading = actionLoading === notif.id.toString();
                                const isPendingInvitation = notif.type === 'PLAN_INVITATION' && !notif.isRead && notif.referenceInvitationID;

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => {
                                            if (isPendingInvitation) return; // buttons handle the action
                                            handleRead(notif);
                                        }}
                                        className={`p-4 flex gap-3 cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-50 last:border-0 ${notif.isRead ? 'opacity-60 bg-white' : 'bg-orange-50/20'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar name={notif.senderName} avatarUrl={notif.senderAvatar} size="md" />
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getIconBg(notif.type)} text-white rounded-full flex items-center justify-center border-2 border-white`}>
                                                {getIcon(notif.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-gray-800 leading-snug">
                                                <span className="font-bold text-gray-900">{notif.senderName}</span> {notif.message}
                                            </p>

                                            {isPendingInvitation && (
                                                <div
                                                    className="flex gap-2 mt-2 mb-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        disabled={isThisLoading}
                                                        className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                                                        onClick={() => handleCollabAction(notif, 'ACCEPTED')}
                                                    >
                                                        {isThisLoading ? (
                                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Check className="w-3 h-3" />
                                                        )}
                                                        Đồng ý
                                                    </button>
                                                    <button
                                                        disabled={isThisLoading}
                                                        className="flex items-center gap-1 px-3 py-1 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                                                        onClick={() => handleCollabAction(notif, 'DENIED')}
                                                    >
                                                        {isThisLoading ? (
                                                            <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <X className="w-3 h-3" />
                                                        )}
                                                        Từ chối
                                                    </button>
                                                </div>
                                            )}

                                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                                {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/30 text-center">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/user/notifications');
                            }}
                            className="text-[11px] text-gray-500 hover:text-orange-500 font-semibold"
                        >
                            Xem tất cả thông báo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
