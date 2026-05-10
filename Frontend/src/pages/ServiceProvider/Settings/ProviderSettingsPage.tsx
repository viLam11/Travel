import React, { useState, useEffect } from 'react';
import { Camera, Save, Lock, Eye, EyeOff, ShieldCheck, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/admin/avatar';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/admin/tabs';
import { Badge } from '@/components/ui/admin/badge';

const ProviderSettingsPage: React.FC = () => {
  const { currentUser, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form
  const [formData, setFormData] = useState({
    name: currentUser?.user?.name || '',
    email: currentUser?.user?.email || '',
    phone: currentUser?.user?.phoneNumber || '',
    address: currentUser?.user?.address || '',
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdStr = currentUser?.user?.userID || (currentUser?.user as any)?.id;
      if (!userIdStr) return;
      
      const userId = Number(userIdStr);
      if (isNaN(userId)) {
        console.error('Invalid user ID:', userIdStr);
        return;
      }

      setIsLoading(true);
      try {
        const userData = await apiClient.users.getById(userId);
        setFormData({
          name: userData.fullname || userData.name || '',
          email: userData.email || '',
          phone: userData.phone || userData.phoneNumber || '',
          address: userData.address || '',
        });
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser?.user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userIdStr = currentUser?.user?.userID || (currentUser?.user as any)?.id;
    if (!userIdStr) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }
    
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      toast.error('ID người dùng không hợp lệ');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.users.update(userId, {
        fullname: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      toast.success('Cập nhật hồ sơ thành công!');
      await checkAuth();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.auth.changePassword({ ...passwordData });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-8 mt-6 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt tài khoản</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin cá nhân và bảo mật tài khoản đối tác.
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border h-11 p-1 gap-1 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="cursor-pointer h-full px-5 gap-2 rounded-lg font-semibold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger 
            value="password" 
            className="cursor-pointer h-full px-5 gap-2 rounded-lg font-semibold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Bảo mật & Mật khẩu
          </TabsTrigger>
        </TabsList>

        <Card className="border border-border/40 rounded-xl shadow-sm overflow-hidden bg-card">
          <CardContent className="p-0">
            <TabsContent value="profile" className="m-0 focus-visible:ring-0">
              <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                {/* Profile Overview */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/20 rounded-xl border border-border/40">
                  <div className="relative">
                    <Avatar className="w-20 h-20 rounded-xl border-2 border-background shadow-sm">
                      <AvatarImage src={currentUser?.user?.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {currentUser?.user?.name?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-all cursor-pointer">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-center md:text-left space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">{currentUser?.user?.name}</h3>
                      <Badge variant="outline" className="w-fit mx-auto md:mx-0 text-[10px] font-bold uppercase tracking-tight bg-blue-50 text-blue-700 border-blue-100">
                        Đối tác hệ thống
                      </Badge>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-muted-foreground/70" /> {currentUser?.user?.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-muted-foreground/70" /> {formData.phone || 'Chưa cập nhật'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-muted-foreground/70" /> {formData.address || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Họ và tên</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        required
                        className="h-10 rounded-lg border-input bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Địa chỉ Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="h-10 rounded-lg bg-muted/50 cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold">Số điện thoại</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        className="h-10 rounded-lg border-input bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold">Địa chỉ</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleProfileChange}
                        className="h-10 rounded-lg border-input bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <Button
                      type="submit"
                      disabled={isSaving || isLoading}
                      className="h-10 px-6 rounded-lg font-bold"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="password" className="m-0 focus-visible:ring-0">
              <div className="p-6 md:p-8 max-w-xl mx-auto space-y-8 animate-in fade-in duration-300">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold">Thay đổi mật khẩu</h3>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật mật khẩu định kỳ để đảm bảo an toàn cho tài khoản.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword text-sm font-semibold">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="h-10 rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword text-sm font-semibold">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="h-10 rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword text-sm font-semibold">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="h-10 rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full h-10 rounded-lg font-bold"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      Cập nhật mật khẩu
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ProviderSettingsPage;
