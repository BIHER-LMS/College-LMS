import React from 'react';
import { RoleType } from '../types';

interface ThreeExperiencesSectionProps {
  onSelectRole: (role: RoleType) => void;
}

export const ThreeExperiencesSection: React.FC<ThreeExperiencesSectionProps> = ({ onSelectRole }) => {
  return (
    <section id="modules-section" className="w-full py-20 sm:py-28 bg-[#eff4ff] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] mb-2">
            Specialized Modularity
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-3">
            One Platform. Three Experiences.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#434655]">
            A single unified core serving three specialized roles without data silos.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* CARD 1: HOD MODULE */}
          <div className="rounded-xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#c3c6d7]/50 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-3 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] text-xs font-semibold border border-[#d3e4fe]">
                  Institutional Governance
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">account_tree</span>
                </div>
              </div>

              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] mb-2">
                HOD Module
              </h3>
              <p className="text-sm text-[#434655] mb-6">
                Academic administration and institutional oversight.
              </p>

              {/* Structural Diagram Visual */}
              <div className="p-4 rounded-lg bg-[#eff4ff] mb-6 flex flex-col gap-2.5 border border-[#dce9ff]/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6]" />
                  <span className="text-xs font-semibold text-[#565e74]">
                    Departmental Structure
                  </span>
                </div>
                <div className="w-full pl-2 flex flex-col gap-2">
                  <button
                    onClick={() => onSelectRole('hod')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Curriculum Routing</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('hod')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Faculty Workload Matrix</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">check_circle</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('hod')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Academic Policy Flow</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">rule</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 pt-4 mb-4 border-t border-[#eff4ff]">
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Department Overview
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Curriculum Coordination
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Faculty Alignment
                </span>
              </div>
              <button
                onClick={() => onSelectRole('hod')}
                className="w-full py-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch HOD Workspace</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>

          {/* CARD 2: FACULTY MODULE */}
          <div className="rounded-xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#c3c6d7]/50 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-3 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] text-xs font-semibold border border-[#d3e4fe]">
                  Instructional Workspace
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">edit_calendar</span>
                </div>
              </div>

              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] mb-2">
                Faculty Module
              </h3>
              <p className="text-sm text-[#434655] mb-6">
                Tools for managing teaching, academic workflows, and student interaction.
              </p>

              {/* Structural Diagram Visual */}
              <div className="p-4 rounded-lg bg-[#eff4ff] mb-6 flex flex-col gap-2.5 border border-[#dce9ff]/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6]" />
                  <span className="text-xs font-semibold text-[#565e74]">
                    Delivery Pipeline
                  </span>
                </div>
                <div className="w-full pl-2 flex flex-col gap-2">
                  <button
                    onClick={() => onSelectRole('faculty')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Course Syllabus Distribution</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">published_with_changes</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('faculty')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Submission Evaluation</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">grading</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('faculty')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Instructional Office Hours</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">schedule</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 pt-4 mb-4 border-t border-[#eff4ff]">
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Teaching Workspace
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Workflow Automation
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Student Interaction
                </span>
              </div>
              <button
                onClick={() => onSelectRole('faculty')}
                className="w-full py-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Faculty Workspace</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>

          {/* CARD 3: STUDENT MODULE */}
          <div className="rounded-xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#c3c6d7]/50 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-3 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] text-xs font-semibold border border-[#d3e4fe]">
                  Learning Hub
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
              </div>

              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] mb-2">
                Student Module
              </h3>
              <p className="text-sm text-[#434655] mb-6">
                A centralized experience for learning, academic information, and student activities.
              </p>

              {/* Structural Diagram Visual */}
              <div className="p-4 rounded-lg bg-[#eff4ff] mb-6 flex flex-col gap-2.5 border border-[#dce9ff]/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6]" />
                  <span className="text-xs font-semibold text-[#565e74]">
                    Academic Stream
                  </span>
                </div>
                <div className="w-full pl-2 flex flex-col gap-2">
                  <button
                    onClick={() => onSelectRole('student')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Unified Course Timeline</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">view_timeline</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('student')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Resource Repository Access</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">folder_open</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('student')}
                    className="p-2.5 rounded bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30 text-left hover:border-[#004ac6] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0b1c30]">Verification Protocols</span>
                    <span className="material-symbols-outlined text-xs text-[#004ac6]">verified</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 pt-4 mb-4 border-t border-[#eff4ff]">
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Centralized Experience
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Academic Information
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#5c647a] text-xs font-medium">
                  Student Activities
                </span>
              </div>
              <button
                onClick={() => onSelectRole('student')}
                className="w-full py-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Student Hub</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
