import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CollegeRecord, AuthedUserRecord } from '../services/collegeService';
import { 
  fetchColleges, 
  createCollege, 
  updateCollege, 
  deleteCollege,
  fetchAuthedUsers,
  updateUserProfile,
  deleteAuthedUser
} from '../services/collegeService';
import { CollegeLogsModal } from '../components/SuperAdmin/CollegeLogsModal';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<CollegeRecord[]>([]);
  const [authedUsers, setAuthedUsers] = useState<AuthedUserRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeRecord | null>(null);
  const [assigningCollege, setAssigningCollege] = useState<CollegeRecord | null>(null);
  const [selectedCollegeLogs, setSelectedCollegeLogs] = useState<CollegeRecord | null>(null);
  const [showSqlHelper, setShowSqlHelper] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    domain: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    adminEmail: '',
    adminName: '',
    isActive: true,
  });

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    // Check Super Admin auth
    const rawUser = localStorage.getItem('lms_user');
    if (!rawUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(rawUser);
    if (user.role !== 'SUPER_ADMIN') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [colls, users] = await Promise.all([
        fetchColleges(),
        fetchAuthedUsers()
      ]);
      setColleges(colls);
      setAuthedUsers(users);
    } catch (e) {
      console.error(e);
      notify('Failed to load data from Supabase', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    navigate('/login');
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      code: '',
      domain: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      phone: '',
      email: '',
      website: '',
      logoUrl: '',
      adminEmail: '',
      adminName: '',
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const openEditModal = (col: CollegeRecord) => {
    setEditingCollege(col);
    setFormData({
      name: col.name,
      code: col.code,
      domain: col.domain || '',
      address: col.address || '',
      city: col.city || '',
      state: col.state || '',
      country: col.country || 'India',
      phone: col.phone || '',
      email: col.email || '',
      website: col.website || '',
      logoUrl: col.logoUrl || '',
      adminEmail: col.adminEmail || '',
      adminName: col.adminName || '',
      isActive: col.isActive,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      notify('Name and College Code are required', 'error');
      return;
    }

    try {
      const newCol = await createCollege({
        name: formData.name,
        code: formData.code.toUpperCase(),
        domain: formData.domain || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || 'India',
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        logoUrl: formData.logoUrl || null,
        adminEmail: formData.adminEmail || null,
        adminName: formData.adminName || null,
        isActive: formData.isActive,
      });

      setColleges([newCol, ...colleges]);
      setIsCreateOpen(false);
      notify(`College "${newCol.name}" created and synced to Supabase!`);
    } catch (err: any) {
      notify('Error creating college: ' + err.message, 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;

    try {
      const updatedList = await updateCollege(editingCollege.id, {
        name: formData.name,
        code: formData.code.toUpperCase(),
        domain: formData.domain || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || 'India',
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        logoUrl: formData.logoUrl || null,
        adminEmail: formData.adminEmail || null,
        adminName: formData.adminName || null,
        isActive: formData.isActive,
      });

      setColleges(updatedList);
      setEditingCollege(null);
      notify(`College "${formData.name}" updated successfully!`);
    } catch (err: any) {
      notify('Error updating college: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const updated = await deleteCollege(id);
      setColleges(updated);
      notify(`College ${name} removed.`);
    } catch (err: any) {
      notify('Failed to delete college: ' + err.message, 'error');
    }
  };

  const handleAssignAdmin = async (collegeId: string, user: AuthedUserRecord) => {
    try {
      const updated = await updateCollege(collegeId, {
        adminEmail: user.email,
        adminName: user.displayName || user.email.split('@')[0],
        adminUid: user.uid,
      });
      
      // Crucial: Update the user's role and college_id in authed_users
      await updateUserProfile(user.uid, {
        role: 'COLLEGE_ADMIN',
        college_id: collegeId,
      });

      setColleges(updated);
      setAuthedUsers(prev => prev.map(u => 
        u.uid === user.uid 
          ? { ...u, role: 'COLLEGE_ADMIN', college_id: collegeId } 
          : u
      ));
      setAssigningCollege(null);
      notify(`Assigned ${user.email} as College Admin!`);
    } catch (err: any) {
      notify('Failed to assign admin: ' + err.message, 'error');
    }
  };

  const filteredColleges = colleges.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.adminEmail && c.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const supabaseSqlScript = `Security notice: the production database schema already exists.
Do not create public policies or grant anonymous access to college or user data.
See docs/RLS_AUTHORIZATION_DESIGN.md for the reviewed authorization model.
Database policy changes must be coordinated with verified backend API cutover.`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand-accent selection:text-brand-900">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border flex items-center gap-3 transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950 border-rose-500/50 text-rose-200'
        }`}>
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Aura Logo" className="h-8 w-auto object-contain" />
              <span className="font-heading font-bold text-lg tracking-wider uppercase text-white">Aura Academia</span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-brand-800/80 text-brand-accent text-xs font-mono font-medium uppercase tracking-wider border border-brand-accent/20">
              Super Admin Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Supabase Connected:</span>
              <span className="font-mono text-emerald-400">lmnbsauvjqursjxocsgf</span>
            </div>

            <button 
              onClick={() => setShowSqlHelper(true)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors">
              Security Guidance
            </button>

            <div className="h-4 w-px bg-slate-700"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">{currentUser?.name || 'Super Admin'}</div>
                <div className="text-[11px] text-slate-400 font-mono">{currentUser?.email || 'admin@lms.com'}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-xs font-medium transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Institutions</span>
            <div className="text-2xl font-bold font-heading text-white mt-1">{colleges.length}</div>
            <p className="text-xs text-slate-400 mt-1">Saved in Supabase tenant registry</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Colleges</span>
            <div className="text-2xl font-bold font-heading text-emerald-400 mt-1">
              {colleges.filter(c => c.isActive).length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Operational campus workspaces</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Admins</span>
            <div className="text-2xl font-bold font-heading text-brand-accent mt-1">
              {colleges.filter(c => c.adminEmail).length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Institutions with designated leads</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Google Auth Users</span>
            <div className="text-2xl font-bold font-heading text-purple-400 mt-1">
              {authedUsers.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Eligible candidates for College Admin</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Search by college name, code, city, admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent"
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <button 
            onClick={openCreateModal}
            className="h-10 px-4 rounded-lg bg-brand-800 hover:bg-brand-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-brand-accent/40 shadow-sm transition-all hover:shadow-brand-accent/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New College</span>
          </button>
        </div>

        {/* Colleges Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs">Connecting to Supabase and retrieving colleges...</span>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-700">
            <p className="text-sm text-slate-400">No colleges found matching "{searchTerm}"</p>
            <button 
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded text-xs font-medium">
              Add Your First College
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((col) => (
              <div 
                key={col.id} 
                className="bg-slate-800/50 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between overflow-hidden shadow-lg">
                
                {/* College Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {col.logoUrl ? (
                          <img 
                            src={col.logoUrl} 
                            alt={col.name} 
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="font-heading font-bold text-brand-accent text-base uppercase">
                            {col.code ? col.code.slice(0, 3) : 'LMS'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-900 text-brand-accent font-semibold border border-brand-700/50">
                            {col.code}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${col.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        </div>
                        <h3 className="font-heading font-semibold text-base text-white mt-1 leading-snug">
                          {col.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                    {col.domain && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-16">Domain:</span>
                        <span className="font-mono text-slate-200">@{col.domain}</span>
                      </div>
                    )}
                    {col.city && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-16">Location:</span>
                        <span>{col.city}{col.state ? `, ${col.state}` : ''}</span>
                      </div>
                    )}
                    {col.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-16">Email:</span>
                        <a href={`mailto:${col.email}`} className="text-brand-accent hover:underline truncate">{col.email}</a>
                      </div>
                    )}
                    {col.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-16">Website:</span>
                        <a href={col.website} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline truncate">{col.website}</a>
                      </div>
                    )}
                  </div>

                  {/* Assigned Admin section */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold mb-1">
                      Assigned College Admin
                    </span>
                    {col.adminEmail ? (
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white truncate">{col.adminName || 'Admin'}</div>
                          <div className="text-[11px] text-brand-accent font-mono truncate">{col.adminEmail}</div>
                        </div>
                        <button 
                          onClick={() => setAssigningCollege(col)}
                          className="text-[11px] text-slate-400 hover:text-white underline ml-2 shrink-0">
                          Change
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAssigningCollege(col)}
                        className="w-full py-1.5 px-2 rounded border border-dashed border-brand-accent/40 text-brand-accent hover:bg-brand-accent/10 text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                        <span>+ Assign Google-Authed Admin</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* College Card Actions */}
                <div className="p-3 bg-slate-900/80 border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(col)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
                      Edit Details
                    </button>
                    <button 
                      onClick={() => setSelectedCollegeLogs(col)}
                      className="px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 transition-colors">
                      View Logs
                    </button>
                    <button 
                      onClick={async () => {
                        const updated = await updateCollege(col.id, { isActive: !col.isActive });
                        setColleges(updated);
                        notify(`${col.name} is now ${!col.isActive ? 'Active' : 'Inactive'}`);
                      }}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        col.isActive 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}>
                      {col.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDelete(col.id, col.name)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                    title="Delete college">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Google-Authed Users Table */}
        <section className="mt-14 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-semibold text-lg text-white">Google Authenticated Users</h2>
              <p className="text-xs text-slate-400">Users who authenticated via Google Auth and can be assigned as College Admins</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
              {authedUsers.length} Recorded Users
            </span>
          </div>

          {authedUsers.length === 0 ? (
            <div className="p-6 rounded-lg bg-slate-800/30 border border-slate-700/60 text-center text-xs text-slate-400">
              No users have authenticated via Google yet. Once any student, faculty, or staff signs in with Google, their profile will appear here ready to be assigned as a College Admin.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-800/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Quick Assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {authedUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-white">{u.displayName || 'Google User'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-mono">
                          {u.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(u.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        {u.role === 'COLLEGE_ADMIN' && u.college_id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-medium px-2 py-1 bg-emerald-900/30 rounded border border-emerald-800/50 text-[11px]">
                              Assigned to {colleges.find(c => c.id === u.college_id)?.name || 'College'}
                            </span>
                            <button
                              onClick={async () => {
                                if (confirm(`Remove ${u.email} as College Admin?`)) {
                                  // Update user role back to user
                                  await updateUserProfile(u.uid, { role: 'USER', college_id: null });
                                  
                                  // Update college record if needed
                                  const college = colleges.find(c => c.id === u.college_id);
                                  if (college) {
                                    const updated = await updateCollege(college.id, { adminEmail: null, adminName: null, adminUid: null });
                                    setColleges(updated);
                                  }
                                  
                                  setAuthedUsers(prev => prev.map(user => user.uid === u.uid ? { ...user, role: 'USER', college_id: undefined } : user));
                                  notify(`Removed ${u.email} as College Admin`);
                                }
                              }}
                              className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 ml-2"
                            >
                              Unassign
                            </button>
                          </div>
                        ) : (
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignAdmin(e.target.value, u);
                              }
                            }}
                            value=""
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-brand-accent">
                            <option value="" disabled>Assign to College...</option>
                            {colleges.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${u.email} from database?`)) {
                              await deleteAuthedUser(u.uid);
                              setAuthedUsers(prev => prev.filter(user => user.uid !== u.uid));
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Remove user from database"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* CREATE / EDIT COLLEGE MODAL */}
      {(isCreateOpen || editingCollege) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white">
                {editingCollege ? `Edit ${editingCollege.name}` : 'Create New College Institution'}
              </h3>
              <button 
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCollege(null);
                }}
                className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={editingCollege ? handleEditSubmit : handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    College Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Stanford University"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    College Code *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. STAN"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white uppercase font-mono focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Allowed Email Domain
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. stanford.edu"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Official Website
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://stanford.edu"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Logo setup */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  College Logo URL / Image Source
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="text" 
                    placeholder="https://example.com/logo.png or /logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="flex-1 h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                  {formData.logoUrl && (
                    <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    City
                  </label>
                  <input 
                    type="text" 
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    State
                  </label>
                  <input 
                    type="text" 
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Country
                  </label>
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Assign College Admin directly */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
                <label className="block text-xs font-semibold text-brand-accent uppercase mb-1">
                  Assign College Admin (from Google-Authed Users)
                </label>
                <select 
                  value={formData.adminEmail}
                  onChange={(e) => {
                    const selected = authedUsers.find(u => u.email === e.target.value);
                    setFormData({
                      ...formData,
                      adminEmail: e.target.value,
                      adminName: selected ? (selected.displayName || selected.email) : formData.adminName,
                    });
                  }}
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent">
                  <option value="">-- No Admin Selected (Assign Later) --</option>
                  {authedUsers.map(u => (
                    <option key={u.email} value={u.email}>
                      {u.displayName ? `${u.displayName} (${u.email})` : u.email}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Or enter an email manually if the person hasn't logged in yet:
                </p>
                <input 
                  type="email" 
                  placeholder="admin.email@college.edu"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full h-9 px-3 mt-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-accent focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Activate College Institution immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCollege(null);
                  }}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded bg-brand-800 hover:bg-brand-700 text-xs text-white font-semibold uppercase tracking-wider border border-brand-accent/30">
                  {editingCollege ? 'Save Changes' : 'Create College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ASSIGN ADMIN MODAL */}
      {assigningCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6">
            <h3 className="font-heading font-bold text-base text-white mb-2">
              Assign Admin for {assigningCollege.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select any user who has signed in through Google Auth:
            </p>

            {authedUsers.length === 0 ? (
              <div className="p-4 bg-slate-800 rounded text-xs text-slate-400 text-center mb-4">
                No users have signed in via Google yet. Sign in once with a Google account to assign them here.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {authedUsers.map(u => (
                  <button 
                    key={u.email}
                    onClick={() => handleAssignAdmin(assigningCollege.id, u)}
                    className="w-full p-2.5 rounded-lg bg-slate-800 hover:bg-brand-900 border border-slate-700 hover:border-brand-accent flex items-center justify-between text-left transition-all">
                    <div>
                      <div className="text-xs font-semibold text-white">{u.displayName || 'Google User'}</div>
                      <div className="text-[11px] font-mono text-brand-accent">{u.email}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Assign &rarr;</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setAssigningCollege(null)}
                className="px-4 py-1.5 rounded bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL SCHEMA MODAL HELPER */}
      {showSqlHelper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <span>Production Database Security</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-900 text-brand-accent">Do Not Run Public Policies</span>
              </h3>
              <button onClick={() => setShowSqlHelper(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Never grant anonymous access to private LMS tables. Review the security design before changing database privileges:
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">
              {supabaseSqlScript}
            </pre>
            <div className="mt-4 flex justify-between items-center">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(supabaseSqlScript);
                  notify('Security guidance copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white rounded text-xs font-semibold">
                Copy Guidance
              </button>
              <button 
                onClick={() => setShowSqlHelper(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCollegeLogs && (
        <CollegeLogsModal 
          college={selectedCollegeLogs}
          onClose={() => setSelectedCollegeLogs(null)}
          notify={notify}
        />
      )}
    </div>
  );
}
