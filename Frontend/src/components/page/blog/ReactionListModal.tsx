import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import { useQuery } from '@tanstack/react-query';
import { REACTION_OPTIONS } from './ReactionPicker';
import type { ReactionType } from '@/types/blog.types';
import { blogApi } from '@/api/blogApi';

interface ReactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: Partial<Record<ReactionType, number>>;
  totalCount: number;
  initialTab?: 'ALL' | ReactionType;
  postId: string;
}

export const ReactionListModal: React.FC<ReactionListModalProps> = ({ isOpen, onClose, breakdown, totalCount, initialTab = 'ALL', postId }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | ReactionType>(initialTab);

  const { data: reactionsData, isLoading } = useQuery({
    queryKey: ['blogReactions', postId],
    queryFn: () => blogApi.getReactionsForPost(postId),
    enabled: isOpen,
    staleTime: 60000,
  });

  const reactions = reactionsData?.reactions || [];

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const validReactions = REACTION_OPTIONS.filter(o => (breakdown[o.type] || 0) > 0);
  const filteredList = activeTab === 'ALL' ? reactions : reactions.filter(r => r.reactionType === activeTab);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[540px] bg-[#242526] text-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[70vh] max-h-[600px] border border-gray-700/50 relative" 
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalScaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        {/* Lớp Header Tab */}
        <div className="flex items-center gap-1 px-3 pt-2 border-b border-gray-700 relative select-none">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-3 font-semibold text-[15px] border-b-[3px] transition-all hover:bg-white/5 rounded-t-lg relative top-[1px] ${activeTab === 'ALL' ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent'}`}
          >
            Tất cả
          </button>
          
          {validReactions.map(opt => (
            <button 
              key={opt.type} 
              onClick={() => setActiveTab(opt.type)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-[3px] transition-all hover:bg-white/5 rounded-t-lg relative top-[1px] ${activeTab === opt.type ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent'}`}
            >
              <div className="w-5 h-5 drop-shadow-md"><Lottie animationData={opt.lottieData} loop={true}/></div>
              <span className="font-bold text-[15px]">{breakdown[opt.type]?.toLocaleString()}</span>
            </button>
          ))}

          {/* Nút Đóng */}
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide bg-[#242526]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Đang tải...</span>
            </div>
          ) : (
            <>
              {filteredList.map((item: any) => {
                const opt = REACTION_OPTIONS.find(o => o.type === item.reactionType);
                const userObj = item.user || {};
                const userName = item.username || item.name || userObj.fullname || userObj.username || 'Người dùng ẩn danh';
                const avatarUrl = item.avatarUrl || item.avatar || userObj.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=fb923c&color=fff`;
                return (
                  <div key={item.id || item.userId} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover group-hover:opacity-90 transition-opacity ring-1 ring-white/10" />
                        <div className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full ring-2 ring-[#242526] bg-[#242526] overflow-hidden flex items-center justify-center drop-shadow-md">
                          <Lottie animationData={opt?.lottieData} loop={true} />
                        </div>
                      </div>
                      <span className="font-bold text-[15px] text-gray-100 hover:underline">{userName}</span>
                    </div>

                  </div>
                );
              })}
              {!isLoading && filteredList.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2 min-h-[200px]">
                  <span className="text-sm font-semibold">Chưa có tương tác nào loại này</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
export default ReactionListModal;
