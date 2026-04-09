// src/components/page/blog/ReactionPicker.tsx
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import type { ReactionType } from '@/types/blog.types';

// Import Lottie JSON assets
import likeAnim from '@/assets/reactions/like.json';
import loveAnim from '@/assets/reactions/love.json';
import helpfulAnim from '@/assets/reactions/helpful.json';
import wowAnim from '@/assets/reactions/wow.json';
import sadAnim from '@/assets/reactions/sad.json';

export interface ReactionOption {
  type: ReactionType;
  lottieData: any;
  label: string;
  color: string;
  bgColor: string;
  borderClass: string;
}

// ── Backend-Compatible Animated Reaction Options ─────────────────────────────
export const REACTION_OPTIONS: ReactionOption[] = [
  {
    type: 'LIKE', lottieData: likeAnim, label: 'Thích',
    color: 'text-[#2078f4]', bgColor: 'bg-blue-50', borderClass: 'border-blue-200'
  },
  {
    type: 'LOVE', lottieData: loveAnim, label: 'Yêu thích',
    color: 'text-[#f33e58]', bgColor: 'bg-rose-50', borderClass: 'border-rose-200'
  },
  {
    type: 'HELPFUL', lottieData: helpfulAnim, label: 'Hữu ích',
    color: 'text-[#f7b125]', bgColor: 'bg-amber-50', borderClass: 'border-amber-200'
  },
  {
    type: 'WOW', lottieData: wowAnim, label: 'Wow',
    color: 'text-[#f7b125]', bgColor: 'bg-amber-50', borderClass: 'border-amber-200'
  },
  {
    type: 'SAD', lottieData: sadAnim, label: 'Buồn',
    color: 'text-[#f7b125]', bgColor: 'bg-sky-50', borderClass: 'border-sky-200'
  },
];

// ── Floating Emoji Effect ───────────────────────────────────────────────────
const FloatingEmoji: React.FC<{ lottieData: any; onComplete: () => void }> = ({ lottieData, onComplete }) => {
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, scale: 0.5 }}
      animate={{
        y: -300 - Math.random() * 150,
        x: Math.random() * 200 - 100,
        opacity: 0,
        scale: 2.2,
        rotate: Math.random() * 60 - 30
      }}
      transition={{ duration: 1.8, ease: [0.23, 1, 0.32, 1] }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-[10000] select-none"
      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <div className="w-20 h-20 filter drop-shadow-2xl">
        <Lottie animationData={lottieData} loop={true} />
      </div>
    </motion.div>
  );
};

interface ReactionPickerProps {
  postId: string;
  currentReaction?: ReactionType | null;
  reactionCount: number;
  reactionBreakdown?: Partial<Record<ReactionType, number>>;
  onReact: (type: ReactionType) => void;
  isLoading?: boolean;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
  currentReaction,
  reactionCount,
  reactionBreakdown,
  onReact,
  isLoading = false,
  size = 'md',
  children,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; lottieData: any }[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (isLoading) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setShowPicker(true), 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPicker(false);
  };

  const handleReact = (opt: ReactionOption) => {
    setFloatingEmojis(prev => [...prev, { id: Date.now(), lottieData: opt.lottieData }]);
    onReact(opt.type as ReactionType);
    setShowPicker(false);
  };

  const active = useMemo(() =>
    currentReaction ? REACTION_OPTIONS.find(r => r.type === currentReaction) : null
    , [currentReaction]);

  const isSm = size === 'sm';

  const breakdownItems = useMemo(() =>
    REACTION_OPTIONS
      .map(r => ({ ...r, count: reactionBreakdown?.[r.type as ReactionType] ?? 0 }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
    , [reactionBreakdown]);

  return (
    <div className="relative inline-flex group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

      {/* ── Floating Animation ── */}
      {floatingEmojis.map(fe => (
        <FloatingEmoji key={fe.id} lottieData={fe.lottieData} onComplete={() => setFloatingEmojis(p => p.filter(x => x.id !== fe.id))} />
      ))}

      {/* ── Facebook Native Style Picker ── */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="absolute bottom-full -left-4 pb-4 z-[9999]"
          >
            <div className="flex items-center gap-1 bg-[#1c1d1f]/95 backdrop-blur-md rounded-full px-2.5 py-1.5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              {REACTION_OPTIONS.map((r, i) => (
                <motion.button
                  key={r.type}
                  initial={{ opacity: 0, y: 30, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 450, damping: 25 }}
                  whileHover={{ scale: 1.2, y: -10, transition: { type: "spring", stiffness: 400, damping: 12 } }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleReact(r)}
                  className="relative group/item p-0.5"
                >
                  <div className="w-9 h-9 pointer-events-none drop-shadow-xl">
                    <Lottie animationData={r.lottieData} loop={true} />
                  </div>

                  {/* Floating Tooltip Label */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-all duration-200 pointer-events-none -translate-y-1 group-hover/item:translate-y-0 z-50">
                    <span className="bg-black/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-2xl ring-1 ring-white/10 block">
                      {r.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
            {/* Caret */}
            <div className="absolute bottom-[10px] left-10 w-3 h-3 bg-[#1c1d1f] rotate-45 ring-1 ring-white/10 border-none -z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger ── */}
      {children ? (
        <motion.div
          onClick={() => active ? handleReact(active) : handleReact(REACTION_OPTIONS[0])}
          className={`cursor-pointer transition-all duration-300 ${isLoading ? 'opacity-50' : ''}`}
          whileTap={{ scale: 0.94 }}
        >
          <div className={active ? 'scale-110 drop-shadow-lg' : ''}>
            {children}
          </div>
        </motion.div>
      ) : (
        <motion.button
          type="button" disabled={isLoading}
          whileTap={{ scale: 0.94 }}
          onClick={() => active ? onReact(active.type as ReactionType) : onReact('LIKE')}
          className={`flex items-center gap-2.5 rounded-2xl font-black transition-all select-none ${isSm ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-sm'} ${active ? `${active.bgColor} ${active.color} shadow-md scale-[1.05]` : 'bg-gray-100/50 text-gray-400 hover:bg-gray-100 border border-transparent hover:text-gray-600'}`}
        >
          {active ? (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-6 h-6"
            >
              <Lottie animationData={active.lottieData} loop={true} />
            </motion.div>
          ) : (
            <svg width={isSm ? 16 : 19} height={isSm ? 16 : 19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          )}
          <span>{active ? active.label : 'Thích'}</span>
          {reactionCount > 0 && <span className={`font-black tabular-nums transition-opacity ${active ? 'opacity-60' : 'opacity-40'}`}>{reactionCount.toLocaleString()}</span>}
        </motion.button>
      )}


    </div>
  );
};

export default ReactionPicker;

