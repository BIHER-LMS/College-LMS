import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { AcademicCalendar } from '../components/AcademicCalendar';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentAcademicYearsPage: React.FC = () => {
  const { academicYears, semesters, loading, errors, loadAcademicCalendar } = useStudent();

  useEffect(() => {
    loadAcademicCalendar();
  }, [loadAcademicCalendar]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Institutional Timeline
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Academic Years</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Annual institutional cycles, start and end dates for your college.
        </p>
      </div>

      {errors.calendar && <ErrorState message={errors.calendar} onRetry={loadAcademicCalendar} />}

      {loading.calendar && academicYears.length === 0 ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <AcademicCalendar years={academicYears} semesters={semesters} />
      )}
    </div>
  );
};
