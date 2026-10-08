import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFaculty } from '../hooks/useFaculty';
import { StudentTable } from '../components/StudentTable';
import { StudentUploadModal } from '../components/StudentUploadModal';
import { AddStudentModal } from '../components/AddStudentModal';
import { DeleteStudentModal } from '../components/DeleteStudentModal';
import { AssignClassRepModal } from '../components/AssignClassRepModal';
import { ArrowLeft, Users, AlertCircle, GraduationCap, Upload, UserPlus } from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import type { FacultyClassSummary, ClassStudentSummary } from '../types/faculty.types';

export const FacultyClassStudentsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { classStudents, loading, loadClassStudents } = useFaculty();

  const [cls, setCls] = useState<FacultyClassSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignRepModalOpen, setIsAssignRepModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<ClassStudentSummary | null>(null);

  const fetchClassInfo = () => {
    if (classId) {
      facultyApi
        .getClassDetails(classId)
        .then(setCls)
        .catch((err) => {
          setError(err.response?.data?.error || 'Failed to load class info');
        });

      loadClassStudents(classId);
    }
  };

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  const handleDirectAssignRep = async (studentUid: string) => {
    if (!classId) return;
    try {
      await facultyApi.assignClassRepresentative(classId, studentUid);
      fetchClassInfo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update Class Representative');
    }
  };

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-800">Access Restricted</h3>
        <p className="text-xs text-rose-600">{error}</p>
        <Link
          to="/faculty/classes"
          className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-semibold underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to My Class</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/faculty/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Class</span>
        </Link>
      </div>

      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {cls?.name || 'Class'} Student Directory
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Verified students enrolled under your Class Incharge supervision.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {cls && (
            <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>{classStudents.length} Students Enrolled</span>
            </div>
          )}
          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Student</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* Student Table Component */}
      <StudentTable
        students={classStudents}
        loading={loading.students}
        onOpenAddStudentModal={() => setIsAddStudentModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAssignRepModal={() => setIsAssignRepModalOpen(true)}
        onDirectAssignRep={handleDirectAssignRep}
        onDeleteStudent={(student) => setStudentToDelete(student)}
      />

      {/* Add Student Manually Modal */}
      {cls && (
        <AddStudentModal
          isOpen={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          classId={cls.id}
          className={cls.name}
          onSuccess={fetchClassInfo}
        />
      )}

      {/* Delete Student Confirmation Modal */}
      {cls && (
        <DeleteStudentModal
          isOpen={!!studentToDelete}
          onClose={() => setStudentToDelete(null)}
          classId={cls.id}
          className={cls.name}
          student={studentToDelete}
          onSuccess={fetchClassInfo}
        />
      )}

      {/* Student Upload Modal */}
      {cls && (
        <StudentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          classId={cls.id}
          className={cls.name}
          onSuccess={fetchClassInfo}
        />
      )}

      {/* Assign CR Modal */}
      {cls && (
        <AssignClassRepModal
          isOpen={isAssignRepModalOpen}
          onClose={() => setIsAssignRepModalOpen(false)}
          classId={cls.id}
          className={cls.name}
          currentRep={cls.classRep}
          students={classStudents}
          onSuccess={fetchClassInfo}
        />
      )}
    </div>
  );
};

export default FacultyClassStudentsPage;
