import React, { useState, useEffect } from 'react';
import { fetchDepartments, fetchPrograms, fetchBatches, createBatch } from '../../services/collegeService';

export function CollegeBatches({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [formData, setFormData] = useState({ start_year: new Date().getFullYear(), end_year: new Date().getFullYear() + 4 });

  useEffect(() => {
    if (collegeId) fetchDepartments(collegeId).then(data => { setDepartments(data); if(data.length) setSelectedDept(data[0].id); });
  }, [collegeId]);

  useEffect(() => { 
    if (selectedDept) fetchPrograms(selectedDept).then(data => { setPrograms(data); if(data.length) setSelectedProgram(data[0].id); else setSelectedProgram(''); }); 
  }, [selectedDept]);

  useEffect(() => { if (selectedProgram) loadBatches(); else setBatches([]); }, [selectedProgram]);

  const loadBatches = async () => { setBatches(await fetchBatches(selectedProgram)); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    await createBatch({ program_id: selectedProgram, start_year: formData.start_year, end_year: formData.end_year, is_active: true });
    loadBatches();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="h-10 px-3 border rounded-lg">{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} className="h-10 px-3 border rounded-lg">{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </div>
      <form onSubmit={handleCreate} className="flex gap-4 items-end bg-white p-4 rounded-xl border">
        <div><label className="text-xs mb-1 block">Start Year</label><input required type="number" value={formData.start_year} onChange={e => setFormData({...formData, start_year: +e.target.value})} className="h-10 px-3 border rounded-lg w-32" /></div>
        <div><label className="text-xs mb-1 block">End Year</label><input required type="number" value={formData.end_year} onChange={e => setFormData({...formData, end_year: +e.target.value})} className="h-10 px-3 border rounded-lg w-32" /></div>
        <button type="submit" disabled={!selectedProgram} className="h-10 px-4 bg-blue-700 text-white rounded-lg disabled:opacity-50">Add Batch</button>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs"><tr><th className="px-6 py-4">Batch</th><th className="px-6 py-4">Status</th></tr></thead>
          <tbody className="divide-y">
            {batches.map(b => <tr key={b.id}><td className="px-6 py-4">{b.start_year} - {b.end_year}</td><td className="px-6 py-4">Active</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}