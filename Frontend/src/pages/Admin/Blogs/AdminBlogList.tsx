import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/api/blogApi';
import { 
  Plus, 
  Search, 
  RefreshCw, 
} from 'lucide-react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import AdminBlogTable from '@/components/page/admin/blog/AdminBlogTable';
import toast from 'react-hot-toast';

const AdminBlogList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN' | 'DRAFT'>('ALL');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Fetch blogs
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-blogs', page, size, statusFilter],
    queryFn: () => blogApi.getAllPostsFullData(page, size),
  });

  const blogs = data?.posts || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Filter logic (Frontend side for now if API doesn't support complex filtering)
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         blog.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Đã cập nhật danh sách');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Bài viết (Blog)</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và kiểm duyệt nội dung cộng đồng từ người dùng.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isFetching}
            className="cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          {/* Admin might also want to create official blogs */}
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Tạo bài viết mới
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {(['ALL', 'PUBLISHED', 'HIDDEN', 'DRAFT'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <AdminBlogTable 
          blogs={filteredBlogs} 
          isLoading={isLoading} 
          total={total}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default AdminBlogList;
