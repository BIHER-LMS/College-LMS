import fs from 'fs';
import path from 'path';

const srcDir = 'c:\\Users\\natha.HP\\OneDrive\\Documents\\GitHub\\College LMS\\frontend\\src';
const componentsDir = path.join(srcDir, 'components', 'CollegeAdmin');

const departmentsContent = `import React, { useState, useEffect } from 'react';
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
}`;

const programsContent = `import React, { useState, useEffect } from 'react';
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
}`;

const batchesContent = `import React, { useState, useEffect } from 'react';
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
        <button type="submit" disabled={!selectedProgram} className="h-10 px-4 bg-brand-600 text-white rounded-lg disabled:opacity-50">Add Batch</button>
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
}`;

const classesContent = `import React, { useState, useEffect } from 'react';
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
}`;

const subjectsContent = `import React, { useState, useEffect } from 'react';
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
}`;

fs.writeFileSync(path.join(componentsDir, 'CollegeDepartments.tsx'), departmentsContent);
fs.writeFileSync(path.join(componentsDir, 'CollegePrograms.tsx'), programsContent);
fs.writeFileSync(path.join(componentsDir, 'CollegeBatches.tsx'), batchesContent);
fs.writeFileSync(path.join(componentsDir, 'CollegeClasses.tsx'), classesContent);
fs.writeFileSync(path.join(componentsDir, 'CollegeSubjects.tsx'), subjectsContent);

console.log('Built all Academics components!');
