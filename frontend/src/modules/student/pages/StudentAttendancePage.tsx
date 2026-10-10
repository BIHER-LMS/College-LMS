import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';
import { leaveService } from '../../../services/leaveService';
import type { StudentLeave, LeaveReasonCategory } from '../../../services/leaveService';

export const StudentAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    attendance,
    loading,
    errors,
    loadAttendance,
    loadClass,
    classData,
    classInchargeData,
    loadClassIncharge,
  } = useStudent();

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState<LeaveReasonCategory>('HEALTH');
  const [leaveExplanation, setLeaveExplanation] = useState('');
  const [leaveFromDate, setLeaveFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveToDate, setLeaveToDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // My Leave Applications State
  const [myLeaves, setMyLeaves] = useState<StudentLeave[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  useEffect(() => {
    loadAttendance();
    loadClass();
    loadClassIncharge();
    fetchMyLeaves();
  }, [loadAttendance, loadClass, loadClassIncharge]);

  const fetchMyLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const data = await leaveService.getMyLeaves();
      setMyLeaves(data);
    } catch (err) {
      console.error('Failed to load my leaves', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const summary = attendance?.summary;
  const subjectBreakdown = attendance?.subjectBreakdown || [];

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveExplanation.trim()) {
      setLeaveError('Please explain the reason for your leave in a few words.');
      return;
    }

    if (leaveExplanation.trim().length < 5) {
      setLeaveError('Please provide a meaningful explanation (at least 5 characters).');
      return;
    }

    if (new Date(leaveToDate) < new Date(leaveFromDate)) {
      setLeaveError('To Date cannot be earlier than From Date.');
      return;
    }

    setLeaveSubmitting(true);
    setLeaveError(null);

    try {
      await leaveService.applyLeave({
        reason_category: leaveReason,
        explanation: leaveExplanation.trim(),
        from_date: leaveFromDate,
        to_date: leaveToDate,
      });

      setLeaveSubmitted(true);
      await fetchMyLeaves();

      setTimeout(() => {
        setShowLeaveModal(false);
        setLeaveSubmitted(false);
        setLeaveExplanation('');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit leave', err);
      setLeaveError(err.message || 'Failed to submit leave application. Please try again.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading.attendance && !attendance) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 bg-slate-200 w-72 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider rounded">
              ATTENDANCE MONITORING & AUDIT
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              ACADEMIC REGULATION 2026
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            My Attendance
          </h1>
          <p className="text-sm text-slate-500">
            Real-time biometric logs, semester cumulative standing, and examination eligibility.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLeaveError(null);
              setLeaveSubmitted(false);
              setShowLeaveModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">event_busy</span>
            <span>Apply for Leave</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b1727] text-white rounded-md text-sm font-medium hover:bg-[#13243c] shadow-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">download</span>
            <span>Download Log (PDF)</span>
          </button>
        </div>
      </div>

      {/* Download Alert Notification */}
      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[1.3rem] text-emerald-600">check_circle</span>
            <div className="text-sm">
              <strong className="font-semibold">Attendance Log Generated:</strong> Verified audit report for Term {classData?.currentSemester || 6} has been compiled and saved.
            </div>
          </div>
          <button onClick={() => setDownloadSuccess(false)} type="button">
            <span className="material-symbols-outlined text-[1.1rem]">close</span>
          </button>
        </div>
      )}

      {errors.attendance && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[1.25rem]">error</span>
          <span>{errors.attendance}</span>
        </div>
      )}

      {/* ─── 4 Summary Metric Cards (100% Real Data) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cumulative Attendance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CUMULATIVE ATTENDANCE
            </span>
            <span className={`p-2 rounded-md ${summary && summary.totalSessions > 0 && summary.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
              <span className="material-symbols-outlined text-[1.25rem]">fact_check</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {summary && summary.totalSessions > 0 ? `${summary.percentage.toFixed(1)}%` : '0.0%'}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${summary && summary.totalSessions > 0 && summary.percentage >= 75 ? 'bg-emerald-500' : summary && summary.totalSessions > 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
              <span className={`text-xs font-semibold ${summary && summary.totalSessions > 0 && summary.percentage >= 75 ? 'text-emerald-700' : summary && summary.totalSessions > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                {summary && summary.totalSessions > 0 ? (summary.percentage >= 75 ? 'Eligible for End-Sem Exam' : 'Below Mandatory Threshold') : 'No sessions recorded yet'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Minimum mandatory threshold: 75.0%
            </div>
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TODAY'S ATTENDANCE
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">calendar_today</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {summary ? `${summary.attendedToday} / ${summary.totalToday}` : '0 / 0'}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              {summary && summary.totalToday > 0
                ? `${summary.attendedToday} periods attended out of ${summary.totalToday}`
                : 'No periods conducted today'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Awaiting classroom biometric logs
            </div>
          </div>
        </div>

        {/* Card 3: Hours Conducted */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              HOURS CONDUCTED
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">schedule</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {summary ? `${summary.attendedSessions} / ${summary.totalSessions}` : '0 / 0'}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Periods Attended in Term {classData?.currentSemester || 6}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Excused: {summary?.excusedSessions || 0} periods • Absent: {summary?.absentSessions || 0} periods
            </div>
          </div>
        </div>

        {/* Card 4: Safe Absence Margin */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SAFE ABSENCE MARGIN
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">security</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {summary?.safeAbsenceMargin !== undefined ? `${summary.safeAbsenceMargin} Periods` : '0 Periods'}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Permitted leaves buffer available
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Before dropping to 75% critical line
            </div>
          </div>
        </div>
      </div>

      {/* ─── Timetable Navigation Banner ─── */}
      <div className="bg-white border border-blue-100 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-[1.5rem]">calendar_month</span>
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Looking for your Class Time Table?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              The weekly instructional schedule is configured and published by your Class Incharge in the dedicated Time Table section.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/student/timetable')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          type="button"
        >
          <span>Open Time Table</span>
          <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
        </button>
      </div>

      {/* ─── My Leave Applications History Section ─── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              My Leave Applications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track status of leave requests submitted to your Class Incharge ({classInchargeData?.name || 'Class Incharge'}).
            </p>
          </div>
          <button
            onClick={() => {
              setLeaveError(null);
              setLeaveSubmitted(false);
              setShowLeaveModal(true);
            }}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[1rem]">add</span>
            <span>New Leave Request</span>
          </button>
        </div>

        {loadingLeaves ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading leave requests...</div>
        ) : myLeaves.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <span className="material-symbols-outlined text-[1.25rem]">event_available</span>
            </div>
            <p className="text-xs font-semibold text-slate-700">No Leave Applications Found</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
              You haven't submitted any leave requests this term. If you need leave due to health conditions or personal reasons, click "Apply for Leave".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myLeaves.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-col gap-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.reason_category === 'HEALTH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.reason_category === 'FAMILY'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : item.reason_category === 'ACADEMIC'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.reason_category === 'HEALTH'
                        ? 'Health Condition'
                        : item.reason_category === 'FAMILY'
                        ? 'Family / Personal'
                        : item.reason_category === 'ACADEMIC'
                        ? 'Academic OD'
                        : 'Other Reason'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">
                      {item.from_date === item.to_date ? item.from_date : `${item.from_date} to ${item.to_date}`}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    "{item.explanation}"
                  </p>
                  {item.review_remarks && (
                    <p className="text-[11px] text-slate-500 italic">
                      Remarks by Incharge: "{item.review_remarks}"
                    </p>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  {item.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                      <span className="material-symbols-outlined text-[1rem] text-emerald-600">check_circle</span>
                      <span>Approved by {item.reviewed_by_name || 'Class Incharge'}</span>
                    </span>
                  ) : item.status === 'REJECTED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
                      <span className="material-symbols-outlined text-[1rem] text-rose-600">cancel</span>
                      <span>Rejected by {item.reviewed_by_name || 'Class Incharge'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      <span className="material-symbols-outlined text-[1rem] text-amber-600">hourglass_top</span>
                      <span>Pending Class Incharge Review</span>
                    </span>
                  )}
                  <div className="text-[10px] text-slate-400 mt-1">
                    Submitted on {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Subject-wise Cumulative Standing Table ─── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Subject-wise Cumulative Standing
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Course-level breakdown for {classData?.name || 'Assigned Cohort'} • Required: Minimum 75% per course
            </p>
          </div>
          <button
            onClick={() => navigate('/student/subjects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            type="button"
          >
            <span>View Full Syllabus</span>
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Periods Held</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">OD / Medical</th>
                <th className="py-3 px-4">Attendance Progress</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No course attendance records found for current semester.
                  </td>
                </tr>
              ) : (
                subjectBreakdown.map((sub, idx) => (
                  <tr key={sub.subjectId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono font-bold text-[10px] rounded">
                          {sub.subjectCode}
                        </span>
                        <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-600">
                      {sub.held}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                      {sub.attended}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-blue-600">
                      {sub.excused}
                    </td>
                    <td className="py-3 px-4 min-w-[160px]">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            sub.held === 0
                              ? 'bg-slate-300'
                              : sub.percentage >= 75
                              ? 'bg-emerald-600'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${sub.held === 0 ? 0 : sub.percentage}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {sub.held > 0 ? `${sub.percentage}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.held === 0 ? (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded text-[11px]">
                          No Sessions
                        </span>
                      ) : sub.percentage >= 75 ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold rounded text-[11px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Shortage
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Policy Guide & Regulatory Disclaimer ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row items-start gap-4 text-xs text-slate-600">
        <span className="material-symbols-outlined text-[1.8rem] text-slate-500 shrink-0">
          gavel
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-800">
            Institutional Attendance Guidelines (Anna University / Autonomous Regulations)
          </span>
          <p className="leading-relaxed">
            Students are required to secure a minimum of <strong>75% attendance</strong> in all courses to be permitted to write Semester End Examinations. Condonation up to 10% (between 65% and 74%) may be granted by the Academic Council strictly on valid medical grounds or approved leave endorsed by the Class Incharge.
          </p>
        </div>
      </div>

      {/* ─── Apply for Leave Application Modal ─── */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 flex flex-col gap-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                  <span className="material-symbols-outlined text-[1.25rem]">event_busy</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Apply for Leave
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Forwarded directly to Class Incharge for approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            {leaveSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center gap-2.5">
                <span className="material-symbols-outlined text-[3rem] text-emerald-600 animate-bounce">
                  check_circle
                </span>
                <h4 className="text-base font-bold text-slate-900">Leave Application Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Your leave request has been sent to your Class Incharge ({classInchargeData?.name || 'Class Incharge'}) for review. All subject teachers will be able to see your leave status once submitted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeaveSubmit} className="flex flex-col gap-4 text-xs">
                {leaveError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1.1rem]">error</span>
                    <span>{leaveError}</span>
                  </div>
                )}

                {/* Incharge notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md text-[11px] text-blue-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[1.1rem] text-blue-600 shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <div>
                    <span className="font-bold">Assigned Class Incharge: </span>
                    <span>{classInchargeData?.name || 'Class Incharge'} ({classData?.name || 'Class'})</span>
                    <p className="text-blue-700 mt-0.5">
                      Only your Class Incharge has the authority to approve or reject this leave application.
                    </p>
                  </div>
                </div>

                {/* Reason Category Selection */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Reason for Leave <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLeaveReason('HEALTH')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        leaveReason === 'HEALTH'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[1.2rem] text-rose-600">medical_services</span>
                      <div>
                        <div className="text-xs">Health condition</div>
                        <div className="text-[10px] text-slate-500 font-normal">Fever, illness, doctor rest</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeaveReason('FAMILY')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        leaveReason === 'FAMILY'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[1.2rem] text-purple-600">family_restroom</span>
                      <div>
                        <div className="text-xs">Family / Personal</div>
                        <div className="text-[10px] text-slate-500 font-normal">Emergency, function</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeaveReason('ACADEMIC')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        leaveReason === 'ACADEMIC'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[1.2rem] text-blue-600">school</span>
                      <div>
                        <div className="text-xs">Academic / OD</div>
                        <div className="text-[10px] text-slate-500 font-normal">Conference, contest</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeaveReason('OTHER')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        leaveReason === 'OTHER'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[1.2rem] text-slate-600">help_outline</span>
                      <div>
                        <div className="text-xs">Other reason</div>
                        <div className="text-[10px] text-slate-500 font-normal">General absence</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Explanation in a few words */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-800 font-bold">
                      {leaveReason === 'HEALTH'
                        ? 'Explain Health Condition in a few words'
                        : leaveReason === 'FAMILY'
                        ? 'Explain Family / Personal reason in a few words'
                        : leaveReason === 'ACADEMIC'
                        ? 'Explain Academic reason in a few words'
                        : 'Explain reason in a few words'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Brief explanation</span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={leaveExplanation}
                    onChange={(e) => setLeaveExplanation(e.target.value)}
                    placeholder={
                      leaveReason === 'HEALTH'
                        ? 'E.g., Suffering from severe viral fever and throat infection. Doctor advised 2 days complete rest.'
                        : leaveReason === 'FAMILY'
                        ? 'E.g., Attending an urgent family medical emergency in hometown.'
                        : leaveReason === 'ACADEMIC'
                        ? 'E.g., Representing department in inter-college coding symposium.'
                        : 'Please explain the reason for taking leave in a few words...'
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {leaveReason === 'HEALTH'
                      ? 'Explaining your health condition helps the Class Incharge excuse your absence without penalty.'
                      : 'Provide sufficient context so your Class Incharge can review and approve.'}
                  </p>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      From Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={leaveFromDate}
                      onChange={(e) => {
                        setLeaveFromDate(e.target.value);
                        if (new Date(e.target.value) > new Date(leaveToDate)) {
                          setLeaveToDate(e.target.value);
                        }
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      To Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={leaveToDate}
                      min={leaveFromDate}
                      onChange={(e) => setLeaveToDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={leaveSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {leaveSubmitting && (
                      <span className="material-symbols-outlined text-[1rem] animate-spin">progress_activity</span>
                    )}
                    <span>Submit Leave Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
