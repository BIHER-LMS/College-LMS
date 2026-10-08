import React from 'react';
import type { DepartmentInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

export const StudentDepartmentCard: React.FC<{ departmentData: DepartmentInfo | null }> = ({
  departmentData,
}) => {
  if (!departmentData) {
    return (
      <EmptyState
        icon="domain"
        title="No Department Assigned"
        description="No academic department is currently associated with your student enrollment record."
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded uppercase">
              Academic Department
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded uppercase">
              {departmentData.isActive ? 'Active Department' : 'Inactive'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{departmentData.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Department Code: <strong className="text-slate-800 uppercase font-mono">{departmentData.code}</strong>
          </p>
        </div>

        <div className="px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-md text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Department ID
          </span>
          <span className="text-xs font-mono text-slate-800 font-semibold">
            {departmentData.id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Department Code
          </span>
          <span className="text-base font-mono text-slate-900 font-bold mt-1 uppercase">
            {departmentData.code}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Affiliated Institution
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {departmentData.collegeName || 'College LMS'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Department Status
          </span>
          <span className="text-base text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        </div>
      </div>
    </div>
  );
};
