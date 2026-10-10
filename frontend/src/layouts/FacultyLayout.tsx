import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Menu,
  X,
  Clock,
  Home,
  LogOut,
  ShieldCheck,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { useFaculty } from '../modules/faculty/hooks/useFaculty';
import { FacultySearchBar } from '../modules/faculty/components/FacultySearchBar';
import { FacultyChatDrawer } from '../modules/faculty/components/FacultyChat/FacultyChatDrawer';
import { auth } from '../config/firebase';

export const FacultyLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const location = useLocation();
  const { dashboard, classes, loadDashboard, loadClasses } = useFaculty();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    loadClasses();
  }, []);

  const faculty = dashboard?.faculty;
  const isClassIncharge = Boolean(
    dashboard?.classIncharge?.isAssigned ||
    (classes && classes.length > 0) ||
    location.pathname.startsWith('/faculty/classes')
  );

  const navItems = [
    { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
    { label: 'Daily Reminders', path: '/faculty/reminders', icon: Clock },
    // "My Class" is ONLY shown to faculties assigned to a class
    ...(isClassIncharge ? [{ label: 'My Class', path: '/faculty/classes', icon: GraduationCap }] : []),
    // "My Subjects" is shown to all faculty (and as sole subject view for subject teachers)
    { label: 'My Subjects', path: '/faculty/subjects', icon: BookOpen },
    { label: 'Assignments', path: '/faculty/assignments', icon: Edit3 },
    { label: 'Attendance', path: '/faculty/attendance', icon: ClipboardCheck },
    ...(isClassIncharge ? [{ label: 'Time Table', path: '/faculty/timetable', icon: Calendar }] : []),
    { label: 'AI Assistant', path: '/faculty/chat', icon: Sparkles },
    { label: 'My Profile', path: '/faculty/profile', icon: User },
    { label: 'Department Overview', path: '/faculty/department', icon: Building2 },
    { label: 'Academic Calendar', path: '/faculty/academic', icon: Calendar },
  ];
  const initials = faculty?.name
    ? faculty.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FA';

  const academicSessionName =
    dashboard?.academicYear?.name || 'Academic Term 2026';

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('lms_user');
      localStorage.removeItem('user');
      localStorage.removeItem('faculty_auth_token');
      localStorage.removeItem('faculty_dev_uid');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-[#0a1122] border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-white text-[#0a1122] font-black text-xs flex items-center justify-center tracking-wider">
            AA
          </div>
          <div>
            <span className="font-bold text-xs tracking-tight text-white block">Aura Academia</span>
            <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-medium">Faculty Portal</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar - Fixed and Responsive (Never scrolls away) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0B132B] border-r border-slate-800/60 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:top-0 md:h-screen md:w-60 shrink-0 select-none`}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          <div>
            {/* Top Logo / Title */}
            <div className="p-4 pb-3.5 border-b border-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-white text-[#0B132B] font-extrabold text-xs flex items-center justify-center tracking-widest shadow-sm">
                  AA
                </div>
                <div>
                  <h1 className="font-bold text-sm tracking-tight text-white leading-none">
                    Aura Academia
                  </h1>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 block">
                    FACULTY PORTAL
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-2 space-y-0.5 mt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/faculty'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#15203D] text-white border-l-4 border-blue-500 font-semibold pl-2.5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#111B38]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Authenticated Faculty Profile Card & Actions */}
          <div className="p-3.5 border-t border-slate-800/80 bg-[#080E21]">
            <div className="flex items-center space-x-2.5">
              {faculty?.profilePhoto ? (
                <img
                  src={faculty.profilePhoto}
                  alt={faculty.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-600 border border-blue-500 text-white font-bold flex items-center justify-center text-xs tracking-wider shrink-0 shadow-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {faculty?.name || 'Faculty Member'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {dashboard?.department?.name ? `Dept. of ${dashboard.department.name}` : 'Faculty Division'}
                </p>
                <p className="text-[9.5px] font-semibold truncate mt-0.5 flex items-center gap-1">
                  {isClassIncharge ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span>Class Incharge</span>
                    </span>
                  ) : (
                    <span className="text-blue-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span>Subject Teacher</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Profile & Home Actions */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10.5px]">
              <button
                type="button"
                onClick={() => navigate('/faculty/profile')}
                className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded bg-[#111A33] hover:bg-blue-900/40 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Edit My Profile"
              >
                <Edit3 className="w-3 h-3 text-blue-400" />
                <span className="truncate">Profile</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded bg-[#111A33] hover:bg-[#192447] text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Go to LMS Homepage"
              >
                <Home className="w-3 h-3" />
                <span className="truncate">Home</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded bg-[#111A33] hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
                <span className="truncate">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-14 px-4 lg:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 gap-3">
          {/* Global Search Bar (Classes, Students, Attendance, Subjects, Academic) */}
          <FacultySearchBar />

          {/* Right Header Status & Authenticated Faculty Badge (No Dev Switcher) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Academic Session Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>SESSION: {academicSessionName.toUpperCase()}</span>
            </div>

            {/* Dynamic Role Badge */}
            <div className="hidden sm:flex items-center">
              {isClassIncharge ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Class Incharge & Subject Teacher</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10.5px] font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subject Teacher</span>
                </span>
              )}
            </div>

            {/* Quick Profile Avatar Shortcut */}
            <button
              onClick={() => navigate('/faculty/profile')}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="View & Edit Profile"
            >
              {faculty?.profilePhoto ? (
                <img
                  src={faculty.profilePhoto}
                  alt={faculty.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 hidden xl:inline truncate max-w-[130px]">
                {faculty?.name || 'Faculty'}
              </span>
            </button>
          </div>
        </header>

        {/* Content Body - Smooth scrolling view */}
        <main className="flex-1 p-4 lg:p-6 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Trigger Button (when not on /faculty/chat) */}
      {!location.pathname.startsWith('/faculty/chat') && (
        <button
          onClick={() => setChatDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30 group"
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-bold tracking-wide">AI Assistant</span>
        </button>
      )}

      {/* Slide-over Global Chat Drawer */}
      <FacultyChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        facultyName={faculty?.name}
      />
    </div>
  );
};

export default FacultyLayout;
