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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
