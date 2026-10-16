import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDepartments, fetchPrograms, fetchBatches, createBatch } from '../../services/collegeService';

export function CollegeBatches({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ start_year: new Date().getFullYear(), end_year: new Date().getFullYear() + 4 });

  useEffect(() => {
    if (collegeId) {
      fetchDepartments(collegeId).then(data => {
        setDepartments(data);
        if (data.length) setSelectedDept(data[0].id);
      });
    }
  }, [collegeId]);

  useEffect(() => { 
    if (selectedDept) {
      fetchPrograms(selectedDept).then(data => {
        setPrograms(data);
        if (data.length) setSelectedProgram(data[0].id);
        else setSelectedProgram('');
      });
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedProgram) loadBatches();
    else setBatches([]);
  }, [selectedProgram]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await fetchBatches(selectedProgram);
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || creating) return;
    setCreating(true);
    try {
      await createBatch({
        program_id: selectedProgram,
        start_year: formData.start_year,
        end_year: formData.end_year,
        is_active: true
      });
      await loadBatches();
    } catch (err) {
      console.error('Failed to create batch:', err);
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
        <select
          value={selectedProgram}
          onChange={e => setSelectedProgram(e.target.value)}
          className="h-10 px-3 border rounded-lg bg-white text-sm"
        >
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl border">
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Start Year</label>
          <input
            required
            type="number"
            value={formData.start_year}
            onChange={e => setFormData({...formData, start_year: +e.target.value})}
            className="h-10 px-3 border rounded-lg w-32 text-sm"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">End Year</label>
          <input
            required
            type="number"
            value={formData.end_year}
            onChange={e => setFormData({...formData, end_year: +e.target.value})}
            className="h-10 px-3 border rounded-lg w-32 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedProgram || creating}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 text-sm transition disabled:opacity-50"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{creating ? 'Adding...' : 'Add Batch'}</span>
        </button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Batch</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <span className="text-xs font-medium text-slate-500">Loading batches...</span>
                  </div>
                </td>
              </tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-400 text-sm">
                  {selectedProgram ? 'No batches found for this program.' : 'Please select a program.'}
                </td>
              </tr>
            ) : (
              batches.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{b.start_year} - {b.end_year}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}