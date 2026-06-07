import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, UserPlus, ShoppingBag, MessageSquare, Info, Heart, MessageCircle,
    Check, X, CheckCheck, Loader2, Inbox,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiPlannerApi } from '@/api/aiPlannerApi';
import Avatar from '@/components/common/avatar/Avatar';
import Footer from '@/components/common/layout/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationItem {
    id: string;
    type: string;
    senderName: string;
    senderAvatar?: string;
    message: string;
    targetUrl: string;
    isRead: boolean;
    createdAt: string;
    referenceInvitationID?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    PLAN_INVITATION: 'Lời mời lịch trình',
    ORDER_ACCEPTED: 'Đặt chỗ',
    ORDER_CREATED: 'Đặt chỗ',
    ORDER_CANCELED: 'Đặt chỗ',
    NEW_ORDER: 'Đặt chỗ',
    CHAT: 'Tin nhắn',
    MESSAGE: 'Tin nhắn',
    NEW_MESSAGE: 'Tin nhắn',
    BLOG_LIKE: 'Blog',
    BLOG_COMMENT: 'Blog',
};

const FILTER_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'PLAN_INVITATION', label: 'Lời mời' },
    { key: 'ORDER', label: 'Đặt chỗ' },
    { key: 'CHAT', label: 'Tin nhắn' },
];

function getTypeGroup(type: string): string {
    if (['ORDER_ACCEPTED', 'ORDER_CREATED', 'ORDER_CANCELED', 'NEW_ORDER'].includes(type)) return 'ORDER';
    if (['CHAT', 'MESSAGE', 'NEW_MESSAGE'].includes(type)) return 'CHAT';
    return type;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} giờ trước`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} ngày trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
    const icons: Record<string, React.ReactNode> = {
        PLAN_INVITATION: <UserPlus className="w-4 h-4" />,
        ORDER_ACCEPTED: <ShoppingBag className="w-4 h-4" />,
        ORDER_CREATED: <ShoppingBag className="w-4 h-4" />,
        ORDER_CANCELED: <ShoppingBag className="w-4 h-4" />,
        NEW_ORDER: <ShoppingBag className="w-4 h-4" />,
        CHAT: <MessageSquare className="w-4 h-4" />,
        MESSAGE: <MessageSquare className="w-4 h-4" />,
        NEW_MESSAGE: <MessageSquare className="w-4 h-4" />,
        BLOG_LIKE: <Heart className="w-4 h-4" />,
        BLOG_COMMENT: <MessageCircle className="w-4 h-4" />,
    };
    const colors: Record<string, string> = {
        PLAN_INVITATION: 'bg-blue-500',
        ORDER_ACCEPTED: 'bg-green-500',
        ORDER_CREATED: 'bg-orange-500',
        ORDER_CANCELED: 'bg-red-400',
        NEW_ORDER: 'bg-purple-500',
        CHAT: 'bg-blue-400',
        MESSAGE: 'bg-blue-400',
        NEW_MESSAGE: 'bg-blue-400',
        BLOG_LIKE: 'bg-rose-500',
        BLOG_COMMENT: 'bg-amber-500',
    };
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${colors[type] || 'bg-gray-400'}`}>
            {icons[type] || <Info className="w-4 h-4" />}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const UserNotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const PAGE_SIZE = 20;

    const mapNoti = useCallback((n: any): NotificationItem => {
        const type = (n.type || 'INFO').toUpperCase();
        let targetUrl = n.targetUrl || '/';
        if (type === 'PLAN_INVITATION' && (!targetUrl || targetUrl === '/')) targetUrl = '/my-plans?tab=shared';
        return {
            id: n.id?.toString() || '',
            type,
            senderName: n.creatorName || n.title || 'Hệ thống',
            senderAvatar: n.creatorAvatar,
            message: n.content || n.message || n.title || '',
            targetUrl,
            isRead: n.read ?? n.isRead ?? false,
            createdAt: n.createdAt || new Date().toISOString(),
            referenceInvitationID: n.referenceInvitationID,
        };
    }, []);

    const fetchPage = useCallback(async (pageNum: number, reset = false) => {
        if (reset) setLoading(true); else setLoadingMore(true);
        try {
            const res = await aiPlannerApi.getUserNotifications(pageNum, PAGE_SIZE);
            const items: NotificationItem[] = (res?.content || []).map(mapNoti);
            setNotifications(prev => reset ? items : [...prev, ...items]);
            setHasMore(items.length === PAGE_SIZE);
            setPage(pageNum);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [mapNoti]);

    useEffect(() => {
        fetchPage(0, true);
    }, [fetchPage]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filtered = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !n.isRead;
        return getTypeGroup(n.type) === activeTab || n.type === activeTab;
    });

    const handleRead = async (notif: NotificationItem) => {
        if (!notif.isRead) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            try { await aiPlannerApi.markNotificationAsRead(notif.id); } catch (_) { /* swallow */ }
        }
        if (notif.targetUrl && notif.targetUrl !== '/') {
            navigate(notif.targetUrl);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await aiPlannerApi.markAllNotificationsAsRead();
            toast.success('Đã đánh dấu tất cả đã đọc');
        } catch (_) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleCollabAction = async (notif: NotificationItem, status: 'ACCEPTED' | 'DENIED') => {
        if (!notif.referenceInvitationID || actionLoading) return;
        setActionLoading(notif.id);
        try {
            await aiPlannerApi.handleInvitation(notif.referenceInvitationID, status);

            // Mark as read — buttons disappear, row stays
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
            );
            try { await aiPlannerApi.markNotificationAsRead(notif.id); } catch (_) { /* swallow */ }

            toast.success(status === 'ACCEPTED' ? '✓ Đã chấp nhận lời mời!' : '✗ Đã từ chối lời mời!');

            if (status === 'ACCEPTED') navigate('/my-plans?tab=shared');
        } catch (err) {
            console.error(err);
            toast.error('Không thể thực hiện thao tác này. Vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-lg leading-tight">Thông báo</h1>
                            {unreadCount > 0 && (
                                <p className="text-xs text-orange-500 font-medium">{unreadCount} chưa đọc</p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                            <CheckCheck className="w-3.5 h-3.5" /> Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="max-w-3xl mx-auto px-4 pb-0 flex gap-1 overflow-x-auto scrollbar-hide">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-4">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Không có thông báo</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {activeTab === 'unread' ? 'Bạn đã đọc hết rồi!' : 'Chưa có thông báo nào trong mục này.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(notif => {
                            const isPendingInvitation = notif.type === 'PLAN_INVITATION'
                                && !notif.isRead
                                && !!notif.referenceInvitationID;
                            const isThisLoading = actionLoading === notif.id;

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => !isPendingInvitation && handleRead(notif)}
                                    className={`bg-white rounded-2xl p-4 flex gap-3 border transition-all ${notif.isRead
                                        ? 'border-gray-100 opacity-75 cursor-pointer hover:opacity-100 hover:border-gray-200'
                                        : 'border-orange-100 bg-orange-50/30 cursor-pointer hover:border-orange-200'
                                        } ${isPendingInvitation ? 'cursor-default' : ''}`}
                                >
                                    {/* Avatar + icon */}
                                    <div className="relative shrink-0 mt-0.5">
                                        <Avatar name={notif.senderName} avatarUrl={notif.senderAvatar} size="md" />
                                        <div className="absolute -bottom-1 -right-1">
                                            <NotifIcon type={notif.type} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                                <span className="font-bold">{notif.senderName}</span>{' '}
                                                {notif.message}
                                            </p>
                                            {!notif.isRead && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-1" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {formatTime(notif.createdAt)}
                                            </span>
                                            {TYPE_LABELS[notif.type] && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                                                    {TYPE_LABELS[notif.type]}
                                                </span>
                                            )}
                                        </div>

                                        {/* Invitation action buttons */}
                                        {isPendingInvitation && (
                                            <div
                                                className="flex gap-2 mt-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    disabled={isThisLoading}
                                                    onClick={() => handleCollabAction(notif, 'ACCEPTED')}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors"
                                                >
                                                    {isThisLoading
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Check className="w-3.5 h-3.5" />
                                                    }
                                                    Chấp nhận
                                                </button>
                                                <button
                                                    disabled={isThisLoading}
                                                    onClick={() => handleCollabAction(notif, 'DENIED')}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 text-xs font-semibold rounded-xl transition-colors"
                                                >
                                                    {isThisLoading
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <X className="w-3.5 h-3.5" />
                                                    }
                                                    Từ chối
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Load more */}
                        {hasMore && (
                            <div className="pt-2 text-center">
                                <button
                                    onClick={() => fetchPage(page + 1)}
                                    disabled={loadingMore}
                                    className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                                        </span>
                                    ) : 'Xem thêm'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default UserNotificationsPage;
