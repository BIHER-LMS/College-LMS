import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Save,
  Search,
  Loader2,
  Clock,
  XCircle,
  HeartPulse,
  Users,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Lock,
  Check,
  X,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import { useFaculty } from '../hooks/useFaculty';
import { auth } from '../../../config/firebase';
import { leaveService } from '../../../services/leaveService';
import type {
  StudentLeave,
  LeaveReasonCategory,
} from '../../../services/leaveService';
import type {
  AttendanceStatusType,
  StudentAttendanceRecord,
  AttendanceSessionSummary,
  ClassAttendanceStatsResponse,
} from '../types/faculty.types';

export const FacultyAttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlClassId = searchParams.get('classId');
  const urlTab = searchParams.get('tab');

  const { classes, subjects, dashboard, loadClasses, loadSubjects } = useFaculty();

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Period 1');
  const [sessionRemarks, setSessionRemarks] = useState<string>('');

  // Active view tab: 'mark' | 'stats' | 'history' | 'leaves'
  const [activeTab, setActiveTab] = useState<'mark' | 'stats' | 'history' | 'leaves'>(
    urlTab === 'leaves' ? 'leaves' : 'mark'
  );

  // Attendance Records State
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSessionIncharge, setIsSessionIncharge] = useState(false);

  // Class Leaves State
  const [classLeaves, setClassLeaves] = useState<StudentLeave[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leavesFilter, setLeavesFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [leavesSearch, setLeavesSearch] = useState('');

  // Review Modal State
  const [reviewModalLeave, setReviewModalLeave] = useState<StudentLeave | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Stats State
  const [stats, setStats] = useState<ClassAttendanceStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsSearch, setStatsSearch] = useState('');
  const [onlyShortage, setOnlyShortage] = useState(false);

  // History State
  const [history, setHistory] = useState<AttendanceSessionSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Client-side cache for instant period/date switching
  const sessionCacheRef = useRef<Map<string, any>>(new Map());

  // Initial Load
  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  // Set default class
  useEffect(() => {
    if (classes.length > 0) {
      if (urlClassId && classes.some((c) => c.id === urlClassId)) {
        setSelectedClassId(urlClassId);
      } else if (!selectedClassId) {
        setSelectedClassId(classes[0].id);
      }
    }
  }, [classes, urlClassId]);

  // Load Session Records when class, date, or period changes
  useEffect(() => {
    if (selectedClassId && selectedDate && selectedPeriod && activeTab === 'mark') {
      loadSession();
    }
  }, [selectedClassId, selectedDate, selectedPeriod, activeTab]);

  // Load Leaves when selected class changes or leaves tab is active
  useEffect(() => {
    if (selectedClassId) {
      loadClassLeaves();
    }
  }, [selectedClassId, activeTab]);

  // Load Stats when stats tab selected
  useEffect(() => {
    if (selectedClassId && activeTab === 'stats') {
      loadClassStats();
    }
  }, [selectedClassId, activeTab]);

  // Load History when history tab selected
  useEffect(() => {
    if (selectedClassId && activeTab === 'history') {
      loadClassHistory();
    }
  }, [selectedClassId, activeTab]);

  const loadClassLeaves = async () => {
    if (!selectedClassId) return;
    setLoadingLeaves(true);
    try {
      const leaves = await leaveService.getClassLeaves(selectedClassId);
      setClassLeaves(leaves);
    } catch (err) {
      console.error('Failed to load class leaves:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const loadSession = async () => {
    if (!selectedClassId) return;
    const cacheKey = `${selectedClassId}_${selectedDate}_${selectedPeriod}`;
    const cached = sessionCacheRef.current.get(cacheKey);

    if (cached) {
      setRecords(cached.records);
      setSessionRemarks(cached.remarks || '');
      setIsSessionIncharge(Boolean(cached.isClassIncharge));
      if (cached.subjectId) {
        setSelectedSubjectId(cached.subjectId);
      }
    } else {
      setLoadingSession(true);
    }

    setSaveSuccess(false);
    try {
      const data = await facultyApi.getAttendanceSession(
        selectedClassId,
        selectedDate,
        selectedPeriod
      );
      sessionCacheRef.current.set(cacheKey, data);
      setRecords(data.records);
      setSessionRemarks(data.remarks || '');
      setIsSessionIncharge(Boolean(data.isClassIncharge));
      if (data.subjectId) {
        setSelectedSubjectId(data.subjectId);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  const loadClassStats = async () => {
    if (!selectedClassId) return;
    setLoadingStats(true);
    try {
      const data = await facultyApi.getClassAttendanceStats(selectedClassId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadClassHistory = async () => {
    if (!selectedClassId) return;
    setLoadingHistory(true);
    try {
      const data = await facultyApi.getClassAttendanceHistory(selectedClassId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Status updates
  const handleStatusChange = (studentUid: string, status: AttendanceStatusType) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentUid === studentUid ? { ...r, status } : r))
    );
    setSaveSuccess(false);
  };

  const handleRemarkChange = (studentUid: string, remarks: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentUid === studentUid ? { ...r, remarks } : r))
    );
  };

  // Bulk status updates
  const markAll = (status: AttendanceStatusType) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
    setSaveSuccess(false);
  };

  // Save session
  const handleSaveAttendance = async () => {
    if (!selectedClassId || records.length === 0) return;
    setSavingSession(true);
    setSaveSuccess(false);
    try {
      await facultyApi.saveAttendanceSession({
        classId: selectedClassId,
        subjectId: selectedSubjectId || undefined,
        date: selectedDate,
        period: selectedPeriod,
        remarks: sessionRemarks,
        records: records.map((r) => ({
          studentUid: r.studentUid,
          status: r.status,
          remarks: r.remarks,
        })),
      });

      const cacheKey = `${selectedClassId}_${selectedDate}_${selectedPeriod}`;
      sessionCacheRef.current.set(cacheKey, {
        classId: selectedClassId,
        subjectId: selectedSubjectId || undefined,
        date: selectedDate,
        period: selectedPeriod,
        remarks: sessionRemarks,
        records: [...records],
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      alert('Failed to save attendance records. Please try again.');
    } finally {
      setSavingSession(false);
    }
  };

  // Computed summary counts
  const totalStudents = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const currentFacultyUid = auth.currentUser?.uid || dashboard?.faculty?.uid;

  const isClassIncharge = Boolean(
    isSessionIncharge ||
    (currentClass?.inchargeFaculty?.uid && currentFacultyUid && currentClass.inchargeFaculty.uid === currentFacultyUid) ||
    (dashboard?.classIncharge?.isAssigned && dashboard?.classIncharge?.class?.id === selectedClassId)
  );

  const inchargeName =
    currentClass?.inchargeFaculty?.name ||
    (dashboard?.classIncharge?.class?.id === selectedClassId
      ? dashboard?.faculty?.name || 'Class Incharge'
      : currentClass?.inchargeFaculty?.name || 'Class Incharge');

  const pendingLeavesCount = classLeaves.filter((l) => l.status === 'PENDING').length;

  const getCategoryInfo = (category: LeaveReasonCategory) => {
    switch (category) {
      case 'HEALTH':
        return {
          label: 'Health Condition',
          icon: HeartPulse,
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'FAMILY':
        return {
          label: 'Family / Personal',
          icon: Users,
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'ACADEMIC':
        return {
          label: 'Academic OD',
          icon: BookOpen,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'OTHER':
      default:
        return {
          label: 'Other Reason',
          icon: HelpCircle,
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const handleOpenReview = (leave: StudentLeave, action: 'APPROVED' | 'REJECTED') => {
    setReviewModalLeave(leave);
    setReviewAction(action);
    setReviewRemarks(
      action === 'APPROVED'
        ? leave.reason_category === 'HEALTH'
          ? 'Leave approved for health condition recovery.'
          : 'Leave application sanctioned.'
        : 'Leave application rejected.'
    );
  };

  const handleConfirmReview = async () => {
    if (!reviewModalLeave) return;
    setSubmittingReview(true);
    try {
      await leaveService.reviewLeave(reviewModalLeave.id, {
        status: reviewAction,
        remarks: reviewRemarks.trim() || undefined,
      });

      setClassLeaves((prev) =>
        prev.map((l) =>
          l.id === reviewModalLeave.id
            ? {
                ...l,
                status: reviewAction,
                review_remarks: reviewRemarks.trim() || null,
                reviewed_by_name: dashboard?.faculty?.name || inchargeName,
                reviewed_at: new Date().toISOString(),
              }
            : l
        )
      );

      // Invalidate cache and reload session
      sessionCacheRef.current.clear();
      await loadSession();

      setReviewModalLeave(null);
    } catch (err: any) {
      console.error('Failed to review leave:', err);
      alert(err.message || 'Failed to review leave application');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtered student leaves for Tab 4
  const filteredLeaves = classLeaves.filter((l) => {
    const matchesFilter = leavesFilter === 'ALL' || l.status === leavesFilter;
    const matchesSearch =
      !leavesSearch ||
      l.student_name.toLowerCase().includes(leavesSearch.toLowerCase()) ||
      (l.register_number && l.register_number.toLowerCase().includes(leavesSearch.toLowerCase())) ||
      l.explanation.toLowerCase().includes(leavesSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered student stats for Tab 2
  const filteredStats = (stats?.students || []).filter((s) => {
    const matchesQuery =
      s.displayName.toLowerCase().includes(statsSearch.toLowerCase()) ||
      (s.registerNumber && s.registerNumber.toLowerCase().includes(statsSearch.toLowerCase())) ||
      s.email.toLowerCase().includes(statsSearch.toLowerCase());
    const matchesShortage = !onlyShortage || s.isShortage;
    return matchesQuery && matchesShortage;
  });

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#142C44] to-[#15203D] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Attendance Management
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Record daily student presence, manage period rosters, and inspect attendance shortage alerts.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex flex-wrap items-center p-1 bg-slate-900/80 rounded-lg border border-slate-700/60 self-start sm:self-auto text-xs font-semibold backdrop-blur-sm gap-1">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'mark'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'leaves'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Student Leaves</span>
            {pendingLeavesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {pendingLeavesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Shortage & Stats
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Session History
          </button>
        </div>
      </div>

      {/* Main Filter & Control Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Select */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Assigned Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {classes.length === 0 && <option value="">No Assigned Classes</option>}
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount} Students)
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Course / Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">General Class Attendance</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Period Select */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Session / Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="Period 1">Period 1 (09:00 - 10:00)</option>
              <option value="Period 2">Period 2 (10:00 - 11:00)</option>
              <option value="Period 3">Period 3 (11:15 - 12:15)</option>
              <option value="Period 4">Period 4 (01:15 - 02:15)</option>
              <option value="Period 5">Period 5 (02:15 - 03:15)</option>
              <option value="Morning Session">Morning Session</option>
              <option value="Afternoon Session">Afternoon Session</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: MARK ATTENDANCE */}
      {activeTab === 'mark' && (
        <div className="space-y-4">
          {/* Quick Stats & Bulk Actions Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Live Counters */}
            <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
              <span className="font-semibold text-slate-700">
                Total: <span className="font-bold text-slate-900">{totalStudents}</span>
              </span>
              <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Present: {presentCount} ({totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%)
              </span>
              <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                Absent: {absentCount}
              </span>
              <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                Late: {lateCount}
              </span>
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Excused: {excusedCount}
              </span>
            </div>

            {/* Bulk Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => markAll('PRESENT')}
                className="px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-300 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('ABSENT')}
                className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-300 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Student Enrollment Roster ({currentClass?.name || 'Class'})
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {selectedDate} • {selectedPeriod}
              </span>
            </div>

            {loadingSession ? (
              <div className="p-16 text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                Loading session student roster...
              </div>
            ) : records.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500">
                No students enrolled in this class yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Register Number</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {records.map((student, idx) => (
                      <tr key={student.studentUid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.displayName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                {student.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {student.displayName}
                              </p>
                              {student.leave ? (
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  {student.leave.status === 'APPROVED' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>Approved Leave ({getCategoryInfo(student.leave.reasonCategory).label})</span>
                                    </span>
                                  ) : student.leave.status === 'PENDING' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                      <span>Pending Leave ({getCategoryInfo(student.leave.reasonCategory).label})</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                      <span>Leave Rejected</span>
                                    </span>
                                  )}
                                  {student.leave.explanation && (
                                    <span
                                      className="text-[10px] text-slate-500 italic truncate max-w-[200px] sm:max-w-[320px]"
                                      title={student.leave.explanation}
                                    >
                                      "{student.leave.explanation}"
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-600 text-[11px] font-semibold">
                          {student.registerNumber || <span className="text-slate-400 italic">Not set</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentUid, 'PRESENT')}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                                student.status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-emerald-700'
                              }`}
                            >
                              P
                            </button>
                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentUid, 'ABSENT')}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                                student.status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-rose-700'
                              }`}
                            >
                              A
                            </button>
                            {/* Late Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentUid, 'LATE')}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                                student.status === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-amber-700'
                              }`}
                            >
                              L
                            </button>
                            {/* Excused Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentUid, 'EXCUSED')}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                                student.status === 'EXCUSED'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-blue-700'
                              }`}
                            >
                              E
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={student.remarks || ''}
                            onChange={(e) => handleRemarkChange(student.studentUid, e.target.value)}
                            className="w-full text-xs px-2.5 py-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Session Remarks and Submit Footer */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Session Remarks & Topics Covered
              </label>
              <textarea
                rows={2}
                placeholder="E.g., Covered Chapter 4 data structures, conducted short quiz..."
                value={sessionRemarks}
                onChange={(e) => setSessionRemarks(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {saveSuccess ? (
                  <span className="inline-flex items-center text-emerald-600 font-semibold gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Attendance record saved successfully!
                  </span>
                ) : (
                  <span>Ready to submit attendance records for {records.length} students.</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={savingSession || records.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {savingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Attendance Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHORTAGE & STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="border border-slate-200 rounded-lg bg-white p-16 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              Calculating attendance percentages and shortage reports...
            </div>
          ) : !stats ? (
            <div className="border border-slate-200 rounded bg-white p-16 text-center text-xs text-slate-500">
              No attendance data available for this class.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Class Attendance Average
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {stats.averageAttendancePercentage}%
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        stats.averageAttendancePercentage >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {stats.averageAttendancePercentage >= 75 ? 'Healthy' : 'Below Target'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Sessions Conducted
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {stats.totalSessionsConducted}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Shortage Risk (&lt;75%)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-2xl font-extrabold ${
                        stats.shortageCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {stats.shortageCount} Students
                    </span>
                    {stats.shortageCount > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">
                        Alert Action
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shortage Alert Banner */}
              {stats.shortageCount > 0 && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-3 text-xs text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-900">
                      Attendance Shortage Alert: {stats.shortageCount} Students Below Mandatory 75%
                    </h4>
                    <p className="mt-0.5 text-rose-700 text-[11px]">
                      Students falling under 75% attendance risk exam debarment as per university governance policies.
                    </p>
                  </div>
                </div>
              )}

              {/* Student Stat Table */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student by name or reg..."
                      value={statsSearch}
                      onChange={(e) => setStatsSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setOnlyShortage(!onlyShortage)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                      onlyShortage
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {onlyShortage ? 'Showing Shortage Only' : 'Show All Students'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Student</th>
                        <th className="py-2.5 px-4">Register Number</th>
                        <th className="py-2.5 px-4 text-center">Sessions</th>
                        <th className="py-2.5 px-4 text-center">Present / Absent</th>
                        <th className="py-2.5 px-4 text-center">Percentage</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredStats.map((st) => (
                        <tr key={st.studentUid} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">{st.displayName}</p>
                            <p className="text-[11px] text-slate-400">{st.email}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-600 font-semibold text-[11px]">
                            {st.registerNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-700">
                            {st.totalSessions}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-emerald-700 font-bold">{st.presentSessions}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-rose-600 font-bold">{st.absentSessions}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    st.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(st.percentage, 100)}%` }}
                                />
                              </div>
                              <span
                                className={`font-bold ${
                                  st.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
                                }`}
                              >
                                {st.percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {st.isShortage ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Shortage
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Eligible
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: SESSION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recorded Attendance Logs ({currentClass?.name || 'Class'})
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {history.length} Sessions Logged
              </span>
            </div>

            {loadingHistory ? (
              <div className="p-16 text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                Loading session logs...
              </div>
            ) : history.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500">
                No past attendance sessions recorded for this class yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">{sess.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {sess.period}
                        </span>
                        {sess.subjectName && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            {sess.subjectName}
                          </span>
                        )}
                      </div>
                      {sess.remarks && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          "{sess.remarks}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <span className="font-semibold text-emerald-700">{sess.presentCount} Present</span>
                        <span className="text-slate-300 mx-1.5">•</span>
                        <span className="font-semibold text-rose-600">{sess.absentCount} Absent</span>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {sess.attendancePercentage}% Attendance Rate
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(sess.date);
                          setSelectedPeriod(sess.period);
                          setActiveTab('mark');
                        }}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Edit Roster
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT LEAVES */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          {/* Role Authority Indicator Banner */}
          {isClassIncharge ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/10 via-emerald-800/5 to-slate-50 border border-emerald-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    Class Incharge Approval Authority Active
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-200/60 text-emerald-800 font-bold">
                      Authorized Decision Maker
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    You are the designated Class Incharge for <strong>{currentClass?.name || 'this class'}</strong>. You have exclusive authority to approve or reject student leave applications. Approved leaves automatically reflect as excused across all subject faculties.
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shrink-0">
                {pendingLeavesCount} Pending Review
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-950 flex items-center gap-2">
                    Subject Faculty Visibility View
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-blue-200/60 text-blue-800 font-bold">
                      Read-Only Audit
                    </span>
                  </h3>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">
                    As subject faculty, you can view all students who applied for leave, their detailed reasons (including health conditions), and real-time status. Only the appointed Class Incharge (<strong>{inchargeName}</strong>) can approve or reject.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filterKey) => {
                const count =
                  filterKey === 'ALL'
                    ? classLeaves.length
                    : classLeaves.filter((l) => l.status === filterKey).length;
                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setLeavesFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                      leavesFilter === filterKey
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {filterKey === 'ALL' ? 'All Leaves' : filterKey.charAt(0) + filterKey.slice(1).toLowerCase()}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        leavesFilter === filterKey
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or register no..."
                value={leavesSearch}
                onChange={(e) => setLeavesSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Leaves Card List */}
          {loadingLeaves ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              Loading student leave applications...
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No leave applications found</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {leavesFilter !== 'ALL'
                  ? `No leave records matching status "${leavesFilter}".`
                  : 'No students from this class have submitted a leave application yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeaves.map((leave) => {
                const categoryInfo = getCategoryInfo(leave.reason_category);
                const CategoryIcon = categoryInfo.icon;
                const from = new Date(leave.from_date);
                const to = new Date(leave.to_date);
                const dayDiff = Math.max(1, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);

                return (
                  <div
                    key={leave.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {leave.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {leave.student_name}
                          </h4>
                          <p className="text-[11px] font-mono text-blue-600 mt-0.5">
                            {leave.register_number || 'No Reg No'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {/* Category Pill */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${categoryInfo.badgeColor}`}
                        >
                          <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{categoryInfo.label}</span>
                        </span>

                        {/* Dates Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {leave.from_date === leave.to_date
                              ? leave.from_date
                              : `${leave.from_date} to ${leave.to_date}`}
                          </span>
                          <span className="text-slate-400">({dayDiff} {dayDiff === 1 ? 'day' : 'days'})</span>
                        </span>

                        {/* Status Badge */}
                        {leave.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        ) : leave.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reason Explanation Card */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {leave.reason_category === 'HEALTH'
                            ? 'Health Condition / Medical Details'
                            : 'Leave Reason Details'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Submitted on {new Date(leave.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed italic">
                        "{leave.explanation}"
                      </p>
                    </div>

                    {/* Review notes if already reviewed */}
                    {leave.status !== 'PENDING' && (
                      <div className="text-[11px] flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by{' '}
                            <strong>{leave.reviewed_by_name || inchargeName}</strong>
                            {leave.review_remarks ? `: "${leave.review_remarks}"` : ''}
                          </span>
                        </span>
                        {leave.reviewed_at && (
                          <span className="text-slate-400">
                            {new Date(leave.reviewed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons for Class Incharge */}
                    {isClassIncharge && leave.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(leave, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-md border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject Leave</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReview(leave, 'APPROVED')}
                          className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Leave</span>
                        </button>
                      </div>
                    )}

                    {/* Notice for Subject Faculty */}
                    {!isClassIncharge && leave.status === 'PENDING' && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Awaiting approval from Class Incharge ({inchargeName})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Class Incharge Review Modal */}
          {reviewModalLeave && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg ${
                        reviewAction === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {reviewAction === 'APPROVED' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {reviewAction === 'APPROVED' ? 'Approve Leave Application' : 'Reject Leave Application'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {reviewModalLeave.student_name} ({reviewModalLeave.register_number || 'Student'})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewModalLeave(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-slate-700">
                    {reviewModalLeave.reason_category === 'HEALTH'
                      ? 'Health Condition Explanation:'
                      : 'Reason Explanation:'}
                  </p>
                  <p className="italic text-slate-800">"{reviewModalLeave.explanation}"</p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Dates: {reviewModalLeave.from_date} to {reviewModalLeave.to_date}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Review Remarks (Optional feedback for student & faculties)
                  </label>
                  <textarea
                    rows={2}
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder={
                      reviewAction === 'APPROVED'
                        ? 'E.g., Granted. Please submit medical certificate upon resumption.'
                        : 'E.g., Reason insufficient or conflicting with critical examinations.'
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReviewModalLeave(null)}
                    className="px-4 py-2 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReview}
                    disabled={submittingReview}
                    className={`px-5 py-2 rounded-md text-xs font-semibold text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                      reviewAction === 'APPROVED'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{reviewAction === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyAttendancePage;
