import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';
import { StudentAcademicSummary } from '../components/StudentAcademicSummary';
import { LoadingSkeleton, ErrorState } from '../components/LoadingSkeleton';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboard, attendance, loading, errors, loadDashboard, loadAttendance } = useStudent();

  useEffect(() => {
    loadDashboard();
    loadAttendance();
  }, [loadDashboard, loadAttendance]);

  if (loading.dashboard && !dashboard) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 bg-slate-200 w-72 rounded animate-pulse" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (errors.dashboard && !dashboard) {
    return (
      <div className="flex flex-col gap-6">
        <ErrorState message={errors.dashboard} onRetry={loadDashboard} />
      </div>
    );
  }

  const student = dashboard?.student;
  const classData = dashboard?.class;
  const batchData = dashboard?.batch;
  const programData = dashboard?.program;
  const deptData = dashboard?.department;
  const classIncharge = dashboard?.classIncharge;
  const academicYear = dashboard?.academicYear;
  const semester = dashboard?.semester;
  const subjects = dashboard?.subjects || [];

  const studentName =
    student?.displayName ||
    `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
    'Student';

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Top Welcome & Action Banner (Matching Screenshot) ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          {/* Pill Tag */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider rounded">
              STUDENT PORTAL
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              CURRENT SESSION
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {studentName}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Departmental overview for {deptData?.name || 'Department'} ({deptData?.code?.toUpperCase() || 'DEPT'}) — {deptData?.collegeName || 'College'}.
          </p>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/subjects')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 shadow-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-slate-500">download</span>
            <span>Curriculum Report</span>
          </button>
          <button
            onClick={() => navigate('/student/class')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b1727] text-white rounded-md text-sm font-medium hover:bg-[#13243c] shadow-xs transition-colors"
            type="button"
          >
            <span>Student Actions</span>
          </button>
        </div>
      </div>

      {/* ─── 6 Metric Cards Row (Matching Screenshot) ─── */}
      <StudentAcademicSummary
        profile={student}
        classData={classData || null}
        batchData={batchData || null}
        programData={programData || null}
        subjects={subjects}
        academicYear={academicYear || null}
      />

      {/* ─── Academic Calendar & Session Section (Matching Screenshot) ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Academic Calendar & Session
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sub-container: Current Academic Year */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              CURRENT ACADEMIC YEAR
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {academicYear?.name || '2026 - 2027'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {academicYear?.startDate || '2026-06-01'} to {academicYear?.endDate || '2027-04-30'}
            </div>
          </div>

          {/* Sub-container: Active Semester */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ACTIVE SEMESTER
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1">
              Term {classData?.currentSemester || 3}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {semester?.startDate || '2026-06-01'} to {semester?.endDate || '2026-11-15'}
            </div>
          </div>

          {/* Sub-container: Institutional Status */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              INSTRUCTION STATUS
            </span>
            <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active Term Session</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Regular instructional calendar in progress
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Split Grid (Curriculum Subjects & Class Incharge) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subjects & Degree Progress (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Degree Progress Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  {deptData?.code ? `${deptData.code.toUpperCase()} · CURRICULUM PROGRESSION` : 'CURRICULUM PROGRESSION'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {programData?.name || 'Academic Degree Program'}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-md self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Verified Cohort
              </span>
            </div>

            <div className="py-4">
              <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-2">
                <span>Semester {classData?.currentSemester || 1} of 6 Completed</span>
                <span className="font-bold text-slate-900 font-mono">{Math.round(((classData?.currentSemester || 1) / 6) * 100)}% Degree Progress</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-[#0b1727] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((classData?.currentSemester || 1) / 6) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Section: <strong className="text-slate-800">{classData?.name || 'Not Assigned'}</strong></span>
              <span>Batch: <strong className="text-slate-800">{batchData ? `${batchData.startYear} - ${batchData.endYear}` : 'Not Assigned'}</strong></span>
              <button
                onClick={() => navigate('/student/subjects')}
                className="text-slate-700 hover:text-black font-semibold inline-flex items-center gap-1"
                type="button"
              >
                <span>Full Syllabus</span>
                <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Curriculum Subjects Strip */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Current Term Subjects ({subjects.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Department curriculum courses assigned to your active semester
                </p>
              </div>
              <button
                onClick={() => navigate('/student/subjects')}
                className="text-xs font-semibold text-slate-700 hover:text-black inline-flex items-center gap-1"
                type="button"
              >
                <span>View All</span>
                <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {subjects.slice(0, 5).map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded">
                      {sub.code}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">
                        {sub.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Semester {sub.semesterNumber} · {sub.credits} Credits
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded uppercase">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Class Incharge Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Class Incharge
              </h3>
              <span className="material-symbols-outlined text-slate-400 text-[1.25rem]">
                supervisor_account
              </span>
            </div>

            <div className="py-4 flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                {classIncharge?.photoUrl ? (
                  <img
                    src={classIncharge.photoUrl}
                    alt={classIncharge.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#0b1727] text-white rounded-lg flex items-center justify-center font-bold text-base">
                    {classIncharge?.name?.slice(0, 2).toUpperCase() || 'CI'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {classIncharge?.name || 'Class Incharge Assigned'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {classIncharge?.designation || 'Assistant Professor'}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">
                    {deptData?.name || 'Department of AI & ML'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-md p-3.5 flex flex-col gap-2 text-xs text-slate-600 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1rem] text-slate-400">mail</span>
                  <span className="truncate">{classIncharge?.email || 'faculty@college.edu'}</span>
                </div>
                {classIncharge?.phone && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1rem] text-slate-400">call</span>
                    <span>{classIncharge.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1rem] text-slate-400">meeting_room</span>
                  <span>{classData?.name || 'Section A'} Advisor</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/student/class-incharge')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 transition-colors text-center"
                type="button"
              >
                View Full Faculty Profile
              </button>
            </div>
          </div>

          {/* Quick Academic Info Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Student Registration Summary
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student ID</span>
                <span className="font-mono font-bold text-slate-800">{student?.studentId || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Program Duration</span>
                <span className="font-semibold text-slate-800">{programData?.durationYears ? `${programData.durationYears} Years` : '3 Years'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Academic Cohort</span>
                <span className="font-semibold text-slate-800">{batchData ? `${batchData.startYear} - ${batchData.endYear}` : 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Verification Status</span>
                <span className="font-semibold text-emerald-600">Active Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Attendance Metric Widget */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                My Attendance Summary
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                {attendance?.summary ? `${attendance.summary.todayAttended} / ${attendance.summary.todayTotal} Today` : '0 / 0 Today'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  {attendance?.summary && attendance.summary.totalSessions > 0
                    ? `${attendance.summary.percentage.toFixed(1)}%`
                    : '0.0%'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  {attendance?.summary && attendance.summary.totalSessions > 0 ? (
                    attendance.summary.percentage >= 75 ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-emerald-600 font-semibold">Exam Eligible (Min 75%)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span className="text-rose-600 font-semibold">Shortage (&lt;75%)</span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span>No Attendance Recorded Yet</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/student/attendance')}
                className="px-3 py-1.5 bg-[#0b1727] hover:bg-[#13243c] text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1"
                type="button"
              >
                <span>
                  {attendance?.summary && attendance.summary.totalSessions > 0
                    ? `${attendance.summary.totalSessions} Sessions`
                    : 'View Attendance'}
                </span>
                <span className="material-symbols-outlined text-[0.95rem]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
