import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { Building2, Award, GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDepartmentPage: React.FC = () => {
  const { department, loading, loadDepartment } = useFaculty();

  useEffect(() => {
    loadDepartment();
  }, []);

  if (loading.department) {
    return (
      <div className="border border-slate-200 rounded-lg bg-white p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading department overview...
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Department Overview
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Department information, academic programs, and HOD leadership.
            </p>
          </div>
        </div>

        {department && (
          <Link
            to="/faculty/subjects"
            className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Courses & Curricula ({department.subjectsCount})</span>
          </Link>
        )}
      </div>

      {department ? (
        <>
          {/* Main Department Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {department.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
                    {department.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Affiliated Institution: <span className="font-semibold text-slate-800">{department.collegeName || 'Bharath Institute'}</span>
                </p>
              </div>

              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {department.status}
                </span>
              </div>
            </div>

            {/* Department Leadership Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Head of Department (HOD)
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {department.hodName || 'Head of Department Designated'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Curricular Degree Programs
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {department.programs.length} Active Programs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Programs Offered */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Registered Academic Programs</span>
            </h3>

            {department.programs.length === 0 ? (
              <div className="border border-slate-200 rounded bg-white p-12 text-center text-xs text-slate-500">
                No active records found for this module in the current academic session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {department.programs.map((prog) => (
                  <div key={prog.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{prog.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {prog.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Duration: <span className="font-semibold text-slate-700">{prog.durationYears} Academic Years</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="border border-slate-200 rounded bg-white p-16 text-center text-xs text-slate-500">
          No active records found for this module in the current academic session.
        </div>
      )}
    </div>
  );
};

export default FacultyDepartmentPage;
