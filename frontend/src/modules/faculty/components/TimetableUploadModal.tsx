import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  FileCheck,
} from 'lucide-react';
import type { FacultyTimetableSlot } from '../types/faculty.types';

interface TimetableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSaveBulk: (slots: Partial<FacultyTimetableSlot>[], replaceExisting: boolean) => Promise<any>;
  assignedClasses: { id: string; name: string }[];
}

interface ParsedSlotRow {
  id: string;
  day_of_week: string;
  period: string;
  start_time: string;
  end_time: string;
  class_name: string;
  class_id?: string;
  subject_name: string;
  room: string;
}

const SAMPLE_CSV = `Day,Period,Start Time,End Time,Class,Subject,Room
Monday,Period 1,09:00 AM,09:50 AM,B.sc AI & ML - Year III (Sec A),Machine Learning Techniques,Room 301
Monday,Period 2,10:00 AM,10:50 AM,B.sc AI & ML - Year III (Sec A),Deep Learning Architectures,Lab 2
Tuesday,Period 3,11:10 AM,12:00 PM,B.sc AI & ML - Year III (Sec A),Natural Language Processing,Room 302
Wednesday,Period 1,09:00 AM,09:50 AM,B.sc AI & ML - Year III (Sec A),Computer Vision & Robotics,Lab 1
Thursday,Period 4,12:00 PM,12:50 PM,B.sc AI & ML - Year III (Sec A),AI Ethics and Governance,Room 301
Friday,Period 5,01:45 PM,02:35 PM,B.sc AI & ML - Year III (Sec A),Applied Machine Learning Lab,Lab 2
Saturday,Period 2,10:00 AM,10:50 AM,B.sc AI & ML - Year III (Sec A),Machine Learning Techniques,Room 301`;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TimetableUploadModal: React.FC<TimetableUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSaveBulk,
  assignedClasses,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedSlotRow[]>([]);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'faculty_timetable_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const normalizeKey = (key: string): string => {
    const clean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('day') || clean.includes('weekday')) return 'day';
    if (clean.includes('period') || clean.includes('hour') || clean.includes('session')) return 'period';
    if (clean.includes('start') || clean.includes('from')) return 'start_time';
    if (clean.includes('end') || clean.includes('to')) return 'end_time';
    if (clean.includes('class') || clean.includes('section') || clean.includes('batch')) return 'class';
    if (clean.includes('sub') || clean.includes('course') || clean.includes('paper')) return 'subject';
    if (clean.includes('room') || clean.includes('hall') || clean.includes('lab') || clean.includes('loc')) return 'room';
    return clean;
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    const name = selectedFile.name;
    const ext = name.split('.').pop()?.toLowerCase();

    // Strict validation: Only Excel (.xlsx, .xls) and CSV (.csv) permitted
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      setError('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file only.');
      setFileName('');
      setParsedRows([]);
      return;
    }

    setFileName(name);
    parseFile(selectedFile);
  };

  const parseFile = async (fileToParse: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const buffer = await fileToParse.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('The workbook contains no sheets.');
      }
      const sheet = workbook.Sheets[sheetName];
      const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (rawJson.length === 0) {
        throw new Error('The uploaded spreadsheet contains no data rows.');
      }

      const rows: ParsedSlotRow[] = rawJson.map((row, index) => {
        let day = 'Monday';
        let period = `Period ${index + 1}`;
        let startTime = '';
        let endTime = '';
        let className = assignedClasses[0]?.name || 'Assigned Class';
        let subjectName = 'General Instruction';
        let room = '';

        for (const [rawKey, rawVal] of Object.entries(row)) {
          const valStr = String(rawVal).trim();
          if (!valStr) continue;
          const normalized = normalizeKey(rawKey);

          if (normalized === 'day') {
            const matchedDay = DAYS.find((d) => d.toLowerCase() === valStr.toLowerCase());
            day = matchedDay || valStr;
          } else if (normalized === 'period') {
            period = valStr.toLowerCase().startsWith('period') ? valStr : `Period ${valStr}`;
          } else if (normalized === 'start_time') {
            startTime = valStr;
          } else if (normalized === 'end_time') {
            endTime = valStr;
          } else if (normalized === 'class') {
            className = valStr;
          } else if (normalized === 'subject') {
            subjectName = valStr;
          } else if (normalized === 'room') {
            room = valStr;
          }
        }

        // Match class ID if matches existing assigned class
        const matchedClass = assignedClasses.find(
          (c) => c.name.toLowerCase() === className.toLowerCase()
        );

        return {
          id: `row-${index}-${Date.now()}`,
          day_of_week: day,
          period,
          start_time: startTime,
          end_time: endTime,
          class_name: className,
          class_id: matchedClass?.id,
          subject_name: subjectName,
          room,
        };
      });

      setParsedRows(rows);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      setError(err.message || 'Failed to parse file. Please verify file integrity and column headers.');
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRow = (id: string, field: keyof ParsedSlotRow, value: string) => {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === 'class_name') {
          const match = assignedClasses.find((c) => c.name.toLowerCase() === value.toLowerCase());
          updated.class_id = match?.id;
        }
        return updated;
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddBlankRow = () => {
    const newRow: ParsedSlotRow = {
      id: `row-new-${Date.now()}`,
      day_of_week: 'Monday',
      period: `Period ${parsedRows.length + 1}`,
      start_time: '09:00 AM',
      end_time: '09:50 AM',
      class_name: assignedClasses[0]?.name || 'Assigned Class',
      class_id: assignedClasses[0]?.id,
      subject_name: 'Core Lecture',
      room: 'Room 101',
    };
    setParsedRows((prev) => [...prev, newRow]);
  };

  const handleConfirmSave = async () => {
    if (parsedRows.length === 0) {
      setError('Please add or upload at least one valid timetable slot.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload: Partial<FacultyTimetableSlot>[] = parsedRows.map((r) => ({
        day_of_week: r.day_of_week,
        period: r.period,
        start_time: r.start_time || null,
        end_time: r.end_time || null,
        class_name: r.class_name,
        class_id: r.class_id || null,
        subject_name: r.subject_name,
        room: r.room || null,
      }));

      await onSaveBulk(payload, replaceExisting);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save timetable:', err);
      setError(err.message || 'Failed to save timetable. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Upload Faculty Timetable</h2>
              <p className="text-xs text-slate-300">
                Upload Excel (.xlsx, .xls) or CSV (.csv) to generate and edit your weekly period schedule.
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area / File Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelection(e.dataTransfer.files[0]);
                }
              }}
              className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {fileName ? (
                    <span className="text-blue-600 font-bold flex items-center justify-center gap-1">
                      <FileCheck className="w-4 h-4" /> {fileName}
                    </span>
                  ) : (
                    'Click to upload or drag & drop timetable file'
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Only <span className="font-semibold text-slate-700">Excel (.xlsx, .xls)</span> or{' '}
                  <span className="font-semibold text-slate-700">CSV (.csv)</span> files accepted
                </p>
              </div>
            </div>

            {/* Template Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Sample Template</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Download our pre-structured timetable format with Day, Period, Time, Class, Subject & Room columns.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Sample .CSV</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview & Edit Section */}
          {isProcessing ? (
            <div className="p-8 text-center space-y-2 text-slate-500">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Parsing and structuring timetable entries...</p>
            </div>
          ) : parsedRows.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Timetable Preview & Edit ({parsedRows.length} Slots)
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    Validated
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Replace existing timetable</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddBlankRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Day</th>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3">Time Range</th>
                      <th className="py-2 px-3">Class Name</th>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3">Room</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Day */}
                        <td className="py-1.5 px-3 min-w-[110px]">
                          <select
                            value={row.day_of_week}
                            onChange={(e) => handleUpdateRow(row.id, 'day_of_week', e.target.value)}
                            className="w-full text-xs font-medium bg-transparent border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:border-blue-500"
                          >
                            {DAYS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Period */}
                        <td className="py-1.5 px-3 min-w-[90px]">
                          <input
                            type="text"
                            value={row.period}
                            onChange={(e) => handleUpdateRow(row.id, 'period', e.target.value)}
                            placeholder="Period 1"
                            className="w-full text-xs bg-transparent border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:border-blue-500 font-medium"
                          />
                        </td>

                        {/* Time Range */}
                        <td className="py-1.5 px-3 min-w-[140px]">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={row.start_time}
                              onChange={(e) => handleUpdateRow(row.id, 'start_time', e.target.value)}
                              placeholder="09:00 AM"
                              className="w-16 text-[11px] bg-transparent border border-slate-200 rounded px-1 py-1 focus:bg-white focus:border-blue-500"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="text"
                              value={row.end_time}
                              onChange={(e) => handleUpdateRow(row.id, 'end_time', e.target.value)}
                              placeholder="09:50 AM"
                              className="w-16 text-[11px] bg-transparent border border-slate-200 rounded px-1 py-1 focus:bg-white focus:border-blue-500"
                            />
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-1.5 px-3 min-w-[160px]">
                          <input
                            type="text"
                            value={row.class_name}
                            onChange={(e) => handleUpdateRow(row.id, 'class_name', e.target.value)}
                            placeholder="e.g. B.Sc AI & ML - Year III"
                            className="w-full text-xs font-semibold text-slate-800 bg-transparent border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:border-blue-500"
                          />
                        </td>

                        {/* Subject */}
                        <td className="py-1.5 px-3 min-w-[150px]">
                          <input
                            type="text"
                            value={row.subject_name}
                            onChange={(e) => handleUpdateRow(row.id, 'subject_name', e.target.value)}
                            placeholder="e.g. Deep Learning"
                            className="w-full text-xs text-blue-700 bg-transparent border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:border-blue-500 font-medium"
                          />
                        </td>

                        {/* Room */}
                        <td className="py-1.5 px-3 min-w-[90px]">
                          <input
                            type="text"
                            value={row.room}
                            onChange={(e) => handleUpdateRow(row.id, 'room', e.target.value)}
                            placeholder="Room 301"
                            className="w-full text-xs bg-transparent border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:border-blue-500"
                          />
                        </td>

                        {/* Action */}
                        <td className="py-1.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmSave}
            disabled={parsedRows.length === 0 || isSaving}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
              parsedRows.length === 0 || isSaving
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Timetable...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Apply Timetable ({parsedRows.length} Slots)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
