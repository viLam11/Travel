// src/types/blog.types.ts

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface LinkedService {
  id: string;
  name: string;
  type: 'hotel' | 'place';
  location: string;
  image?: string;
  rating?: number;
  slug?: string;
  region?: string;
  destination?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  author: BlogAuthor;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string | null;
  replies?: BlogComment[];
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML-like rich text
  coverImage: string;
  images?: string[];
  author: BlogAuthor;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  commentCount: number;
  viewCount: number;
  tags: string[];
  linkedPlaces: LinkedService[];
  linkedHotels: LinkedService[];
  readTimeMinutes: number;
  isDraft?: boolean;
}

export type BlogFilterTab = 'all' | 'latest' | 'popular' | 'following';

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
