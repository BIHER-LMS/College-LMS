import React from 'react';
import { ShieldCheck, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FacultyDashboardData } from '../types/faculty.types';

interface ClassInchargeStatusProps {
  classIncharge: FacultyDashboardData['classIncharge'] | undefined;
}

export const ClassInchargeStatus: React.FC<ClassInchargeStatusProps> = ({ classIncharge }) => {
  const isAssigned = classIncharge?.isAssigned || false;
  const cls = classIncharge?.class;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isAssigned ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isAssigned ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Class Incharge Responsibility</h3>
            <p className="text-[11px] text-slate-500">
              Evaluated dynamically from College LMS class database assignment
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
            isAssigned
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isAssigned ? 'Active Class Incharge' : 'Subject Teacher'}
        </span>
      </div>

      {isAssigned && cls ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {cls.name}
              {cls.currentSemester && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Semester {cls.currentSemester}
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-600">
              Batch: <span className="font-semibold text-slate-800">{cls.batch || 'Current'}</span> • Program:{' '}
              <span className="font-semibold text-slate-800">{cls.program || 'N/A'}</span>
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
              <Users className="w-3 h-3" />
              <span>{cls.studentCount} Students Enrolled</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Link
              to={`/faculty/attendance?tab=leaves&classId=${cls.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              <span>Review Leave Applications</span>
            </Link>
            <Link
              to={`/faculty/classes/${cls.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              <span>Manage Assigned Class</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
          <p>
            You are currently functioning as a <strong className="text-slate-800">Subject Teacher</strong> in your department. No class is currently assigned under your direct Class Incharge stewardship.
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Class Incharge responsibilities are assigned directly by the Department HOD through the College LMS management.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassInchargeStatus;
