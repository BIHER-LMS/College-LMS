import React, { useState } from 'react';
import {
  Crown,
  X,
  Search,
  Check,
  Loader2,
  UserX,
  ShieldCheck,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { ClassStudentSummary, ClassRepresentativeInfo } from '../types/faculty.types';

interface AssignClassRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  currentRep: ClassRepresentativeInfo | null | undefined;
  students: ClassStudentSummary[];
  onSuccess: () => void;
}

export const AssignClassRepModal: React.FC<AssignClassRepModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  currentRep,
  students,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentUid, setSelectedStudentUid] = useState<string | null>(
    currentRep?.uid || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.registerNumber || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await facultyApi.assignClassRepresentative(classId, selectedStudentUid);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to assign class representative');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRep = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await facultyApi.assignClassRepresentative(classId, null);
      setSelectedStudentUid(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to remove class representative');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/20">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Assign Class Representative (CR)
              </h2>
              <p className="text-[11px] text-slate-300">
                Designate a student leader for <span className="font-semibold text-white">{className}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Current Representative Card */}
          {currentRep ? (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <Crown className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Current Class Representative
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">{currentRep.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {currentRep.registerNumber || 'No Reg No'} • {currentRep.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveRep}
                disabled={isSubmitting}
                className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition flex items-center gap-1"
                title="Remove current class representative designation"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Remove CR</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>No Class Representative is currently assigned for this class. Select any student below.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name, roll no, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Student List */}
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {students.length === 0
                  ? 'No students enrolled in this class yet. Please upload students first.'
                  : 'No students matching the search filter.'}
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedStudentUid === s.uid;
                const isCurrent = currentRep?.uid === s.uid;
                return (
                  <label
                    key={s.uid}
                    className={`flex items-center justify-between p-3 cursor-pointer transition select-none ${
                      isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="radio"
                        name="class_rep_student"
                        checked={isSelected}
                        onChange={() => setSelectedStudentUid(s.uid)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300"
                      />
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[9px] flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> CR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {s.registerNumber || 'No Roll No'} • {s.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10.5px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                        {s.attendancePercentage ? `${s.attendancePercentage}% Attd` : 'Enrolled'}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {selectedStudentUid ? '1 student selected' : 'No student selected'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedStudentUid || isSubmitting}
              onClick={handleSave}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition ${
                !selectedStudentUid || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Assign as CR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignClassRepModal;
