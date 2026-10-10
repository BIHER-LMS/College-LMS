import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Pin,
  AlertTriangle,
  Building2,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import type { Announcement, TargetAudienceType } from '../../services/announcementService';

interface DashboardAnnouncementsProps {
  role: 'HOD' | 'FACULTY' | 'STUDENT';
  isClassIncharge?: boolean;
  collegeId?: string;
  className?: string;
}

export const DashboardAnnouncements: React.FC<DashboardAnnouncementsProps> = ({
  role,
  isClassIncharge = false,
  collegeId,
  className = '',
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState<Announcement | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, [role, isClassIncharge, collegeId]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAnnouncements({
        college_id: collegeId,
        role,
        isClassIncharge,
      });
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load dashboard announcements', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && announcements.length === 0) {
    return null;
  }

  if (announcements.length === 0) {
    return null;
  }

  const renderBadge = (target: TargetAudienceType) => {
    switch (target) {
      case 'HOD':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            <Building2 className="w-2.5 h-2.5" /> HOD
          </span>
        );
      case 'FACULTY':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
          >
            <BookOpen className="w-2.5 h-2.5" /> All Faculty
          </span>
        );
      case 'CLASS_INCHARGE':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Class Incharge
          </span>
        );
      case 'STUDENT':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
          >
            <GraduationCap className="w-2.5 h-2.5" /> Students
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Campus Announcements</span>
              <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                {announcements.length}
              </span>
            </h2>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          Official Institutional Circulars
        </span>
      </div>

      {/* Announcements Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {announcements.slice(0, 6).map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalItem(item)}
            className={`group bg-white border rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer ${
              item.is_pinned
                ? 'border-amber-300 ring-1 ring-amber-200/60 bg-gradient-to-b from-amber-50/20 to-white'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            {/* Image (if exists) */}
            {item.image_url && (
              <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                {item.is_pinned && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Pin className="w-2.5 h-2.5 fill-white" /> Pinned
                  </span>
                )}
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[9.5px] font-bold uppercase">
                  {item.category}
                </span>
              </div>
            )}

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                {!item.image_url && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {item.is_pinned && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[9.5px] font-bold uppercase flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 fill-amber-700" /> Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {item.priority === 'URGENT' && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600" /> Urgent
                      </span>
                    )}
                  </div>
                )}

                {/* Target Audience Pills */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.target_audience.map((aud) => renderBadge(aud))}
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                <span className="truncate max-w-[140px] text-slate-500 font-medium">
                  {item.created_by_name || 'College Admin'}
                </span>

                <span className="flex items-center gap-1 text-blue-600 font-semibold group-hover:underline">
                  <span>Read Notice</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Reading Modal ─── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            {activeModalItem.image_url && (
              <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                <img
                  src={activeModalItem.image_url}
                  alt={activeModalItem.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-3.5">
              {!activeModalItem.image_url && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Official Announcement
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {activeModalItem.is_pinned && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-amber-700" /> Pinned
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                  {activeModalItem.category}
                </span>
                {activeModalItem.target_audience.map((a) => renderBadge(a))}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {activeModalItem.title}
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {activeModalItem.description}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                    {(activeModalItem.created_by_name || 'A')[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {activeModalItem.created_by_name || 'College Administration'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(activeModalItem.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
