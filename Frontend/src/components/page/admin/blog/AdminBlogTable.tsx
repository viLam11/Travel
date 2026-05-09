import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Slash, 
  CheckCircle2, 
  MessageSquare, 
  Heart,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/admin/dropdown-menu';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Skeleton } from '@/components/ui/admin/skeleton';
import type { BlogPost, BlogStatus } from '@/types/blog.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@/api/blogApi';
import toast from 'react-hot-toast';
import AdminBlogDetailModal from './AdminBlogDetailModal';

interface AdminBlogTableProps {
  blogs: BlogPost[];
  isLoading: boolean;
  total: number;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const AdminBlogTable: React.FC<AdminBlogTableProps> = ({ 
  blogs, 
  isLoading, 
  total,
  page,
  setPage,
  totalPages
}) => {
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: BlogStatus }) => 
      blogApi.updatePost(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Đã cập nhật trạng thái bài viết');
    },
    onError: () => toast.error('Không thể cập nhật trạng thái')
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Đã xóa bài viết thành công');
    },
    onError: () => toast.error('Lỗi khi xóa bài viết')
  });

  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Công khai</Badge>;
      case 'HIDDEN':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Bị ẩn</Badge>;
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Bản nháp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium text-lg">Không tìm thấy bài viết nào</p>
        <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Bài viết</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Tác giả</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Ngày đăng</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-center">Tương tác</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={blog.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=100'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[250px]" title={blog.title}>
                        {blog.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {blog.content.replace(/<[^>]*>/g, '').slice(0, 60)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                      {blog.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{blog.authorName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(blog.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1" title="Lượt thích">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="text-xs">{blog.reactionCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Bình luận">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-xs">{blog.commentCount || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(blog.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedPost(blog)}>
                        <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {blog.status === 'PUBLISHED' ? (
                        <DropdownMenuItem 
                          className="cursor-pointer text-orange-600"
                          onClick={() => updateStatusMutation.mutate({ id: blog.id, status: 'HIDDEN' })}
                        >
                          <Slash className="w-4 h-4 mr-2" /> Ẩn bài viết
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="cursor-pointer text-green-600"
                          onClick={() => updateStatusMutation.mutate({ id: blog.id, status: 'PUBLISHED' })}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Hiện bài viết
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600"
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?')) {
                            deleteMutation.mutate(blog.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh viễn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-500">Hiển thị {blogs.length} trên tổng số {total} bài viết</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="cursor-pointer h-8 text-xs"
          >
            Trước
          </Button>
          <div className="flex items-center px-3 text-xs font-medium">
            Trang {page + 1} / {totalPages}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="cursor-pointer h-8 text-xs"
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <AdminBlogDetailModal 
          post={selectedPost} 
          isOpen={!!selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  );
};

export default AdminBlogTable;
