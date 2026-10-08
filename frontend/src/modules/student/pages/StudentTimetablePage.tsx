import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';
import type { ClassTimetableSlot } from '../types/student.types';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type DayName = typeof DAYS_OF_WEEK[number];

const STANDARD_PERIODS = [
  { id: '1', label: 'Period 1', time: '08:45 AM - 09:45 AM' },
  { id: '2', label: 'Period 2', time: '09:45 AM - 10:45 AM' },
  { id: 'recess', label: 'Recess Break', time: '10:45 AM - 11:00 AM', isBreak: true },
  { id: '3', label: 'Period 3', time: '11:00 AM - 12:00 PM' },
  { id: '4', label: 'Period 4', time: '12:00 PM - 12:45 PM' },
  { id: 'lunch', label: 'Lunch Break', time: '12:45 PM - 01:45 PM', isBreak: true },
  { id: '5', label: 'Period 5', time: '01:45 PM - 02:45 PM' },
  { id: '6', label: 'Period 6', time: '02:45 PM - 03:45 PM' },
  { id: '7', label: 'Period 7', time: '03:45 PM - 04:30 PM' },
];

export const StudentTimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    timetable,
    classData,
    classIncharge,
    loading,
    errors,
    loadTimetable,
    loadClass,
    loadClassIncharge,
  } = useStudent();

  // Get current weekday or default to Monday
  const getTodayDayName = (): DayName => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS_OF_WEEK.includes(today as DayName)) {
      return today as DayName;
    }
    return 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState<DayName>(getTodayDayName);
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');

  useEffect(() => {
    loadTimetable();
    loadClass();
    loadClassIncharge();
  }, [loadTimetable, loadClass, loadClassIncharge]);

  // Extract period number from slot string (e.g. "Period 1" -> "1", "1" -> "1")
  const normalizePeriodId = (periodStr: string): string => {
    const match = periodStr.match(/\d+/);
    return match ? match[0] : periodStr.trim();
  };

  // Group timetable slots by day
  const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = timetable.filter(
      (s) => s.day_of_week?.toLowerCase() === day.toLowerCase()
    );
    return acc;
  }, {} as Record<DayName, ClassTimetableSlot[]>);

  const currentDaySlots = slotsByDay[selectedDay] || [];
  const totalSlotsCount = timetable.length;

  const handlePrint = () => {
    window.print();
  };

  if (loading.timetable && timetable.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 bg-slate-200 w-72 rounded animate-pulse" />
        <div className="h-28 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider rounded">
              TIME TABLE
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              WEEKLY MASTER SCHEDULE
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              FED BY CLASS INCHARGE
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Class Time Table
          </h1>

          <p className="text-sm text-slate-500">
            Weekly instructional schedule configured and maintained by your Class Incharge for{' '}
            <strong className="text-slate-800 font-semibold">{classData?.name || 'Assigned Class'}</strong>.
          </p>
        </div>

        {/* View Switcher & Print Buttons */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[1.1rem]">grid_view</span>
              <span>Weekly Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[1.1rem]">view_day</span>
              <span>Day-by-Day</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 shadow-2xs transition-colors"
            type="button"
            title="Print Time Table"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-slate-600">print</span>
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {errors.timetable && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[1.25rem]">error</span>
          <span>{errors.timetable}</span>
        </div>
      )}

      {/* ─── Class Incharge & Metadata Strip ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Class Section */}
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ENROLLED SECTION
          </span>
          <span className="text-base font-bold text-slate-900 mt-1">
            {classData?.name || 'Class Assigned'}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">
            Term {classData?.currentSemester || '—'} · Regular Cohort
          </span>
        </div>

        {/* Metric 2: Class Incharge */}
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            CLASS INCHARGE FACULTY
          </span>
          <span className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1.1rem] text-blue-600">person</span>
            <span>{classIncharge?.name || classData?.classIncharge?.name || 'Class Incharge Assigned'}</span>
          </span>
          <span className="text-xs text-slate-500 mt-0.5 truncate">
            {classIncharge?.email || 'Awaiting schedule broadcast'}
          </span>
        </div>

        {/* Metric 3: Total Scheduled Periods */}
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            WEEKLY INSTRUCTIONAL LOAD
          </span>
          <span className="text-base font-bold text-slate-900 mt-1 font-mono">
            {totalSlotsCount} Periods
          </span>
          <span className="text-xs text-slate-500 mt-0.5">
            {totalSlotsCount > 0 ? 'Active timetable slots in session' : '0 slots fed for this week'}
          </span>
        </div>

        {/* Metric 4: Instructional Venue */}
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            CLASSROOM / VENUE
          </span>
          <span className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[1.1rem] text-slate-400">meeting_room</span>
            <span>Department Wing</span>
          </span>
          <span className="text-xs text-slate-500 mt-0.5">
            Academic Schedule Mon – Fri
          </span>
        </div>
      </div>

      {/* ─── When 0 Periods Fed By Class Incharge ─── */}
      {totalSlotsCount === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[2.75rem]">calendar_month</span>
          </div>

          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-900">
              No Weekly Time Table Provided Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Your Class Incharge (
              <strong className="text-slate-800">
                {classIncharge?.name || classData?.classIncharge?.name || 'Class Incharge'}
              </strong>
              ) has not yet published the weekly period schedule for{' '}
              <strong className="text-slate-800">{classData?.name || 'your class'}</strong>.
              Once the class incharge feeds the timetable in the Faculty Portal, the full matrix and daily periods will appear here automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Status: Awaiting Class Incharge Schedule Entry</span>
            </div>
            <button
              onClick={() => navigate('/student/class-incharge')}
              className="px-3 py-1.5 bg-[#0b1727] hover:bg-[#13243c] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem]">supervisor_account</span>
              <span>Contact Class Incharge</span>
            </button>
          </div>

          {/* Standard Academic Bell Schedule Reference */}
          <div className="mt-8 pt-6 border-t border-slate-100 w-full max-w-2xl">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Standard Institute Period Timing Reference
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-left">
              {STANDARD_PERIODS.filter((p) => !p.isBreak).map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-800">{p.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─── When Periods ARE Fed by Class Incharge ─── */
        <>
          {viewMode === 'grid' ? (
            /* 1. WEEKLY MATRIX VIEW */
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[1.25rem]">grid_on</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Weekly Timetable Matrix ({totalSlotsCount} Active Slots)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Instructional hours: 08:45 AM – 04:30 PM
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-28 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                        Day / Time
                      </th>
                      {STANDARD_PERIODS.map((col) => (
                        <th
                          key={col.id}
                          className={`py-3 px-3 text-center border-r border-slate-200 min-w-[130px] ${
                            col.isBreak ? 'bg-amber-50/60 text-amber-800 font-semibold' : ''
                          }`}
                        >
                          <div>{col.label}</div>
                          <div className="text-[10px] font-mono text-slate-500 font-normal lowercase tracking-normal">
                            {col.time}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {DAYS_OF_WEEK.map((day) => {
                      const daySlots = slotsByDay[day];
                      const isToday = day.toLowerCase() === getTodayDayName().toLowerCase();

                      return (
                        <tr key={day} className={`hover:bg-slate-50/70 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                          {/* Day Column */}
                          <td className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 z-10">
                            <div className="flex items-center gap-1.5">
                              {isToday && (
                                <span className="w-2 h-2 rounded-full bg-blue-600" title="Today"></span>
                              )}
                              <span>{day}</span>
                            </div>
                            <span className="text-[10px] font-normal text-slate-400">
                              {daySlots.length} periods
                            </span>
                          </td>

                          {/* Period Columns */}
                          {STANDARD_PERIODS.map((col) => {
                            if (col.isBreak) {
                              return (
                                <td
                                  key={col.id}
                                  className="py-3 px-2 text-center bg-amber-50/30 text-amber-700 font-semibold text-[10px] uppercase border-r border-slate-200 tracking-wider writing-mode-vertical"
                                >
                                  {col.label}
                                </td>
                              );
                            }

                            // Match slot for this day and period
                            const slot = daySlots.find(
                              (s) => normalizePeriodId(s.period) === col.id
                            );

                            if (!slot) {
                              return (
                                <td
                                  key={col.id}
                                  className="py-3 px-3 text-center text-slate-300 font-mono border-r border-slate-200"
                                >
                                  —
                                </td>
                              );
                            }

                            return (
                              <td
                                key={col.id}
                                className="py-2.5 px-3 border-r border-slate-200 bg-white hover:bg-blue-50/40 transition-colors"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold text-[10px] rounded">
                                      {slot.subject_code || 'SUB'}
                                    </span>
                                    {slot.room && (
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        {slot.room}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-semibold text-slate-900 line-clamp-2 text-xs leading-tight">
                                    {slot.subject_name}
                                  </div>
                                  {slot.faculty_name && (
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[0.8rem] text-slate-400">person</span>
                                      <span>{slot.faculty_name}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* 2. DAY-BY-DAY VIEW */
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
              {/* Day Selector Tabs */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const count = slotsByDay[day]?.length || 0;
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        type="button"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0b1727] text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500">
                  Showing <strong>{currentDaySlots.length}</strong> periods for{' '}
                  <strong className="text-slate-800">{selectedDay}</strong>
                </div>
              </div>

              {/* Day Period List */}
              <div className="p-6 divide-y divide-slate-100 flex flex-col">
                {currentDaySlots.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[2.5rem]">event_busy</span>
                    <p className="text-sm font-medium">No instructional periods scheduled for {selectedDay}.</p>
                    <p className="text-xs text-slate-400">Class Incharge has marked this day as self-study / holiday.</p>
                  </div>
                ) : (
                  currentDaySlots.map((slot, index) => {
                    const periodNum = normalizePeriodId(slot.period);
                    const periodTime =
                      slot.start_time && slot.end_time
                        ? `${slot.start_time} - ${slot.end_time}`
                        : STANDARD_PERIODS.find((p) => p.id === periodNum)?.time || '08:45 AM - 09:45 AM';

                    return (
                      <div
                        key={slot.id || index}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-lg transition-colors"
                      >
                        {/* Left: Period Badge & Time */}
                        <div className="flex items-center gap-3.5 min-w-[200px]">
                          <div className="w-11 h-11 bg-[#0b1727] text-white rounded-lg flex flex-col items-center justify-center font-mono shrink-0 shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">P</span>
                            <span className="text-base font-extrabold leading-none">{periodNum}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 font-mono">
                              {periodTime}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {slot.period.startsWith('Period') ? slot.period : `Period ${slot.period}`}
                            </span>
                          </div>
                        </div>

                        {/* Center: Course & Faculty Details */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            {slot.subject_code && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded">
                                {slot.subject_code}
                              </span>
                            )}
                            <h4 className="text-sm font-bold text-slate-900">
                              {slot.subject_name}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                            {slot.faculty_name && (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[0.95rem] text-slate-400">person</span>
                                <span>{slot.faculty_name}</span>
                              </span>
                            )}
                            {slot.room && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[0.95rem] text-slate-400">location_on</span>
                                  <span>{slot.room}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: Badge */}
                        <div className="flex items-center justify-end">
                          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>Scheduled</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
