import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter
} from '@/components/ui/admin/dialog';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  Heart, 
  ExternalLink,
  Clock
} from 'lucide-react';
import type { BlogPost } from '@/types/blog.types';

interface AdminBlogDetailModalProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
}

const AdminBlogDetailModal: React.FC<AdminBlogDetailModalProps> = ({ post, isOpen, onClose }) => {

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tags = post.tags ? post.tags.split(',').filter(t => t.trim()) : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-2xl shadow-2xl">
        {/* Header with Background */}
        <div className="relative h-48 flex-shrink-0">
          <img 
            src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'} 
            className="w-full h-full object-cover" 
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{post.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-xs">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" /> {post.authorName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {Math.ceil(post.content.length / 500)} phút đọc
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-950">
          {/* Stats Bar */}
          <div className="flex items-center gap-4 mb-6 py-3 border-y border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
              <Heart className="w-4 h-4" /> {post.reactionCount} lượt thích
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-500">
              <MessageSquare className="w-4 h-4" /> {post.commentCount} bình luận
            </div>
            <div className="ml-auto flex gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] bg-orange-50 text-orange-600 hover:bg-orange-50">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* HTML Content */}
          <div 
            className="prose prose-sm max-w-none dark:prose-invert 
              prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-headings:text-gray-900 dark:prose-headings:text-gray-100"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Đóng
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            onClick={() => {
              onClose();
              window.open(`/blog/${post.id}`, '_blank');
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Xem trang công khai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBlogDetailModal;
