// src/types/blog.types.ts

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
export type ReactionType = 'LIKE' | 'LOVE' | 'HELPFUL' | 'WOW' | 'SAD';

export interface BlogAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export interface LinkedService {
  id: string;
  serviceName: string;
  description?: string;
  province?: string;
  thumbnailUrl?: string;
  type?: 'HOTEL' | 'RESTAURANT' | 'TICKET_VENUE' | 'ALL';
}

export interface PostReaction {
  id: string;
  userId: string;
  username: string;
  postId: string;
  reactionType: ReactionType;
}

export interface BlogComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
  replies?: BlogComment[];
  // Legacy mock data compat
  author?: { id: string; name: string; avatar?: string };
  postId?: string;
  parentId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string; // HTML-like rich text
  authorName: string;
  authorId: string;
  authorAvatarUrl?: string;
  mediaUrls: string[];
  thumbnailUrl?: string;
  status: BlogStatus;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  taggedServiceIds?: (string | LinkedService)[];
  reactions?: PostReaction[];
  comments?: BlogComment[];
  
  // Frontend UI extensions
  isLiked?: boolean;
  isBookmarked?: boolean;
}

/**
 * Interface from /blog full-data or search
 */
export interface BlogSummaryResponse {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  authorAvatarUrl?: string;
  mediaUrls: string[];
  thumbnailUrl?: string;
  status: BlogStatus;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogFilterTab = 'all' | 'latest' | 'popular' | 'following';

export interface BlogRequest {
  title: string;
  content: string;
  mediaUrls?: string[]; // Binary mapping handled in multipart
  status: BlogStatus;
  taggedServiceIds?: string[];
}


export interface ReportReason {
  id: string;
  label: string;
}

export const REPORT_REASONS: ReportReason[] = [
  { id: 'spam', label: 'Nội dung spam / quảng cáo' },
  { id: 'fake', label: 'Thông tin sai sự thật' },
  { id: 'inappropriate', label: 'Nội dung không phù hợp' },
  { id: 'copyright', label: 'Vi phạm bản quyền' },
  { id: 'hate', label: 'Kích động thù địch' },
  { id: 'other', label: 'Lý do khác' },
];

