import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { recordAuthedUser } from '../services/collegeService';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Record user for College Admin assignment pool and get their role
      const authedRecord = await recordAuthedUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        provider: 'google',
        lastLogin: new Date().toISOString(),
      });

      const isSuper = authedRecord.role === 'SUPER_ADMIN';
      const isCollegeAdmin = authedRecord.role === 'COLLEGE_ADMIN';
      
      localStorage.setItem('lms_user', JSON.stringify({
        email: user.email,
        name: user.displayName || 'Google User',
        role: authedRecord.role,
        isSuperAdmin: isSuper,
        photoURL: user.photoURL,
        college_id: authedRecord.college_id || null,
      }));

      setIsSuccess(true);
      setTimeout(() => {
        if (isSuper) {
          navigate('/super-admin');
        } else if (isCollegeAdmin) {
          navigate('/college-admin');
        } else if (authedRecord.role === 'HOD') {
          navigate('/hod');
        } else if (authedRecord.role === 'FACULTY') {
          navigate('/faculty');
        } else if (authedRecord.role === 'STUDENT') {
          navigate('/student');
        } else {
          navigate('/waiting-approval');
        }
      }, 700);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign in popup was closed before completion.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError('Domain not authorized in Firebase Console (Authentication > Settings > Authorized domains).');
      } else if (err.code === 'auth/invalid-api-key' || !import.meta.env.VITE_FIREBASE_API_KEY) {
        setAuthError('Firebase API key missing. Please configure your .env file with Firebase credentials.');
      } else {
        setAuthError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    const cleanEmail = email.trim().toLowerCase();

    // ── Hardcoded Super Admin Check ──
    if (cleanEmail === 'ragav@lms.com') {
      if (password === 'biher@mh_aiml') {
        setIsLoading(true);
        localStorage.setItem('lms_user', JSON.stringify({
          email: 'ragav@lms.com',
          name: 'Ragav Super Admin',
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
        }));

        setTimeout(() => {
          setIsLoading(false);
          setIsSuccess(true);
          setTimeout(() => {
            navigate('/super-admin');
          }, 600);
        }, 500);
        return;
      } else {
        setPasswordError(true);
        setAuthError('Invalid password for Super Admin account.');
        return;
      }
    }

    let isValid = true;
    if (!email || !email.includes('@')) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (!password || password.length < 4) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (!isValid) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      localStorage.setItem('lms_user', JSON.stringify({
        email,
        name: email.split('@')[0],
        role: 'USER',
        isSuperAdmin: false,
      }));
      setTimeout(() => {
        navigate('/waiting-approval');
      }, 800);
    }, 1000);
  };

  return (
    <main className="w-full min-h-screen flex flex-col p-6 sm:p-10 lg:p-16 xl:p-20 bg-surface">
      <div className="flex items-center justify-between pb-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/logo.png" alt="Aura Academia Logo" className="h-8 w-auto object-contain" />
          <span className="font-heading font-bold text-lg tracking-wider uppercase text-slate-900">Aura Academia</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 font-medium">
          <span>Need campus IT assistance?</span>
          <a href="#" className="text-brand-800 font-semibold hover:text-brand-600 transition-subtle">Help Center &rarr;</a>
        </div>
        <a href="#" className="lg:hidden text-xs font-semibold text-brand-800 hover:underline">Help & Docs</a>
      </div>

        <div className="w-full max-w-[440px] mx-auto my-auto py-4">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-200/70 text-[11px] font-semibold tracking-wider uppercase text-slate-600 mb-3">
              Academic Portal
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-normal">
              Sign in to continue your learning journey and coursework.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-3">
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
              className={`w-full h-11 px-4 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-subtle focus:outline-none focus:ring-2 focus:ring-brand-800/20 active:bg-slate-100 shadow-sm ${
                (googleLoading || isLoading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}>
              {googleLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-surface px-3 text-slate-400 font-semibold font-mono">OR</span>
            </div>
          </div>

          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="e.vance@university.edu"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-subtle shadow-xs"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {emailError && <p className="text-xs text-rose-600 mt-1 font-medium">Please enter a valid academic or institution email.</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-brand-800 hover:text-brand-600 transition-subtle focus:outline-none focus:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-3.5 pr-11 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-subtle shadow-xs"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-900 transition-subtle"
                  aria-label="Toggle password visibility">
                  {!showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <p className="text-xs text-rose-600 mt-1 font-medium">Password must be at least 8 characters.</p>}
            </div>

            <div className="flex items-center pt-1 pb-1">
              <input 
                id="remember" 
                name="remember" 
                type="checkbox" 
                defaultChecked
                className="w-4 h-4 rounded text-brand-800 border-slate-300 focus:ring-brand-800/30 cursor-pointer accent-brand-800"
              />
              <label htmlFor="remember" className="ml-2.5 block text-xs font-medium text-slate-600 cursor-pointer select-none">
                Remember me on this authorized workstation (30 days)
              </label>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading || isSuccess}
                className={`w-full h-11 px-4 font-medium text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-brand-800 hover:bg-brand-700 active:bg-brand-900 text-white focus:ring-brand-800/40'
                } ${(isLoading || isSuccess) ? 'opacity-90 cursor-not-allowed' : ''}`}>
                
                {isLoading ? (
                  <>
                    <span>Authenticating Credentials...</span>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : isSuccess ? (
                  <span>Redirecting to Dashboard...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>


        </div>

        <footer className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>&copy; 2026 Built by MH Cognition Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-800 transition-subtle">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-800 transition-subtle">Terms of Service</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-800 transition-subtle">Security Status</a>
          </div>
        </footer>

    </main>
  );
}

export default Login;
