import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnnouncements, createAnnouncement } from '../store/slices/hodSlice';
import type { RootState, AppDispatch } from "../store/store";;

export const AnnouncementsNoticesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { announcements, loading } = useSelector((state: RootState) => state.hod);

  const [scope, setScope] = useState('Entire Department (Faculty + Students)');
  const [classification, setClassification] = useState('Standard Administrative Notice');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback('Please provide both a headline and official message body.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await dispatch(createAnnouncement({ title, message, scope, classification })).unwrap();
      setTitle('');
      setMessage('');
      setFeedback('Dispatch published and broadcasted successfully.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to publish dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      <div className="flex flex-col gap-2 border border-[#c5c6cd]/30 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">campaign</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Announcements & Dispatch Center</h1>
          </div>
          <span className="bg-[#e5eeff] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#44474d]">
            Broadcast Channel
          </span>
        </div>
        <p className="text-xs text-[#44474d]">
          Broadcast verified departmental notices, exam advisories, and administrative directives.
        </p>
      </div>

      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        {feedback && (
          <div
            className={`mb-4 p-3 text-xs ${
              feedback.includes('successfully')
                ? 'bg-emerald-50 text-[#069669] border border-emerald-200'
                : 'bg-red-50 text-[#ba1a1a] border border-red-200'
            }`}
          >
            {feedback}
          </div>
        )}

        <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
                Target Recipient Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c5c6cd]/60 text-xs text-[#0b1c30] outline-none"
              >
                <option>Entire Department (Faculty + Students)</option>
                <option>Instructional Faculty Only</option>
                <option>UG Student Cohorts</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">
                Notice Classification
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c5c6cd]/60 text-xs text-[#0b1c30] outline-none"
              >
                <option>Standard Administrative Notice</option>
                <option>Midterm Examination Advisory</option>
                <option>Urgent Facility Interruption</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">Dispatch Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update: Midterm Proctored Lab Hours"
              className="w-full border border-[#c5c6cd]/60 p-2.5 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#44474d] mb-1">Official Message Body</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter verified departmental directive statement..."
              className="w-full border border-[#c5c6cd]/60 p-2.5 outline-none resize-none"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0b1c30] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#0d1c32] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Dispatch'}
          </button>
        </form>
      </div>

      {/* Dispatched Notices Feed */}
      <div className="border border-[#c5c6cd]/30 bg-white p-6">
        <h2 className="font-headline text-base font-bold text-[#0b1c30] mb-4">Official Department Dispatches</h2>
        {loading && announcements.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-[#0d1c32] border-t-transparent"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">No announcements published yet.</div>
        ) : (
          <div className="divide-y divide-[#c5c6cd]/20">
            {announcements.map((a) => (
              <div key={a.id} className="py-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0b1c30]">{a.title}</span>
                    <span className="bg-[#e5eeff] px-2 py-0.5 text-[9px] font-bold uppercase text-[#44474d]">
                      {a.classification}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#44474d]">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-[#44474d] leading-relaxed">{a.message}</p>
                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                  <span>Scope: {a.scope}</span>
                  <span>•</span>
                  <span>Issued by: {a.authorName || 'Head of Department'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};