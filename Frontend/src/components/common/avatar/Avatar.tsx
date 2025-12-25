import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  avatarUrl, 
  size = 'md',
  className = '' 
}) => {
  // Lấy chữ cái đầu của tên
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Tạo màu background ngẫu nhiên dựa trên tên
  const getColorFromName = (name: string): string => {
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* TODO: Uncomment khi có avatarUrl từ backend
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}>
          {initials}
        </div>
      )}
      */}
      
      {/* Temporary: Hiển thị initials */}
      <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}>
        {initials}
      </div>
    </div>
  );
};

export default Avatar;