import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { FacultyStats } from '../components/FacultyStats';
import { ClassInchargeStatus } from '../components/ClassInchargeStatus';
import { AssignedSubjectStatus } from '../components/AssignedSubjectStatus';
import { TodayRemindersSection } from '../components/TodayRemindersSection';
import { FacultyProfileCard } from '../components/FacultyProfileCard';
import {
  GraduationCap,
  Building2,
  BookOpen,
  ArrowRight,
  ClipboardCheck,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardAnnouncements } from '../../../components/Announcements/DashboardAnnouncements';

export const FacultyDashboard: React.FC = () => {
  const { dashboard, profile, loading, loadDashboard, loadProfile } = useFaculty();

  useEffect(() => {
    loadDashboard();
    loadProfile();
  }, []);

  const isClassIncharge = dashboard?.classIncharge?.isAssigned || false;
  const assignedClass = dashboard?.classIncharge?.class;

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Welcome back, {dashboard?.faculty.name || 'Faculty Member'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Department of {dashboard?.department?.name || 'Academic Studies'} • Academic Year{' '}
              {dashboard?.academicYear?.name || '2025-2026'}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-start sm:self-auto">
          {isClassIncharge ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Class Incharge: {assignedClass?.name}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Faculty Member
            </span>
          )}
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <FacultyStats dashboard={dashboard} loading={loading.dashboard} />

      {/* Official Campus & Administrative Announcements */}
      <DashboardAnnouncements role="FACULTY" isClassIncharge={isClassIncharge} />

      {/* Daily Reminders & Action Items Section */}
      <TodayRemindersSection />

      {/* 2-Column Responsive Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Responsibilities */}
        <div className="space-y-4">
          <AssignedSubjectStatus assignedSubject={dashboard?.assignedSubject} assignedSubjects={dashboard?.assignedSubjects} />

          <ClassInchargeStatus classIncharge={dashboard?.classIncharge} />

          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-2.5 uppercase tracking-wider text-slate-500">
              Frequent Modules
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/faculty/attendance"
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">Attendance</p>
                  <p className="text-[10px] text-slate-400 truncate">Mark class sessions</p>
                </div>
              </Link>

              <Link
                to="/faculty/reminders"
                className="p-2.5 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-colors flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">Reminders</p>
                  <p className="text-[10px] text-slate-400 truncate">Today's agenda</p>
                </div>
              </Link>

              <Link
                to="/faculty/classes"
                className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">My Classes</p>
                  <p className="text-[10px] text-slate-400 truncate">Cohorts & rosters</p>
                </div>
              </Link>

              <Link
                to="/faculty/subjects"
                className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">Curricula</p>
                  <p className="text-[10px] text-slate-400 truncate">Syllabus & subjects</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Faculty Profile Summary & Department Info */}
        <div className="space-y-4">
          <FacultyProfileCard profile={profile} loading={loading.profile} />

          {/* Department Quick Card */}
          {dashboard?.department && (
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Dept. of {dashboard.department.name}
                  </h3>
                </div>
                <Link
                  to="/faculty/department"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10.5px]">Department Code</span>
                  <p className="font-semibold text-slate-800">{dashboard.department.code}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px]">Head of Department</span>
                  <p className="font-semibold text-slate-800 truncate">
                    {dashboard.department.hodName || 'Assigned HOD'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
