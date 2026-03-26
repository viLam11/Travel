// src/pages/User/Blog/BlogListPage.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenSquare,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  Tag,
  ChevronRight,
  Loader2,
  Heart,
} from 'lucide-react';
import Footer from '@/components/common/layout/Footer';
import BlogCard from '@/components/page/blog/BlogCard';
import { blogStore } from '@/components/page/blog/blogMockData';
import type { BlogFilterTab } from '@/types/blog.types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const POPULAR_TAGS = [
  'Đà Lạt', 'Sapa', 'Đà Nẵng', 'Phú Quốc', 'Hội An', 'Hà Giang'
];

const POSTS_PER_PAGE = 5; // Load 5 posts per batch

const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Filter States
  const [activeTab, setActiveTab] = useState<BlogFilterTab>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Infinite Scroll States
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const allPosts = blogStore.getAllPosts();

  const filteredPosts = useMemo(() => {
    let posts = [...allPosts];

    // Tab filter
    if (activeTab === 'popular') {
      posts = posts.sort((a, b) => b.likes - a.likes);
    } else if (activeTab === 'latest') {
      posts = posts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Tag filter
    if (selectedTag) {
      posts = posts.filter((p) => p.tags.includes(selectedTag));
    }

    // Search
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.summary.toLowerCase().includes(kw) ||
          p.tags.some((t) => t.toLowerCase().includes(kw)) ||
          p.author.name.toLowerCase().includes(kw)
      );
    }

    return posts;
  }, [allPosts, activeTab, searchKeyword, selectedTag]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchKeyword, selectedTag]);

  // Calculate posts to display based on current page
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, page * POSTS_PER_PAGE);
  }, [filteredPosts, page]);

  const hasMore = displayedPosts.length < filteredPosts.length;

  // Intersection Observer to trigger load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate latency for a professional feel
          setTimeout(() => {
            setPage((prev) => prev + 1);
            setIsLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để viết bài');
      navigate('/login');
      return;
    }
    navigate('/blog/create');
  };

  const featuredPosts = allPosts.slice(0, 2);
  const tabs: { id: BlogFilterTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất cả', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'latest', label: 'Mới nhất', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'popular', label: 'Phổ biến', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${[200, 150, 100, 250, 180, 120][i]}px`,
                height: `${[200, 150, 100, 250, 180, 120][i]}px`,
                top: `${[10, 50, 70, 20, 60, 0][i]}%`,
                left: `${[5, 30, 60, 80, 10, 90][i]}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            Cộng đồng du lịch Travello
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Nhật ký du lịch
          </h1>
          <p className="text-lg text-white/85 mb-8 max-w-xl mx-auto">
            Chia sẻ những chuyến đi, lưu giữ kỷ niệm và truyền cảm hứng cho cộng đồng
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm bài viết, địa điểm, tác giả..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white shadow-lg text-gray-800 text-sm outline-none focus:ring-2 focus:ring-orange-300 placeholder-gray-400"
            />
          </div>

          {/* Create Post CTA */}
          <button
            onClick={handleCreatePost}
            className="inline-flex items-center gap-2 bg-white text-orange-500 font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <PenSquare className="w-5 h-5" />
            Viết bài du lịch
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left / Main Feed ── */}
          <main className="flex-1 min-w-0">
            {/* Featured Posts */}
            {!searchKeyword && !selectedTag && activeTab === 'all' && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Bài viết nổi bật
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-600 border border-orange-200"
                >
                  <Tag className="w-3.5 h-3.5" />
                  #{selectedTag}
                  <span className="ml-1 hover:text-orange-800">✕</span>
                </button>
              )}
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Không tìm thấy bài viết
                </h3>
                <p className="text-sm text-gray-400">Thử thay đổi từ khóa hoặc bộ lọc</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Infinite Scroll Loader */}
                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="flex justify-center items-center py-6 w-full"
                  >
                    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-full shadow-sm text-sm font-semibold text-orange-500 border border-orange-100">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tải thêm...
                    </div>
                  </div>
                )}
                
                {/* End of Feed message */}
                {!hasMore && displayedPosts.length > 5 && (
                  <div className="text-center py-8 text-gray-400 text-sm font-medium">
                    Bạn đã xem hết bài viết. Hãy quay lại sau nhé! ✨
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ── Right Sidebar ── */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Write Post CTA */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-lg mb-0.5 relative z-10">Chia sẻ góc nhìn</h3>
              <p className="text-white/85 text-xs mb-3 relative z-10">
                Truyền cảm hứng cho cộng đồng Travello
              </p>
              <button
                onClick={handleCreatePost}
                className="w-full bg-white text-orange-500 font-semibold py-2 rounded-xl hover:bg-orange-50 hover:shadow-lg transition-all flex items-center justify-center gap-2 relative z-10 text-sm"
              >
                <PenSquare className="w-4 h-4" />
                Viết bài ngay
              </button>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-[15px]">
                <Tag className="w-4 h-4 text-orange-500" />
                Tags phổ biến
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2 text-[15px]">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Bài viết được yêu thích
              </h3>
              <div className="space-y-1.5">
                {allPosts
                  .sort((a, b) => b.likes - a.likes)
                  .slice(0, 3)
                  .map((post, i) => (
                    <button
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.id}`)}
                      className="cursor-pointer w-full flex items-start gap-2.5 text-left hover:bg-orange-50 p-1.5 rounded-xl transition-colors group"
                    >
                      <span className="text-xl font-black text-orange-100 group-hover:text-orange-200 transition-colors w-5 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500 fill-current" />
                          {post.likes} lượt thích
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors mt-0.5 flex-shrink-0" />
                    </button>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Show footer only when user reaches the very end of the infinite scroll */}
      {!hasMore && (
        <div className="mt-8 transition-opacity duration-500 ease-in-opacity">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
