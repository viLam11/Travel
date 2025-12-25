// src/components/common/Breadcrumb.tsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash' | 'dot';
  showHomeIcon?: boolean;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = 'dot',
  showHomeIcon = false,
  className = ''
}) => {
  const renderSeparator = () => {
    switch (separator) {
      case 'chevron':
        return <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />;
      case 'slash':
        return <span className="text-gray-400 mx-2">/</span>;
      case 'dot':
      default:
        return <span className="text-gray-400 mx-2">•</span>;
    }
  };

  const renderItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === items.length - 1;
    const isClickable = item.href || item.onClick;

    const content = (
      <>
        {index === 0 && showHomeIcon && (
          <Home className="w-4 h-4 mr-1.5 inline-block" />
        )}
        {item.label}
      </>
    );

    if (isClickable && !isLast) {
      return (
        <button
          key={index}
          onClick={item.onClick}
          className="text-gray-600 hover:text-orange-500 transition-colors text-sm font-medium"
        >
          {content}
        </button>
      );
    }

    return (
      <span
        key={index}
        className={`text-sm ${
          isLast || item.isActive
            ? 'text-gray-900 font-semibold'
            : 'text-gray-600'
        }`}
      >
        {content}
      </span>
    );
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {renderItem(item, index)}
            {index < items.length - 1 && renderSeparator()}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

// ============================================
// BREADCRUMB SECTION COMPONENT (With Header)
// ============================================

interface BreadcrumbSectionProps {
  breadcrumbItems: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  separator?: 'chevron' | 'slash' | 'dot';
  showHomeIcon?: boolean;
  className?: string;
  backgroundGradient?: boolean;
}

export const BreadcrumbSection: React.FC<BreadcrumbSectionProps> = ({
  breadcrumbItems,
  title,
  subtitle,
  separator = 'dot',
  showHomeIcon = false,
  className = '',
  backgroundGradient = true
}) => {
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
        <Breadcrumb
          items={breadcrumbItems}
          separator={separator}
          showHomeIcon={showHomeIcon}
          className="mb-3"
        />

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