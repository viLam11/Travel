import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useAuthCheck } from '@/hooks/useAuthCheck';

interface FavoriteButtonProps {
  serviceId: string | number;
  initialIsFavorite?: boolean;
  className?: string;
  iconClassName?: string;
  onToggle?: (isFav: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  serviceId,
  initialIsFavorite = false,
  className = "",
  iconClassName = "",
  onToggle
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthCheck();

  // If initialIsFavorite changes from parent, sync it
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    requireAuth(async () => {
      if (isLoading) return;
      
      const newStatus = !isFavorite;
      setIsFavorite(newStatus); // Optimistic UI
      setIsLoading(true);

      try {
        if (newStatus) {
          await apiClient.favorites.add(serviceId);
          toast.success('Đã lưu vào danh sách yêu thích');
        } else {
          await apiClient.favorites.remove(serviceId);
          toast.success('Đã xóa khỏi danh sách yêu thích');
        }
        if (onToggle) onToggle(newStatus);
      } catch (error) {
        setIsFavorite(!newStatus); // Revert on failure
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      } finally {
        setIsLoading(false);
      }
    }, 'Vui lòng đăng nhập để lưu yêu thích');
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group/heart transition-all active:scale-90 cursor-pointer disabled:opacity-70 ${className}`}
      title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart
        className={`transition-all duration-300 ${
          isFavorite 
            ? 'fill-orange-500 text-orange-500 scale-110' 
            : 'text-orange-500 group-hover/heart:scale-110'
        } ${iconClassName}`}
      />
    </button>
  );
};

export default FavoriteButton;
