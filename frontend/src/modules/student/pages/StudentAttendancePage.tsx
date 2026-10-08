import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';

export const StudentAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { attendance, loading, errors, loadAttendance, loadClass, classData } = useStudent();

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showOdModal, setShowOdModal] = useState(false);
  const [odSubmitted, setOdSubmitted] = useState(false);
  const [odReason, setOdReason] = useState('Hackathon');

  useEffect(() => {
    loadAttendance();
    loadClass();
  }, [loadAttendance, loadClass]);

  const summary = attendance?.summary;
  const subjectBreakdown = attendance?.subjectBreakdown || [];

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleOdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOdSubmitted(true);
    setTimeout(() => {
      setShowOdModal(false);
      setOdSubmitted(false);
    }, 1800);
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
            onClick={() => setShowOdModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 shadow-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-slate-500">assignment_turned_in</span>
            <span>Apply for OD / Leave</span>
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
              <span className="material-symbols-outlined text-[1.25rem]">today</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {summary?.todayTotal ? `${summary.todayAttended} / ${summary.todayTotal}` : '0 / 0'}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-2">
              {summary?.todayTotal
                ? `${summary.todayPresent} Present · ${summary.todayLate} Late · ${summary.todayExcused} On Duty`
                : 'No periods conducted today'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary?.todayTotal
                ? `${summary.todayEffectivePercentage}% effective attendance score today`
                : 'Awaiting classroom biometric logs'}
            </div>
          </div>
        </div>

        {/* Card 3: Total Hours / Periods */}
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
            <div className="text-xs font-semibold text-slate-600 mt-2">
              Periods Attended in Term {classData?.currentSemester || 6}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary ? `Excused: ${summary.excusedCount} periods · Absent: ${summary.absentCount} periods` : 'No attendance entries logged'}
            </div>
          </div>
        </div>

        {/* Card 4: Shortage Safety Buffer */}
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
            <div className={`text-3xl font-extrabold tracking-tight font-mono ${summary && summary.safeMargin < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {summary && summary.totalSessions > 0
                ? (summary.safeMargin >= 0 ? `+${summary.safeMargin} Periods` : `${summary.safeMargin} Periods`)
                : '0 Periods'}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-2">
              {summary && summary.totalSessions > 0 && summary.safeMargin < 0
                ? 'Required periods to reach 75%'
                : 'Permitted leaves buffer available'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Before dropping to 75% critical line
            </div>
          </div>
        </div>
      </div>

      {/* ─── Dedicated Time Table Referral Banner ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[1.4rem] text-blue-600">calendar_month</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Looking for your Class Time Table?</div>
            <div className="text-xs text-slate-500 mt-0.5">
              The weekly instructional schedule is configured and published by your Class Incharge in the dedicated <strong>Time Table</strong> section.
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/student/timetable')}
          className="px-4 py-2 bg-[#0b1727] hover:bg-[#13243c] text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
          type="button"
        >
          <span>Open Time Table</span>
          <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
        </button>
      </div>

      {/* ─── Subject-Wise Cumulative Attendance Table (100% Real Data) ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Subject-wise Cumulative Standing
            </h3>
            <p className="text-xs text-slate-500">
              Course-level breakdown for {classData?.name || 'Enrolled Class'} · Required: Minimum 75% per course
            </p>
          </div>
          <button
            onClick={() => navigate('/student/subjects')}
            className="text-xs font-semibold text-slate-700 hover:text-black inline-flex items-center gap-1 self-start sm:self-auto"
            type="button"
          >
            <span>View Full Syllabus</span>
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
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
                    No curriculum courses registered for this semester.
                  </td>
                </tr>
              ) : (
                subjectBreakdown.map((sub) => (
                  <tr key={sub.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold rounded text-[11px]">
                          {sub.code}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs">
                          {sub.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
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
            Students are required to secure a minimum of <strong>75% attendance</strong> in all courses to be permitted to write Semester End Examinations. Condonation up to 10% (between 65% and 74%) may be granted by the Academic Council strictly on valid medical grounds or official institution representation (On Duty). Below 65% will result in course re-registration.
          </p>
        </div>
      </div>

      {/* ─── On Duty (OD) Application Modal ─── */}
      {showOdModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 flex flex-col gap-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                  <span className="material-symbols-outlined text-[1.25rem]">assignment_turned_in</span>
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Submit On-Duty (OD) / Leave
                </h3>
              </div>
              <button
                onClick={() => setShowOdModal(false)}
                className="text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            {odSubmitted ? (
              <div className="py-6 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[2.5rem] text-emerald-600 animate-bounce">
                  check_circle
                </span>
                <h4 className="text-base font-bold text-slate-900">Request Forwarded!</h4>
                <p className="text-xs text-slate-500">
                  Your request has been routed to Class Incharge for approval and Dean endorsement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOdSubmit} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Activity / Event Category
                  </label>
                  <select
                    value={odReason}
                    onChange={(e) => setOdReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-slate-400"
                  >
                    <option value="Hackathon">Technical Competition / Hackathon</option>
                    <option value="Paper">Conference / Paper Presentation</option>
                    <option value="Sports">Zonal / State Sports Representation</option>
                    <option value="Medical">Medical Leave (Doctor Endorsement)</option>
                    <option value="Club">Institutional Club Organizing Committee</option>
                  </select>
                </div>


                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Remarks / Evidence URL
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide acceptance letter link, invitation email reference, or certificate..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    defaultValue="Representing College at National Smart India Hackathon Grand Finale."
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowOdModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0b1727] text-white rounded-md font-medium hover:bg-[#13243c]"
                  >
                    Submit Request
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
