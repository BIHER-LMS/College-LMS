import React, { useEffect, useState } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { StudentTable } from '../components/StudentTable';
import { StudentUploadModal } from '../components/StudentUploadModal';
import { AddStudentModal } from '../components/AddStudentModal';
import { DeleteStudentModal } from '../components/DeleteStudentModal';
import { AssignClassRepModal } from '../components/AssignClassRepModal';
import {
  GraduationCap,
  Users,
  Crown,
  Upload,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { facultyApi } from '../api/facultyApi';
import type { FacultyClassSummary, ClassStudentSummary } from '../types/faculty.types';
import { ClassTimetableManager } from '../components/ClassTimetableManager';

export const FacultyClassesPage: React.FC = () => {
  const { classes, dashboard, loading, loadClasses, loadDashboard } = useFaculty();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active selected class (default to first assigned class)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'timetable'>('overview');

  // Specific class data & students
  const [currentClass, setCurrentClass] = useState<FacultyClassSummary | null>(null);
  const [students, setStudents] = useState<ClassStudentSummary[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Modals state
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignRepModalOpen, setIsAssignRepModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<ClassStudentSummary | null>(null);

  const academicTermName = dashboard?.academicYear?.name || 'Academic Term 2026';

  useEffect(() => {
    loadClasses();
    loadDashboard();
  }, []);

  // Sync tab with URL param if present
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students' || tabParam === 'overview' || tabParam === 'timetable') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Set default selected class once classes load
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Load detailed class info and students whenever selectedClassId changes
  const refreshClassData = async () => {
    if (!selectedClassId) return;
    setLoadingDetails(true);
    try {
      const [classDetails, studentList] = await Promise.all([
        facultyApi.getClassDetails(selectedClassId),
        facultyApi.getClassStudents(selectedClassId),
      ]);
      setCurrentClass(classDetails);
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to load class details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      refreshClassData();
    }
  }, [selectedClassId]);

  // Direct assign or unassign CR
  const handleDirectAssignRep = async (studentUid: string) => {
    if (!selectedClassId) return;
    try {
      await facultyApi.assignClassRepresentative(selectedClassId, studentUid);
      await refreshClassData();
      await loadClasses();
    } catch (err: any) {
      console.error('Failed to assign CR:', err);
      alert(err.response?.data?.error || 'Failed to update Class Representative');
    }
  };

  const handleTabChange = (tab: 'overview' | 'students') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
  };

  if (loading.classes) {
    return (
      <div className="space-y-4">
        <div className="h-28 bg-slate-800/60 rounded-xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  // If faculty is not assigned as class incharge for any class
  if (classes.length === 0) {
    return (
      <div className="space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
              <GraduationCap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">My Class</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Class Incharge portal for cohort management, student roster, and timetables.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Subject Faculty Mode
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-xs mt-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Serving as Subject Teacher</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
              You are currently registered as a <strong className="text-slate-800 font-semibold">Subject Faculty</strong>.
              The <strong className="text-slate-800">My Class</strong> command center is exclusively available to faculties assigned as <strong>Class Incharges</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/faculty/subjects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Subjects & Performance</span>
            </Link>
            <Link
              to="/faculty/attendance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Mark Session Attendance</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeClass = currentClass || classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/20 shadow-xs shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  My Class
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Class Incharge
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20">
                  {activeClass.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Class Incharge command center — student directory, weekly period timetable, and cohort performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Student</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload (Excel/CSV)</span>
            </button>
            <Link
              to={`/faculty/attendance?classId=${activeClass.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </Link>
          </div>
        </div>

        {/* If multiple classes are assigned, show class switcher */}
        {classes.length > 1 && (
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-medium text-slate-400 mr-1 shrink-0">Switch Cohort:</span>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  cls.id === activeClass.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cls.name} ({cls.studentCount} students)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Class Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('students')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students Directory</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'students' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {students.length}
            </span>
          </button>
        </div>

        {/* Tab Right Hint */}
        <div className="hidden sm:flex items-center text-xs text-slate-400 gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{academicTermName}</span>
        </div>
      </div>

      {/* Tab 1: Class Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Students */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-blue-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Students
                </span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{students.length}</span>
                <span className="text-xs text-emerald-600 font-semibold">Active Roster</span>
              </div>
              <button
                onClick={() => handleTabChange('students')}
                className="mt-3 text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Manage roster</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Overall Attendance */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Attendance
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ClipboardCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {activeClass.overallAttendance != null ? `${activeClass.overallAttendance}%` : '—'}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    activeClass.overallAttendance != null
                      ? activeClass.overallAttendance >= 75
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                >
                  {activeClass.overallAttendance != null
                    ? activeClass.overallAttendance >= 75
                      ? 'Healthy Range'
                      : 'Low Attendance'
                    : 'No Sessions Yet'}
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${activeClass.overallAttendance ?? 0}%` }}
                />
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-purple-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cohort Performance
                </span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {activeClass.overallPerformance?.passRate != null ? `${activeClass.overallPerformance.passRate}%` : '—'}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    activeClass.overallPerformance?.passRate != null ? 'text-purple-600' : 'text-slate-400'
                  }`}
                >
                  {activeClass.overallPerformance?.passRate != null ? 'Pass Benchmark' : 'No Assessment Data'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {activeClass.overallPerformance?.averageScore != null ? (
                  <>
                    Avg CIA Score:{' '}
                    <strong className="text-slate-700">
                      {activeClass.overallPerformance.averageScore}/
                      {activeClass.overallPerformance.averageScore > 50 ? 100 : 50}
                    </strong>
                  </>
                ) : (
                  'No CIA evaluations recorded'
                )}
              </p>
            </div>

            {/* Weekly Timetable Periods */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-amber-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Weekly Timetable
                </span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">8 Periods</span>
                <span className="text-xs text-amber-600 font-semibold">Daily Slots</span>
              </div>
              <Link
                to="/faculty/timetable"
                className="mt-3 text-xs text-amber-700 font-semibold hover:text-amber-800 flex items-center gap-1 group"
              >
                <span>Edit weekly timetable</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Section: Class Details & Class Representative Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Class Info Box */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">{activeClass.name}</h2>
                    <p className="text-xs text-slate-500">
                      {activeClass.program ? activeClass.program.replace(/artifical/gi, 'Artificial') : 'Degree Program'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Cohort
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-1">
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Batch</span>
                  <span className="font-bold text-slate-800 mt-1 block text-sm">
                    {activeClass.batch || '—'}
                  </span>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Current Semester</span>
                  <span className="font-bold text-slate-800 mt-1 block text-sm">
                    {activeClass.currentSemester ? `Semester ${activeClass.currentSemester}` : '—'}
                  </span>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[11px] font-medium">Department</span>
                  <span
                    className="font-bold text-slate-800 mt-1 block text-xs sm:text-sm leading-snug break-words"
                    title={activeClass.department || '—'}
                  >
                    {activeClass.department || '—'}
                  </span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleTabChange('students')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Students Roster ({students.length})</span>
                </button>

                <Link
                  to="/faculty/timetable"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Weekly Timetable</span>
                </Link>

                <Link
                  to={`/faculty/attendance?classId=${activeClass.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Mark Class Attendance</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsAssignRepModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold border border-amber-200 transition"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>{activeClass.classRep ? 'Change Class Rep' : 'Assign Class Rep'}</span>
                </button>
              </div>
            </div>

            {/* Class Representative (CR) Card */}
            <div className="bg-gradient-to-b from-amber-50/50 via-white to-white border border-amber-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-2xs">
                      <Crown className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Class Representative
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    CR Leader
                  </span>
                </div>

                {activeClass.classRep ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center text-base border border-amber-300">
                        {activeClass.classRep.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{activeClass.classRep.name}</span>
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        </h4>
                        <p className="text-xs text-amber-700 font-mono font-medium">
                          {activeClass.classRep.registerNumber || 'Roll No Not Set'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{activeClass.classRep.email}</span>
                      </div>
                      {activeClass.classRep.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{activeClass.classRep.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <Crown className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">No Class Rep Assigned</p>
                    <p className="text-[11px] text-slate-500">
                      Designate a student to coordinate between the cohort and faculty.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsAssignRepModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{activeClass.classRep ? 'Change Class Representative' : 'Assign Class Representative'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Students Directory Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Enrolled Students Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete directory with roll number, DOB, institutional email, phone, attendance and performance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('students')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>View Full Roster ({students.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <StudentTable
              students={students.slice(0, 5)}
              loading={loadingDetails}
              onOpenAddStudentModal={() => setIsAddStudentModalOpen(true)}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenAssignRepModal={() => setIsAssignRepModalOpen(true)}
              onDirectAssignRep={handleDirectAssignRep}
              onDeleteStudent={(student) => setStudentToDelete(student)}
            />

            {students.length > 5 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => handleTabChange('students')}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition border border-slate-200"
                >
                  Show all {students.length} students &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Full Students Directory & Upload */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <StudentTable
            students={students}
            loading={loadingDetails}
            onOpenAddStudentModal={() => setIsAddStudentModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenAssignRepModal={() => setIsAssignRepModalOpen(true)}
            onDirectAssignRep={handleDirectAssignRep}
            onDeleteStudent={(student) => setStudentToDelete(student)}
          />
        </div>
      )}

      {/* Tab 3: Weekly Period-Wise Class Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <ClassTimetableManager
            classId={activeClass.id}
            className={activeClass.name}
          />
        </div>
      )}

      {/* Student Upload Modal (Excel / CSV) */}
      <StudentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        classId={activeClass.id}
        className={activeClass.name}
        onSuccess={async () => {
          await refreshClassData();
          await loadClasses();
        }}
      />

      {/* Add Student Manually Modal */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        classId={activeClass.id}
        className={activeClass.name}
        onSuccess={async () => {
          await refreshClassData();
          await loadClasses();
        }}
      />

      {/* Delete Student Confirmation Modal */}
      <DeleteStudentModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        classId={activeClass.id}
        className={activeClass.name}
        student={studentToDelete}
        onSuccess={async () => {
          await refreshClassData();
          await loadClasses();
        }}
      />

      {/* Assign Class Representative Modal */}
      <AssignClassRepModal
        isOpen={isAssignRepModalOpen}
        onClose={() => setIsAssignRepModalOpen(false)}
        classId={activeClass.id}
        className={activeClass.name}
        currentRep={activeClass.classRep}
        students={students}
        onSuccess={async () => {
          await refreshClassData();
          await loadClasses();
        }}
      />
    </div>
  );
};

export default FacultyClassesPage;
