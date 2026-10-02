import React, { useState } from 'react';
import { MOCK_ASSIGNMENTS } from '../../data/mockData';
import type { AssignmentItem } from '../../types';

export const FacultyWorkspace: React.FC = () => {
  const [assignments] = useState<AssignmentItem[]>(MOCK_ASSIGNMENTS);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem>(MOCK_ASSIGNMENTS[0]);
  const [selectedStudent, setSelectedStudent] = useState<string>('Alex Vance');
  
  // Rubric scores
  const [score1, setScore1] = useState(38); // max 40
  const [score2, setScore2] = useState(28); // max 30
  const [score3, setScore3] = useState(29); // max 30
  const [gradingSubmitted, setGradingSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'grading' | 'syllabus' | 'officeHours'>('grading');

  const totalScore = score1 + score2 + score3;
  const gradeLetter = totalScore >= 93 ? 'A' : totalScore >= 90 ? 'A-' : totalScore >= 85 ? 'B+' : 'B';

  const handleCommitGrade = () => {
    setGradingSubmitted(true);
    setTimeout(() => setGradingSubmitted(false), 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#c3c6d7]/40 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <span>Faculty Hub</span>
            <span>/</span>
            <span>Active Semester</span>
            <span>/</span>
            <span className="text-[#004ac6] font-semibold">CS-301 Distributed Systems</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0b1c30]">
            Faculty Instructional Workspace
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Logged in as <strong>Dr. Elena Rostova</strong> (Professor of Distributed Systems)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-semibold border border-[#d3e4fe]">
            48 Enrolled Students
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            Syllabus: v3.4 Synced
          </span>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#c3c6d7]/40 pb-2">
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'grading'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Evaluation Engine &amp; Rubrics
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'syllabus'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Course Syllabus Distribution
        </button>
        <button
          onClick={() => setActiveTab('officeHours')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'officeHours'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-[#eff4ff]'
          }`}
        >
          Instructional Office Hours (3 Booked)
        </button>
      </div>

      {/* Tab 1: Evaluation Engine */}
      {activeTab === 'grading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submissions List (Col 4) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74] block mb-2">
                Active Assignment Queue
              </span>
              <select
                aria-label="Select Assignment"
                value={selectedAssignment.id}
                onChange={(e) => {
                  const asg = assignments.find((a) => a.id === e.target.value);
                  if (asg) setSelectedAssignment(asg);
                }}
                className="w-full p-2.5 rounded-lg border border-[#c3c6d7] text-xs font-semibold text-[#0b1c30] bg-[#eff4ff] focus:outline-none focus:border-[#004ac6]"
              >
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.courseCode}: {a.title}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex items-center justify-between text-xs text-[#565e74]">
                <span>Progress: {selectedAssignment.submittedCount}/{selectedAssignment.totalStudents}</span>
                <span className="text-[#004ac6] font-medium">Due: {selectedAssignment.dueDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74] block mb-3">
                Select Student Submission
              </span>
              <div className="space-y-2">
                {['Alex Vance', 'Maya Lin', 'David K.', 'Priya Patel', 'Ethan Hunt'].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedStudent(name);
                      setGradingSubmitted(false);
                    }}
                    className={`w-full p-3 rounded-lg flex items-center justify-between text-xs font-medium border text-left transition-all ${
                      selectedStudent === name
                        ? 'bg-[#eff4ff] border-[#004ac6] text-[#004ac6]'
                        : 'border-[#c3c6d7]/40 hover:bg-[#eff4ff] text-[#0b1c30]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e5eeff] flex items-center justify-center font-bold text-[10px] text-[#004ac6]">
                        {name.charAt(0)}
                      </div>
                      <span>{name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600">Tests 12/12</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Rubric Grading (Col 7) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#eff4ff]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
                  Deterministic Grading Canvas
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                  Evaluating {selectedStudent}
                </h3>
                <span className="text-xs text-[#565e74]">{selectedAssignment.title}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#565e74] uppercase block">Computed Score</span>
                <span className="font-mono text-2xl font-bold text-[#004ac6]">
                  {totalScore}/100 <span className="text-lg">({gradeLetter})</span>
                </span>
              </div>
            </div>

            {/* Rubric Criterion 1 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                <span>1. Leader Election Correctness (Weight 40%)</span>
                <span className="font-mono text-[#004ac6]">{score1} / 40</span>
              </div>
              <input
                aria-label="Leader Election Correctness score"
                type="range"
                min="0"
                max="40"
                value={score1}
                onChange={(e) => setScore1(Number(e.target.value))}
                className="w-full h-1.5 bg-[#d3e4fe] rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
              />
              <span className="text-[11px] text-[#565e74] block">
                Checks split-brain avoidance and term increment logic under network partition.
              </span>
            </div>

            {/* Rubric Criterion 2 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                <span>2. Partition Recovery Performance (Weight 30%)</span>
                <span className="font-mono text-[#004ac6]">{score2} / 30</span>
              </div>
              <input
                aria-label="Partition Recovery Performance score"
                type="range"
                min="0"
                max="30"
                value={score2}
                onChange={(e) => setScore2(Number(e.target.value))}
                className="w-full h-1.5 bg-[#d3e4fe] rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
              />
              <span className="text-[11px] text-[#565e74] block">
                Reconciliation latency within 150ms after node re-join.
              </span>
            </div>

            {/* Rubric Criterion 3 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                <span>3. Unit Test Coverage &amp; Code Hygiene (Weight 30%)</span>
                <span className="font-mono text-[#004ac6]">{score3} / 30</span>
              </div>
              <input
                aria-label="Unit Test Coverage score"
                type="range"
                min="0"
                max="30"
                value={score3}
                onChange={(e) => setScore3(Number(e.target.value))}
                className="w-full h-1.5 bg-[#d3e4fe] rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
              />
              <span className="text-[11px] text-[#565e74] block">
                Coverage exceeds 92% with deterministic assertion logs.
              </span>
            </div>

            {/* Feedback text */}
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Instructional Feedback (Immutable Audit Trail)
              </label>
              <textarea
                rows={2}
                defaultValue="Excellent implementation of Raft log compaction. Recovery times are well within benchmark thresholds."
                className="w-full p-2.5 text-xs rounded-lg border border-[#c3c6d7] text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#565e74]">
                Grade automatically commits to Student Academic Transcript.
              </span>
              <button
                onClick={handleCommitGrade}
                className="px-5 py-2.5 rounded-lg bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Commit Verified Grade</span>
              </button>
            </div>

            {gradingSubmitted && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                <span>
                  Grade of <strong>{totalScore}/100 ({gradeLetter})</strong> committed for {selectedStudent}. Hash 0x6e29...f1a synced to student terminal.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Syllabus Distribution */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-xs space-y-4">
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
              Course Modules &amp; Syllabus Dissemination (CS-301)
            </h3>
            <div className="space-y-3">
              {[
                { num: 'Module 01', title: 'Foundations of Distributed Systems & Time Ordering', status: 'Published', date: 'Week 1-2' },
                { num: 'Module 02', title: 'Consensus Protocols: Paxos and Raft Mechanics', status: 'Published', date: 'Week 3-4' },
                { num: 'Module 03', title: 'Fault Tolerance & Distributed Key-Value Storage', status: 'Active (Current)', date: 'Week 5-7' },
                { num: 'Module 04', title: 'Scalable Sharding & Dynamo-style Topologies', status: 'Scheduled', date: 'Week 8-10' }
              ].map((mod, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#004ac6] bg-white px-2 py-1 rounded border border-[#d3e4fe]">
                      {mod.num}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0b1c30]">{mod.title}</h4>
                      <span className="text-xs text-[#565e74]">{mod.date}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-white text-[#004ac6] font-semibold border border-[#d3e4fe]">
                    {mod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Office Hours */}
      {activeTab === 'officeHours' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#c3c6d7]/50 shadow-xs">
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30] mb-3">
              Today's Consultation Office Hours Queue
            </h3>
            <div className="space-y-3">
              {[
                { time: '02:00 PM - 02:20 PM', student: 'Alex Vance', topic: 'Raft partition edge case question' },
                { time: '02:25 PM - 02:45 PM', student: 'Maya Lin', topic: 'Graduate research inquiry on Byzantine consensus' },
                { time: '02:50 PM - 03:10 PM', student: 'David K.', topic: 'Lab 03 rubric review' }
              ].map((slot, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#004ac6] block">{slot.time}</span>
                    <span className="text-sm font-semibold text-[#0b1c30]">{slot.student}</span>
                    <span className="text-xs text-[#565e74] block">{slot.topic}</span>
                  </div>
                  <span className="px-3 py-1 rounded bg-white text-xs font-medium text-[#004ac6] border border-[#d3e4fe]">
                    Confirmed Slot
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
