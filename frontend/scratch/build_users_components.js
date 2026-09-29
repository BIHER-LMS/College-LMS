import fs from 'fs';
import path from 'path';

const srcDir = 'c:\\Users\\natha.HP\\OneDrive\\Documents\\GitHub\\College LMS\\frontend\\src';
const componentsDir = path.join(srcDir, 'components', 'CollegeAdmin');

const hodsContent = `import React, { useState, useEffect } from 'react';
import { fetchUsers, updateUserProfile, fetchDepartments } from '../../services/collegeService';

export function ManageHods({ collegeId }: { collegeId: string }) {
  const [hods, setHods] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (collegeId) {
      loadHods();
      fetchDepartments(collegeId).then(setDepartments);
    }
  }, [collegeId]);

  const loadHods = async () => {
    setHods(await fetchUsers({ college_id: collegeId, role: 'HOD' }));
  };

  const assignDepartment = async (uid: string, deptId: string) => {
    await updateUserProfile(uid, { department_id: deptId });
    loadHods();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Head of Departments</h2>
          <p className="text-sm text-slate-500">Manage and assign HODs to departments</p>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Assigned Department</th></tr>
          </thead>
          <tbody className="divide-y">
            {hods.map(h => (
              <tr key={h.id}>
                <td className="px-6 py-4 font-medium">{h.name}</td>
                <td className="px-6 py-4 text-slate-500">{h.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={h.department_id || ''} 
                    onChange={e => assignDepartment(h.uid, e.target.value)}
                    className="h-8 px-2 border rounded text-xs"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {hods.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No HOD accounts found in this college.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const facultyContent = `import React, { useState, useEffect } from 'react';
import { fetchUsers, updateUserProfile, fetchDepartments } from '../../services/collegeService';

export function ManageFaculty({ collegeId }: { collegeId: string }) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (collegeId) {
      loadFaculty();
      fetchDepartments(collegeId).then(setDepartments);
    }
  }, [collegeId]);

  const loadFaculty = async () => {
    setFaculty(await fetchUsers({ college_id: collegeId, role: 'FACULTY' }));
  };

  const assignDepartment = async (uid: string, deptId: string) => {
    await updateUserProfile(uid, { department_id: deptId });
    loadFaculty();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Faculty</h2>
          <p className="text-sm text-slate-500">Manage faculty members</p>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Department</th></tr>
          </thead>
          <tbody className="divide-y">
            {faculty.map(f => (
              <tr key={f.id}>
                <td className="px-6 py-4 font-medium">{f.name}</td>
                <td className="px-6 py-4 text-slate-500">{f.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={f.department_id || ''} 
                    onChange={e => assignDepartment(f.uid, e.target.value)}
                    className="h-8 px-2 border rounded text-xs"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No Faculty accounts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const studentsContent = `import React, { useState, useEffect } from 'react';
import { fetchUsers, updateUserProfile, fetchDepartments, fetchPrograms, fetchBatches, fetchClasses } from '../../services/collegeService';

export function ManageStudents({ collegeId }: { collegeId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  
  useEffect(() => {
    if (collegeId) {
      loadStudents();
      fetchDepartments(collegeId).then(data => { setDepartments(data); if(data.length) setSelectedDept(data[0].id); });
    }
  }, [collegeId]);

  const loadStudents = async () => {
    setStudents(await fetchUsers({ college_id: collegeId, role: 'STUDENT' }));
  };

  const handleUpdate = async (uid: string, field: string, value: string) => {
    await updateUserProfile(uid, { [field]: value });
    loadStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Students</h2>
          <p className="text-sm text-slate-500">Manage student enrollments</p>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Register No.</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Department</th></tr>
          </thead>
          <tbody className="divide-y">
            {students.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-mono"><input value={s.register_number || ''} onBlur={e => handleUpdate(s.uid, 'register_number', e.target.value)} onChange={e => { s.register_number = e.target.value; setStudents([...students]); }} className="w-24 border px-2 py-1 text-xs rounded" placeholder="Set Reg No" /></td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4 text-slate-500">{s.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={s.department_id || ''} 
                    onChange={e => handleUpdate(s.uid, 'department_id', e.target.value)}
                    className="h-8 px-2 border rounded text-xs"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No Student accounts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

fs.writeFileSync(path.join(componentsDir, 'ManageHods.tsx'), hodsContent);
fs.writeFileSync(path.join(componentsDir, 'ManageFaculty.tsx'), facultyContent);
fs.writeFileSync(path.join(componentsDir, 'ManageStudents.tsx'), studentsContent);

console.log('Built all Users components!');
