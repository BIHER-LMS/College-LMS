import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';
import { auth } from '../../../config/firebase';

export const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const { profile, academicYears } = useStudent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0];

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    localStorage.removeItem('lms_token');
    localStorage.removeItem('token');
    localStorage.removeItem('lms_user');
    navigate('/login');
  };

  const navLinks = [
    { to: '/student', label: 'Dashboard', icon: 'grid_view' },
    { to: '/student/class', label: 'My Class', icon: 'meeting_room' },
    { to: '/student/batch', label: 'My Batch', icon: 'group' },
    { to: '/student/program', label: 'My Program', icon: 'school' },
    { to: '/student/department', label: 'My Department', icon: 'domain' },
    { to: '/student/attendance', label: 'My Attendance', icon: 'fact_check' },
    { to: '/student/timetable', label: 'Time Table', icon: 'calendar_month' },
    { to: '/student/subjects', label: 'My Subjects', icon: 'auto_stories' },
    { to: '/student/assignments', label: 'Assignments', icon: 'assignment' },
    { to: '/student/class-incharge', label: 'Class Incharge', icon: 'supervisor_account' },
    { to: '/student/academic-calendar', label: 'Academic Calendar', icon: 'calendar_today' },
  ];

  const studentInitials =
    (profile?.firstName?.[0] || '') + (profile?.lastName?.[0] || '') ||
    profile?.displayName?.slice(0, 2)?.toUpperCase() ||
    'ST';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased flex">
      {/* ─── SIDEBAR (DESKTOP) ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#0b1727] border-r border-[#192b45] z-50 flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-16 px-5 border-b border-[#192b45] flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 border border-white/20 rounded flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-inner">
              AA
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white leading-tight">
                Aura Academia
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                STUDENT PORTAL
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col px-3 py-4 gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#162740] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-[#112035]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[1.25rem]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile Widget */}
        <div className="p-3 border-t border-[#192b45]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#112035]/60 border border-[#1e3250]">
            <div
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden flex-1"
            >
              {profile?.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.displayName || 'Profile'}
                  className="w-9 h-9 rounded object-cover border border-[#2d4263]"
                />
              ) : (
                <div className="w-9 h-9 bg-[#1a2c47] border border-[#2d4263] rounded flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {studentInitials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate leading-tight">
                  {profile?.displayName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'Student')}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {profile?.studentId ? `${profile.studentId} · Student` : 'Student'}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#162740] rounded transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#0b1727] text-white flex flex-col justify-between p-4 z-10 border-r border-[#192b45]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#192b45]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/10 border border-white/20 rounded flex items-center justify-center font-bold text-white text-xs">
                    AA
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white leading-tight">Aura Academia</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Student Portal</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-1 mt-4">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/student'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-[#162740] text-white'
                          : 'text-slate-400 hover:text-white hover:bg-[#112035]'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-[1.2rem]">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <NavLink
                  to="/student/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-[#112035] mt-2 border-t border-[#192b45] pt-3"
                >
                  <span className="material-symbols-outlined text-[1.2rem]">person</span>
                  <span>My Profile</span>
                </NavLink>
              </nav>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-md text-sm transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.2rem]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT VIEWPORT ─── */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen w-full">
        {/* Top Header */}
        <header className="sticky top-0 h-16 bg-white border-b border-slate-200 z-40 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">menu</span>
            </button>

            {/* Global Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[1.125rem]">
                search
              </span>
              <input
                className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                placeholder="Search faculty, student ID, course catalog, records..."
                type="text"
                readOnly
              />
            </div>
          </div>

          {/* Right Status Pill & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="tracking-wide uppercase">
                ACADEMIC SESSION: {currentYear?.name || 'FALL TERM 2026'}
              </span>
            </div>

            <button
              onClick={() => navigate('/student/profile')}
              title="My Profile"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">settings</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 w-full bg-[#f8fafc] p-6 lg:p-10 max-w-[1440px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
