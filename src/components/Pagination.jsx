const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (i === page - 2 || i === page + 2) {
      pages.push('...');
    }
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all font-medium"
      >
        ← Previous
      </button>
      
      {pages.map((p, idx) => (
        <button
          key={idx}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '...' || p === page}
          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
            p === page 
              ? 'bg-blue-700 text-white border-blue-700 shadow-md' 
              : p === '...'
              ? 'border-transparent cursor-default text-gray-400'
              : 'border-gray-300 hover:bg-blue-700 hover:text-white hover:border-blue-700'
          }`}
        >
          {p}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all font-medium"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
