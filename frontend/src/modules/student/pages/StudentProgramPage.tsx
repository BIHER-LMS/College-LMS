import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { StudentProgramCard } from '../components/StudentProgramCard';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentProgramPage: React.FC = () => {
  const { programData, loading, errors, loadProgram } = useStudent();

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Academic Context · Degree Program
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Degree Program</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Degree program specifications and curriculum framework resolved through your academic hierarchy.
        </p>
      </div>

      {errors.program && <ErrorState message={errors.program} onRetry={loadProgram} />}

      {loading.program && !programData ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <StudentProgramCard programData={programData} />
      )}
    </div>
  );
};
