import React, { useState } from 'react';
import { MOCK_FACULTY, MOCK_PROPOSALS } from '../../data/mockData';
import { CurriculumProposal, FacultyMember } from '../../types';

export const HodWorkspace: React.FC = () => {
  const [proposals, setProposals] = useState<CurriculumProposal[]>(MOCK_PROPOSALS);
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(MOCK_FACULTY);
  const [activeTab, setActiveTab] = useState<'proposals' | 'faculty' | 'audits'>('proposals');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApproveProposal = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p))
    );
    setActionNotice(`Proposal ${id} approved. Emitted universal state sync to Faculty and Student registries.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRequestRevision = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Revision Requested' } : p))
    );
    setActionNotice(`Proposal ${id} marked for revision. Feedback circular routed to instructional faculty.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRebalanceLoad = (facultyId: string) => {
    setFacultyList((prev) =>
      prev.map((f) =>
        f.id === facultyId
          ? { ...f, workload: Math.max(70, f.workload - 10), status: 'optimal' }
          : f
      )
    );
    setActionNotice(`Rebalanced course distribution for faculty ${facultyId}. State saved to Department Registry.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#c3c6d7]/40 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <span>Executive Governance</span>
            <span>/</span>
            <span>School of Engineering</span>
            <span>/</span>
            <span className="text-[#004ac6] font-semibold">Computer Science Department</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0b1c30]">
            HOD Governance Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eff4ff] border border-[#d3e4fe] text-xs font-medium text-[#004ac6]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Academic Registry Synced (v4.2)</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-[#c3c6d7] text-[#0b1c30]">
            Term: Fall 2026
          </span>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#565e74] uppercase tracking-wider">Faculty Headcount</span>
            <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-base">group</span>
            </span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0b1c30]">24 Active</div>
          <span className="text-xs text-emerald-600 font-medium">96% optimal load balance</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#565e74] uppercase tracking-wider">Curriculum Reviews</span>
            <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-base">schema</span>
            </span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0b1c30]">
            {proposals.filter((p) => p.status === 'Under Review').length} Pending
          </div>
          <span className="text-xs text-[#004ac6] font-medium">Next Council Meeting: Oct 08</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#565e74] uppercase tracking-wider">Audit Immutable Hash</span>
            <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-base">verified</span>
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-[#0b1c30] truncate">0x99a2...3f00</div>
          <span className="text-xs text-emerald-600 font-medium">ABET &amp; ISO 27001 Compliant</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#565e74] uppercase tracking-wider">Teaching Hours</span>
            <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-base">schedule</span>
            </span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0b1c30]">4,820 / 5,000</div>
          <span className="text-xs text-[#565e74]">96.4% target met</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#c3c6d7]/40 pb-2">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'proposals'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Curriculum Routing ({proposals.length})
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'faculty'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Faculty Workload Matrix
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'audits'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Accreditation Audit Ledger
        </button>
      </div>

      {/* Tab: Proposals */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
              Curriculum Amendments &amp; Syllabus Submissions
            </h3>
            <span className="text-xs text-[#565e74]">Changes automatically cascade into student course guides</span>
          </div>

          <div className="space-y-3">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#004ac6]">
                      {prop.courseCode}
                    </span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30]">
                      {prop.courseName}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        prop.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : prop.status === 'Revision Requested'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-[#eff4ff] text-[#004ac6]'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#434655]">{prop.changes}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#565e74] pt-1">
                    <span>Submitted by: <strong className="text-[#0b1c30]">{prop.submittedBy}</strong></span>
                    <span>·</span>
                    <span>Date: {prop.date}</span>
                    <span>·</span>
                    <span className="font-mono">Hash: {prop.auditHash}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {prop.status !== 'Approved' && (
                    <button
                      onClick={() => handleApproveProposal(prop.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Approve</span>
                    </button>
                  )}
                  {prop.status !== 'Revision Requested' && (
                    <button
                      onClick={() => handleRequestRevision(prop.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-[#c3c6d7] text-[#434655] hover:text-[#0b1c30] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Request Revision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Faculty */}
      {activeTab === 'faculty' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
              Department Faculty Workload Distribution
            </h3>
            <span className="text-xs text-[#565e74]">Maximum allowable institutional cap: 100%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyList.map((fac) => (
              <div
                key={fac.id}
                className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30]">
                        {fac.name}
                      </h4>
                      <span className="text-xs text-[#565e74]">{fac.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        fac.workload >= 90
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {fac.workload >= 90 ? 'High Load' : 'Optimal Load'}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#565e74]">Load Utilization</span>
                      <span className="font-bold text-[#0b1c30]">{fac.workload}%</span>
                    </div>
                    <div className="w-full bg-[#eff4ff] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          fac.workload >= 90 ? 'bg-amber-500' : 'bg-[#004ac6]'
                        }`}
                        style={{ width: `${fac.workload}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-[#434655]">
                    <span className="font-semibold text-[#565e74]">Assigned Courses:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {fac.courses.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#eff4ff] text-[11px] font-medium text-[#004ac6]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#eff4ff] flex items-center justify-between">
                  <span className="text-[11px] text-[#565e74]">Office Hours: 4 hrs/wk</span>
                  {fac.workload > 85 && (
                    <button
                      onClick={() => handleRebalanceLoad(fac.id)}
                      className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#004ac6] text-xs font-semibold hover:bg-[#dce9ff] transition-colors cursor-pointer"
                    >
                      Rebalance Section
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Audits */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30] mb-2">
              Cryptographic Accreditation Log Ledger
            </h3>
            <p className="text-xs text-[#434655] mb-4">
              All faculty appointments, syllabus publications, and grade modifications are committed as immutable append-only records with SHA-256 signatures.
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#004ac6]">[BLOCK #18204]</span>
                  <span className="text-[#0b1c30] ml-2">Curriculum Amendment CS-482 committed by Chair</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">VERIFIED 0x8f3c...b29a</span>
              </div>
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#004ac6]">[BLOCK #18203]</span>
                  <span className="text-[#0b1c30] ml-2">Faculty Workload Matrix Q4 verified by Governance Council</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">VERIFIED 0x4d11...71ce</span>
              </div>
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#004ac6]">[BLOCK #18202]</span>
                  <span className="text-[#0b1c30] ml-2">Post-Quantum Cryptography addition into SEC-210</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">VERIFIED 0x99a2...3f00</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
