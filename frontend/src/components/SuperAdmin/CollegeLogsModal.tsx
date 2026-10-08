import { useState, useEffect } from 'react';
import { secureDataApi } from '../../services/api/secureDataApi';
import type { CollegeRecord } from '../../services/collegeService';
import { Clock, Shield, X, Check, XCircle, Building2 } from 'lucide-react';

interface CollegeLogsModalProps {
  college: CollegeRecord;
  onClose: () => void;
  notify: (msg: string, type?: 'success' | 'error') => void;
}

export function CollegeLogsModal({ college, onClose, notify }: CollegeLogsModalProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'approvals'>('logs');
  
  // Logs State
  const [logins, setLogins] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Approvals State
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else {
      fetchPendingUsers();
    }
  }, [activeTab]);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      // Fetch Logins - use secure API to list users for this college
      const userData = await secureDataApi.listUsers({ role: 'STUDENT' });
      // Filter by college if needed (SUPER_ADMIN can see all, but we filter here)
      const collegeLogins = userData.filter((u: any) => u.college_id === college.id);
      setLogins(collegeLogins.slice(0, 20));
      
      // Fetch Class Creations - use structure API
      const deptData = await secureDataApi.listStructure('departments', college.id);
      const deptIds = deptData.map((d: any) => d.id);
      
      let classData: any[] = [];
      if (deptIds.length > 0) {
        // Get classes from all departments
        for (const deptId of deptIds) {
          try {
            const programs = await secureDataApi.listStructure('programs', deptId);
            for (const prog of programs) {
              const batches = await secureDataApi.listStructure('batches', prog.id);
              for (const batch of batches) {
                const classes = await secureDataApi.listStructure('classes', batch.id);
                if (classes) {
                  for (const c of classes) {
                    classData.push({
                      ...c,
                      department_name: deptData.find((d: any) => d.id === deptId)?.name || 'Unknown Dept'
                    });
                  }
                }
              }
            }
          } catch (err) {
            console.warn('Error fetching classes for dept', deptId, err);
          }
        }
        classData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setClasses(classData.slice(0, 20));

      // Fetch Recent Department Creations
      const recentDepts = await secureDataApi.listStructure('departments', college.id);
      setDepartments(recentDepts?.slice(0, 20) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    setApprovalsLoading(true);
    try {
      const data = await secureDataApi.listUsers({ pending: true });
      // Filter by this college
      const collegePending = data.filter((u: any) => u.college_id === college.id);
      setPendingUsers(collegePending);
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const handleApproveAdmin = async (uid: string) => {
    try {
      await secureDataApi.reviewApproval(uid, 'APPROVED');
      notify('Approved College Admin successfully.', 'success');
      fetchPendingUsers();
    } catch (err: any) {
      notify('Failed to approve: ' + err.message, 'error');
    }
  };

  const handleRejectUser = async (uid: string) => {
    try {
      await secureDataApi.reviewApproval(uid, 'REJECTED');
      notify('User rejected.', 'success');
      fetchPendingUsers();
    } catch (err: any) {
      notify('Failed to reject: ' + err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-700">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-accent" />
              {college.name} - Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">Manage logs and approvals for this college</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-slate-700 bg-slate-800">
          <button 
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'logs' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'approvals' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveTab('approvals')}
          >
            Waiting Approvals
            {pendingUsers.length > 0 && activeTab !== 'approvals' && (
               <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>
            )}
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'logs' ? (
            <div className="space-y-8">
              {logsLoading ? (
                <div className="text-center text-slate-400 py-8">Loading logs...</div>
              ) : (
                <>
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" /> Recent Logins
                    </h3>
                    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Last Login</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {logins.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-3 text-slate-500 text-center">No logins recorded</td></tr>
                          ) : (
                            logins.map(l => (
                              <tr key={l.uid}>
                                <td className="px-4 py-3 font-medium text-slate-200">
                                  {l.display_name || 'Google User'} <br/>
                                  <span className="text-xs text-slate-500 font-mono">{l.email}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-xs">{l.role}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{l.last_login ? new Date(l.last_login).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" /> Recent Class Creations
                    </h3>
                    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">Class Name</th>
                            <th className="px-4 py-3">Department</th>
                            <th className="px-4 py-3">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {classes.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-3 text-slate-500 text-center">No classes created recently</td></tr>
                          ) : (
                            classes.map(c => (
                              <tr key={c.id}>
                                <td className="px-4 py-3 font-medium text-slate-200">{c.name}</td>
                                <td className="px-4 py-3 text-slate-400">{c.department_name}</td>
                                <td className="px-4 py-3 text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" /> Recent Department Creations
                    </h3>
                    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">Department Name</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {departments.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-3 text-slate-500 text-center">No departments created recently</td></tr>
                          ) : (
                            departments.map(d => (
                              <tr key={d.id}>
                                <td className="px-4 py-3 font-medium text-slate-200">{d.name}</td>
                                <td className="px-4 py-3 text-slate-400">{d.code}</td>
                                <td className="px-4 py-3 text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {approvalsLoading ? (
                <div className="text-center text-slate-400 py-8">Loading pending approvals...</div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center text-slate-400 py-12 bg-slate-900 rounded-lg border border-slate-700 border-dashed">
                  No users are currently waiting for approval in this college.
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingUsers.map(user => (
                    <div key={user.uid} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{user.display_name || user.email}</h4>
                        <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-600">
                            Requested: {user.requested_role}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {user.requested_role === 'COLLEGE_ADMIN' ? (
                          <>
                            <button 
                              onClick={() => handleApproveAdmin(user.uid)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-4 h-4" /> Approve
                            </button>
                            <button 
                              onClick={() => handleRejectUser(user.uid)}
                              className="px-3 py-1.5 bg-rose-900 text-rose-300 border border-rose-700/50 hover:bg-rose-800 hover:text-white rounded text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-amber-400/80 bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-500/20">
                            Requires College Admin Action
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}