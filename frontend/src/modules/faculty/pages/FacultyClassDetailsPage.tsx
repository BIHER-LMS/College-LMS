import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFaculty } from '../hooks/useFaculty';
import { ClassDetails } from '../components/ClassDetails';
import { ArrowLeft, Users, AlertCircle, ClipboardCheck } from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { FacultyClassSummary } from '../types/faculty.types';

export const FacultyClassDetailsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { loadClassStudents } = useFaculty();

  const [cls, setCls] = useState<FacultyClassSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingClass, setFetchingClass] = useState<boolean>(true);

  useEffect(() => {
    if (classId) {
      setFetchingClass(true);
      facultyApi
        .getClassDetails(classId)
        .then((data) => {
          setCls(data);
          setError(null);
        })
        .catch((err) => {
          setError(err.response?.data?.error || 'Failed to load class details');
        })
        .finally(() => {
          setFetchingClass(false);
        });

      loadClassStudents(classId);
    }
  }, [classId]);

  if (fetchingClass) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-48 bg-white border border-slate-200 rounded-lg" />
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-800">Access Restricted</h3>
        <p className="text-xs text-rose-600">{error || 'Class not found'}</p>
        <Link
          to="/faculty/classes"
          className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-semibold underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to My Classes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/faculty/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Classes</span>
        </Link>
      </div>

      {/* Class Details Main Card */}
      <ClassDetails cls={cls} />

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Attendance Action Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Attendance Roster</h3>
            </div>
            <p className="text-xs text-slate-500">
              Record period attendance, inspect attendance percentage, and monitor shortage alerts.
            </p>
          </div>
          <Link
            to={`/faculty/attendance?classId=${cls.id}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Mark / View Attendance</span>
          </Link>
        </div>

        {/* Students Roster Action Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Enrolled Students Roster</h3>
            </div>
            <p className="text-xs text-slate-500">
              View student register numbers, institutional emails, and class profiles.
            </p>
          </div>
          <Link
            to={`/faculty/classes/${cls.id}/students`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View All {cls.studentCount} Students</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacultyClassDetailsPage;
