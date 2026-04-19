import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenSquare,
  Search,
  TrendingUp,
  Clock,
  Tag,
  ChevronRight,
  Loader2,
  Flame,
  Users,
  Layers,
  AlertTriangle,
  SearchX,
  CheckCircle2,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Footer from '@/components/common/layout/Footer';
import BlogCard from '@/components/page/blog/BlogCard';
import { blogApi } from '@/api/blogApi';
import type { BlogFilterTab, BlogPost } from '@/types/blog.types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const POPULAR_TAGS = ['Đà Lạt', 'Sapa', 'Đà Nẵng', 'Phú Quốc', 'Hội An', 'Hà Giang', 'Mũi Né', 'Ninh Bình'];
const POSTS_PER_PAGE = 5;

// ── Sidebar Featured Post Item ────────────────────────────────────────────────
interface FeaturedItemProps {
  post: BlogPost;
  rank: number;
  onClick: () => void;
}

const RANK_COLORS = [
  'from-orange-500 to-amber-400',
  'from-gray-700 to-gray-500',
  'from-orange-300 to-amber-300',
  'from-gray-300 to-gray-200',
  'from-gray-300 to-gray-200',
];

const FeaturedItemSidebar: React.FC<FeaturedItemProps> = ({ post, rank, onClick }) => {
  const thumbnail =
    post.thumbnailUrl ||
    (post as any).coverImage ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';
  const likes = post.reactionCount ?? post.likeCount ?? (post as any).likes ?? 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition-all group text-left"
    >
      {/* Rank Badge */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${RANK_COLORS[rank - 1] || RANK_COLORS[4]} flex items-center justify-center text-white font-black text-xs shadow-sm`}
      >
        {rank}
      </div>

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden">
        <img src={thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
          {post.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-0.5">
            <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
            <span>{likes.toLocaleString()}</span>
          </span>
          {post.commentCount > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageCircle className="w-2.5 h-2.5" />
              <span>{post.commentCount}</span>
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
    </button>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<BlogFilterTab>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const loaderRef = useRef<HTMLDivElement>(null);

  // ── Main Feed Query ──────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['blogs', activeTab, searchKeyword, selectedTag],
    queryFn: async ({ pageParam = 0 }) => {
      if (searchKeyword || selectedTag) {
        return blogApi.searchPosts({
          keyword: searchKeyword || selectedTag || '',
          page: pageParam,
          size: POSTS_PER_PAGE,
          sortBy: activeTab === 'popular' ? 'reactionCount' : 'createdAt',
        });
      }
      return blogApi.getAllPostsFullData(pageParam, POSTS_PER_PAGE);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page + 1 < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    },
    initialPageParam: 0,
  });

  // ── Featured / Trending Query (Sidebar) ────────────────────────────────
  const { data: featuredData } = useQuery({
    queryKey: ['blogs-featured'],
    queryFn: () =>
      blogApi.searchPosts({ sortBy: 'reactionCount', page: 0, size: 5 }),
    staleTime: 1000 * 60 * 5,
  });

  const allPosts = useMemo(() => data?.pages.flatMap((p) => p.posts) || [], [data]);
  const featuredPosts = useMemo(() => {
    if (featuredData?.posts.length) return featuredData.posts.slice(0, 3);
    return [...allPosts].sort((a, b) => (b.reactionCount ?? 0) - (a.reactionCount ?? 0)).slice(0, 3);
  }, [featuredData, allPosts]);

  // ── Infinite Scroll Observer ─────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để viết bài');
      navigate('/login');
      return;
    }
    navigate('/blog/create');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
  };

  const tabs: { id: BlogFilterTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all',     label: 'Tất cả',  icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'latest',  label: 'Mới nhất', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'popular', label: 'Phổ biến', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          {[
            { size: 280, top: -10, left: -5 },
            { size: 180, top: 40, left: 25 },
            { size: 120, top: 60, left: 65 },
            { size: 320, top: 10, left: 75 },
            { size: 200, top: 55, left: 85 },
          ].map((c, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: c.size,
                height: c.size,
                top: `${c.top}%`,
                left: `${c.left}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm">
            <Users className="w-4 h-4" />
            Cộng đồng du lịch Travello
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight drop-shadow">
            Nhật ký du lịch
          </h1>
          <p className="text-base text-white/85 mb-7 max-w-lg mx-auto leading-relaxed">
            Chia sẻ những chuyến đi, lưu giữ kỷ niệm và truyền cảm hứng cho cộng đồng
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm bài viết, địa điểm, tác giả..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white shadow-xl text-gray-800 text-sm outline-none focus:ring-2 focus:ring-orange-200 placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Tìm
            </button>
          </form>

          {/* Write Post CTA */}
          <button
            onClick={handleCreatePost}
            className="inline-flex items-center gap-2 bg-white text-orange-500 font-bold px-7 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-sm"
          >
            <PenSquare className="w-5 h-5" />
            Viết bài du lịch
          </button>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Main Feed (Left) ── */}
          <main className="flex-1 min-w-0 w-full">

            {/* Filter Tabs + Active Tag */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              {(searchKeyword || selectedTag) && (
                <button
                  onClick={() => { setSearchKeyword(''); setSearchInput(''); setSelectedTag(null); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-600 border border-orange-200 hover:bg-orange-200 transition-all"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {selectedTag ? `#${selectedTag}` : `"${searchKeyword}"`}
                  <span className="ml-1">✕</span>
                </button>
              )}
            </div>

            {/* Loading / Error / Empty */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium text-sm">Đang tải bài viết...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-red-100 shadow-sm">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-80" />
                <h3 className="text-base font-semibold text-gray-700 mb-1">Đã có lỗi xảy ra</h3>
                <p className="text-sm text-gray-400 mb-4">Không thể kết nối đến máy chủ</p>
                <button
                  onClick={() => refetch()}
                  className="text-orange-500 font-bold text-sm hover:underline"
                >
                  Thử lại
                </button>
              </div>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-gray-700 mb-1">Không tìm thấy bài viết</h3>
                <p className="text-sm text-gray-400">Thử thay đổi từ khóa hoặc bộ lọc</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}

                {/* Infinite Loader */}
                {hasNextPage && (
                  <div ref={loaderRef} className="flex justify-center py-5">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm text-sm font-semibold text-orange-500 border border-orange-100">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải thêm...
                    </div>
                  </div>
                )}

                {!hasNextPage && allPosts.length > 4 && (
                  <div className="flex items-center justify-center gap-2 py-8 text-gray-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                    Đã hiển thị toàn bộ bài viết
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ── Right Sidebar ── */}
          <aside className="lg:w-[280px] xl:w-[300px] flex-shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* 🔥 Trending This Week (Compact Minimalist) */}
            {featuredPosts.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-extrabold text-gray-900 mb-3.5 flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Nổi bật tuần này
                </h3>
                <div className="space-y-1.5">
                  {featuredPosts.map((post, i) => (
                    <FeaturedItemSidebar
                      key={post.id}
                      post={post}
                      rank={i + 1}
                      onClick={() => navigate(`/blog/${post.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags (Compact) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 mb-3.5 flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-orange-500" />
                Tags phổ biến
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>

      {!isLoading && allPosts.length > 3 && (
        <div className="mt-8">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
