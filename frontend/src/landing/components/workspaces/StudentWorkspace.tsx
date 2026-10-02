import React, { useState } from 'react';
import { MOCK_STUDENT_COURSES } from '../../data/mockData';
import type { StudentCourse } from '../../types';

export const StudentWorkspace: React.FC = () => {
  const [courses] = useState<StudentCourse[]>(MOCK_STUDENT_COURSES);
  const [submissionFile] = useState<string>('lab3_raft_implementation.zip');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [receiptHash, setReceiptHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'materials'>('courses');

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    setTimeout(() => {
      setSubmissionStatus('submitted');
      setReceiptHash(`sha256:0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`);
    }, 700);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#c3c6d7]/40 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <span>Student Portal</span>
            <span>/</span>
            <span>Academic Roadmap</span>
            <span>/</span>
            <span className="text-[#004ac6] font-semibold">Undergraduate Terminal</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0b1c30]">
            Unified Learning Hub
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Student: <strong>Alex Vance</strong> · ID: CS-2024-884 · GPA: 3.91
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-semibold border border-[#d3e4fe]">
            11 Credits Active
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            All Requirements Met
          </span>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#c3c6d7]/40 pb-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'courses'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Enrolled Courses &amp; Timetable
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'assignments'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Assignment Submission Hub
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'materials'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Digital Course Repository
        </button>
      </div>

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-8">
          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#004ac6]">
                      {course.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {course.grade}
                    </span>
                  </div>

                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30] mb-1">
                    {course.name}
                  </h3>
                  <p className="text-xs text-[#565e74] mb-4">Instructor: {course.instructor}</p>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#565e74]">Semester Progress</span>
                      <span className="font-bold text-[#0b1c30]">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-[#eff4ff] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#004ac6] h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#eff4ff] space-y-1.5 text-xs text-[#434655]">
                  <div className="flex items-center justify-between">
                    <span>Schedule:</span>
                    <strong className="text-[#0b1c30]">{course.schedule}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location:</span>
                    <strong className="text-[#0b1c30]">{course.room}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#004ac6]">
                    <span>Next Due:</span>
                    <span className="font-medium">{course.nextDeadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Schedule Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-xs">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6]">today</span>
              <span>Today's Academic Timeline (Wednesday)</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-[#004ac6] bg-white px-2 py-1 rounded border border-[#d3e4fe]">
                    10:00 - 11:30 AM
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0b1c30]">CS-301 Lecture: Raft Consensus</h4>
                    <span className="text-xs text-[#565e74]">Hall Turing 201 · Dr. Elena Rostova</span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-white text-emerald-700 font-semibold border border-emerald-200">
                  Active Next
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#c3c6d7]/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-[#565e74] bg-[#eff4ff] px-2 py-1 rounded">
                    02:00 - 02:20 PM
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0b1c30]">Office Hours Consultation</h4>
                    <span className="text-xs text-[#565e74]">Faculty Office 408 · 1-on-1 with Prof. Rostova</span>
                  </div>
                </div>
                <span className="text-xs text-[#565e74]">Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Assignments */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-md space-y-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
                Secure Submission Gateway
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] mt-1">
                CS-301 Lab 03: Fault-Tolerant Key-Value Store
              </h3>
              <p className="text-xs text-[#565e74] mt-1">
                Due: Tomorrow, 11:59 PM · Automated Docker test suite runs on ingestion.
              </p>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Deliverable Archive File (ZIP / TAR.GZ)
                </label>
                <div className="p-6 rounded-xl border-2 border-dashed border-[#c3c6d7] hover:border-[#004ac6] bg-[#eff4ff]/50 text-center cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[#004ac6] mb-1">
                    cloud_upload
                  </span>
                  <p className="text-xs font-semibold text-[#0b1c30]">{submissionFile}</p>
                  <p className="text-[11px] text-[#565e74]">Drag and drop files here, or click to replace</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Student Verification Notes
                </label>
                <textarea
                  rows={2}
                  defaultValue="All 12 unit tests passing locally. Raft heartbeat timer calibrated to 150ms."
                  className="w-full p-2.5 text-xs rounded-lg border border-[#c3c6d7] text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <button
                type="submit"
                disabled={submissionStatus === 'submitting'}
                className="w-full h-11 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submissionStatus === 'submitting' ? (
                  <span>Generating SHA-256 Receipt...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Submit Deliverable to Academic Vault</span>
                  </>
                )}
              </button>
            </form>

            {submissionStatus === 'submitted' && receiptHash && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                  <span>Submission Accepted &amp; Verified</span>
                </div>
                <p>Your work has been securely committed into the university course repository.</p>
                <p className="font-mono text-[11px] text-emerald-700">Receipt Hash: {receiptHash}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-xs space-y-4">
            <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30]">
              Evaluation Rubric Matrix
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]">
                <div className="flex justify-between font-semibold text-[#0b1c30]">
                  <span>Leader Election Correctness</span>
                  <span className="text-[#004ac6]">40 pts</span>
                </div>
                <p className="text-[11px] text-[#565e74] mt-0.5">Verified via random network partitions.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]">
                <div className="flex justify-between font-semibold text-[#0b1c30]">
                  <span>Partition Recovery Performance</span>
                  <span className="text-[#004ac6]">30 pts</span>
                </div>
                <p className="text-[11px] text-[#565e74] mt-0.5">Catch-up log RPC within 150ms limit.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]">
                <div className="flex justify-between font-semibold text-[#0b1c30]">
                  <span>Unit Test Coverage</span>
                  <span className="text-[#004ac6]">30 pts</span>
                </div>
                <p className="text-[11px] text-[#565e74] mt-0.5">Greater than 90% deterministic branch tests.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-xs">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30] mb-4">
              Digital Course Repository &amp; Syllabi
            </h3>
            <div className="space-y-3">
              {[
                { title: 'CS-301 Official Syllabus & Grading Criteria (Fall 2026)', size: '240 KB', type: 'PDF' },
                { title: 'Lecture 06 Slide Deck: Paxos Consensus vs Raft Protocol', size: '4.2 MB', type: 'PDF' },
                { title: 'CS-301 Lab 03 Starter Code & Benchmark Harness', size: '1.8 MB', type: 'ZIP' },
                { title: 'University Academic Honor Code & Attribution Policies', size: '120 KB', type: 'PDF' }
              ].map((mat, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#004ac6] font-mono text-xs font-bold border border-[#d3e4fe]">
                      {mat.type}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0b1c30]">{mat.title}</h4>
                      <span className="text-xs text-[#565e74]">{mat.size} · Verified Official</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-white border border-[#c3c6d7] text-xs font-semibold text-[#004ac6] hover:bg-[#dce9ff] transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
