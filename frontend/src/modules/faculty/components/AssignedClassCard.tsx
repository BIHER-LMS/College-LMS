import React from 'react';
import { Users, GraduationCap, BookOpen, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FacultyClassSummary } from '../types/faculty.types';

interface AssignedClassCardProps {
  cls: FacultyClassSummary;
}

export const AssignedClassCard: React.FC<AssignedClassCardProps> = ({ cls }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-blue-500/40 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded bg-blue-50 text-blue-700">
            <GraduationCap className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
            <p className="text-xs text-slate-500">{cls.program || 'Degree Program'}</p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            cls.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {cls.isActive ? 'Active' : 'Archived'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Batch</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">{cls.batch || '—'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Current Semester</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {cls.currentSemester ? `Semester ${cls.currentSemester}` : '—'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Department</span>
          <span className="font-semibold text-slate-800 mt-0.5 block truncate">{cls.department || '—'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Enrolled Students</span>
          <span className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {cls.studentCount} Students
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/faculty/classes/${cls.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Overview</span>
        </Link>
        <Link
          to={`/faculty/attendance?classId=${cls.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Attendance</span>
        </Link>
        <Link
          to={`/faculty/classes/${cls.id}/students`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Students</span>
        </Link>
      </div>
    </div>
  );
};

export default AssignedClassCard;
