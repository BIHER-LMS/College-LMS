import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  Loader2,
  Users,
  Info,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { BulkStudentUploadItem } from '../types/faculty.types';

interface StudentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  onSuccess: () => void;
}

interface ParsedStudentRow extends BulkStudentUploadItem {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
}

export const StudentUploadModal: React.FC<StudentUploadModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadedCount, setUploadedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample Template (.xlsx or .csv)
  const handleDownloadSample = (format: 'xlsx' | 'csv') => {
    const sampleHeaders = [
      'student roll no',
      'student name',
      'dob',
      'student email id',
      'student phone no',
      'student parent phone no',
    ];

    const sampleData = [
      sampleHeaders,
      [
        '710023AIML001',
        'Aadhavan K',
        '2004-05-14',
        'aadhavan.aiml23@college.edu',
        '+91 94431 12345',
        '+91 98421 54321',
      ],
      [
        '710023AIML002',
        'Bhavana S',
        '2004-08-22',
        'bhavana.aiml23@college.edu',
        '+91 94431 12346',
        '+91 98421 54322',
      ],
      [
        '710023AIML003',
        'Dharun Kumar R',
        '2003-11-09',
        'dharun.aiml23@college.edu',
        '+91 94431 12347',
        '+91 98421 54323',
      ],
      [
        '710023AIML004',
        'Keerthana M',
        '2004-03-30',
        'keerthana.aiml23@college.edu',
        '+91 94431 12348',
        '+91 98421 54324',
      ],
      [
        '710023AIML005',
        'Praveen Raj V',
        '2004-01-18',
        'praveen.aiml23@college.edu',
        '+91 94431 12349',
        '+91 98421 54325',
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Roster');

    if (format === 'xlsx') {
      XLSX.writeFile(workbook, `Student_Upload_Template_${className.replace(/\s+/g, '_')}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `Student_Upload_Template_${className.replace(/\s+/g, '_')}.csv`, {
        bookType: 'csv',
      });
    }
  };

  // Normalize column header keys
  const normalizeKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Find column in row matching variations of standard names
  const findColumnValue = (row: Record<string, any>, variations: string[]): string => {
    const keys = Object.keys(row);
    for (const v of variations) {
      const normV = normalizeKey(v);
      const matchedKey = keys.find((k) => normalizeKey(k) === normV || normalizeKey(k).includes(normV));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        const val = row[matchedKey];
        if (val instanceof Date) {
          const y = val.getFullYear();
          const m = String(val.getMonth() + 1).padStart(2, '0');
          const d = String(val.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        return String(val).trim();
      }
    }
    return '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      setHeaderError('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setHeaderError(null);
    setParsedRows([]);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setHeaderError('The uploaded file is empty. Please ensure it contains headers and student rows.');
          setIsProcessing(false);
          return;
        }

        const firstRow = rawData[0];
        const keys = Object.keys(firstRow).map((k) => normalizeKey(k));

        // Required field variations:
        // 1. Roll No
        const hasRollNo = keys.some((k) => k.includes('roll') || k.includes('reg') || k.includes('studentroll'));
        // 2. Name
        const hasName = keys.some((k) => k.includes('name') || k.includes('studentname'));
        // 3. DOB
        const hasDob = keys.some((k) => k.includes('dob') || k.includes('birth') || k.includes('dateofbirth'));
        // 4. Email
        const hasEmail = keys.some((k) => k.includes('email') || k.includes('mail') || k.includes('studentemail'));
        // 5. Phone
        const hasPhone = keys.some(
          (k) => (k.includes('phone') || k.includes('mobile') || k.includes('contact')) && !k.includes('parent')
        );
        // 6. Parent Phone
        const hasParentPhone = keys.some(
          (k) => k.includes('parent') || k.includes('guardian') || k.includes('father') || k.includes('mother')
        );

        const missingHeaders: string[] = [];
        if (!hasRollNo) missingHeaders.push('student roll no');
        if (!hasName) missingHeaders.push('student name');
        if (!hasDob) missingHeaders.push('dob');
        if (!hasEmail) missingHeaders.push('student email id');
        if (!hasPhone) missingHeaders.push('student phone no');
        if (!hasParentPhone) missingHeaders.push('student parent phone no');

        if (missingHeaders.length > 0) {
          setHeaderError(
            `Missing required column headers: ${missingHeaders.join(
              ', '
            )}. Please download and use the provided template format.`
          );
          setIsProcessing(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const processed: ParsedStudentRow[] = rawData.map((row, idx) => {
          const rollNumber = findColumnValue(row, [
            'student roll no',
            'roll no',
            'roll number',
            'register number',
            'reg no',
            'roll',
          ]);
          const name = findColumnValue(row, ['student name', 'name', 'full name', 'student_name']);
          let dob = findColumnValue(row, ['dob', 'date of birth', 'birth date', 'date_of_birth']);
          const email = findColumnValue(row, ['student email id', 'student email', 'email id', 'email', 'mail']);
          const phone = findColumnValue(row, ['student phone no', 'student phone', 'phone no', 'phone', 'mobile']);
          const parentPhone = findColumnValue(row, [
            'student parent phone no',
            'parent phone no',
            'parent phone',
            'parent contact',
            'guardian phone',
          ]);

          // Format Date of Birth if it's an ISO timestamp string
          if (typeof dob === 'string' && dob.includes('T')) {
            dob = dob.split('T')[0];
          }

          const errors: string[] = [];
          if (!rollNumber) errors.push('Roll No is required');
          if (!name) errors.push('Student Name is required');
          if (!email) {
            errors.push('Student Email ID is required');
          } else if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
          }
          if (!dob) errors.push('DOB is required');
          if (!phone) errors.push('Student Phone is required');
          if (!parentPhone) errors.push('Parent Phone is required');

          return {
            rowIndex: idx + 1,
            rollNumber,
            name,
            dob,
            email,
            phone,
            parentPhone,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(processed);
      } catch (err: any) {
        setHeaderError('Failed to parse file. Please verify file integrity and column layout.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleUploadSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload: BulkStudentUploadItem[] = validRows.map((r) => ({
        rollNumber: r.rollNumber,
        name: r.name,
        dob: r.dob,
        email: r.email,
        phone: r.phone,
        parentPhone: r.parentPhone,
      }));

      const res = await facultyApi.bulkUploadStudents(classId, payload);
      setUploadedCount(res.count || validRows.length);
      setUploadSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setHeaderError(err.response?.data?.error || err.message || 'Failed to import students to class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName('');
    setParsedRows([]);
    setHeaderError(null);
    setUploadSuccess(false);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#0B132B] via-[#142C44] to-[#15203D] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Upload Students Roster (Excel / CSV)
              </h2>
              <p className="text-[11px] text-slate-300">
                Target Cohort: <span className="font-semibold text-white">{className}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Required Fields Instruction Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p className="font-semibold text-blue-950">
                Mandatory Excel / CSV Columns Required for Each Student:
              </p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {[
                  'student roll no',
                  'student name',
                  'dob',
                  'student email id (vital)',
                  'student phone no',
                  'student parent phone no',
                ].map((col) => (
                  <span
                    key={col}
                    className="px-2.5 py-0.5 rounded-md bg-white border border-blue-200 font-mono text-[10.5px] font-medium text-blue-800 shadow-2xs"
                  >
                    {col}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-blue-700">
                Student Email ID is vital for institutional student account authentication and attendance notifications.
              </p>
            </div>
            {/* Download Template Buttons */}
            <div className="shrink-0 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleDownloadSample('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSample('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          {!file && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports Microsoft Excel (<strong className="text-slate-700">.xlsx, .xls</strong>) and CSV (
                <strong className="text-slate-700">.csv</strong>)
              </p>
            </div>
          )}

          {/* Error Banner */}
          {headerError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex-1 font-medium">{headerError}</div>
              <button
                onClick={() => {
                  setHeaderError(null);
                  setFile(null);
                }}
                className="text-[11px] font-bold text-rose-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Parsing spreadsheet records and validating columns...
              </p>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Spreadsheet File:</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold">
                    {fileName}
                  </span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold ml-1"
                  >
                    Change File
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {invalidCount} Errors
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
                <table className="w-full text-left text-[11.5px] text-slate-700 divide-y divide-slate-200">
                  <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Roll No</th>
                      <th className="px-3 py-2.5">Student Name</th>
                      <th className="px-3 py-2.5">DOB</th>
                      <th className="px-3 py-2.5">Email ID</th>
                      <th className="px-3 py-2.5">Student Phone</th>
                      <th className="px-3 py-2.5">Parent Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.rowIndex}
                        className={row.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valid
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-600"
                              title={row.errors.join(', ')}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {row.errors[0]}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {row.rollNumber || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                          {row.name || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                          {row.dob || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          {row.email || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap font-mono">
                          {row.phone || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap font-mono">
                          {row.parentPhone || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>Successfully enrolled {uploadedCount} students to {className}! Refreshing roster...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0
              ? `${validCount} of ${parsedRows.length} rows valid and ready for database import.`
              : 'Choose an Excel or CSV file to begin verification.'}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isSubmitting || uploadSuccess}
              onClick={handleUploadSubmit}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 transition ${
                validCount === 0 || isSubmitting || uploadSuccess
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enrolling Students...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Import {validCount} Verified Students</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentUploadModal;
