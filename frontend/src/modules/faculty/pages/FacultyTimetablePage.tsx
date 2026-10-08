import React, { useEffect, useState } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { ClassTimetableManager } from '../components/ClassTimetableManager';
import { Clock, ShieldCheck, Calendar, GraduationCap } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const FacultyTimetablePage: React.FC = () => {
  const { classes, loading, loadClasses, loadDashboard } = useFaculty();
  const [searchParams] = useSearchParams();
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
    loadDashboard();
  }, []);

  // Sync selected class with URL param if present
  useEffect(() => {
    const classParam = searchParams.get('classId');
    if (classParam && classes.some(c => c.id === classParam)) {
      setSelectedClassId(classParam);
    }
  }, [searchParams, classes]);

  // Set default selected class once classes load
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  if (loading.classes) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-28 bg-slate-800/60 rounded-xl animate-pulse" />
        <div className="h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  // If faculty is not assigned as class incharge for any class
  if (classes.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Time Table</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage class timetables
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-xs mt-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Class Incharge Access Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
              You are not currently assigned as a Class Incharge.
              Only Class Incharges can view and edit weekly timetables.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Link
              to="/faculty"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/20 shadow-xs shrink-0">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Time Table
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Class Incharge
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20">
                  {activeClass.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Manage the weekly period-wise class timetable for your cohort.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <Link
              to="/faculty/classes"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-xs transition"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Back to My Class</span>
            </Link>
          </div>
        </div>

        {/* If multiple classes are assigned, show class switcher */}
        {classes.length > 1 && (
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-medium text-slate-400 mr-1 shrink-0">Switch Cohort:</span>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  cls.id === activeClass.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <ClassTimetableManager
          classId={activeClass.id}
          className={activeClass.name}
        />
      </div>
    </div>
  );
};
