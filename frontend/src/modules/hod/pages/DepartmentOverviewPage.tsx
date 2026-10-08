import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHODDashboard, fetchDepartment, fetchPrograms, fetchFaculty, fetchStudents } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;

export const DepartmentOverviewPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, department, programs, faculty, students } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchHODDashboard());
    dispatch(fetchDepartment());
    dispatch(fetchPrograms());
    dispatch(fetchFaculty());
    dispatch(fetchStudents());
  }, [dispatch]);

  const dept = department || dashboard?.department;
  const stats = dashboard?.statistics;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      {/* Header */}
      <div className="flex flex-col gap-2 border border-[#c5c6cd]/30 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">domain</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">
              {dept?.name || 'Department Overview & Profile'}
            </h1>
          </div>
          {dept?.code && (
            <span className="bg-[#e5eeff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#44474d]">
              Dept Code: {dept.code}
            </span>
          )}
        </div>
        <p className="text-xs text-[#44474d]">
          Institutional governance, degree programs, faculty allocations, and affiliated college details.
        </p>
      </div>

      {/* Department Key Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-[#c5c6cd]/30 bg-white p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#44474d]">Institutional Affiliation</span>
            <h3 className="mt-1 font-headline text-base font-bold text-[#0b1c30]">
              {dept?.collegeName || (dept as any)?.college?.name || 'Bharath Institute of Higher Education and Research'}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#069669] font-bold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Active Affiliated Department
          </div>
        </div>

        <div className="border border-[#c5c6cd]/30 bg-white p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#44474d]">Head of Department</span>
            <h3 className="mt-1 font-headline text-base font-bold text-[#0b1c30]">
              {dept?.hod?.name || dept?.hodName || 'Loading...'}
            </h3>
            <p className="text-xs text-[#44474d] mt-0.5">{dept?.hod?.email || 'Loading...'}</p>
          </div>
          <span className="mt-3 inline-block w-fit bg-[#eff4ff] px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            Authenticated HOD Context
          </span>
        </div>

        <div className="border border-[#c5c6cd]/30 bg-white p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#44474d]">Academic Offerings</span>
            <h3 className="mt-1 font-headline text-base font-bold text-[#0b1c30]">
              {programs.length} Registered Degree Program{programs.length === 1 ? '' : 's'}
            </h3>
            <p className="text-xs text-[#44474d] mt-0.5">{stats?.subjectCount || 0} Department Syllabi Courses</p>
          </div>
          <span className="mt-3 text-[11px] font-bold text-[#069669]">Curriculum Operational</span>
        </div>
      </div>

      {/* 4-Metric Live Roster Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-[#c5c6cd]/30 bg-white p-4">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Faculty Staff</span>
          <div className="font-headline text-2xl font-bold text-[#0b1c30] mt-1">{faculty.length}</div>
          <span className="text-[10px] text-[#069669] font-bold">100% Department Scoped</span>
        </div>

        <div className="border border-[#c5c6cd]/30 bg-white p-4">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Enrolled Students</span>
          <div className="font-headline text-2xl font-bold text-[#0b1c30] mt-1">{students.length}</div>
          <span className="text-[10px] text-[#069669] font-bold">Active Roster</span>
        </div>

        <div className="border border-[#c5c6cd]/30 bg-white p-4">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Academic Programs</span>
          <div className="font-headline text-2xl font-bold text-[#0b1c30] mt-1">{programs.length}</div>
          <span className="text-[10px] text-gray-500">UG / PG Offerings</span>
        </div>

        <div className="border border-[#c5c6cd]/30 bg-white p-4">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Syllabus Courses</span>
          <div className="font-headline text-2xl font-bold text-[#0b1c30] mt-1">{stats?.subjectCount || 0}</div>
          <span className="text-[10px] text-gray-500">Active Modules</span>
        </div>
      </div>

      {/* Programs List within Department */}
      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h3 className="font-headline text-base font-bold text-[#0b1c30] mb-3">
          Degree Programs in {dept?.name || 'Department'}
        </h3>
        {programs.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-[#c5c6cd]/30">
            No degree programs registered.
          </div>
        ) : (
          <div className="divide-y divide-[#c5c6cd]/20 text-xs">
            {programs.map((p) => (
              <div key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#0b1c30] text-sm">{p.name}</span>
                  <div className="text-[#44474d] text-[11px] mt-0.5">
                    Degree Type: {p.degree || 'UG'} · Duration: {p.durationYears} Years · Status: {p.status}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#eff4ff] text-[#0b1c30] text-[10px] font-bold uppercase">
                  {p.degree || 'UG'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};