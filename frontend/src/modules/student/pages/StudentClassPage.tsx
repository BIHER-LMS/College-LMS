import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { StudentClassCard } from '../components/StudentClassCard';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentClassPage: React.FC = () => {
  const { classData, loading, errors, loadClass } = useStudent();

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Academic Context · Classroom
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Class Section</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Your enrolled class section derived directly from the institutional database.
        </p>
      </div>

      {errors.class && <ErrorState message={errors.class} onRetry={loadClass} />}

      {loading.class && !classData ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <StudentClassCard classData={classData} />
      )}
    </div>
  );
};
