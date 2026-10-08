import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from "../../store/store";;
import { updateHODProfile } from "../../store/slices/hodSlice";
;
;

interface HODProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HODProfileModal: React.FC<HODProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.hod);

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmployeeId(profile.employeeId || '');
      setPhone(profile.phone || '');
      setDesignation(profile.designation || '');
      setDepartmentName(profile.departmentName || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      await dispatch(
        updateHODProfile({
          name,
          employeeId,
          phone,
          designation,
          departmentName,
          address,
        })
      ).unwrap();
      setStatusMessage('Profile updated successfully.');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border border-[#c5c6cd]/40 bg-white p-6 shadow-2xl font-body text-[#0b1c30]">
        <div className="flex items-center justify-between border-b border-[#c5c6cd]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">account_circle</span>
            <h2 className="font-headline text-lg font-bold text-[#0b1c30]">Executive HOD Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#44474d] hover:text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-3 p-2.5 text-xs ${
              statusMessage.includes('successfully')
                ? 'bg-emerald-50 text-[#069669] border border-emerald-200'
                : 'bg-red-50 text-[#ba1a1a] border border-red-200'
            }`}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#c5c6cd]/60 p-2 text-xs outline-none focus:border-[#0b1c30]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-[#c5c6cd]/60 p-2 text-xs outline-none focus:border-[#0b1c30]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
                Executive Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full border border-[#c5c6cd]/60 p-2 text-xs outline-none focus:border-[#0b1c30]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-[#c5c6cd]/60 p-2 text-xs outline-none focus:border-[#0b1c30]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full border border-[#c5c6cd]/60 p-2 text-xs outline-none focus:border-[#0b1c30]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
              Official Campus Chamber / Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-[#c5c6cd]/60 p-2 text-xs outline-none focus:border-[#0b1c30]"
              required
            />
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-[#c5c6cd]/30 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#c5c6cd]/60 bg-white px-4 py-2 text-xs font-semibold text-[#0b1c30] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0b1c30] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d1c32] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
