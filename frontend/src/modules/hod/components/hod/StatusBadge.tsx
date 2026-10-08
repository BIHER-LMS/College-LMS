import React from 'react';

export const StatusBadge: React.FC<{ status?: string }> = ({ status = 'ACTIVE' }) => {
  const isOk = status === 'ACTIVE' || status === 'APPROVED';
  const isPending = status === 'PENDING';

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        isOk
          ? 'bg-emerald-50 text-[#069669]'
          : isPending
          ? 'bg-amber-50 text-amber-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {status}
    </span>
  );
};