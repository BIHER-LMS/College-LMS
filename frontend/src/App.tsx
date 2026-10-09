import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Home from './pages/Home';
import Login from './pages/Login';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { recordAuthedUser, getAuthedUserProfile } from './services/collegeService';

// Lazy-loaded routes to minimize initial bundle size and speed up page load
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const CollegeAdmin = lazy(() => import('./pages/CollegeAdmin'));
const WaitingApproval = lazy(() => import('./pages/WaitingApproval'));

const PageLoader = () => (
  <div className="p-8 text-center flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
  </div>
);

// Faculty Module imports
import { FacultyLayout } from './layouts/FacultyLayout';
import { FacultyDashboard } from './modules/faculty/pages/FacultyDashboard';
import { FacultyRemindersPage } from './modules/faculty/pages/FacultyRemindersPage';
import { FacultyClassesPage } from './modules/faculty/pages/FacultyClassesPage';
import { FacultyClassDetailsPage } from './modules/faculty/pages/FacultyClassDetailsPage';
import { FacultyClassStudentsPage } from './modules/faculty/pages/FacultyClassStudentsPage';
import { FacultyStudentDetailsPage } from './modules/faculty/pages/FacultyStudentDetailsPage';
import { FacultyAttendancePage } from './modules/faculty/pages/FacultyAttendancePage';
import { FacultyTimetablePage } from './modules/faculty/pages/FacultyTimetablePage';
import { FacultyDepartmentPage } from './modules/faculty/pages/FacultyDepartmentPage';
import { FacultySubjectsPage } from './modules/faculty/pages/FacultySubjectsPage';
import { FacultyAssignmentsPage } from './modules/faculty/pages/FacultyAssignmentsPage';
import { FacultyAcademicYearsPage } from './modules/faculty/pages/FacultyAcademicYearsPage';
import { FacultySemestersPage } from './modules/faculty/pages/FacultySemestersPage';
import { FacultyProfilePage } from './modules/faculty/pages/FacultyProfilePage';

// HOD Module imports
import { HodLayout } from './layouts/HodLayout';
import { HODDashboard } from './modules/hod/pages/HODDashboard';
import { DepartmentOverviewPage } from './modules/hod/pages/DepartmentOverviewPage';
import { FacultyPage } from './modules/hod/pages/FacultyPage';
import { ProgramsPage } from './modules/hod/pages/ProgramsPage';
import { BatchesPage } from './modules/hod/pages/BatchesPage';
import { ClassesPage } from './modules/hod/pages/ClassesPage';
import { StudentsPage } from './modules/hod/pages/StudentsPage';
import { SubjectsPage } from './modules/hod/pages/SubjectsPage';
import { AttendanceSurveillancePage } from './modules/hod/pages/AttendanceSurveillancePage';
import { 
  AcademicPerformancePage, 
  AcademicCalendarPage, 
  ReportsAnalyticsPage, 
  AuditExportPage 
} from './modules/hod/pages/RemainingPages';

// Student Module imports
import { StudentLayout } from './modules/student/components/StudentLayout';
import { StudentDashboard } from './modules/student/pages/StudentDashboard';
import { StudentProfilePage } from './modules/student/pages/StudentProfilePage';
import { StudentClassPage } from './modules/student/pages/StudentClassPage';
import { StudentBatchPage } from './modules/student/pages/StudentBatchPage';
import { StudentProgramPage } from './modules/student/pages/StudentProgramPage';
import { StudentDepartmentPage } from './modules/student/pages/StudentDepartmentPage';
import { StudentSubjectsPage } from './modules/student/pages/StudentSubjectsPage';
import { StudentAssignmentsPage } from './modules/student/pages/StudentAssignmentsPage';
import { StudentClassInchargePage } from './modules/student/pages/StudentClassInchargePage';
import { StudentAcademicYearsPage } from './modules/student/pages/StudentAcademicYearsPage';
import { StudentSemestersPage } from './modules/student/pages/StudentSemestersPage';
import { StudentAttendancePage } from './modules/student/pages/StudentAttendancePage';
import { StudentTimetablePage } from './modules/student/pages/StudentTimetablePage';

function App() {
  useEffect(() => {
    // Automatically sync any Firebase Auth user to our system on app load
    // This ensures users who logged in previously (or via another device)
    // are still captured in the Super Admin dashboard.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          await recordAuthedUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            provider: user.providerData[0]?.providerId || 'google',
            lastLogin: new Date().toISOString(),
          }, token);
        } catch (error) {
          console.error('Failed to sync auth state', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/college-admin" element={<CollegeAdmin />} />
            <Route path="/waiting-approval" element={<WaitingApproval />} />
            <Route path="/hod" element={<HodRoute />}>
              <Route index element={<HODDashboard />} />
              <Route path="department" element={<DepartmentOverviewPage />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="attendance" element={<AttendanceSurveillancePage />} />
              <Route path="calendar" element={<AcademicCalendarPage />} />
              <Route path="analytics" element={<AcademicPerformancePage />} />
              <Route path="reports" element={<ReportsAnalyticsPage />} />
              <Route path="audit" element={<AuditExportPage />} />
            </Route>

            {/* Integrated Faculty Portal Module Routes */}
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<FacultyDashboard />} />
              <Route path="reminders" element={<FacultyRemindersPage />} />
              <Route path="classes" element={<FacultyClassesPage />} />
              <Route path="classes/:classId" element={<FacultyClassDetailsPage />} />
              <Route path="classes/:classId/students" element={<FacultyClassStudentsPage />} />
              <Route path="students/:studentId" element={<FacultyStudentDetailsPage />} />
              <Route path="attendance" element={<FacultyAttendancePage />} />
              <Route path="timetable" element={<FacultyTimetablePage />} />
              <Route path="department" element={<FacultyDepartmentPage />} />
              <Route path="subjects" element={<FacultySubjectsPage />} />
              <Route path="assignments" element={<FacultyAssignmentsPage />} />
              <Route path="academic" element={<FacultyAcademicYearsPage />} />
              <Route path="semesters" element={<FacultySemestersPage />} />
              <Route path="profile" element={<FacultyProfilePage />} />
            </Route>

            {/* Integrated Student Portal Module Routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="timetable" element={<StudentTimetablePage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="class" element={<StudentClassPage />} />
              <Route path="batch" element={<StudentBatchPage />} />
              <Route path="program" element={<StudentProgramPage />} />
              <Route path="department" element={<StudentDepartmentPage />} />
              <Route path="subjects" element={<StudentSubjectsPage />} />
              <Route path="assignments" element={<StudentAssignmentsPage />} />
              <Route path="class-incharge" element={<StudentClassInchargePage />} />
              <Route path="academic-calendar" element={<StudentAcademicYearsPage />} />
              <Route path="academic-years" element={<StudentAcademicYearsPage />} />
              <Route path="semesters" element={<StudentSemestersPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

const HodRoute = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('lms_user') || '{}'));
  const [loading, setLoading] = useState(!user.department_id && user.role === 'HOD');

  useEffect(() => {
    const checkDept = async () => {
      if (user.role === 'HOD' && !user.department_id) {
        try {
          const profile = await getAuthedUserProfile({ email: user.email });
          if (profile?.department_id) {
            const updatedUser = { ...user, department_id: profile.department_id };
            localStorage.setItem('lms_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    if (!user.department_id) {
      checkDept();
    } else {
      setLoading(false);
    }
  }, [user.email, user.role, user.department_id]);

  if (loading) return <div className="p-8 text-center flex items-center justify-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  if (user.role !== 'HOD') return <Navigate to="/login" />;

  if (!user.department_id) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md">
          <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Department Not Assigned</h1>
          <p className="text-slate-600 text-sm mb-6">
            Your account has been approved as HOD, but you haven't been assigned to a specific department yet. Please contact your College Admin.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('lms_user');
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }
  return <HodLayout />;
};

export default App;
