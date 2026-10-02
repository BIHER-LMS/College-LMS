import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { auth } from '../config/firebase';
import { 
  recordAuthedUser, 
  fetchColleges, 
  fetchDepartments, 
  updateUserProfile 
} from '../services/collegeService';

function WaitingApproval() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string>('PENDING');
  const [requestedDetails, setRequestedDetails] = useState<{ college: string, department: string, role: string } | null>(null);
  
  // Onboarding Form State
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedRole, setSelectedRole] = useState('HOD'); // default to HOD
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!auth.currentUser) return;
      try {
        const authedRecord = await recordAuthedUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || null,
          photoURL: auth.currentUser.photoURL || null,
          provider: 'google',
          lastLogin: new Date().toISOString(),
        });
        
        const record = authedRecord as any;
        setApprovalStatus(record.approval_status || 'PENDING');
        
        // Redirect if already approved
        if (record.role === 'SUPER_ADMIN') {
          const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
          localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'SUPER_ADMIN', isSuperAdmin: true }));
          navigate('/super-admin');
          return;
        } else if (record.role === 'COLLEGE_ADMIN') {
          const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
          localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'COLLEGE_ADMIN', college_id: record.college_id }));
          navigate('/college-admin');
          return;
        } else if (record.role === 'HOD') {
          const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
          localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'HOD', college_id: record.college_id, department_id: record.department_id }));
          navigate('/hod');
          return;
        } else if (record.role === 'FACULTY') {
          const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
          localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'FACULTY', college_id: record.college_id, department_id: record.department_id }));
          navigate('/faculty');
          return;
        } else if (record.role === 'STUDENT') {
          const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
          localStorage.setItem('lms_user', JSON.stringify({ ...localUser, role: 'STUDENT', college_id: record.college_id, department_id: record.department_id }));
          navigate('/student');
          return;
        }

        const cols = await fetchColleges();
        setColleges(cols);
        
        // If the user is just a USER and hasn't selected a college yet
        if (record.role === 'USER' && !record.college_id) {
          setNeedsOnboarding(true);
        } else if (record.role === 'USER' && record.college_id) {
          // User has selected college and is waiting
          const collegeName = cols.find(c => c.id === record.college_id)?.name || 'Unknown College';
          const depts = await fetchDepartments(record.college_id);
          const deptName = depts.find(d => d.id === record.department_id)?.name || 'Unknown Department';
          setRequestedDetails({
            college: collegeName,
            department: deptName,
            role: record.requested_role || 'Unknown Role'
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

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
        setSelectedDepartment(''); // reset department only during onboarding
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
    if (!auth.currentUser) return;
    setIsChecking(true);
    try {
      const authedRecord = await recordAuthedUser({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        displayName: auth.currentUser.displayName || null,
        photoURL: auth.currentUser.photoURL || null,
        provider: 'google',
        lastLogin: new Date().toISOString(),
      });
      
      const record = authedRecord as any;
      setApprovalStatus(record.approval_status || 'PENDING');

      if (authedRecord.role === 'COLLEGE_ADMIN') {
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        localStorage.setItem('lms_user', JSON.stringify({
          ...localUser,
          role: 'COLLEGE_ADMIN',
          college_id: (authedRecord as any).college_id,
        }));
        navigate('/college-admin');
      } else if (authedRecord.role === 'SUPER_ADMIN') {
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        localStorage.setItem('lms_user', JSON.stringify({
          ...localUser,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
        }));
        navigate('/super-admin');
      } else if (authedRecord.role === 'HOD') {
        // Just an example, you can route to HOD dashboard later
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        localStorage.setItem('lms_user', JSON.stringify({
          ...localUser,
          role: 'HOD',
          college_id: (authedRecord as any).college_id,
          department_id: (authedRecord as any).department_id,
        }));
        navigate('/hod'); // assuming this route exists or will exist
      } else if (authedRecord.role === 'FACULTY') {
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        localStorage.setItem('lms_user', JSON.stringify({
          ...localUser,
          role: 'FACULTY',
          college_id: (authedRecord as any).college_id,
          department_id: (authedRecord as any).department_id,
        }));
        navigate('/faculty');
      } else if (authedRecord.role === 'STUDENT') {
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        localStorage.setItem('lms_user', JSON.stringify({
          ...localUser,
          role: 'STUDENT',
          college_id: (authedRecord as any).college_id,
          department_id: (authedRecord as any).department_id,
        }));
        navigate('/student');
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedCollege || !selectedRole || !selectedDepartment) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile(auth.currentUser.uid, {
        college_id: selectedCollege,
        requested_role: selectedRole,
        department_id: selectedDepartment,
        approval_status: 'PENDING',
      });
      setApprovalStatus('PENDING');
      
      const collegeName = colleges.find(c => c.id === selectedCollege)?.name || 'Unknown College';
      const deptName = departments.find(d => d.id === selectedDepartment)?.name || 'Unknown Department';
      setRequestedDetails({
        college: collegeName,
        department: deptName,
        role: selectedRole
      });
      
      setNeedsOnboarding(false); // Switch to waiting screen
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
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="HOD">Head of Department (HOD)</option>
                <option value="FACULTY">Faculty</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

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
