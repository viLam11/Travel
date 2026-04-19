import { Bell, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
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

interface MockNotification {
    id: number;
    title: string;
    message: string;
    type: 'order' | 'report' | 'system' | 'chat';
    isRead: boolean;
    date: string;
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
    {
        id: 1,
        title: "Báo cáo đã được xử lý",
        message: "Cảm ơn bạn! Bình luận vi phạm mà bạn báo cáo đã được ban quản trị gỡ bỏ.",
        type: 'report',
        isRead: false,
        date: "Vừa xong"
    },
    {
        id: 2,
        title: "Đơn đặt Tour mới",
        message: "Bạn có một yêu cầu ghép đoàn mới từ khách hàng Nguyen Van A cho Tour Hạ Long.",
        type: 'order',
        isRead: false,
        date: "2 giờ trước"
    },
    {
        id: 3,
        title: "Duyệt Khách sạn Thành công",
        message: "Chúc mừng! Khách sạn Grand Hotel của bạn đã được Admin phê duyệt.",
        type: 'system',
        isRead: true,
        date: "1 ngày trước"
    },
    {
        id: 4,
        title: "Tin nhắn mới",
        message: "Khách hàng Nguyen Van A đã gửi tin nhắn hỏi về dịch vụ của bạn.",
        type: 'chat',
        isRead: false,
        date: "Vừa xong"
    }
];

export const NotificationDropdown = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch(type) {
            case 'order': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'report': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'chat': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    const handleNotificationClick = (notification: MockNotification) => {
        const type = notification.type?.toLowerCase();
        if (type === 'chat') {
            const role = currentUser?.user?.role || 'user';
            if (role === 'admin') {
                navigate('/admin/messages');
            } else if (role === 'provider') {
                navigate('/provider/messages');
            } else {
                navigate('/user/messages');
            }
        }
    };

    return (
        <DropdownMenu>
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
                    {MOCK_NOTIFICATIONS.map((notification) => (
                        <DropdownMenuItem 
                            key={notification.id} 
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex items-start gap-3 p-3 cursor-pointer ${notification.isRead ? 'opacity-70 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800' : 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30'}`}
                        >
                            <div className="mt-1 flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="space-y-1">
                                <p className={`text-sm ${notification.isRead ? 'font-medium text-gray-700 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white'}`}>
                                    {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    {notification.date}
                                </p>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>
                <DropdownMenuSeparator className="dark:bg-gray-800" />
                <div className="p-2 text-center">
                    <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 w-full text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 cursor-pointer">
                        Đánh dấu tất cả đã đọc
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
