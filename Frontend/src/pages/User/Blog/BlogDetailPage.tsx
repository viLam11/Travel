import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Share2,
  Flag,
  Clock,
  Eye,
  MapPin,
  ChevronLeft,
  Calendar,
  Loader2,
  MessageCircle,
  Tag,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Footer from '@/components/common/layout/Footer';
import BlogCommentSection from '@/components/page/blog/BlogCommentSection';
import LinkedServiceCard from '@/components/page/blog/LinkedServiceCard';
import ReportModal from '@/components/page/blog/ReportModal';
import Lottie from 'lottie-react';
import ReactionPicker, { REACTION_OPTIONS } from '@/components/page/blog/ReactionPicker';
import { blogApi } from '@/api/blogApi';
import { useAuth } from '@/hooks/useAuth';
import type { ReactionType } from '@/types/blog.types';
import toast from 'react-hot-toast';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [localReaction, setLocalReaction] = useState<ReactionType | null>(null);
  const [localCount, setLocalCount] = useState(0);

  // Fetch Blog Detail
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogApi.getPostById(id!),
    enabled: !!id,
  });

  // Fetch Related Posts
  const { data: relatedData } = useQuery({
    queryKey: ['blog-related', id],
    queryFn: () => blogApi.getRelatedPosts(id!, 0, 4),
    enabled: !!id,
  });

  // Sync local state when post data arrives
  useEffect(() => {
    if (post) {
      setLocalReaction(post.isLiked ? 'LIKE' : null);
      setLocalCount(post.reactionCount ?? post.likeCount ?? (post as any).likes ?? 0);
    }
  }, [post]);

  // Mutation
  const reactionMutation = useMutation({
    mutationFn: (type: ReactionType) => blogApi.toggleReaction(id!, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
    },
    onError: () => {
      toast.error('Không thể thực hiện yêu cầu');
    },
  });

  const handleReact = (type: ReactionType) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thả cảm xúc');
      return;
    }
    const wasReacted = localReaction === type;
    setLocalReaction(wasReacted ? null : type);
    setLocalCount((c) => (wasReacted ? Math.max(0, c - 1) : c + (localReaction ? 0 : 1)));
    reactionMutation.mutate(type);
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu bài viết');
      return;
    }
    setIsBookmarked((prev) => {
      const next = !prev;
      toast.success(next ? 'Đã lưu bài viết!' : 'Đã xóa khỏi danh sách', { duration: 1500 });
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link!');
    }
  };

  const handleAddComment = async (content: string, _parentId?: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    try {
      await blogApi.addComment(id!, content);
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      toast.success('Bình luận đã được đăng!');
    } catch {
      toast.error('Không thể gửi bình luận');
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Vừa xong';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Handle deep link to comments
    if (window.location.hash === '#comments') {
      setTimeout(() => {
        document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [id]);

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-5xl">😕</div>
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy bài viết</h2>
        <button
          onClick={() => navigate('/blog')}
          className="text-orange-500 font-bold hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // ── Field Mapping ─────────────────────────────────────────────────────────
  const thumbnail =
    post.thumbnailUrl ||
    (post as any).coverImage ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80';
  const authorName = post.authorName || (post as any).author?.name || 'Ẩn danh';
  const authorAvatar =
    post.authorAvatarUrl ||
    (post as any).author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=fb923c&color=fff`;
  const authorBio = (post as any).author?.bio || '';
  const viewsCount = (post as any).viewCount ?? 0;
  const readTime = post.readTimeMinutes ?? 5;
  const summary =
    post.summary || post.content?.replace(/<[^>]*>/g, '').slice(0, 200) + '...';
  const tags = (post as any).tags || [];
  const linkedServices = post.taggedServiceIds || [];

  // ── Reaction data ──────────────────────────────────────────────────────────
  const breakdown: Partial<Record<ReactionType, number>> = {};
  (post.reactions || []).forEach((r: any) => {
    breakdown[r.reactionType as ReactionType] = (breakdown[r.reactionType as ReactionType] || 0) + 1;
  });

  const breakdownList = REACTION_OPTIONS.map((opt) => ({
    ...opt,
    count: breakdown[opt.type] || 0,
  })).filter((r) => r.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Cover ─────────────────────────────────────────────────────── */}
      <div className="relative h-[58vh] min-h-[380px] max-h-[580px] overflow-hidden">
        <img src={thumbnail} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="cursor-pointer absolute top-5 left-5 flex items-center gap-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all border border-white/20"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Bookmark in hero */}
        <button
          onClick={handleBookmark}
          className={`cursor-pointer absolute top-5 right-5 p-2.5 rounded-full backdrop-blur-sm border border-white/20 transition-all ${
            isBookmarked
              ? 'bg-orange-500 text-white'
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
          title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài'}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
          <div className="max-w-4xl mx-auto">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-orange-500/80 backdrop-blur-sm text-white text-xs font-bold rounded-full flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/60"
                />
                <span className="font-semibold text-white">{authorName}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readTime} phút đọc
              </span>
              {viewsCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {viewsCount.toLocaleString()} lượt xem
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ─ Article ─ */}
          <article className="flex-1 min-w-0">

            {/* ── Sticky Action Bar ── */}
            <div className="flex items-center justify-between mb-6 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-30 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Reaction Picker */}
                <div onClick={(e) => e.stopPropagation()}>
                  <ReactionPicker
                    postId={post.id}
                    currentReaction={localReaction}
                    reactionCount={localCount}
                    reactionBreakdown={breakdown}
                    onReact={handleReact}
                    isLoading={reactionMutation.isPending}
                    size="md"
                  />
                </div>

                {/* Comments Count */}
                <a
                  href="#comments-section"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-gray-500 hover:bg-orange-50 hover:text-orange-500 border border-gray-200 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Bình luận</span>
                  {post.commentCount > 0 && (
                    <span className="bg-orange-100 text-orange-500 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {post.commentCount}
                    </span>
                  )}
                </a>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-500 border border-gray-200 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
              </div>

              {/* Report */}
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 border border-gray-200 transition-all cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Báo cáo</span>
              </button>
            </div>

            {/* Reaction Breakdown List (Visual confirmation) */}
            {breakdownList.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2.5">
                {breakdownList.map((r) => (
                  <div
                    key={r.type}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${r.bgColor} ${r.color} ${r.borderClass} shadow-sm`}
                  >
                    <div className="w-4 h-4"><Lottie animationData={r.lottieData} loop={true} /></div>
                    <span>{r.label}</span>
                    <span className="bg-white/50 px-1.5 py-0.5 rounded-md ml-0.5">{r.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary / Quote */}
            {summary && (
              <div className="mb-7 p-5 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-r-2xl shadow-sm">
                <p className="text-gray-700 italic text-base leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Article Body */}
            <div
              className="prose prose-orange max-w-none text-gray-800 leading-relaxed
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:mb-5 prose-p:text-gray-700 prose-p:leading-7
                prose-ul:my-4 prose-li:text-gray-700 prose-li:my-1
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags Footer */}
            {tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-orange-50 text-orange-500 text-xs font-semibold rounded-full border border-orange-100 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── Comment Section ── */}
            <div id="comments-section" className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 scroll-mt-24">
              <BlogCommentSection
                postId={post.id}
                comments={post.comments || []}
                onAddComment={handleAddComment}
              />
            </div>
          </article>

          {/* ─ Sidebar ─ */}
          <aside className="lg:w-64 xl:w-72 flex-shrink-0 space-y-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Author Card — Compact */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-3">Tác giả</h3>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{authorName}</p>
                  <p className="text-[10px] text-orange-500 font-bold">Thành viên Travello</p>
                </div>
              </div>
              {authorBio && (
                <p className="text-[11px] text-gray-500 italic leading-relaxed mb-4 line-clamp-3">"{authorBio}"</p>
              )}
              <button className="w-full py-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-500 font-bold text-[11px] rounded-xl transition-all border border-gray-100 hover:border-orange-100">
                Xem thêm bài viết
              </button>
            </div>

            {/* Article Stats — Compact */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-3">Thống kê</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-orange-50/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-black text-orange-500">{localCount.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Cảm xúc</p>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-black text-blue-500">{post.commentCount}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Bình luận</p>
                </div>
                <div className="bg-teal-50/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-black text-teal-600">{viewsCount.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Lượt xem</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-black text-gray-600">{readTime}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Phút đọc</p>
                </div>
              </div>
            </div>

            {/* Linked Services */}
            {linkedServices.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 tracking-tight">
                    Địa điểm trong bài
                  </h3>
                </div>
                <div className="space-y-3">
                  {linkedServices.map((service: any) => (
                    <LinkedServiceCard
                      key={typeof service === 'string' ? service : service.id}
                      service={service}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts */}
            {relatedData && relatedData.posts.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-[15px]">
                  <span className="text-base">📖</span>
                  Bài viết liên quan
                </h3>
                <div className="space-y-3">
                  {relatedData.posts.slice(0, 4).map((rp) => {
                    const rpThumb =
                      rp.thumbnailUrl ||
                      (rp as any).coverImage ||
                      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200';
                    return (
                      <button
                        key={rp.id}
                        onClick={() => navigate(`/blog/${rp.id}`)}
                        className="cursor-pointer flex gap-3 w-full text-left hover:bg-orange-50 p-2 rounded-xl transition-colors group"
                      >
                        <img
                          src={rpThumb}
                          alt={rp.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
                            {rp.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                            <span>❤️</span>
                            <span>{rp.reactionCount || rp.likeCount || 0}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

      <Footer />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
      />
    </div>
  );
};

export default BlogDetailPage;
