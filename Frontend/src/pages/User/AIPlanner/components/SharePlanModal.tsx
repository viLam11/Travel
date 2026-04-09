// src/pages/User/AIPlanner/components/SharePlanModal.tsx
import React, { useState, useEffect } from 'react';
import { 
    X, Share2, Search, Link as LinkIcon, UserPlus, 
    ShieldCheck, Shield, ChevronDown, Trash2, Loader2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiPlannerApi, USE_MOCK_AI_PLANNER } from '@/api/aiPlannerApi';
import apiClient from '@/services/apiClient';
import Avatar from '@/components/common/avatar/Avatar';
import toast from 'react-hot-toast';
import type { Permission, UserInfo } from '@/types/aiPlanner.types';

interface SharePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
    isPublic: boolean;
    shareUrl?: string;
    onTogglePublic: (isPublic: boolean) => Promise<void>;
    members?: UserInfo[];
    onMemberChange?: () => void;
}

const SharePlanModal: React.FC<SharePlanModalProps> = ({
    isOpen,
    onClose,
    planId,
    isPublic,
    shareUrl,
    onTogglePublic,
    members = [],
    onMemberChange
}) => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission>('READ_ONLY');
    const [invitingId, setInvitingId] = useState<number | null>(null);

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
                    // Mock search results
                    results = [
                        { userID: 101, fullname: "Nguyễn Văn A", email: "vana@gmail.com" },
                        { userID: 102, fullname: "Trần Thị B", email: "thib@yahoo.com" },
                        { userID: 103, fullname: "Lê Văn C", email: "vanc@outlook.com" },
                        { userID: 104, fullname: "Phạm Minh D", email: "minhd@gmail.com" },
                    ].filter(u => 
                        u.fullname.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchKeyword.toLowerCase())
                    );
                } else {
                    const data = await apiClient.users.search(searchKeyword);
                    results = data;
                }
                
                // Filter out already invited members
                setSearchResults(results.filter((u: any) => !members.some(m => m.userID === u.userID)));
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword, members]);

    const handleInvite = async (user: UserInfo) => {
        setInvitingId(user.userID);
        try {
            await aiPlannerApi.inviteMember(planId, {
                memberId: user.userID.toString(),
                permission: selectedPermission
            });
            toast.success(`Đã gửi lời mời cho ${user.fullname}`);
            setSearchKeyword('');
            setSearchResults([]);
            onMemberChange?.();
        } catch (err) {
            toast.error('Gửi lời mời thất bại');
        } finally {
            setInvitingId(null);
        }
    };

    const handleCopyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Đã copy liên kết chia sẻ!');
        }
    };

    const handleRevoke = async (memberId: string) => {
        try {
            await aiPlannerApi.revokeAccess(planId, memberId);
            toast.success('Đã thu hồi quyền truy cập');
            onMemberChange?.();
        } catch (err) {
            toast.error('Thu hồi thất bại');
        }
    };

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
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-orange-500" />
                            <h3 className="font-bold text-gray-800 text-lg">Chia sẻ kế hoạch</h3>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        {/* Public Access Toggle */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold text-gray-700 text-sm">Chia sẻ công khai</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isPublic} 
                                        onChange={(e) => onTogglePublic(e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </label>
                            </div>
                            <p className="text-[11px] text-gray-500 mb-3">Bất kỳ ai có liên kết đều có thể xem kế hoạch này.</p>
                            {isPublic && (
                                <div className="flex gap-2">
                                    <input 
                                        readOnly 
                                        value={shareUrl || ''} 
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 font-mono overflow-ellipsis"
                                    />
                                    <button 
                                        onClick={handleCopyLink}
                                        className="bg-orange-100 text-orange-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-orange-200 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Invite People */}
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

                            {/* Search Results Dropdown */}
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
                                                    {invitingId === user.userID ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Current Members */}
                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-gray-700">Những người đã tham gia</label>
                            <div className="space-y-2">
                                {members.length > 0 ? members.map(member => (
                                    <div key={member.userID} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-50 bg-white hover:border-orange-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={member.fullname} size="sm" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{member.fullname}</p>
                                                <p className="text-[10px] text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                                Member
                                            </div>
                                            <button 
                                                onClick={() => handleRevoke(member.userID.toString())}
                                                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                                title="Gỡ bỏ"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        Chưa có thành viên nào khác
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100">
                        * Chỉ những người có tài khoản Travollo mới có thể tham gia cộng tác.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SharePlanModal;
