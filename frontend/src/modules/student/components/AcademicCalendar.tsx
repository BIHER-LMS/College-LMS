import React from 'react';
import type { AcademicYearInfo, SemesterInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

interface AcademicCalendarProps {
  years: AcademicYearInfo[];
  semesters: SemesterInfo[];
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ years, semesters }) => {
  if (years.length === 0 && semesters.length === 0) {
    return (
      <EmptyState
        icon="calendar_today"
        title="No Academic Calendar Available"
        description="The institutional academic schedule for your college has not been published yet."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Academic Years Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Institutional Academic Years
            </h3>
            <span className="text-xs text-slate-500">
              Annual academic calendar cycles for your institution
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
            {years.length} Cycles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {years.map((year) => (
            <div
              key={year.id}
              className={`p-5 rounded-lg border transition-colors flex flex-col justify-between gap-4 ${
                year.isCurrent
                  ? 'border-slate-800 bg-slate-50/70 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{year.name}</span>
                {year.isCurrent && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded uppercase">
                    Active Year
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>
                  Start: <strong className="text-slate-800 font-mono">{new Date(year.startDate).toLocaleDateString()}</strong>
                </span>
                <span>
                  End: <strong className="text-slate-800 font-mono">{new Date(year.endDate).toLocaleDateString()}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semesters & Terms Schedule */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Semesters & Terms Schedule
            </h3>
            <span className="text-xs text-slate-500">
              Scheduled instructional terms and grading deadlines
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
            {semesters.length} Terms
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Term Number</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Instruction Start</th>
                <th className="py-3 px-4">Term Concludes</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {semesters.map((sem) => (
                <tr key={sem.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    Semester {sem.termNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {sem.academicYear?.name || 'Academic Session'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {new Date(sem.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {new Date(sem.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded uppercase">
                      Scheduled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
