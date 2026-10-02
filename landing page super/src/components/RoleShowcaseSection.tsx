import React, { useState } from 'react';
import { RoleType } from '../types';

interface RoleShowcaseSectionProps {
  onOpenWorkspace: (role: RoleType) => void;
}

export const RoleShowcaseSection: React.FC<RoleShowcaseSectionProps> = ({ onOpenWorkspace }) => {
  const [activeTab, setActiveTab] = useState<RoleType>('hod');

  const roleMeta = {
    hod: {
      title: 'HOD Operational Scope',
      desc: 'Engineered exclusively for academic departmental chairs. Delivers comprehensive insight into teaching distribution, policy enforcement, and administrative synchronization without manual overhead.'
    },
    faculty: {
      title: 'Faculty Instructional Scope',
      desc: 'Streamlines curriculum progression, syllabus module dissemination, and assessment pipelines. Direct feedback loops allow instructors to concentrate on pedagogical excellence.'
    },
    student: {
      title: 'Student Learning Scope',
      desc: 'Unified view incorporating structured daily timetables, assignment gateways, and repository resources into a singular frictionless experience.'
    }
  };

  return (
    <section id="architecture-section" className="w-full py-20 sm:py-28 bg-[#eff4ff]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] mb-2">
            Functional Verification
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-3">
            Role-Specific Architectural Experience
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#434655]">
            Structured UI environments purpose-built for each academic operational scope.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-xl bg-[#e5eeff] border border-[#d3e4fe] shadow-xs" role="tablist">
            <button
              onClick={() => setActiveTab('hod')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'hod'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              HOD Workspace
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'faculty'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              Faculty Workspace
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              Student Workspace
            </button>
          </div>
        </div>

        {/* Showcase Container (Split 8/4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tab Content: UI Canvas (Col 8) */}
          <div className="lg:col-span-8 rounded-2xl bg-white p-6 sm:p-8 shadow-md border border-[#c3c6d7]/50 min-h-[440px]">
            {/* HOD View Wireframe */}
            {activeTab === 'hod' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                  <div className="flex items-center gap-2 text-xs text-[#565e74]">
                    <span>College Admin</span>
                    <span>/</span>
                    <span>Department Architecture</span>
                    <span>/</span>
                    <span className="text-[#0b1c30] font-semibold">Governance Console</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#e5eeff] text-[#004ac6] text-[11px] font-semibold tracking-wider">
                    ROLE: HOD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Governance Node
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Department Registry
                    </span>
                    <span className="text-xs text-[#434655]">Central Directory</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Policy Dispatch
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Curriculum Matrix
                    </span>
                    <span className="text-xs text-[#434655]">Syllabus Synchronization</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Resource Health
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Faculty Allocation
                    </span>
                    <span className="text-xs text-[#434655]">Course Distribution</span>
                  </div>
                </div>

                {/* Departmental Tree Wireframe */}
                <div className="p-5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-3">
                  <span className="text-sm font-semibold text-[#0b1c30]">
                    Departmental Structural Units
                  </span>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">domain</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Department Council Oversight</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Active Topology</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">rule_folder</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Accreditation Audit Logs</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Verified Immutable</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">assignment_turned_in</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Curriculum Approval Pipeline</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Synchronized</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenWorkspace('hod')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-all"
                  >
                    <span>Launch Full HOD Governance Console</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            )}

            {/* Faculty View Wireframe */}
            {activeTab === 'faculty' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                  <div className="flex items-center gap-2 text-xs text-[#565e74]">
                    <span>Faculty Hub</span>
                    <span>/</span>
                    <span>Active Semester</span>
                    <span>/</span>
                    <span className="text-[#0b1c30] font-semibold">Teaching Workspace</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#e5eeff] text-[#004ac6] text-[11px] font-semibold tracking-wider">
                    ROLE: FACULTY
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Pedagogy Suite
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Course Architecture
                    </span>
                    <span className="text-xs text-[#434655]">Module Orchestration</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Evaluation Engine
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Submission Stream
                    </span>
                    <span className="text-xs text-[#434655]">Deterministic Rubrics</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Direct Channel
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Office Hours
                    </span>
                    <span className="text-xs text-[#434655]">Student Consultation</span>
                  </div>
                </div>

                {/* Teaching Workspace Pipeline Wireframe */}
                <div className="p-5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-3">
                  <span className="text-sm font-semibold text-[#0b1c30]">
                    Course Workflow Pipeline
                  </span>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">menu_book</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Lecture Notes &amp; Syllabus Modules</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Version-Controlled</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">checklist</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Structured Assignment Gateways</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Automated Ingestion</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">forum</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Asynchronous Academic Forums</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Connected</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenWorkspace('faculty')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-all"
                  >
                    <span>Launch Full Faculty Workspace</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            )}

            {/* Student View Wireframe */}
            {activeTab === 'student' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                  <div className="flex items-center gap-2 text-xs text-[#565e74]">
                    <span>Portal</span>
                    <span>/</span>
                    <span>Academic Roadmap</span>
                    <span>/</span>
                    <span className="text-[#0b1c30] font-semibold">Unified Student View</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#e5eeff] text-[#004ac6] text-[11px] font-semibold tracking-wider">
                    ROLE: STUDENT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Chronological
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Course Schedule
                    </span>
                    <span className="text-xs text-[#434655]">Daily Session Nodes</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Deliverables
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Assignment Hub
                    </span>
                    <span className="text-xs text-[#434655]">Encrypted Submissions</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Content Store
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                      Course Materials
                    </span>
                    <span className="text-xs text-[#434655]">Faculty Published</span>
                  </div>
                </div>

                {/* Student Unified Stream Wireframe */}
                <div className="p-5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/70 flex flex-col gap-3">
                  <span className="text-sm font-semibold text-[#0b1c30]">
                    Academic Activity Stream
                  </span>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">event_note</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Institutional Academic Calendar</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Standard Sync</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">folder_shared</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Digital Course Repository</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Verified Access</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white flex items-center justify-between shadow-xs border border-[#c3c6d7]/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#565e74] text-lg">notification_important</span>
                        <span className="text-sm font-medium text-[#0b1c30]">Departmental Notices</span>
                      </div>
                      <span className="text-xs font-semibold text-[#004ac6]">Direct Route</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenWorkspace('student')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-all"
                  >
                    <span>Launch Full Student Hub</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explanatory Architecture Callouts (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-6 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
                Architectural Intent
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30] mt-1 mb-2">
                {roleMeta[activeTab].title}
              </h3>
              <p className="text-sm text-[#434655] leading-relaxed">
                {roleMeta[activeTab].desc}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Governance Guarantee
              </span>
              <div className="space-y-3 mt-4 text-xs text-[#434655]">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-base shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>Role-based permission barriers isolate administrative actions from casual edits.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-base shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>Universal logging on all instructional modifications and syllabus revisions.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-base shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>Deterministic data views ensuring zero variance between reports.</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#e5eeff] border border-[#d3e4fe] flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#0b1c30]">Live Role Exploration</span>
              <p className="text-xs text-[#565e74]">
                You can switch between live working role screens anytime to test approvals, course editing, and student submissions.
              </p>
              <button
                onClick={() => onOpenWorkspace(activeTab)}
                className="mt-2 w-full py-2 px-3 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-colors"
              >
                Enter {activeTab.toUpperCase()} Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
