// src/pages/User/Profile/UserProfilePage.tsx
import React, { useState } from 'react';
import { Camera, Save, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/common/avatar/Avatar';
import toast from 'react-hot-toast';

const UserProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: currentUser?.user?.name || '',
    email: currentUser?.user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: 'Việt Nam',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update profile
    toast.success('Cập nhật hồ sơ thành công!');
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa hồ sơ</h1>
      
      {/* Avatar Section */}
      <div className="mb-8 flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
        <div className="relative">
          <Avatar 
            name={currentUser?.user?.name || 'User'} 
            size="xl"
          />
          {/* TODO: Uncomment khi implement upload avatar
          <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
          */}
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

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
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
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Lưu thay đổi</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;