import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceSummary } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;

export const AttendanceSurveillancePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { attendanceSummary, loading } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchAttendanceSummary());
  }, [dispatch]);

  const departmentAverage = attendanceSummary?.departmentAverage;
  const cohorts = attendanceSummary?.cohorts || [];

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <div className="flex flex-col gap-2 border border-[#c5c6cd]/30 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">fact_check</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Attendance Surveillance & Roster Logs</h1>
          </div>
          {departmentAverage !== undefined && (
            <span className="bg-[#e5eeff] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#069669]">
              {departmentAverage}% Department Avg
            </span>
          )}
        </div>
        <p className="text-xs text-[#44474d]">
          Cohort-level attendance rates, daily roster filing compliance, and prompt dispatch alerts.
        </p>
      </div>

      {loading && cohorts.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
        </div>
      ) : cohorts.length === 0 ? (
        <div className="border border-dashed border-[#c5c6cd]/30 bg-white p-8 text-center text-xs text-gray-400">
          No cohort attendance records available.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cohorts.map((c, i) => (
            <div
              key={i}
              className={`border border-[#c5c6cd]/30 bg-white p-4 ${
                c.percentage < 90 ? 'border-l-2 border-l-[#ba1a1a]' : ''
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#44474d]">{c.cohort}</span>
              <div
                className={`font-headline text-xl font-bold mt-1 ${
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
  );
};