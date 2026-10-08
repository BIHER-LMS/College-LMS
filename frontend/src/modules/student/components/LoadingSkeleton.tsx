import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full flex flex-col gap-4 animate-pulse">
      <div className="h-20 bg-surface-container-low border border-outline-variant w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-surface-container-low border border-outline-variant" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-16 bg-surface-container-low border border-outline-variant" />
        ))}
      </div>
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  return (
    <div className="bg-error-container/40 border border-error p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-error text-[1.5rem]">error</span>
        <div>
          <h4 className="font-label-md text-label-md font-semibold text-on-error-container">System Notice</h4>
          <p className="font-body-sm text-body-sm text-on-error-container mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-error text-error text-label-md font-label-md hover:bg-error hover:text-white transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[1rem]">refresh</span>
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
