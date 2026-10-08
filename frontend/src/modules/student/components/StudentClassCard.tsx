import React from 'react';
import type { ClassInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

export const StudentClassCard: React.FC<{ classData: ClassInfo | null }> = ({ classData }) => {
  if (!classData) {
    return (
      <EmptyState
        icon="meeting_room"
        title="No Class Assigned"
        description="You have not been assigned to a class section yet. Please contact your college administrator."
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded uppercase">
              Current Class Section
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded uppercase">
              {classData.isActive ? 'Active Section' : 'Inactive'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{classData.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Degree Term Progression · Semester {classData.currentSemester}
          </p>
        </div>

        <div className="px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-md text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Class ID
          </span>
          <span className="text-xs font-mono text-slate-800 font-semibold">{classData.id}</span>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Semester
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            Semester {classData.currentSemester}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Associated Batch
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {classData.batch ? `${classData.batch.startYear} - ${classData.batch.endYear}` : 'Batch Assigned'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Degree Program
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {classData.batch?.program?.name || 'Undergraduate'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Academic Department
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {classData.batch?.program?.department?.name || 'Assigned Department'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Department Code
          </span>
          <span className="text-base text-slate-900 font-mono font-bold mt-1 uppercase">
            {classData.batch?.program?.department?.code || '—'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Class Incharge Faculty
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {classData.classIncharge?.name || 'Assigned Faculty'}
          </span>
        </div>
      </div>
    </div>
  );
};
