import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { auth } from '../config/firebase';
import { recordAuthedUser } from '../services/collegeService';

function WaitingApproval() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('lms_user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
      // Fallback
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

      if (authedRecord.role === 'COLLEGE_ADMIN') {
        const localUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
        localStorage.setItem('lms_user', JSON.stringify({
          ...localUser,
          role: 'COLLEGE_ADMIN',
          college_id: authedRecord.college_id,
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
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center p-8 space-y-6">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-2">
          <Clock className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Account Pending Approval</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Your account has been successfully created and is currently waiting for an administrator to assign your role (such as Student or Faculty) and college.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 border border-slate-100">
          <p>Once your role is assigned, this page will automatically grant you access to your relevant dashboard upon your next login.</p>
        </div>

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
