// src/pages/User/Profile/UserBlogsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@/api/blogApi';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye,
  Heart,
  Globe,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/admin/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/admin/dropdown-menu';
import { Badge } from '@/components/ui/admin/badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { BlogStatus } from '@/types/blog.types';

const UserBlogsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const userId = currentUser?.user?.userID;

  // Fetch user blogs
  const { data, isLoading } = useQuery({
    queryKey: ['user-blogs', userId],
    queryFn: () => blogApi.getUserPosts(userId!),
    enabled: !!userId,
  });

  const blogs = data?.posts || [];

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: BlogStatus }) => 
      blogApi.updatePost(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blogs', userId] });
      toast.success('Đã cập nhật trạng thái bài viết');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blogs', userId] });
      toast.success('Đã xóa bài viết');
    }
  });

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: BlogStatus) => {
    switch (status) {
      case 'PUBLISHED': return <Globe className="w-3 h-3 mr-1" />;
      case 'DRAFT': return <Lock className="w-3 h-3 mr-1" />;
      case 'HIDDEN': return <Eye className="w-3 h-3 mr-1 opacity-50" />;
    }
  };

  const getStatusLabel = (status: BlogStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'Công khai';
      case 'DRAFT': return 'Bản nháp';
      case 'HIDDEN': return 'Bị ẩn';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-orange-500" />
            Bài viết của tôi
          </h1>
          <p className="text-sm text-gray-500 font-medium">Bạn đã đăng {blogs.length} bài viết trên cộng đồng</p>
        </div>
        <Button 
          onClick={() => navigate('/blog')} // Or wherever the "Create" page is
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-100 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Viết bài mới
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Tìm trong các bài viết của bạn..."
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-200 transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Đang tải danh sách bài viết...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
          <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-lg">Chưa có bài viết nào</p>
          <p className="text-sm text-gray-400 mt-1">Hãy chia sẻ những trải nghiệm du lịch thú vị của bạn nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBlogs.map((blog) => (
            <div 
              key={blog.id} 
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={blog.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200'} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-1 left-1">
                    <Badge className={`text-[9px] px-1.5 py-0 border-none ${
                      blog.status === 'PUBLISHED' ? 'bg-green-500' : 
                      blog.status === 'DRAFT' ? 'bg-gray-500' : 'bg-red-500'
                    }`}>
                      {getStatusIcon(blog.status)}
                      {getStatusLabel(blog.status)}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors cursor-pointer"
                      onClick={() => navigate(`/blog/${blog.id}`)}
                    >
                      {blog.title}
                    </h3>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/blog/${blog.id}`)}>
                          <Eye className="w-4 h-4 mr-2" /> Xem bài viết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        
                        {blog.status === 'PUBLISHED' ? (
                          <DropdownMenuItem 
                            className="cursor-pointer text-orange-600"
                            onClick={() => updateStatusMutation.mutate({ id: blog.id, status: 'DRAFT' })}
                          >
                            <Lock className="w-4 h-4 mr-2" /> Chuyển thành nháp
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="cursor-pointer text-green-600"
                            onClick={() => updateStatusMutation.mutate({ id: blog.id, status: 'PUBLISHED' })}
                          >
                            <Globe className="w-4 h-4 mr-2" /> Công khai bài viết
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                              deleteMutation.mutate(blog.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa bài viết
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                      <span>{blog.reactionCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>{blog.commentCount || 0}</span>
                    </div>
                    <span className="ml-auto">
                      {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBlogsPage;
