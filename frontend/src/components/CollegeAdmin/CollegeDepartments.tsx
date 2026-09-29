import React, { useState, useEffect } from 'react';
import { fetchDepartments, createDepartment } from '../../services/collegeService';
import type { DepartmentRecord } from '../../services/collegeService';

export function CollegeDepartments({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    if (collegeId) loadDepartments();
  }, [collegeId]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await fetchDepartments(collegeId);
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId) return alert('No college assigned to your account.');
    try {
      await createDepartment({
        college_id: collegeId,
        name: formData.name,
        code: formData.code,
        hod_uid: null,
        is_active: true
      });
      setFormData({ name: '', code: '' });
      setIsCreateOpen(false);
      loadDepartments();
    } catch (err) {
      console.error(err);
      alert('Failed to create department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-500">Manage academic departments</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">+ Add Department</button>
      </div>

      {isCreateOpen && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-lg">
          <div><label className="block text-xs font-semibold mb-1">Department Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-3 border rounded-lg" /></div>
          <div><label className="block text-xs font-semibold mb-1">Code</label><input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full h-10 px-3 border rounded-lg uppercase" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Create</button></div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : departments.length === 0 ? <div className="p-8 text-center text-slate-500">No departments.</div> : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs"><tr><th className="px-6 py-4">Code</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-200">
              {departments.map(dept => (
                <tr key={dept.id}><td className="px-6 py-4 font-mono">{dept.code}</td><td className="px-6 py-4">{dept.name}</td><td className="px-6 py-4">{dept.is_active ? 'Active' : 'Inactive'}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}