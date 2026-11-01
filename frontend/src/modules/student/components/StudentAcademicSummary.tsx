import React from 'react';
import type { ClassInfo, BatchInfo, ProgramInfo, SubjectInfo, AcademicYearInfo, StudentProfile } from '../types/student.types';

interface StudentAcademicSummaryProps {
  profile?: StudentProfile | null;
  classData: ClassInfo | null;
  batchData: BatchInfo | null;
  programData: ProgramInfo | null;
  subjects: SubjectInfo[];
  academicYear: AcademicYearInfo | null;
}

export const StudentAcademicSummary: React.FC<StudentAcademicSummaryProps> = ({
  profile,
  classData,
  batchData,
  programData,
  subjects,
  academicYear,
}) => {
  const currentSemester = classData?.currentSemester || 1;
  const regNumber = profile?.studentId || 'Not Assigned';

  return (
    <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible snap-x scrollbar-none pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* 1. Register Number */}
      <div className="min-w-[170px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            REGISTER NO
          </span>
          <span className="material-symbols-outlined text-[1.25rem]">school</span>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight font-mono tracking-tight truncate">
            {regNumber}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span>+100% Active</span>
          </div>
        </div>
      </div>

      {/* 2. Current Semester */}
      <div className="min-w-[170px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            SEMESTER
          </span>
          <span className="material-symbols-outlined text-[1.25rem]">timeline</span>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            Term {currentSemester}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {academicYear?.name || 'Academic Term'}
          </div>
        </div>
      </div>

      {/* 3. Program */}
      <div className="min-w-[170px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            PROGRAM
          </span>
          <span className="material-symbols-outlined text-[1.25rem]">menu_book</span>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight tracking-tight truncate">
            {programData?.name || 'Not Enrolled'}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {programData?.type || 'Degree Program'}
          </div>
        </div>
      </div>

      {/* 4. Batch */}
      <div className="min-w-[170px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            BATCH
          </span>
          <span className="material-symbols-outlined text-[1.25rem]">group</span>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            {batchData ? `${batchData.startYear}-${batchData.endYear.toString().slice(-2)}` : 'Not Assigned'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active Cohort
          </div>
        </div>
      </div>

      {/* 5. Classes */}
      <div className="min-w-[170px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            CLASS
          </span>
          <span className="material-symbols-outlined text-[1.25rem]">meeting_room</span>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight tracking-tight truncate">
            {classData?.name || 'Not Assigned'}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {classData ? `Term ${classData.currentSemester}` : 'Classroom'}
          </div>
        </div>
      </div>

      {/* 6. Subjects */}
      <div className="min-w-[170px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            SUBJECTS
          </span>
          <span className="material-symbols-outlined text-[1.25rem]">fact_check</span>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            {subjects.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Curriculum Courses
          </div>
        </div>
      </div>
    </div>
  );
};
