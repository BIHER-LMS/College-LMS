import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Download,
  Search,
  FileText,
  X,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { facultyContentApi } from '../api/facultyContentApi';
import { facultyApi } from '../api/facultyApi';

export const FacultyAnalyticsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  // Student Drill-Down Modal State
  const [drillDownStudentUid, setDrillDownStudentUid] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [drillDownLoading, setDrillDownLoading] = useState<boolean>(false);

  // Filter & Search
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const raw = await facultyApi.getMySubjects();
      const data = Array.isArray(raw) ? raw : (raw as any)?.data || [];
      setSubjects(data);
      if (data && data.length > 0) {
        const firstId = data[0].classSubjectId || data[0].id || '';
        setSelectedClassSubjectId(firstId);
      } else {
        setSelectedClassSubjectId('');
        setAnalytics(null);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setSubjects([]);
      setSelectedClassSubjectId('');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassSubjectId) {
      loadAnalytics(selectedClassSubjectId);
    }
  }, [selectedClassSubjectId]);

  const loadAnalytics = async (classSubjectId: string) => {
    try {
      setAnalyticsLoading(true);
      const data = await facultyContentApi.getClassSubjectAnalytics(classSubjectId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load class analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleOpenDrillDown = async (studentUid: string) => {
    try {
      setDrillDownStudentUid(studentUid);
      setDrillDownLoading(true);
      const data = await facultyContentApi.getStudentDrillDownAnalytics(
        selectedClassSubjectId,
        studentUid
      );
      setStudentDetails(data);
    } catch (err) {
      console.error('Failed to load student drill-down:', err);
      alert('Failed to load detailed student metrics.');
    } finally {
      setDrillDownLoading(false);
    }
  };

  const handleCloseDrillDown = () => {
    setDrillDownStudentUid(null);
    setStudentDetails(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!analytics || !analytics.studentTable) return;

    const headers = [
      'Register Number',
      'Student Name',
      'Email',
      'Completed Materials',
      'Total Materials',
      'Completion Rate (%)',
      'Watch Time (Mins)',
      'Rewind Count',
      'Engagement Score',
      'Risk Level',
    ];

    const rows = analytics.studentTable.map((s: any) => [
      `"${s.registerNumber}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      s.completedContents,
      s.totalContents,
      s.completionRate,
      Math.round(s.watchTimeSeconds / 60),
      s.rewindCount,
      s.engagementScore,
      s.riskLevel,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `learning_analytics_${analytics.classSubject.subjectCode || 'course'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = (analytics?.studentTable || []).filter((s: any) => {
    const matchesRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            On Track
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const summary = analytics?.summary;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Learning Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry, video drop-off curves, rewind telemetry, and ML-backed learner risk diagnostics.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Teaching Subject
            </label>
            <select
              value={selectedClassSubjectId}
              onChange={(e) => setSelectedClassSubjectId(e.target.value)}
              disabled={loading || subjects.length === 0}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[260px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subjects.length === 0 ? (
                <option value="">No Teaching Subjects Assigned</option>
              ) : (
                subjects.map((s) => {
                  const subId = s.classSubjectId || s.id;
                  const className = s.className || s.class?.name || 'Class';
                  const subjectName = s.subjectName || s.subject?.name || s.name || 'Subject';
                  const subjectCode = s.subjectCode || s.subject?.code || s.code || '';
                  return (
                    <option key={subId} value={subId}>
                      {className} — {subjectName} {subjectCode ? `(${subjectCode})` : ''}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={subjects.length === 0 || !analytics}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-medium px-4 py-2.5 rounded-xl transition self-end"
            title="Export CSV Report"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-amber-200 p-8 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 border border-amber-200/60 shadow-xs">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Teaching Subjects Assigned</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-4 leading-relaxed">
            There are currently no classes or subjects mapped to your account. Contact your Department HOD or Administrator to assign classes and subjects to your profile.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <span>Role: Faculty</span>
            <span>•</span>
            <span>Requires Class/Subject Assignment</span>
          </div>
        </div>
      ) : analyticsLoading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-sm text-slate-500">Calculating learner metrics...</span>
        </div>
      ) : summary ? (
        <>
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Enrolled Students
                </span>
                <span className="text-2xl font-bold text-slate-900">{summary.totalStudents}</span>
                <span className="text-xs text-slate-400 block mt-0.5">Active Class Members</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Avg Content Completion
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {summary.averageCompletionRate}%
                </span>
                <span className="text-xs text-emerald-600 font-medium block mt-0.5">
                  Across {summary.totalContents} materials
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Total Watch Hours
                </span>
                <span className="text-2xl font-bold text-slate-900">{summary.totalWatchHours} hrs</span>
                <span className="text-xs text-slate-400 block mt-0.5">Cumulative Video Playback</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Total Concept Rewinds
                </span>
                <span className="text-2xl font-bold text-slate-900">{summary.totalRewinds}</span>
                <span className="text-xs text-purple-600 font-medium block mt-0.5">
                  High Rewinds Highlight Re-study
                </span>
              </div>
            </div>
          </div>

          {/* Video Dropoff & Risk Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Drop-off Retention Bar */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Video Playback Completion Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student distribution across playback milestones.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Fully Completed (75% - 100%)</span>
                    <span className="font-bold text-emerald-600">
                      {summary.videoDropoff.completed} sessions
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          summary.totalStudents > 0
                            ? Math.min(100, (summary.videoDropoff.completed / summary.totalStudents) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Good Progress (50% - 75%)</span>
                    <span className="font-bold text-blue-600">
                      {summary.videoDropoff.under75} sessions
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          summary.totalStudents > 0
                            ? Math.min(100, (summary.videoDropoff.under75 / summary.totalStudents) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Partial Progress (25% - 50%)</span>
                    <span className="font-bold text-amber-600">
                      {summary.videoDropoff.under50} sessions
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          summary.totalStudents > 0
                            ? Math.min(100, (summary.videoDropoff.under50 / summary.totalStudents) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Early Drop-off (&lt; 25%)</span>
                    <span className="font-bold text-rose-600">
                      {summary.videoDropoff.under25} sessions
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-rose-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          summary.totalStudents > 0
                            ? Math.min(100, (summary.videoDropoff.under25 / summary.totalStudents) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Distribution Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Learner Risk Diagnostics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ML predictive engagement scoring based on view rates, video completion, and submission rates.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>On Track (Low Risk)</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-900">
                      {summary.riskDistribution.low}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Needs Attention (Medium)</span>
                    </div>
                    <span className="text-lg font-bold text-amber-900">
                      {summary.riskDistribution.medium}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-800 text-sm font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>At Risk (High Risk)</span>
                    </div>
                    <span className="text-lg font-bold text-rose-900">
                      {summary.riskDistribution.high}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                Early interventions can improve course completion by up to 34%.
              </div>
            </div>
          </div>

          {/* Student Engagement Ranking Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Learning Progress</h3>
                <p className="text-xs text-slate-500">
                  Individual student completion, watch hours, rewinds, and ML engagement scores.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student or reg no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-56"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                  {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setRiskFilter(lvl)}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        riskFilter === lvl
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {lvl === 'ALL' ? 'All Students' : lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Register No</th>
                    <th className="py-3 px-4">Materials Completed</th>
                    <th className="py-3 px-4">Watch Time</th>
                    <th className="py-3 px-4">Rewinds</th>
                    <th className="py-3 px-4">Engagement Score</th>
                    <th className="py-3 px-4">Risk Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No students match the current search / filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s: any) => (
                      <tr key={s.studentUid} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block leading-tight">
                                {s.name}
                              </span>
                              <span className="text-xs text-slate-400">{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          {s.registerNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {s.completedContents} / {s.totalContents}
                            </span>
                            <span className="text-xs text-slate-400 font-normal">
                              ({s.completionRate}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {Math.round(s.watchTimeSeconds / 60)} mins
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs font-semibold">
                          {s.rewindCount}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${Math.min(100, s.engagementScore)}%` }}
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-800">
                              {s.engagementScore}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRiskBadge(s.riskLevel)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenDrillDown(s.studentUid)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                          >
                            <span>Drill Down</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-slate-400">No analytics data available.</div>
      )}

      {/* ========================================================= */}
      {/* STUDENT DRILL-DOWN MODAL */}
      {/* ========================================================= */}
      {drillDownStudentUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  {studentDetails?.student?.display_name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {studentDetails?.student?.display_name || 'Student Details'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reg: {studentDetails?.student?.register_number || 'N/A'} • {studentDetails?.student?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseDrillDown}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {drillDownLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-sm text-slate-500">Loading student activity log...</span>
              </div>
            ) : studentDetails ? (
              <div className="space-y-6 pt-4">
                {/* ML Summary Card */}
                {studentDetails.mlFeatures && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-wrap gap-6 items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">
                        Calculated ML Engagement
                      </span>
                      <span className="text-2xl font-bold text-slate-900">
                        {studentDetails.mlFeatures.engagement_score} / 100
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">
                        Assigned Risk Level
                      </span>
                      {getRiskBadge(studentDetails.mlFeatures.risk_level)}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">
                        Total Watch Time
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {Math.round(studentDetails.mlFeatures.total_watch_seconds / 60)} minutes
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">
                        Rewind Frequency
                      </span>
                      <span className="text-sm font-semibold text-purple-700">
                        {studentDetails.mlFeatures.rewind_frequency}x avg
                      </span>
                    </div>
                  </div>
                )}

                {/* Content Items Progress */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Learning Material Progress
                  </h4>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {studentDetails.contentProgressList?.map((cp: any) => (
                      <div
                        key={cp.contentId}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">{cp.title}</span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {cp.contentType}
                            </span>
                            {cp.isCompleted ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Completed
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                In Progress
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            Watch Time: {Math.round(cp.watchTimeSeconds / 60)}m • Rewinds: {cp.rewindCount} • Seeks: {cp.seekCount}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-800 block">
                            {cp.completionPercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cp.lastAccessedAt ? new Date(cp.lastAccessedAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Stream */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Recent Activity Telemetry Log (Last 50 Events)
                  </h4>

                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-48 overflow-y-auto space-y-1.5">
                    {studentDetails.recentEvents?.length === 0 ? (
                      <span className="text-slate-500">No telemetry events logged yet.</span>
                    ) : (
                      studentDetails.recentEvents?.map((evt: any) => (
                        <div key={evt.id} className="flex items-center justify-between text-slate-300">
                          <div>
                            <span className="text-indigo-400 font-bold mr-2">[{evt.eventType}]</span>
                            <span>{evt.contentTitle}</span>
                            {evt.positionSeconds > 0 && (
                              <span className="text-slate-500 ml-2">@ {Math.round(evt.positionSeconds)}s</span>
                            )}
                            {evt.seekFrom !== null && evt.seekTo !== null && (
                              <span className="text-purple-400 ml-2">
                                ({Math.round(evt.seekFrom)}s → {Math.round(evt.seekTo)}s)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(evt.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
