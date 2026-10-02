import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import CollegeAdmin from './pages/CollegeAdmin';
import WaitingApproval from './pages/WaitingApproval';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { recordAuthedUser } from './services/collegeService';

function App() {
  useEffect(() => {
    // Automatically sync any Firebase Auth user to our system on app load
    // This ensures users who logged in previously (or via another device)
    // are still captured in the Super Admin dashboard.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        recordAuthedUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          provider: user.providerData[0]?.providerId || 'google',
          lastLogin: new Date().toISOString(),
        }).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/college-admin" element={<CollegeAdmin />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        <Route path="/hod" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">HOD Dashboard</h1><p className="text-slate-500 mt-2">Under Construction by the team.</p></div>} />
        <Route path="/faculty" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Faculty Dashboard</h1><p className="text-slate-500 mt-2">Under Construction by the team.</p></div>} />
        <Route path="/student" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Student Dashboard</h1><p className="text-slate-500 mt-2">Under Construction by the team.</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
