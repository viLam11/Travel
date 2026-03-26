// src/components/page/blog/BlogCommentSection.tsx
import React, { useState } from 'react';
import { Heart, MessageCircle, Flag, Send, ChevronDown, ChevronUp } from 'lucide-react';
import type { BlogComment } from '@/types/blog.types';
import { useAuth } from '@/hooks/useAuth';
import ReportModal from './ReportModal';
import toast from 'react-hot-toast';

interface BlogCommentSectionProps {
  postId: string;
  comments: BlogComment[];
  onAddComment: (content: string, parentId?: string) => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
};

interface CommentItemProps {
  comment: BlogComment;
  onReply: (parentId: string, authorName: string) => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, isReply = false }) => {
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);
  const [reportState, setReportState] = useState<{ open: boolean; id: string }>({
    open: false,
    id: '',
  });

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
      <img
        src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=fb923c&color=fff`}
        alt={comment.author.name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
      />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {!isReply && (
            <button
              onClick={() => onReply(comment.id, comment.author.name)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Trả lời
            </button>
          )}

          <button
            onClick={() => setReportState({ open: true, id: comment.id })}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-400 transition-colors ml-auto"
          >
            <Flag className="w-3 h-3" />
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 ml-2">
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 text-xs text-orange-500 font-medium hover:text-orange-600 transition-colors"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Ẩn {comment.replies.length} trả lời
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Xem {comment.replies.length} trả lời
                </>
              )}
            </button>

            {showReplies &&
              comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} onReply={onReply} isReply />
              ))}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportState.open}
        onClose={() => setReportState({ open: false, id: '' })}
        targetType="comment"
        targetId={reportState.id}
      />
    </div>
  );
};

const BlogCommentSection: React.FC<BlogCommentSectionProps> = ({
  postId,
  comments,
  onAddComment,
}) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = (parentId: string, authorName: string) => {
    setReplyTarget({ id: parentId, name: authorName });
    document.getElementById('comment-input')?.focus();
  };

  const handleSubmit = async () => {
    const text = newComment.trim();
    if (!text) return;

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onAddComment(text, replyTarget?.id);
    setNewComment('');
    setReplyTarget(null);
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-orange-500" />
        Bình luận ({comments.length})
      </h3>

      {/* Comment Input */}
      <div className="flex gap-3 mb-8">
        <img
          src={
            currentUser?.user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.user?.name || 'U')}&background=fb923c&color=fff`
          }
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          {replyTarget && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-orange-50 rounded-lg text-sm text-orange-600">
              <MessageCircle className="w-3.5 h-3.5" />
              Đang trả lời{' '}
              <span className="font-semibold">{replyTarget.name}</span>
              <button
                onClick={() => setReplyTarget(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕ Hủy
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400 transition-all">
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAuthenticated
                  ? 'Viết bình luận... (Enter để gửi)'
                  : 'Đăng nhập để bình luận...'
              }
              disabled={!isAuthenticated}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none min-h-[36px] max-h-32 py-1"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting || !isAuthenticated}
              className="p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0 mb-0.5"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogCommentSection;
