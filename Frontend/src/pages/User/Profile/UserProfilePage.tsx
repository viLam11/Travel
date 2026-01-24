// src/pages/User/Profile/UserProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/common/avatar/Avatar';
import toast from 'react-hot-toast';
import apiClient from '@/services/apiClient';

const UserProfilePage: React.FC = () => {
  const { currentUser, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.user?.name || '',
    email: currentUser?.user?.email || '',
    phone: currentUser?.user?.phoneNumber || '',
    dateOfBirth: '',
    gender: '',
    address: currentUser?.user?.address || '',
    city: '',
    country: 'Việt Nam',
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.user?.userID) return;

      setIsLoading(true);
      try {
        const userData = await apiClient.users.getById(currentUser.user.userID);
        setFormData({
          name: userData.fullname || userData.name || '',
          email: userData.email || '',
          phone: userData.phone || userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || 'Việt Nam',
        });
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser?.user?.userID]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.user?.userID) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.users.update(currentUser.user.userID, {
        fullname: formData.name,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        city: formData.city,
        country: formData.country,
      });

      toast.success('Cập nhật hồ sơ thành công!');

      // Update auth context
      await checkAuth();

      setIsEditing(false); // Switch back to view mode
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <span>Chỉnh sửa thông tin</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
              <p className="font-medium text-gray-900">{formData.name || 'Chưa cập nhật'}</p>
            </div>
            <div className="p-4 border-b border-gray-200 md:border-b-0">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>
            <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
              <p className="font-medium text-gray-900">{formData.phone || 'Chưa cập nhật'}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">Ngày sinh</p>
              <p className="font-medium text-gray-900">
                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </p>
            </div>
            <div className="p-4 border-t md:border-r border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Giới tính</p>
              <p className="font-medium text-gray-900">
                {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : formData.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Địa chỉ */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
              <p className="font-medium text-gray-900">{formData.address || 'Chưa cập nhật'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Thành phố</p>
                <p className="font-medium text-gray-900">{formData.city || 'Chưa cập nhật'}</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">Quốc gia</p>
                <p className="font-medium text-gray-900">{formData.country || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>

      {/* Avatar Section */}
      <div className="mb-8 flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
        <div className="relative">
          <Avatar
            name={currentUser?.user?.name || 'User'}
            size="xl"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{currentUser?.user?.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{currentUser?.user?.email}</p>
          <button className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
            <Camera className="w-4 h-4" />
            <span>Thay đổi ảnh đại diện</span>
          </button>
          <p className="text-xs text-gray-400 mt-1">* Tính năng đang phát triển</p>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="TP. Hồ Chí Minh"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : renderViewMode()}
    </div>
  );
};

export default UserProfilePage;