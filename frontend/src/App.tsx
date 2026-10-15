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
const FacultyDashboard = lazy(() => import('./modules/faculty/pages/FacultyDashboard').then((m: any) => ({ default: m.FacultyDashboard || m.default })));
const FacultyRemindersPage = lazy(() => import('./modules/faculty/pages/FacultyRemindersPage').then((m: any) => ({ default: m.FacultyRemindersPage || m.default })));
const FacultyClassesPage = lazy(() => import('./modules/faculty/pages/FacultyClassesPage').then((m: any) => ({ default: m.FacultyClassesPage || m.default })));
const FacultyClassDetailsPage = lazy(() => import('./modules/faculty/pages/FacultyClassDetailsPage').then((m: any) => ({ default: m.FacultyClassDetailsPage || m.default })));
const FacultyClassStudentsPage = lazy(() => import('./modules/faculty/pages/FacultyClassStudentsPage').then((m: any) => ({ default: m.FacultyClassStudentsPage || m.default })));
const FacultyStudentDetailsPage = lazy(() => import('./modules/faculty/pages/FacultyStudentDetailsPage').then((m: any) => ({ default: m.FacultyStudentDetailsPage || m.default })));
const FacultyAttendancePage = lazy(() => import('./modules/faculty/pages/FacultyAttendancePage').then((m: any) => ({ default: m.FacultyAttendancePage || m.default })));
const FacultyTimetablePage = lazy(() => import('./modules/faculty/pages/FacultyTimetablePage').then((m: any) => ({ default: m.FacultyTimetablePage || m.default })));
const FacultyDepartmentPage = lazy(() => import('./modules/faculty/pages/FacultyDepartmentPage').then((m: any) => ({ default: m.FacultyDepartmentPage || m.default })));
const FacultySubjectsPage = lazy(() => import('./modules/faculty/pages/FacultySubjectsPage').then((m: any) => ({ default: m.FacultySubjectsPage || m.default })));
const FacultyAssignmentsPage = lazy(() => import('./modules/faculty/pages/FacultyAssignmentsPage').then((m: any) => ({ default: m.FacultyAssignmentsPage || m.default })));
const FacultyAcademicYearsPage = lazy(() => import('./modules/faculty/pages/FacultyAcademicYearsPage').then((m: any) => ({ default: m.FacultyAcademicYearsPage || m.default })));
const FacultySemestersPage = lazy(() => import('./modules/faculty/pages/FacultySemestersPage').then((m: any) => ({ default: m.FacultySemestersPage || m.default })));
const FacultyProfilePage = lazy(() => import('./modules/faculty/pages/FacultyProfilePage').then((m: any) => ({ default: m.FacultyProfilePage || m.default })));
const FacultyChatPage = lazy(() => import('./modules/faculty/pages/FacultyChatPage').then((m: any) => ({ default: m.FacultyChatPage || m.default })));
const FacultyContentPage = lazy(() => import('./modules/faculty/pages/FacultyContentPage').then((m: any) => ({ default: m.FacultyContentPage || m.default })));
const FacultyAnalyticsPage = lazy(() => import('./modules/faculty/pages/FacultyAnalyticsPage').then((m: any) => ({ default: m.FacultyAnalyticsPage || m.default })));

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
import { HodChatPage } from './modules/hod/pages/HodChatPage';

// Student Module imports
import { StudentLayout } from './modules/student/components/StudentLayout';
const StudentDashboard = lazy(() => import('./modules/student/pages/StudentDashboard').then((m: any) => ({ default: m.StudentDashboard || m.default })));
const StudentProfilePage = lazy(() => import('./modules/student/pages/StudentProfilePage').then((m: any) => ({ default: m.StudentProfilePage || m.default })));
const StudentClassPage = lazy(() => import('./modules/student/pages/StudentClassPage').then((m: any) => ({ default: m.StudentClassPage || m.default })));
const StudentBatchPage = lazy(() => import('./modules/student/pages/StudentBatchPage').then((m: any) => ({ default: m.StudentBatchPage || m.default })));
const StudentProgramPage = lazy(() => import('./modules/student/pages/StudentProgramPage').then((m: any) => ({ default: m.StudentProgramPage || m.default })));
const StudentDepartmentPage = lazy(() => import('./modules/student/pages/StudentDepartmentPage').then((m: any) => ({ default: m.StudentDepartmentPage || m.default })));
const StudentSubjectsPage = lazy(() => import('./modules/student/pages/StudentSubjectsPage').then((m: any) => ({ default: m.StudentSubjectsPage || m.default })));
const StudentAssignmentsPage = lazy(() => import('./modules/student/pages/StudentAssignmentsPage').then((m: any) => ({ default: m.StudentAssignmentsPage || m.default })));
const StudentClassInchargePage = lazy(() => import('./modules/student/pages/StudentClassInchargePage').then((m: any) => ({ default: m.StudentClassInchargePage || m.default })));
const StudentAcademicYearsPage = lazy(() => import('./modules/student/pages/StudentAcademicYearsPage').then((m: any) => ({ default: m.StudentAcademicYearsPage || m.default })));
const StudentSemestersPage = lazy(() => import('./modules/student/pages/StudentSemestersPage').then((m: any) => ({ default: m.StudentSemestersPage || m.default })));
const StudentAttendancePage = lazy(() => import('./modules/student/pages/StudentAttendancePage').then((m: any) => ({ default: m.StudentAttendancePage || m.default })));
const StudentTimetablePage = lazy(() => import('./modules/student/pages/StudentTimetablePage').then((m: any) => ({ default: m.StudentTimetablePage || m.default })));
const StudentChatPage = lazy(() => import('./modules/student/pages/StudentChatPage').then((m: any) => ({ default: m.StudentChatPage || m.default })));
const StudentContentPage = lazy(() => import('./modules/student/pages/StudentContentPage').then((m: any) => ({ default: m.StudentContentPage || m.default })));

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

const FacultyRoute = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('lms_user') || '{}'));

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem('lms_user') || '{}');
    setUser(local);
  }, []);

  if (!user.role) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
  if (!['FACULTY', 'HOD', 'COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <FacultyLayout />;
};

const StudentRoute = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('lms_user') || '{}'));

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem('lms_user') || '{}');
    setUser(local);
  }, []);

  if (!user.role) return <Navigate to="/login" replace />;
  if (user.role !== 'STUDENT') {
    if (['FACULTY', 'HOD'].includes(user.role)) return <Navigate to="/faculty" replace />;
    if (user.role === 'COLLEGE_ADMIN') return <Navigate to="/college-admin" replace />;
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin" replace />;
    return <Navigate to="/login" replace />;
  }
  return <StudentLayout />;
};

function App() {
  useEffect(() => {
    // Automatically sync any Firebase Auth user to our system on app load
    // This ensures users who logged in previously (or via another device)
    // are still captured in the Super Admin dashboard.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const record = await recordAuthedUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            provider: user.providerData[0]?.providerId || 'google',
            lastLogin: new Date().toISOString(),
          }, token);
          if (record && record.role) {
            const current = JSON.parse(localStorage.getItem('lms_user') || '{}');
            if (current.email !== user.email || current.role !== record.role) {
              const isSuper = user.email === 'amirthavarsshan0806@gmail.com' || record.role === 'SUPER_ADMIN';
              localStorage.setItem('lms_user', JSON.stringify({
                ...current,
                email: user.email,
                name: user.displayName || (record as any).display_name || (record as any).displayName,
                role: record.role,
                isSuperAdmin: isSuper,
                college_id: (record as any).college_id || null,
                department_id: (record as any).department_id || null,
              }));
            }
          }
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
              <Route path="chat" element={<HodChatPage />} />
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
            <Route path="/faculty" element={<FacultyRoute />}>
              <Route index element={<FacultyDashboard />} />
              <Route path="chat" element={<FacultyChatPage />} />
              <Route path="reminders" element={<FacultyRemindersPage />} />
              <Route path="classes" element={<FacultyClassesPage />} />
              <Route path="classes/:classId" element={<FacultyClassDetailsPage />} />
              <Route path="classes/:classId/students" element={<FacultyClassStudentsPage />} />
              <Route path="students/:studentId" element={<FacultyStudentDetailsPage />} />
              <Route path="attendance" element={<FacultyAttendancePage />} />
              <Route path="timetable" element={<FacultyTimetablePage />} />
              <Route path="department" element={<FacultyDepartmentPage />} />
              <Route path="subjects" element={<FacultySubjectsPage />} />
              <Route path="content" element={<FacultyContentPage />} />
              <Route path="analytics" element={<FacultyAnalyticsPage />} />
              <Route path="assignments" element={<FacultyAssignmentsPage />} />
              <Route path="academic" element={<FacultyAcademicYearsPage />} />
              <Route path="semesters" element={<FacultySemestersPage />} />
              <Route path="profile" element={<FacultyProfilePage />} />
            </Route>

            {/* Integrated Student Portal Module Routes */}
            <Route path="/student" element={<StudentRoute />}>
              <Route index element={<StudentDashboard />} />
              <Route path="chat" element={<StudentChatPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="timetable" element={<StudentTimetablePage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="class" element={<StudentClassPage />} />
              <Route path="batch" element={<StudentBatchPage />} />
              <Route path="program" element={<StudentProgramPage />} />
              <Route path="department" element={<StudentDepartmentPage />} />
              <Route path="subjects" element={<StudentSubjectsPage />} />
              <Route path="content" element={<StudentContentPage />} />
              <Route path="learning-content" element={<StudentContentPage />} />
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

export default App;
