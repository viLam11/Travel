// src/components/page/serviceDetail/reviews/ReviewsSection.tsx
import React, { useState, useMemo } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, Upload, Image as ImageIcon, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  cost?: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  verified?: boolean;
}

interface ReviewsSectionProps {
  serviceName: string;
  reviewText: string;
  setReviewText: (text: string) => void;
  reviewTitle: string;
  setReviewTitle: (title: string) => void;
  reviewCost: string;
  setReviewCost: (cost: string) => void;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewImages: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handleSubmitReview: () => void;
  displayedReviews: Review[];
  showAllReviews: boolean;
  setShowAllReviews: (show: boolean) => void;
  totalReviews: number;
  isLoggedIn: boolean;
}

type SortOption = 'newest' | 'helpful' | 'rating-high' | 'rating-low';

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  serviceName,
  reviewText,
  setReviewText,
  reviewTitle,
  setReviewTitle,
  reviewCost,
  setReviewCost,
  reviewRating,
  setReviewRating,
  reviewImages,
  handleImageUpload,
  handleRemoveImage,
  handleSubmitReview,
  displayedReviews,
  showAllReviews,
  setShowAllReviews,
  totalReviews,
  isLoggedIn
}) => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragAreaRef = React.useRef<HTMLDivElement>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [expandedImageReview, setExpandedImageReview] = useState<number | null>(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);
  const [reviewLikes, setReviewLikes] = useState<Record<number, boolean>>({});
  const [reviewDislikes, setReviewDislikes] = useState<Record<number, boolean>>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Calculate rating distribution
    const ratingDistribution = useMemo<Record<number, number>>(() => {
      // const allReviews = displayedReviews;
      const total = displayedReviews.length || 1;
      const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      displayedReviews.forEach(review => {
        dist[review.rating]++;
      });
  
      const percent: Record<number, number> = {
        5: Math.round((dist[5] / total) * 100),
        4: Math.round((dist[4] / total) * 100),
        3: Math.round((dist[3] / total) * 100),
        2: Math.round((dist[2] / total) * 100),
        1: Math.round((dist[1] / total) * 100)
      };
  
      return percent;
    }, [displayedReviews]);

  // Sort reviews
  const allSortedReviews = useMemo(() => {
    // const allReviews = displayedReviews;
    const sorted = [...displayedReviews];
    
    switch (sortBy) {
      case 'helpful':
        return sorted.sort((a, b) => (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful));
      case 'rating-high':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'newest':
      default:
        return sorted;
    }
  }, [displayedReviews, sortBy]);

  const reviewsToDisplay = showAllReviews ? allSortedReviews : allSortedReviews.slice(0, 2);
  const sortedReviews = reviewsToDisplay;

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      const newImages = imageFiles.map(file => URL.createObjectURL(file));
      const totalAfter = reviewImages.length + newImages.length;
      if (totalAfter > 12) {
        alert('Tối đa 12 ảnh');
        return;
      }
      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', { 
        value: { files: dataTransfer.files }, 
        enumerable: true 
      });
      handleImageUpload(event as any);
    }
  };

  const handleThumbsUp = (reviewId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setReviewLikes(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
    if (reviewDislikes[reviewId]) {
      setReviewDislikes(prev => ({
        ...prev,
        [reviewId]: false
      }));
    }
  };

  const handleThumbsDown = (reviewId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setReviewDislikes(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
    if (reviewLikes[reviewId]) {
      setReviewLikes(prev => ({
        ...prev,
        [reviewId]: false
      }));
    }
  };

  const handleReportReview = (reviewId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setReportedReviews(prev => new Set([...prev, reviewId]));
    alert('Cảm ơn bạn đã báo cáo review này');
  };

  const countAdditionalImages = (total: number) => {
    const shown = 3;
    return total > shown ? `+${total - shown}` : '';
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Viết đánh giá</h3>
      </div>

      {/* Write Review Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">Dịch vụ</label>
              <input
                type="text"
                value={serviceName}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Chi phí</label>
              <input
                type="text"
                value={reviewCost}
                onChange={(e) => setReviewCost(e.target.value)}
                placeholder="Nhập chi phí..."
                disabled={!isLoggedIn}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Đánh giá sao <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  disabled={!isLoggedIn}
                  className={`transition-all ${!isLoggedIn ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= reviewRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {reviewRating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {reviewRating === 1 && 'Rất tệ'}
                {reviewRating === 2 && 'Tệ'}
                {reviewRating === 3 && 'Bình thường'}
                {reviewRating === 4 && 'Tốt'}
                {reviewRating === 5 && 'Tuyệt vời'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tiêu đề đánh giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Vd: Dịch vụ tuyệt vời!"
              disabled={!isLoggedIn}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={isLoggedIn ? "Chia sẻ trải nghiệm của bạn..." : "Vui lòng đăng nhập để viết đánh giá"}
              disabled={!isLoggedIn}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Image Preview */}
          {reviewImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">Hình ảnh ({reviewImages.length}/12)</p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {reviewImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload Section - Desktop only */}
          {showImageUploader && !isMobile && (
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div
                ref={dragAreaRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">Kéo ảnh vào đây</p>
                <p className="text-xs text-gray-600">hoặc</p>
              </div>

              <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg cursor-pointer transition-colors mt-3 bg-orange-500 hover:bg-orange-600 text-white">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Chọn từ thiết bị</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={!isLoggedIn}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowImageUploader(false)}
                className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium mt-3"
              >
                Đóng
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {isMobile ? (
              <label className={`flex-1 border-2 border-orange-500 py-2.5 rounded-lg font-semibold text-sm text-center transition-colors ${
                isLoggedIn && reviewImages.length < 12
                  ? 'text-orange-500 hover:bg-orange-50 cursor-pointer'
                  : 'text-gray-400 border-gray-300 cursor-not-allowed'
              }`}>
                Thêm ảnh ({reviewImages.length}/12)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={!isLoggedIn || reviewImages.length >= 12}
                  className="hidden"
                />
              </label>
            ) : (
              <button
                onClick={() => setShowImageUploader(!showImageUploader)}
                disabled={!isLoggedIn || reviewImages.length >= 12}
                className={`flex-1 border-2 border-orange-500 py-2.5 rounded-lg font-semibold text-sm text-center transition-colors ${
                  isLoggedIn && reviewImages.length < 12
                    ? 'text-orange-500 hover:bg-orange-50 cursor-pointer'
                    : 'text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              >
                Thêm ảnh ({reviewImages.length}/12)
              </button>
            )}
            <button 
              onClick={handleSubmitReview}
              disabled={!isLoggedIn || reviewRating === 0 || !reviewTitle.trim() || !reviewText.trim()}
              className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm bình luận
            </button>
          </div>

          {!isLoggedIn && (
            <p className="text-sm text-orange-600 text-center">
              Vui lòng{' '}
              <button
                onClick={() => navigate('/login')}
                className="underline font-medium hover:text-orange-700 cursor-pointer"
              >
                đăng nhập
              </button>{' '}
              để viết đánh giá
            </p>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Phân loại đánh giá</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium text-gray-900">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${ratingDistribution[rating]}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{ratingDistribution[rating]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Header with Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Đánh giá ({totalReviews})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="newest">Mới nhất</option>
          <option value="helpful">Hữu ích nhất</option>
          <option value="rating-high">Rating cao nhất</option>
          <option value="rating-low">Rating thấp nhất</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 mt-8">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{review.author}</h4>
                  {review.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Đã xác minh
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{review.date}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.content}</p>
            {review.cost && (
              <p className="text-sm text-orange-600 font-medium mb-4">Chi phí: {review.cost}</p>
            )}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-3">
                  {review.images.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                      onClick={() => {
                        setExpandedImageReview(review.id);
                        setExpandedImageIndex(idx);
                      }}
                    >
                      <img
                        src={img}
                        alt={`Review ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {idx === 2 && review.images!.length > 3 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {countAdditionalImages(review.images!.length)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Lightbox */}
            {expandedImageReview === review.id && review.images && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <button
                  onClick={() => setExpandedImageReview(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                >
                  <X className="w-8 h-8" />
                </button>

                <div className="flex items-center justify-between w-full max-w-4xl">
                  <button
                    onClick={() =>
                      setExpandedImageIndex((prev) =>
                        prev === 0 ? review.images!.length - 1 : prev - 1
                      )
                    }
                    className="text-white text-3xl hover:text-gray-300 p-2"
                  >
                    &#10094;
                  </button>

                  <img
                    src={review.images[expandedImageIndex]}
                    alt={`Expanded ${expandedImageIndex + 1}`}
                    className="max-w-3xl max-h-[80vh] object-contain"
                  />

                  <button
                    onClick={() =>
                      setExpandedImageIndex((prev) =>
                        prev === review.images!.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="text-white text-3xl hover:text-gray-300 p-2"
                  >
                    &#10095;
                  </button>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {expandedImageIndex + 1} / {review.images.length}
                </div>
              </div>
            )}

            {/* Helpful Buttons + Report */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleThumbsUp(review.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  reviewLikes[review.id]
                    ? 'text-orange-500'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${reviewLikes[review.id] ? 'fill-orange-500' : ''}`} />
                <span>{(review.helpful || 0) + (reviewLikes[review.id] ? 1 : 0)}</span>
              </button>
              <button
                onClick={() => handleThumbsDown(review.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  reviewDislikes[review.id]
                    ? 'text-orange-500'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${reviewDislikes[review.id] ? 'fill-orange-500' : ''}`} />
                <span>{(review.notHelpful || 0) + (reviewDislikes[review.id] ? 1 : 0)}</span>
              </button>
              <span className="flex-1" />
              <button
                onClick={() => handleReportReview(review.id)}
                disabled={reportedReviews.has(review.id)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  reportedReviews.has(review.id)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Flag className="w-4 h-4" />
                <span>{reportedReviews.has(review.id) ? 'Đã báo cáo' : 'Báo cáo'}</span>
              </button>
            </div>
          </div>
        ))}

        {totalReviews > 2 && (
          <button 
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="w-full text-orange-500 font-medium text-sm hover:text-orange-600 transition-colors py-3"
          >
            {showAllReviews ? 'Thu gọn' : 'Xem thêm đánh giá'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;