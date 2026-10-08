import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  ClipboardCheck,
  Users,
  GraduationCap,
  ArrowRight,
  RotateCw,
  BookOpen,
  Upload,
  Plus,
  Bell,
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
  CalendarDays,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type {
  TodayRemindersSummary,
  FacultyTimetableSlot,
  FacultyReminder,
  FacultyClassSummary,
  SubjectInfo,
  CreateReminderInput,
} from '../types/faculty.types';
import { TimetableUploadModal } from '../components/TimetableUploadModal';
import { TimetableSlotModal } from '../components/TimetableSlotModal';
import { CreateReminderModal } from '../components/CreateReminderModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PERIOD_LIST = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'];

export const FacultyRemindersPage: React.FC = () => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'today' | 'timetable' | 'reminders'>('today');

  // Main Data States
  const [todayData, setTodayData] = useState<TodayRemindersSummary | null>(null);
  const [timetable, setTimetable] = useState<FacultyTimetableSlot[]>([]);
  const [reminders, setReminders] = useState<FacultyReminder[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<FacultyClassSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

  // UI / Filter States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [reminderFilter, setReminderFilter] = useState<'ALL' | 'CLASS_TEST' | 'ASSIGNMENT' | 'PENDING' | 'COMPLETED'>('ALL');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState<boolean>(false);
  const [slotToEdit, setSlotToEdit] = useState<FacultyTimetableSlot | null>(null);
  const [defaultSlotDay, setDefaultSlotDay] = useState<string>('Monday');
  const [defaultSlotPeriod, setDefaultSlotPeriod] = useState<string>('Period 1');

  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderToEdit, setReminderToEdit] = useState<FacultyReminder | null>(null);

  // Fetch all real faculty data
  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [todayRes, timetableRes, remindersRes, classesRes, subjectsRes] = await Promise.all([
        facultyApi.getTodayReminders().catch(() => null),
        facultyApi.getTimetable().catch(() => []),
        facultyApi.getReminders().catch(() => []),
        facultyApi.getAssignedClasses().catch(() => []),
        facultyApi.getSubjects().catch(() => []),
      ]);

      if (todayRes) setTodayData(todayRes);
      setTimetable(timetableRes || []);
      setReminders(remindersRes || []);
      setAssignedClasses(classesRes || []);
      setSubjects(subjectsRes || []);
    } catch (err) {
      console.error('Failed to load faculty schedule and reminders:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Timetable
  const handleSaveSlot = async (slotData: Partial<FacultyTimetableSlot>) => {
    await facultyApi.saveTimetableSlot(slotData);
    fetchData();
  };

  const handleDeleteSlot = async (slotId: string) => {
    // 1. INSTANT OPTIMISTIC DELETE: Immediately remove from timetable state
    setTimetable((prev) => prev.filter((s) => s.id !== slotId));

    // 2. Also immediately remove from today's schedule if present
    setTodayData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todaySchedule: prev.todaySchedule?.filter((s) => s.id !== slotId) || [],
      };
    });

    // 3. Perform background server deletion
    try {
      await facultyApi.deleteTimetableSlot(slotId);
    } catch (err) {
      console.error('Failed to delete timetable slot on server:', err);
      // Revert/refresh on network failure
      fetchData();
    }
  };

  const handleBulkSaveTimetable = async (slots: Partial<FacultyTimetableSlot>[], replaceExisting: boolean) => {
    await facultyApi.bulkSaveTimetable(slots, replaceExisting);
    fetchData();
  };

  // Handlers for Reminders
  const handleSaveReminder = async (input: CreateReminderInput, id?: string) => {
    if (id) {
      await facultyApi.updateReminder(id, input);
    } else {
      await facultyApi.createReminder(input);
    }
    fetchData();
  };

  const handleDeleteReminder = async (id: string) => {
    // 1. INSTANT OPTIMISTIC DELETE: Immediately remove from reminders state
    setReminders((prev) => prev.filter((r) => r.id !== id));

    // 2. Also remove from today's active deliverables list
    setTodayData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reminders: prev.reminders?.filter((r) => r.id !== id) || [],
      };
    });

    // 3. Perform background server deletion
    try {
      await facultyApi.deleteReminder(id);
    } catch (err) {
      console.error('Failed to delete reminder on server:', err);
      fetchData();
    }
  };

  const handleToggleReminderStatus = async (id: string) => {
    // Optimistic UI update
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : r
      )
    );
    try {
      await facultyApi.toggleReminderStatus(id);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle reminder status:', err);
      fetchData();
    }
  };

  // Quick Open Modal Helpers
  const openNewSlotModal = (day: string = 'Monday', period: string = 'Period 1') => {
    setSlotToEdit(null);
    setDefaultSlotDay(day);
    setDefaultSlotPeriod(period);
    setIsSlotModalOpen(true);
  };

  const openEditSlotModal = (slot: FacultyTimetableSlot) => {
    setSlotToEdit(slot);
    setIsSlotModalOpen(true);
  };

  const openNewReminderModal = () => {
    setReminderToEdit(null);
    setIsReminderModalOpen(true);
  };

  const openEditReminderModal = (reminder: FacultyReminder) => {
    setReminderToEdit(reminder);
    setIsReminderModalOpen(true);
  };

  // Sample Template Download
  const downloadSampleTemplate = () => {
    const csvContent = `Day,Period,Start Time,End Time,Class,Subject,Room
Monday,Period 1,09:00 AM,09:50 AM,B.sc AI & ML - Year III (Sec A),Machine Learning Techniques,Room 301
Monday,Period 2,10:00 AM,10:50 AM,B.sc AI & ML - Year III (Sec A),Deep Learning Architectures,Lab 2
Tuesday,Period 3,11:10 AM,12:00 PM,B.sc AI & ML - Year III (Sec A),Natural Language Processing,Room 302
Wednesday,Period 1,09:00 AM,09:50 AM,B.sc AI & ML - Year III (Sec A),Computer Vision & Robotics,Lab 1
Thursday,Period 4,12:00 PM,12:50 PM,B.sc AI & ML - Year III (Sec A),AI Ethics and Governance,Room 301
Friday,Period 5,01:45 PM,02:35 PM,B.sc AI & ML - Year III (Sec A),Applied Machine Learning Lab,Lab 2
Saturday,Period 2,10:00 AM,10:50 AM,B.sc AI & ML - Year III (Sec A),Machine Learning Techniques,Room 301`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'faculty_timetable_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics Calculations
  const todayClasses = todayData?.classes || [];
  const totalClassesToday = todayClasses.length;
  const pendingAttendance = todayData?.pendingAttendanceCount || 0;
  const pendingRemindersCount = reminders.filter((r) => r.status === 'PENDING').length;
  const totalEnrolled = todayClasses.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  // Filtered Reminders
  const filteredReminders = reminders.filter((r) => {
    if (reminderFilter === 'CLASS_TEST') return r.type === 'CLASS_TEST';
    if (reminderFilter === 'ASSIGNMENT') return r.type === 'ASSIGNMENT';
    if (reminderFilter === 'PENDING') return r.status === 'PENDING';
    if (reminderFilter === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  // Filtered Timetable Slots for list view
  const filteredTimetableSlots = timetable.filter((slot) => {
    if (selectedDayFilter === 'all') return true;
    return slot.day_of_week.toLowerCase() === selectedDayFilter.toLowerCase();
  });

  return (
    <div className="space-y-4">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Faculty Schedule & Daily Reminders
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Live timetable period management, session attendance, class tests, and pending assignments.
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="relative z-10 flex items-center flex-wrap gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{todayData?.date || 'Today'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Timetable</span>
          </button>

          <button
            type="button"
            onClick={openNewReminderModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reminder</span>
          </button>

          <button
            type="button"
            onClick={() => fetchData(true)}
            title="Refresh schedule & reminders"
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 py-1 rounded-lg shadow-2xs">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'today'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today's Schedule & Reminders</span>
            {totalClassesToday > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-800 font-bold">
                {totalClassesToday}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'timetable'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Weekly Timetable</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-bold">
              {timetable.length} Slots
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'reminders'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>All Reminders</span>
            {pendingRemindersCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                {pendingRemindersCount} Active
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {activeTab === 'timetable' && (
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample .CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S SCHEDULE & REMINDERS */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Classes Scheduled Today */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Classes Scheduled Today
              </p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{totalClassesToday}</h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                {totalClassesToday > 0 ? 'Periods in timetable' : 'No periods today'}
              </p>
            </div>

            {/* Attendance To Mark */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Attendance To Mark
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className={`text-lg font-bold ${pendingAttendance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {pendingAttendance}
                </h3>
                {pendingAttendance > 0 ? (
                  <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Action Due
                  </span>
                ) : (
                  <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Up To Date
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Today's period rosters</p>
            </div>

            {/* Pending Reminders / Tests */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Active Tests & Reminders
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className={`text-lg font-bold ${pendingRemindersCount > 0 ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {pendingRemindersCount}
                </h3>
                <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Deliverables
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Class tests & assignments</p>
            </div>

            {/* Students Enrolled */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Students Enrolled
              </p>
              <h3 className="text-lg font-bold text-blue-600 mt-0.5">{totalEnrolled}</h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Under your instruction</p>
            </div>
          </div>

          {/* Today's Active Reminders Alert Box (if any) */}
          {reminders.filter((r) => r.status === 'PENDING').length > 0 && (
            <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200 rounded-xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Today's Actionable Reminders & Deliverables
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reminders')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {reminders
                  .filter((r) => r.status === 'PENDING')
                  .slice(0, 3)
                  .map((rem) => (
                    <div
                      key={rem.id}
                      className="bg-white/90 border border-amber-200/80 rounded-lg p-2.5 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleReminderStatus(rem.id)}
                          className="text-slate-400 hover:text-emerald-600 mt-0.5 transition-colors"
                          title="Mark complete"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 leading-tight">{rem.title}</p>
                          <p className="text-[10.5px] text-slate-500">
                            {rem.class_name ? `${rem.class_name} • ` : ''}
                            {rem.due_date ? `Due: ${rem.due_date}` : 'Today'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          rem.type === 'CLASS_TEST'
                            ? 'bg-purple-100 text-purple-700'
                            : rem.type === 'ASSIGNMENT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {rem.type === 'CLASS_TEST' ? 'Class Test' : rem.type === 'ASSIGNMENT' ? 'Assignment' : 'Notice'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Today's Schedule List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 h-32 animate-pulse" />
              ))}
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Classes Scheduled For Today ({todayData?.date || 'Today'})</h3>
                <p className="text-xs text-slate-500">
                  You don't have any periods or classes assigned for instruction today. You can build your weekly timetable or upload an Excel/CSV file to automate your schedule.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Timetable (.xlsx / .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timetable')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Manage Weekly Timetable</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls, idx) => {
                const isAttendancePending = cls.attendance.status === 'PENDING';

                return (
                  <div
                    key={`${cls.classId}-${idx}`}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3.5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">{cls.className}</h3>
                          {cls.semester && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Semester {cls.semester}
                            </span>
                          )}
                          {cls.isClassIncharge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Class Incharge
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 pl-9">
                          Program / Subject: <span className="text-slate-700 font-medium">{cls.program || 'N/A'}</span> • Batch:{' '}
                          <span className="text-slate-700 font-medium">{cls.batch || 'Current'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{cls.studentCount} Students Enrolled</span>
                      </div>
                    </div>

                    {/* Actionable Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Attendance Card */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded ${
                                isAttendancePending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {cls.attendance.period} Attendance
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                {isAttendancePending
                                  ? "Today's roll call is pending recording"
                                  : 'Session recorded and synchronized'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isAttendancePending
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isAttendancePending ? 'Needs Marking' : 'Completed'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-[10.5px] text-slate-400">
                            {cls.attendance.lastMarkedAt
                              ? `Recorded: ${new Date(cls.attendance.lastMarkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : 'Status: Pending'}
                          </span>
                          <Link
                            to={cls.actions.attendanceUrl}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold shadow-2xs transition-colors ${
                              isAttendancePending
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>{isAttendancePending ? 'Mark Attendance' : 'Review Attendance'}</span>
                          </Link>
                        </div>
                      </div>

                      {/* Marks / Subject Schedule Card */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-purple-100 text-purple-700">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {cls.marks.title}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                {cls.marks.deadline || 'Scheduled Session'}
                              </p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                            Active Period
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-[10.5px] text-slate-400">
                            Semester {cls.semester || 'N/A'} Curriculum
                          </span>
                          <Link
                            to={cls.actions.classDetailsUrl}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
                          >
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Class Details & Marks</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Quick Links */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <Link
                          to={cls.actions.studentsUrl}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Class Roster ({cls.studentCount} Students)</span>
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link
                          to={`/faculty/attendance?classId=${cls.classId}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Attendance Stats</span>
                        </Link>
                      </div>

                      <Link
                        to={cls.actions.classDetailsUrl}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        <span>Full Class Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEEKLY TIMETABLE MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Timetable Sub-Header & Controls */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Filter Day:</span>
              <button
                type="button"
                onClick={() => setSelectedDayFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedDayFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Days
              </button>
              {DAYS.slice(0, 6).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedDayFilter.toLowerCase() === d.toLowerCase()
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openNewSlotModal('Monday', 'Period 1')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Timetable Weekly Matrix Grid - Always Show Grid with Empty Assignable Slots */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Weekly Master Schedule Matrix</span>
                {timetable.length === 0 && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                    All Slots Empty • Click "+ Assign" on any period or upload file
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Total Active Slots: <span className="font-bold text-slate-800">{timetable.length}</span>
              </span>
            </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                      <th className="py-2.5 px-3 w-28 border-r border-slate-200">Day</th>
                      {PERIOD_LIST.map((p) => (
                        <th key={p} className="py-2.5 px-3 min-w-[130px] border-r border-slate-200 text-center">
                          {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DAYS.slice(0, 6)
                      .filter((d) => selectedDayFilter === 'all' || d.toLowerCase() === selectedDayFilter.toLowerCase())
                      .map((d) => {
                        const daySlots = timetable.filter(
                          (s) => s.day_of_week.toLowerCase() === d.toLowerCase()
                        );

                        return (
                          <tr key={d} className="hover:bg-slate-50/50 transition-colors">
                            {/* Day Header */}
                            <td className="py-3 px-3 font-bold text-slate-800 bg-slate-50/60 border-r border-slate-200 align-top">
                              <span className="block text-xs">{d}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {daySlots.length} period{daySlots.length === 1 ? '' : 's'}
                              </span>
                            </td>

                            {/* Periods */}
                            {PERIOD_LIST.map((p) => {
                              const slot = daySlots.find((s) => s.period.toLowerCase() === p.toLowerCase());

                              return (
                                <td
                                  key={p}
                                  className="py-2 px-2 border-r border-slate-200 align-top h-24 min-w-[140px]"
                                >
                                  {slot ? (
                                    <div className="bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/90 rounded-lg p-2 h-full flex flex-col justify-between transition-colors group relative">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9.5px] font-bold text-blue-700 uppercase tracking-tight">
                                            {slot.start_time ? `${slot.start_time}` : slot.period}
                                          </span>
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openEditSlotModal(slot);
                                              }}
                                              className="p-0.5 text-blue-600 hover:text-blue-800 transition-colors"
                                              title="Edit slot"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (slot.id) handleDeleteSlot(slot.id);
                                              }}
                                              className="p-0.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                              title="Delete slot"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                          {slot.subject_name}
                                        </p>
                                        <p className="text-[10.5px] text-slate-600 line-clamp-1 font-medium">
                                          {slot.class_name}
                                        </p>
                                      </div>

                                      {slot.room && (
                                        <div className="pt-1 mt-1 border-t border-blue-200/50 text-[10px] text-blue-700 font-medium">
                                          📍 {slot.room}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => openNewSlotModal(d, p)}
                                      className="h-full border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                      <span className="text-[9px] text-slate-400 group-hover:text-blue-600 mt-0.5">
                                        Assign
                                      </span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Day View Slot Cards (when specific day or mobile) */}
              {selectedDayFilter !== 'all' && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      {selectedDayFilter} Detailed Schedule ({filteredTimetableSlots.length} Periods)
                    </h4>
                    <button
                      type="button"
                      onClick={() => openNewSlotModal(selectedDayFilter, `Period ${filteredTimetableSlots.length + 1}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slot for {selectedDayFilter}</span>
                    </button>
                  </div>

                  {filteredTimetableSlots.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No periods scheduled for {selectedDayFilter}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {filteredTimetableSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {slot.period}
                              </span>
                              {slot.start_time && (
                                <span className="text-[10.5px] text-slate-500 font-medium">
                                  {slot.start_time} {slot.end_time ? `- ${slot.end_time}` : ''}
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-slate-900">{slot.subject_name}</h5>
                            <p className="text-[11px] text-slate-600">{slot.class_name}</p>
                            {slot.room && (
                              <p className="text-[10.5px] text-blue-700 font-medium">📍 {slot.room}</p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            {slot.class_id ? (
                              <Link
                                to={`/faculty/attendance?classId=${slot.class_id}&period=${encodeURIComponent(slot.period)}`}
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                              >
                                Mark Attendance →
                              </Link>
                            ) : (
                              <span className="text-slate-400 text-[10.5px]">General Slot</span>
                            )}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSlotModal(slot);
                                }}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (slot.id) handleDeleteSlot(slot.id);
                                }}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL FACULTY REMINDERS */}
      {/* ========================================================================= */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {/* Sub Header & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setReminderFilter('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  reminderFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                All Reminders ({reminders.length})
              </button>
              <button
                type="button"
                onClick={() => setReminderFilter('CLASS_TEST')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  reminderFilter === 'CLASS_TEST'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Class Tests ({reminders.filter((r) => r.type === 'CLASS_TEST').length})
              </button>
              <button
                type="button"
                onClick={() => setReminderFilter('ASSIGNMENT')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  reminderFilter === 'ASSIGNMENT'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Assignments ({reminders.filter((r) => r.type === 'ASSIGNMENT').length})
              </button>
              <button
                type="button"
                onClick={() => setReminderFilter('PENDING')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  reminderFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({reminders.filter((r) => r.status === 'PENDING').length})
              </button>
              <button
                type="button"
                onClick={() => setReminderFilter('COMPLETED')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  reminderFilter === 'COMPLETED'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({reminders.filter((r) => r.status === 'COMPLETED').length})
              </button>
            </div>

            <button
              type="button"
              onClick={openNewReminderModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Reminder</span>
            </button>
          </div>

          {/* Reminders List */}
          {filteredReminders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Reminders Found</h3>
                <p className="text-xs text-slate-500">
                  {reminderFilter !== 'ALL'
                    ? 'No reminders match your selected filter.'
                    : 'Create your first reminder for class tests, pending assignments, or academic notifications.'}
                </p>
              </div>
              <button
                type="button"
                onClick={openNewReminderModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Reminder</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredReminders.map((rem) => {
                const isCompleted = rem.status === 'COMPLETED';

                return (
                  <div
                    key={rem.id}
                    className={`bg-white border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between gap-3 ${
                      isCompleted ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rem.type === 'CLASS_TEST'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : rem.type === 'ASSIGNMENT'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : rem.type === 'ATTENDANCE'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {rem.type === 'CLASS_TEST'
                              ? 'Class Test'
                              : rem.type === 'ASSIGNMENT'
                              ? 'Assignment Pending'
                              : rem.type === 'ATTENDANCE'
                              ? 'Attendance'
                              : 'General Notice'}
                          </span>

                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                              rem.priority === 'HIGH'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : rem.priority === 'MEDIUM'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rem.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditReminderModal(rem)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit reminder"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReminder(rem.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete reminder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Checkbox */}
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleReminderStatus(rem.id)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold leading-tight ${
                              isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {rem.title}
                          </h4>
                          {rem.description && (
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {rem.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rem.class_name && (
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            {rem.class_name}
                          </span>
                        )}
                        {rem.subject_name && (
                          <span className="text-slate-600">
                            • {rem.subject_name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{rem.due_date ? rem.due_date.split('T')[0] : 'Today'}</span>
                        {rem.due_time && <span>({rem.due_time})</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* Upload Timetable Excel / CSV Modal */}
      <TimetableUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setActiveTab('timetable');
          fetchData();
        }}
        onSaveBulk={handleBulkSaveTimetable}
        assignedClasses={assignedClasses.map((c) => ({ id: c.id, name: c.name }))}
      />

      {/* Add / Edit Timetable Slot Modal */}
      <TimetableSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
        slotToEdit={slotToEdit}
        defaultDay={defaultSlotDay}
        defaultPeriod={defaultSlotPeriod}
        assignedClasses={assignedClasses.map((c) => ({ id: c.id, name: c.name }))}
        availableSubjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
      />

      {/* Create / Edit Reminder Modal */}
      <CreateReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
        reminderToEdit={reminderToEdit}
        assignedClasses={assignedClasses.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
};

export default FacultyRemindersPage;
