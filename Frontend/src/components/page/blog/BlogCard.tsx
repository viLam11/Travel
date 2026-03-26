// src/components/page/blog/BlogCard.tsx
import React from 'react';
import { Heart, MessageCircle, Eye, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost } from '@/types/blog.types';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'default' }) => {
  const navigate = useNavigate();

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleClick = () => navigate(`/blog/${post.id}`);

  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className="relative cursor-pointer rounded-2xl overflow-hidden group h-80 shadow-md hover:shadow-xl transition-shadow duration-300"
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-orange-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold leading-snug mb-2 line-clamp-2">{post.title}</h3>
          <div className="flex items-center justify-between text-sm text-white/80">
            <div className="flex items-center gap-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {post.commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-semibold rounded-full shadow-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-100"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">{post.author.name}</p>
            <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {post.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {post.summary}
        </p>

        {/* Linked Places Preview */}
        {(post.linkedPlaces.length > 0 || post.linkedHotels.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[...post.linkedPlaces, ...post.linkedHotels].slice(0, 2).map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-lg"
              >
                <MapPin className="w-3 h-3" />
                {s.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-orange-500 transition-colors">
              <Heart className="w-3.5 h-3.5" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.viewCount.toLocaleString()}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTimeMinutes} phút đọc
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
