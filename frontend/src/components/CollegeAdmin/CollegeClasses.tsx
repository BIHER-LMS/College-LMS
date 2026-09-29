import React, { useState, useEffect } from 'react';
import { fetchDepartments, fetchPrograms, fetchBatches, fetchClasses, createClass } from '../../services/collegeService';

export function CollegeClasses({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', current_semester: 1 });

  useEffect(() => { if (collegeId) fetchDepartments(collegeId).then(data => { setDepartments(data); if(data.length) setSelectedDept(data[0].id); }); }, [collegeId]);
  useEffect(() => { if (selectedDept) fetchPrograms(selectedDept).then(data => { setPrograms(data); if(data.length) setSelectedProgram(data[0].id); else setSelectedProgram(''); }); }, [selectedDept]);
  useEffect(() => { if (selectedProgram) fetchBatches(selectedProgram).then(data => { setBatches(data); if(data.length) setSelectedBatch(data[0].id); else setSelectedBatch(''); }); else setBatches([]); }, [selectedProgram]);
  useEffect(() => { if (selectedBatch) loadClasses(); else setClasses([]); }, [selectedBatch]);

  const loadClasses = async () => { setClasses(await fetchClasses(selectedBatch)); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    await createClass({ batch_id: selectedBatch, name: formData.name, current_semester: formData.current_semester, faculty_uid: null, is_active: true });
    loadClasses();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="h-10 px-3 border rounded-lg">{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} className="h-10 px-3 border rounded-lg">{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="h-10 px-3 border rounded-lg">{batches.map(b => <option key={b.id} value={b.id}>{b.start_year}-{b.end_year}</option>)}</select>
      </div>
      <form onSubmit={handleCreate} className="flex gap-4 items-end bg-white p-4 rounded-xl border">
        <div><label className="text-xs mb-1 block">Class/Section Name (e.g. A)</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 px-3 border rounded-lg w-48" /></div>
        <div><label className="text-xs mb-1 block">Current Semester</label><input required type="number" min="1" value={formData.current_semester} onChange={e => setFormData({...formData, current_semester: +e.target.value})} className="h-10 px-3 border rounded-lg w-24" /></div>
        <button type="submit" disabled={!selectedBatch} className="h-10 px-4 bg-brand-600 text-white rounded-lg disabled:opacity-50">Add Class</button>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs"><tr><th className="px-6 py-4">Section Name</th><th className="px-6 py-4">Current Semester</th></tr></thead>
          <tbody className="divide-y">
            {classes.map(c => <tr key={c.id}><td className="px-6 py-4">{c.name}</td><td className="px-6 py-4">{c.current_semester}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}