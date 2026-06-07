import { getDestinationInfo } from '@/constants/regions';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface ProvinceInfo {
  code?: string;        // numeric code, e.g. "79", "48"
  name?: string;        // short name, e.g. "Hà Nội"
  fullName?: string;    // full name, e.g. "Thành phố Hà Nội"
  full_name?: string;   // snake_case variant from some API responses
  slug?: string;        // already-slugified, e.g. "ha-noi"
  code_name?: string;   // underscore form, e.g. "ho_chi_minh"
}

/**
 * Minimal service data needed to build a canonical detail URL.
 * Matches the raw API response shape so callers don't need to pre-map.
 *
 * serviceType accepted values (backend form OR frontend slug):
 *   HOTEL | hotel
 *   TICKET_VENUE | TOUR | ticket
 *   RESTAURANT | restaurant
 *   DESTINATION | PLACE | place
 */
export interface ServiceUrlInfo {
  id: string | number;
  serviceName: string;
  serviceType: string;
  province?: ProvinceInfo | string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Convert any Vietnamese text to a URL-safe slug. */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, 'd')           // đ doesn't decompose via NFD
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Resolves a province value (object or string) to a slug like "da-nang".
 * Lookup priority: numeric code → slug field → code_name → fullName → toSlug(name).
 * NEVER returns a bare numeric ID — always a text slug.
 */
function resolveProvinceSlug(province: ServiceUrlInfo['province']): string {
  if (!province) return 'vietnam';

  const lookup = (key: string): string | null => {
    if (!key) return null;
    const info = getDestinationInfo(key) ?? getDestinationInfo(toSlug(key));
    return info?.slug ?? null;
  };

  if (typeof province === 'string') {
    return (lookup(province) ?? toSlug(province)) || 'vietnam';
  }

  if (province.code) {
    const found = lookup(province.code);
    if (found) return found;
  }

  if (province.slug) {
    const found = lookup(province.slug);
    if (found) return found;
    if (/^[a-z0-9-]+$/.test(province.slug)) return province.slug;
  }

  if (province.code_name) {
    const slugified = province.code_name.replace(/_/g, '-').toLowerCase();
    const found = lookup(slugified);
    if (found) return found;
    return slugified;
  }

  const name = province.fullName ?? province.full_name ?? province.name ?? '';
  if (name) {
    return (lookup(name) ?? toSlug(name)) || 'vietnam';
  }

  return 'vietnam';
}

/** Returns "mien-bac" | "mien-trung" | "mien-nam" | "vietnam". */
function resolveRegionSlug(provinceSlug: string): string {
  return getDestinationInfo(provinceSlug)?.region ?? 'vietnam';
}

/** Maps backend serviceType (or frontend slug) to the URL segment. */
function resolveTypeSlug(serviceType: string): string {
  const t = serviceType.toUpperCase();
  if (t === 'TICKET_VENUE' || t === 'TOUR' || t === 'TICKET') return 'ticket';
  if (t === 'RESTAURANT') return 'restaurant';
  return 'place'; // DESTINATION | PLACE | unknown
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Builds the canonical frontend URL for a service detail page.
 *
 * Hotel:  /hotels/{region}/{province}/{id}-{name-slug}
 * Other:  /destinations/{region}/{province}/{type}/{id}-{name-slug}
 *
 * @example
 *   buildServiceDetailUrl({ id: 101, serviceName: 'Khách sạn Mường Thanh Luxury', serviceType: 'HOTEL', province: { code: '48' } })
 *   // → "/hotels/mien-trung/da-nang/101-khach-san-muong-thanh-luxury"
 *
 *   buildServiceDetailUrl({ id: 'abc-uuid', serviceName: 'Cáp treo Sun World', serviceType: 'TICKET_VENUE', province: { code: '31' } })
 *   // → "/destinations/mien-bac/hai-phong/ticket/abc-uuid-cap-treo-sun-world"
 */
export function buildServiceDetailUrl(service: ServiceUrlInfo): string {
  const provinceSlug = resolveProvinceSlug(service.province);
  const regionSlug = resolveRegionSlug(provinceSlug);
  const idSlug = `${service.id}-${toSlug(service.serviceName)}`;

  if (service.serviceType.toUpperCase() === 'HOTEL') {
    return `/hotels/${regionSlug}/${provinceSlug}/${idSlug}`;
  }

  const typeSlug = resolveTypeSlug(service.serviceType);
  return `/destinations/${regionSlug}/${provinceSlug}/${typeSlug}/${idSlug}`;
}

/**
 * Extracts the raw numeric ID or UUID from a URL slug param.
 * e.g. "123-ten-dich-vu" → "123", "abc-uuid-..." → full UUID
 */
export function extractServiceId(slug: string | undefined): string {
  if (!slug) return '';
  const uuidMatch = slug.match(
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
  );
  if (uuidMatch) return uuidMatch[1];
  const intMatch = slug.match(/^(\d+)/);
  if (intMatch) return intMatch[1];
  return slug;
}
