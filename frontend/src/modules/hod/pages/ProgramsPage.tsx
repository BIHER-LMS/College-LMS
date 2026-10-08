import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrograms } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;
import type { Program } from "../types/hod.types";;
import { hodApi } from '../api/hodApi';

export const ProgramsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { programs, loading } = useSelector((state: RootState) => state.hod);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    degree: 'UG',
    durationYears: 3,
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    dispatch(fetchPrograms());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setFormData({ name: '', degree: 'UG', durationYears: 3, status: 'ACTIVE' });
    setFeedback(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Program) => {
    setSelectedProgram(p);
    setFormData({
      name: p.name,
      degree: p.degree || 'UG',
      durationYears: p.durationYears || 3,
      status: p.status || 'ACTIVE',
    });
    setFeedback(null);
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Program name is required' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.createProgram({
        name: formData.name.trim(),
        degree: formData.degree,
        durationYears: Number(formData.durationYears),
      });
      await dispatch(fetchPrograms()).unwrap();
      setIsCreateOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create program' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.updateProgram(selectedProgram.id, {
        name: formData.name.trim(),
        degree: formData.degree,
        durationYears: Number(formData.durationYears),
        status: formData.status as 'ACTIVE' | 'INACTIVE',
      });
      await dispatch(fetchPrograms()).unwrap();
      setIsEditOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update program' });
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
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">school</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Academic Programs Management</h1>
          </div>
          <p className="mt-1 text-xs text-[#44474d]">
            Manage undergraduate and postgraduate degree programs belonging exclusively to your department.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0b1c30] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a2d48] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Program
        </button>
      </div>

      {/* Program Cards Grid */}
      {loading && programs.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
        </div>
      ) : programs.length === 0 ? (
        <div className="border border-dashed border-[#c5c6cd]/40 bg-white p-12 text-center text-xs text-gray-500">
          No degree programs found for your department.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between border border-[#c5c6cd]/30 bg-white p-5 shadow-sm hover:border-[#0b1c30] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#eff4ff] px-2 py-0.5 text-[10px] font-bold text-[#0b1c30] uppercase">
                    {p.degree || 'Degree'}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      p.status === 'ACTIVE' ? 'text-[#069669]' : 'text-gray-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">{p.name}</h3>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#c5c6cd]/20 pt-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#44474d] block">Duration</span>
                    <span className="font-bold text-[#0b1c30]">{p.durationYears} Years</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#44474d] block">Batches</span>
                    <span className="font-bold text-[#0b1c30]">{p.batchCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#44474d] block">Classes</span>
                    <span className="font-bold text-[#0b1c30]">{p.classCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#c5c6cd]/20 flex justify-end">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Edit Program
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Program Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Create Degree Program</h3>
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
                <label className="block font-semibold text-[#0b1c30] mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc Artificial Intelligence and Machine Learning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Degree Type</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Ph.D">Doctorate (Ph.D)</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: parseInt(e.target.value, 10) || 1 })}
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
                  {isSubmitting ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {isEditOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Edit Program</h3>
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
                <label className="block font-semibold text-[#0b1c30] mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Degree Type</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Ph.D">Doctorate (Ph.D)</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: parseInt(e.target.value, 10) || 1 })}
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
