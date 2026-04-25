// src/components/page/blog/BlogCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    MoreHorizontal, Bookmark, ExternalLink, Send, Hotel, Heart, Sparkles,
    MessageCircle, Eye, Clock, MapPin, Share2,
} from 'lucide-react';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost, ReactionType } from '@/types/blog.types';
import ReactionPicker, { REACTION_OPTIONS } from './ReactionPicker';
import PostDrawer from './PostDrawer';
import ReactionListModal from './ReactionListModal';
import { blogApi } from '@/api/blogApi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (iso?: string) => {
    if (!iso) return 'Vừa xong';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── ReactionSummaryRow (stacked emoji + total) ────────────────────────────────
const MOCK_NAMES = ['Duy Nguyễn', 'Minh Khánh', 'Trần Khoa', 'An Lê', 'Mai Phương'];

const ReactionSummaryRow: React.FC<{
    reactions: Partial<Record<ReactionType, number>>;
    totalCount: number;
    userReaction?: ReactionType | null;
}> = ({ reactions, totalCount, userReaction }) => {
    const [showList, setShowList] = useState<'ALL' | ReactionType | null>(null);

    const breakdown = REACTION_OPTIONS
        .map(o => ({ type: o.type, label: o.label, color: o.color, count: (reactions[o.type] ?? 0) }))
        .filter(r => r.count > 0)
        .sort((a, b) => b.count - a.count);

    if (totalCount === 0) return null;

    const getTooltipData = (count: number) => {
        if (count === 1) return { names: [MOCK_NAMES[0]], rest: 0 };
        if (count === 2) return { names: [MOCK_NAMES[0], MOCK_NAMES[1]], rest: 0 };
        return { names: [MOCK_NAMES[0], MOCK_NAMES[1], MOCK_NAMES[2]], rest: count - 3 };
    };

    return (
        <>
        <div className="relative inline-flex items-center gap-2 cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); setShowList('ALL'); }}>

            {/* Emojis stack */}
            <div className="flex -space-x-1.5 items-center">
                {breakdown.length > 0 ? (
                    breakdown.slice(0, 3).map((r) => {
                        const opt = REACTION_OPTIONS.find(o => o.type === r.type);
                        const data = getTooltipData(r.count);
                        
                        return (
                            <div key={r.type} 
                                onClick={(e) => { e.stopPropagation(); setShowList(r.type); }}
                                className="w-5 h-5 rounded-full bg-white ring-2 ring-white shadow-sm flex items-center justify-center hover:scale-125 hover:z-20 focus:z-20 transition-transform relative group/emoji">
                                <div className="w-4 h-4 overflow-hidden rounded-full pointer-events-none">
                                    <Lottie animationData={opt?.lottieData} loop={true} />
                                </div>

                                {/* Custom Tooltip FB Style */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/emoji:opacity-100 pointer-events-none transition-opacity bg-black/90 text-white text-[13px] px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-[100] min-w-[max-content]">
                                    <p className={`font-black uppercase text-[12px] mb-1 tracking-wider ${opt?.color}`}>{opt?.label}</p>
                                    <div className="flex flex-col gap-0.5 text-gray-200">
                                        {data.names.map(n => <p key={n}>{n}</p>)}
                                        {data.rest > 0 && <p className="text-gray-400">và {data.rest.toLocaleString()} người khác...</p>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                        <Lottie animationData={REACTION_OPTIONS[0].lottieData} loop={true} />
                    </div>
                )}
            </div>

            {/* Text Summary */}
            <span className="text-[11px] font-black tracking-wider text-gray-500 hover:text-gray-800 transition-colors hover:underline underline-offset-2">
                {userReaction ? (
                    <span className="flex items-center gap-1 uppercase transition-colors">
                        <span className="text-orange-500">BẠN</span>
                        {totalCount > 1 && (
                            <>
                                <span className="text-gray-400 font-medium">VÀ</span>
                                <span className="text-gray-700">{(totalCount - 1).toLocaleString()}</span>
                                <span className="text-gray-400">TƯƠNG TÁC KHÁC</span>
                            </>
                        )}
                        {totalCount === 1 && <span className="text-gray-400 text-[10px]">ĐÃ TƯƠNG TÁC</span>}
                    </span>
                ) : (
                    <span className="flex items-center gap-1 uppercase transition-colors">
                        <span className="text-[13px] text-gray-700">{totalCount.toLocaleString()}</span>
                        <span>TƯƠNG TÁC</span>
                    </span>
                )}
            </span>

        </div>
        <ReactionListModal 
            isOpen={showList !== null} 
            onClose={() => setShowList(null)} 
            breakdown={reactions} 
            totalCount={totalCount} 
            initialTab={showList || 'ALL'}
        />
        </>
    );
};

// ── ServiceChip (linked place / hotel) ───────────────────────────────────────
const ServiceChip: React.FC<{
    name: string; type: 'place' | 'hotel' | 'service'; id?: string;
}> = ({ name, type, id }) => {
    const navigate = useNavigate();
    const isPlace = type === 'place';
    const isHotel = type === 'hotel';

    return (
        <button
            onClick={e => { e.stopPropagation(); if (id) navigate(`/services/${id}`); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all group ${isHotel
                    ? 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100'
                    : isPlace
                        ? 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                }`}
        >
            {isHotel ? <Hotel className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            <span className="max-w-[120px] truncate">{name}</span>
        </button>
    );
};

// ── InlineCommentItem ─────────────────────────────────────────────────────────
interface InlineComment {
    id: string; content: string; authorName: string;
    authorAvatarUrl?: string; createdAt: string;
}

const InlineCommentItem: React.FC<{ comment: InlineComment }> = ({ comment }) => (
    <div className="flex gap-2 group">
        <img
            src={comment.authorAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}&background=fb923c&color=fff`}
            alt={comment.authorName}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
        />
        <div className="flex-1">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
                <p className="text-[11px] font-bold text-gray-900 mb-0.5">{comment.authorName}</p>
                <p className="text-sm text-gray-700 leading-snug">{comment.content}</p>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 pl-1">{timeAgo(comment.createdAt)}</p>
        </div>
    </div>
);

// ── BlogCard ──────────────────────────────────────────────────────────────────
interface BlogCardProps {
    post: BlogPost;
    variant?: 'default' | 'featured';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'default' }) => {
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const commentInputRef = useRef<HTMLInputElement>(null);

    // Reaction state
    const [localReaction, setLocalReaction] = useState<ReactionType | null>(() => {
        if (!post.reactions || !currentUser?.user?.userID) return post.isLiked ? 'LIKE' : null;
        const mine = post.reactions.find(r => String(r.userId) === String(currentUser.user.userID));
        return mine ? mine.reactionType : null;
    });

    const [localCount, setLocalCount] = useState<number>(() => {
        const val = post.reactionCount ?? (post as any).likeCount ?? (post as any).likes ?? 0;
        return val > 0 ? val : 726; // MOCK DATA: Giả lập 726 lượt tương tác để test UI
    });

    const [breakdown, setBreakdown] = useState<Partial<Record<ReactionType, number>>>(() => {
        const counts: Partial<Record<ReactionType, number>> = {};
        if (post.reactions && post.reactions.length > 0) {
            post.reactions.forEach(r => {
                counts[r.reactionType] = (counts[r.reactionType] ?? 0) + 1;
            });
        } else {
            // MOCK DATA: Chèn dữ liệu giả để dễ test UI popup
            counts['LIKE'] = 450;
            counts['LOVE'] = 200;
            counts['WOW'] = 50;
            counts['HELPFUL'] = 25;
            if (post.isLiked) counts['LIKE'] = 451;
        }
        return counts;
    });

    const [isReacting, setIsReacting] = useState(false);

    // Sync state with post data changes
    useEffect(() => {
        if (post.reactions && post.reactions.length > 0 && currentUser?.user?.userID) {
            const mine = post.reactions.find(r => String(r.userId) === String(currentUser.user.userID));
            const reactionType = mine ? mine.reactionType : (post.isLiked ? 'LIKE' as ReactionType : null);
            setLocalReaction(reactionType);

            const counts: Partial<Record<ReactionType, number>> = {};
            post.reactions.forEach(r => {
                counts[r.reactionType] = (counts[r.reactionType] ?? 0) + 1;
            });
            if (reactionType && !counts[reactionType]) counts[reactionType] = 1;
            setBreakdown(counts);
            setLocalCount(post.reactionCount || (post as any).likeCount || (post as any).likes || post.reactions.length);
        } else {
            const reactionType = post.isLiked ? 'LIKE' as ReactionType : null;
            setLocalReaction(reactionType);

            // MOCK DATA: Chèn dữ liệu giả để test UI nếu post.reactions trống
            const counts: Partial<Record<ReactionType, number>> = {};
            counts['LIKE'] = 450;
            counts['LOVE'] = 200;
            counts['WOW'] = 50;
            counts['HELPFUL'] = 25;
            if (reactionType) counts[reactionType] = (counts[reactionType] ?? 0) + 1;
            setBreakdown(counts);
            
            const realCount = post.reactionCount || (post as any).likeCount || (post as any).likes || 0;
            setLocalCount(realCount > 0 ? realCount : (725 + (reactionType ? 1 : 0)));
        }
    }, [post.reactions, post.isLiked, post.reactionCount, currentUser?.user?.userID]);

    // UI state
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
    const [showMenu, setShowMenu] = useState(false);

    // Inline comment state
    const [showComments, setShowComments] = useState(false);
    const [inlineComments, setInlineComments] = useState<InlineComment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);

    // PostDrawer state (for "Xem tất cả bình luận")
    const [showDrawer, setShowDrawer] = useState(false);

    // Field mapping
    const thumbnail = post.thumbnailUrl || (post as any).coverImage ||
        'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80';
    const authorName = post.authorName || (post as any).author?.name || 'Ẩn danh';
    const authorAvatar = post.authorAvatarUrl || (post as any).author?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=fb923c&color=fff`;
    const views = (post as any).viewCount ?? 0;
    const readTime = (post as any).readTimeMinutes ?? 5;
    const summary = (post as any).summary || post.content?.replace(/<[^>]*>/g, '').slice(0, 200) + '...' || '';
    const tags: string[] = (post as any).tags || [];

    // Linked services from mock data
    const linkedPlaces: any[] = (post as any).linkedPlaces || [];
    const linkedHotels: any[] = (post as any).linkedHotels || [];
    const linkedServices: any[] = post.taggedServiceIds || [];
    const hasLinks = linkedPlaces.length > 0 || linkedHotels.length > 0 || linkedServices.length > 0;

    // Me
    const meName = currentUser?.user?.name || 'Bạn';
    const meAvatar = currentUser?.user?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(meName)}&background=fb923c&color=fff`;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleReact = async (type: ReactionType) => {
        if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để thả cảm xúc'); return; }
        setIsReacting(true);
        const prev = localReaction;
        const wasReacted = prev === type;
        setLocalReaction(wasReacted ? null : type);
        setLocalCount(c => wasReacted ? Math.max(0, c - 1) : c + (prev ? 0 : 1));
        setBreakdown(bd => {
            const next = { ...bd };
            if (!wasReacted) next[type] = (next[type] ?? 0) + 1;
            if (prev && !wasReacted) next[prev] = Math.max(0, (next[prev] ?? 1) - 1);
            if (wasReacted) next[type] = Math.max(0, (next[type] ?? 1) - 1);
            return next;
        });
        try { await blogApi.toggleReaction(post.id, type); }
        catch {
            setLocalReaction(prev); setLocalCount(c => wasReacted ? c + 1 : Math.max(0, c - 1));
            toast.error('Không thể thực hiện yêu cầu');
        }
        finally { setIsReacting(false); }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/blog/${post.id}`;
        if (navigator.share) await navigator.share({ title: post.title, url });
        else { await navigator.clipboard.writeText(url); toast.success('Đã sao chép link!', { duration: 1500 }); }
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để lưu bài'); return; }
        setIsBookmarked(v => !v);
        toast.success(isBookmarked ? 'Đã bỏ lưu' : 'Đã lưu bài viết!', { duration: 1500 });
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowComments(v => {
            if (!v) setTimeout(() => commentInputRef.current?.focus(), 100);
            return !v;
        });
    };

    const handlePostComment = async () => {
        const text = commentText.trim();
        if (!text) return;
        if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để bình luận'); return; }
        setIsPostingComment(true);
        const optimistic: InlineComment = {
            id: `opt_${Date.now()}`, content: text, authorName: meName,
            authorAvatarUrl: meAvatar, createdAt: new Date().toISOString(),
        };
        setInlineComments(prev => [optimistic, ...prev]);
        setCommentText(''); setCommentCount(c => c + 1);
        try { await blogApi.addComment(post.id, text); }
        catch {
            setInlineComments(prev => prev.filter(c => c.id !== optimistic.id));
            setCommentCount(c => Math.max(0, c - 1));
            toast.error('Không thể đăng bình luận');
        }
        finally { setIsPostingComment(false); }
    };

    // ── Featured variant ────────────────────────────────────────────────────
    if (variant === 'featured') {
        return (
            <div onClick={() => navigate(`/blog/${post.id}`)}
                className="relative cursor-pointer rounded-2xl overflow-hidden group h-56 shadow-md hover:shadow-xl transition-all duration-300">
                <img src={thumbnail} alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                    {tags.slice(0, 2).map(t => (
                        <span key={t} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-orange-500/80 text-[10px] font-bold rounded-full">
                            #{t}
                        </span>
                    ))}
                    <h3 className="text-sm font-bold leading-snug mb-1.5 line-clamp-2">{post.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-white/75">
                        <div className="flex items-center gap-1.5">
                            <img src={authorAvatar} alt={authorName} className="w-4 h-4 rounded-full object-cover" />
                            <span>{authorName}</span>
                        </div>
                        <span><Heart className="w-3 h-3 fill-red-500 text-red-500 inline-block mr-1" /> {localCount}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ── Default (Facebook post style) ────────────────────────────────────────
    return (
        <>
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-visible">

                {/* ── Header ── */}
                <div className="flex items-start justify-between px-5 pt-4 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/blog/${post.id}`)}>
                        <img src={authorAvatar} alt={authorName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-100 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-tight truncate hover:text-orange-500 transition-colors">
                                {authorName}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{timeAgo(post.createdAt)}</span>
                                <span className="text-gray-200">·</span>
                                {views > 0
                                    ? <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{views.toLocaleString()}</span>
                                    : <span>{readTime} phút đọc</span>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                        <button onClick={handleBookmark}
                            className={`p-2 rounded-xl transition-all ${isBookmarked ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}>
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 min-w-[140px]">
                                    <button onClick={e => { e.stopPropagation(); navigate(`/blog/${post.id}`); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" /> Xem chi tiết
                                    </button>
                                    <button onClick={e => { handleShare(e); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                                        <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Post Body ── */}
                <div className="px-5 pb-3 cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {tags.slice(0, 4).map(t => (
                                <span key={t} className="px-2.5 py-0.5 bg-orange-50 text-orange-500 text-[11px] font-bold rounded-full border border-orange-100">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                    <h2 className="text-[17px] font-extrabold text-gray-900 leading-snug mb-2 hover:text-orange-500 transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                    {summary && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-3">{summary}</p>
                    )}
                </div>

                {/* ── Linked Services ── */}
                {hasLinks && (
                    <div className="px-5 pb-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center shadow-sm">
                                <MapPin className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Địa điểm & dịch vụ liên quan
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {linkedPlaces.map((p: any) => (
                                <ServiceChip key={p.id} name={p.name} type="place" id={p.id} />
                            ))}
                            {linkedHotels.map((h: any) => (
                                <ServiceChip key={h.id} name={h.name} type="hotel" id={h.id} />
                            ))}
                            {linkedServices.map((s: any) => (
                                <ServiceChip key={typeof s === 'string' ? s : s.id}
                                    name={typeof s === 'string' ? 'Dịch vụ' : s.serviceName} type="service"
                                    id={typeof s === 'string' ? s : s.id} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Thumbnail ── */}
                {thumbnail && (
                    <div className="overflow-hidden cursor-pointer aspect-video"
                        onClick={() => navigate(`/blog/${post.id}`)}>
                        <img src={thumbnail} alt={post.title}
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                )}

                {/* ── Stats Row ── */}
                <div className="px-5 py-2 flex items-center justify-between text-xs text-gray-400 border-b border-gray-100">
                    <ReactionSummaryRow reactions={breakdown} totalCount={localCount} userReaction={localReaction} />
                    <div className="flex items-center gap-3">
                        {commentCount > 0 && (
                            <button onClick={() => setShowDrawer(true)}
                                className="hover:text-orange-500 transition-colors cursor-pointer font-medium">
                                {commentCount} bình luận
                            </button>
                        )}
                        {views > 0 && <span>{views.toLocaleString()} lượt xem</span>}
                    </div>
                </div>

                {/* ── Action Bar ── */}
                <div className="px-3 py-0.5 flex items-center border-b border-gray-100" onClick={e => e.stopPropagation()}>
                    <div className="flex-1 flex justify-center py-0.5 overflow-visible">
                        <ReactionPicker
                            postId={post.id}
                            currentReaction={localReaction}
                            reactionCount={localCount}
                            reactionBreakdown={breakdown}
                            onReact={handleReact}
                            isLoading={isReacting}
                            size="sm"
                        />
                    </div>
                    <div className="w-px h-5 bg-gray-100" />
                    <button onClick={handleCommentClick}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${showComments ? 'text-orange-500 bg-orange-50' : 'text-gray-500 hover:bg-gray-100 hover:text-orange-500'
                            }`}>
                        <MessageCircle className="w-4 h-4" />
                        <span>Bình luận</span>
                        {commentCount > 0 && !showComments && (
                            <span className="text-[10px] font-bold text-gray-400">({commentCount})</span>
                        )}
                    </button>
                    <div className="w-px h-5 bg-gray-100" />
                    <button onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-blue-500 transition-all">
                        <Share2 className="w-4 h-4" />
                        <span>Chia sẻ</span>
                    </button>
                </div>

                {/* ── Inline Comment Section ── */}
                {showComments && (
                    <div className="px-4 pb-4 pt-3 bg-gray-50/50 rounded-b-2xl">
                        {inlineComments.length > 0 && (
                            <div className="space-y-2.5 mb-3 max-h-48 overflow-y-auto pr-1">
                                {inlineComments.map(c => <InlineCommentItem key={c.id} comment={c} />)}
                            </div>
                        )}

                        {inlineComments.length === 0 && commentCount === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2 flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange-400" /> Chưa có bình luận. Hãy là người đầu tiên!</p>
                        )}

                        {/* Show drawer link if there are more comments */}
                        {commentCount > inlineComments.length && (
                            <button onClick={() => setShowDrawer(true)}
                                className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline mb-2.5 block cursor-pointer">
                                Xem tất cả {commentCount} bình luận →
                            </button>
                        )}

                        {/* Input */}
                        <div className="flex gap-2 items-end">
                            <img src={meAvatar} alt={meName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1 flex items-end bg-white rounded-2xl border border-gray-200 px-3 py-2 gap-2 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                                <input
                                    ref={commentInputRef}
                                    type="text" value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePostComment()}
                                    placeholder={isAuthenticated ? 'Viết bình luận...' : 'Đăng nhập để bình luận...'}
                                    disabled={!isAuthenticated || isPostingComment}
                                    className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 disabled:opacity-60"
                                />
                                {commentText.trim() && (
                                    <button onClick={handlePostComment} disabled={isPostingComment}
                                        className="text-orange-500 hover:text-orange-600 disabled:opacity-40 transition-colors flex-shrink-0">
                                        {isPostingComment
                                            ? <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                            : <Send className="w-4 h-4" />
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </article>

            {/* ── Post Drawer ──────────────────────────────────────────────────────── */}
            <PostDrawer
                post={post}
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                currentReaction={localReaction}
                reactionCount={localCount}
                reactionBreakdown={breakdown}
                onReact={handleReact}
            />
        </>
    );
};

export default BlogCard;
