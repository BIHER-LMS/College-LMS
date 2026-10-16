import { useState, useEffect } from 'react';
import {
  Loader2,
  Building2,
  School,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  fetchUsers,
  fetchPendingUsers,
  updateUserProfile,
  fetchDepartments,
  fetchAllCollegeClasses,
} from '../../services/collegeService';
import type { DepartmentRecord, ClassRecord, AuthedUserRecord } from '../../services/collegeService';

export function ManageStudents({ collegeId }: { collegeId: string }) {
  const [students, setStudents] = useState<AuthedUserRecord[]>([]);
  const [pendingStudents, setPendingStudents] = useState<AuthedUserRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (collegeId) {
      loadAllData();
    }
  }, [collegeId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [studentData, pendingData, deptData, clsData] = await Promise.all([
        fetchUsers({ college_id: collegeId, role: 'STUDENT' }),
        fetchPendingUsers(collegeId, 'STUDENT'),
        fetchDepartments(collegeId),
        fetchAllCollegeClasses(collegeId),
      ]);
      setStudents(studentData);
      setPendingStudents(pendingData);
      setDepartments(deptData);
      setClasses(clsData);
    } catch (err: any) {
      console.error('Error loading students:', err);
      showNotification('error', 'Failed to load student or academic records.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRegisterNumberUpdate = async (uid: string, regNo: string) => {
    const student = students.find((s) => s.uid === uid);
    if ((student?.register_number || '') === regNo.trim()) return;
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { register_number: regNo.trim() || null });
      showNotification('success', 'Register number updated successfully.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update register number.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleDepartmentChange = async (uid: string, newDeptId: string) => {
    if (!newDeptId) {
      showNotification('error', 'Student must belong to an active department.');
      return;
    }
    setUpdatingUid(uid);
    try {
      const student = students.find((st) => st.uid === uid);
      const isDeptChanging = student && student.department_id && student.department_id !== newDeptId;
      await updateUserProfile(uid, {
        department_id: newDeptId,
        ...(isDeptChanging ? { class_id: null } : {}),
      });
      showNotification('success', 'Department assignment updated.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update department.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleClassChange = async (uid: string, newClassId: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { class_id: newClassId || null });
      showNotification('success', 'Student class enrollment updated successfully.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update class assignment.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const approveStudent = async (uid: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { role: 'STUDENT', approval_status: 'APPROVED' });
      showNotification('success', 'Student account approved successfully.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to approve student.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const rejectStudent = async (uid: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { approval_status: 'REJECTED' });
      showNotification('success', 'Student application rejected.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to reject student.');
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Students</h2>
            <p className="text-xs text-slate-500">
              Manage student enrollments, academic departments, register numbers, and class sections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span>Total Enrolled:</span>
            <span className="text-blue-600 font-bold">{loading ? '...' : students.length}</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-2xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Awaiting Approval Section */}
      {pendingStudents.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-amber-50/80 px-6 py-3 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                Awaiting Approval ({pendingStudents.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Action Required</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Applicant</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Requested Department</th>
                  <th className="px-6 py-3.5">Requested Class</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingStudents.map((s) => {
                  const deptName = departments.find((d) => d.id === s.department_id)?.name || 'Unassigned';
                  const reqClass = classes.find((c) => c.id === s.class_id);
                  return (
                    <tr key={s.uid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                            {(s.displayName || s.email || 'S')[0].toUpperCase()}
                          </div>
                          <span>{s.displayName || 'No Name Set'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{s.email}</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">{deptName}</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        {reqClass ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                            {reqClass.name} (Sem {reqClass.current_semester || 1})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None Specified</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveStudent(s.uid)}
                            disabled={updatingUid === s.uid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectStudent(s.uid)}
                            disabled={updatingUid === s.uid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Students Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Approved Students Directory
            </h3>
            <p className="text-[11px] text-slate-400">
              Manage student register numbers, affiliated departments, and enrolled class sections.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Register No.</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-blue-600" />
                    <span>Class / Section</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                      <span className="text-xs font-medium text-slate-500">Loading student directory...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No approved student accounts found.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const assignedClass = classes.find((c) => c.id === s.class_id);

                  // Filter department classes vs other classes
                  const deptClasses = s.department_id
                    ? classes.filter((c) => c.batch?.program?.department_id === s.department_id)
                    : classes;
                  const otherClasses = s.department_id
                    ? classes.filter(
                        (c) =>
                          c.batch?.program?.department_id &&
                          c.batch.program.department_id !== s.department_id
                      )
                    : [];

                  const initials = (s.displayName || s.email || 'ST')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={s.uid} className="hover:bg-slate-50/50 transition-colors">
                      {/* Register Number Input */}
                      <td className="px-5 py-4">
                        <input
                          key={`${s.uid}-${s.register_number || 'none'}`}
                          defaultValue={s.register_number || ''}
                          onBlur={(e) => handleRegisterNumberUpdate(s.uid, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          disabled={updatingUid === s.uid}
                          className="h-8 w-32 px-2.5 font-mono text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Set Reg No"
                        />
                      </td>

                      {/* Student Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {s.displayName || 'No Name Set'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department Selector */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <select
                            value={s.department_id || ''}
                            onChange={(e) => handleDepartmentChange(s.uid, e.target.value)}
                            disabled={updatingUid === s.uid}
                            className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="" disabled>
                              Select Department
                            </option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.code})
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Enrolled Class / Section Column */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <select
                            value={s.class_id || ''}
                            onChange={(e) => handleClassChange(s.uid, e.target.value)}
                            disabled={updatingUid === s.uid}
                            className={`h-8 w-full max-w-xs px-2.5 bg-white border rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 ${
                              !s.class_id
                                ? 'border-amber-300 bg-amber-50/30 focus:ring-amber-500'
                                : 'border-slate-200 focus:ring-blue-500'
                            }`}
                          >
                            <option value="">-- Select Class / Section --</option>
                            {deptClasses.length > 0 && (
                              <optgroup label="Department Classes">
                                {deptClasses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} (Sem {c.current_semester || 1})
                                    {c.batch?.program?.name ? ` — ${c.batch.program.name}` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {otherClasses.length > 0 && (
                              <optgroup label="Other Classes">
                                {otherClasses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} (Sem {c.current_semester || 1})
                                    {c.batch?.program?.name ? ` — ${c.batch.program.name}` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {deptClasses.length === 0 &&
                              otherClasses.length === 0 &&
                              classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} (Sem {c.current_semester || 1})
                                </option>
                              ))}
                          </select>

                          {/* Visual Tag for Current Enrolled Class */}
                          {assignedClass ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <School className="w-3 h-3 text-blue-600" />
                                <span>
                                  {assignedClass.name} · Sem {assignedClass.current_semester || 1}
                                  {assignedClass.batch?.program?.name
                                    ? ` (${assignedClass.batch.program.name})`
                                    : ''}
                                </span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Not Enrolled in Class</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}