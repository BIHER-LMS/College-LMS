import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { SubjectTable } from '../components/SubjectTable';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentSubjectsPage: React.FC = () => {
  const { subjects, classData, loading, errors, loadSubjects } = useStudent();

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleFilter = (sem?: number) => {
    loadSubjects(sem);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Academic Context · Curriculum
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Subjects & Syllabus</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Complete course curriculum filtered by your assigned department and semester term.
        </p>
      </div>

      {errors.subjects && <ErrorState message={errors.subjects} onRetry={() => loadSubjects()} />}

      {loading.subjects && subjects.length === 0 ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <SubjectTable
          subjects={subjects}
          currentSemester={classData?.currentSemester || 3}
          onFilterSemester={handleFilter}
          isLoading={loading.subjects}
        />
      )}
    </div>
  );
};
