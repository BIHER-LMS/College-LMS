import { useState, useEffect } from 'react';
import { fetchUsers, updateUserProfile, fetchDepartments } from '../../services/collegeService';

export function ManageFaculty({ collegeId }: { collegeId: string }) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (collegeId) {
      loadFaculty();
      fetchDepartments(collegeId).then(setDepartments);
    }
  }, [collegeId]);

  const loadFaculty = async () => {
    setFaculty(await fetchUsers({ college_id: collegeId, role: 'FACULTY' }));
  };

  const assignDepartment = async (uid: string, deptId: string) => {
    await updateUserProfile(uid, { department_id: deptId });
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
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Department</th></tr>
          </thead>
          <tbody className="divide-y">
            {faculty.map(f => (
              <tr key={f.id}>
                <td className="px-6 py-4 font-medium">{f.name}</td>
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