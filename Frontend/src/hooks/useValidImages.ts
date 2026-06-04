import { useState, useEffect } from 'react';
import { getCldUrl, isCldUrl } from '@/utils/cloudinaryImage';

/**
 * Validates a list of image URLs by attempting to preload each one.
 * For Cloudinary URLs, a tiny 60px variant is fetched to speed up the check.
 * Returns only the original URLs that successfully load (broken ones are filtered out).
 */
export function useValidImages(urls: string[]): {
  validImages: string[];
  isChecking: boolean;
} {
  const [validImages, setValidImages] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setValidImages([]);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    let cancelled = false;

    const checkImage = (url: string): Promise<string | null> =>
      new Promise((resolve) => {
        if (!url || url.trim() === '') {
          resolve(null);
          return;
        }
        // Use a small thumbnail (60px) for validation to minimize data usage
        const probeUrl = isCldUrl(url) ? getCldUrl(url, 60) : url;
        const img = new Image();
        img.onload = () => resolve(url); // Always return the original URL on success
        img.onerror = () => resolve(null);
        img.src = probeUrl;
      });

    Promise.all(urls.map(checkImage)).then((results) => {
      if (!cancelled) {
        setValidImages(results.filter((url): url is string => url !== null));
        setIsChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [urls.join(',')]);

  return { validImages, isChecking };
}
