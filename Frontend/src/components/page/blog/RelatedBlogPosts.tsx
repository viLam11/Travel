// src/components/page/blog/RelatedBlogPosts.tsx
// Section "Bài viết liên quan" cho trang ServiceDetailPage
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Heart, ArrowRight } from 'lucide-react';
import { blogApi } from '@/api/blogApi';
import type { BlogPost } from '@/types/blog.types';

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Hôm nay';
  if (days < 30) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN', { day:'2-digit', month:'short' });
};

interface RelatedBlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

const RelatedBlogCard: React.FC<RelatedBlogCardProps> = ({ post, onClick }) => {
  const thumbnail = post.thumbnailUrl || (post as any).coverImage ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80';
  const authorName  = post.authorName  || (post as any).author?.name   || 'Ẩn danh';
  const authorAvatar = post.authorAvatarUrl || (post as any).author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=fb923c&color=fff`;
  const likes = post.reactionCount ?? post.likeCount ?? (post as any).likes ?? 0;
  const tags: string[] = (post as any).tags || [];
  const readTime = post.readTimeMinutes ?? 5;

  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={thumbnail} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Tags overlay */}
        {tags.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex gap-1">
            {tags.slice(0, 2).map(t => (
              <span key={t} className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-2 mb-2.5">
          <img src={authorAvatar} alt={authorName}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-100" />
          <span className="text-xs font-semibold text-gray-500 truncate">{authorName}</span>
          <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">{timeAgo(post.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors flex-1">
          {post.title}
        </h3>

        {/* Summary */}
        {post.summary && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {post.summary}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3">
            {likes > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> {likes.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {readTime} phút
            </span>
          </div>
          <span className="flex items-center gap-0.5 font-semibold text-orange-500 group-hover:gap-1 transition-all">
            Đọc <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
interface RelatedBlogPostsProps {
  serviceId: string;
  serviceName?: string;
}

const RelatedBlogPosts: React.FC<RelatedBlogPostsProps> = ({ serviceId, serviceName }) => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['relatedBlogPosts', serviceId],
    queryFn: () => blogApi.getRelatedPosts(serviceId, 0, 6),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  });

  const posts: BlogPost[] = data?.posts || [];

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Bài viết liên quan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
              <div className="bg-gray-200 w-full" style={{ aspectRatio:'16/9' }}/>
              <div className="p-4 space-y-2.5">
                <div className="h-3 bg-gray-200 rounded-full w-1/3"/>
                <div className="h-4 bg-gray-200 rounded-full w-full"/>
                <div className="h-3 bg-gray-200 rounded-full w-2/3"/>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError || posts.length === 0) return null;

  return (
    <section className="mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500"/>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bài viết liên quan</h2>
            {serviceName && (
              <p className="text-xs text-gray-400 mt-0.5">Về {serviceName}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors group"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.slice(0, 6).map(post => (
          <RelatedBlogCard
            key={post.id}
            post={post}
            onClick={() => navigate(`/blog/${post.id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedBlogPosts;
