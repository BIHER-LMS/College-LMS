import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;
import type { Subject } from "../types/hod.types";;
import { hodApi } from '../api/hodApi';

export const SubjectsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subjects, loading } = useSelector((state: RootState) => state.hod);

  const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    semesterNumber: 1,
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  const filteredSubjects = selectedSemester !== ''
    ? subjects.filter((s) => s.semesterNumber === selectedSemester)
    : subjects;

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      semesterNumber: selectedSemester ? Number(selectedSemester) : 1,
      status: 'ACTIVE',
    });
    setFeedback(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setSelectedSubject(s);
    setFormData({
      name: s.name,
      code: s.code,
      credits: s.credits,
      semesterNumber: s.semesterNumber,
      status: s.status,
    });
    setFeedback(null);
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFeedback({ type: 'error', message: 'Subject name and course code are required' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.createSubject({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        credits: Number(formData.credits),
        semesterNumber: Number(formData.semesterNumber),
      });
      await dispatch(fetchSubjects()).unwrap();
      setIsCreateOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create subject' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.updateSubject(selectedSubject.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        credits: Number(formData.credits),
        semesterNumber: Number(formData.semesterNumber),
        status: formData.status as 'ACTIVE' | 'INACTIVE',
      });
      await dispatch(fetchSubjects()).unwrap();
      setIsEditOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update subject' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      {/* Header */}
      <div className="flex flex-col gap-4 border border-[#c5c6cd]/30 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">menu_book</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Department Subjects & Syllabi</h1>
          </div>
          <p className="mt-1 text-xs text-[#44474d]">
            Curriculum courses, credits, and semester distribution for your department.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0b1c30] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a2d48] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add New Subject
        </button>
      </div>

      {/* Semester Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#c5c6cd]/30 pb-2">
        <button
          onClick={() => setSelectedSemester('')}
          className={`px-3 py-1.5 text-xs font-semibold ${
            selectedSemester === ''
              ? 'bg-[#0b1c30] text-white'
              : 'bg-white border border-[#c5c6cd]/40 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Terms ({subjects.length})
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((term) => {
          const count = subjects.filter((s) => s.semesterNumber === term).length;
          if (count === 0 && selectedSemester !== term) return null;
          return (
            <button
              key={term}
              onClick={() => setSelectedSemester(term)}
              className={`px-3 py-1.5 text-xs font-semibold ${
                selectedSemester === term
                  ? 'bg-[#0b1c30] text-white'
                  : 'bg-white border border-[#c5c6cd]/40 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Semester {term} ({count})
            </button>
          );
        })}
      </div>

      {/* Subjects Table */}
      <div className="border border-[#c5c6cd]/30 bg-white">
        {loading && subjects.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No subjects found for this semester.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#44474d] font-bold uppercase tracking-wider border-b border-[#0b1c30] text-[10px]">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Semester Term</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {filteredSubjects.map((s) => (
                  <tr key={s.id} className="hover:bg-[#eff4ff]">
                    <td className="py-3 px-4 font-mono font-bold text-[#0b1c30]">{s.code}</td>
                    <td className="py-3 px-4 font-bold text-[#0b1c30]">{s.name}</td>
                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">{s.credits} Credits</td>
                    <td className="py-3 px-4 text-[#44474d]">Semester {s.semesterNumber}</td>
                    <td className="py-3 px-4">
                      <span className="text-[#069669] font-bold text-[11px]">{s.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Add Department Subject</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {feedback && (
              <div className={`mt-3 p-3 text-xs ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Natural Language Processing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="AIML305"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 3 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.semesterNumber}
                    onChange={(e) => setFormData({ ...formData, semesterNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
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
                  {isSubmitting ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Edit Subject</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {feedback && (
              <div className={`mt-3 p-3 text-xs ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 3 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.semesterNumber}
                    onChange={(e) => setFormData({ ...formData, semesterNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#c5c6cd]/30">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0b1c30] text-white font-bold hover:bg-[#1a2d48] disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
