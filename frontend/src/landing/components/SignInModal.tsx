import React, { useState } from 'react';
import type { RoleType } from '../types';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInRole: (role: RoleType) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignInRole }) => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('hod');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSignInRole(selectedRole);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#c3c6d7]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#eff4ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                Institutional SSO Sign In
              </h3>
              <span className="text-xs text-[#565e74]">Aura Academia Enterprise Core</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#565e74] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#565e74] uppercase tracking-wider mb-2">
            Select Operational Scope
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#eff4ff] border border-[#d3e4fe]">
            <button
              type="button"
              onClick={() => setSelectedRole('hod')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'hod'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              HOD
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('faculty')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'faculty'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'student'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Student
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Institutional Email / NetID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                selectedRole === 'hod'
                  ? 'chair.cs@university.edu'
                  : selectedRole === 'faculty'
                  ? 'elena.rostova@university.edu'
                  : 'student.alex@university.edu'
              }
              className="w-full h-10 px-3 text-xs rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] placeholder-gray-400 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Campus Security Passcode / MFA Key
            </label>
            <input
              type="password"
              defaultValue="••••••••••••"
              className="w-full h-10 px-3 text-xs rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] placeholder-gray-400 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating SAML Token...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onSignInRole(selectedRole);
                onClose();
              }}
              className="w-full h-9 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-semibold hover:bg-[#dce9ff] transition-all"
            >
              Instant Demo Bypass (One-Click)
            </button>

            <a
              href="/login"
              className="w-full h-9 rounded-lg border border-[#c3c6d7] text-[#0b1c30] text-xs font-semibold hover:bg-[#eff4ff] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Go to College LMS Portal (Sign In / Register)</span>
              <span className="material-symbols-outlined text-sm">login</span>
            </a>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-[#eff4ff] text-center">
          <span className="text-[11px] text-[#565e74]">
            Protected by FERPA compliant 256-bit AES SSO gateway.
          </span>
        </div>
      </div>
    </div>
  );
};
