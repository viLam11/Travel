// src/api/blogApi.ts
import apiClient from '@/services/apiClient';
import type { 
  BlogPost, 
  BlogRequest, 
  ReactionType, 
  BlogComment
} from '@/types/blog.types';
import { blogStore } from '@/components/page/blog/blogMockData';

const USE_MOCK_DATA = false; // Đã bật lại Mock để tránh lỗi Server 500

// Helper function for mocking pagination
const mockResponse = (data: any[], page: number, size: number) => {
  const totalElements = data.length;
  const totalPages = Math.ceil(totalElements / size);
  const content = data.slice(page * size, (page + 1) * size);
  
  return {
    posts: content,
    total: totalElements,
    page: page,
    totalPages: totalPages === 0 ? 1 : totalPages,
  };
};

export const blogApi = {
  /**
   * Lấy danh sách bài viết (Phân trang)
   * GET /blog
   */
  getAllPosts: async (page = 0, size = 10): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const allPosts = blogStore.getAllPosts();
      return mockResponse(allPosts, page, size);
    }

    try {
      const response: any = await apiClient.get('/blog', {
        params: { page, size }
      });
      
      const content = response.content || (Array.isArray(response) ? response : []);
      return {
        posts: content,
        total: response.totalElements || content.length,
        page: response.pageNo ?? 0,
        totalPages: response.totalPages || 1,
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách bài viết đầy đủ (Phân trang)
   * GET /blog/full-data
   */
  getAllPostsFullData: async (page = 0, size = 10): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const allPosts = blogStore.getAllPosts();
      return mockResponse(allPosts, page, size);
    }

    try {
      const response: any = await apiClient.get('/blog/full-data', {
        params: { page, size }
      });
      
      const content = response.content || (Array.isArray(response) ? response : []);
      return {
        posts: content,
        total: response.totalElements || content.length,
        page: response.pageNo ?? 0,
        totalPages: response.totalPages || 1,
      };
    } catch (error) {
      console.error('Error fetching full blog data:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết bài viết
   * GET /blog/{blogID}
   */
  getPostById: async (blogId: string): Promise<BlogPost> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const post = blogStore.getPostById(blogId);
      if (!post) throw new Error('Post not found');
      
      // Inject mock comments as well
      const comments = blogStore.getComments(blogId);
      return { ...post, comments };
    }

    try {
      return await apiClient.get(`/blog/${blogId}`);
    } catch (error) {
      console.error(`Error fetching blog detail (${blogId}):`, error);
      throw error;
    }
  },

  /**
   * Tìm kiếm bài viết
   * GET /blog/search
   */
  searchPosts: async (params: {
    keyword?: string;
    serviceIds?: string[];
    sortBy?: string;
    page?: number;
    size?: number;
  }): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let allPosts = blogStore.getAllPosts();
      
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        allPosts = allPosts.filter(p => 
          p.title.toLowerCase().includes(keyword) || 
          p.content.toLowerCase().includes(keyword) ||
          (p as any).tags?.some((t: string) => t.toLowerCase().includes(keyword))
        );
      }
      
      if (params.sortBy === 'reactionCount') {
        allPosts.sort((a, b) => (b.reactionCount ?? b.likeCount ?? 0) - (a.reactionCount ?? a.likeCount ?? 0));
      }

      return mockResponse(allPosts, params.page || 0, params.size || 10);
    }

    try {
      const response: any = await apiClient.get('/blog/search', { params });
      
      const content = response.content || (Array.isArray(response) ? response : []);
      return {
        posts: content,
        total: response.totalElements || content.length,
        page: response.pageNo ?? 0,
        totalPages: response.totalPages || 1,
      };
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw error;
    }
  },

  /**
   * Tạo bài viết mới
   * POST /blog
   */
  createPost: async (blogRequest: BlogRequest): Promise<BlogPost> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newPost: BlogPost = {
        id: `mock_new_${Date.now()}`,
        title: blogRequest.title,
        content: blogRequest.content,
        // Mock properties
        authorId: 'u0',
        authorName: 'You (Mock User)',
        authorAvatarUrl: 'https://ui-avatars.com/api/?name=You&background=fb923c&color=fff',
        reactionCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        status: blogRequest.status,
        taggedServiceIds: blogRequest.taggedServiceIds
      };
      blogStore.addPost(newPost);
      return newPost;
    }

    try {
      // Use FormData if mediaUrls contains Files
      const hasFiles = blogRequest.mediaUrls?.some(item => item instanceof File);
      
      if (hasFiles) {
        const formData = new FormData();
        formData.append('title', blogRequest.title);
        formData.append('content', blogRequest.content);
        formData.append('status', blogRequest.status);
        
        if (blogRequest.mediaUrls) {
          blogRequest.mediaUrls.forEach((file) => {
            if (file instanceof File) {
              formData.append('mediaUrls', file);
            }
          });
        }
        
        if (blogRequest.taggedServiceIds) {
          blogRequest.taggedServiceIds.forEach(id => {
            formData.append('taggedServiceIds', id);
          });
        }

        return await apiClient.post('/blog', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      return await apiClient.post('/blog', null, { params: blogRequest });
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  /**
   * Cập nhật bài viết
   * PATCH /blog/{blogID}
   */
  updatePost: async (blogId: string, blogRequest: Partial<BlogRequest>): Promise<BlogPost> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const post = blogStore.getPostById(blogId);
        if(!post) throw new Error('Post not found');
        return { ...post, title: blogRequest.title || post.title, content: blogRequest.content || post.content };
    }
    try {
      return await apiClient.patch(`/blog/${blogId}`, null, { params: blogRequest });
    } catch (error) {
      console.error(`Error updating blog (${blogId}):`, error);
      throw error;
    }
  },

  /**
   * Xóa bài viết
   * DELETE /blog/{blogID}
   */
  deletePost: async (blogId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
    }
    try {
      await apiClient.delete(`/blog/${blogId}`);
    } catch (error) {
      console.error(`Error deleting blog (${blogId}):`, error);
      throw error;
    }
  },

  /**
   * Thả cảm xúc cho bài viết
   * POST /blog/{blogID}/react
   */
  toggleReaction: async (blogId: string, reactionType: ReactionType): Promise<void> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    }
    try {
      await apiClient.post(`/blog/${blogId}/react`, reactionType, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`Error reacting to blog (${blogId}):`, error);
      throw error;
    }
  },

  /**
   * Thêm bình luận
   * POST /blog/{blogID}/comments
   */
  addComment: async (blogId: string, content: string): Promise<BlogComment> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const comments = blogStore.getComments(blogId);
        const newComment: BlogComment = {
            id: `c_mock_${Date.now()}`,
            content: content,
            authorId: 'u0',
            authorName: 'You (Mock User)',
            authorAvatarUrl: 'https://ui-avatars.com/api/?name=You&background=fb923c&color=fff',
            createdAt: new Date().toISOString(),
            likes: 0
        };
        comments.unshift(newComment);
        return newComment;
    }

    try {
      return await apiClient.post(`/blog/${blogId}/comments`, content, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`Error adding comment to blog (${blogId}):`, error);
      throw error;
    }
  },

  /**
   * Phản hồi bình luận
   * POST /blog/comments/{commentID}/reply
   */
  addReply: async (commentId: string, content: string): Promise<BlogComment> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: `c_mock_${Date.now()}`,
            content: content,
            authorId: 'u0',
            authorName: 'You (Mock User)',
            authorAvatarUrl: 'https://ui-avatars.com/api/?name=You&background=fb923c&color=fff',
            createdAt: new Date().toISOString(),
            likes: 0
        };
    }
    try {
      return await apiClient.post(`/blog/comments/${commentId}/reply`, content, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`Error replying to comment (${commentId}):`, error);
      throw error;
    }
  },

  /**
   * Xóa bình luận
   * DELETE /blog/comments/{commentID}
   */
  deleteComment: async (commentId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
    }
    try {
      await apiClient.delete(`/blog/comments/${commentId}`);
    } catch (error) {
      console.error(`Error deleting comment (${commentId}):`, error);
      throw error;
    }
  },

  /**
   * Lấy bài viết của người dùng
   * GET /blog/user/{userID}
   */
  getUserPosts: async (userId: string, page = 0, size = 10): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const allPosts = blogStore.getAllPosts().filter(p => p.authorId === userId || (p as any).author?.id === userId);
        return mockResponse(allPosts, page, size);
    }
    try {
      const response: any = await apiClient.get(`/blog/user/${userId}`, {
        params: { page, size }
      });
      
      const content = response.content || (Array.isArray(response) ? response : []);
      return {
        posts: content,
        total: response.totalElements || content.length,
        page: response.pageNo ?? 0,
        totalPages: response.totalPages || 1,
      };
    } catch (error) {
      console.error(`Error fetching user blogs (${userId}):`, error);
      throw error;
    }
  },

  /**
   * Lấy bài viết liên quan theo serviceID
   * GET /blog/related/{serviceID}
   */
  getRelatedPosts: async (serviceId: string, page = 0, size = 10): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const allPosts = blogStore.getAllPosts().slice(1, 4); // Just returning some posts
        return mockResponse(allPosts, page, size);
    }
    try {
      const response: any = await apiClient.get(`/blog/related/${serviceId}`, {
        params: { page, size }
      });
      
      const content = response.content || (Array.isArray(response) ? response : []);
      return {
        posts: content,
        total: response.totalElements || content.length,
        page: response.pageNo ?? 0,
        totalPages: response.totalPages || 1,
      };
    } catch (error) {
      console.error(`Error fetching related blogs (${serviceId}):`, error);
      throw error;
    }
  }
};
