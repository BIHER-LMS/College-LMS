import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFaculty, fetchClasses, fetchSubjects } from "../store/slices/hodSlice";
;
import type { RootState, AppDispatch } from "../store/store";
import { StatusBadge } from '../components/hod/StatusBadge';
import { hodApi } from '../api/hodApi';

export const FacultyPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { faculty, classes, subjects, department, loading } = useSelector((state: RootState) => state.hod);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');
  const [pendingFaculty, setPendingFaculty] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [selectedPending, setSelectedPending] = useState<any | null>(null);
  
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading] = useState(false);

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState<string | null>(null);
  const [assignInchargeClassId, setAssignInchargeClassId] = useState('');

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
    hodApi.getPendingFaculty().then(data => setPendingFaculty(data)).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'ACTIVE') {
      const handler = setTimeout(() => {
        dispatch(fetchFaculty(searchTerm ? { search: searchTerm } : undefined));
      }, 300);
      return () => clearTimeout(handler);
    } else {
      const loadPending = async () => {
        try {
          setPendingLoading(true);
          const data = await hodApi.getPendingFaculty();
          setPendingFaculty(data);
        } catch (err) {
          console.error(err);
        } finally {
          setPendingLoading(false);
        }
      };
      loadPending();
    }
  }, [dispatch, searchTerm, activeTab]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const subjectId = formData.get('subjectId') as string;
    const classId = formData.get('classId') as string;
    
    try {
      await hodApi.approveFaculty(selectedPending.uid, 'APPROVE', subjectId || undefined, classId || undefined);
      setPendingFaculty(prev => prev.filter(p => p.uid !== selectedPending.uid));
      setSelectedPending(null);
      setActiveTab('ACTIVE'); // Switch back to active to see the newly approved faculty
      dispatch(fetchFaculty());
    } catch (err) {
      console.error(err);
      alert('Failed to approve faculty');
    }
  };

  const handleReject = async (uid: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await hodApi.approveFaculty(uid, 'REJECT');
      setPendingFaculty(prev => prev.filter(p => p.uid !== uid));
    } catch (err) {
      console.error(err);
      alert('Failed to reject application');
    }
  };

  

  const handleAssignSubjects = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || selectedClassIds.length === 0 || selectedSubjectIds.length === 0) return;
    try {
      setIsAssigning(true);
      await hodApi.assignFacultySubjects(selectedFaculty.uid, selectedClassIds, selectedSubjectIds);
      const data = await hodApi.getFacultyById(selectedFaculty.uid);
      setSelectedFaculty(data);
      setSelectedClassIds([]);
      setSelectedSubjectIds([]);
      dispatch(fetchFaculty());
    } catch(err: any) {
      alert(err.message || 'Failed to assign subjects');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignSubject = async (classId: string, subjectId: string) => {
    if (!selectedFaculty) return;
    if (!confirm('Are you sure you want to unassign this subject from this faculty member?')) return;
    try {
      setIsUnassigning(`${classId}-${subjectId}`);
      await hodApi.unassignFacultySubject(selectedFaculty.uid, classId, subjectId);
      const data = await hodApi.getFacultyById(selectedFaculty.uid);
      setSelectedFaculty(data);
      dispatch(fetchFaculty());
    } catch (err: any) {
      alert(err.message || 'Failed to unassign subject');
    } finally {
      setIsUnassigning(null);
    }
  };

  const handleAssignIncharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !assignInchargeClassId) return;
    try {
      await hodApi.assignClassIncharge(assignInchargeClassId, selectedFaculty.uid);
      const data = await hodApi.getFacultyById(selectedFaculty.uid);
      setSelectedFaculty(data);
      setAssignInchargeClassId('');
      dispatch(fetchFaculty());
    } catch(err: any) {
      alert(err.message || 'Failed to assign class incharge');
    }
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      {/* Header */}
      <div className="flex flex-col gap-4 border border-[#c5c6cd]/30 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">badge</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Department Faculty Management</h1>
          </div>
          <p className="mt-1 text-xs text-[#44474d]">
            View all academic staff belonging exclusively to your department and manage incharge designations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#0b1c30]">
            Total Faculty: {faculty.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#c5c6cd]/30">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-6 py-3 text-sm font-bold ${
            activeTab === 'ACTIVE'
              ? 'border-b-2 border-[#0b1c30] text-[#0b1c30]'
              : 'text-gray-500 hover:text-[#0b1c30]'
          }`}
        >
          Active Faculty
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-6 py-3 text-sm font-bold flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'border-b-2 border-[#0b1c30] text-[#0b1c30]'
              : 'text-gray-500 hover:text-[#0b1c30]'
          }`}
        >
          Pending Applications
          {pendingFaculty.length > 0 && activeTab !== 'PENDING' && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingFaculty.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ACTIVE' && (
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 border border-[#c5c6cd]/30">
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search faculty name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-[#c5c6cd]/40 bg-[#f8f9ff] py-1.5 pl-9 pr-3 text-xs text-[#0b1c30] outline-none focus:border-[#0b1c30]"
              />
            </div>
          </div>

          {/* Faculty Cards Grid */}
          {loading && faculty.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
            </div>
          ) : faculty.length === 0 ? (
            <div className="border border-dashed border-[#c5c6cd]/40 bg-white p-12 text-center text-xs text-gray-500">
              No faculty members found in your department.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {faculty.map((item) => (
                <div
                  key={item.uid}
                  className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-5 shadow-sm hover:border-[#0b1c30] transition-colors"
                >
              <div>
                <div className="flex items-start gap-3">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#0b1c30] font-bold text-white text-base">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline text-sm font-bold text-[#0b1c30] truncate">{item.name}</h3>
                    <p className="text-[11px] text-[#44474d]">{item.designation || 'Assistant Professor'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{item.email}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#c5c6cd]/20 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500">Account Status</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500">Incharge Role</span>
                    {item.isClassIncharge ? (
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                        ★ {item.assignedClasses?.[0]?.name || item.assignedClassName || 'Class Incharge'}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Instructional Faculty</span>
                    )}
                  </div>

                  {item.subjects && item.subjects.length > 0 && (
                    <div className="space-y-1 mt-2 border-t border-gray-100 pt-2">
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Teaching Subjects</span>
                      <div className="flex flex-wrap gap-1">
                        {item.subjects.map((s: any, idx: number) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] border border-indigo-100">
                            {s.name} ({s.className})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-200/70 flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedFaculty(item); setIsDetailsOpen(true); }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    className="material-symbols-outlined text-[18px] text-gray-400 hover:text-rose-600 transition-colors"
                    title="Remove from Department"
                  >
                    person_remove
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
          )}
        </>
      )}

      {activeTab === 'PENDING' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingLoading && pendingFaculty.length === 0 ? (
            <div className="col-span-full flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
            </div>
          ) : pendingFaculty.length === 0 ? (
            <div className="col-span-full border border-dashed border-[#c5c6cd]/40 bg-white p-12 text-center text-xs text-gray-500">
              No pending faculty applications.
            </div>
          ) : (
            pendingFaculty.map((item) => {
              return (
                <div key={item.uid} className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-5 shadow-sm hover:border-[#0b1c30] transition-colors relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full" />
                  
                  <div>
                    <div className="flex items-start gap-3">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover border-2 border-amber-100"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-base">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-headline text-sm font-bold text-[#0b1c30] truncate">{item.name}</h3>
                          <span className="material-symbols-outlined text-[14px] text-amber-500" title="Pending Approval">pending_actions</span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#c5c6cd]/20 pt-3 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-gray-400 mt-0.5">how_to_reg</span>
                        <div className="text-xs">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Applying As</span>
                          <span className="font-medium text-slate-700">{item.designation || 'Faculty Member'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-gray-400 mt-0.5">corporate_fare</span>
                        <div className="text-xs">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Department</span>
                          <span className="font-medium text-slate-700">{item.departmentName || department?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-200/70 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReject(item.uid)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50/80 hover:bg-rose-100 px-3 py-1.5 rounded border border-rose-200 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => setSelectedPending(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0b1c30] hover:bg-[#1a2b40] px-3.5 py-1.5 rounded shadow-2xs transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Approve...</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Approval Modal */}
      {selectedPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40 rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Approve Faculty Application</h3>
              <button onClick={() => setSelectedPending(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Applicant Summary Banner */}
            <div className="bg-[#f4f7fb] p-3 rounded-md border border-[#dce3ec] mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0b1c30]">{selectedPending.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedPending.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-800 font-medium">
                <span className="material-symbols-outlined text-[14px] text-indigo-600">account_balance</span>
                <span>Applying for: <strong>{selectedPending.departmentName || department?.name || 'Department'}</strong></span>
                {selectedPending.departmentCode && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono font-bold">
                    {selectedPending.departmentCode}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Confirm approval to admit this faculty member into your department. Optionally assign their teaching subject and class incharge responsibility below.
            </p>
            
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">Assign Subject (Optional)</label>
                <select name="subjectId" className="w-full border border-[#c5c6cd]/40 bg-[#f8f9ff] py-2 px-3 text-xs text-[#0b1c30] rounded">
                  <option value="">-- None --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">Assign Class Incharge (Optional)</label>
                <select name="classId" className="w-full border border-[#c5c6cd]/40 bg-[#f8f9ff] py-2 px-3 text-xs text-[#0b1c30] rounded">
                  <option value="">-- None --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#c5c6cd]/20">
                <button type="button" onClick={() => setSelectedPending(null)} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
                <button type="submit" className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded shadow-2xs">Approve Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Profile Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white p-6 shadow-2xl border border-[#c5c6cd]/40 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Faculty Profile & Supervision</h3>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin border-2 border-[#0b1c30] border-t-transparent"></div>
              </div>
            ) : selectedFaculty ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-center gap-4 bg-[#f8f9ff] p-4 border border-[#c5c6cd]/30">
                  {selectedFaculty.photoUrl ? (
                    <img
                      src={selectedFaculty.photoUrl}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover border-2 border-[#0b1c30]"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-[#0b1c30] text-white font-bold text-lg flex items-center justify-center">
                      {selectedFaculty.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-headline text-base font-bold text-[#0b1c30]">{selectedFaculty.name}</h4>
                    <p className="text-xs text-[#44474d]">{selectedFaculty.designation}</p>
                    <p className="text-xs text-gray-500">{selectedFaculty.email}</p>
                  </div>
                </div>

                <div className="border border-[#c5c6cd]/30 p-3 space-y-1 bg-white">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Class Incharge Assignment</span>
                  {selectedFaculty.assignedClasses && selectedFaculty.assignedClasses.length > 0 ? (
                    <div className="space-y-1 mb-2">
                      {selectedFaculty.assignedClasses.map((c: any) => (
                        <div key={c.id} className="text-xs font-bold text-indigo-700">
                          ★ {c.name} ({c.programName})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic mb-2">Currently not assigned as Incharge of any class section.</p>
                  )}
                  <form onSubmit={handleAssignIncharge} className="mt-3 pt-3 border-t border-[#c5c6cd]/30 flex gap-2">
                    <select
                      value={assignInchargeClassId}
                      onChange={(e) => setAssignInchargeClassId(e.target.value)}
                      className="flex-1 border border-[#c5c6cd]/40 bg-[#f8f9ff] py-1.5 px-2 text-xs text-[#0b1c30] rounded"
                    >
                      <option value="">-- Assign new class incharge --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button type="submit" disabled={!assignInchargeClassId} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold disabled:opacity-50">
                      Assign
                    </button>
                  </form>
                </div>

                <div className="border border-[#c5c6cd]/30 p-3.5 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold tracking-wide">
                      Teaching Subjects ({selectedFaculty.subjects?.length || 0})
                    </span>
                  </div>

                  {selectedFaculty.subjects && selectedFaculty.subjects.length > 0 ? (
                    <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedFaculty.subjects.map((s: any, idx: number) => {
                        const itemKey = `${s.classId}-${s.id}`;
                        return (
                          <li
                            key={idx}
                            className="font-medium text-[#0b1c30] text-[11px] bg-slate-50 hover:bg-slate-100/80 p-2 rounded border border-slate-200/60 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-[#0b1c30] truncate">{s.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">({s.code})</span>
                              <span className="text-indigo-700 bg-indigo-50 border border-indigo-100/70 px-1.5 py-0.5 rounded text-[9px] font-semibold truncate">
                                {s.className}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnassignSubject(s.classId, s.id)}
                              disabled={isUnassigning === itemKey}
                              title="Unassign this subject"
                              className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic text-xs py-1">No subjects assigned yet.</p>
                  )}

                  {/* Multi-Class & Multi-Subject Assignment Form */}
                  <form onSubmit={handleAssignSubjects} className="mt-3 pt-3 border-t border-[#c5c6cd]/30 space-y-3">
                    <div className="text-[11px] font-bold text-[#0b1c30] flex items-center justify-between">
                      <span>Assign Classes & Subjects</span>
                      <span className="text-[10px] text-indigo-600 font-medium">Select multiple classes & subjects</span>
                    </div>

                    {/* Classes Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">
                          Classes ({selectedClassIds.length}/{classes.length})
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedClassIds(classes.map(c => c.id))}
                            className="text-[10px] text-indigo-600 hover:underline font-semibold"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300 text-[10px]">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedClassIds([])}
                            className="text-[10px] text-gray-400 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-[#f8f9ff] border border-[#c5c6cd]/30 rounded">
                        {classes.length === 0 ? (
                          <span className="text-[10px] text-gray-400 p-1">No classes available in department</span>
                        ) : (
                          classes.map((c) => {
                            const isSelected = selectedClassIds.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSelectedClassIds(prev =>
                                    prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                  );
                                }}
                                className={`text-[11px] px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 font-medium ${
                                  isSelected
                                    ? 'bg-[#0b1c30] text-white border-[#0b1c30] shadow-2xs'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  {isSelected ? 'check_box' : 'check_box_outline_blank'}
                                </span>
                                <span>{c.name}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Subjects Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">
                          Subjects ({selectedSubjectIds.length}/{subjects.length})
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSubjectIds(subjects.map(s => s.id))}
                            className="text-[10px] text-indigo-600 hover:underline font-semibold"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300 text-[10px]">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedSubjectIds([])}
                            className="text-[10px] text-gray-400 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-[#f8f9ff] border border-[#c5c6cd]/30 rounded">
                        {subjects.length === 0 ? (
                          <span className="text-[10px] text-gray-400 p-1">No subjects available in department</span>
                        ) : (
                          subjects.map((s) => {
                            const isSelected = selectedSubjectIds.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSubjectIds(prev =>
                                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className={`text-[11px] px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 font-medium ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  {isSelected ? 'check_box' : 'check_box_outline_blank'}
                                </span>
                                <span>{s.name} ({s.code})</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Summary badge & Submit button */}
                    <div className="pt-1">
                      {selectedClassIds.length > 0 && selectedSubjectIds.length > 0 && (
                        <div className="mb-2 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 p-2 rounded flex items-center justify-between">
                          <span>
                            Assigning <strong>{selectedSubjectIds.length}</strong> subject(s) to <strong>{selectedClassIds.length}</strong> class(es)
                          </span>
                          <span className="font-bold">
                            Total: {selectedClassIds.length * selectedSubjectIds.length} assignment(s)
                          </span>
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={selectedClassIds.length === 0 || selectedSubjectIds.length === 0 || isAssigning}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-xs font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isAssigning ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Assigning...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">library_add</span>
                            <span>
                              Assign Subject{selectedSubjectIds.length > 1 || selectedClassIds.length > 1 ? 's' : ''} (
                              {selectedClassIds.length * selectedSubjectIds.length})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};