import React, { useState, useEffect } from 'react';
import { fetchDepartments, createDepartment, deleteDepartment, fetchEligibleHODs } from '../../services/collegeService';
import type { DepartmentRecord, AuthedUserRecord } from '../../services/collegeService';
import { Building2, Plus, Users, Search, AlertCircle, Loader2 } from 'lucide-react';

export function CollegeDepartments({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [eligibleHODs, setEligibleHODs] = useState<AuthedUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '',
    hod_uid: '',
    is_active: true
  });

  useEffect(() => {
    if (collegeId) {
      loadDepartments();
      loadEligibleHODs();
    }
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

  const loadEligibleHODs = async () => {
    try {
      const data = await fetchEligibleHODs(collegeId);
      setEligibleHODs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId) return alert('No college assigned to your account.');
    
    setError(null);
    setSubmitLoading(true);
    
    try {
      await createDepartment({
        college_id: collegeId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        hod_uid: formData.hod_uid || null,
        is_active: formData.is_active
      });
      setFormData({ name: '', code: '', hod_uid: '', is_active: true });
      setIsCreateOpen(false);
      loadDepartments();
      loadEligibleHODs(); // Refresh HODs since one might have been assigned
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create department');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department? This may affect programs and subjects under it.')) return;
    try {
      await deleteDepartment(id);
      loadDepartments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete department');
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Departments
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage academic departments and assign HODs</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-800">Create New Department</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    placeholder="e.g., Computer Science and Engineering"
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department Code <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    placeholder="e.g., CSE"
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value })} 
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow font-mono" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Short unique code for the department.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Head of Department (Optional)
                  </label>
                  <select
                    value={formData.hod_uid}
                    onChange={e => setFormData({ ...formData, hod_uid: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {eligibleHODs.map(hod => (
                      <option key={hod.uid} value={hod.uid}>
                        {hod.displayName || hod.email}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Select from available unassigned HODs in your college.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p>Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Building2 className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">No departments found</h3>
            <p className="text-sm">Get started by creating a new academic department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">HOD</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{dept.code}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{dept.name}</td>
                    <td className="px-6 py-4">
                      {dept.hod_uid ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-xs truncate max-w-[150px]" title={dept.hod_uid}>Assigned</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${dept.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="text-rose-600 hover:text-rose-800 font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}