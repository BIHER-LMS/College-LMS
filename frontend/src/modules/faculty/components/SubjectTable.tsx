import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { SubjectInfo } from '../types/faculty.types';

interface SubjectTableProps {
  subjects: SubjectInfo[];
  loading?: boolean;
  selectedSemester?: number;
  onSemesterChange?: (sem: number | undefined) => void;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  loading,
  selectedSemester,
  onSemesterChange,
}) => {
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="border border-slate-200 rounded-lg bg-white p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading courses and curricula...
      </div>
    );
  }

  const semestersList = Array.from(new Set(subjects.map((s) => s.semesterNumber))).sort((a, b) => a - b);

  const filtered = subjects.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.code && s.code.toLowerCase().includes(q));
    const matchesSem = selectedSemester ? s.semesterNumber === selectedSemester : true;
    return matchesSearch && matchesSem;
  });

  if (subjects.length === 0) {
    return (
      <div className="border border-slate-200 rounded bg-white p-20 text-center text-xs text-slate-500">
        No active records found for this module in the current academic session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter courses by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSemester || ''}
            onChange={(e) => onSemesterChange?.(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Filter subjects by semester"
            className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Semesters</option>
            {semestersList.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-slate-200 rounded bg-white p-16 text-center text-xs text-slate-500">
          No courses matching your filter criteria.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3">Course Code</th>
                <th scope="col" className="px-4 py-3">Course Title</th>
                <th scope="col" className="px-4 py-3 text-center">Semester</th>
                <th scope="col" className="px-4 py-3 text-center">Credits</th>
                <th scope="col" className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((subject) => (
                <tr key={subject.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {subject.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {subject.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      Sem {subject.semesterNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-800">
                    {subject.credits}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        subject.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubjectTable;
