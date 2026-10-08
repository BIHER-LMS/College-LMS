import React, { useState } from 'react';
import type { StudentProfile, StudentUpdateProfileDTO } from '../types/student.types';

interface StudentProfileCardProps {
  profile: StudentProfile;
  onUpdate: (dto: StudentUpdateProfileDTO) => Promise<any>;
  isUpdating?: boolean;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  profile,
  onUpdate,
  isUpdating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentUpdateProfileDTO>({
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    bio: profile.bio || '',
    profilePhotoUrl: profile.profilePhotoUrl || '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
      {/* Header with Avatar & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          {profile.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt={profile.displayName || 'Profile'}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 bg-[#0b1727] text-white rounded-lg flex items-center justify-center font-bold text-xl">
              {profile.displayName?.[0] || 'S'}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded uppercase">
                {profile.accountStatus}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Registration No: <strong className="text-slate-800">{profile.studentId || 'N/A'}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors self-start sm:self-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-[1rem]">{isEditing ? 'close' : 'edit'}</span>
          <span>{isEditing ? 'Cancel Edit' : 'Edit Contact Info'}</span>
        </button>
      </div>

      {/* Completion Meter */}
      <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-100">
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Profile Record Completion</span>
          <span className="font-bold text-slate-900">{profile.profileCompletionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-[#0b1727] h-2 rounded-full transition-all duration-300"
            style={{ width: `${profile.profileCompletionPercentage}%` }}
          />
        </div>
      </div>

      {/* Bio excerpt */}
      {profile.bio && (
        <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Academic Bio & Statement
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Edit Form Modal/Drawer */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Update Permitted Contact Fields
          </h3>
          <p className="text-xs text-slate-500">
            Per institutional policy, your role, academic cohort, class, and register number are managed by the College Administration and cannot be changed here.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                placeholder="+91 9876543210"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Profile Photo URL
              </label>
              <input
                type="text"
                value={formData.profilePhotoUrl || ''}
                onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
                className="h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                placeholder="Chennai"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                State
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                placeholder="Tamil Nadu"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                placeholder="Street address, campus apartment..."
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Personal Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="p-3 border border-slate-200 rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400 resize-none"
                placeholder="Tell your faculty and peers about your academic interests..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-[#0b1727] text-white text-xs font-semibold rounded-md hover:bg-[#13243c] disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Readonly Details Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Institutional Email
            </span>
            <span className="text-sm font-semibold text-slate-900 mt-1 truncate">
              {profile.email}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Phone Number
            </span>
            <span className="text-sm font-semibold text-slate-900 mt-1">
              {profile.phone || 'Not provided'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Enrollment Year
            </span>
            <span className="text-sm font-semibold text-slate-900 mt-1">
              {profile.enrollmentYear || '2023'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              City & State
            </span>
            <span className="text-sm font-semibold text-slate-900 mt-1">
              {profile.city ? `${profile.city}, ${profile.state || ''}` : 'Not provided'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Address
            </span>
            <span className="text-sm font-semibold text-slate-900 mt-1">
              {profile.address || 'Not provided'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Academic Role
            </span>
            <span className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Enrolled Student (Verified)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
