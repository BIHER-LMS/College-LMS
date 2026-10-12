import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GraduationCap,
  Users,
  Award,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import type {
  ToolExecutionResult,
  HodAttendanceSummaryOutput,
  HodStudentAttendanceOutput,
  HodClassAttendanceOutput,
  HodDepartmentAttendanceOutput,
  HodAttendanceAnalyticsOutput,
  HodSearchKnowledgeOutput,
  HodGetKnowledgeContextOutput,
} from '../../types/hodAi.types';

interface HodChatStructuredToolViewProps {
  tool: ToolExecutionResult;
  onViewDocument?: (documentId: string, section?: string) => void;
}

export const HodChatStructuredToolView: React.FC<HodChatStructuredToolViewProps> = ({
  tool,
  onViewDocument,
}) => {
  const { toolName, result, status, error } = tool;

  // Handle Execution Failure or Error State
  if (status === 'error' || error) {
    const isPermissionError =
      error?.code === 'FORBIDDEN' ||
      error?.code === 'UNAUTHORIZED' ||
      error?.message?.toLowerCase().includes('forbidden') ||
      error?.message?.toLowerCase().includes('permission') ||
      error?.message?.toLowerCase().includes('tenant isolation');

    return (
      <div
        className={`my-2 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
          isPermissionError
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}
      >
        <AlertTriangle
          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
            isPermissionError ? 'text-amber-600' : 'text-rose-600'
          }`}
        />
        <div className="flex-1">
          <div className="font-semibold mb-0.5">
            {isPermissionError
              ? 'Access Restricted / Tenant Boundary'
              : 'Tool Execution Error'}
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {error?.message || 'The tool was unable to retrieve data.'}
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  // =========================================================================
  // Tool 1: hod.getAttendanceSummary
  // =========================================================================
  if (toolName === 'hod.getAttendanceSummary') {
    const data = result as HodAttendanceSummaryOutput;
    const avg = data.departmentAverage ?? 0;
    const isHealthy = avg >= 75;

    return (
      <div className="my-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
          <span className="flex items-center gap-1.5 text-[#0d1c32]">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            Department Attendance Summary
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            {data.dateRange?.startDate && data.dateRange?.endDate
              ? `${data.dateRange.startDate} to ${data.dateRange.endDate}`
              : 'Current Academic Term'}
          </span>
        </div>

        {/* High-Level Department KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Dept Average
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-lg font-black ${
                  isHealthy ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {avg.toFixed(1)}%
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isHealthy ? 'Normal' : 'Below Target'}
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(avg, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Total Students
            </span>
            <span className="text-lg font-black text-slate-800">
              {data.totalStudents ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Active Enrollees
            </span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Classes
            </span>
            <span className="text-lg font-black text-slate-800">
              {data.totalClasses ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Active Cohorts
            </span>
          </div>
        </div>

        {/* Cohort Breakdown List */}
        {data.cohorts && data.cohorts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              Cohort Breakdown
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.cohorts.map((cohort, idx) => {
                const cHealthy = (cohort.percentage ?? 0) >= 75 && !cohort.isAlert;
                return (
                  <div
                    key={cohort.batchId || idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      cHealthy
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-rose-50/50 border-rose-200/80'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {cohort.cohortName}
                        {cohort.isAlert && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-700">
                            Alert
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {cohort.studentCount} students
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          cHealthy ? 'text-slate-800' : 'text-rose-700'
                        }`}
                      >
                        {cohort.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // Tool 2: hod.getStudentAttendance
  // =========================================================================
  if (toolName === 'hod.getStudentAttendance') {
    const data = result as HodStudentAttendanceOutput;
    const isDefaulter = data.isLowAttendance || (data.overallPercentage ?? 0) < 75;

    return (
      <div className="my-3 space-y-2.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Student Attendance Dossier
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {data.studentName}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                  {data.registerNumber}
                </span>
                <span>•</span>
                <span>Class: {data.className}</span>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xl font-black ${
                  isDefaulter ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {data.overallPercentage?.toFixed(1)}%
              </span>
              <span
                className={`block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                  isDefaulter
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isDefaulter ? 'Defaulter Alert (<75%)' : 'Eligible (>=75%)'}
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Sessions Attended:{' '}
              <strong className="text-slate-800">
                {data.attendedSessions} / {data.totalSessions}
              </strong>
            </span>
          </div>

          {/* Subject Breakdown */}
          {data.subjects && data.subjects.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Subject-Wise Session Record
              </span>
              <div className="space-y-1.5">
                {data.subjects.map((subj) => {
                  const sHealthy = (subj.percentage ?? 0) >= 75;
                  return (
                    <div
                      key={subj.subjectId}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {subj.subjectName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {subj.subjectCode} • {subj.attended}/{subj.total} sessions
                        </div>
                      </div>
                      <span
                        className={`font-bold ${
                          sHealthy ? 'text-slate-800' : 'text-rose-600 font-black'
                        }`}
                      >
                        {subj.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // Tool 3: hod.getClassAttendance
  // =========================================================================
  if (toolName === 'hod.getClassAttendance') {
    const data = result as HodClassAttendanceOutput;
    const avg = data.averagePercentage ?? 0;
    const isHealthy = avg >= 75;

    return (
      <div className="my-3 space-y-2.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Class Attendance Surveillance
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {data.className}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span>Batch: {data.batch}</span>
                <span>•</span>
                <span>Section: {data.section}</span>
                {data.classInchargeName && (
                  <>
                    <span>•</span>
                    <span className="text-blue-700 font-medium">
                      In-Charge: {data.classInchargeName}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xl font-black ${
                  isHealthy ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {avg.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block">Class Average</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Total Enrolled</span>
              <span className="font-bold text-slate-800 text-sm">
                {data.totalStudents ?? 0}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">
                At-Risk Defaulters
              </span>
              <span
                className={`font-black text-sm ${
                  (data.atRiskStudentsCount ?? 0) > 0
                    ? 'text-rose-600'
                    : 'text-emerald-600'
                }`}
              >
                {data.atRiskStudentsCount ?? 0}
              </span>
            </div>
          </div>

          {/* At-Risk Students List */}
          {data.atRiskStudents && data.atRiskStudents.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Defaulters List (&lt; 75% Attendance)
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {data.atRiskStudents.map((st) => (
                  <div
                    key={st.studentId}
                    className="p-2 bg-white flex items-center justify-between text-xs hover:bg-slate-50"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {st.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                        {st.registerNumber}
                      </span>
                    </div>
                    <span className="font-bold text-rose-600 font-mono">
                      {st.percentage?.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All students in this class meet the 75% attendance threshold.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // Tool 4: hod.getDepartmentAttendance
  // =========================================================================
  if (toolName === 'hod.getDepartmentAttendance') {
    const data = result as HodDepartmentAttendanceOutput;

    return (
      <div className="my-3 space-y-2.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Department Overview
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {data.departmentName}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-900">
                {data.overallPercentage?.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block">Dept Average</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-1.5 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-400 block">Classes</span>
              <span className="font-bold text-slate-800 text-xs">
                {data.totalClasses ?? 0}
              </span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-400 block">Students</span>
              <span className="font-bold text-slate-800 text-xs">
                {data.totalStudents ?? 0}
              </span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-400 block">Total At-Risk</span>
              <span className="font-black text-rose-600 text-xs">
                {data.atRiskCount ?? 0}
              </span>
            </div>
          </div>

          {/* Classes Comparison Grid */}
          {data.classes && data.classes.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Class Comparison
              </span>
              <div className="space-y-1.5">
                {data.classes.map((cls) => {
                  const isHealthy = (cls.averagePercentage ?? 0) >= 75;
                  return (
                    <div
                      key={cls.classId}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {cls.className}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          ({cls.studentCount} students)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {cls.atRiskCount > 0 && (
                          <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            {cls.atRiskCount} at-risk
                          </span>
                        )}
                        <span
                          className={`font-black ${
                            isHealthy ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {cls.averagePercentage?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // Tool 5: hod.getAttendanceAnalytics
  // =========================================================================
  if (toolName === 'hod.getAttendanceAnalytics') {
    const data = result as HodAttendanceAnalyticsOutput;
    const { below65 = 0, between65And75 = 0, above75 = 0 } =
      data.defaulterBuckets || {};
    const totalDefaulters = below65 + between65And75;

    return (
      <div className="my-3 space-y-2.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5 text-[#0d1c32]">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Attendance Analytics & Defaulter Breakdown
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
              {data.timeframe} · {data.metric}
            </span>
          </div>

          {/* Defaulter Buckets */}
          <div className="grid grid-cols-3 gap-2 my-2.5">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">
                Critical (&lt;65%)
              </span>
              <span className="text-base font-black text-rose-800">{below65}</span>
              <span className="text-[9px] text-rose-600 block mt-0.5">
                No Condonation
              </span>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">
                Warning (65-75%)
              </span>
              <span className="text-base font-black text-amber-800">
                {between65And75}
              </span>
              <span className="text-[9px] text-amber-600 block mt-0.5">
                Medical Condonable
              </span>
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Eligible (&ge;75%)
              </span>
              <span className="text-base font-black text-emerald-800">{above75}</span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">
                Exam Clear
              </span>
            </div>
          </div>

          {/* Temporal Trends */}
          {data.trends && data.trends.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Temporal Trends
              </span>
              <div className="space-y-1.5">
                {data.trends.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 bg-slate-50 rounded flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-700">{pt.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {pt.sessionsHeld} sessions
                      </span>
                      <span className="font-bold text-slate-800">
                        {pt.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Insights */}
          {data.insights && data.insights.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 block">
                Automated Governance Insights
              </span>
              <ul className="space-y-1">
                {data.insights.map((ins, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-600 flex items-start gap-1.5"
                  >
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // Tool 6: hod.searchKnowledge (RAG Search Results)
  // =========================================================================
  if (toolName === 'hod.searchKnowledge') {
    const data = result as HodSearchKnowledgeOutput;
    const results = data.results || [];

    if (results.length === 0) {
      return (
        <div className="my-2 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">
              No Authoritative Policy Found
            </span>
            No institutional regulatory documents matched &ldquo;{data.query}&rdquo;.
            Please verify terms or contact the Academic Dean&apos;s office.
          </div>
        </div>
      );
    }

    return (
      <div className="my-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
          <span className="flex items-center gap-1.5 text-indigo-700">
            <BookOpen className="w-3.5 h-3.5" />
            Institutional Knowledge Citations ({results.length})
          </span>
          <span className="text-[11px] text-slate-400">Verified Bylaws</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {results.map((doc, idx) => {
            const scorePct = doc.score ? Math.round(doc.score * 100) : null;
            return (
              <div
                key={doc.documentId || idx}
                className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 leading-snug">
                      {doc.title}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {doc.category}
                    </span>
                  </div>
                  {scorePct !== null && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-nowrap">
                      {scorePct}% match
                    </span>
                  )}
                </div>

                <blockquote className="text-xs text-slate-600 border-l-2 border-indigo-400 pl-2.5 py-0.5 my-2 italic bg-slate-50/60 rounded-r">
                  &ldquo;{doc.snippet}&rdquo;
                </blockquote>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  {doc.url ? (
                    <span className="flex items-center gap-1 text-slate-600 font-mono text-[10px]">
                      <ExternalLink className="w-3 h-3 text-indigo-600" />
                      {doc.url}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Institutional Corpus</span>
                  )}

                  {onViewDocument && (
                    <button
                      onClick={() => onViewDocument(doc.documentId)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Read Full Clause
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // Tool 7: hod.getKnowledgeContext (Full Grounded Document)
  // =========================================================================
  if (toolName === 'hod.getKnowledgeContext') {
    const data = result as HodGetKnowledgeContextOutput;

    return (
      <div className="my-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Regulatory Clause Context
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              {data.title}
            </h4>
            {data.section && (
              <span className="text-xs font-semibold text-indigo-600 block mt-0.5">
                Section: {data.section}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : ''}
          </span>
        </div>

        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap py-1">
          {data.content}
        </div>

        {data.metadata?.citations && data.metadata.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Official Handbook Citations
            </span>
            <ul className="space-y-0.5">
              {data.metadata.citations.map((cit: string, idx: number) => (
                <li
                  key={idx}
                  className="text-[11px] text-slate-600 flex items-start gap-1"
                >
                  <span className="text-indigo-500">•</span>
                  <span>{cit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Fallback for unexpected or custom tool output
  return (
    <div className="my-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 overflow-x-auto">
      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
        Raw Tool Result: {toolName}
      </div>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};
