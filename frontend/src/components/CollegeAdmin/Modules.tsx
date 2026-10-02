import { ClipboardCheck, TrendingUp, FileEdit, Clock } from 'lucide-react';

export function TimetableModule() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Timetable</h2>
          <p className="text-slate-500 text-sm mt-1">Manage schedules across all departments and classes</p>
        </div>
        <button className="px-4 py-2 bg-brand-800 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm">
          Generate Schedule
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <Clock className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">No Timetable Data</h3>
        <p className="text-slate-500 max-w-sm mt-1">Timetable schedules have not been configured for this academic period yet.</p>
      </div>
    </div>
  );
}

export function AttendanceModule() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Attendance Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">Monitor student and faculty attendance trends</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <ClipboardCheck className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">No Attendance Data</h3>
        <p className="text-slate-500 max-w-sm mt-1">Attendance records are not available. This module is pending integration.</p>
      </div>
    </div>
  );
}

export function PerformanceModule() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Academic Performance</h2>
        <p className="text-slate-500 text-sm mt-1">Track student progress and identify areas for improvement</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">No Performance Data</h3>
        <p className="text-slate-500 max-w-sm mt-1">Performance metrics will appear here once academic records are processed.</p>
      </div>
    </div>
  );
}

export function ExaminationsModule() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Examinations & Assignments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage exam schedules, grading, and paper tracking</p>
        </div>
        <button className="px-4 py-2 bg-brand-800 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm">
          Schedule Exam
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <FileEdit className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">No Upcoming Examinations</h3>
        <p className="text-slate-500 max-w-sm mt-1">There are no examinations scheduled at the moment.</p>
      </div>
    </div>
  );
}
