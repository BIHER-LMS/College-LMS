import React, { useState } from 'react';
import { Trash2, X, AlertTriangle, Loader2, Crown } from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { ClassStudentSummary } from '../types/faculty.types';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  student: ClassStudentSummary | null;
  onSuccess: () => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  student,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await facultyApi.deleteStudent(classId, student.uid);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to remove student from class roster'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">Remove Student</h3>
              <p className="text-[11px] text-rose-700">From {className} roster</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {error}
            </div>
          )}

          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to remove <strong className="text-slate-900">{student.name}</strong> from this class?
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Roll No:</span>
              <span className="font-bold text-slate-800">{student.registerNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Email:</span>
              <span className="text-slate-700 truncate max-w-[220px]">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Phone:</span>
                <span className="text-slate-700">{student.phone}</span>
              </div>
            )}
          </div>

          {student.isClassRep && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
              <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Attention:</strong> This student is currently designated as the <strong>Class Representative</strong>. Removing them will revoke their CR badge.
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-100/80 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              This will remove the student from this cohort roster and active class attendance registers.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs transition disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Student</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStudentModal;
