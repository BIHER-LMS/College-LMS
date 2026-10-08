import React, { useState } from 'react';
import {
  Search,
  Eye,
  ArrowUpDown,
  X,
  Crown,
  Upload,
  TrendingUp,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ClassStudentSummary } from '../types/faculty.types';

interface StudentTableProps {
  students: ClassStudentSummary[];
  loading?: boolean;
  onOpenUploadModal?: () => void;
  onOpenAddStudentModal?: () => void;
  onOpenAssignRepModal?: () => void;
  onDirectAssignRep?: (studentUid: string) => void;
  onDeleteStudent?: (student: ClassStudentSummary) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  onOpenUploadModal,
  onOpenAddStudentModal,
  onOpenAssignRepModal,
  onDirectAssignRep,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  if (loading) {
    return (
      <div className="border border-slate-200 rounded-xl bg-white p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading enrolled student directory...
      </div>
    );
  }

  const filtered = students
    .filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      const name = (s.name || '').toLowerCase();
      const reg = (s.registerNumber || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      return name.includes(q) || reg.includes(q) || email.includes(q) || phone.includes(q);
    })
    .sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {onOpenAddStudentModal && (
            <button
              type="button"
              onClick={onOpenAddStudentModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Student</span>
            </button>
          )}

          {onOpenUploadModal && (
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Students (Excel/CSV)</span>
            </button>
          )}

          {onOpenAssignRepModal && (
            <button
              type="button"
              onClick={onOpenAssignRepModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold shadow-2xs transition"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Assign Class Rep</span>
            </button>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="border border-slate-200 rounded-2xl bg-white p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Students Enrolled Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add individual students manually or upload your cohort using an Excel (.xlsx) or CSV file.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {onOpenAddStudentModal && (
              <button
                type="button"
                onClick={onOpenAddStudentModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Student Manually</span>
              </button>
            )}
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Upload (Excel/CSV)</span>
              </button>
            )}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-slate-200 rounded-xl bg-white p-12 text-center text-xs text-slate-500">
          No students matching search filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 cursor-pointer select-none hover:text-slate-900"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Student</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-3.5 py-3 whitespace-nowrap">Roll No</th>
                  <th scope="col" className="px-3 py-3 whitespace-nowrap">DOB</th>
                  <th scope="col" className="px-3.5 py-3 min-w-[180px]">Email ID</th>
                  <th scope="col" className="px-3 py-3 whitespace-nowrap">Student Phone</th>
                  <th scope="col" className="px-3 py-3 whitespace-nowrap">Parent Phone</th>
                  <th scope="col" className="px-3 py-3 text-center whitespace-nowrap">Attendance</th>
                  <th scope="col" className="px-3 py-3 text-center whitespace-nowrap">Performance</th>
                  <th scope="col" className="px-4 py-3 text-right whitespace-nowrap min-w-[210px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((student) => {
                  const attd = student.attendancePercentage;
                  const attdColor =
                    attd == null
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : attd >= 85
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : attd >= 75
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <tr
                      key={student.uid}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        student.isClassRep ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Name & CR Badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2.5">
                          {student.profilePhoto ? (
                            <img
                              src={student.profilePhoto}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-[11px] shrink-0">
                              {student.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">{student.name}</span>
                              {student.isClassRep && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                  <Crown className="w-2.5 h-2.5 text-amber-700" />
                                  <span>CR</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              Status: {student.accountStatus}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap tracking-wide font-sans">
                        {student.registerNumber || <span className="text-slate-400 italic">Not set</span>}
                      </td>

                      {/* DOB */}
                      <td className="px-3 py-3 font-medium text-[11.5px] text-slate-600 whitespace-nowrap font-sans">
                        {student.dob || <span className="text-slate-400 italic">—</span>}
                      </td>

                      {/* Email */}
                      <td className="px-3.5 py-3 text-slate-600 truncate max-w-[220px]" title={student.email}>
                        {student.email}
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-3 font-medium text-[11.5px] text-slate-600 whitespace-nowrap font-sans">
                        {student.phone || <span className="text-slate-400 italic">—</span>}
                      </td>

                      {/* Parent Phone */}
                      <td className="px-3 py-3 font-medium text-[11.5px] text-slate-600 whitespace-nowrap font-sans">
                        {student.parentPhone || <span className="text-slate-400 italic">—</span>}
                      </td>

                      {/* Attendance % */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {attd != null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${attdColor}`}
                          >
                            {attd}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200">
                            No logs
                          </span>
                        )}
                      </td>

                      {/* Performance */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {student.performanceScore != null || student.performanceGrade ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                            <TrendingUp className="w-3 h-3 text-blue-600" />
                            <span>{student.performanceGrade || 'Grade'} ({student.performanceScore}%)</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No exams</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap min-w-[210px]">
                        <div className="flex items-center justify-end gap-1.5">
                          {onDirectAssignRep && !student.isClassRep && (
                            <button
                              type="button"
                              onClick={() => onDirectAssignRep(student.uid)}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10.5px] font-semibold flex items-center gap-1 transition"
                              title="Assign as Class Representative"
                            >
                              <Crown className="w-3 h-3 text-amber-600" />
                              <span>Set CR</span>
                            </button>
                          )}
                          <Link
                            to={`/faculty/students/${student.uid}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-semibold transition"
                            title="View Student Profile"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Profile</span>
                          </Link>
                          {onDeleteStudent && (
                            <button
                              type="button"
                              onClick={() => onDeleteStudent(student)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-semibold transition"
                              title="Remove Student from Class Roster"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11.5px] text-slate-500 flex items-center justify-between">
            <span>Showing {filtered.length} of {students.length} enrolled students</span>
            <span className="font-semibold text-slate-600">
              {students.filter((s) => s.isClassRep).length > 0 ? '👑 Class Representative Assigned' : 'No CR Assigned'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
