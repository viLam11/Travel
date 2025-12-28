// src/hooks/useBreadcrumbs.ts
import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  REGIONS, 
  DESTINATIONS, 
  SERVICE_TYPES,
  getDestinationInfo,
  getServiceTypeName,
  type RegionSlug,
  type DestinationSlug,
  type ServiceTypeSlug
} from '@/constants/regions';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface UseBreadcrumbsOptions {
  serviceName?: string; // Tên cụ thể của service (vd: "Vinpearl Resort")
}

/**
 * Hook để generate breadcrumbs tự động dựa trên URL
 * 
 * Examples:
 * - /destinations/mien-trung/da-nang
 *   → Trang chủ • Miền Trung • Khám phá Đà Nẵng
 * 
 * - /destinations/mien-trung/da-nang/hotel
 *   → Trang chủ • Miền Trung • Đà Nẵng • Khách sạn
 * 
 * - /destinations/mien-trung/da-nang/hotel/101-vinpearl
 *   → Trang chủ • Miền Trung • Đà Nẵng • Khách sạn • Vinpearl Resort
 */
export const useBreadcrumbs = (options: UseBreadcrumbsOptions = {}): BreadcrumbItem[] => {
  const { region, destination, serviceType } = useParams<{
    region?: string;
    destination?: string;
    serviceType?: string;
  }>();
  
  const location = useLocation();
  const { serviceName } = options;

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [];

    // 1. Trang chủ (luôn có)
    items.push({
      label: 'Trang chủ',
      href: '/',
    });

    // 2. Region (nếu có trong URL hoặc infer từ destination)
    let regionInfo = null;
    if (region) {
      regionInfo = REGIONS[region as RegionSlug];
    } else if (destination) {
      // Infer region từ destination
      const destInfo = getDestinationInfo(destination);
      if (destInfo) {
        regionInfo = REGIONS[destInfo.region];
      }
    }

    if (regionInfo) {
      items.push({
        label: regionInfo.name,
        href: `/destinations?region=${regionInfo.slug}`,
      });
    }

    // 3. Destination
    if (destination) {
      const destInfo = DESTINATIONS[destination as DestinationSlug];
      if (destInfo) {
        // Nếu có serviceType hoặc serviceName → link về destination detail
        // Nếu không → đây là trang cuối (active)
        const isActive = !serviceType && !serviceName;
        
        items.push({
          label: isActive ? `Khám phá ${destInfo.name}` : destInfo.name,
          href: isActive ? undefined : `/destinations/${regionInfo?.slug || destInfo.region}/${destInfo.slug}`,
          isActive: isActive,
        });
      }
    }

    // 4. Service Type (hotel/place)
    if (serviceType) {
      const serviceTypeName = getServiceTypeName(serviceType, true);
      
      // Nếu có serviceName → link về filter page
      // Nếu không → đây là trang cuối (active)
      const isActive = !serviceName;
      
      items.push({
        label: serviceTypeName,
        href: isActive 
          ? undefined 
          : `/destinations/${regionInfo?.slug}/${destination}/${serviceType}`,
        isActive: isActive,
      });
    }

    // 5. Service Detail (tên cụ thể của service)
    if (serviceName) {
      items.push({
        label: serviceName,
        isActive: true,
      });
    }

    return items;
  }, [region, destination, serviceType, serviceName, location.pathname]);

  return breadcrumbs;
};

/**
 * Hook để get page title từ breadcrumbs
 */
export const useBreadcrumbTitle = (options: UseBreadcrumbsOptions = {}): string => {
  const breadcrumbs = useBreadcrumbs(options);
  
  // Lấy item cuối cùng (trang hiện tại)
  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  return lastItem?.label || 'Trang chủ';
};