import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDepartments, fetchPrograms, createProgram } from '../../services/collegeService';

export function CollegePrograms({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'UG', duration_years: 4 });

  useEffect(() => {
    if (collegeId) {
      fetchDepartments(collegeId).then(data => {
        setDepartments(data);
        if (data.length) setSelectedDept(data[0].id);
      });
    }
  }, [collegeId]);

  useEffect(() => {
    if (selectedDept) loadPrograms();
    else setPrograms([]);
  }, [selectedDept]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await fetchPrograms(selectedDept);
      setPrograms(data);
    } catch (err) {
      console.error('Failed to load programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || creating) return;
    setCreating(true);
    try {
      await createProgram({
        department_id: selectedDept,
        name: formData.name,
        type: formData.type,
        duration_years: formData.duration_years,
        is_active: true
      });
      setFormData({ name: '', type: 'UG', duration_years: 4 });
      await loadPrograms();
    } catch (err) {
      console.error('Failed to create program:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="h-10 px-3 border rounded-lg bg-white text-sm"
        >
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl border">
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Program Name (e.g. B.Tech CSE)</label>
          <input
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="h-10 px-3 border rounded-lg text-sm"
            placeholder="e.g. B.Tech CSE"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="h-10 px-3 border rounded-lg text-sm bg-white"
          >
            <option value="UG">UG</option>
            <option value="PG">PG</option>
            <option value="Diploma">Diploma</option>
          </select>
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Duration (Years)</label>
          <input
            required
            type="number"
            min="1"
            max="10"
            value={formData.duration_years}
            onChange={e => setFormData({...formData, duration_years: +e.target.value})}
            className="h-10 w-24 px-3 border rounded-lg text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedDept || creating}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 text-sm transition disabled:opacity-50"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{creating ? 'Adding...' : 'Add Program'}</span>
        </button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <span className="text-xs font-medium text-slate-500">Loading programs...</span>
                  </div>
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                  No programs found for this department.
                </td>
              </tr>
            ) : (
              programs.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 text-slate-600">{p.type}</td>
                  <td className="px-6 py-4 text-slate-600">{p.duration_years} Years</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}