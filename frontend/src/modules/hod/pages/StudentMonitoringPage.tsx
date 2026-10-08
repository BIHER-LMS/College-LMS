import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicAlerts, fetchStudents } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;

export const StudentMonitoringPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { alerts, students, loading } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchAcademicAlerts());
    dispatch(fetchStudents());
  }, [dispatch]);

  const totalEnrolled = students.length;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <div className="flex flex-col gap-2 border border-[#c5c6cd]/30 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">school</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Student Surveillance & Watchlist</h1>
          </div>
          <span className="bg-[#ffdad6] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#93000a]">
            {totalEnrolled.toLocaleString()} Enrolled
          </span>
        </div>
        <p className="text-xs text-[#44474d]">
          Cohort attendance monitoring, academic caution records, and advisor intervention scheduling.
        </p>
      </div>

      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-4">Critical Academic Caution Cases</h3>
        {loading && alerts.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">No active academic caution alerts.</div>
        ) : (
          <div className="divide-y divide-[#c5c6cd]/20">
            {alerts.map((alert) => (
              <div key={alert.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#0b1c30]">{alert.studentName}</span> (Roll #{alert.registerNumber} · {alert.programName || alert.className})
                  <div className="text-[#ba1a1a] font-bold mt-0.5">
                    Attendance: {alert.attendancePercentage.toFixed(1)}% {alert.alertType === 'ACADEMIC_PROBATION' ? '(Probation Risk) ' : ''}| GPA: {alert.gpa.toFixed(2)}
                  </div>
                  {alert.notes && <div className="text-[#44474d] text-[10px] mt-0.5">{alert.notes}</div>}
                </div>
                <button className="border border-[#0b1c30] px-3 py-1 text-[10px] font-bold hover:bg-[#0b1c30] hover:text-white transition-colors">
                  {alert.alertType === 'ACADEMIC_PROBATION' ? 'Schedule Hearing' : 'Summon Advisor'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};