import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { AcademicCalendar } from '../components/AcademicCalendar';
import { Calendar } from 'lucide-react';

export const FacultyAcademicYearsPage: React.FC = () => {
  const { academicYears, semesters, loading, loadAcademicInfo } = useFaculty();

  useEffect(() => {
    loadAcademicInfo();
  }, []);

  return (
    <div className="space-y-3.5">
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Academic Sessions & Terms
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              College academic calendar, ongoing session, and semester duration schedules.
            </p>
          </div>
        </div>
      </div>

      <AcademicCalendar
        years={academicYears}
        semesters={semesters}
        loading={loading.academic}
      />
    </div>
  );
};

export default FacultyAcademicYearsPage;
