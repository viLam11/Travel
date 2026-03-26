// src/components/page/blog/ReportModal.tsx
import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { REPORT_REASONS } from '@/types/blog.types';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment';
  targetId: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetType }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    toast.success('Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét sớm nhất!');
    onClose();
    setSelectedReason('');
    setCustomNote('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Báo cáo nội dung</h3>
              <p className="text-sm text-gray-500">
                Báo cáo {targetType === 'post' ? 'bài viết' : 'bình luận'} vi phạm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Báo cáo sai sự thật có thể ảnh hưởng đến tài khoản của bạn. Chỉ báo cáo nội dung thực sự vi phạm.
          </p>
        </div>

        {/* Reasons */}
        <div className="space-y-2.5 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Chọn lý do báo cáo:</p>
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                selectedReason === reason.id
                  ? 'bg-orange-50 border-2 border-orange-400'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <input
                type="radio"
                name="reportReason"
                value={reason.id}
                checked={selectedReason === reason.id}
                onChange={() => setSelectedReason(reason.id)}
                className="accent-orange-500"
              />
              <span className="text-sm text-gray-700">{reason.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Note */}
        {selectedReason === 'other' && (
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Mô tả thêm về vấn đề bạn gặp phải..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent mb-4"
            rows={3}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Flag className="w-4 h-4" />
            )}
            Gửi báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
