import React from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GraduationCap,
  Users,
  Award,
  ExternalLink,
  ShieldCheck,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { ToolExecuted } from '../../types/facultyAi.types';

interface StructuredToolViewProps {
  tool: ToolExecuted;
}

export const StructuredToolView: React.FC<StructuredToolViewProps> = ({ tool }) => {
  const { toolName, result, status } = tool;

  if (status === 'error' || !result) {
    return (
      <div className="my-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
        <div>
          <span className="font-semibold">Tool Execution Notice: </span>
          {tool.error?.message || 'The tool was unable to retrieve data.'}
        </div>
      </div>
    );
  }

  // 1. Tool 18: faculty.searchKnowledge (RAG Search Results)
  if (toolName === 'faculty.searchKnowledge' && result.results) {
    const results = result.results as Array<{
      id: string;
      title: string;
      snippet: string;
      score: number;
      category: string;
      sourceUrl?: string;
    }>;

    if (results.length === 0) {
      return (
        <div className="my-2 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">No Matching Knowledge Documents</span>
            No official university policy or handbook documents matched this query. Please verify the terms or consult the Dean of Academics.
          </div>
        </div>
      );
    }

    return (
      <div className="my-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
          <span className="flex items-center gap-1.5 text-indigo-700">
            <BookOpen className="w-3.5 h-3.5" />
            Institutional Citations ({results.length})
          </span>
          <span className="text-[11px] text-slate-400">Verified Regulations</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {results.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    {doc.title}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {doc.category.replace(/_/g, ' ')}
                  </span>
                </div>
                {doc.score !== undefined && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-nowrap">
                    {Math.round(doc.score * 100)}% match
                  </span>
                )}
              </div>
              <blockquote className="text-xs text-slate-600 border-l-2 border-indigo-400 pl-2.5 py-0.5 my-2 italic bg-slate-50/60 rounded-r">
                {doc.snippet}
              </blockquote>
              {doc.sourceUrl && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                    <ExternalLink className="w-3 h-3" />
                    Handbook Section: <code className="font-mono text-[10px] text-slate-600">{doc.sourceUrl}</code>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Tool 19: faculty.getKnowledgeContext (RAG Context Excerpt)
  if (toolName === 'faculty.getKnowledgeContext') {
    return (
      <div className="my-3 p-4 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-100 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Official Regulatory Excerpt: {result.topic}
            </span>
          </div>
          {result.lastUpdated && (
            <span className="text-[10px] text-slate-400 font-mono">
              Updated: {new Date(result.lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-3">
          {result.contextText}
        </p>
        {result.citations && result.citations.length > 0 && (
          <div className="pt-2 border-t border-indigo-50">
            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
              Authoritative References & Citations:
            </span>
            <ul className="space-y-1">
              {result.citations.map((c: string, i: number) => (
                <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                  <FileText className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 3. Tool 7: faculty.getClassAttendanceStats
  if (toolName === 'faculty.getClassAttendanceStats') {
    const avg = Number(result.averageAttendancePercentage || 0);
    const isGood = avg >= 75;
    return (
      <div className="my-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Class Attendance Overview: {result.className}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {avg.toFixed(1)}% Avg
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Students</span>
            <span className="text-sm font-bold text-slate-800">{result.totalStudents}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Sessions</span>
            <span className="text-sm font-bold text-slate-800">{result.totalSessionsConducted}</span>
          </div>
          <div className="p-2.5 bg-rose-50/70 rounded-lg text-center border border-rose-100">
            <span className="text-[10px] text-rose-600 block uppercase font-medium">Defaulters (&lt;75%)</span>
            <span className="text-sm font-bold text-rose-700">{result.defaultersCount}</span>
          </div>
          <div className="p-2.5 bg-emerald-50/70 rounded-lg text-center border border-emerald-100">
            <span className="text-[10px] text-emerald-600 block uppercase font-medium">Eligible (&gt;=75%)</span>
            <span className="text-sm font-bold text-emerald-700">{result.goodAttendanceCount}</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isGood ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(avg, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  // 4. Tool 2: faculty.getAssignedClasses
  if (toolName === 'faculty.getAssignedClasses' && result.classes) {
    const classes = result.classes as any[];
    return (
      <div className="my-3 space-y-2">
        <div className="text-xs font-semibold text-slate-600 px-1 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          Assigned Classes ({classes.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{cls.name}</span>
                  {cls.inchargeFaculty?.name && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      Incharge
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Sem {cls.currentSemester || '5'} • {cls.program || 'B.Tech CSE'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  {cls.studentCount}
                </span>
                <span className="text-[10px] text-slate-400">students</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Tool 4: faculty.getClassStudents
  if (toolName === 'faculty.getClassStudents' && result.students) {
    const students = result.students as any[];
    return (
      <div className="my-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Class Student Roster ({students.length})
          </span>
          <span className="text-[11px] text-slate-500">Class: {result.classId}</span>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {students.slice(0, 15).map((s) => (
            <div
              key={s.uid}
              className="p-2 bg-slate-50/80 rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-800 block">{s.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {s.registerNumber || s.uid}
                </span>
              </div>
              <div className="text-right">
                {s.attendancePercentage !== null && (
                  <span
                    className={`font-semibold ${
                      s.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {s.attendancePercentage}%
                  </span>
                )}
                {s.isClassRep && (
                  <span className="ml-1 text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded">
                    CR
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {students.length > 15 && (
          <div className="mt-2 text-center text-[10px] text-slate-400">
            + {students.length - 15} more students in class roster
          </div>
        )}
      </div>
    );
  }

  // 6. Tool 10 & 9: Timetables (faculty.getTimetable & faculty.getClassTimetable)
  if ((toolName === 'faculty.getTimetable' || toolName === 'faculty.getClassTimetable') && (result.slots || result.timetable)) {
    const slots = (result.slots || result.timetable) as any[];
    return (
      <div className="my-3 space-y-2">
        <div className="text-xs font-semibold text-slate-600 px-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          Schedule Slots ({slots.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {slots.map((s, idx) => (
            <div
              key={s.id || idx}
              className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">{s.subjectName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                  {s.startTime} - {s.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{s.className || `Period ${s.period}`}</span>
                <span>{s.roomNumber || 'Room TBA'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. Tool 11: faculty.getReminders
  if (toolName === 'faculty.getReminders' && result.reminders) {
    const reminders = result.reminders as any[];
    return (
      <div className="my-3 space-y-2">
        <div className="text-xs font-semibold text-slate-600 px-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          Task Reminders ({reminders.length})
        </div>
        <div className="space-y-1.5">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    r.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-300'
                  }`}
                />
                <div>
                  <span
                    className={`text-xs font-medium block ${
                      r.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {r.title}
                  </span>
                  {r.dueDate && (
                    <span className="text-[10px] text-slate-400">
                      Due: {r.dueDate} {r.dueTime ? `at ${r.dueTime}` : ''}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  r.priority === 'HIGH'
                    ? 'bg-rose-100 text-rose-700'
                    : r.priority === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {r.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. Tool 17: faculty.getPerformance
  if (toolName === 'faculty.getPerformance' && result.performances) {
    const performances = result.performances as any[];
    return (
      <div className="my-3 space-y-2">
        <div className="text-xs font-semibold text-slate-600 px-1 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          Subject Performance
        </div>
        <div className="grid grid-cols-1 gap-2">
          {performances.map((p, idx) => (
            <div
              key={p.subjectId || idx}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {p.subjectName} ({p.subjectCode})
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {p.passPercentage}% Pass Rate
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Class: {p.className}</span>
                <span>Average: {p.averageScore}%</span>
                <span>High: {p.highestScore} | Low: {p.lowestScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
