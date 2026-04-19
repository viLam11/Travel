import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, MessageCircle, Heart, Clock, MapPin,
  ExternalLink, Share2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost, BlogComment, ReactionType } from '@/types/blog.types';
import { blogApi } from '@/api/blogApi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import ReactionPicker, { REACTION_OPTIONS } from './ReactionPicker';
import Lottie from 'lottie-react';

// ── Time Helper ─────────────────────────────────────────────────────────────
const timeAgo = (iso?: string) => {
  if (!iso) return 'Vừa xong';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
};

// ── Mock Comments ────────────────────────────────────────────────────────────
const MOCK_COMMENTS: BlogComment[] = [
  {
    id: 'm1', authorId: 'u1', authorName: 'Hoàng Anh', content: 'Bài viết tuyệt vời quá bạn ơi! 😍 Cho mình hỏi chi phí chuyến đi này khoảng bao nhiêu nhỉ?',
    createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 12,
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=ha1',
  },
  {
    id: 'm2', authorId: 'u2', authorName: 'Trang Nguyễn', content: 'Ảnh đẹp xuất sắc! Bạn dùng máy gì chụp vậy? 📸 Mình cũng định đi đây vào tháng sau.',
    createdAt: new Date(Date.now() - 7200000).toISOString(), likes: 5,
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=tn2',
  },
  {
    id: 'm3', authorId: 'u3', authorName: 'Minh Tuấn', content: 'Cảm ơn bài chia sẻ rất chi tiết của bạn. Lưu lại ngay để chuẩn bị cho hè này! 🙌',
    createdAt: new Date(Date.now() - 86400000).toISOString(), likes: 8,
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=mt3',
  }
];

// ── Sub-components ────────────────────────────────────────────────────────────

const CommentItem: React.FC<{
  comment: BlogComment;
  onReply: (commentId: string, authorName: string) => void;
}> = ({ comment, onReply }) => {
  const authorName = comment.authorName || (comment as any).author?.name || 'Ẩn danh';
  const avatar = comment.authorAvatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=fb923c&color=fff`;
  const replies: BlogComment[] = (comment as any).replies || [];

  return (
    <div className="flex gap-2.5 group">
      <img src={avatar} alt={authorName}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-gray-100 shadow-sm" />
      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
          <p className="text-xs font-black text-gray-900 mb-0.5">{authorName}</p>
          <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{comment.content}</p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1.5 pl-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{timeAgo(comment.createdAt)}</span>
          {(comment.likes ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-orange-400 font-black">
              <Heart className="w-2.5 h-2.5 fill-current" /> {comment.likes}
            </span>
          )}
          <button
            onClick={() => onReply(comment.id, authorName)}
            className="text-[11px] font-black text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-widest"
          >
            Trả lời
          </button>
        </div>

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-4 pl-4 border-l-2 border-orange-50">
            {replies.map((reply: BlogComment) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main PostDrawer ───────────────────────────────────────────────────────────
interface PostDrawerProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
  currentReaction: ReactionType | null;
  reactionCount: number;
  reactionBreakdown: Partial<Record<ReactionType, number>>;
  onReact: (type: ReactionType) => void;
}

const PostDrawer: React.FC<PostDrawerProps> = ({
  post, isOpen, onClose, currentReaction, reactionCount, reactionBreakdown, onReact,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  // Pull author info
  const authorName = post.authorName || (post as any).author?.name || 'Ẩn danh';
  const authorAvatar = post.authorAvatarUrl || (post as any).author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=fb923c&color=fff`;
  const thumbnail = post.thumbnailUrl || (post as any).coverImage ||
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

  // Me
  const meName = currentUser?.user?.name || 'Bạn';
  const meAvatar = currentUser?.user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(meName)}&background=fb923c&color=fff`;

  // Load comments when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingComments(true);
    blogApi.getPostById(post.id)
      .then(detail => {
        const rawComments: any[] = (detail as any).comments || [];
        if (rawComments.length === 0) setComments(MOCK_COMMENTS);
        else setComments(rawComments);
      })
      .catch(() => setComments(MOCK_COMMENTS))
      .finally(() => setIsLoadingComments(false));

    // Focus input
    setTimeout(() => commentInputRef.current?.focus(), 400);
  }, [isOpen, post.id]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ id: commentId, name: authorName });
    commentInputRef.current?.focus();
  };

  const handlePost = async () => {
    const text = commentText.trim();
    if (!text) return;
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để bình luận'); return; }

    setIsPosting(true);
    const optimistic: BlogComment = {
      id: `opt_${Date.now()}`,
      content: replyTo ? `@${replyTo.name} ${text}` : text,
      authorId: 'me', authorName: meName, authorAvatarUrl: meAvatar,
      createdAt: new Date().toISOString(), likes: 0,
    };
    setComments(prev => [optimistic, ...prev]);
    setCommentText('');
    setReplyTo(null);

    try {
      if (replyTo) await blogApi.addReply(replyTo.id, text);
      else await blogApi.addComment(post.id, text);
    } catch {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      toast.error('Không thể đăng bình luận');
    } finally {
      setIsPosting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post.id}`;
    if (navigator.share) await navigator.share({ title: post.title, url });
    else { await navigator.clipboard.writeText(url); toast.success('Đã sao chép link!'); }
  };

  const linkedServices = post.taggedServiceIds || [];
  const tags: string[] = (post as any).tags || [];

  if (!isOpen) return null;
  const hasLinks = linkedServices.length > 0 || (post as any).linkedPlaces?.length > 0 || (post as any).linkedHotels?.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" onClick={onClose} />

      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-0 sm:p-4 md:p-6" style={{ animation: 'modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="bg-white w-full max-w-[720px] h-full sm:h-auto max-h-[96vh] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-black text-gray-900 text-sm tracking-tight px-1">
                Bình luận · {(comments.length || post.commentCount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/blog/${post.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all uppercase tracking-widest">
                <ExternalLink className="w-3.5 h-3.5" /> Xem đầy đủ
              </button>
              <button onClick={onClose} className="p-2 rounded-full text-gray-300 hover:text-gray-900 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-white pb-24">
            <div className="px-7 py-6 cursor-default">
              <div className="flex items-center gap-3 mb-6">
                <img src={authorAvatar} alt={authorName} className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-100" />
                <div className="min-w-0">
                  <p className="text-[15px] font-black text-gray-900 leading-none">{authorName}</p>
                  <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-200" /> {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.slice(0, 4).map(t => (
                    <span key={t} className="px-3 py-1 bg-orange-50 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100/30">#{t}</span>
                  ))}
                </div>
              )}

              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-5 tracking-tight">{post.title}</h2>

              <div className="relative rounded-[32px] overflow-hidden mb-6 shadow-2xl-soft border border-gray-100 group">
                <img src={thumbnail} alt={post.title} className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              </div>

              <div className="prose prose-sm max-w-none text-gray-600 mb-8 leading-relaxed text-[15px] font-medium selection:bg-orange-100 selection:text-orange-900">
                {post.summary || post.content?.replace(/<[^>]*>/g, '').slice(0, 500)}...
              </div>

              {hasLinks && (
                <div className="mb-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-100">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Địa điểm & dịch vụ trong bài</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {linkedServices.map((s: any) => (
                      <button key={typeof s === 'string' ? s : s.id} onClick={() => typeof s !== 'string' && navigate(`/services/${s.id}`)} className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-800 text-xs font-black rounded-2xl hover:border-orange-500 hover:text-orange-500 hover:shadow-md transition-all group">
                        <MapPin className="w-4 h-4 text-orange-500 group-hover:rotate-12 transition-transform" /> {typeof s === 'string' ? 'Dịch vụ' : s.serviceName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <ReactionPicker
                    postId={post.id}
                    onReact={onReact}
                    currentReaction={currentReaction}
                    reactionCount={reactionCount}
                  >
                    <div className="flex -space-x-1.5 items-center cursor-pointer hover:scale-110 transition-all">
                      {Object.entries(reactionBreakdown)
                        .filter(([_, count]) => (count as number) > 0)
                        .map(([type]) => REACTION_OPTIONS.find(o => o.type === type))
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((opt, idx) => (
                          <div key={opt!.type} className="w-5 h-5 rounded-full bg-white ring-2 ring-white overflow-hidden shadow-sm flex items-center justify-center" style={{ zIndex: 10 - idx }}>
                            <Lottie animationData={opt!.lottieData} loop={true} className="w-4 h-4" />
                          </div>
                        ))
                      }
                      {Object.keys(reactionBreakdown).filter(k => (reactionBreakdown as any)[k] > 0).length === 0 && (
                         <div className="w-5 h-5 flex items-center justify-center bg-gray-50 rounded-full">
                            <Heart className="w-3 h-3 text-gray-300" />
                         </div>
                      )}
                    </div>
                  </ReactionPicker>

                  <span className="text-[11px] font-black tracking-wider text-gray-400 uppercase">
                    {currentReaction ? (
                      <span className="flex items-center gap-1">
                        <span className="text-orange-500">BẠN</span>
                        {reactionCount > 1 && (
                          <>
                            <span className="text-gray-300 font-medium">VÀ</span>
                            <span className="text-gray-800">{ (reactionCount - 1).toLocaleString() }</span>
                            <span className="text-gray-400">TƯƠNG TÁC KHÁC</span>
                          </>
                        )}
                        {reactionCount === 1 && <span className="text-gray-400 text-[10px]">ĐÃ TƯƠNG TÁC</span>}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="text-gray-800 text-[13px]">{reactionCount.toLocaleString()}</span>
                        <span>TƯƠNG TÁC</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 opacity-30" /> {(post.commentCount || 0).toLocaleString()} thảo luận
                  </div>
                  <button onClick={handleShare} className="flex items-center gap-2.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
                    <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                  </button>
                </div>
              </div>
            </div>

            <div className="px-7 space-y-8 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] flex-1 bg-gray-50"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Thảo luận cộng đồng</span>
                <div className="h-[2px] flex-1 bg-gray-50"></div>
              </div>

              {isLoadingComments ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-[4px] border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em]">Kết nối máy chủ...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="font-black text-gray-400 text-sm mb-1 tracking-tight">Vẫn chưa có ý kiến nào</p>
                  <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">Hãy là người tiên phong!</p>
                </div>
              ) : (
                <div className="space-y-8 mb-10">
                  {comments.map(c => (
                    <CommentItem key={c.id} comment={c} onReply={handleReply} />
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 px-7 py-5 bg-white/95 backdrop-blur-xl border-t border-gray-100 relative z-40">
            {replyTo && (
              <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-orange-50 rounded-[20px] text-[11px] text-orange-600 font-black border border-orange-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                ĐANG PHẢN HỒI <span className="underline underline-offset-4 ml-1 italic opacity-80">@{replyTo.name}</span>
                <button onClick={() => setReplyTo(null)} className="ml-auto p-1.5 hover:bg-orange-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>
            )}
            {/* Image 3 Fix: Changed items-end to items-center for perfectly balanced avatar and input bubble */}
            <div className="flex gap-4 items-center">
              <img src={meAvatar} alt={meName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-4 ring-orange-50 shadow-md shadow-orange-100/50" />
              <div className="flex-1 flex items-center bg-gray-100/80 rounded-[32px] px-5 py-3 gap-3 focus-within:ring-4 focus-within:ring-orange-100/50 focus-within:bg-white transition-all border border-transparent focus-within:border-orange-200/50 shadow-inner">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={e => {
                    setCommentText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); }
                  }}
                  placeholder={isAuthenticated ? "Chia sẻ cảm nghĩ của bạn..." : "Đăng nhập để tham gia thảo luận!"}
                  disabled={!isAuthenticated || isPosting}
                  rows={1}
                  className="flex-1 text-[13px] bg-transparent outline-none text-gray-800 placeholder-gray-400 font-semibold resize-none leading-relaxed overflow-hidden py-1"
                  style={{ minHeight: 24 }}
                />
                <button onClick={handlePost} disabled={!commentText.trim() || isPosting} className="p-2.5 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-20 transition-all rounded-full shadow-lg shadow-orange-200 flex-shrink-0 hover:scale-105 active:scale-95 group">
                  {isPosting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
              </div>
            </div>
            <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.25em] text-center mt-4 opacity-50">Nhấn Enter để gửi phản hồi ngay</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.9) translateY(40px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);    opacity: 1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-2xl-soft { box-shadow: 0 30px 60px -12px rgba(0,0,0,0.12), 0 18px 36px -18px rgba(0,0,0,0.12); }
      `}</style>
    </>
  );
};
export default PostDrawer;
