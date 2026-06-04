import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getCldUrl,
  getCldSrcSet,
  isCldUrl,
  CARD_WIDTHS,
} from '@/utils/cloudinaryImage';

type ObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  /** CSS sizes attribute, e.g. "(max-width: 768px) 100vw, 50vw" */
  sizes?: string;
  /** srcSet breakpoint widths in px — defaults to CARD_WIDTHS */
  widths?: readonly number[];
  /** Hint width for the default src (picked from widths or raw) */
  targetWidth?: number;
  objectFit?: ObjectFit;
  fallbackSrc?: string;
  /** high = load immediately (above-the-fold); low = lazy (default) */
  priority?: 'high' | 'low';
  /** Pixels before viewport to start loading — ignored when priority="high" */
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholderClassName?: string;
  /** DB image ID — shown in error state so broken images can be identified and deleted */
  imageId?: string;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  className = '',
  sizes,
  widths = CARD_WIDTHS,
  targetWidth,
  objectFit = 'cover',
  fallbackSrc = '/images/placeholder-destination.jpg',
  priority = 'low',
  rootMargin = '150px',
  onLoad,
  onError,
  placeholderClassName = '',
  imageId,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const text = imageId || src;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [imageId, src]);
  const isHigh = priority === 'high';

  const [isInView, setIsInView] = useState(isHigh);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const triedFallbackRef = useRef(false);

  // Intersection Observer for lazy-priority images only
  useEffect(() => {
    if (isHigh) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isHigh, rootMargin]);

  // Reset state when src changes (e.g. gallery navigation)
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
    triedFallbackRef.current = false;
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (!triedFallbackRef.current && fallbackSrc && currentSrc !== fallbackSrc) {
      triedFallbackRef.current = true;
      setCurrentSrc(fallbackSrc);
      setIsLoaded(false);
      return;
    }
    setHasError(true);
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Build Cloudinary-optimized src & srcSet only for Cloudinary-hosted images
  const isCld = isCldUrl(currentSrc);
  const optimizedSrc = isCld ? getCldUrl(currentSrc, targetWidth) : currentSrc;
  const srcSet = isCld ? getCldSrcSet(currentSrc, widths) : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${placeholderClassName}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Skeleton — shown only while loading, hidden immediately on load */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      )}

      {/* Error state — shows imageId so broken images can be deleted from DB */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-1 px-2">
          <svg
            className="w-7 h-7 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-400">Ảnh lỗi</p>
          {(imageId || src) && (
            <button
              onClick={handleCopyId}
              title={copied ? 'Đã copy!' : 'Click để copy ID'}
              className="mt-1 max-w-full px-2 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer group"
            >
              <span className="block text-[10px] font-mono text-red-600 break-all leading-tight">
                {imageId ? `ID: ${imageId}` : src.split('/').pop()}
              </span>
              <span className="block text-[9px] text-red-400 mt-0.5 group-hover:text-red-600">
                {copied ? '✓ Đã copy' : 'Click để copy'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Image — rendered only when in view to avoid wasted requests */}
      {isInView && !hasError && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={isHigh ? 'eager' : 'lazy'}
          fetchPriority={isHigh ? 'high' : 'low'}
          decoding={isHigh ? 'sync' : 'async'}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={{ objectFit, willChange: isLoaded ? 'auto' : 'opacity' }}
        />
      )}
    </div>
  );
};

export default CloudinaryImage;
