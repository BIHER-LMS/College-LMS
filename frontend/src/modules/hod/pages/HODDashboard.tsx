import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHODDashboard, fetchAttendanceSummary, fetchFaculty } from "../store/slices/hodSlice";
;
import type { RootState, AppDispatch } from "../store/store";
import { DashboardAnnouncements } from '../../../components/Announcements/DashboardAnnouncements';

export const HODDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, attendanceSummary, faculty, loading } = useSelector(
    (state: RootState) => state.hod
  );

  useEffect(() => {
    dispatch(fetchHODDashboard());
    dispatch(fetchAttendanceSummary());
    dispatch(fetchFaculty());
  }, [dispatch]);

  if (loading && !dashboard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
      </div>
    );
  }

  const stats = dashboard?.statistics || {
    facultyCount: 0,
    studentCount: 0,
    programCount: 0,
    batchCount: 0,
    classCount: 0,
    subjectCount: 0,
  };

  const avgAttendance = attendanceSummary?.departmentAverage;
  const cohorts = attendanceSummary?.cohorts || [];

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      {/* SECTION 1: EXECUTIVE PAGE HEADER */}
      <div className="flex flex-col gap-4 border border-[#c5c6cd]/30 bg-white p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#e5eeff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#44474d]">
              Executive Portal
            </span>
            {dashboard?.academicYear && (
              <>
                <span className="text-[#c5c6cd]">•</span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase text-[#44474d]">
                  {dashboard.academicYear.name}
                  {dashboard.semester?.termNumber ? ` (Term ${dashboard.semester.termNumber})` : ''}
                </span>
              </>
            )}
          </div>
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-[#0b1c30]">
            Good Morning{dashboard?.department?.hod?.name ? `, ${dashboard.department.hod.name}` : ''}
          </h1>
          <p className="text-xs text-[#44474d]">
            {dashboard?.department?.name
              ? `${dashboard.department.name} executive overview: faculty operations, syllabus compliance, cohort attendance surveillance, and academic standing.`
              : 'Departmental executive overview and academic surveillance.'}
          </p>
        </div>
      </div>

      {/* SECTION 2: RESPONSIVE 6-KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-4 hover:border-[#0b1c30] transition-colors">
          <div className="flex items-center justify-between text-[#44474d] mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Students</span>
            <span className="material-symbols-outlined text-[18px]">school</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline text-2xl font-bold text-[#0b1c30]">
              {stats.studentCount.toLocaleString()}
            </span>
            <span className="text-[#44474d] text-[11px] mt-1">Enrolled</span>
          </div>
        </div>

        <div className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-4 hover:border-[#0b1c30] transition-colors">
          <div className="flex items-center justify-between text-[#44474d] mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Faculty Staff</span>
            <span className="material-symbols-outlined text-[18px]">badge</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline text-2xl font-bold text-[#0b1c30]">
              {stats.facultyCount}
            </span>
            <span className="text-[#069669] font-bold text-[11px] mt-1">Assigned Members</span>
          </div>
        </div>

        <div className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-4 hover:border-[#0b1c30] transition-colors">
          <div className="flex items-center justify-between text-[#44474d] mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Active Syllabi</span>
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline text-2xl font-bold text-[#0b1c30]">
              {stats.subjectCount}
            </span>
            <span className="text-[#44474d] text-[11px] mt-1">Department Courses</span>
          </div>
        </div>

        <div className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-4 hover:border-[#0b1c30] transition-colors">
          <div className="flex items-center justify-between text-[#44474d] mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Avg. Attendance</span>
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline text-2xl font-bold text-[#0b1c30]">
              {avgAttendance !== undefined ? `${avgAttendance}%` : '—'}
            </span>
            <span className="text-[#44474d] text-[11px] mt-1">Department Average</span>
          </div>
        </div>

        <div className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-4 hover:border-[#0b1c30] transition-colors">
          <div className="flex items-center justify-between text-[#44474d] mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Department Classes</span>
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline text-2xl font-bold text-[#0b1c30]">
              {stats.classCount}
            </span>
            <span className="text-[#44474d] text-[11px] mt-1">Active Classes</span>
          </div>
        </div>

        <div className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-4 hover:border-[#0b1c30] transition-colors">
          <div className="flex items-center justify-between text-[#44474d] mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Programs & Batches</span>
            <span className="material-symbols-outlined text-[#0b1c30] text-[18px]">domain</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-headline text-2xl font-bold text-[#0b1c30]">
              {stats.programCount} Deg / {stats.batchCount} Batches
            </span>
            <span className="text-[#44474d] text-[11px] mt-1">Department Offerings</span>
          </div>
        </div>
      </div>

      {/* SECTION 2.5: CAMPUS & ADMINISTRATIVE ANNOUNCEMENTS */}
      <DashboardAnnouncements role="HOD" />

      {/* SECTION 3: RESPONSIVE FACULTY TABLE CONTAINER */}
      <div className="border border-[#c5c6cd]/30 bg-white flex flex-col">
        <div className="p-4 border-b border-[#c5c6cd]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-base font-bold text-[#0b1c30]">Faculty Supervision & Teaching Workload</h2>
            <p className="text-xs text-[#44474d]">Instructional assignments and class supervision</p>
          </div>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="overflow-x-auto">
          {faculty.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No faculty members found.</div>
          ) : (
            <table className="w-full min-w-[700px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#44474d] font-bold uppercase tracking-wider border-b border-[#0b1c30] text-[10px]">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Class Incharge Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Employee ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {faculty.slice(0, 5).map((f) => (
                  <tr key={f.uid} className="hover:bg-[#eff4ff]">
                    <td className="py-3 px-4 font-bold text-[#0b1c30]">{f.name}</td>
                    <td className="py-3 px-4 text-[#44474d]">{f.designation}</td>
                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                      {f.isClassIncharge ? (
                        <span className="text-indigo-600 font-bold">★ {f.assignedClassName}</span>
                      ) : (
                        <span className="text-gray-400 italic">Instructional Faculty</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={f.status === 'ACTIVE' ? 'text-[#069669] font-bold' : 'text-gray-500 font-bold'}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0b1c30]">
                      {f.employeeId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 4: ATTENDANCE COMPLIANCE BY COHORT */}
      <div className="border border-[#c5c6cd]/30 bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-base font-bold text-[#0b1c30]">Attendance Compliance by Cohort</h2>
          {avgAttendance !== undefined && (
            <span className="text-xs text-[#44474d]">
              Department Average: <strong className="text-[#0b1c30]">{avgAttendance}%</strong>
            </span>
          )}
        </div>

        {cohorts.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-[#c5c6cd]/30">
            No cohort attendance data currently recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {cohorts.map((c, i) => (
              <div
                key={i}
                className={`p-4 bg-[#f8f9ff] border ${
                  c.percentage < 90 ? 'border-l-2 border-l-[#ba1a1a]' : 'border-[#c5c6cd]/30'
                }`}
              >
                <span className="text-[10px] font-semibold text-[#44474d] uppercase">{c.cohort}</span>
                <div
                  className={`font-headline text-2xl font-bold mt-1 ${
                    c.percentage < 90 ? 'text-[#ba1a1a]' : 'text-[#069669]'
                  }`}
                >
                  {c.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};