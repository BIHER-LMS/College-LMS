import React from 'react';
import type { ClassInchargeInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

export const ClassInchargeCard: React.FC<{ incharge: ClassInchargeInfo | null }> = ({ incharge }) => {
  if (!incharge) {
    return (
      <EmptyState
        icon="supervisor_account"
        title="No Class Incharge Assigned"
        description="A faculty incharge has not yet been designated for your class section."
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          {incharge.photoUrl ? (
            <img
              src={incharge.photoUrl}
              alt={incharge.name}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 bg-[#0b1727] text-white rounded-lg flex items-center justify-center text-lg font-bold">
              {incharge.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{incharge.name}</h2>
              <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded uppercase">
                Faculty Incharge
              </span>
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
              {incharge.designation || 'Class Incharge / Assistant Professor'}
            </span>
          </div>
        </div>

        <div className="px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-md text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Faculty UID
          </span>
          <span className="text-xs font-mono text-slate-800 font-semibold truncate max-w-[150px] inline-block">
            {incharge.facultyUid}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Faculty Email
          </span>
          <span className="text-base text-slate-900 font-bold mt-1 truncate">
            {incharge.email}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Phone Contact
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {incharge.phone || 'Available via Department Office'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Academic Department
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {incharge.department || 'Assigned Department'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Designation Title
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            {incharge.designation || 'Assistant Professor'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Advisory Scope
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            Student Mentorship & Cohort Class Records
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Office Hours
          </span>
          <span className="text-base text-slate-900 font-bold mt-1">
            09:30 AM – 04:30 PM (Working Days)
          </span>
        </div>
      </div>
    </div>
  );
};
