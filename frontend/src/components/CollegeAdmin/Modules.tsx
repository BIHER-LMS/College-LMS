import { ClipboardCheck, TrendingUp, FileEdit, Clock, Users, BookOpen, AlertCircle } from 'lucide-react';

export function TimetableModule() {
  const schedule = [
    { time: '09:00 AM - 10:00 AM', subject: 'Data Structures', class: 'CSE - A', room: 'Room 101', faculty: 'Dr. Smith' },
    { time: '10:15 AM - 11:15 AM', subject: 'Computer Networks', class: 'CSE - A', room: 'Room 102', faculty: 'Prof. Johnson' },
    { time: '11:30 AM - 12:30 PM', subject: 'Database Systems', class: 'CSE - B', room: 'Room 105', faculty: 'Dr. Lee' },
    { time: '01:30 PM - 02:30 PM', subject: 'Operating Systems', class: 'CSE - A', room: 'Room 103', faculty: 'Dr. Smith' },
  ];

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

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex gap-4">
            <select className="border-slate-300 rounded-lg text-sm bg-white px-3 py-1.5 focus:ring-brand-800 focus:border-brand-800">
              <option>Computer Science</option>
              <option>Information Technology</option>
            </select>
            <select className="border-slate-300 rounded-lg text-sm bg-white px-3 py-1.5 focus:ring-brand-800 focus:border-brand-800">
              <option>Semester 1</option>
              <option>Semester 3</option>
            </select>
          </div>
          <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            Today
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {schedule.map((slot, i) => (
            <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-6">
              <div className="flex-shrink-0 w-40">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {slot.time}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{slot.subject}</h4>
                <div className="flex gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {slot.class}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {slot.faculty}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                {slot.room}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AttendanceModule() {
  const metrics = [
    { label: 'Overall Attendance', value: '89.4%', trend: '+2.1%', up: true },
    { label: 'Low Attendance Alerts', value: '24', trend: 'Needs action', up: false },
    { label: 'Faculty Leaves Today', value: '5', trend: 'Normal', up: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Attendance Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">Monitor student and faculty attendance trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{m.label}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-800">{m.value}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${m.up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {m.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Attendance Heatmap Visualization</p>
          <p className="text-sm mt-1">Integration with biometric/RFID systems pending</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[350px] flex items-center justify-center">
           <div className="text-center text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">GPA Distribution Chart</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Recent Health Indicators</h3>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Drop in Average Score</h4>
                <p className="text-xs text-slate-500 mt-1">Class CSE-B has seen a 12% drop in internal assessment scores compared to last semester.</p>
              </div>
            </div>
          ))}
        </div>
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

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 font-medium text-slate-700 bg-slate-50">
          Upcoming Examinations
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { title: 'Mid-Semester Examination', date: 'Oct 15, 2026', status: 'Scheduled' },
            { title: 'Final Practical Labs', date: 'Nov 02, 2026', status: 'Drafting' },
            { title: 'Theory Finals', date: 'Nov 18, 2026', status: 'Planning' }
          ].map((exam, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{exam.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{exam.date}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {exam.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
