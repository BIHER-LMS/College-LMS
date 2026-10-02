import React, { useState } from 'react';
import { RoleType, ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  currentRole: RoleType;
  onNavigateHome: () => void;
  onOpenWorkspace: (role: RoleType) => void;
  onOpenSignIn: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  currentRole,
  onNavigateHome,
  onOpenWorkspace,
  onOpenSignIn,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/85 backdrop-blur-xl border-b border-[#c3c6d7]/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="h-20 max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-6">
        {/* Brand / Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-4 cursor-pointer select-none group"
        >
          <img
            alt="Aura Academia Identity"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#004ac6]/10 group-hover:ring-[#004ac6]/30 transition-all"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XP98j3PFa4w28zD_8nrN3WoTKj61tWMFKZq-Ki8UwiToNS5yjtsXfhr0d9YCV6-FObTTr25VKWAIIYOrJG3TbaRkgiqbVFdu2BY_US4qZVAujvyHOzBWsOLCowhIpggfwufK6mVK7bV_9nU2LTvFfY_tyr2hhsofQF61PJBiGPD0lqYKOsO5LxF8BoZsADemfoARVG0v1iik9hR8uMeL7KffzMwxsMLDhlkpSInOTnY_Js_FPjHCGcoeU4"
          />
          <div className="flex items-baseline gap-2.5">
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tight text-[#0b1c30]">
              Aura Academia
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#004ac6] text-[11px] font-semibold uppercase tracking-wider border border-[#d3e4fe]">
              Academic LMS
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        {activeView === 'landing' ? (
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => onScrollToSection('overview')}
              className="text-sm font-semibold text-[#004ac6] transition-colors hover:text-[#003ea8]"
            >
              Overview
            </button>
            <button
              onClick={() => onScrollToSection('modules-section')}
              className="text-sm font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Modules
            </button>
            <button
              onClick={() => onScrollToSection('ecosystem-section')}
              className="text-sm font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Ecosystem
            </button>
            <button
              onClick={() => onScrollToSection('capabilities-section')}
              className="text-sm font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Capabilities
            </button>
            <button
              onClick={() => onScrollToSection('architecture-section')}
              className="text-sm font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => onScrollToSection('technology-section')}
              className="text-sm font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Technology
            </button>
          </nav>
        ) : (
          /* Workspace Role Switcher inside active app */
          <div className="hidden md:flex items-center bg-[#eff4ff] p-1 rounded-xl border border-[#d3e4fe]">
            <button
              onClick={() => onOpenWorkspace('hod')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'hod'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              HOD Console
            </button>
            <button
              onClick={() => onOpenWorkspace('faculty')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'faculty'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Faculty Workspace
            </button>
            <button
              onClick={() => onOpenWorkspace('student')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'student'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Student Portal
            </button>
          </div>
        )}

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {activeView === 'landing' ? (
            <>
              <button
                onClick={onOpenSignIn}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenWorkspace('hod')}
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#004ac6] text-white text-sm font-medium shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:bg-[#2563eb] transition-all cursor-pointer"
              >
                Explore LMS
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#ffffff] border border-[#c3c6d7] text-[#0b1c30] text-xs font-semibold hover:bg-[#eff4ff] transition-all"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Overview</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#565e74] hover:bg-[#eff4ff]"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#c3c6d7]/30 bg-white px-6 py-4 space-y-3">
          {activeView === 'landing' ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onScrollToSection('overview');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-medium text-[#004ac6]"
              >
                Overview
              </button>
              <button
                onClick={() => {
                  onScrollToSection('modules-section');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-medium text-[#434655]"
              >
                Modules
              </button>
              <button
                onClick={() => {
                  onScrollToSection('ecosystem-section');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-medium text-[#434655]"
              >
                Ecosystem
              </button>
              <button
                onClick={() => {
                  onScrollToSection('capabilities-section');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-medium text-[#434655]"
              >
                Capabilities
              </button>
              <button
                onClick={() => {
                  onScrollToSection('architecture-section');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-medium text-[#434655]"
              >
                Architecture
              </button>
              <button
                onClick={() => {
                  onScrollToSection('technology-section');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-medium text-[#434655]"
              >
                Technology
              </button>
              <div className="pt-3 border-t border-[#c3c6d7]/40 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onOpenSignIn();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg border border-[#c3c6d7] text-sm font-medium text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenWorkspace('hod');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#004ac6] text-white text-sm font-medium text-center"
                >
                  Explore LMS
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#565e74] uppercase tracking-wider">
                Select Active Workspace
              </span>
              <button
                onClick={() => {
                  onOpenWorkspace('hod');
                  setMobileMenuOpen(false);
                }}
                className={`text-left p-2.5 rounded-lg text-sm font-medium ${
                  currentRole === 'hod' ? 'bg-[#eff4ff] text-[#004ac6]' : 'text-[#434655]'
                }`}
              >
                HOD Governance Console
              </button>
              <button
                onClick={() => {
                  onOpenWorkspace('faculty');
                  setMobileMenuOpen(false);
                }}
                className={`text-left p-2.5 rounded-lg text-sm font-medium ${
                  currentRole === 'faculty' ? 'bg-[#eff4ff] text-[#004ac6]' : 'text-[#434655]'
                }`}
              >
                Faculty Instructional Workspace
              </button>
              <button
                onClick={() => {
                  onOpenWorkspace('student');
                  setMobileMenuOpen(false);
                }}
                className={`text-left p-2.5 rounded-lg text-sm font-medium ${
                  currentRole === 'student' ? 'bg-[#eff4ff] text-[#004ac6]' : 'text-[#434655]'
                }`}
              >
                Student Unified Learning Hub
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
