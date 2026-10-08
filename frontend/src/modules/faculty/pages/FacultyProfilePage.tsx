import React, { useState, useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import {
  User,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Save,
  Lock,
  Mail,
  Building2,
  Fingerprint,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';

export const FacultyProfilePage: React.FC = () => {
  const { profile, loadProfile, saveProfile } = useFaculty();

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    bio: '',
    profilePhoto: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        bio: profile.bio || '',
        profilePhoto: profile.profilePhoto || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setIsSubmitting(true);

    try {
      await saveProfile(formData).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || err || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = (formData.displayName || profile?.displayName || 'FA')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-4 w-full">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1E1B4B] to-[#15203D] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden w-full">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/20 shrink-0">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              My Profile & Credentials
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Personal contact details, faculty name, profile picture, and verified academic credentials.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {profile?.accountStatus || 'ACTIVE'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            FACULTY PORTAL
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Profile updated successfully! Name and photo changes are live.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{saveError}</span>
        </div>
      )}

      {/* Main Full-Width Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        {/* Left Column: Faculty Card Preview & Institutional Status (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Faculty Card Preview */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="h-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-[#0B132B] relative">
              <div className="absolute -bottom-7 left-5">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt="Profile"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xl font-bold tracking-wider">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-9 p-5 space-y-3.5">
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {formData.displayName || profile?.displayName || 'Faculty Member'}
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {profile?.designation || 'Assistant Professor'}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Role: FACULTY
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Status: {profile?.accountStatus || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{profile?.department || 'Department of Faculty'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formData.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {formData.city
                      ? `${formData.city}${formData.state ? `, ${formData.state}` : ''}`
                      : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Status Badge Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Institutional Identity Verification</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your profile is verified and linked to institutional faculty roster. You can update your display name, photo, phone, and address anytime. For department reassignments, contact administration.
            </p>
          </div>
        </div>

        {/* Right Column: Institutional Records + Self-Service Form (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Institutional Records Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Institutional Records (Read-Only)
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Department</span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {profile?.department || 'Department of Faculty'}
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.email}
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3 sm:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Faculty UID</span>
                </div>
                <div className="text-[11px] font-mono font-medium text-slate-700 truncate">
                  {profile?.uid}
                </div>
              </div>
            </div>
          </div>

          {/* Self-Service Editable Form Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="border-b border-slate-100 pb-2.5 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Personal & Profile Settings (Editable)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Update your display name, profile photo, telephone number, residential address, and research specialization.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Faculty Full Name (Display Name) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Faculty Full Name / Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Dr. Jane Smith / Prof. Amirtha Varsshan"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Profile Photo URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profile Photo URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or Google avatar URL"
                      value={formData.profilePhoto}
                      onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Coimbatore / Chennai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Tamil Nadu"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Residential Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential / Campus Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Street address or faculty quarters"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Bio / Research Specialization */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Biography & Research Interests
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of teaching specialization, research publications, or laboratory focus..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfilePage;
