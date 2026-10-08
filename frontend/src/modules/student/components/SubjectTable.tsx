import React, { useState, useMemo } from 'react';
import type { SubjectInfo } from '../types/student.types';
import { EmptyState } from './EmptyState';

interface SubjectTableProps {
  subjects: SubjectInfo[];
  currentSemester?: number;
  onFilterSemester?: (sem?: number) => void;
  isLoading?: boolean;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  currentSemester = 3,
  onFilterSemester,
  isLoading = false,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const availableSemesters = useMemo(() => {
    const sems = new Set<number>();
    subjects.forEach((s) => sems.add(s.semesterNumber));
    return Array.from(sems).sort((a, b) => a - b);
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSem =
        selectedSemester === 'all'
          ? true
          : selectedSemester === 'current'
          ? s.semesterNumber === currentSemester
          : s.semesterNumber === parseInt(selectedSemester, 10);

      const matchesSearch =
        searchTerm.trim() === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSem && matchesSearch;
    });
  }, [subjects, selectedSemester, currentSemester, searchTerm]);

  const handleSemesterChange = (val: string) => {
    setSelectedSemester(val);
    if (onFilterSemester) {
      if (val === 'all') onFilterSemester(undefined);
      else if (val === 'current') onFilterSemester(currentSemester);
      else onFilterSemester(parseInt(val, 10));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Department Curriculum Courses
            </h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
              {filteredSubjects.length} Courses
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-0.5">
            Curriculum subjects mapped to your academic department & semester
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[1rem]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code or subject..."
              className="h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={selectedSemester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Semesters</option>
            <option value="current">Current Semester ({currentSemester})</option>
            {availableSemesters.map((sem) => (
              <option key={sem} value={sem.toString()}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
          Loading curriculum database records...
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon="menu_book"
            title="No Subjects Found"
            description={
              searchTerm
                ? `No courses matching "${searchTerm}". Try resetting search filter.`
                : 'No subjects are registered for this semester in your department curriculum.'
            }
            actionText={searchTerm || selectedSemester !== 'all' ? 'Reset Filters' : undefined}
            onAction={() => {
              setSearchTerm('');
              handleSemesterChange('all');
            }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubjects.map((sub) => {
                const isCurrentSem = sub.semesterNumber === currentSemester;
                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isCurrentSem ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-semibold">
                        {sub.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">{sub.name}</span>
                        {isCurrentSem && (
                          <span className="text-blue-600 text-[11px] font-medium">
                            Current Enrolled Semester
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Semester {sub.semesterNumber}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{sub.credits} Credits</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${
                          sub.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {sub.isActive ? 'Active Course' : 'Archived'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Notice Banner */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2 rounded-b-lg">
        <span className="material-symbols-outlined text-[1rem] text-slate-400">verified_user</span>
        <span>
          Department Syllabus records are sourced directly from the institutional database.
        </span>
      </div>
    </div>
  );
};
