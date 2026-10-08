import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchHODProfile, fetchHODDashboard } from '../modules/hod/store/slices/hodSlice';
import { HODProfileModal } from '../modules/hod/components/hod/HODProfileModal';
import { NavLink, Outlet } from 'react-router-dom';

export const HodLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, dashboard } = useSelector((state: RootState) => state.hod);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchHODProfile());
    if (!dashboard) {
      dispatch(fetchHODDashboard());
    }
  }, [dispatch, dashboard]);

  const navItems = [
    { id: '', label: 'Dashboard Overview', icon: 'grid_view' },
    { id: 'department', label: 'Department Overview', icon: 'domain' },
    { id: 'faculty', label: 'Faculty Management', icon: 'badge' },
    { id: 'programs', label: 'Academic Programs', icon: 'school' },
    { id: 'batches', label: 'Department Batches', icon: 'group_work' },
    { id: 'classes', label: 'Classes & Incharge', icon: 'class' },
    { id: 'students', label: 'Students Directory', icon: 'person_search' },
    { id: 'subjects', label: 'Subjects & Syllabi', icon: 'menu_book' },
    { id: 'calendar', label: 'Academic Calendar', icon: 'calendar_month' },
    { id: 'attendance', label: 'Attendance Surveillance', icon: 'fact_check' },
    { id: 'analytics', label: 'Performance & Analytics', icon: 'analytics' },
    { id: 'reports', label: 'Reports & Governance', icon: 'query_stats' },
    { id: 'audit', label: 'Audit Dossiers', icon: 'file_save' },
  ];

  const lmsUser = (() => {
    try {
      const raw = localStorage.getItem('lms_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const hodName = profile?.name || dashboard?.department?.hod?.name || dashboard?.department?.hodName || lmsUser?.name || 'HOD User';
  const departmentName = profile?.departmentName || dashboard?.department?.name || lmsUser?.department_name || '';
  const designation = profile?.designation || 'Head of Department';
  const initials = hodName
    .split(' ')
    .filter((n: string) => !n.includes('.'))
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AV';

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-body text-[#0b1c30] antialiased">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col justify-between border-r border-[#c5c6cd]/20 bg-[#0d1c32] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-[#c5c6cd]/15 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-white text-xs font-bold text-[#0d1c32]">
                LMS
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-lg font-bold leading-tight">College LMS</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b6c6ed]">
                  HOD Module Portal
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              className="p-1 text-[#b9c7e4] hover:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/hod${item.id ? `/${item.id}` : ''}`}
                  end={item.id === ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 px-4 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-l-2 border-[#d6e3ff] bg-[#213145] text-white'
                        : 'text-[#b9c7e4] hover:bg-[#213145] hover:text-white'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* User Profile Footer (Clickable to Edit Profile) */}
        <div className="border-t border-[#c5c6cd]/20 bg-[#213145]/30 p-4 transition-colors">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80"
            onClick={() => setIsProfileModalOpen(true)}
            title="Click to view and edit HOD Profile"
          >
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover border border-[#b6c6ed]/40"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center border border-[#b6c6ed]/40 bg-[#0d1c32] text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-white">{hodName}</span>
              <span className="truncate text-[11px] text-[#b9c7e4]">{departmentName}</span>
              <span className="text-[10px] tracking-wide text-[#d8e2ff] flex items-center justify-between">
                <span>{designation}</span>
                <span className="material-symbols-outlined text-[14px] text-[#b9c7e4]">edit</span>
              </span>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              try {
                const { signOut } = await import('firebase/auth');
                const { auth } = await import('../config/firebase');
                await signOut(auth);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lms_user');
                window.location.href = '/login';
              } catch (error) {
                console.error('Logout error', error);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Viewport Workspace */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top Header */}
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#c5c6cd]/30 bg-white px-4 lg:left-72 lg:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile Hamburger Toggle Button */}
            <button
              className="p-1.5 text-[#0b1c30] hover:bg-[#eff4ff] lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                search
              </span>
              <input
                type="text"
                placeholder="Search department records..."
                className="w-full border border-[#c5c6cd]/40 bg-[#f8f9ff] py-1.5 pl-9 pr-3 text-xs text-[#0b1c30] outline-none focus:border-[#0b1c30]"
              />
            </div>
          </div>

          {/* Academic Session Pill & Department Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border border-[#c5c6cd]/30 bg-[#eff4ff] px-3 py-1 text-xs text-[#0b1c30]">
              <span className="h-2 w-2 rounded-full bg-[#069669] animate-pulse"></span>
              <span className="font-semibold uppercase text-[10px] sm:text-[11px] text-[#44474d]">
                {dashboard?.academicYear?.name
                  ? `${dashboard.academicYear.name}${dashboard.semester?.termNumber ? ` · Term ${dashboard.semester.termNumber}` : ''}`
                  : 'Academic Year 2026 - 2027'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 bg-[#f8f9ff] p-4 sm:p-6 pt-20 lg:pt-20">
          <Outlet />
        </main>
      </div>

      {/* Editable HOD Profile Modal */}
      {isProfileModalOpen && (
        <HODProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
};
