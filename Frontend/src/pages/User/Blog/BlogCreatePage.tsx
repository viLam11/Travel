// src/pages/User/Blog/BlogCreatePage.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Image,
  MapPin,
  Hotel,
  Tag,
  X,
  Plus,
  Eye,
  Send,
  Search,
} from 'lucide-react';
import { blogStore } from '@/components/page/blog/blogMockData';
import type { BlogPost, LinkedService } from '@/types/blog.types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// For demo: available services to link
const AVAILABLE_PLACES: LinkedService[] = [
  { id: '10', name: 'Ngũ Hành Sơn', type: 'place', location: 'Đà Nẵng', destination: 'da-nang', region: 'mien-trung', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', rating: 4.7 },
  { id: '20', name: 'Bản Cát Cát', type: 'place', location: 'Sapa, Lào Cai', destination: 'sapa', region: 'mien-bac', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200', rating: 4.6 },
  { id: '30', name: 'Bãi Dài Phú Quốc', type: 'place', location: 'Phú Quốc', destination: 'phu-quoc', region: 'mien-nam', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=200', rating: 4.8 },
  { id: '40', name: 'Phố cổ Hội An', type: 'place', location: 'Hội An, Quảng Nam', destination: 'hoi-an', region: 'mien-trung', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200', rating: 4.9 },
  { id: '50', name: 'Đèo Mã Pí Lèng', type: 'place', location: 'Mèo Vạc, Hà Giang', destination: 'ha-giang', region: 'mien-bac', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200', rating: 4.9 },
];

const AVAILABLE_HOTELS: LinkedService[] = [
  { id: '1', name: 'Vinpearl Resort & Spa Đà Nẵng', type: 'hotel', location: 'Đà Nẵng', destination: 'da-nang', region: 'mien-trung', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200', rating: 4.8 },
  { id: '5', name: 'Topas Ecolodge Sapa', type: 'hotel', location: 'Sapa, Lào Cai', destination: 'sapa', region: 'mien-bac', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200', rating: 4.9 },
  { id: '8', name: 'JW Marriott Phú Quốc', type: 'hotel', location: 'Phú Quốc', destination: 'phu-quoc', region: 'mien-nam', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200', rating: 5.0 },
];

const SUGGESTED_TAGS = ['Biển', 'Núi', 'Ẩm thực', 'Trekking', 'Backpacker', 'Resort', 'Văn hóa', 'Mùa hè', 'Mùa đông', 'Gia đình', 'Cặp đôi', 'Solo'];

const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [linkedPlaces, setLinkedPlaces] = useState<LinkedService[]>([]);
  const [linkedHotels, setLinkedHotels] = useState<LinkedService[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = [...AVAILABLE_PLACES, ...AVAILABLE_HOTELS].filter(
    (s) =>
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const toggleService = (service: LinkedService) => {
    if (service.type === 'place') {
      setLinkedPlaces((prev) =>
        prev.find((s) => s.id === service.id)
          ? prev.filter((s) => s.id !== service.id)
          : [...prev, service]
      );
    } else {
      setLinkedHotels((prev) =>
        prev.find((s) => s.id === service.id)
          ? prev.filter((s) => s.id !== service.id)
          : [...prev, service]
      );
    }
  };

  const isSelected = (service: LinkedService) => {
    const list = service.type === 'place' ? linkedPlaces : linkedHotels;
    return list.some((s) => s.id === service.id);
  };

  const handlePublish = async () => {
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung bài viết'); return; }
    if (!summary.trim()) { toast.error('Vui lòng nhập tóm tắt bài viết'); return; }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newPost: BlogPost = {
      id: `post_${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.replace(/\n/g, '<br/>'),
      coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      author: {
        id: String(currentUser?.user?.userID ?? 'me'),
        name: currentUser?.user?.name || 'Anonymous',
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      commentCount: 0,
      viewCount: 0,
      tags,
      linkedPlaces,
      linkedHotels,
      readTimeMinutes: Math.max(1, Math.ceil(content.split(' ').length / 200)),
    };

    blogStore.addPost(newPost);
    toast.success('🎉 Bài viết đã được đăng thành công!');
    navigate('/blog');
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors font-medium text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{wordCount} từ · ~{readTime} phút đọc</span>
            <button
              onClick={() => setIsPreview((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                isPreview
                  ? 'bg-orange-50 text-orange-600 border-orange-200'
                  : 'text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              <Eye className="w-4 h-4" />
              {isPreview ? 'Chỉnh sửa' : 'Xem trước'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-orange-200"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Đăng bài
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isPreview ? (
          /* ─── Preview Mode ─── */
          <div>
            <div className="relative h-80 rounded-2xl overflow-hidden mb-8">
              <img
                src={coverImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'}
                alt="cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-orange-500/80 text-xs font-semibold rounded-full">#{t}</span>
                    ))}
                  </div>
                  <h1 className="text-3xl font-extrabold">{title || 'Tiêu đề bài viết...'}</h1>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl mb-6">
              <p className="italic text-gray-700">{summary || 'Tóm tắt bài viết...'}</p>
            </div>
            <div
              className="prose max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') || '<p class="text-gray-400">Nội dung bài viết...</p>' }}
            />
          </div>
        ) : (
          /* ─── Edit Mode ─── */
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-500" />
                Ảnh bìa (URL)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              {coverImageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden h-48">
                  <img src={coverImageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề bài viết *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hành trình khám phá..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-300"
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả ngắn *</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Một câu mô tả ngắn gọn, hấp dẫn về bài viết (hiển thị trong danh sách)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none placeholder-gray-300"
                rows={3}
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung bài viết *</label>
              <p className="text-xs text-gray-400 mb-3">Bạn có thể dùng Enter để xuống dòng, **in đậm**, ## tiêu đề</p>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ câu chuyện du lịch của bạn ở đây..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none placeholder-gray-300 leading-relaxed"
                rows={16}
              />
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                Tags (tối đa 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                    #{tag}
                    <button onClick={() => setTags((t) => t.filter((x) => x !== tag))} className="hover:text-orange-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput)}
                  placeholder="Nhập tag và Enter..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  disabled={tags.length >= 5}
                />
                <button
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:bg-gray-200 hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={tags.length >= 5}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 text-xs rounded-full transition-colors disabled:opacity-40"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Link Services */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Link địa điểm & khách sạn
                </label>
                <button
                  onClick={() => setShowServiceSearch((v) => !v)}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  {showServiceSearch ? 'Đóng' : '+ Thêm'}
                </button>
              </div>

              {/* Selected */}
              {(linkedPlaces.length > 0 || linkedHotels.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...linkedPlaces, ...linkedHotels].map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium rounded-full">
                      {s.type === 'hotel' ? <Hotel className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {s.name}
                      <button onClick={() => toggleService(s)} className="hover:text-orange-800">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showServiceSearch && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Tìm địa điểm hoặc khách sạn..."
                      className="flex-1 text-sm outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredServices.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                          isSelected(s) ? 'bg-orange-50' : ''
                        }`}
                      >
                        <img src={s.image} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.location}</p>
                        </div>
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected(s) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                        }`}>
                          {isSelected(s) && <span className="text-white text-xs">✓</span>}
                        </span>
                      </button>
                    ))}
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
