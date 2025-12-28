// src/components/common/Breadcrumb.tsx
import React from 'react';
import { Link } from 'react-router-dom';
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
    const isClickable = (item.href || item.onClick) && !isLast && !item.isActive;

    const content = (
      <>
        {index === 0 && showHomeIcon && (
          <Home className="w-4 h-4 mr-1.5 inline-block" />
        )}
        {item.label}
      </>
    );

    // Nếu có href và clickable → dùng Link
    if (isClickable && item.href) {
      return (
        <Link
          key={index}
          to={item.href}
          className="text-gray-600 hover:text-orange-500 transition-colors text-sm font-medium"
        >
          {content}
        </Link>
      );
    }

    // Nếu có onClick → dùng button
    if (isClickable && item.onClick) {
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

    // Trang cuối hoặc active → span
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