import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { StudentBatchCard } from '../components/StudentBatchCard';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentBatchPage: React.FC = () => {
  const { batchData, loading, errors, loadBatch } = useStudent();

  useEffect(() => {
    loadBatch();
  }, [loadBatch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Academic Context · Cohort
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Batch Cohort</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Batch matriculation and graduation timeline resolved via your assigned class.
        </p>
      </div>

      {errors.batch && <ErrorState message={errors.batch} onRetry={loadBatch} />}

      {loading.batch && !batchData ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <StudentBatchCard batchData={batchData} />
      )}
    </div>
  );
};
