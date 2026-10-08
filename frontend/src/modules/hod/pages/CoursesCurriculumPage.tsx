import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurriculum, fetchSubjects } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;

export const CoursesCurriculumPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { curriculum, subjects, loading } = useSelector((state: RootState) => state.hod);

  useEffect(() => {
    dispatch(fetchCurriculum());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const activeCount = subjects.length;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <div className="flex flex-col gap-2 border border-[#c5c6cd]/30 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">menu_book</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Courses & Curriculum Tracking</h1>
          </div>
          <span className="bg-[#e5eeff] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#44474d]">
            {activeCount} Active Courses
          </span>
        </div>
        <p className="text-xs text-[#44474d]">
          Syllabus completion progress, course credit distributions, and lab unit compliance.
        </p>
      </div>

      <div className="border border-[#c5c6cd]/30 bg-white p-6 space-y-4">
        {loading && curriculum.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
          </div>
        ) : curriculum.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">No active curriculum records found.</div>
        ) : (
          curriculum.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>
                  {item.subjectName} ({item.subjectCode}) — {item.facultyName}
                </span>
                <span className={item.modulesBehind > 0 ? 'text-[#ba1a1a]' : ''}>
                  {item.completionPercentage}% Completed
                  {item.modulesBehind > 0 ? ` (${item.modulesBehind} Modules Behind)` : ''}
                </span>
              </div>
              <div className="w-full bg-[#eff4ff] h-2">
                <div
                  className={`h-2 transition-all duration-300 ${
                    item.modulesBehind > 0 ? 'bg-[#ba1a1a]' : 'bg-[#0b1c30]'
                  }`}
                  style={{ width: `${Math.min(100, item.completionPercentage)}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};