import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchFaculty, fetchBatches, assignClassIncharge, fetchSubjects } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;
import type { ClassItem } from "../types/hod.types";;
import { AssignClassInchargeModal } from '../components/hod/AssignClassInchargeModal';
import { StatusBadge } from '../components/hod/StatusBadge';
import { hodApi } from '../api/hodApi';

export const ClassesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, faculty, batches, subjects, loading } = useSelector((state: RootState) => state.hod);

  const [selectedClassForIncharge, setSelectedClassForIncharge] = useState<ClassItem | null>(null);
  const [isInchargeModalOpen, setIsInchargeModalOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [assignSubjectData, setAssignSubjectData] = useState({ subjectId: '', facultyUid: '' });
  const [isAssigningSubject, setIsAssigningSubject] = useState(false);
  const [subjectFeedback, setSubjectFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    batchId: '',
    name: '',
    currentSemester: 1,
    facultyUid: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchFaculty());
    dispatch(fetchBatches());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleOpenAssign = (cls: ClassItem) => {
    setSelectedClassForIncharge(cls);
    setIsInchargeModalOpen(true);
  };

  const handleAssign = async (classId: string, facultyUid: string) => {
    await dispatch(assignClassIncharge({ classId, facultyUid })).unwrap();
    // Refresh both classes and faculty
    await dispatch(fetchClasses());
    await dispatch(fetchFaculty());
  };

  const handleOpenCreate = () => {
    setFormData({
      batchId: batches[0]?.id || '',
      name: '',
      currentSemester: 1,
      facultyUid: '',
    });
    setFeedback(null);
    setIsCreateOpen(true);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || !formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Batch and Class Name are required' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.createClass({
        batchId: formData.batchId,
        name: formData.name.trim(),
        currentSemester: Number(formData.currentSemester),
        facultyUid: formData.facultyUid || undefined,
      });
      await dispatch(fetchClasses()).unwrap();
      setIsCreateOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create class' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (classId: string) => {
    try {
      setDetailsLoading(true);
      setIsDetailsOpen(true);
      const data = await hodApi.getClassById(classId);
      setSelectedClassDetails(data);
    } catch (err: any) {
      console.error('Failed to fetch class details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSubjectData.subjectId || !selectedClassDetails?.id) return;
    
    try {
      setIsAssigningSubject(true);
      setSubjectFeedback(null);
      await hodApi.assignSubjectToClass(selectedClassDetails.id, assignSubjectData.subjectId, assignSubjectData.facultyUid || undefined);
      setAssignSubjectData({ subjectId: '', facultyUid: '' });
      setSubjectFeedback({ type: 'success', message: 'Subject assigned successfully' });
      // Refresh details
      const data = await hodApi.getClassById(selectedClassDetails.id);
      setSelectedClassDetails(data);
    } catch (err: any) {
      setSubjectFeedback({ type: 'error', message: err.message || 'Failed to assign subject' });
    } finally {
      setIsAssigningSubject(false);
    }
  };

  const handleUpdateSubjectTeacher = async (subjectId: string, facultyUid: string) => {
    if (!selectedClassDetails?.id) return;
    try {
      await hodApi.assignSubjectTeacher(selectedClassDetails.id, subjectId, facultyUid);
      // Refresh details
      const data = await hodApi.getClassById(selectedClassDetails.id);
      setSelectedClassDetails(data);
    } catch (err: any) {
      alert(err.message || 'Failed to update teacher');
    }
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      {/* Header */}
      <div className="flex flex-col gap-4 border border-[#c5c6cd]/30 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">class</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Department Classes & Incharge Allocation</h1>
          </div>
          <p className="mt-1 text-xs text-[#44474d]">
            Manage classroom sections, student cohorts, and appoint verified Class Incharges from faculty.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0b1c30] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a2d48] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Class Section
        </button>
      </div>

      {/* Classes Table */}
      <div className="border border-[#c5c6cd]/30 bg-white">
        <div className="p-4 border-b border-[#c5c6cd]/30">
          <h2 className="font-headline text-base font-bold text-[#0b1c30]">Active Class Sections</h2>
        </div>

        {loading && classes.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No classes found for your department.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#44474d] font-bold uppercase tracking-wider border-b border-[#0b1c30] text-[10px]">
                  <th className="py-3 px-4">Class Section</th>
                  <th className="py-3 px-4">Program / Batch</th>
                  <th className="py-3 px-4">Semester Term</th>
                  <th className="py-3 px-4">Designated Class Incharge</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {classes.map((cls) => {
                  const incharge = cls.facultyIncharge || (cls.facultyName ? { name: cls.facultyName } : null);
                  return (
                    <tr key={cls.id} className="hover:bg-[#eff4ff]">
                      <td className="py-3 px-4 font-bold text-[#0b1c30]">
                        <button
                          onClick={() => handleViewDetails(cls.id)}
                          className="hover:underline text-left"
                        >
                          {cls.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[#44474d]">
                        {cls.programName}
                        {cls.batchName && <span className="block text-[10px] text-gray-400">{cls.batchName}</span>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                        Term {cls.currentSemester || cls.semesterNumber || 1}
                      </td>
                      <td className="py-3 px-4">
                        {incharge ? (
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                              ★
                            </span>
                            <div>
                              <span className="font-bold text-[#0b1c30]">{incharge.name}</span>
                              {(incharge as any).email && (
                                <span className="block text-[10px] text-gray-400">{(incharge as any).email}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0b1c30]">
                        {cls.studentCount} Students
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={cls.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(cls.id)}
                            className="text-xs text-gray-600 hover:text-black font-semibold"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenAssign(cls)}
                            className="bg-[#0b1c30] text-white px-2.5 py-1 text-[11px] font-bold hover:bg-[#1a2d48] transition-colors"
                          >
                            Assign Incharge
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Class Section Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Create Class Section</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {feedback && (
              <div className={`mt-3 p-3 text-xs ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Academic Batch *</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  required
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.startYear} - {b.endYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Class Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc AI & ML - Year II (Sec B)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Optional Incharge</label>
                  <select
                    value={formData.facultyUid}
                    onChange={(e) => setFormData({ ...formData, facultyUid: e.target.value })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  >
                    <option value="">-- Unassigned --</option>
                    {faculty.map((f) => (
                      <option key={f.uid} value={f.uid}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#c5c6cd]/30">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0b1c30] text-white font-bold hover:bg-[#1a2d48] disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Details Drawer / Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white p-6 shadow-2xl border border-[#c5c6cd]/40 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <div>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                  {selectedClassDetails?.name || 'Class Details'}
                </h3>
                <p className="text-xs text-[#44474d]">{selectedClassDetails?.programName}</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin border-2 border-[#0b1c30] border-t-transparent"></div>
              </div>
            ) : selectedClassDetails ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8f9ff] p-4 border border-[#c5c6cd]/30">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Semester Term</span>
                    <span className="font-bold text-[#0b1c30]">Term {selectedClassDetails.currentSemester || 1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Enrolled Students</span>
                    <span className="font-bold text-[#0b1c30]">{selectedClassDetails.studentCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Class Incharge</span>
                    <span className="font-bold text-indigo-700">
                      {selectedClassDetails.facultyIncharge?.display_name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0b1c30] mb-2">Enrolled Student Roster</h4>
                  {selectedClassDetails.students?.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 border border-dashed border-[#c5c6cd]/30">
                      No students enrolled in this section yet.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                          <th className="py-2 px-3">Reg. Number</th>
                          <th className="py-2 px-3">Student Name</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedClassDetails.students.map((s: any) => (
                          <tr key={s.uid}>
                            <td className="py-2 px-3 font-mono font-semibold">{s.registerNumber}</td>
                            <td className="py-2 px-3 font-bold">{s.name}</td>
                            <td className="py-2 px-3 text-gray-500">{s.email}</td>
                            <td className="py-2 px-3">
                              <span className="text-[#069669] font-bold">{s.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-6 border-t border-[#c5c6cd]/30 pt-4">
                  <h4 className="font-bold text-[#0b1c30] mb-2">Assigned Subjects & Teachers</h4>
                  
                  {subjectFeedback && (
                    <div className={`mb-3 p-2 text-xs ${subjectFeedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {subjectFeedback.message}
                    </div>
                  )}

                  <form onSubmit={handleAssignSubject} className="flex gap-2 items-end bg-[#f8f9ff] p-3 border border-[#c5c6cd]/30 mb-4">
                    <div className="flex-1">
                      <label className="block font-semibold text-[#0b1c30] mb-1 text-[10px] uppercase">Select Subject</label>
                      <select
                        value={assignSubjectData.subjectId}
                        onChange={(e) => setAssignSubjectData({ ...assignSubjectData, subjectId: e.target.value })}
                        required
                        className="w-full border border-[#c5c6cd]/50 p-1.5 outline-none focus:border-[#0b1c30]"
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold text-[#0b1c30] mb-1 text-[10px] uppercase">Assign Teacher (Optional)</label>
                      <select
                        value={assignSubjectData.facultyUid}
                        onChange={(e) => setAssignSubjectData({ ...assignSubjectData, facultyUid: e.target.value })}
                        className="w-full border border-[#c5c6cd]/50 p-1.5 outline-none focus:border-[#0b1c30]"
                      >
                        <option value="">-- Unassigned --</option>
                        {faculty.map(f => (
                          <option key={f.uid} value={f.uid}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isAssigningSubject}
                      className="bg-[#0b1c30] text-white px-4 py-1.5 font-bold hover:bg-[#1a2d48] disabled:opacity-50"
                    >
                      {isAssigningSubject ? 'Adding...' : 'Add Subject'}
                    </button>
                  </form>

                  {selectedClassDetails.subjects?.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 border border-dashed border-[#c5c6cd]/30">
                      No subjects assigned to this class yet.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                          <th className="py-2 px-3">Code</th>
                          <th className="py-2 px-3">Subject Name</th>
                          <th className="py-2 px-3">Subject Teacher</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedClassDetails.subjects?.map((s: any) => (
                          <tr key={s.id}>
                            <td className="py-2 px-3 font-mono font-semibold">{s.subjectCode}</td>
                            <td className="py-2 px-3 font-bold">{s.subjectName}</td>
                            <td className="py-2 px-3">
                              <select
                                value={s.facultyUid || ''}
                                onChange={(e) => handleUpdateSubjectTeacher(s.subjectId, e.target.value)}
                                className="w-full border border-[#c5c6cd]/30 p-1 outline-none text-xs"
                              >
                                <option value="">-- Unassigned --</option>
                                {faculty.map(f => (
                                  <option key={f.uid} value={f.uid}>{f.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Assign Class Incharge Modal */}
      <AssignClassInchargeModal
        isOpen={isInchargeModalOpen}
        classItem={selectedClassForIncharge}
        facultyList={faculty}
        onClose={() => setIsInchargeModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  );
};