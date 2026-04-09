import React, { useState, useMemo } from 'react';
import { X, UserPlus } from 'lucide-react';
import Lottie from 'lottie-react';
import { REACTION_OPTIONS } from './ReactionPicker';
import type { ReactionType } from '@/types/blog.types';

interface ReactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: Partial<Record<ReactionType, number>>;
  totalCount: number;
  initialTab?: 'ALL' | ReactionType;
}

// Dữ liệu người dùng giả lập để test UI
const MOCK_USERS = [
  { id: '1', name: 'Duy Nguyễn', avatar: 'https://i.pravatar.cc/150?u=12' },
  { id: '2', name: 'Minh Khánh', avatar: 'https://i.pravatar.cc/150?u=22' },
  { id: '3', name: 'Trần Khoa', avatar: 'https://i.pravatar.cc/150?u=32' },
  { id: '4', name: 'An Lê', avatar: 'https://i.pravatar.cc/150?u=42' },
  { id: '5', name: 'Mai Phương', avatar: 'https://i.pravatar.cc/150?u=52' },
  { id: '6', name: 'Bảo Trâm', avatar: 'https://i.pravatar.cc/150?u=62' },
  { id: '7', name: 'Quốc Việt', avatar: 'https://i.pravatar.cc/150?u=72' },
  { id: '8', name: 'Hải Đăng', avatar: 'https://i.pravatar.cc/150?u=82' },
];

export const ReactionListModal: React.FC<ReactionListModalProps> = ({ isOpen, onClose, breakdown, totalCount, initialTab = 'ALL' }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | ReactionType>(initialTab);

  // Cập nhật tab active khi modal được mở ra với initialTab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Sinh ra danh sách user giả lập dựa theo số lượng breakdown để test
  const mockReactions = useMemo(() => {
    const arr: any[] = [];
    Object.entries(breakdown).forEach(([type, count]) => {
      // Giới hạn sinh ra tối đa 10 người mỗi loại để scroll mượt
      const loopCount = Math.min((count as number), 15);
      for (let i = 0; i < loopCount; i++) {
        const user = MOCK_USERS[(arr.length + i) % MOCK_USERS.length];
        arr.push({
          userId: user.id + '_' + type + i,
          name: user.name,
          avatar: user.avatar,
          reactionType: type as ReactionType
        });
      }
    });
    // Trộn ngẫu nhiên danh sách
    return arr.sort(() => Math.random() - 0.5);
  }, [breakdown]);

  if (!isOpen) return null;

  const validReactions = REACTION_OPTIONS.filter(o => (breakdown[o.type] || 0) > 0);
  const filteredList = activeTab === 'ALL' ? mockReactions : mockReactions.filter(r => r.reactionType === activeTab);

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

        {/* Lớp Danh sách users */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide bg-[#242526]">
          {filteredList.map(item => {
            const opt = REACTION_OPTIONS.find(o => o.type === item.reactionType);
            return (
              <div key={item.userId} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover group-hover:opacity-90 transition-opacity ring-1 ring-white/10" />
                    <div className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full ring-2 ring-[#242526] bg-[#242526] overflow-hidden flex items-center justify-center drop-shadow-md">
                      <Lottie animationData={opt?.lottieData} loop={true} />
                    </div>
                  </div>
                  <span className="font-bold text-[15px] text-gray-100 hover:underline">{item.name}</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-[13px] font-semibold text-gray-200 transition-colors active:scale-95">
                  <UserPlus className="w-4 h-4" />
                  Thêm bạn bè
                </button>
              </div>
            );
          })}
          {filteredList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <span className="text-sm font-semibold">Chưa có tương tác nào loại này</span>
            </div>
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
