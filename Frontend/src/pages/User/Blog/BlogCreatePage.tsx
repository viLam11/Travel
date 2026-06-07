import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  Hotel,
  Tag,
  X,
  Plus,
  Eye,
  Send,
  Search,
  Loader2,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Type,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { blogApi } from '@/api/blogApi';
import { serviceApi } from '@/api/serviceApi';
import type { BlogRequest, BlogStatus } from '@/types/blog.types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { renderPreview } from '@/utils/blog.util';



// ── Simple Toolbar Button ──────────────────────────────────────────────────────
interface ToolbarBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}
const ToolbarBtn: React.FC<ToolbarBtnProps> = ({ icon, label, onClick, active }) => (
  <button
    type="button"
    title={label}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-all ${
      active
        ? 'bg-orange-100 text-orange-600'
        : 'text-gray-500 hover:bg-gray-100 hover:text-orange-500'
    }`}
  >
    {icon}
  </button>
);

// ── Textarea with auto-resize ──────────────────────────────────────────────────
interface SmartTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}
const SmartTextarea: React.FC<SmartTextareaProps> = ({
  value, onChange, placeholder, minRows = 14,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`;
  }, [value, minRows]);

  const insertAtCursor = useCallback((before: string, after = '', defaultText = '') => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      const newCursor = start + before.length + selected.length;
      el.setSelectionRange(newCursor, newCursor);
    }, 0);
  }, [value, onChange]);

  const insertLinePrefix = useCallback((prefix: string, defaultText = '') => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, end) || defaultText;
    // Toggle: if line already starts with prefix, remove it
    const newLine = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
    const newVal = value.slice(0, lineStart) + newLine + value.slice(end);
    onChange(newVal);
    setTimeout(() => el.focus(), 0);
  }, [value, onChange]);

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-xl flex-wrap">
        <ToolbarBtn icon={<Bold className="w-4 h-4" />} label="In đậm" onClick={() => insertAtCursor('**', '**', 'chữ đậm')} />
        <ToolbarBtn icon={<Italic className="w-4 h-4" />} label="In nghiêng" onClick={() => insertAtCursor('*', '*', 'chữ nghiêng')} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn icon={<Heading2 className="w-4 h-4" />} label="Tiêu đề H2" onClick={() => insertLinePrefix('## ', 'Tiêu đề phần')} />
        <ToolbarBtn icon={<Type className="w-4 h-4" />} label="Tiêu đề H3" onClick={() => insertLinePrefix('### ', 'Tiêu đề nhỏ')} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn icon={<List className="w-4 h-4" />} label="Danh sách" onClick={() => insertLinePrefix('- ', 'Mục danh sách')} />
        <ToolbarBtn icon={<Quote className="w-4 h-4" />} label="Trích dẫn" onClick={() => insertLinePrefix('> ', 'Nội dung trích dẫn')} />
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-0 rounded-b-xl text-sm text-gray-700 outline-none resize-none placeholder-gray-300 leading-relaxed bg-white focus:ring-0 min-h-[320px]"
        style={{ overflow: 'hidden' }}
      />
    </div>
  );
};



// ── Main Component ────────────────────────────────────────────────────────────
const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [linkedServices, setLinkedServices] = useState<any[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (serviceSearch.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await serviceApi.searchServices({ keyword: serviceSearch, page: 0, size: 10 });
          setSearchResults(response.data || []);
        } catch {
          /* silently fail */
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [serviceSearch]);



  const toggleService = (service: any) => {
    setLinkedServices((prev) =>
      prev.find((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handlePublish = async () => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để viết bài'); return; }
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung bài viết'); return; }

    setIsSubmitting(true);
    try {
      const blogReq: BlogRequest = {
        title: title.trim(),
        content: content.trim(),
        mediaUrls: mediaFiles,
        status: 'PUBLISHED' as BlogStatus,
        taggedServiceIds: linkedServices.map((s) => s.id),
      };
      await blogApi.createPost(blogReq);
      toast.success('Bài viết đã được đăng tải thành công!');
      navigate('/blog');
    } catch {
      toast.error('Có lỗi xảy ra khi đăng bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const coverSrc = previewUrls.length > 0 ? previewUrls[0] : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors font-medium text-sm flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-gray-400 hidden md:inline bg-gray-50 px-2 py-1 rounded-lg">
              {wordCount} từ · ~{readTime} phút đọc
            </span>

            <button
              onClick={() => setIsPreview((v) => !v)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                isPreview
                  ? 'bg-orange-50 text-orange-600 border-orange-200'
                  : 'text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              {isPreview ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPreview ? 'Chỉnh sửa' : 'Xem trước'}</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-orange-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Đang đăng...' : 'Đăng bài'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isPreview ? (
          /* ─── Preview Mode ─── */
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Cover */}
            <div className="relative h-72 sm:h-96 overflow-hidden">
              <img
                src={coverSrc}
                alt="cover"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight drop-shadow">
                  {title || <span className="opacity-50">Tiêu đề bài viết...</span>}
                </h1>
                <div className="flex items-center gap-3 mt-3 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-xs">
                      You
                    </div>
                    <span className="font-semibold text-white">Bạn</span>
                  </div>
                  <span>·</span>
                  <span>{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <span>·</span>
                  <span>{readTime} phút đọc</span>
                </div>
              </div>
            </div>

            {/* Summary box */}
            <div className="mx-6 sm:mx-10 mt-8 mb-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-r-2xl">
              <p className="text-gray-600 italic text-sm leading-relaxed">
                {content
                  ? content.replace(/[#*>`-]/g, '').slice(0, 200) + (content.length > 200 ? '...' : '')
                  : 'Tóm tắt bài viết sẽ hiển thị ở đây...'}
              </p>
            </div>

            {/* Rendered content */}
            <div
              className="px-6 sm:px-10 pb-10 prose prose-orange max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />
          </div>
        ) : (
          /* ─── Edit Mode ─── */
          <div className="space-y-5">
            {/* Cover Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <label className="text-sm font-semibold text-gray-700">Ảnh bìa</label>
                <span className="text-xs text-gray-400">(Tải ảnh từ thiết bị)</span>
              </div>
              <div className="px-6 py-4">
                <div className="flex gap-3 items-center">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-center hover:bg-gray-50 transition-colors">
                      <span className="text-orange-500 font-semibold">Chọn ảnh</span> hoặc kéo thả vào đây
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const files = Array.from(e.target.files);
                          setMediaFiles(files);
                          const urls = files.map(file => URL.createObjectURL(file));
                          setPreviewUrls(urls);
                          setImgError(false);
                        }
                      }}
                    />
                  </label>
                  {previewUrls.length > 0 && (
                    <button
                      onClick={() => {
                        setMediaFiles([]);
                        setPreviewUrls([]);
                      }}
                      className="px-3 py-2 text-gray-400 hover:text-red-400 border border-gray-200 rounded-xl hover:border-red-200 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {previewUrls.length > 0 && !imgError && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden h-32 border border-gray-100">
                        <img
                          src={url}
                          alt="cover preview"
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {imgError && (
                  <p className="mt-2 flex items-center text-xs text-red-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Có lỗi khi hiển thị ảnh
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề bài viết <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hành trình khám phá..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-300"
              />
              <p className="text-xs text-gray-400 mt-1.5">{title.length}/150 ký tự</p>
            </div>

            {/* Content with Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-0">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nội dung bài viết <span className="text-orange-500">*</span>
                </label>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden mx-4 mb-4">
                <SmartTextarea
                  value={content}
                  onChange={setContent}
                  placeholder={`Chia sẻ câu chuyện du lịch của bạn ở đây...

## Bắt đầu hành trình
Mô tả điểm đến và lý do bạn chọn nơi này...

## Những điều không thể bỏ lỡ
- Điểm tham quan đầu tiên...
- Ẩm thực đặc trưng...

> Mẹo: Dùng toolbar phía trên để định dạng văn bản`}
                  minRows={14}
                />
              </div>
              <div className="px-4 pb-3 flex items-center justify-between text-xs text-gray-400">
                <span>Hỗ trợ Markdown // **đậm** *nghiêng* ## Tiêu đề - Danh sách {'>'} Trích dẫn</span>
                <span>{wordCount} từ</span>
              </div>
            </div>



            {/* Link Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Link địa điểm &amp; lưu trú
                  <span className="text-xs font-normal text-gray-400">(không bắt buộc)</span>
                </label>
                <button
                  onClick={() => setShowServiceSearch((v) => !v)}
                  className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                >
                  {showServiceSearch ? 'Đóng' : '+ Thêm'}
                </button>
              </div>

              {linkedServices.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {linkedServices.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold rounded-full"
                    >
                      {s.serviceType === 'HOTEL' ? (
                        <Hotel className="w-3 h-3" />
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                      {s.serviceName}
                      <button
                        onClick={() => toggleService(s)}
                        className="hover:text-orange-800 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showServiceSearch && (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50/50">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Tìm địa điểm hoặc khách sạn..."
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    {isSearching && <Loader2 className="w-4 h-4 animate-spin text-orange-400 flex-shrink-0" />}
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {serviceSearch.length >= 2 && !isSearching && searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">Không tìm thấy kết quả</div>
                    ) : (
                      searchResults.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => toggleService(s)}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                            linkedServices.some((l) => l.id === s.id) ? 'bg-orange-50' : ''
                          }`}
                        >
                          <img
                            src={s.thumbnailUrl || 'https://via.placeholder.com/80'}
                            alt={s.serviceName}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{s.serviceName}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {s.province?.fullName || 'Việt Nam'}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              linkedServices.some((l) => l.id === s.id)
                                ? 'bg-orange-500 border-orange-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {linkedServices.some((l) => l.id === s.id) && (
                              <X className="text-white w-3 h-3" />
                            )}
                          </span>
                        </button>
                      ))
                    )}
                    {serviceSearch.length < 2 && searchResults.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-400">
                        Nhập ít nhất 2 ký tự để tìm kiếm
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCreatePage;
