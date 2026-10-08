import React from 'react';
import type { ProgramInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

export const StudentProgramCard: React.FC<{ programData: ProgramInfo | null }> = ({ programData }) => {
  if (!programData) {
    return (
      <EmptyState
        icon="school"
        title="No Program Information Available"
        description="No academic degree program is currently resolved from your student enrollment record."
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded uppercase">
              Degree Curriculum
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded uppercase">
              {programData.isActive ? 'Active Program' : 'Inactive'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{programData.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {programData.type} Degree · {programData.durationYears} Years Academic Duration
          </p>
        </div>

        <div className="px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-md text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Program Identifier
          </span>
          <span className="text-xs font-mono text-slate-800 font-semibold">{programData.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Program Level & Type
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {programData.type}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Curriculum Duration
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {programData.durationYears} Academic Years
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Parent Department
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {programData.department?.name || 'Department'}
          </span>
        </div>
      </div>
    </div>
  );
};
