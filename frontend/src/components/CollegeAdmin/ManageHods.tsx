import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchUsers, fetchPendingUsers, updateUserProfile, fetchDepartments, reviewUserApproval } from '../../services/collegeService';

export function ManageHods({ collegeId }: { collegeId: string }) {
  const [hods, setHods] = useState<any[]>([]);
  const [pendingHods, setPendingHods] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ uid: string; type: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    if (collegeId) {
      loadHods();
      fetchDepartments(collegeId).then(setDepartments);
    }
  }, [collegeId]);

  const loadHods = async () => {
    setHods(await fetchUsers({ college_id: collegeId, role: 'HOD' }));
    setPendingHods(await fetchPendingUsers(collegeId, 'HOD'));
  };

  const assignDepartment = async (uid: string, deptId: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { department_id: deptId || null });
      await loadHods();
    } catch (e: any) {
      console.error('Error assigning department:', e);
      alert(e?.message || 'Failed to assign department.');
      await loadHods();
    } finally {
      setUpdatingUid(null);
    }
  };

  const approveHod = async (uid: string) => {
    setActionLoading({ uid, type: 'approve' });
    try {
      await reviewUserApproval(uid, 'APPROVED');
      await loadHods();
    } catch (e: any) {
      console.error('Error approving HOD:', e);
      alert(e?.message || 'Failed to approve HOD.');
      await loadHods();
    } finally {
      setActionLoading(null);
    }
  };

  const rejectHod = async (uid: string) => {
    setActionLoading({ uid, type: 'reject' });
    try {
      await reviewUserApproval(uid, 'REJECTED');
      await loadHods();
    } catch (e: any) {
      console.error('Error rejecting HOD:', e);
      alert(e?.message || 'Failed to reject HOD.');
      await loadHods();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Head of Departments</h2>
          <p className="text-sm text-slate-500">Manage and assign HODs to departments</p>
        </div>
      </div>

      {pendingHods.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-amber-50 px-6 py-3 border-b border-amber-200">
            <h3 className="font-semibold text-amber-800">Awaiting Approval</h3>
          </div>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Requested Department</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingHods.map(h => {
                const deptName = departments.find(d => d.id === h.department_id)?.name || 'Unknown';
                const isApproving = actionLoading?.uid === h.uid && actionLoading?.type === 'approve';
                const isRejecting = actionLoading?.uid === h.uid && actionLoading?.type === 'reject';
                const isActionDisabled = actionLoading?.uid === h.uid;

                return (
                  <tr key={h.uid}>
                    <td className="px-6 py-4 font-medium">{h.display_name || 'No Name'}</td>
                    <td className="px-6 py-4 text-slate-500">{h.email}</td>
                    <td className="px-6 py-4 text-slate-500">{deptName}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => approveHod(h.uid)}
                          disabled={isActionDisabled}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {isApproving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>{isApproving ? 'Approving...' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => rejectHod(h.uid)}
                          disabled={isActionDisabled}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-700">Active HODs</h3>
        </div>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Assigned Department</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hods.map(h => (
              <tr key={h.uid}>
                <td className="px-6 py-4 font-medium">{h.display_name || h.name || 'No Name'}</td>
                <td className="px-6 py-4 text-slate-500">{h.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={h.department_id || ''} 
                    disabled={updatingUid === h.uid}
                    onChange={e => assignDepartment(h.uid, e.target.value)}
                    className="h-8 px-2 border rounded text-xs disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {hods.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No active HOD accounts found in this college.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}