// src/components/common/BreadcrumbSection.tsx
import React from 'react';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

interface BreadcrumbSectionProps {
  // Auto mode: tự động generate breadcrumb từ URL
  auto?: boolean;
  serviceName?: string; // Dùng cho ServiceDetailPage
  
  // Manual mode: truyền breadcrumb items thủ công
  breadcrumbItems?: BreadcrumbItem[];
  
  // Common props
  title: string;
  subtitle?: string;
  separator?: 'chevron' | 'slash' | 'dot';
  showHomeIcon?: boolean;
  className?: string;
  backgroundGradient?: boolean;
}

/**
 * BreadcrumbSection - Component hiển thị breadcrumb + title
 * 
 * Có 2 modes:
 * 1. AUTO MODE (recommended): Tự động generate breadcrumb từ URL
 *    <BreadcrumbSection auto title="Khám phá Đà Nẵng" />
 * 
 * 2. MANUAL MODE: Truyền breadcrumb items thủ công
 *    <BreadcrumbSection 
 *      breadcrumbItems={[...]} 
 *      title="Custom Title" 
 *    />
 */
export const BreadcrumbSection: React.FC<BreadcrumbSectionProps> = ({
  auto = false,
  serviceName,
  breadcrumbItems,
  title,
  subtitle,
  separator = 'dot',
  showHomeIcon = false,
  className = '',
  backgroundGradient = true
}) => {
  // Auto generate breadcrumbs nếu auto=true
  const autoBreadcrumbs = useBreadcrumbs({ serviceName });
  
  // Quyết định dùng auto hay manual breadcrumbs
  const finalBreadcrumbs = auto ? autoBreadcrumbs : (breadcrumbItems || []);

  return (
    <div
      className={`
        ${backgroundGradient ? 'bg-gradient-to-r from-orange-50 to-red-50' : 'bg-gray-50'}
        py-8 border-b border-gray-200
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        {finalBreadcrumbs.length > 0 && (
          <Breadcrumb
            items={finalBreadcrumbs}
            separator={separator}
            showHomeIcon={showHomeIcon}
            className="mb-3"
          />
        )}

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {title}
        </h1>

        {/* Optional Subtitle */}
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbSection;