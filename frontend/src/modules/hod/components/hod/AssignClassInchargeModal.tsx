import React, { useState, useEffect } from 'react';
import type { Faculty, ClassItem } from "../../types/hod.types";;

interface ModalProps {
  isOpen: boolean;
  classItem: ClassItem | null;
  facultyList: Faculty[];
  onClose: () => void;
  onAssign: (classId: string, facultyUid: string) => Promise<void>;
}

export const AssignClassInchargeModal: React.FC<ModalProps> = ({
  isOpen,
  classItem,
  facultyList,
  onClose,
  onAssign,
}) => {
  const [selectedUid, setSelectedUid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classItem) {
      setSelectedUid(classItem.facultyUid || classItem.facultyId || '');
      setError(null);
    }
  }, [classItem]);

  if (!isOpen || !classItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await onAssign(classItem.id, selectedUid);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign class incharge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
        <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
          <div>
            <h3 className="font-headline text-base font-bold text-[#0b1c30]">
              Assign Class Incharge
            </h3>
            <p className="mt-0.5 text-xs text-[#44474d]">
              Class: <span className="font-semibold text-[#0b1c30]">{classItem.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0b1c30]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 text-xs bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#0b1c30] mb-1">
              Select Department Faculty
            </label>
            <select
              value={selectedUid}
              onChange={(e) => setSelectedUid(e.target.value)}
              className="w-full border border-[#c5c6cd]/50 p-2.5 outline-none focus:border-[#0b1c30] bg-white font-medium"
            >
              <option value="">-- Unassigned (Remove Incharge) --</option>
              {facultyList.map((f) => (
                <option key={f.uid} value={f.uid}>
                  {f.name} ({f.designation || 'Faculty'}) {f.isClassIncharge ? '— [Assigned to another class]' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#44474d]">
              Only verified faculty from your department can be assigned. One faculty can be incharge of one active class.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-[#c5c6cd]/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0b1c30] text-white font-bold hover:bg-[#1a2d48] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};