import { useState, useEffect } from 'react';
import { fetchUsers, fetchPendingUsers, updateUserProfile, fetchDepartments } from '../../services/collegeService';

export function ManageFaculty({ collegeId }: { collegeId: string }) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [pendingFaculty, setPendingFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (collegeId) {
      loadFaculty();
      fetchDepartments(collegeId).then(setDepartments);
    }
  }, [collegeId]);

  const loadFaculty = async () => {
    setFaculty(await fetchUsers({ college_id: collegeId, role: 'FACULTY' }));
    setPendingFaculty(await fetchPendingUsers(collegeId, 'FACULTY'));
  };

  const assignDepartment = async (uid: string, deptId: string) => {
    await updateUserProfile(uid, { department_id: deptId });
    loadFaculty();
  };

  const approveFaculty = async (uid: string) => {
    await updateUserProfile(uid, { role: 'FACULTY', approval_status: 'APPROVED' });
    loadFaculty();
  };

  const rejectFaculty = async (uid: string) => {
    await updateUserProfile(uid, { approval_status: 'REJECTED' });
    loadFaculty();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Faculty</h2>
          <p className="text-sm text-slate-500">Manage faculty members</p>
        </div>
      </div>

      {pendingFaculty.length > 0 && (
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
              {pendingFaculty.map(f => {
                const deptName = departments.find(d => d.id === f.department_id)?.name || 'Unknown';
                return (
                  <tr key={f.uid}>
                    <td className="px-6 py-4 font-medium">{f.display_name || 'No Name'}</td>
                    <td className="px-6 py-4 text-slate-500">{f.email}</td>
                    <td className="px-6 py-4 text-slate-500">{deptName}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => approveFaculty(f.uid)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectFaculty(f.uid)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
                        >
                          Reject
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
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Department</th></tr>
          </thead>
          <tbody className="divide-y">
            {faculty.map(f => (
              <tr key={f.uid}>
                <td className="px-6 py-4 font-medium">{f.display_name || 'No Name'}</td>
                <td className="px-6 py-4 text-slate-500">{f.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={f.department_id || ''} 
                    onChange={e => assignDepartment(f.uid, e.target.value)}
                    className="h-8 px-2 border rounded text-xs"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No Faculty accounts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}