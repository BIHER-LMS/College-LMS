import React from 'react';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import type { FacultyDashboardData } from '../types/faculty.types';

interface FacultyStatsProps {
  dashboard: FacultyDashboardData | null;
  loading?: boolean;
}

export const FacultyStats: React.FC<FacultyStatsProps> = ({ dashboard, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const isClassIncharge = dashboard?.classIncharge?.isAssigned || false;
  const assignedClass = dashboard?.classIncharge?.class;
  const studentCount = assignedClass?.studentCount ?? 0;
  const currentSemester = dashboard?.semester?.termNumber ?? assignedClass?.currentSemester ?? '—';
  const academicYearName = dashboard?.academicYear?.name ?? 'Current Term';

  const stats = [
    {
      label: 'Class Incharge Role',
      value: isClassIncharge ? 'Assigned' : 'Subject Teacher',
      subtext: isClassIncharge ? assignedClass?.name : 'Functional Role',
      icon: GraduationCap,
      color: isClassIncharge ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
    },
    {
      label: 'Class Student Strength',
      value: isClassIncharge ? studentCount : '0',
      subtext: isClassIncharge ? `${assignedClass?.name} Enrolled` : 'No Class Incharge',
      icon: Users,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Current Academic Term',
      value: currentSemester !== '—' ? `Semester ${currentSemester}` : 'Active',
      subtext: academicYearName,
      icon: Calendar,
      color: 'text-purple-700 bg-purple-50',
    },
    {
      label: 'Affiliated Department',
      value: dashboard?.department?.code?.toUpperCase() || 'LMS',
      subtext: dashboard?.department?.name || 'Department Division',
      icon: BookOpen,
      color: 'text-indigo-700 bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {stat.value}
                </h3>
                <p className="text-[10.5px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                  {stat.subtext}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FacultyStats;
