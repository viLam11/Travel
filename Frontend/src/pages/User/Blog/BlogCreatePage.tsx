import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  Hotel,
  X,
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
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { blogApi } from '@/api/blogApi';
import { bookingApi } from '@/api/bookingApi';
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

// ── WYSIWYG Editor (Quill) ─────────────────────────────────────────────────────
const QUILL_MODULES = { toolbar: false };
const QUILL_FORMATS = ['bold', 'italic', 'underline', 'header', 'list', 'blockquote', 'indent'];

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<any>(null);

  const fmt = useCallback((type: string, val?: any) => {
    const q = quillRef.current?.getEditor?.();
    if (!q) return;
    q.focus();
    const current = q.getFormat();
    q.format(type, val !== undefined ? val : !current[type]);
  }, []);

  return (
    <div className="flex flex-col blog-quill-editor">
      {/* Custom toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <ToolbarBtn icon={<Bold className="w-4 h-4" />} label="In đậm" onClick={() => fmt('bold')} />
        <ToolbarBtn icon={<Italic className="w-4 h-4" />} label="In nghiêng" onClick={() => fmt('italic')} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn icon={<Heading2 className="w-4 h-4" />} label="Tiêu đề H2" onClick={() => fmt('header', 2)} />
        <ToolbarBtn icon={<Type className="w-4 h-4" />} label="Tiêu đề H3" onClick={() => fmt('header', 3)} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn icon={<List className="w-4 h-4" />} label="Danh sách" onClick={() => fmt('list', 'bullet')} />
        <ToolbarBtn icon={<Quote className="w-4 h-4" />} label="Trích dẫn" onClick={() => fmt('blockquote', true)} />
      </div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        placeholder={placeholder || 'Chia sẻ câu chuyện du lịch của bạn ở đây...'}
      />

      <style>{`
        .blog-quill-editor .ql-container.ql-snow { border: none; font-family: inherit; }
        .blog-quill-editor .ql-editor { min-height: 320px; font-size: 0.875rem; color: #374151; line-height: 1.75; padding: 0.875rem 1rem; }
        .blog-quill-editor .ql-editor.ql-blank::before { color: #d1d5db; font-style: italic; left: 1rem; }
        .blog-quill-editor .ql-editor h2 { font-size: 1.35rem; font-weight: 700; color: #111827; margin: 1.25rem 0 0.5rem; }
        .blog-quill-editor .ql-editor h3 { font-size: 1.1rem; font-weight: 600; color: #1f2937; margin: 1rem 0 0.375rem; }
        .blog-quill-editor .ql-editor p { margin-bottom: 0.5rem; }
        .blog-quill-editor .ql-editor ul, .blog-quill-editor .ql-editor ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .blog-quill-editor .ql-editor li { margin-bottom: 0.2rem; }
        .blog-quill-editor .ql-editor blockquote { border-left: 4px solid #f97316; padding: 0.5rem 1rem; color: #6b7280; font-style: italic; margin: 0.75rem 0; background: #fff7ed; border-radius: 0 8px 8px 0; }
        .blog-quill-editor .ql-editor strong { font-weight: 700; color: #111827; }
      `}</style>
    </div>
  );
};



// ── Reusable service row ───────────────────────────────────────────────────────
const ServiceRow: React.FC<{ service: any; selected: boolean; onToggle: () => void }> = ({
  service, selected, onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${selected ? 'bg-orange-50' : ''}`}
  >
    <img
      src={service.thumbnailUrl || 'https://via.placeholder.com/80'}
      alt={service.serviceName}
      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{service.serviceName}</p>
      <p className="text-xs text-gray-400 truncate">
        {service.province?.fullName || service.location || 'Việt Nam'}
      </p>
    </div>
    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
      selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
    }`}>
      {selected && <X className="text-white w-3 h-3" />}
    </span>
  </button>
);

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
  const [myServices, setMyServices] = useState<any[]>([]);
  const [isLoadingMyServices, setIsLoadingMyServices] = useState(false);
  const [serviceTab, setServiceTab] = useState<'mine' | 'search'>('mine');

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

  useEffect(() => {
    if (!showServiceSearch || myServices.length > 0) return;
    setIsLoadingMyServices(true);
    bookingApi.getMyBookedServices()
      .then(res => setMyServices(res))
      .catch(() => {})
      .finally(() => setIsLoadingMyServices(false));
  }, [showServiceSearch]);



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
    const emptyQuill = !plainContent || content === '<p><br></p>';
    if (emptyQuill) { toast.error('Vui lòng nhập nội dung bài viết'); return; }

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

  const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainContent ? plainContent.split(/\s+/).filter(Boolean).length : 0;
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
                {plainContent
                  ? plainContent.slice(0, 200) + (plainContent.length > 200 ? '...' : '')
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
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-orange-500', 'bg-orange-50/50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50/50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50/50');
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                        if (files.length > 0) {
                          setMediaFiles(prev => [...prev, ...files]);
                          const urls = files.map(file => URL.createObjectURL(file));
                          setPreviewUrls(prev => [...prev, ...urls]);
                          setImgError(false);
                        }
                      }
                    }}
                    className="flex-1 px-4 py-6 border-2 border-dashed border-gray-300 rounded-2xl text-sm text-center hover:bg-gray-50 hover:border-orange-400 transition-all cursor-pointer"
                  >
                    <label className="cursor-pointer block w-full h-full">
                      <span className="text-orange-500 font-semibold">Chọn ảnh</span> hoặc kéo thả vào đây
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onClick={(e) => {
                          // Reset value so that uploading the same file again triggers onChange
                          (e.target as HTMLInputElement).value = '';
                        }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const files = Array.from(e.target.files);
                            setMediaFiles(prev => [...prev, ...files]);
                            const urls = files.map(file => URL.createObjectURL(file));
                            setPreviewUrls(prev => [...prev, ...urls]);
                            setImgError(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {previewUrls.length > 0 && (
                    <button
                      onClick={() => {
                        // Cleanup object URLs to avoid memory leaks
                        previewUrls.forEach(url => URL.revokeObjectURL(url));
                        setMediaFiles([]);
                        setPreviewUrls([]);
                      }}
                      className="px-3 py-2 text-gray-400 hover:text-red-400 border border-gray-200 rounded-xl hover:border-red-200 transition-all cursor-pointer self-stretch flex items-center justify-center"
                      title="Xóa tất cả ảnh"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {previewUrls.length > 0 && !imgError && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewUrls.map((url, idx) => (
                      <div key={url + idx} className="relative rounded-xl overflow-hidden h-32 border border-gray-100 group">
                        <img
                          src={url}
                          alt="cover preview"
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaFiles(prev => prev.filter((_, i) => i !== idx));
                            setPreviewUrls(prev => {
                              URL.revokeObjectURL(prev[idx]);
                              return prev.filter((_, i) => i !== idx);
                            });
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md"
                          title="Xóa ảnh này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
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
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Chia sẻ câu chuyện du lịch của bạn ở đây..."
                />
              </div>
              <div className="px-4 pb-3 flex items-center justify-end text-xs text-gray-400">
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
                  {/* Tabs */}
                  <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => setServiceTab('mine')}
                      className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                        serviceTab === 'mine'
                          ? 'text-orange-500 border-b-2 border-orange-500 bg-white'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Hotel className="w-3.5 h-3.5 inline mr-1" />
                      Dịch vụ của tôi
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceTab('search')}
                      className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                        serviceTab === 'search'
                          ? 'text-orange-500 border-b-2 border-orange-500 bg-white'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5 inline mr-1" />
                      Tìm kiếm
                    </button>
                  </div>

                  {/* Tab: Dịch vụ của tôi */}
                  {serviceTab === 'mine' && (
                    <div className="max-h-56 overflow-y-auto">
                      {isLoadingMyServices ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                        </div>
                      ) : myServices.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">
                          Bạn chưa có dịch vụ nào được duyệt
                        </div>
                      ) : (
                        myServices.map((s) => (
                          <ServiceRow
                            key={s.id}
                            service={s}
                            selected={linkedServices.some((l) => l.id === s.id)}
                            onToggle={() => toggleService(s)}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab: Tìm kiếm */}
                  {serviceTab === 'search' && (
                    <>
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
                            <ServiceRow
                              key={s.id}
                              service={s}
                              selected={linkedServices.some((l) => l.id === s.id)}
                              onToggle={() => toggleService(s)}
                            />
                          ))
                        )}
                        {serviceSearch.length < 2 && searchResults.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-400">
                            Nhập ít nhất 2 ký tự để tìm kiếm
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
