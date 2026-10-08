import React, { useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentProfilePage: React.FC = () => {
  const {
    profile,
    loading,
    errors,
    successMessage,
    loadProfile,
    saveProfile,
    dismissSuccess,
    dismissError,
  } = useStudent();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-on-tertiary-container inline-block"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            Identity & Account Management
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Student Profile</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          View your verified student profile, enrollment information, and update permissible contact details.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
            <span className="font-label-md text-label-md font-medium">{successMessage}</span>
          </div>
          <button onClick={dismissSuccess} type="button">
            <span className="material-symbols-outlined text-[1rem]">close</span>
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errors.profile && (
        <ErrorState message={errors.profile} onRetry={loadProfile} />
      )}
      {errors.updateProfile && (
        <ErrorState
          message={errors.updateProfile}
          onRetry={() => dismissError('updateProfile')}
        />
      )}

      {/* Main Profile Card */}
      {loading.profile && !profile ? (
        <LoadingSkeleton rows={4} />
      ) : profile ? (
        <StudentProfileCard
          profile={profile}
          onUpdate={saveProfile}
          isUpdating={loading.updateProfile}
        />
      ) : null}
    </div>
  );
};
