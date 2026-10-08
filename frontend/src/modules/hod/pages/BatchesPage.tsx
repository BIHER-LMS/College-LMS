import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBatches, fetchPrograms } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;
import type { Batch } from "../types/hod.types";;
import { hodApi } from '../api/hodApi';

export const BatchesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { batches, programs, loading } = useSelector((state: RootState) => state.hod);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    programId: '',
    startYear: currentYear,
    endYear: currentYear + 3,
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    dispatch(fetchBatches());
    dispatch(fetchPrograms());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setFormData({
      programId: programs[0]?.id || '',
      startYear: currentYear,
      endYear: currentYear + 3,
      status: 'ACTIVE',
    });
    setFeedback(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (b: Batch) => {
    setSelectedBatch(b);
    setFormData({
      programId: b.programId,
      startYear: b.startYear,
      endYear: b.endYear,
      status: b.status,
    });
    setFeedback(null);
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programId) {
      setFeedback({ type: 'error', message: 'Please select a program' });
      return;
    }
    if (formData.endYear <= formData.startYear) {
      setFeedback({ type: 'error', message: 'End year must be after start year' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.createBatch({
        programId: formData.programId,
        startYear: Number(formData.startYear),
        endYear: Number(formData.endYear),
      });
      await dispatch(fetchBatches()).unwrap();
      setIsCreateOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create batch' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await hodApi.updateBatch(selectedBatch.id, {
        startYear: Number(formData.startYear),
        endYear: Number(formData.endYear),
        status: formData.status as 'ACTIVE' | 'INACTIVE',
      });
      await dispatch(fetchBatches()).unwrap();
      setIsEditOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update batch' });
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
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">group_work</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Department Batches Management</h1>
          </div>
          <p className="mt-1 text-xs text-[#44474d]">
            Academic cohorts associated with degree programs in your department.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0b1c30] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a2d48] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Batch
        </button>
      </div>

      {/* Batches Table */}
      <div className="border border-[#c5c6cd]/30 bg-white">
        <div className="p-4 border-b border-[#c5c6cd]/30">
          <h2 className="font-headline text-base font-bold text-[#0b1c30]">Active Cohort Batches</h2>
        </div>

        {loading && batches.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No batches registered for your department.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#44474d] font-bold uppercase tracking-wider border-b border-[#0b1c30] text-[10px]">
                  <th className="py-3 px-4">Cohort Batch Name</th>
                  <th className="py-3 px-4">Associated Program</th>
                  <th className="py-3 px-4">Start Year</th>
                  <th className="py-3 px-4">End Year</th>
                  <th className="py-3 px-4">Classes Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#eff4ff]">
                    <td className="py-3 px-4 font-bold text-[#0b1c30]">{b.name}</td>
                    <td className="py-3 px-4 text-[#44474d]">{b.programName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0b1c30]">{b.startYear}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0b1c30]">{b.endYear}</td>
                    <td className="py-3 px-4 font-bold text-[#0b1c30]">{b.classCount || 0}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          b.status === 'ACTIVE' ? 'text-[#069669]' : 'text-gray-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
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

      {/* Create Batch Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Create Academic Batch</h3>
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
                <label className="block font-semibold text-[#0b1c30] mb-1">Associated Program *</label>
                <select
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  required
                  className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                >
                  <option value="">-- Choose Program --</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationYears} Years)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Start Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    required
                    value={formData.startYear}
                    onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value, 10) || 2024 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">End Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    required
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value, 10) || 2027 })}
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
                  {isSubmitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {isEditOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-[#c5c6cd]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Edit Batch</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Start Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    required
                    value={formData.startYear}
                    onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value, 10) || 2024 })}
                    className="w-full border border-[#c5c6cd]/50 p-2 outline-none focus:border-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">End Year *</label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    required
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value, 10) || 2027 })}
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
