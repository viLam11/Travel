// src/hooks/useLazyImage.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';

// ==========================================
// UTILITIES
// ==========================================

//  Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// SINGLETON INTERSECTION OBSERVER POOL
// ==========================================
interface ObserverEntry {
  element: Element;
  callback: (isIntersecting: boolean) => void;
}

class LazyImageObserverPool {
  private static instance: LazyImageObserverPool;
  private observers: Map<string, IntersectionObserver> = new Map();
  private entries: Map<string, Set<ObserverEntry>> = new Map();

  private constructor() {}

  static getInstance(): LazyImageObserverPool {
    if (!LazyImageObserverPool.instance) {
      LazyImageObserverPool.instance = new LazyImageObserverPool();
    }
    return LazyImageObserverPool.instance;
  }

  private getObserverKey(rootMargin: string, threshold: number): string {
    return `${rootMargin}-${threshold}`;
  }

  observe(
    element: Element,
    callback: (isIntersecting: boolean) => void,
    rootMargin: string,
    threshold: number
  ): () => void {
    const key = this.getObserverKey(rootMargin, threshold);

    // Tạo observer nếu chưa có
    if (!this.observers.has(key)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const entrySet = this.entries.get(key);
            if (entrySet) {
              entrySet.forEach((observerEntry) => {
                if (observerEntry.element === entry.target) {
                  // 3️⃣ Observer đúng với once flag
                  observerEntry.callback(entry.isIntersecting);
                }
              });
            }
          });
        },
        { rootMargin, threshold }
      );
      this.observers.set(key, observer);
      this.entries.set(key, new Set());
    }

    const observer = this.observers.get(key)!;
    const entrySet = this.entries.get(key)!;
    const entry: ObserverEntry = { element, callback };

    entrySet.add(entry);
    observer.observe(element);

    // Return cleanup function
    return () => {
      entrySet.delete(entry);
      observer.unobserve(element);

      // Cleanup observer nếu không còn entry nào
    if (entrySet.size === 0) {
       setTimeout(() => {
        if (entrySet.size === 0) {
        observer.disconnect();
        this.observers.delete(key);
        this.entries.delete(key);
        }
        }, 300);
    }
    };
  }

  // Debug utility
  getStats() {
    return {
      observerCount: this.observers.size,
      totalEntries: Array.from(this.entries.values()).reduce(
        (sum, set) => sum + set.size,
        0
      )
    };
  }
}

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface UseLazyImageOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  priority?: 'high' | 'low';
  fallbackSrc?: string; // 2️⃣ Fallback image
  onLoad?: () => void;
  onError?: () => void;
  onInView?: () => void;
}

interface UseLazyImageReturn<T extends HTMLElement> {
  ref: RefObject<T>;
  imageLoaded: boolean;
  isInView: boolean;
  hasError: boolean;
  showPlaceholder: boolean;
  shouldLoadImage: boolean;
  currentSrc: string; // 2️⃣ Current image source (original or fallback)
  setImageLoaded: (loaded: boolean) => void;
  setHasError: (error: boolean) => void;
  reset: () => void;
}

// ==========================================
// MAIN HOOK
// ==========================================
export function useLazyImage<T extends HTMLElement = HTMLDivElement>(
  src: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn<T> {
  const {
    rootMargin = '100px',
    threshold = 0.01,
    once = true,
    priority = 'low',
    fallbackSrc, // 2️⃣ Fallback image option
    onLoad,
    onError,
    onInView
  } = options;

  const [imageLoaded, setImageLoadedState] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasErrorState] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src); // 2️⃣ Track current source
  
    const ref = useRef<T>(null!);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hasCalledOnLoadRef = useRef(false);
  const hasCalledOnErrorRef = useRef(false);
  const hasCalledOnInViewRef = useRef(false);
  const hasFallbackAttemptedRef = useRef(false);

  // Memoized callbacks
  const setImageLoaded = useCallback((loaded: boolean) => {
    setImageLoadedState(loaded);
    if (loaded && onLoad && !hasCalledOnLoadRef.current) {
      hasCalledOnLoadRef.current = true;
      onLoad();
    }
  }, [onLoad]);

  const setHasError = useCallback((error: boolean) => {
    setHasErrorState(error);
    
    // 2️⃣ Try fallback image on error
    if (error && fallbackSrc && !hasFallbackAttemptedRef.current) {
      hasFallbackAttemptedRef.current = true;
      setCurrentSrc(fallbackSrc);
      setHasErrorState(false); // Reset error để thử fallback
      setImageLoadedState(false);
      return; // Don't call onError yet, wait for fallback result
    }
    
    if (error && onError && !hasCalledOnErrorRef.current) {
      hasCalledOnErrorRef.current = true;
      onError();
    }
  }, [onError, fallbackSrc]);

  const reset = useCallback(() => {
    setImageLoadedState(false);
    setIsInView(false);
    setHasErrorState(false);
    setCurrentSrc(src);
    hasCalledOnLoadRef.current = false;
    hasCalledOnErrorRef.current = false;
    hasCalledOnInViewRef.current = false;
    hasFallbackAttemptedRef.current = false;
  }, [src]);

  // Preload for high priority
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (priority === 'high') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [src, priority]);

  // Main Intersection Observer effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!ref.current) return;

    const pool = LazyImageObserverPool.getInstance();
    const element = ref.current;

    cleanupRef.current = pool.observe(
      element,
      (isIntersecting) => {
        // 3️⃣ Correct once flag behavior
        if (isIntersecting) {
          setIsInView(true);
          
          // Callback onInView
          if (onInView && !hasCalledOnInViewRef.current) {
            hasCalledOnInViewRef.current = true;
            onInView();
          }

          // Disconnect nếu once = true
          if (once && cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
          }
        } else if (!once) {
          // 3️⃣ Nếu once = false, cho phép re-trigger
          setIsInView(false);
        }
      },
      rootMargin,
      threshold
    );

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [src, rootMargin, threshold, once, onInView]);

  // Derived states
  const showPlaceholder = !imageLoaded && !hasError;
  const shouldLoadImage = isInView && !hasError;

  return {
    ref,
    imageLoaded,
    isInView,
    hasError,
    showPlaceholder,
    shouldLoadImage,
    currentSrc, // 2️⃣ Return current source (might be fallback)
    setImageLoaded,
    setHasError,
    reset
  };
}

// ==========================================
// ADAPTIVE HOOK (WITH DEBOUNCED RESIZE)
// ==========================================
export function useLazyImageAdaptive<T extends HTMLElement = HTMLDivElement>(
  src: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn<T> {
  //  Debounced resize handler
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();

    //  Debounced resize listener (150ms)
    const debouncedResize = debounce(checkMobile, 150);

    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  const adaptiveOptions: UseLazyImageOptions = {
    ...options,
    rootMargin: isMobile ? '200px' : options.rootMargin || '100px'
  };

  return useLazyImage<T>(src, adaptiveOptions);
}

// ==========================================
// PRELOAD HOOK (DEPRECATED)
// ==========================================
export function useLazyImageWithPreload<T extends HTMLElement = HTMLDivElement>(
  src: string,
  priorityLevel: 'high' | 'low' = 'high',
  options: UseLazyImageOptions = {}
): UseLazyImageReturn<T> {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'useLazyImageWithPreload is deprecated. Use useLazyImage with priority option instead.'
    );
  }
  
  return useLazyImage<T>(src, {
    ...options,
    priority: priorityLevel
  });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Batch preload multiple images
export function preloadImages(urls: string[]): Promise<void[]> {
  if (typeof window === 'undefined') {
    return Promise.resolve([]);
  }

  const promises = urls.map(
    (url) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = url;
      })
  );

  return Promise.all(promises);
}

// Get observer stats (debugging)
export function getLazyImageStats() {
  if (typeof window === 'undefined') return null;
  
  const pool = LazyImageObserverPool.getInstance();
  return pool.getStats();
}

// 2️⃣ Check if image URL is valid/reachable
export function checkImageExists(url: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// ==========================================
// HOOK WITH AUTO-FALLBACK
// ==========================================
export function useLazyImageWithFallback<T extends HTMLElement = HTMLDivElement>(
  src: string,
  fallbacks: string[], // Array of fallback URLs
  options: Omit<UseLazyImageOptions, 'fallbackSrc'> = {}
): UseLazyImageReturn<T> & { fallbackIndex: number } {
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const [finalSrc, setFinalSrc] = useState(src);

  useEffect(() => {
    setFinalSrc(src);
    setFallbackIndex(-1);
  }, [src]);

  const handleError = useCallback(() => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbacks.length) {
      setFallbackIndex(nextIndex);
      setFinalSrc(fallbacks[nextIndex]);
    }
    options.onError?.();
  }, [fallbackIndex, fallbacks, options]);

  const result = useLazyImage<T>(finalSrc, {
    ...options,
    onError: handleError
  });

  return {
    ...result,
    fallbackIndex
  };
}