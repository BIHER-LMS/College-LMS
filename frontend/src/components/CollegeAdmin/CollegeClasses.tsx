import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDepartments, fetchPrograms, fetchBatches, fetchClasses, createClass } from '../../services/collegeService';

export function CollegeClasses({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', current_semester: 1 });

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
    if (selectedProgram) {
      fetchBatches(selectedProgram).then(data => {
        setBatches(data);
        if (data.length) setSelectedBatch(data[0].id);
        else setSelectedBatch('');
      });
    } else {
      setBatches([]);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedBatch) loadClasses();
    else setClasses([]);
  }, [selectedBatch]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await fetchClasses(selectedBatch);
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || creating) return;
    setCreating(true);
    try {
      await createClass({
        batch_id: selectedBatch,
        name: formData.name,
        current_semester: formData.current_semester,
        faculty_uid: null,
        is_active: true
      });
      setFormData({ name: '', current_semester: 1 });
      await loadClasses();
    } catch (err) {
      console.error('Failed to create class:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
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
        <select
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
          className="h-10 px-3 border rounded-lg bg-white text-sm"
        >
          {batches.map(b => <option key={b.id} value={b.id}>{b.start_year}-{b.end_year}</option>)}
        </select>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl border">
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Class/Section Name (e.g. A)</label>
          <input
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="h-10 px-3 border rounded-lg w-48 text-sm"
            placeholder="e.g. Section A"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Current Semester</label>
          <input
            required
            type="number"
            min="1"
            value={formData.current_semester}
            onChange={e => setFormData({...formData, current_semester: +e.target.value})}
            className="h-10 px-3 border rounded-lg w-24 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedBatch || creating}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 text-sm transition disabled:opacity-50"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{creating ? 'Adding...' : 'Add Class'}</span>
        </button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Section Name</th>
              <th className="px-6 py-4">Current Semester</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <span className="text-xs font-medium text-slate-500">Loading classes...</span>
                  </div>
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-400 text-sm">
                  {selectedBatch ? 'No classes found for this batch.' : 'Please select a batch.'}
                </td>
              </tr>
            ) : (
              classes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600">Semester {c.current_semester}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}