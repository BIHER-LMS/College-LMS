import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDepartments, fetchSubjects, createSubject } from '../../services/collegeService';

export function CollegeSubjects({ collegeId }: { collegeId: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', credits: 3, semester_number: 1 });

  useEffect(() => {
    if (collegeId) {
      fetchDepartments(collegeId).then(data => {
        setDepartments(data);
        if (data.length) setSelectedDept(data[0].id);
      });
    }
  }, [collegeId]);

  useEffect(() => {
    if (selectedDept) loadSubjects();
    else setSubjects([]);
  }, [selectedDept]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await fetchSubjects(selectedDept);
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || creating) return;
    setCreating(true);
    try {
      await createSubject({
        department_id: selectedDept,
        name: formData.name,
        code: formData.code,
        credits: formData.credits,
        semester_number: formData.semester_number,
        is_active: true
      });
      setFormData({ name: '', code: '', credits: 3, semester_number: 1 });
      await loadSubjects();
    } catch (err) {
      console.error('Failed to create subject:', err);
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
          <label className="text-xs mb-1 block text-slate-600 font-medium">Subject Name</label>
          <input
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="h-10 px-3 border rounded-lg w-48 text-sm"
            placeholder="e.g. Data Structures"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Code</label>
          <input
            required
            value={formData.code}
            onChange={e => setFormData({...formData, code: e.target.value})}
            className="h-10 px-3 border rounded-lg w-32 uppercase text-sm"
            placeholder="e.g. CS101"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Credits</label>
          <input
            required
            type="number"
            min="1"
            value={formData.credits}
            onChange={e => setFormData({...formData, credits: +e.target.value})}
            className="h-10 px-3 border rounded-lg w-20 text-sm"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block text-slate-600 font-medium">Semester</label>
          <input
            required
            type="number"
            min="1"
            value={formData.semester_number}
            onChange={e => setFormData({...formData, semester_number: +e.target.value})}
            className="h-10 px-3 border rounded-lg w-24 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedDept || creating}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 text-sm transition disabled:opacity-50"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{creating ? 'Adding...' : 'Add Subject'}</span>
        </button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Sem</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Credits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <span className="text-xs font-medium text-slate-500">Loading subjects...</span>
                  </div>
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                  {selectedDept ? 'No subjects found for this department.' : 'Please select a department.'}
                </td>
              </tr>
            ) : (
              subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-600">{s.semester_number}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{s.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4 text-slate-600">{s.credits}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}