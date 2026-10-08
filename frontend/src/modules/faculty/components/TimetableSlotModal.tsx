import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, GraduationCap, MapPin, CheckCircle2, Trash2 } from 'lucide-react';
import type { FacultyTimetableSlot } from '../types/faculty.types';

interface TimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: Partial<FacultyTimetableSlot>) => Promise<any>;
  onDelete?: (slotId: string) => Promise<any>;
  slotToEdit?: FacultyTimetableSlot | null;
  assignedClasses: { id: string; name: string }[];
  availableSubjects?: { id: string; name: string; code: string }[];
  defaultDay?: string;
  defaultPeriod?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_PERIODS = [
  { period: 'Period 1', start: '09:00 AM', end: '09:50 AM' },
  { period: 'Period 2', start: '10:00 AM', end: '10:50 AM' },
  { period: 'Period 3', start: '11:10 AM', end: '12:00 PM' },
  { period: 'Period 4', start: '12:00 PM', end: '12:50 PM' },
  { period: 'Period 5', start: '01:45 PM', end: '02:35 PM' },
  { period: 'Period 6', start: '02:40 PM', end: '03:30 PM' },
  { period: 'Period 7', start: '03:35 PM', end: '04:25 PM' },
];

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  slotToEdit,
  assignedClasses,
  availableSubjects = [],
  defaultDay,
  defaultPeriod,
}) => {
  const [day, setDay] = useState<string>('Monday');
  const [period, setPeriod] = useState<string>('Period 1');
  const [startTime, setStartTime] = useState<string>('09:00 AM');
  const [endTime, setEndTime] = useState<string>('09:50 AM');
  const [className, setClassName] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slotToEdit) {
      setDay(slotToEdit.day_of_week || 'Monday');
      setPeriod(slotToEdit.period || 'Period 1');
      setStartTime(slotToEdit.start_time || '09:00 AM');
      setEndTime(slotToEdit.end_time || '09:50 AM');
      setClassName(slotToEdit.class_name || '');
      setClassId(slotToEdit.class_id || '');
      setSubjectName(slotToEdit.subject_name || '');
      setSubjectId(slotToEdit.subject_id || '');
      setRoom(slotToEdit.room || '');
    } else {
      setDay(defaultDay || 'Monday');
      setPeriod(defaultPeriod || 'Period 1');
      const matchedPeriod = DEFAULT_PERIODS.find((p) => p.period === (defaultPeriod || 'Period 1'));
      setStartTime(matchedPeriod?.start || '09:00 AM');
      setEndTime(matchedPeriod?.end || '09:50 AM');
      if (assignedClasses.length > 0) {
        setClassName(assignedClasses[0].name);
        setClassId(assignedClasses[0].id);
      } else {
        setClassName('');
        setClassId('');
      }
      if (availableSubjects.length > 0) {
        setSubjectName(availableSubjects[0].name);
        setSubjectId(availableSubjects[0].id);
      } else {
        setSubjectName('');
        setSubjectId('');
      }
      setRoom('Room 301');
    }
    setError(null);
  }, [slotToEdit, isOpen, defaultDay, defaultPeriod, assignedClasses, availableSubjects]);

  if (!isOpen) return null;

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    const matched = DEFAULT_PERIODS.find((p) => p.period === val);
    if (matched) {
      setStartTime(matched.start);
      setEndTime(matched.end);
    }
  };

  const handleClassSelect = (val: string) => {
    const matched = assignedClasses.find((c) => c.id === val || c.name === val);
    if (matched) {
      setClassId(matched.id);
      setClassName(matched.name);
    } else {
      setClassId('');
      setClassName(val);
    }
  };

  const handleSubjectSelect = (val: string) => {
    const matched = availableSubjects.find((s) => s.id === val || s.name === val);
    if (matched) {
      setSubjectId(matched.id);
      setSubjectName(matched.name);
    } else {
      setSubjectId('');
      setSubjectName(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError('Please provide or select a class name.');
      return;
    }
    if (!subjectName.trim()) {
      setError('Please provide or select a subject name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        id: slotToEdit?.id,
        day_of_week: day,
        period,
        start_time: startTime || null,
        end_time: endTime || null,
        class_name: className.trim(),
        class_id: classId || null,
        subject_name: subjectName.trim(),
        subject_id: subjectId || null,
        room: room.trim() || null,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save slot:', err);
      setError(err.message || 'Failed to save timetable slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!slotToEdit?.id || !onDelete) return;
    if (!window.confirm('Are you sure you want to remove this timetable slot?')) return;

    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(slotToEdit.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete slot:', err);
      setError(err.message || 'Failed to delete timetable slot.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                {slotToEdit ? 'Edit Timetable Slot' : 'Create Timetable Slot'}
              </h2>
              <p className="text-xs text-slate-300">
                Configure day, period, class, subject and lecture location.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="font-semibold">Notice:</span> {error}
            </div>
          )}

          {/* Day & Period Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week <span className="text-red-500">*</span>
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Period <span className="text-red-500">*</span>
              </label>
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {DEFAULT_PERIODS.map((p) => (
                  <option key={p.period} value={p.period}>
                    {p.period} ({p.start} - {p.end})
                  </option>
                ))}
                <option value="Special Session">Special Session</option>
                <option value="Lab Period">Lab Period</option>
              </select>
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time</span>
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="09:50 AM"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Class Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned Class / Section <span className="text-red-500">*</span></span>
            </label>
            {assignedClasses.length > 0 ? (
              <div className="space-y-1.5">
                <select
                  value={classId || className}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {assignedClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="CUSTOM">-- Custom Class Name --</option>
                </select>
                {(classId === 'CUSTOM' || (!assignedClasses.some((c) => c.id === classId) && className)) && (
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Enter custom class name..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. B.sc AI & ML - Year III (Sec A)"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Subject Name <span className="text-red-500">*</span></span>
            </label>
            {availableSubjects.length > 0 ? (
              <div className="space-y-1.5">
                <select
                  value={subjectId || subjectName}
                  onChange={(e) => handleSubjectSelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                  <option value="CUSTOM">-- Custom Subject --</option>
                </select>
                {(subjectId === 'CUSTOM' || (!availableSubjects.some((s) => s.id === subjectId) && subjectName)) && (
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Enter custom subject name..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Machine Learning Techniques"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Room / Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Classroom / Lab Location</span>
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 301, Lab 2, Audi 1"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {slotToEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Slot'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{slotToEdit ? 'Update Slot' : 'Add Slot'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
