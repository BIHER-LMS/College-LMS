import React, { useState, useEffect } from 'react';
import { fetchDepartments, fetchSubjects, createSubject } from '../../services/collegeService';

export function CollegeSubjects({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', code: '', credits: 3, semester_number: 1 });

  useEffect(() => { if (collegeId) fetchDepartments(collegeId).then(data => { setDepartments(data); if(data.length) setSelectedDept(data[0].id); }); }, [collegeId]);
  useEffect(() => { if (selectedDept) loadSubjects(); else setSubjects([]); }, [selectedDept]);

  const loadSubjects = async () => { setSubjects(await fetchSubjects(selectedDept)); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    await createSubject({ department_id: selectedDept, name: formData.name, code: formData.code, credits: formData.credits, semester_number: formData.semester_number, is_active: true });
    loadSubjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="h-10 px-3 border rounded-lg">{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      </div>
      <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl border">
        <div><label className="text-xs mb-1 block">Subject Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 px-3 border rounded-lg w-48" /></div>
        <div><label className="text-xs mb-1 block">Code</label><input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-10 px-3 border rounded-lg w-32 uppercase" /></div>
        <div><label className="text-xs mb-1 block">Credits</label><input required type="number" min="1" value={formData.credits} onChange={e => setFormData({...formData, credits: +e.target.value})} className="h-10 px-3 border rounded-lg w-20" /></div>
        <div><label className="text-xs mb-1 block">Semester</label><input required type="number" min="1" value={formData.semester_number} onChange={e => setFormData({...formData, semester_number: +e.target.value})} className="h-10 px-3 border rounded-lg w-24" /></div>
        <button type="submit" disabled={!selectedDept} className="h-10 px-4 bg-brand-600 text-white rounded-lg disabled:opacity-50">Add Subject</button>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs"><tr><th className="px-6 py-4">Sem</th><th className="px-6 py-4">Code</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Credits</th></tr></thead>
          <tbody className="divide-y">
            {subjects.map(s => <tr key={s.id}><td className="px-6 py-4">{s.semester_number}</td><td className="px-6 py-4 font-mono">{s.code}</td><td className="px-6 py-4">{s.name}</td><td className="px-6 py-4">{s.credits}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}