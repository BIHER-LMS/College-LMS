import React, { useEffect, useState } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { SubjectTable } from '../components/SubjectTable';
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { facultyApi } from '../api/facultyApi';
import type { FacultySubjectClassPerformance } from '../types/faculty.types';

export const FacultySubjectsPage: React.FC = () => {
  const { subjects, department, loading, loadSubjects, loadDepartment } = useFaculty();
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<'my-performance' | 'catalog'>('my-performance');

  const [subjectPerformances, setSubjectPerformances] = useState<FacultySubjectClassPerformance[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState<boolean>(true);

  useEffect(() => {
    loadDepartment();
    loadSubjects(selectedSemester);
  }, [selectedSemester]);

  useEffect(() => {
    setLoadingPerformance(true);
    facultyApi
      .getMySubjectsPerformance()
      .then((data) => {
        setSubjectPerformances(data || []);
      })
      .catch((err) => {
        console.error('Failed to load subject performances:', err);
      })
      .finally(() => {
        setLoadingPerformance(false);
      });
  }, []);

  // Compute aggregate statistics
  const totalSubjects = subjectPerformances.length;
  const allClasses = subjectPerformances.flatMap((s) => s.classes);
  const totalClassCohorts = allClasses.length;
  const totalStudentsTaught = allClasses.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0);

  const validAttClasses = allClasses.filter((c) => c.averageAttendance != null);
  const avgAttendance =
    validAttClasses.length > 0
      ? Math.round(
          validAttClasses.reduce((acc, c) => acc + (c.averageAttendance || 0), 0) / validAttClasses.length
        )
      : null;

  const validPassClasses = allClasses.filter((c) => c.passPercentage != null);
  const avgPassRate =
    validPassClasses.length > 0
      ? Math.round(
          validPassClasses.reduce((acc, c) => acc + (c.passPercentage || 0), 0) / validPassClasses.length
        )
      : null;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#142C44] to-[#15203D] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/20 shadow-xs shrink-0">
              <BookOpen className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  My Subjects
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Academic Year 2026 - 2027
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Assigned teaching subjects, enrolled classes breakdown, syllabus progress, and cohort performance analytics.
              </p>
            </div>
          </div>

          {department?.code && (
            <div className="relative z-10 text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-300 self-start md:self-auto flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>{department.name || `${department.code} Department`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subjects */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-sky-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Subjects
            </span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalSubjects}</span>
            <span className="text-xs text-sky-600 font-semibold">Active Papers</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Curriculum verified by HOD</p>
        </div>

        {/* Classes Covered */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classes Covered
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalClassCohorts}</span>
            <span className="text-xs text-blue-600 font-semibold">Class Cohorts</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Across {totalStudentsTaught} enrolled students
          </p>
        </div>

        {/* Average Attendance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subject Attendance
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{avgAttendance != null ? `${avgAttendance}%` : '0%'}</span>
            <span className="text-xs text-emerald-600 font-semibold">{avgAttendance != null ? 'Avg Attendance' : 'No Sessions'}</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${avgAttendance ?? 0}%` }}
            />
          </div>
        </div>

        {/* Pass Percentage */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Academic Pass Rate
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{avgPassRate != null ? `${avgPassRate}%` : '—'}</span>
            <span className="text-xs text-purple-600 font-semibold">{avgPassRate != null ? 'Passing Standard' : 'No Exam Data'}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Continuous Internal Assessment</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('my-performance')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === 'my-performance'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BarChartIcon className="w-4 h-4" />
            <span>Class-wise Subject Performance</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
              {subjectPerformances.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === 'catalog'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Department Course Catalog & Syllabus</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Class-wise Performance for each Subject */}
      {activeTab === 'my-performance' && (
        <div className="space-y-6">
          {loadingPerformance ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : subjectPerformances.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Teaching Subjects Assigned</h3>
              <p className="text-xs text-slate-500">
                You currently have no course load assigned in the timetable system. Contact your Department HOD to configure your teaching workload.
              </p>
            </div>
          ) : (
            subjectPerformances.map((subj) => (
              <div
                key={subj.subjectId}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5"
              >
                {/* Subject Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 font-mono font-bold text-xs border border-sky-200">
                      {subj.subjectCode}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{subj.subjectName}</h3>
                      <p className="text-xs text-slate-500">
                        Assigned across <strong className="text-slate-700">{subj.classes.length} class cohort(s)</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Syllabus
                    </span>
                  </div>
                </div>

                {/* Class Cohorts Table / Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cohorts Taking this Subject & Performance Analytics
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subj.classes.map((cls) => {
                      const attendance = cls.averageAttendance;
                      const passRate = cls.passPercentage;
                      const ciaScore = cls.ciaAverageScore;
                      const sessions = cls.totalSessions ?? 0;
                      const syllabus = cls.syllabusProgressPercentage ?? 0;

                      return (
                        <div
                          key={cls.classId}
                          className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 hover:border-sky-300 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">{cls.className}</h5>
                              <p className="text-xs text-slate-500">
                                {[cls.semester ? `Sem ${cls.semester}` : null, cls.batch ? `Batch ${cls.batch}` : null].filter(Boolean).join(' • ') || 'Active Cohort'}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                              {cls.enrolledStudents} Students
                            </span>
                          </div>

                          {/* Performance Metrics Grid */}
                          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                            <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                                Attendance
                              </span>
                              <span
                                className={`text-xs font-bold mt-0.5 block ${
                                  attendance == null
                                    ? 'text-slate-400 font-normal'
                                    : attendance >= 75
                                    ? 'text-emerald-700'
                                    : attendance >= 65
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {attendance != null ? `${attendance}%` : 'No logs'}
                              </span>
                            </div>

                            <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                                Pass Rate
                              </span>
                              <span className="text-xs font-bold text-purple-700 mt-0.5 block">
                                {passRate != null ? `${passRate}%` : '—'}
                              </span>
                            </div>

                            <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                                Avg CIA Score
                              </span>
                              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                                {ciaScore != null ? `${ciaScore}/50` : '—'}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar for syllabus */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Syllabus Covered</span>
                              <span className="font-semibold text-slate-800">{syllabus}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-sky-500 h-1.5 rounded-full"
                                style={{ width: `${syllabus}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Actions Footer */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500">
                              <strong className="text-slate-700">{sessions}</strong> sessions logged
                            </span>

                            <Link
                              to={`/faculty/attendance?classId=${cls.classId}`}
                              className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-800"
                            >
                              <span>Mark Attendance</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Department Course Catalog */}
      {activeTab === 'catalog' && (
        <SubjectTable
          subjects={subjects}
          loading={loading.subjects}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
        />
      )}
    </div>
  );
};

// Mini BarChart Icon
const BarChartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default FacultySubjectsPage;
