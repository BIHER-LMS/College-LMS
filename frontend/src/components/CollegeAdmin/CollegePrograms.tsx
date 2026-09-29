import React, { useState, useEffect } from 'react';
import { fetchDepartments, fetchPrograms, createProgram } from '../../services/collegeService';

export function CollegePrograms({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', type: 'UG', duration_years: 4 });

  useEffect(() => {
    if (collegeId) fetchDepartments(collegeId).then(data => { setDepartments(data); if(data.length) setSelectedDept(data[0].id); });
  }, [collegeId]);

  useEffect(() => { if (selectedDept) loadPrograms(); }, [selectedDept]);

  const loadPrograms = async () => { setPrograms(await fetchPrograms(selectedDept)); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    await createProgram({ department_id: selectedDept, name: formData.name, type: formData.type, duration_years: formData.duration_years, is_active: true });
    loadPrograms();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4"><select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="h-10 px-3 border rounded-lg">{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
      <form onSubmit={handleCreate} className="flex gap-4 items-end bg-white p-4 rounded-xl border">
        <div><label className="text-xs mb-1 block">Program Name (e.g. B.Tech CSE)</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 px-3 border rounded-lg" /></div>
        <div><label className="text-xs mb-1 block">Type</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="h-10 px-3 border rounded-lg"><option value="UG">UG</option><option value="PG">PG</option><option value="Diploma">Diploma</option></select></div>
        <div><label className="text-xs mb-1 block">Duration (Years)</label><input required type="number" value={formData.duration_years} onChange={e => setFormData({...formData, duration_years: +e.target.value})} className="h-10 w-20 px-3 border rounded-lg" /></div>
        <button type="submit" className="h-10 px-4 bg-brand-600 text-white rounded-lg">Add Program</button>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Duration</th></tr></thead>
          <tbody className="divide-y">
            {programs.map(p => <tr key={p.id}><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4">{p.type}</td><td className="px-6 py-4">{p.duration_years} Years</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}