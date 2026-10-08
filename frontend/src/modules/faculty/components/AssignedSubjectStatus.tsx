import React from 'react';
import { BookOpen, AlertCircle, ArrowRight, BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FacultyDashboardData } from '../types/faculty.types';

interface AssignedSubjectStatusProps {
  assignedSubject: FacultyDashboardData['assignedSubject'] | undefined;
  assignedSubjects?: FacultyDashboardData['assignedSubjects'];
}

export const AssignedSubjectStatus: React.FC<AssignedSubjectStatusProps> = ({ assignedSubject, assignedSubjects }) => {
  const subjects = assignedSubjects && assignedSubjects.length > 0 
    ? assignedSubjects 
    : assignedSubject 
      ? [{ id: assignedSubject.id, name: assignedSubject.name, code: assignedSubject.code, className: 'General Class' }] 
      : [];
  const isAssigned = subjects.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isAssigned ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isAssigned ? <BookOpen className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Curriculum & Subject</h3>
            <p className="text-[11px] text-slate-500">
              Evaluated dynamically from College LMS subject assignment
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
            isAssigned
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200 uppercase'
          }`}
        >
          {isAssigned ? 'Subject Teacher' : 'Assignment Pending'}
        </span>
      </div>

      {isAssigned ? (
        <div className="space-y-3">
          {subjects.map((sub, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {sub.name}
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 border border-slate-300">
                    {sub.code}
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium pt-0.5">
                  <BookMarked className="w-3 h-3 text-amber-500" />
                  <span>
                    Class: {sub.className}
                  </span>
                </div>
              </div>

              <Link
                to="/faculty/subjects"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
              >
                <span>View Options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700">
          <p className="font-semibold mb-1">
            ⚠️ Subject Assign Pending
          </p>
          <p className="text-[11px] text-rose-600/80 leading-relaxed">
            You have not been assigned a specific subject within your department. 
            Please contact your College Administrator or HOD to link a subject to your faculty profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedSubjectStatus;
