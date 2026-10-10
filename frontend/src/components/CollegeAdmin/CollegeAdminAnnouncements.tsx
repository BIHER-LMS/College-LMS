import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Eye,
  Trash2,
  Edit3,
  X,
  Upload,
  Pin,
  Users,
  Loader2,
} from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import type {
  Announcement,
  TargetAudienceType,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from '../../services/announcementService';

interface CollegeAdminAnnouncementsProps {
  collegeId: string;
  adminUser?: any;
}

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'ACADEMIC', label: 'Academic & Curriculum' },
  { value: 'EXAMINATION', label: 'Examinations & Results' },
  { value: 'ADMINISTRATIVE', label: 'Administrative Notices' },
  { value: 'EVENT', label: 'Events & Symposiums' },
  { value: 'URGENT', label: 'Urgent Alerts' },
  { value: 'GENERAL', label: 'General Notices' },
] as const;

export const CollegeAdminAnnouncements: React.FC<CollegeAdminAnnouncementsProps> = ({
  collegeId,
  adminUser,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<'ALL' | TargetAudienceType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [includeInactive, setIncludeInactive] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    target_audience: ['HOD', 'FACULTY', 'STUDENT'] as TargetAudienceType[],
    category: 'GENERAL' as Announcement['category'],
    priority: 'NORMAL' as Announcement['priority'],
    is_pinned: false,
    is_active: true,
  });
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAnnouncements({
        college_id: collegeId,
        includeInactive: true,
      });
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('college_lms_announcements_cache');
    } catch {}
    loadAnnouncements();
  }, [collegeId]);

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      target_audience: ['HOD', 'FACULTY', 'STUDENT'],
      category: 'GENERAL',
      priority: 'NORMAL',
      is_pinned: false,
      is_active: true,
    });
    setFormError(null);
    setActiveModalTab('edit');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (item: Announcement) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url || '',
      target_audience: item.target_audience,
      category: item.category,
      priority: item.priority,
      is_pinned: item.is_pinned,
      is_active: item.is_active,
    });
    setFormError(null);
    setActiveModalTab('edit');
    setIsCreateModalOpen(true);
  };

  const handleToggleAudience = (type: TargetAudienceType) => {
    setFormData((prev) => {
      const current = prev.target_audience;
      if (current.includes(type)) {
        // Must leave at least one
        if (current.length === 1) return prev;
        return { ...prev, target_audience: current.filter((t) => t !== type) };
      } else {
        return { ...prev, target_audience: [...current, type] };
      }
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size should be below 5MB.');
      return;
    }

    setImageUploadLoading(true);
    setFormError(null);
    try {
      const url = await announcementService.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      console.error('Failed to upload image to Cloudinary:', err);
      setFormError(err.message || 'Failed to upload image to Cloudinary. Please try again.');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (formData.target_audience.length === 0) {
      setFormError('Please choose at least one target audience.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const authorName =
        adminUser?.displayName ||
        adminUser?.name ||
        adminUser?.email?.split('@')[0] ||
        'College Administrator';

      if (editingAnnouncement) {
        const updatePayload: UpdateAnnouncementPayload = {
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
          target_audience: formData.target_audience,
          category: formData.category,
          priority: formData.priority,
          is_pinned: formData.is_pinned,
          is_active: formData.is_active,
        };
        await announcementService.updateAnnouncement(editingAnnouncement.id, updatePayload, collegeId);
      } else {
        const createPayload: CreateAnnouncementPayload = {
          college_id: collegeId,
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
          target_audience: formData.target_audience,
          category: formData.category,
          priority: formData.priority,
          is_pinned: formData.is_pinned,
          is_active: formData.is_active,
          author_name: authorName,
        };
        await announcementService.createAnnouncement(createPayload);
      }

      await loadAnnouncements();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save announcement.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementService.deleteAnnouncement(id, collegeId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  // Filtered list
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      if (!includeInactive && !item.is_active) return false;

      if (selectedAudienceFilter !== 'ALL') {
        if (!item.target_audience.includes(selectedAudienceFilter)) return false;
      }

      if (selectedCategory !== 'ALL') {
        if (item.category !== selectedCategory) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesAuthor = (item.created_by_name || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesAuthor;
      }

      return true;
    });
  }, [announcements, searchQuery, selectedAudienceFilter, selectedCategory, includeInactive]);

  // Metric counts
  const stats = useMemo(() => {
    return {
      total: announcements.length,
      active: announcements.filter((a) => a.is_active).length,
      hodCount: announcements.filter((a) => a.target_audience.includes('HOD')).length,
      facultyCount: announcements.filter((a) => a.target_audience.includes('FACULTY')).length,
      classInchargeOnlyCount: announcements.filter(
        (a) => a.target_audience.includes('CLASS_INCHARGE') && !a.target_audience.includes('FACULTY')
      ).length,
      studentCount: announcements.filter((a) => a.target_audience.includes('STUDENT')).length,
    };
  }, [announcements]);

  const renderAudienceBadge = (target: TargetAudienceType) => {
    switch (target) {
      case 'HOD':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700"
          >
            <Building2 className="w-3 h-3 text-indigo-600" />
            <span>HOD</span>
          </span>
        );
      case 'FACULTY':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 border border-blue-200 text-blue-700"
          >
            <BookOpen className="w-3 h-3 text-blue-600" />
            <span>All Faculty</span>
          </span>
        );
      case 'CLASS_INCHARGE':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Class Incharge Only</span>
          </span>
        );
      case 'STUDENT':
        return (
          <span
            key={target}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 border border-purple-200 text-purple-700"
          >
            <GraduationCap className="w-3 h-3 text-purple-600" />
            <span>Students</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ─── 1. Header Banner ─── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
              Administrative Circulars
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Announcements & Notice Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Publish official announcements, academic circulars, and urgent notices with granular role visibility
            for Department Heads, Faculty, Class Incharges, and Students.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all duration-200 active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* ─── 2. Metric KPI Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Notices</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">{stats.total}</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-slate-400" /> Lifetime
          </span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block tracking-wider">Active Broadcasts</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">{stats.active}</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live on portals
          </span>
        </div>

        <div className="bg-white border border-indigo-100 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-indigo-600 block tracking-wider">To: HODs</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 block">{stats.hodCount}</span>
          <span className="text-[11px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Dept Heads
          </span>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-blue-600 block tracking-wider">To: All Faculty</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 mt-1 block">{stats.facultyCount}</span>
          <span className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> All teachers
          </span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">Only Incharge</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 mt-1 block">{stats.classInchargeOnlyCount}</span>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Exclusive
          </span>
        </div>

        <div className="bg-white border border-purple-100 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-purple-600 block tracking-wider">To: Students</span>
          <span className="text-xl sm:text-2xl font-black text-purple-700 mt-1 block">{stats.studentCount}</span>
          <span className="text-[11px] text-purple-600 font-medium mt-0.5 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Cohorts
          </span>
        </div>
      </div>

      {/* ─── 3. Filter & Search Toolbar ─── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keywords, or author..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Audience Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1 tracking-wider shrink-0 flex items-center gap-1">
            <Users className="w-3 h-3" /> Audience:
          </span>
          {(['ALL', 'HOD', 'FACULTY', 'CLASS_INCHARGE', 'STUDENT'] as const).map((aud) => {
            const isSelected = selectedAudienceFilter === aud;
            const labels: Record<string, string> = {
              ALL: 'All Audiences',
              HOD: 'HODs',
              FACULTY: 'All Faculty',
              CLASS_INCHARGE: 'Class Incharge Only',
              STUDENT: 'Students',
            };
            return (
              <button
                key={aud}
                onClick={() => setSelectedAudienceFilter(aud)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[aud]}
              </button>
            );
          })}
        </div>

        {/* Category & Status dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Show Inactive</span>
          </label>
        </div>
      </div>

      {/* ─── 4. Announcements Grid ─── */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Announcements Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {searchQuery || selectedAudienceFilter !== 'ALL' || selectedCategory !== 'ALL'
              ? 'No announcements match the current filters. Try resetting search or audience filters.'
              : 'No announcements have been published yet. Click "Create Announcement" to publish your first notice.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Announcement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col ${
                item.is_pinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-blue-300'
              } ${!item.is_active ? 'opacity-70 bg-slate-50' : ''}`}
            >
              {/* Optional Header Image */}
              {item.image_url ? (
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden group cursor-pointer" onClick={() => setViewingAnnouncement(item)}>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                  {item.is_pinned && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm">
                      <Pin className="w-3 h-3 fill-white" /> Pinned
                    </span>
                  )}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                    {item.category}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 pb-0 flex items-center justify-between">
                  {item.is_pinned ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-700 text-amber-700" /> Pinned Announcement
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                  )}

                  {item.priority === 'URGENT' && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Urgent
                    </span>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Audience Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {item.target_audience.map((aud) => renderAudienceBadge(aud))}
                  </div>

                  <h3
                    onClick={() => setViewingAnnouncement(item)}
                    className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {(item.created_by_name || 'A')[0].toUpperCase()}
                    </div>
                    <span className="text-[11px] text-slate-600 truncate max-w-[120px]">
                      {item.created_by_name || 'Admin'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingAnnouncement(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Preview Announcement"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Edit Announcement"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── 5. Create / Edit Announcement Modal ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingAnnouncement ? 'Edit Announcement' : 'Publish New Announcement'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Targeted announcements appear directly on designated dashboards.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tabs */}
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('edit')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeModalTab === 'edit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('preview')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeModalTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Body */}
            {activeModalTab === 'edit' ? (
              <form onSubmit={handleSubmitForm} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Announcement Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={140}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. End Semester Examination Schedule & Hall Ticket Issuance"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block text-right">
                    {formData.title.length}/140
                  </span>
                </div>

                {/* TARGET AUDIENCE (Critical User Request) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Who Can View This Announcement? <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Select one or more target audiences. Portals will strictly filter according to this selection.
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            target_audience: ['HOD', 'FACULTY', 'STUDENT'],
                          })
                        }
                        className="text-[10.5px] font-semibold text-blue-600 hover:underline"
                      >
                        All Campus
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            target_audience: ['CLASS_INCHARGE'],
                          })
                        }
                        className="text-[10.5px] font-semibold text-emerald-600 hover:underline"
                      >
                        Only Incharge
                      </button>
                    </div>
                  </div>

                  {/* 4 Interactive Target Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* 1. HOD */}
                    <div
                      onClick={() => handleToggleAudience('HOD')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        formData.target_audience.includes('HOD')
                          ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.target_audience.includes('HOD')}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Department Heads (HOD)
                        </span>
                        <p className="text-[10.5px] text-indigo-800/80 mt-0.5">
                          Displayed on the HOD Portal executive dashboard.
                        </p>
                      </div>
                    </div>

                    {/* 2. ALL FACULTY */}
                    <div
                      onClick={() => handleToggleAudience('FACULTY')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        formData.target_audience.includes('FACULTY')
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.target_audience.includes('FACULTY')}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" /> All Faculties
                        </span>
                        <p className="text-[10.5px] text-blue-800/80 mt-0.5">
                          Includes subject teachers and class incharges.
                        </p>
                      </div>
                    </div>

                    {/* 3. ONLY CLASS INCHARGE */}
                    <div
                      onClick={() => handleToggleAudience('CLASS_INCHARGE')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        formData.target_audience.includes('CLASS_INCHARGE')
                          ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.target_audience.includes('CLASS_INCHARGE')}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Only Class Incharge
                        </span>
                        <p className="text-[10.5px] text-emerald-800/80 mt-0.5">
                          Restricted exclusively to appointed Class Incharges.
                        </p>
                      </div>
                    </div>

                    {/* 4. STUDENTS */}
                    <div
                      onClick={() => handleToggleAudience('STUDENT')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        formData.target_audience.includes('STUDENT')
                          ? 'border-purple-500 bg-purple-50/60 ring-1 ring-purple-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.target_audience.includes('STUDENT')}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Students
                        </span>
                        <p className="text-[10.5px] text-purple-800/80 mt-0.5">
                          Broadcasted on all student portal dashboards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Selection */}
                  <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Currently Visible To:</span>
                    {formData.target_audience.map((a) => (
                      <span key={a} className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        {a === 'CLASS_INCHARGE' ? 'Class Incharges Only' : a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Announcement Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full details of the notice, policy instructions, key dates, and actionable instructions..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
                  />
                </div>

                {/* Optional Image Upload & URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Announcement Image (Optional)
                    </label>
                    {formData.image_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  {formData.image_url ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 h-36 bg-slate-100 group">
                      <img src={formData.image_url} alt="Uploaded notice preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 bg-white text-slate-800 rounded text-xs font-bold shadow-sm"
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <button
                        type="button"
                        disabled={imageUploadLoading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-600"
                      >
                        {imageUploadLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Uploading to Cloud...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-blue-600" />
                            <span>Upload Image (Max 5MB)</span>
                          </>
                        )}
                      </button>

                      <div className="relative flex-1">
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="Or paste direct image URL (https://...)"
                          className="w-full h-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>

                {/* Classification, Priority, and Pin options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GENERAL">General Notice</option>
                      <option value="ACADEMIC">Academic & Curriculum</option>
                      <option value="EXAMINATION">Examinations & Hall Tickets</option>
                      <option value="ADMINISTRATIVE">Administrative Circular</option>
                      <option value="EVENT">Events & Hackathons</option>
                      <option value="URGENT">Urgent Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NORMAL">Normal Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent Alert</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end gap-2 pb-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_pinned}
                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin to Dashboard
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Active / Published</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Live Preview Tab */
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="text-center pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Portal Dashboard Preview
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm max-w-lg mx-auto">
                  {formData.image_url && (
                    <div className="h-44 w-full bg-slate-100 overflow-hidden">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {formData.is_pinned && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-amber-700" /> Pinned
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        {formData.category}
                      </span>
                      {formData.target_audience.map((a) => renderAudienceBadge(a))}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{formData.title || 'Untitled Announcement'}</h3>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {formData.description || 'Description will appear here...'}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Posted by College Administration</span>
                      <span>Just now</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('edit')}
                    className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back to Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 6. Full Reading View Modal ─── */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            {viewingAnnouncement.image_url && (
              <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                <img
                  src={viewingAnnouncement.image_url}
                  alt={viewingAnnouncement.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setViewingAnnouncement(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="p-6 space-y-4">
              {!viewingAnnouncement.image_url && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Official Announcement
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingAnnouncement(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {viewingAnnouncement.is_pinned && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-amber-700" /> Pinned
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                  {viewingAnnouncement.category}
                </span>
                {viewingAnnouncement.target_audience.map((a) => renderAudienceBadge(a))}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{viewingAnnouncement.title}</h2>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {viewingAnnouncement.description}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                    {(viewingAnnouncement.created_by_name || 'A')[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {viewingAnnouncement.created_by_name || 'College Administration'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(viewingAnnouncement.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleOpenEditModal(viewingAnnouncement);
                    setViewingAnnouncement(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Notice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. Delete Confirmation Dialog ─── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Announcement?</h3>
            <p className="text-xs text-slate-500">
              This action will remove the announcement from all active dashboards. This cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-sm"
              >
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
