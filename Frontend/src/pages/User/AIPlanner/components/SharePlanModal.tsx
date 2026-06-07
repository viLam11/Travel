// src/pages/User/AIPlanner/components/SharePlanModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Share2, Search, Link as LinkIcon, UserPlus,
    ChevronDown, Trash2, Loader2, Globe, Lock, RefreshCw, Copy, Check,
    Clock, CheckCircle2, XCircle, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiPlannerApi, USE_MOCK_AI_PLANNER } from '@/api/aiPlannerApi';
import apiClient from '@/services/apiClient';
import Avatar from '@/components/common/avatar/Avatar';
import toast from 'react-hot-toast';
import type { Permission, UserInfo, CollaboratorInfo } from '@/types/aiPlanner.types';

interface SharePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
    isPublic: boolean;
    shareToken?: string;
    onTogglePublic: (isPublic: boolean) => Promise<void>;
    members?: UserInfo[];          // kept for backward compat, no longer used for display
    onMemberChange?: () => void;
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    ACCEPTED: { label: 'Đã tham gia', color: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING:  { label: 'Đang chờ',    color: 'bg-amber-50  text-amber-600  border-amber-200',  icon: <Clock          className="w-3 h-3" /> },
    DENIED:   { label: 'Đã từ chối', color: 'bg-red-50    text-red-500    border-red-200',    icon: <XCircle        className="w-3 h-3" /> },
} as const;

const PERM_CONFIG = {
    EDIT:      { label: 'Có thể sửa', color: 'bg-blue-50 text-blue-600' },
    READ_ONLY: { label: 'Chỉ xem',    color: 'bg-gray-50  text-gray-500' },
} as const;

// ─── Helper ────────────────────────────────────────────────────────────────────

const getFullShareUrl = (shareToken?: string): string => {
    if (!shareToken) return '';
    return `${window.location.origin}/ai-planner/share/${shareToken}`;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const SharePlanModal: React.FC<SharePlanModalProps> = ({
    isOpen,
    onClose,
    planId,
    isPublic,
    shareToken,
    onTogglePublic,
    onMemberChange,
}) => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission>('READ_ONLY');
    const [invitingId, setInvitingId] = useState<string | number | null>(null);
    const [currentShareToken, setCurrentShareToken] = useState(shareToken);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [copied, setCopied] = useState(false);

    // Collaborators with full status
    const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
    const [loadingCollabs, setLoadingCollabs] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    useEffect(() => {
        setCurrentShareToken(shareToken);
    }, [shareToken]);

    // Fetch collaborators when modal opens
    const fetchCollaborators = useCallback(async () => {
        if (!planId) return;
        setLoadingCollabs(true);
        try {
            const data = await aiPlannerApi.getCollaborators(planId);
            setCollaborators(data);
        } catch (err: any) {
            console.error('Failed to fetch collaborators', err);
            const status = err?.response?.status;
            if (status === 404) {
                toast.error('Endpoint danh sách cộng tác viên không tìm thấy (404). Kiểm tra lại URL API backend.');
            } else if (status === 403) {
                toast.error('Không có quyền xem danh sách cộng tác viên (403).');
            } else {
                toast.error(`Lỗi tải danh sách cộng tác viên: ${err?.message || 'Không xác định'}`);
            }
        } finally {
            setLoadingCollabs(false);
        }
    }, [planId]);

    useEffect(() => {
        if (isOpen) fetchCollaborators();
    }, [isOpen, fetchCollaborators]);

    // Search users with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchKeyword.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                let results: UserInfo[] = [];
                if (USE_MOCK_AI_PLANNER) {
                    results = [
                        { userID: 101, fullname: 'Nguyễn Văn A', email: 'vana@gmail.com' },
                        { userID: 102, fullname: 'Trần Thị B',   email: 'thib@yahoo.com' },
                        { userID: 103, fullname: 'Lê Văn C',     email: 'vanc@outlook.com' },
                        { userID: 104, fullname: 'Phạm Minh D',  email: 'minhd@gmail.com' },
                    ].filter(u =>
                        u.fullname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchKeyword.toLowerCase())
                    );
                } else {
                    const data = await apiClient.users.search(searchKeyword);
                    results = data;
                }
                // Exclude already-invited (any status) users
                const invitedIds = new Set(collaborators.map(c => c.user.userID));
                setSearchResults(results.filter((u: UserInfo) => !invitedIds.has(u.userID)));
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword, collaborators]);

    const handleInvite = async (user: UserInfo) => {
        setInvitingId(user.userID);
        try {
            await aiPlannerApi.inviteMember(planId, {
                memberId: user.userID.toString(),
                permission: selectedPermission,
            });
            toast.success(`Đã gửi lời mời cho ${user.fullname}`);
            setSearchKeyword('');
            setSearchResults([]);
            await fetchCollaborators(); // refresh list
            onMemberChange?.();
        } catch {
            toast.error('Gửi lời mời thất bại');
        } finally {
            setInvitingId(null);
        }
    };

    const handleCopyLink = async () => {
        const url = getFullShareUrl(currentShareToken);
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Đã copy liên kết chia sẻ!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Không thể copy, hãy copy thủ công.');
        }
    };

    const handleGenerateLink = async () => {
        setIsGeneratingLink(true);
        try {
            const res = await aiPlannerApi.generateShareLink(planId);
            setCurrentShareToken(res as unknown as string);
            toast.success('Đã tạo liên kết chia sẻ!');
        } catch {
            toast.error('Tạo liên kết thất bại');
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleRevoke = async (collab: CollaboratorInfo) => {
        const key = collab.collabId || collab.user.userID.toString();
        setRevokingId(key);
        try {
            await aiPlannerApi.revokeAccess(planId, collab.user.userID.toString());
            toast.success(`Đã thu hồi quyền của ${collab.user.fullname}`);
            setCollaborators(prev => prev.filter(c => c.user.userID !== collab.user.userID));
            onMemberChange?.();
        } catch {
            toast.error('Thu hồi thất bại');
        } finally {
            setRevokingId(null);
        }
    };

    const fullShareUrl = getFullShareUrl(currentShareToken);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-orange-500" />
                            <h3 className="font-bold text-gray-800 text-lg">Chia sẻ kế hoạch</h3>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">

                        {/* ── Public Access Toggle ── */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {isPublic
                                        ? <Globe className="w-4 h-4 text-green-500" />
                                        : <Lock  className="w-4 h-4 text-gray-500" />
                                    }
                                    <span className="font-semibold text-gray-700 text-sm">
                                        {isPublic ? 'Công khai' : 'Riêng tư'}
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => onTogglePublic(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                                </label>
                            </div>
                            <p className="text-[11px] text-gray-500 mb-3">
                                {isPublic
                                    ? 'Bất kỳ ai có liên kết đều có thể xem kế hoạch này.'
                                    : 'Chỉ bạn và các cộng tác viên được mời mới có thể xem.'
                                }
                            </p>

                            {isPublic && (
                                <div className="space-y-2">
                                    {fullShareUrl ? (
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={fullShareUrl}
                                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 font-mono overflow-ellipsis"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copied ? 'Đã copy' : 'Copy'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGenerateLink}
                                            disabled={isGeneratingLink}
                                            className="w-full flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl px-3 py-2 text-xs font-bold hover:bg-orange-100 transition-colors disabled:opacity-60"
                                        >
                                            {isGeneratingLink
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <LinkIcon className="w-3.5 h-3.5" />
                                            }
                                            {isGeneratingLink ? 'Đang tạo liên kết...' : 'Tạo liên kết chia sẻ'}
                                        </button>
                                    )}
                                    {fullShareUrl && (
                                        <button
                                            onClick={handleGenerateLink}
                                            disabled={isGeneratingLink}
                                            className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-orange-500 transition-colors mx-auto"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${isGeneratingLink ? 'animate-spin' : ''}`} />
                                            Tạo liên kết mới
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Invite People ── */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">Mời cộng tác viên</label>
                                <div className="relative">
                                    <select
                                        value={selectedPermission}
                                        onChange={(e) => setSelectedPermission(e.target.value as Permission)}
                                        className="appearance-none bg-orange-50 text-orange-600 text-[10px] font-bold py-1 pl-2 pr-6 rounded-lg focus:outline-none cursor-pointer border-none"
                                    >
                                        <option value="READ_ONLY">Chỉ xem</option>
                                        <option value="EDIT">Có thể sửa</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-orange-400 absolute right-2 top-1.5 pointer-events-none" />
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                                />
                                {isSearching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-orange-400 animate-spin" />}
                            </div>

                            {/* Search Results */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white border border-gray-100 rounded-xl shadow-lg divide-y divide-gray-50 max-h-48 overflow-y-auto"
                                    >
                                        {searchResults.map(user => (
                                            <div key={user.userID} className="p-3 flex items-center justify-between hover:bg-orange-50 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={user.fullname} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{user.fullname}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleInvite(user)}
                                                    disabled={invitingId === user.userID}
                                                    className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                                                >
                                                    {invitingId === user.userID
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <UserPlus className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Collaborators List ── */}
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">
                                    Danh sách cộng tác viên
                                </label>
                                {loadingCollabs && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />}
                                {!loadingCollabs && collaborators.length > 0 && (
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {collaborators.filter(c => c.status === 'ACCEPTED').length} đang tham gia
                                        {collaborators.filter(c => c.status === 'PENDING').length > 0 &&
                                            ` · ${collaborators.filter(c => c.status === 'PENDING').length} đang chờ`
                                        }
                                    </span>
                                )}
                            </div>

                            {loadingCollabs ? (
                                <div className="space-y-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : collaborators.length === 0 ? (
                                <div className="text-center py-5 text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    Chưa có cộng tác viên nào. Mời người khác bằng form trên.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {collaborators.map(collab => {
                                        const statusCfg = STATUS_CONFIG[collab.status] ?? STATUS_CONFIG.PENDING;
                                        const permCfg   = PERM_CONFIG[collab.permission] ?? PERM_CONFIG.READ_ONLY;
                                        const key = collab.collabId || collab.user.userID.toString();
                                        const isRevoking = revokingId === key;

                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                                    collab.status === 'DENIED'
                                                        ? 'border-red-50 bg-red-50/30 opacity-70'
                                                        : collab.status === 'PENDING'
                                                            ? 'border-amber-100 bg-amber-50/20'
                                                            : 'border-gray-100 bg-white'
                                                }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <Avatar name={collab.user.fullname} avatarUrl={collab.user.avatar} size="sm" />
                                                    {collab.status === 'ACCEPTED' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border border-white flex items-center justify-center">
                                                            <Check className="w-2 h-2 text-white" />
                                                        </div>
                                                    )}
                                                    {collab.status === 'PENDING' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border border-white flex items-center justify-center">
                                                            <Clock className="w-2 h-2 text-white" />
                                                        </div>
                                                    )}
                                                    {collab.status === 'DENIED' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-400 rounded-full border border-white flex items-center justify-center">
                                                            <X className="w-2 h-2 text-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{collab.user.fullname}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{collab.user.email}</p>
                                                </div>

                                                {/* Badges */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${statusCfg.color}`}>
                                                        {statusCfg.icon}
                                                        {statusCfg.label}
                                                    </span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${permCfg.color}`}>
                                                        {permCfg.label}
                                                    </span>
                                                </div>

                                                {/* Revoke */}
                                                <button
                                                    onClick={() => handleRevoke(collab)}
                                                    disabled={isRevoking}
                                                    title="Thu hồi quyền truy cập"
                                                    className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-40 transition-colors shrink-0"
                                                >
                                                    {isRevoking
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                                                        : <Trash2 className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100 shrink-0">
                        * Chỉ những người có tài khoản Travollo mới có thể tham gia cộng tác.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SharePlanModal;
