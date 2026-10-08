import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, XCircle } from 'lucide-react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  recordAuthedUser, 
  fetchPublicColleges,
  fetchDepartments, 
  updateUserProfile,
  getAuthedUserProfile
} from '../services/collegeService';

function WaitingApproval() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string>('PENDING');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [requestedDetails, setRequestedDetails] = useState<{ college: string, department: string, role: string } | null>(null);
  
  // Onboarding Form State
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedRole, setSelectedRole] = useState('FACULTY'); // default to FACULTY
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to route approved user
  const routeApprovedUser = (record: any) => {
    const status = record.approval_status || 'PENDING';
    const effectiveRole = record.role !== 'USER' ? record.role : (status === 'APPROVED' ? record.requested_role : 'USER');
    const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');

    if (effectiveRole === 'SUPER_ADMIN') {
      localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'SUPER_ADMIN', isSuperAdmin: true }));
      navigate('/super-admin');
      return true;
    } else if (effectiveRole === 'COLLEGE_ADMIN') {
      localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'COLLEGE_ADMIN', college_id: record.college_id }));
      navigate('/college-admin');
      return true;
    } else if (effectiveRole === 'HOD') {
      localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'HOD', college_id: record.college_id, department_id: record.department_id }));
      navigate('/hod');
      return true;
    } else if (effectiveRole === 'FACULTY') {
      localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'FACULTY', college_id: record.college_id, department_id: record.department_id }));
      navigate('/faculty');
      return true;
    } else if (effectiveRole === 'STUDENT') {
      localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'STUDENT', college_id: record.college_id, department_id: record.department_id }));
      navigate('/student');
      return true;
    }
    return false;
  };

  useEffect(() => {
    let isMounted = true;

    const checkAndRoute = async (userObj: { uid?: string; email?: string; displayName?: string | null; photoURL?: string | null; token?: string }) => {
      try {
        let record = await getAuthedUserProfile({ uid: userObj.uid, email: userObj.email });
        
        // If not recorded yet and we have a valid firebase user, create shadow record
        if (!record && userObj.uid && userObj.email) {
          record = await recordAuthedUser({
            uid: userObj.uid,
            email: userObj.email,
            displayName: userObj.displayName || null,
            photoURL: userObj.photoURL || null,
            provider: 'google',
            lastLogin: new Date().toISOString(),
          }, userObj.token);
        }

        if (!record || !isMounted) return;

        setApprovalStatus(record.approval_status || 'PENDING');

        // Check if user is approved and route them
        const routed = routeApprovedUser(record);
        if (routed) return;

        const cols = await fetchPublicColleges();
        if (isMounted) setColleges(cols as any);

        // If the user has not submitted onboarding yet
        if (!record.college_id) {
          if (isMounted) setNeedsOnboarding(true);
        } else {
          // User already submitted request and is waiting
          const collegeName = cols.find(c => c.id === record.college_id)?.name || 'Selected College';
          const depts = await fetchDepartments(record.college_id);
          const deptName = depts.find(d => d.id === record.department_id)?.name || 'Selected Department';
          if (isMounted) {
            setNeedsOnboarding(false);
            setRequestedDetails({
              college: collegeName,
              department: deptName,
              role: record.requested_role || 'Faculty'
            });
          }
        }
      } catch (err) {
        console.error('WaitingApproval init error:', err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        await checkAndRoute({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName,
          photoURL: user.photoURL,
          token
        });
      } else {
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        if (localUser.email) {
          await checkAndRoute({
            email: localUser.email,
            displayName: localUser.name,
          });
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Fetch departments when college changes (for onboarding)
  useEffect(() => {
    const loadDepartments = async () => {
      if (selectedCollege && needsOnboarding) {
        const depts = await fetchDepartments(selectedCollege);
        setDepartments(depts);
      } else if (needsOnboarding) {
        setDepartments([]);
      }
      if (needsOnboarding) {
        setSelectedDepartment('');
      }
    };
    loadDepartments();
  }, [selectedCollege, needsOnboarding]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('lms_user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
      localStorage.removeItem('lms_user');
      navigate('/login');
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      const uid = auth.currentUser?.uid;
      const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
      const email = auth.currentUser?.email || localUser?.email;

      if (!uid && !email) {
        alert('Your session has expired. Please sign in again.');
        navigate('/login');
        return;
      }

      // Query latest profile directly from database
      const record = await getAuthedUserProfile({ uid, email });
      if (!record) {
        setStatusMessage('No user record found. Please try signing in again.');
        return;
      }

      setApprovalStatus(record.approval_status || 'PENDING');

      // Check if approved and redirect
      const routed = routeApprovedUser(record);
      if (routed) return;

      if (record.approval_status === 'REJECTED') {
        setStatusMessage('Your application was rejected by the administrator.');
      } else {
        setStatusMessage('Status checked: Your application is still pending review by the College Administrator.');
      }
    } catch (error: any) {
      console.error('Failed to check status:', error);
      setStatusMessage('Error checking status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege || !selectedRole) return;
    if (selectedRole !== 'COLLEGE_ADMIN' && !selectedDepartment) return;

    const uid = auth.currentUser?.uid;
    const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
    const identifier = uid || localUser?.email;

    if (!identifier) {
      alert('Authentication session not found. Please log in again.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfile(identifier, {
        college_id: selectedCollege,
        requested_role: selectedRole,
        department_id: selectedRole === 'COLLEGE_ADMIN' ? null : selectedDepartment,
        approval_status: 'PENDING',
      });
      setApprovalStatus('PENDING');
      
      const collegeName = colleges.find(c => c.id === selectedCollege)?.name || 'Selected College';
      const deptName = departments.find(d => d.id === selectedDepartment)?.name || 'No Department';
      setRequestedDetails({
        college: collegeName,
        department: deptName,
        role: selectedRole
      });
      
      setNeedsOnboarding(false);
      setStatusMessage('Request submitted! Waiting for College Administrator approval.');
    } catch (error) {
      console.error('Failed to submit onboarding:', error);
      alert('Failed to save details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8 space-y-6">
          <div className="text-center">
            <img src="/logo.png" alt="Aura Logo" className="h-12 w-auto object-contain mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Complete Your Profile</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Please select your college, role, and department to request access.
            </p>
          </div>

          <form onSubmit={handleSubmitOnboarding} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select College</label>
              <select
                required
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="" disabled>-- Select a College --</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Role</label>
              <select
                required
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  if (e.target.value === 'COLLEGE_ADMIN') setSelectedDepartment('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="HOD">Head of Department (HOD)</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>

            {selectedRole !== 'COLLEGE_ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Department</label>
                <select
                  required
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={!selectedCollege}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100"
                >
                  <option value="" disabled>-- Select a Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedCollege || !selectedRole || !selectedDepartment}
              className="w-full py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 mt-4"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center p-8 space-y-6">
        
        {approvalStatus === 'REJECTED' ? (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <img src="/logo.png" alt="Aura Logo" className="h-12 w-auto object-contain mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">Request Rejected</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Your request has been rejected by the College Administrator. Please contact support or your administrator for more information.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-2">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <img src="/logo.png" alt="Aura Logo" className="h-12 w-auto object-contain mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">Account Pending Approval</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Your request has been successfully submitted and is currently waiting for your College Administrator to approve your role.
              </p>
            </div>
          </>
        )}

        {requestedDetails && (
          <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 text-left">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Requested Details</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium">College:</span>
                <span className="text-right truncate ml-4" title={requestedDetails.college}>{requestedDetails.college}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Department:</span>
                <span className="text-right truncate ml-4" title={requestedDetails.department}>{requestedDetails.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span className="text-right">{requestedDetails.role}</span>
              </div>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm text-left">
            {statusMessage}
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-800 text-white font-medium text-sm rounded-lg hover:bg-brand-700 transition-colors w-full disabled:opacity-70"
          >
            {isChecking ? 'Checking...' : 'Check Approval Status'}
          </button>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaitingApproval;
