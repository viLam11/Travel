import { cld, isCldConfigured } from '@/config/cloudinary';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
import type { CloudinaryImage as CldImg } from '@cloudinary/url-gen';

// Responsive srcSet breakpoints
export const SRCSET_WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600] as const;
export const CARD_WIDTHS   = [300, 400, 600, 800] as const;
export const HERO_WIDTHS   = [640, 960, 1280, 1600] as const;

export function isCldUrl(url: string): boolean {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

/**
 * Extract the public ID from a Cloudinary URL.
 *
 * Handles these URL shapes:
 *  /upload/v1234/folder/file.jpg          → folder/file
 *  /upload/w_800,f_auto/v1234/folder/file → folder/file   (strips named transforms)
 *  /upload/folder/file.png                → folder/file
 */
export function extractPublicId(cldUrl: string): string | null {
  try {
    const url = new URL(cldUrl);
    // path: /cloud/image/upload[/transforms][/vXXX]/public_id[.ext]
    const parts = url.pathname.split('/');
    const uploadIdx = parts.findIndex((p) => p === 'upload' || p === 'fetch');
    if (uploadIdx === -1) return null;

    // Everything after 'upload'
    const rest = parts.slice(uploadIdx + 1);

    // Drop leading transform segments (contain commas, underscores, or are vXXXXXX)
    const publicParts: string[] = [];
    let inPublicId = false;
    for (const seg of rest) {
      if (inPublicId) {
        publicParts.push(seg);
      } else if (/^v\d+$/.test(seg)) {
        // version segment — skip, now we're in public ID
        inPublicId = true;
      } else if (/[,_]/.test(seg) && !/\//.test(seg)) {
        // transform segment — skip
      } else {
        // First non-transform, non-version segment = start of public ID
        inPublicId = true;
        publicParts.push(seg);
      }
    }

    if (publicParts.length === 0) return null;

    // Strip file extension from last segment
    const last = publicParts[publicParts.length - 1].replace(/\.[a-zA-Z0-9]+$/, '');
    publicParts[publicParts.length - 1] = last;

    return publicParts.join('/');
  } catch {
    return null;
  }
}

/** Build a base CldImg with f_auto + q_auto baked in. */
function baseImg(publicId: string): CldImg {
  return cld
    .image(publicId)
    .delivery(format(autoFormat()))
    .delivery(quality(autoQuality()));
}

/**
 * Return an optimized Cloudinary URL for a single width.
 * Falls back to the original URL for non-Cloudinary sources.
 */
export function getCldUrl(url: string, width?: number): string {
  if (!url) return url;
  if (!isCldConfigured || !isCldUrl(url)) return url;

  const publicId = extractPublicId(url);
  if (!publicId) return url;

  try {
    const img = width
      ? baseImg(publicId).resize(scale().width(width))
      : baseImg(publicId);
    return img.toURL();
  } catch {
    return url;
  }
}

/**
 * Return a srcSet string with multiple Cloudinary widths.
 * Returns undefined for non-Cloudinary URLs (no srcSet needed).
 */
export function getCldSrcSet(
  url: string,
  widths: readonly number[] = SRCSET_WIDTHS
): string | undefined {
  if (!url || !isCldConfigured || !isCldUrl(url)) return undefined;

  const publicId = extractPublicId(url);
  if (!publicId) return undefined;

  try {
    return widths
      .map((w) => `${baseImg(publicId).resize(scale().width(w)).toURL()} ${w}w`)
      .join(', ');
  } catch {
    return undefined;
  }
}

/** Convenience wrapper — returns src + optional srcSet + sizes. */
export function getCldImageProps(
  url: string,
  options: { targetWidth?: number; widths?: readonly number[]; sizes?: string } = {}
): { src: string; srcSet?: string; sizes?: string } {
  const src = getCldUrl(url, options.targetWidth);
  const srcSet = getCldSrcSet(url, options.widths);
  return { src, srcSet, sizes: srcSet ? options.sizes : undefined };
}
