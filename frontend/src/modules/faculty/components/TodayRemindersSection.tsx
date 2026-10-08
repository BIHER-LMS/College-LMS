import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  ArrowRight,
  FileText,
  RotateCw,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { TodayRemindersSummary } from '../types/faculty.types';

export const TodayRemindersSection: React.FC = () => {
  const [data, setData] = useState<TodayRemindersSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchReminders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const summary = await facultyApi.getTodayReminders();
      setData(summary);
    } catch (err) {
      console.error('Failed to load today reminders:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded w-28 animate-pulse" />
        </div>
        <div className="space-y-2.5">
          <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data || data.classes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Today's Schedule & Reminders</h3>
              <p className="text-[11px] text-slate-500">No classes assigned for instruction today.</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">{data?.date}</span>
        </div>
      </div>
    );
  }

  const totalPending = data.pendingAttendanceCount + data.pendingMarksCount;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">Today's Schedule & Daily Reminders</h3>
              {totalPending > 0 ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {totalPending} Action Item{totalPending > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All Up to Date
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Active classes, period attendance status, and academic submissions for today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {data.date}
          </span>
          <button
            type="button"
            onClick={() => fetchReminders(true)}
            title="Refresh daily reminders"
            disabled={refreshing}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Class Reminders List */}
      <div className="space-y-3">
        {data.classes.map((cls) => {
          const isAttendancePending = cls.attendance.status === 'PENDING';
          const isMarksPending = cls.marks.status === 'PENDING';

          return (
            <div
              key={cls.classId}
              className="bg-slate-50/70 border border-slate-200/90 rounded-lg p-3 hover:border-slate-300 transition-all"
            >
              {/* Class Header Line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-slate-200/70">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-900">{cls.className}</h4>
                  </div>
                  {cls.semester && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Semester {cls.semester}
                    </span>
                  )}
                  {cls.isClassIncharge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Class Incharge
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cls.studentCount} Students Enrolled</span>
                </div>
              </div>

              {/* Pending Action Items for This Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2.5">
                {/* 1. Daily Attendance Item */}
                <div className="bg-white border border-slate-200 rounded-md p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-800">
                        {cls.attendance.period} Attendance
                      </span>
                      {isAttendancePending ? (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Marked
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 truncate">
                      {isAttendancePending
                        ? 'Session roster needs attendance recording'
                        : 'Attendance session recorded & submitted'}
                    </p>
                  </div>

                  <Link
                    to={cls.actions.attendanceUrl}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold shadow-2xs transition-colors shrink-0 ${
                      isAttendancePending
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>{isAttendancePending ? 'Mark Now' : 'Review'}</span>
                  </Link>
                </div>

                {/* 2. Marks / Internal Assessment Item */}
                <div className="bg-white border border-slate-200 rounded-md p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-800">
                        Marks & Assessments
                      </span>
                      {isMarksPending ? (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Action Due
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 truncate">
                      {cls.marks.title}
                    </p>
                  </div>

                  <Link
                    to={cls.actions.classDetailsUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Manage Marks</span>
                  </Link>
                </div>
              </div>

              {/* Quick Jump Links Footer */}
              <div className="flex items-center justify-between pt-2 mt-2 text-[11px] border-t border-slate-200/50">
                <span className="text-slate-400">
                  Batch: {cls.batch || 'Current'} • {cls.program || 'Undergraduate'}
                </span>
                <Link
                  to={cls.actions.studentsUrl}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <span>View Student Roster</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayRemindersSection;
