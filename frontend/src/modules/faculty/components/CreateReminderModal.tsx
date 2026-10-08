import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, AlertTriangle, BookOpen, GraduationCap, CheckCircle2, Trash2 } from 'lucide-react';
import type { FacultyReminder, CreateReminderInput, ReminderType, ReminderPriority } from '../types/faculty.types';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: CreateReminderInput, id?: string) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
  reminderToEdit?: FacultyReminder | null;
  assignedClasses: { id: string; name: string }[];
  defaultDate?: string;
}

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  reminderToEdit,
  assignedClasses,
  defaultDate,
}) => {
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<ReminderType>('CLASS_TEST');
  const [priority, setPriority] = useState<ReminderPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('10:00 AM');
  const [className, setClassName] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reminderToEdit) {
      setTitle(reminderToEdit.title);
      setType(reminderToEdit.type || 'GENERAL');
      setPriority(reminderToEdit.priority || 'MEDIUM');
      setDueDate(reminderToEdit.due_date ? reminderToEdit.due_date.split('T')[0] : '');
      setDueTime(reminderToEdit.due_time || '');
      setClassName(reminderToEdit.class_name || '');
      setClassId(reminderToEdit.class_id || '');
      setSubjectName(reminderToEdit.subject_name || '');
      setDescription(reminderToEdit.description || '');
    } else {
      const todayIso = defaultDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setType('CLASS_TEST');
      setPriority('HIGH');
      setDueDate(todayIso);
      setDueTime('10:00 AM');
      if (assignedClasses.length > 0) {
        setClassName(assignedClasses[0].name);
        setClassId(assignedClasses[0].id);
      } else {
        setClassName('');
        setClassId('');
      }
      setSubjectName('');
      setDescription('');
    }
    setError(null);
  }, [reminderToEdit, isOpen, defaultDate, assignedClasses]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the reminder.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(
        {
          title: title.trim(),
          type,
          priority,
          due_date: dueDate,
          due_time: dueTime.trim() || null,
          class_name: className.trim() || null,
          class_id: classId || null,
          subject_name: subjectName.trim() || null,
          description: description.trim() || null,
        },
        reminderToEdit?.id
      );
      onClose();
    } catch (err: any) {
      console.error('Failed to save reminder:', err);
      setError(err.message || 'Failed to save reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reminderToEdit?.id || !onDelete) return;
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(reminderToEdit.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete reminder:', err);
      setError(err.message || 'Failed to delete reminder.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                {reminderToEdit ? 'Edit Faculty Reminder' : 'Create Academic Reminder'}
              </h2>
              <p className="text-xs text-slate-300">
                Track class tests, assignment pending submissions, and session duties.
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reminder Category <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReminderType)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CLASS_TEST">Class Test / CIA Exam</option>
                <option value="ASSIGNMENT">Assignment Due / Pending</option>
                <option value="ATTENDANCE">Attendance Roll Call</option>
                <option value="GENERAL">General Notice / Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reminder Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 2 Class Test: Machine Learning Architectures"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class & Subject Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Class</span>
              </label>
              {assignedClasses.length > 0 ? (
                <select
                  value={classId || className}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {assignedClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="ALL">All Enrolled Classes</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. B.sc AI & ML - Year III"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Subject Name</span>
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Deep Learning"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Due Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Time / Session</span>
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="10:00 AM / Period 2"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Action Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Conduct 25-mark CIA test on Units 1 & 2. Collect pending assignment notebooks before 2 PM."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {reminderToEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{reminderToEdit ? 'Update Reminder' : 'Create Reminder'}</span>
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
