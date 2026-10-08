import React from 'react';
import { GraduationCap, Users, Calendar, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { FacultyClassSummary } from '../types/faculty.types';

interface ClassDetailsProps {
  cls: FacultyClassSummary;
}

export const ClassDetails: React.FC<ClassDetailsProps> = ({ cls }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{cls.name}</h2>
              <p className="text-xs text-slate-500">{cls.program || 'Degree Program'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {cls.isActive ? 'Active Class' : 'Inactive'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Class Incharge Role
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Batch
          </span>
          <p className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            {cls.batch || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Current Semester
          </span>
          <p className="text-base font-bold text-slate-900 mt-1">
            {cls.currentSemester ? `Semester ${cls.currentSemester}` : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Department
          </span>
          <p className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5 truncate">
            <Building2 className="w-4 h-4 text-blue-600" />
            {cls.department || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Student Strength
          </span>
          <p className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {cls.studentCount} Students
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
