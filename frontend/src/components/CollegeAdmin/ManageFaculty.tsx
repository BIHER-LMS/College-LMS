import { useState, useEffect } from 'react';
import {
  fetchUsers,
  fetchPendingUsers,
  updateUserProfile,
  fetchDepartments,
  fetchAllCollegeSubjects,
  fetchAllCollegeClasses,
  assignFacultyClassIncharge,
  assignFacultySubject,
} from '../../services/collegeService';
import type { DepartmentRecord, SubjectRecord, ClassRecord, AuthedUserRecord } from '../../services/collegeService';
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';

export function ManageFaculty({ collegeId }: { collegeId: string }) {
  const [faculty, setFaculty] = useState<AuthedUserRecord[]>([]);
  const [pendingFaculty, setPendingFaculty] = useState<AuthedUserRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
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
      const [facData, pendingData, deptData, subData, clsData] = await Promise.all([
        fetchUsers({ college_id: collegeId, role: 'FACULTY' }),
        fetchPendingUsers(collegeId, 'FACULTY'),
        fetchDepartments(collegeId),
        fetchAllCollegeSubjects(collegeId),
        fetchAllCollegeClasses(collegeId),
      ]);

      setFaculty(facData as AuthedUserRecord[]);
      setPendingFaculty(pendingData as AuthedUserRecord[]);
      setDepartments(deptData);
      setSubjects(subData);
      setClasses(clsData);
    } catch (err: any) {
      console.error('Failed to load faculty management data:', err);
      showNotification('error', 'Failed to load faculty or academic records.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const assignDepartment = async (uid: string, deptId: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { department_id: deptId || null });
      showNotification('success', 'Faculty department assignment updated.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update department.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleSubjectChange = async (uid: string, subjectId: string) => {
    setUpdatingUid(uid);
    try {
      await assignFacultySubject(uid, subjectId || null);
      showNotification('success', 'Subject assignment updated successfully.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update subject assignment.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleClassInchargeChange = async (facultyUid: string, classId: string) => {
    setUpdatingUid(facultyUid);
    try {
      await assignFacultyClassIncharge(facultyUid, classId || null);
      showNotification('success', 'Class incharge appointment updated successfully.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to assign class incharge.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const approveFaculty = async (uid: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { role: 'FACULTY', approval_status: 'APPROVED' });
      showNotification('success', 'Faculty member approved successfully.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to approve faculty.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const rejectFaculty = async (uid: string) => {
    setUpdatingUid(uid);
    try {
      await updateUserProfile(uid, { approval_status: 'REJECTED' });
      showNotification('success', 'Faculty application rejected.');
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to reject faculty.');
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with Clean Title and Description (No preview button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Faculty Management</h2>
              <p className="text-xs text-slate-500">
                Manage faculty members, assign mandatory teaching subjects, and appoint class incharges.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span>Total Faculty:</span>
            <span className="text-blue-600 font-bold">{faculty.length}</span>
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
      {pendingFaculty.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-amber-50/80 px-6 py-3 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                Awaiting Approval ({pendingFaculty.length})
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
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingFaculty.map((f) => {
                  const deptName = departments.find((d) => d.id === f.department_id)?.name || 'Unassigned';
                  return (
                    <tr key={f.uid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                            {(f.displayName || f.email || 'F')[0].toUpperCase()}
                          </div>
                          <span>{f.displayName || 'Unnamed Faculty'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{f.email}</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">{deptName}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveFaculty(f.uid)}
                            disabled={updatingUid === f.uid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectFaculty(f.uid)}
                            disabled={updatingUid === f.uid}
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

      {/* Approved Faculty Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Approved Faculty Directory
            </h3>
            <p className="text-[11px] text-slate-400">
              Each faculty member must be assigned to a teaching subject. Class incharge is optional (max 1 faculty per class).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Faculty Member</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Assigned Subject (Mandatory)</span>
                  </div>
                </th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Class Incharge (Optional)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculty.map((f) => {
                // Find currently assigned class incharge for this faculty
                const assignedClass = classes.find((c) => c.faculty_uid === f.uid);

                // Find assigned subject details
                const assignedSubject = subjects.find((s) => s.id === f.subject_id);
                const hasSubject = Boolean(f.subject_id && assignedSubject);

                // Department subjects filter (show department subjects first if assigned)
                const relevantSubjects = f.department_id
                  ? subjects.filter((s) => s.department_id === f.department_id)
                  : subjects;
                const otherSubjects = f.department_id
                  ? subjects.filter((s) => s.department_id !== f.department_id)
                  : [];

                const initials = (f.displayName || f.email || 'FA')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={f.uid} className="hover:bg-slate-50/50 transition-colors">
                    {/* Faculty Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {f.displayName || 'No Name Set'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{f.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department Selector */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <select
                          value={f.department_id || ''}
                          onChange={(e) => assignDepartment(f.uid, e.target.value)}
                          disabled={updatingUid === f.uid}
                          className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Unassigned Dept</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Subject Assignment Column (Mandatory with Warning Tag) */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <select
                          value={f.subject_id || ''}
                          onChange={(e) => handleSubjectChange(f.uid, e.target.value)}
                          disabled={updatingUid === f.uid}
                          className={`h-8 w-full max-w-xs px-2.5 bg-white border rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 ${
                            !hasSubject
                              ? 'border-amber-300 bg-amber-50/30 focus:ring-amber-500'
                              : 'border-slate-200 focus:ring-blue-500'
                          }`}
                        >
                          <option value="">-- Select Subject (Mandatory) --</option>
                          {relevantSubjects.length > 0 && (
                            <optgroup label="Department Subjects">
                              {relevantSubjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.code}) - Sem {s.semester_number}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {otherSubjects.length > 0 && (
                            <optgroup label="Other Department Subjects">
                              {otherSubjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.code}) - Sem {s.semester_number}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>

                        {/* Subject Assign Pending Tag */}
                        {!hasSubject ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Subject Assign Pending</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <BookOpen className="w-3 h-3 text-blue-600" />
                              <span>{assignedSubject?.name} ({assignedSubject?.code})</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Class Incharge Column (Optional with 1-to-1 Constraint) */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <select
                          value={assignedClass?.id || ''}
                          onChange={(e) => handleClassInchargeChange(f.uid, e.target.value)}
                          disabled={updatingUid === f.uid}
                          className="h-8 w-full max-w-xs px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">None (Subject Teacher Only)</option>
                          {classes.map((c) => {
                            const otherIncharge =
                              c.faculty_uid && c.faculty_uid !== f.uid
                                ? faculty.find((fac) => fac.uid === c.faculty_uid)
                                : null;
                            return (
                              <option key={c.id} value={c.id}>
                                {c.name}
                                {otherIncharge
                                  ? ` — (Currently: ${otherIncharge.displayName || otherIncharge.email})`
                                  : ''}
                              </option>
                            );
                          })}
                        </select>

                        {/* Dynamic Incharge Role Status Tag */}
                        {assignedClass ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Incharge: {assignedClass.name}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] text-slate-500 bg-slate-100 border border-slate-200">
                              Subject Teacher
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && faculty.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No approved faculty found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      New faculty registrations awaiting approval will appear above.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
