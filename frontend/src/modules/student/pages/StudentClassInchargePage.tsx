import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { ClassInchargeCard } from '../components/ClassInchargeCard';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentClassInchargePage: React.FC = () => {
  const { classIncharge, loading, errors, loadClassIncharge } = useStudent();

  useEffect(() => {
    loadClassIncharge();
  }, [loadClassIncharge]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Faculty Mentorship
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Class Incharge</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Faculty advisor designated to supervise and mentor your enrolled class section.
        </p>
      </div>

      {errors.classIncharge && (
        <ErrorState message={errors.classIncharge} onRetry={loadClassIncharge} />
      )}

      {loading.classIncharge && !classIncharge ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <ClassInchargeCard incharge={classIncharge} />
      )}
    </div>
  );
};
