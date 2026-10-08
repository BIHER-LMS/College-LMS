import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import type { AcademicYearInfo, SemesterInfo } from '../types/faculty.types';

interface AcademicCalendarProps {
  years: AcademicYearInfo[];
  semesters: SemesterInfo[];
  loading?: boolean;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  years,
  semesters,
  loading,
}) => {
  if (loading) {
    return (
      <div className="border border-slate-200 rounded-lg bg-white p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading academic calendar schedule...
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Academic Sessions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Academic Sessions</span>
        </h3>

        {years.length === 0 ? (
          <div className="border border-slate-200 rounded bg-white p-16 text-center text-xs text-slate-500">
            No active records found for this module in the current academic session.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {years.map((year) => (
              <div key={year.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{year.name}</h4>
                  {year.isCurrent ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Current Session
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {year.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Commencement</span>
                    <span className="text-slate-800 font-semibold">{formatDate(year.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Conclusion</span>
                    <span className="text-slate-800 font-semibold">{formatDate(year.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Semester Terms */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Semester Timeline</span>
        </h3>

        {semesters.length === 0 ? (
          <div className="border border-slate-200 rounded bg-white p-16 text-center text-xs text-slate-500">
            No active records found for this module in the current academic session.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesters.map((sem) => (
              <div key={sem.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Term {sem.termNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {sem.academicYearName}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Begins:</span>
                    <span className="text-slate-800 font-medium">{formatDate(sem.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ends:</span>
                    <span className="text-slate-800 font-medium">{formatDate(sem.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicCalendar;
