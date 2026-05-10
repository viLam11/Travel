import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CalendarCheck, Star, Info, CheckCheck, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/admin/button';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/admin/tabs';
import { Badge } from '@/components/ui/admin/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';

type NotificationType = 'booking' | 'review' | 'system' | 'alert' | string;

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const ProviderNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.notifications.getAll(0, 50);
      
      // Parse the response based on generic API response shapes
      const dataList = Array.isArray(response) ? response : (response as any).content || (response as any).data || [];
      
      const formattedData: Notification[] = dataList.map((n: any) => ({
        id: n.id?.toString() || Math.random().toString(),
        type: (n.type || 'system').toLowerCase(),
        title: n.title || 'Thông báo hệ thống',
        message: n.message || n.content || n.body || '',
        time: n.createdAt || n.time || n.date || 'Gần đây',
        isRead: n.isRead !== undefined ? n.isRead : (n.read !== undefined ? n.read : false),
      }));

      setNotifications(formattedData);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      toast.error('Không thể tải danh sách thông báo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.notifications.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    try {
      await apiClient.notifications.markAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'booking') return n.type.includes('booking') || n.type.includes('order');
    if (activeTab === 'review') return n.type.includes('review') || n.type.includes('comment');
    if (activeTab === 'system') return !n.type.includes('booking') && !n.type.includes('order') && !n.type.includes('review') && !n.type.includes('comment');
    return true;
  });

  const getIcon = (type: NotificationType) => {
    if (type.includes('booking') || type.includes('order')) return <CalendarCheck className="w-5 h-5 text-blue-500" />;
    if (type.includes('review') || type.includes('comment')) return <Star className="w-5 h-5 text-yellow-500" />;
    if (type.includes('alert')) return <AlertCircle className="w-5 h-5 text-rose-500" />;
    return <Info className="w-5 h-5 text-indigo-500" />;
  };

  const getIconBackground = (type: NotificationType) => {
    if (type.includes('booking') || type.includes('order')) return 'bg-blue-50';
    if (type.includes('review') || type.includes('comment')) return 'bg-yellow-50';
    if (type.includes('alert')) return 'bg-rose-50';
    return 'bg-indigo-50';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8 mt-6 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Thông báo
            {unreadCount > 0 && !isLoading && (
              <Badge className="bg-rose-500 text-white border-transparent hover:bg-rose-600">
                {unreadCount} mới
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông báo đơn đặt, đánh giá và cập nhật từ hệ thống.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isLoading}
          className="shrink-0 bg-white hover:bg-gray-50"
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* Tabs and Content */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <TabsList className="bg-transparent border-0 h-10 w-full justify-start gap-1 p-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg font-medium px-4 cursor-pointer"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger 
              value="booking" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-lg font-medium px-4 cursor-pointer"
            >
              Đơn đặt
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none rounded-lg font-medium px-4 cursor-pointer"
            >
              Đánh giá
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-lg font-medium px-4 cursor-pointer"
            >
              Hệ thống
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="border border-border/40 rounded-xl shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0 min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-gray-500">Đang tải thông báo...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Không có thông báo nào</h3>
                <p className="text-sm text-gray-500">
                  Bạn đã xem hết tất cả thông báo trong mục này.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={cn(
                      "flex items-start gap-4 p-5 transition-colors cursor-pointer hover:bg-gray-50",
                      !notification.isRead ? "bg-primary/5" : "bg-white"
                    )}
                  >
                    <div className={cn(
                      "shrink-0 p-3 rounded-full mt-1",
                      getIconBackground(notification.type)
                    )}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn(
                          "text-sm font-semibold truncate",
                          !notification.isRead ? "text-gray-900" : "text-gray-700"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center shrink-0 gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          {notification.time}
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-sm leading-relaxed",
                        !notification.isRead ? "text-gray-800 font-medium" : "text-gray-500"
                      )}>
                        {notification.message}
                      </p>
                    </div>

                    {!notification.isRead ? (
                      <div className="shrink-0 w-2.5 h-2.5 bg-primary rounded-full mt-2.5 shadow-sm" />
                    ) : (
                      <div className="shrink-0 mt-2.5 text-gray-300" title="Đã đọc">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ProviderNotificationsPage;
