// src/components/common/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults?: number;
  resultsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalResults = 1473,
  resultsPerPage = 12
}) => {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="flex flex-col items-center gap-4 mt-10 mb-8">
      {/* Page Numbers */}
      <div className="flex gap-2">
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`
                w-10 h-10 rounded-lg font-medium transition-all
                ${currentPage === page 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                }
              `}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Results Info */}
      <p className="text-sm text-gray-600">
        Showing results {startResult}-{endResult} of {totalResults.toLocaleString()}
      </p>
    </div>
  );
};

export default Pagination;