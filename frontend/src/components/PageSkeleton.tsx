import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-20 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-700/60" />
          <div className="space-y-1.5">
            <div className="w-36 h-4 bg-slate-700/60 rounded" />
            <div className="w-64 h-3 bg-slate-700/40 rounded" />
          </div>
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
            <div className="w-24 h-3 bg-slate-200 rounded" />
            <div className="w-16 h-6 bg-slate-200 rounded" />
            <div className="w-full h-2 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="h-64 bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
        <div className="w-48 h-4 bg-slate-200 rounded" />
        <div className="w-full h-12 bg-slate-100 rounded" />
        <div className="w-full h-12 bg-slate-100 rounded" />
        <div className="w-3/4 h-12 bg-slate-100 rounded" />
      </div>
    </div>
  );
};

export default PageSkeleton;
