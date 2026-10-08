import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { StudentDepartmentCard } from '../components/StudentDepartmentCard';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentDepartmentPage: React.FC = () => {
  const { departmentData, loading, errors, loadDepartment } = useStudent();

  useEffect(() => {
    loadDepartment();
  }, [loadDepartment]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Academic Context · Department
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Department</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Department information, institutional affiliation, and Department Head details.
        </p>
      </div>

      {errors.department && <ErrorState message={errors.department} onRetry={loadDepartment} />}

      {loading.department && !departmentData ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <StudentDepartmentCard departmentData={departmentData} />
      )}
    </div>
  );
};
