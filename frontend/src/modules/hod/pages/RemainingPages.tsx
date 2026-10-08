import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHODDashboard, fetchFaculty, fetchClasses, fetchStudents, fetchSubjects, fetchAttendanceSummary, fetchCurriculum } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;

// Common Section Header Component
const SectionHeader = ({
  title,
  subtitle,
  icon,
  badge,
}: {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
}) => (
  <div className="mb-6 flex flex-col gap-2 border border-[#c5c6cd]/30 bg-white p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">{icon}</span>
        <h1 className="font-headline text-xl font-bold text-[#0b1c30]">{title}</h1>
      </div>
      {badge && (
        <span className="bg-[#e5eeff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#44474d]">
          {badge}
        </span>
      )}
    </div>
    <p className="text-xs text-[#44474d]">{subtitle}</p>
  </div>
);

// 1. Academic Performance & Analytics
export const AcademicPerformancePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, attendanceSummary } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchHODDashboard());
    dispatch(fetchAttendanceSummary());
  }, [dispatch]);

  const stats = dashboard?.statistics;
  const avgAttendance = attendanceSummary?.departmentAverage;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Academic Performance & Analytics"
        subtitle="Departmental academic standing, cohort attendance compliance, and program performance metrics."
        icon="analytics"
        badge={dashboard?.academicYear?.name ? `${dashboard.academicYear.name}` : undefined}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-[#c5c6cd]/30 bg-white p-5">
          <span className="text-[10px] font-bold uppercase text-[#44474d]">Department Attendance</span>
          <h3 className="mt-1 font-headline text-2xl font-bold text-[#0b1c30]">
            {avgAttendance !== undefined ? `${avgAttendance}%` : '—'}
          </h3>
          <p className="mt-2 text-xs text-[#069669] font-bold">Live Aggregated Metric</p>
        </div>
        <div className="border border-[#c5c6cd]/30 bg-white p-5">
          <span className="text-[10px] font-bold uppercase text-[#44474d]">Enrolled Students</span>
          <h3 className="mt-1 font-headline text-2xl font-bold text-[#0b1c30]">
            {stats?.studentCount?.toLocaleString() || '0'}
          </h3>
          <p className="mt-2 text-xs text-[#44474d]">Active Department Roster</p>
        </div>
        <div className="border border-[#c5c6cd]/30 bg-white p-5">
          <span className="text-[10px] font-bold uppercase text-[#44474d]">Active Courses</span>
          <h3 className="mt-1 font-headline text-2xl font-bold text-[#0b1c30]">
            {stats?.subjectCount || '0'}
          </h3>
          <p className="mt-2 text-xs text-[#44474d]">Curriculum Modules</p>
        </div>
      </div>

      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-2">Grade Distributions & Term Analysis</h3>
        <p className="text-xs text-[#44474d] mb-4">
          Detailed summative grade cards are generated upon final examination mark submission.
        </p>
        <div className="border border-dashed border-[#c5c6cd]/30 p-8 text-center text-xs text-gray-400">
          No summative examination mark sheets published for the active term yet.
        </div>
      </div>
    </div>
  );
};

// 2. Assignments Tracking
export const AssignmentsTrackingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subjects, loading } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchCurriculum());
    dispatch(fetchSubjects());
  }, [dispatch]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Assignments & Coursework Tracking"
        subtitle="Track problem sets, laboratory coursework, and faculty grading evaluation queues."
        icon="assignment"
      />
      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-4">Active Course Modules</h3>
        {loading && subjects.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-[#c5c6cd]/30">
            No active coursework modules registered.
          </div>
        ) : (
          <div className="divide-y divide-[#c5c6cd]/20 text-xs">
            {subjects.map((s) => (
              <div key={s.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#0b1c30]">{s.name}</span> ({s.code})
                  <div className="text-[#44474d] text-[10px] mt-0.5">
                    Credits: {s.credits} · Semester: Term {s.semesterNumber}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#eff4ff] text-[#0b1c30] text-[10px] font-bold">
                  Active Module
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Exams & Results
export const ExamsResultsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const { subjects, loading } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Exams & Result Approvals"
        subtitle="Proctored examination schedules, internal mark validations, and grade card approvals."
        icon="military_tech"
      />
      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-3">Examination Schedule</h3>
        <div className="border border-dashed border-[#c5c6cd]/30 p-8 text-center text-xs text-gray-400">
          No proctored examination sessions scheduled for this academic term.
        </div>
      </div>
    </div>
  );
};

// 4. Timetable & Scheduling
export const TimetableSchedulingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, loading } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Timetable & Class Allocation"
        subtitle="Classroom allocations, batch division schedules, and designated class incharges."
        icon="schedule"
      />
      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-4">Department Class Divisions</h3>
        {loading && classes.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-[#c5c6cd]/30">
            No class allocations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#44474d] font-bold uppercase tracking-wider border-b border-[#0b1c30] text-[10px]">
                  <th className="py-2.5 px-3">Class Name</th>
                  <th className="py-2.5 px-3">Program / Batch</th>
                  <th className="py-2.5 px-3">Term</th>
                  <th className="py-2.5 px-3">Class Incharge</th>
                  <th className="py-2.5 px-3 text-right">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-[#eff4ff]">
                    <td className="py-3 px-3 font-bold text-[#0b1c30]">{cls.name}</td>
                    <td className="py-3 px-3 text-[#44474d]">{cls.programName} ({cls.batchName})</td>
                    <td className="py-3 px-3 text-[#44474d]">Term {cls.semesterNumber}</td>
                    <td className="py-3 px-3 font-medium text-[#0b1c30]">
                      {cls.facultyName ? `★ ${cls.facultyName}` : <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#0b1c30]">{cls.studentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Leave & Approvals
export const LeaveApprovalsPage: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Leave & Executive Approvals"
        subtitle="Review faculty leave requests, grade petition arbitrations, and official department authorizations."
        icon="verified_user"
      />
      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-4">Pending Executive Approvals</h3>
        <div className="border border-dashed border-[#c5c6cd]/30 p-8 text-center text-xs text-gray-400">
          No pending leave requests or petitions awaiting executive authorization.
        </div>
      </div>
    </div>
  );
};

// 6. Academic Calendar
export const AcademicCalendarPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchHODDashboard());
  }, [dispatch]);

  const year = dashboard?.academicYear;
  const sem = dashboard?.semester;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Academic Calendar & Event Key Dates"
        subtitle="Official term schedule, examination windows, submission cutoffs, and session metadata."
        icon="calendar_month"
        badge={year?.name ? `${year.name}` : undefined}
      />
      <div className="border border-[#c5c6cd]/30 bg-white p-6 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#c5c6cd]/30 p-4 bg-[#f8f9ff]">
            <span className="text-[10px] uppercase font-bold text-[#44474d]">Active Academic Year</span>
            <div className="font-headline text-lg font-bold text-[#0b1c30] mt-1">
              {year?.name || 'Active Session'}
            </div>
            {year?.startDate && year?.endDate && (
              <p className="text-xs text-[#44474d] mt-1">
                Duration: {new Date(year.startDate).toLocaleDateString()} – {new Date(year.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="border border-[#c5c6cd]/30 p-4 bg-[#f8f9ff]">
            <span className="text-[10px] uppercase font-bold text-[#44474d]">Current Semester Term</span>
            <div className="font-headline text-lg font-bold text-[#0b1c30] mt-1">
              Term {sem?.termNumber || 1}
            </div>
            {sem?.startDate && sem?.endDate && (
              <p className="text-xs text-[#44474d] mt-1">
                Term Window: {new Date(sem.startDate).toLocaleDateString()} – {new Date(sem.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. Reports & Analytics
export const ReportsAnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { faculty, students } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchFaculty());
    dispatch(fetchStudents());
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleDownloadFacultyCSV = () => {
    if (faculty.length === 0) return;
    const header = 'Name,Employee ID,Designation,Status,Class Incharge\n';
    const rows = faculty.map(f => `"${f.name}","${f.employeeId}","${f.designation}","${f.status}","${f.assignedClassName || 'None'}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty_roster_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadStudentsCSV = () => {
    if (students.length === 0) return;
    const header = 'Register Number,Name,Program,Batch,Status\n';
    const rows = students.map(s => `"${s.registerNumber}","${s.name}","${s.programName || ''}","${s.batchName || ''}","${s.status}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_enrollment_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Reports & Governance Analytics"
        subtitle="Generate and download departmental reports directly from live database records."
        icon="query_stats"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="border border-[#c5c6cd]/30 bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[#0b1c30] text-sm">Faculty Staff Roster Report</div>
            <p className="text-[#44474d] mt-1">
              Active departmental faculty list with designation, employee IDs, and incharge allocations ({faculty.length} records).
            </p>
          </div>
          <button
            onClick={handleDownloadFacultyCSV}
            disabled={faculty.length === 0}
            className="mt-4 bg-[#0b1c30] text-white px-3 py-1.5 font-bold text-[10px] w-fit hover:bg-[#0d1c32] disabled:opacity-50 transition-colors"
          >
            Export Faculty CSV
          </button>
        </div>
        <div className="border border-[#c5c6cd]/30 bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[#0b1c30] text-sm">Student Enrollment Roster Report</div>
            <p className="text-[#44474d] mt-1">
              Complete student cohort roster with registration IDs and assigned batches ({students.length} records).
            </p>
          </div>
          <button
            onClick={handleDownloadStudentsCSV}
            disabled={students.length === 0}
            className="mt-4 bg-[#0b1c30] text-white px-3 py-1.5 font-bold text-[10px] w-fit hover:bg-[#0d1c32] disabled:opacity-50 transition-colors"
          >
            Export Student CSV
          </button>
        </div>
      </div>
    </div>
  );
};

// 8. Audit & Export Reports
export const AuditExportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, faculty, students, classes, subjects } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchHODDashboard());
    dispatch(fetchFaculty());
    dispatch(fetchStudents());
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleExportFullAuditJSON = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      department: dashboard?.department,
      academicYear: dashboard?.academicYear,
      semester: dashboard?.semester,
      statistics: dashboard?.statistics,
      faculty,
      classes,
      subjects,
      studentsCount: students.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_dossier_${dashboard?.department?.code || 'dept'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <SectionHeader
        title="Audit & Export Administrative Dossiers"
        subtitle="Export verified departmental audits and analytical records generated from live database tables."
        icon="file_save"
      />
      <div className="border border-[#c5c6cd]/30 bg-white p-6 text-xs flex flex-col gap-4">
        <p className="text-[#44474d]">
          Exported dossiers compile authenticated departmental records directly from PostgreSQL for NAAC, NIRF, and administrative compliance.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportFullAuditJSON}
            className="border border-[#0b1c30] bg-[#0b1c30] px-4 py-2 font-bold text-white hover:bg-[#0d1c32] transition-colors"
          >
            Export Department Audit Dossier (.JSON)
          </button>
        </div>
      </div>
    </div>
  );
};