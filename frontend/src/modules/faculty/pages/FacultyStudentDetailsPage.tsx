import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { facultyApi } from '../api/facultyApi';
import { StudentDetails } from '../components/StudentDetails';
import type { StudentDetails as StudentDetailsType } from '../types/faculty.types';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const FacultyStudentDetailsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<StudentDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      facultyApi
        .getStudentDetails(studentId)
        .then((data) => {
          setStudent(data);
          setError(null);
        })
        .catch((err) => {
          setError(
            err.response?.data?.error ||
              'Access denied: You are only authorized to view details of students in your assigned class.'
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-64 bg-white border border-slate-200 rounded-lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-800">Access Denied</h3>
        <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
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
    <div className="space-y-4">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to={`/faculty/classes/${student.classId}/students`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {student.className} Students</span>
        </Link>
      </div>

      {/* Student Details Component */}
      <StudentDetails student={student} />
    </div>
  );
};

export default FacultyStudentDetailsPage;
