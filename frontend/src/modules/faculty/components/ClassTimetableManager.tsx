import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Download,
  CheckCircle2,
  X,
  Loader2,
  MapPin,
  User,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { ClassTimetableSlot } from '../types/faculty.types';

interface ClassTimetableManagerProps {
  classId: string;
  className: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_PERIODS = [
  { period: 'Period 1', startTime: '09:00 AM', endTime: '09:50 AM' },
  { period: 'Period 2', startTime: '09:50 AM', endTime: '10:40 AM' },
  { period: 'Period 3', startTime: '11:00 AM', endTime: '11:50 AM' },
  { period: 'Period 4', startTime: '11:50 AM', endTime: '12:40 PM' },
  { period: 'Period 5', startTime: '01:30 PM', endTime: '02:20 PM' },
  { period: 'Period 6', startTime: '02:20 PM', endTime: '03:10 PM' },
  { period: 'Period 7', startTime: '03:10 PM', endTime: '04:00 PM' },
  { period: 'Period 8', startTime: '04:00 PM', endTime: '04:50 PM' },
];

export const ClassTimetableManager: React.FC<ClassTimetableManagerProps> = ({
  classId,
  className,
}) => {
  const [slots, setSlots] = useState<ClassTimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Slot Edit / Create Modal state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<ClassTimetableSlot> | null>(null);
  const [savingSlot, setSavingSlot] = useState(false);

  // Bulk Upload Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [parsedSlots, setParsedSlots] = useState<Partial<ClassTimetableSlot>[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facultyApi.getClassTimetable(classId);
      setSlots(data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load class timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadTimetable();
    }
  }, [classId]);

  // Handle Delete Slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!slotId) return;
    // Optimistic UI delete
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    try {
      await facultyApi.deleteClassTimetableSlot(classId, slotId);
    } catch (err) {
      console.error('Failed to delete slot:', err);
      loadTimetable();
    }
  };

  // Open modal to add or edit slot
  const handleOpenAddSlot = (day: string, periodInfo?: { period: string; startTime: string; endTime: string }) => {
    setEditingSlot({
      day_of_week: day,
      period: periodInfo?.period || 'Period 1',
      start_time: periodInfo?.startTime || '09:00 AM',
      end_time: periodInfo?.endTime || '09:50 AM',
      subject_name: '',
      subject_code: '',
      faculty_name: '',
      room: '',
    });
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: ClassTimetableSlot) => {
    setEditingSlot({ ...slot });
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !editingSlot.subject_name || !editingSlot.day_of_week || !editingSlot.period) {
      return;
    }

    setSavingSlot(true);
    try {
      await facultyApi.saveClassTimetableSlot(classId, editingSlot);
      setIsSlotModalOpen(false);
      setEditingSlot(null);
      loadTimetable();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save timetable slot');
    } finally {
      setSavingSlot(false);
    }
  };

  // Download Sample Timetable Template (.xlsx or .csv)
  const handleDownloadSample = (format: 'xlsx' | 'csv') => {
    const headers = [
      'day_of_week',
      'period',
      'start_time',
      'end_time',
      'subject_name',
      'subject_code',
      'faculty_name',
      'room',
    ];

    const sampleRows = [
      headers,
      ['Monday', 'Period 1', '09:00 AM', '09:50 AM', 'Deep Learning & Neural Networks', 'AIML-601', 'Dr. Amirtha Varsshan', 'Lab 4 / Hall 204'],
      ['Monday', 'Period 2', '09:50 AM', '10:40 AM', 'Natural Language Processing', 'AIML-602', 'Prof. Priya Raman', 'Hall 204'],
      ['Monday', 'Period 3', '11:00 AM', '11:50 AM', 'Computer Vision Lab', 'AIML-603P', 'Dr. Amirtha Varsshan', 'AI Compute Lab'],
      ['Tuesday', 'Period 1', '09:00 AM', '09:50 AM', 'AI Ethics & Governance', 'AIML-604', 'Dr. K. Suresh', 'Hall 204'],
      ['Tuesday', 'Period 2', '09:50 AM', '10:40 AM', 'Cloud & Distributed Systems', 'AIML-605', 'Prof. M. Rajesh', 'Hall 204'],
      ['Wednesday', 'Period 1', '09:00 AM', '09:50 AM', 'Deep Learning & Neural Networks', 'AIML-601', 'Dr. Amirtha Varsshan', 'Lab 4'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Class_Timetable');

    if (format === 'xlsx') {
      XLSX.writeFile(workbook, `Class_Timetable_Template_${className.replace(/\s+/g, '_')}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `Class_Timetable_Template_${className.replace(/\s+/g, '_')}.csv`, {
        bookType: 'csv',
      });
    }
  };

  // Handle Timetable File Selection
  const handleTimetableFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadFile(selectedFile);
    setUploadFileName(selectedFile.name);
    setUploadError(null);
    setParsedSlots([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setUploadError('The uploaded file is empty.');
          return;
        }

        const normKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

        const parsed: Partial<ClassTimetableSlot>[] = [];
        for (const row of rawData) {
          const keys = Object.keys(row);
          const getVal = (candidates: string[]) => {
            for (const c of candidates) {
              const nc = normKey(c);
              const mk = keys.find((k) => normKey(k) === nc || normKey(k).includes(nc));
              if (mk && row[mk]) return String(row[mk]).trim();
            }
            return '';
          };

          const day = getVal(['day_of_week', 'day', 'day of week']);
          const period = getVal(['period', 'period_number', 'slot']);
          const subject = getVal(['subject_name', 'subject', 'course', 'course_name']);
          const code = getVal(['subject_code', 'code', 'course_code']);
          const startTime = getVal(['start_time', 'start', 'from']);
          const endTime = getVal(['end_time', 'end', 'to']);
          const faculty = getVal(['faculty_name', 'faculty', 'teacher', 'instructor']);
          const room = getVal(['room', 'hall', 'lab', 'venue']);

          if (day && period && subject) {
            parsed.push({
              day_of_week: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
              period,
              start_time: startTime || '09:00 AM',
              end_time: endTime || '09:50 AM',
              subject_name: subject,
              subject_code: code || null,
              faculty_name: faculty || null,
              room: room || null,
            });
          }
        }

        if (parsed.length === 0) {
          setUploadError(
            'No valid period records found. Please ensure headers match: day_of_week, period, subject_name, start_time, end_time.'
          );
          return;
        }

        setParsedSlots(parsed);
      } catch (err: any) {
        setUploadError('Failed to parse file. Please verify file integrity.');
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleBulkUploadSubmit = async () => {
    if (parsedSlots.length === 0) return;
    setIsUploading(true);
    try {
      await facultyApi.bulkSaveClassTimetable(classId, parsedSlots, replaceExisting);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setParsedSlots([]);
      loadTimetable();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || err.message || 'Failed to save timetable');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Class Master Timetable (Period-wise)
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Shown to All Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Period-wise master schedule for {className}. Updated weekly and visible across all student dashboards.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Timetable (Excel/CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddSlot('Monday')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl animate-pulse">
          Loading master class timetable...
        </div>
      ) : (
        /* Period-wise Weekly Grid */
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = slots.filter(
              (s) => (s.day_of_week || '').toLowerCase() === day.toLowerCase()
            );

            return (
              <div
                key={day}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
              >
                {/* Day Header */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{day}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({daySlots.length} {daySlots.length === 1 ? 'Period' : 'Periods'} Scheduled)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddSlot(day)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Period</span>
                  </button>
                </div>

                {/* Day Slots Grid */}
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {daySlots.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No periods scheduled for {day}.{' '}
                      <button
                        onClick={() => handleOpenAddSlot(day)}
                        className="text-blue-600 font-semibold hover:underline ml-1"
                      >
                        + Add Period Slot
                      </button>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-2 relative group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {slot.period}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{slot.start_time || '—'} - {slot.end_time || '—'}</span>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {slot.subject_name}
                          </h4>
                          {slot.subject_code && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Code: {slot.subject_code}
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                          {slot.faculty_name && (
                            <div className="flex items-center gap-1 truncate text-slate-700">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{slot.faculty_name}</span>
                            </div>
                          )}
                          {slot.room && (
                            <div className="flex items-center gap-1 truncate text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{slot.room}</span>
                            </div>
                          )}
                        </div>

                        {/* Hover Quick Actions */}
                        <div className="flex items-center justify-end gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSlot(slot)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Period"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Period"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT PERIOD SLOT MODAL                             */}
      {/* ======================================================== */}
      {isSlotModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0B132B] to-[#15203D] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingSlot.id ? 'Edit Class Period Slot' : 'Add Class Period Slot'}
              </h3>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Day of Week</label>
                  <select
                    value={editingSlot.day_of_week || 'Monday'}
                    onChange={(e) => setEditingSlot({ ...editingSlot, day_of_week: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Period</label>
                  <select
                    value={editingSlot.period || 'Period 1'}
                    onChange={(e) => {
                      const sel = DEFAULT_PERIODS.find((p) => p.period === e.target.value);
                      setEditingSlot({
                        ...editingSlot,
                        period: e.target.value,
                        start_time: sel ? sel.startTime : editingSlot.start_time,
                        end_time: sel ? sel.endTime : editingSlot.end_time,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white"
                  >
                    {DEFAULT_PERIODS.map((p) => (
                      <option key={p.period} value={p.period}>
                        {p.period} ({p.startTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editingSlot.start_time || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, start_time: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={editingSlot.end_time || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, end_time: e.target.value })}
                    placeholder="09:50 AM"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSlot.subject_name || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subject_name: e.target.value })}
                  placeholder="e.g. Deep Learning & Neural Networks"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={editingSlot.subject_code || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, subject_code: e.target.value })}
                    placeholder="e.g. AIML-601"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={editingSlot.room || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    placeholder="e.g. Lab 4 / Hall 204"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teacher / Faculty Name</label>
                <input
                  type="text"
                  value={editingSlot.faculty_name || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, faculty_name: e.target.value })}
                  placeholder="e.g. Dr. Amirtha Varsshan"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSlot}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {savingSlot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BULK UPLOAD TIMETABLE MODAL (EXCEL / CSV)                */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0B132B] to-[#15203D] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold">Upload Class Timetable (Excel / CSV)</h3>
                  <p className="text-[11px] text-slate-300">Cohort: {className}</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Instructions and Download Template */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">Spreadsheet Headers Required:</p>
                  <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                    day_of_week, period, start_time, end_time, subject_name, subject_code, faculty_name, room
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadSample('xlsx')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700"
                  >
                    <Download className="w-3 h-3" />
                    <span>Template (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSample('csv')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 text-white font-semibold text-[11px] hover:bg-slate-800"
                  >
                    <Download className="w-3 h-3" />
                    <span>Template (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              {!uploadFile && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleTimetableFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">Choose Timetable Spreadsheet File</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setUploadError(null);
                    }}
                    className="underline text-[11px] font-bold"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Preview of Parsed Slots */}
              {parsedSlots.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Parsed {parsedSlots.length} Timetable Slots ({uploadFileName})
                    </span>
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        setParsedSlots([]);
                      }}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Change File
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-left text-[11px] text-slate-700 divide-y divide-slate-200">
                      <thead className="bg-slate-50 font-bold uppercase text-[9.5px] text-slate-500 sticky top-0">
                        <tr>
                          <th className="px-2.5 py-2">Day</th>
                          <th className="px-2.5 py-2">Period</th>
                          <th className="px-2.5 py-2">Time</th>
                          <th className="px-2.5 py-2">Subject</th>
                          <th className="px-2.5 py-2">Faculty</th>
                          <th className="px-2.5 py-2">Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedSlots.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-2.5 py-1.5 font-bold text-slate-900">{s.day_of_week}</td>
                            <td className="px-2.5 py-1.5">{s.period}</td>
                            <td className="px-2.5 py-1.5 font-mono text-[10px] text-slate-500">
                              {s.start_time} - {s.end_time}
                            </td>
                            <td className="px-2.5 py-1.5 font-semibold text-slate-800">{s.subject_name}</td>
                            <td className="px-2.5 py-1.5 text-slate-600">{s.faculty_name || '—'}</td>
                            <td className="px-2.5 py-1.5 text-slate-500">{s.room || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Replace existing timetable for this class with uploaded schedule</span>
                  </label>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedSlots.length === 0 || isUploading}
                onClick={handleBulkUploadSubmit}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition ${
                  parsedSlots.length === 0 || isUploading
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish {parsedSlots.length} Slots to Class</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTimetableManager;
