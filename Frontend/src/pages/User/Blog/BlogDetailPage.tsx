// src/pages/User/Blog/BlogDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Share2,
  Flag,
  Clock,
  Eye,
  MapPin,
  Hotel,
  ChevronLeft,
  Calendar,
} from 'lucide-react';
import Footer from '@/components/common/layout/Footer';
import BlogCommentSection from '@/components/page/blog/BlogCommentSection';
import LinkedServiceCard from '@/components/page/blog/LinkedServiceCard';
import ReportModal from '@/components/page/blog/ReportModal';
import { blogStore } from '@/components/page/blog/blogMockData';
import type { BlogComment, BlogPost } from '@/types/blog.types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!id) return;
    const found = blogStore.getPostById(id);
    if (!found) {
      navigate('/blog');
      return;
    }
    setPost(found);
    setLikeCount(found.likes);
    setIsLiked(found.isLiked || false);
    setIsBookmarked(found.isBookmarked || false);
    setComments(blogStore.getComments(id));

    // Related posts (same tags, different id)
    const all = blogStore.getAllPosts();
    const related = all
      .filter(
        (p) =>
          p.id !== id && p.tags.some((t) => found.tags.includes(t))
      )
      .slice(0, 3);
    setRelatedPosts(related);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích bài viết');
      return;
    }
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      toast.success(next ? 'Đã thích bài viết!' : 'Đã bỏ thích', { duration: 1500 });
      return next;
    });
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu bài viết');
      return;
    }
    setIsBookmarked((prev) => {
      const next = !prev;
      toast.success(next ? 'Đã lưu bài viết!' : 'Đã xóa khỏi danh sách lưu', { duration: 1500 });
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

  const handleAddComment = (content: string, parentId?: string) => {
    if (!currentUser) return;
    const newComment: BlogComment = {
      id: `c_${Date.now()}`,
      postId: id!,
      author: {
        id: String(currentUser?.user?.userID ?? 'me'),
        name: currentUser?.user?.name || 'Bạn',
      },
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId: parentId || null,
    };

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        )
      );
    } else {
      setComments((prev) => [newComment, ...prev]);
    }
    toast.success('Bình luận đã được đăng!');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasLinked = post.linkedPlaces.length > 0 || post.linkedHotels.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Cover Image ── */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="cursor-pointer absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
          <div className="max-w-4xl mx-auto">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-orange-500/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <img
                  src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=fb923c&color=fff`}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
                />
                <span className="font-semibold text-white">{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} phút đọc
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount.toLocaleString()} lượt xem
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─ Article ─ */}
          <article className="flex-1 min-w-0">
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-30">
              <div className="flex items-center gap-1 sm:gap-3">
                {/* Like */}
                <button
                  onClick={handleLike}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isLiked
                      ? 'bg-red-50 text-red-500 border border-red-200'
                      : 'text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isBookmarked
                      ? 'bg-orange-50 text-orange-500 border border-orange-200'
                      : 'text-gray-500 hover:bg-orange-50 hover:text-orange-500 border border-gray-200'
                    }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">
                    {isBookmarked ? 'Đã lưu' : 'Lưu bài'}
                  </span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-500 border border-gray-200 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
              </div>

              {/* Report */}
              <button
                onClick={() => setShowReportModal(true)}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 border border-gray-200 transition-all"
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Báo cáo</span>
              </button>
            </div>

            {/* Summary */}
            <div className="mb-8 p-5 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl">
              <p className="text-gray-700 italic text-base leading-relaxed">{post.summary}</p>
            </div>

            {/* Article Body */}
            <div
              className="prose prose-orange max-w-none text-gray-800 leading-relaxed
                prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-8 prose-h2:mb-4
                prose-p:mb-4 prose-p:text-gray-700
                prose-ul:my-4 prose-li:text-gray-700
                prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Comments */}
            <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <BlogCommentSection
                postId={post.id}
                comments={comments}
                onAddComment={handleAddComment}
              />
            </div>
          </article>

          {/* ─ Sidebar ─ */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Author Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <img
                src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=fb923c&color=fff`}
                alt={post.author.name}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-4 ring-orange-100"
              />
              <h3 className="font-bold text-gray-900 text-base">{post.author.name}</h3>
              {post.author.bio && (
                <p className="text-sm text-gray-500 mt-1">{post.author.bio}</p>
              )}
            </div>

            {/* Linked Destinations */}
            {hasLinked && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Địa điểm trong bài
                </h3>
                <div className="space-y-3">
                  {post.linkedPlaces.slice(0, 2).map((place) => (
                    <LinkedServiceCard key={place.id} service={place} />
                  ))}
                  {post.linkedPlaces.length > 2 && (
                    <p className="text-xs text-center text-gray-400 font-medium pt-1">
                      + {post.linkedPlaces.length - 2} địa điểm khác
                    </p>
                  )}
                </div>

                {post.linkedHotels.length > 0 && (
                  <>
                    <h3 className="font-bold text-gray-900 my-4 flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-orange-500" />
                      Lưu trú gợi ý
                    </h3>
                    <div className="space-y-3">
                      {post.linkedHotels.slice(0, 1).map((hotel) => (
                        <LinkedServiceCard key={hotel.id} service={hotel} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Bài viết liên quan</h3>
                <div className="space-y-4">
                  {relatedPosts.slice(0, 3).map((rp) => (
                    <button
                      key={rp.id}
                      onClick={() => navigate(`/blog/${rp.id}`)}
                      className="cursor-pointer flex gap-3 w-full text-left hover:bg-orange-50 p-2 rounded-xl transition-colors group"
                    >
                      <img
                        src={rp.coverImage}
                        alt={rp.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {rp.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500 fill-current" />
                          {rp.likes}
                        </p>
                      </div>
                    </button>
                  ))}
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
