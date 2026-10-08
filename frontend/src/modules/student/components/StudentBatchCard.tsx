import React from 'react';
import type { BatchInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

export const StudentBatchCard: React.FC<{ batchData: BatchInfo | null }> = ({ batchData }) => {
  if (!batchData) {
    return (
      <EmptyState
        icon="group"
        title="No Batch Information Available"
        description="Batch enrollment details have not been linked to your academic record yet."
      />
    );
  }

  const duration = batchData.endYear - batchData.startYear;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded uppercase">
              Academic Cohort
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded uppercase">
              {batchData.isActive ? 'Active Cohort' : 'Concluded'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Batch {batchData.startYear} – {batchData.endYear}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {duration}-Year Academic Lifecycle
          </p>
        </div>

        <div className="px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-md text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Batch Identifier
          </span>
          <span className="text-xs font-mono text-slate-800 font-semibold">{batchData.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Matriculation Year
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {batchData.startYear}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Expected Graduation Year
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {batchData.endYear}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Curriculum Duration
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {duration} Academic Years
          </span>
        </div>
      </div>
    </div>
  );
};
