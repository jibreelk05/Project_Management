import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const btnClass =
    'flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-500">{total} result{total !== 1 ? 's' : ''}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnClass} text-gray-700 hover:bg-gray-50`}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="px-2 text-sm font-medium text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnClass} text-gray-700 hover:bg-gray-50`}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}