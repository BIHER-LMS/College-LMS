import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Loader2,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Building2,
  User,
  LayoutDashboard,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { FacultySearchResultItem, FacultySearchResults } from '../types/faculty.types';

const NAVIGATION_PAGES = [
  {
    id: 'page-dashboard',
    title: 'Dashboard',
    subtitle: 'Institutional statistics, department alerts & activity',
    category: 'page' as const,
    url: '/faculty',
    meta: 'Overview',
    keywords: ['dashboard', 'home', 'stats', 'analytics', 'overview'],
  },
  {
    id: 'page-classes',
    title: 'My Assigned Classes',
    subtitle: 'Class incharge roster, batch status and cohorts',
    category: 'page' as const,
    url: '/faculty/classes',
    meta: 'Incharge',
    keywords: ['classes', 'incharge', 'batch', 'roster', 'students', 'assigned'],
  },
  {
    id: 'page-attendance',
    title: 'Attendance Management',
    subtitle: 'Daily student presence, session rosters & shortage alerts',
    category: 'page' as const,
    url: '/faculty/attendance',
    meta: 'Attendance',
    keywords: ['attendance', 'present', 'absent', 'shortage', 'roll', 'roster', 'period', 'session'],
  },
  {
    id: 'page-subjects',
    title: 'Courses & Curricula',
    subtitle: 'Department syllabus, course codes, and semester curricula',
    category: 'page' as const,
    url: '/faculty/subjects',
    meta: 'Curriculum',
    keywords: ['subjects', 'courses', 'curricula', 'syllabus', 'catalog', 'credits'],
  },
  {
    id: 'page-academic',
    title: 'Academic Sessions & Terms',
    subtitle: 'Academic calendar, active session schedules, and semester timeline',
    category: 'page' as const,
    url: '/faculty/academic',
    meta: 'Calendar',
    keywords: ['academic', 'sessions', 'terms', 'calendar', 'semesters', 'years', 'dates'],
  },
  {
    id: 'page-department',
    title: 'Department Overview',
    subtitle: 'HOD details, departmental programs and academic divisions',
    category: 'page' as const,
    url: '/faculty/department',
    meta: 'Department',
    keywords: ['department', 'hod', 'faculty', 'division', 'programs'],
  },
  {
    id: 'page-profile',
    title: 'My Profile & Credentials',
    subtitle: 'Bio, contact info, designations, and account settings',
    category: 'page' as const,
    url: '/faculty/profile',
    meta: 'Profile',
    keywords: ['profile', 'account', 'bio', 'contact', 'email', 'settings'],
  },
];

export const FacultySearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FacultySearchResults>({
    classes: [],
    students: [],
    subjects: [],
    academicYears: [],
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter local navigation pages matching query
  const matchedPages: FacultySearchResultItem[] = query.trim()
    ? NAVIGATION_PAGES.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          p.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      ).map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        category: p.category,
        url: p.url,
        meta: p.meta,
      }))
    : NAVIGATION_PAGES.slice(0, 4);

  // Debounced search API call
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ classes: [], students: [], subjects: [], academicYears: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await facultyApi.search(trimmed);
        setResults(data);
      } catch (err) {
        console.error('Failed to perform search:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Flatten items for keyboard navigation
  const allResultItems: FacultySearchResultItem[] = [
    ...(query.trim() ? matchedPages : []),
    ...results.classes,
    ...results.students,
    ...results.subjects,
    ...results.academicYears,
    ...(!query.trim() ? matchedPages : []),
  ];

  const handleSelect = (item: FacultySearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.url);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResultItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResultItems.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < allResultItems.length) {
      e.preventDefault();
      handleSelect(allResultItems[selectedIndex]);
    }
  };

  const hasAnyResults =
    matchedPages.length > 0 ||
    results.classes.length > 0 ||
    results.students.length > 0 ||
    results.subjects.length > 0 ||
    results.academicYears.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search assigned classes, students, subjects, syllabus..."
          className="w-full pl-9 pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!query && (
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-200/60 border border-slate-300/80 px-1 py-0.5 rounded text-slate-500">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-[460px] flex flex-col animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500 font-medium px-3">
            <span>{query ? `Search results for "${query}"` : 'Quick Navigation & Recent'}</span>
            <span className="text-[10px] text-slate-400">ESC to close</span>
          </div>

          <div className="overflow-y-auto p-1.5 space-y-3">
            {/* Quick Pages */}
            {matchedPages.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Modules & Navigation
                </div>
                <div className="space-y-0.5">
                  {matchedPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handleSelect(page)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          {page.url === '/faculty' ? (
                            <LayoutDashboard className="w-3.5 h-3.5" />
                          ) : page.url === '/faculty/classes' ? (
                            <GraduationCap className="w-3.5 h-3.5" />
                          ) : page.url === '/faculty/attendance' ? (
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          ) : page.url === '/faculty/subjects' ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : page.url === '/faculty/academic' ? (
                            <Calendar className="w-3.5 h-3.5" />
                          ) : page.url === '/faculty/department' ? (
                            <Building2 className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                            {page.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{page.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Classes Section */}
            {results.classes.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3 h-3 text-blue-600" />
                  <span>Assigned Classes</span>
                </div>
                <div className="space-y-0.5">
                  {results.classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => handleSelect(cls)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                          {cls.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{cls.subtitle}</p>
                      </div>
                      {cls.meta && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium shrink-0 ml-2">
                          {cls.meta}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Students Section */}
            {results.students.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span>Students Roster</span>
                </div>
                <div className="space-y-0.5">
                  {results.students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelect(student)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {student.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                            {student.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{student.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subjects & Syllabus Section */}
            {results.subjects.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-indigo-600" />
                  <span>Courses & Syllabus</span>
                </div>
                <div className="space-y-0.5">
                  {results.subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSelect(sub)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                          {sub.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{sub.subtitle}</p>
                      </div>
                      {sub.meta && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-600 font-medium shrink-0 ml-2">
                          {sub.meta}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Sessions Section */}
            {results.academicYears.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-violet-600" />
                  <span>Academic Sessions & Terms</span>
                </div>
                <div className="space-y-0.5">
                  {results.academicYears.map((ay) => (
                    <button
                      key={ay.id}
                      onClick={() => handleSelect(ay)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                          {ay.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{ay.subtitle}</p>
                      </div>
                      {ay.meta && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold shrink-0 ml-2">
                          {ay.meta}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when searching and no results */}
            {query.trim() && !loading && !hasAnyResults && (
              <div className="py-8 px-4 text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  No matching results for "{query}"
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Search by class name (e.g. CSE), student name/reg number, course title, or academic session.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySearchBar;
