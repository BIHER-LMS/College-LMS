import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Video,
  FileCode,
  Upload,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  ExternalLink,
  Loader2,
  Lock,
  Eye,
  X,
} from 'lucide-react';
import { facultyContentApi } from '../api/facultyContentApi';
import { facultyApi } from '../api/facultyApi';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const FacultyContentPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<string>('');
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });

  // Content Modal State
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube' | 'markdown'>('upload');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    markdownContent: '',
    durationSeconds: 300,
    isDownloadable: true,
    isPublished: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // In-App LMS Preview State
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Load faculty's assigned subjects
  useEffect(() => {
    loadAssignedSubjects();
  }, []);

  const loadAssignedSubjects = async () => {
    try {
      setLoading(true);
      const raw = await facultyApi.getMySubjects();
      const data = Array.isArray(raw) ? raw : (raw as any)?.data || [];
      setSubjects(data);
      if (data && data.length > 0) {
        const firstId = data[0].classSubjectId || data[0].id || '';
        setSelectedClassSubjectId(firstId);
      } else {
        setSelectedClassSubjectId('');
        setTopics([]);
      }
    } catch (err) {
      console.error('Failed to load assigned subjects:', err);
      setSubjects([]);
      setSelectedClassSubjectId('');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // Load topics and content for selected class subject
  useEffect(() => {
    if (selectedClassSubjectId) {
      loadTopics(selectedClassSubjectId);
    }
  }, [selectedClassSubjectId]);

  const loadTopics = async (classSubjectId: string) => {
    try {
      setActionLoading(true);
      const data = await facultyContentApi.getTopics(classSubjectId);
      setTopics(data || []);
      // Expand all topics by default
      const exp: Record<string, boolean> = {};
      (data || []).forEach((t: any) => {
        exp[t.id] = true;
      });
      setExpandedTopics(exp);
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Topic CRUD
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.title.trim()) return;
    if (!selectedClassSubjectId) {
      alert('Please select a teaching subject first.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingTopic) {
        await facultyContentApi.updateTopic(editingTopic.id, topicForm);
      } else {
        await facultyContentApi.createTopic({
          classSubjectId: selectedClassSubjectId,
          title: topicForm.title,
          description: topicForm.description,
        });
      }
      setIsTopicModalOpen(false);
      setEditingTopic(null);
      setTopicForm({ title: '', description: '' });
      await loadTopics(selectedClassSubjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to save topic');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm('Are you sure you want to delete this topic and all its contents?')) return;
    try {
      setActionLoading(true);
      await facultyContentApi.deleteTopic(topicId);
      await loadTopics(selectedClassSubjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete topic');
    } finally {
      setActionLoading(false);
    }
  };

  // Content CRUD
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassSubjectId) {
      alert('Please select a teaching subject first.');
      return;
    }
    if (!contentForm.title.trim() || !selectedTopicId) {
      alert('Please provide a title and select a topic.');
      return;
    }

    try {
      setActionLoading(true);

      if (activeTab === 'upload') {
        if (!selectedFile) {
          alert('Please select a file to upload.');
          return;
        }
        await facultyContentApi.uploadContentFile(selectedFile, {
          topicId: selectedTopicId,
          classSubjectId: selectedClassSubjectId,
          title: contentForm.title,
          description: contentForm.description,
          durationSeconds: contentForm.durationSeconds,
          isDownloadable: contentForm.isDownloadable,
          isPublished: contentForm.isPublished,
        });
      } else if (activeTab === 'youtube') {
        if (!contentForm.youtubeUrl.trim()) {
          alert('Please enter a valid YouTube link.');
          return;
        }
        await facultyContentApi.createContent({
          topicId: selectedTopicId,
          classSubjectId: selectedClassSubjectId,
          title: contentForm.title,
          description: contentForm.description,
          contentType: 'YOUTUBE',
          youtubeUrl: contentForm.youtubeUrl,
          durationSeconds: contentForm.durationSeconds,
          isDownloadable: false,
          isPublished: contentForm.isPublished,
        });
      } else if (activeTab === 'markdown') {
        if (!contentForm.markdownContent.trim()) {
          alert('Please write Markdown content.');
          return;
        }
        await facultyContentApi.createContent({
          topicId: selectedTopicId,
          classSubjectId: selectedClassSubjectId,
          title: contentForm.title,
          description: contentForm.description,
          contentType: 'MARKDOWN',
          markdownContent: contentForm.markdownContent,
          isDownloadable: contentForm.isDownloadable,
          isPublished: contentForm.isPublished,
        });
      }

      setIsContentModalOpen(false);
      setSelectedFile(null);
      setContentForm({
        title: '',
        description: '',
        youtubeUrl: '',
        markdownContent: '',
        durationSeconds: 300,
        isDownloadable: true,
        isPublished: true,
      });
      await loadTopics(selectedClassSubjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to create content');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!window.confirm('Delete this learning material?')) return;
    try {
      setActionLoading(true);
      await facultyContentApi.deleteContent(contentId);
      await loadTopics(selectedClassSubjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete content');
    } finally {
      setActionLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'PPT':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'DOC':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'MARKDOWN':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-indigo-500" />;
      case 'YOUTUBE':
        return <YoutubeIcon className="w-5 h-5 text-red-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Learning Content Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Organize syllabi into topics, publish lecture videos, PPTs, notes, and study resources.
          </p>
        </div>

        {/* Class/Subject Selector */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Teaching Subject
            </label>
            <select
              value={selectedClassSubjectId}
              onChange={(e) => setSelectedClassSubjectId(e.target.value)}
              disabled={loading || subjects.length === 0}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[260px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subjects.length === 0 ? (
                <option value="">No Teaching Subjects Assigned</option>
              ) : (
                subjects.map((s) => {
                  const subId = s.classSubjectId || s.id;
                  const className = s.className || s.class?.name || 'Class';
                  const subjectName = s.subjectName || s.subject?.name || s.name || 'Subject';
                  const subjectCode = s.subjectCode || s.subject?.code || s.code || '';
                  return (
                    <option key={subId} value={subId}>
                      {className} — {subjectName} {subjectCode ? `(${subjectCode})` : ''}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <button
            onClick={() => {
              if (subjects.length === 0 || !selectedClassSubjectId) {
                alert('Please select an assigned teaching subject first.');
                return;
              }
              setEditingTopic(null);
              setTopicForm({ title: '', description: '' });
              setIsTopicModalOpen(true);
            }}
            disabled={subjects.length === 0 || !selectedClassSubjectId}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm self-end"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Topic</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {actionLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-sm text-slate-500">Updating contents...</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-slate-600 font-medium">Loading course contents...</span>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-amber-200 p-8 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 border border-amber-200/60 shadow-xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Teaching Subjects Assigned</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-4 leading-relaxed">
            There are currently no classes or subjects mapped to your account. Contact your Department HOD or Administrator to assign classes and subjects to your profile.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <span>Role: Faculty</span>
            <span>•</span>
            <span>Requires Class/Subject Assignment</span>
          </div>
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <FolderPlus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Topics Created Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Get started by organizing this course into modules or topics (e.g. "Unit 1: Introduction to Machine Learning").
          </p>
          <button
            onClick={() => setIsTopicModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create First Topic
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic, topicIdx) => {
            const isExpanded = expandedTopics[topic.id] !== false;
            const contents = topic.contents || [];

            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition"
              >
                {/* Topic Header Accordion */}
                <div className="p-5 flex items-center justify-between bg-slate-50/60 border-b border-slate-100 hover:bg-slate-50 transition">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                      {topicIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        {topic.title}
                        {!topic.is_published && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            Draft
                          </span>
                        )}
                      </h3>
                      {topic.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{topic.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                      {contents.length} {contents.length === 1 ? 'material' : 'materials'}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setIsContentModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                      title="Add content to this topic"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Material
                    </button>

                    <button
                      onClick={() => {
                        setEditingTopic(topic);
                        setTopicForm({ title: topic.title, description: topic.description || '' });
                        setIsTopicModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
                      title="Edit Topic"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Topic Contents List */}
                {isExpanded && (
                  <div className="p-4 divide-y divide-slate-100">
                    {contents.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-sm">
                        No materials attached to this topic yet. Click "Add Material" above.
                      </div>
                    ) : (
                      contents.map((item: any) => (
                        <div
                          key={item.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/50 mt-0.5">
                              {getContentIcon(item.content_type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {item.content_type}
                                </span>
                                {!item.is_downloadable && (
                                  <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                    <Lock className="w-2.5 h-2.5" />
                                    In-App Only
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                                {item.duration_seconds > 0 && (
                                  <span>{Math.round(item.duration_seconds / 60)} mins</span>
                                )}
                                {item.file_size_bytes && (
                                  <span>{(item.file_size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                                )}
                                <span>Published {new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setPreviewContent({ ...item, topicTitle: topic.title });
                                setIsPreviewModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                              title="Preview Inside LMS"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview in LMS</span>
                            </button>
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View
                              </a>
                            )}
                            {item.youtube_url && (
                              <a
                                href={item.youtube_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                              >
                                <YoutubeIcon className="w-3.5 h-3.5" />
                                Watch
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteContent(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete Material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TOPIC MODAL */}
      {/* ========================================================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingTopic ? 'Edit Topic' : 'Create New Syllabus Topic'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Group your lectures, slides, and study materials into thematic units.
            </p>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2: Neural Networks & Deep Learning"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Objectives (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis of topics covered in this unit..."
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition shadow"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingTopic ? 'Save Changes' : 'Create Topic'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTENT UPLOAD / CREATION MODAL */}
      {/* ========================================================= */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Learning Material</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload lecture PPTs, PDFs, Word docs, direct videos, Markdown notes, or YouTube lectures.
            </p>

            {/* Tab Selector */}
            <div className="flex border-b border-slate-200 gap-6 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'upload'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload File (PDF / PPT / DOC / Video)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'youtube'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <YoutubeIcon className="w-4 h-4" />
                <span>YouTube Lecture</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('markdown')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'markdown'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Markdown Notes</span>
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 04: Convolutional Neural Networks Architecture"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Study Guidelines (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on key topics covered or required reading..."
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Tab 1: File Upload */}
              {activeTab === 'upload' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select File (PDF, PPT/PPTX, DOC/DOCX, MP4, WebM, MD)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition bg-slate-50/50">
                    <input
                      type="file"
                      id="content-file-input"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.webm,.mov,.md,.markdown,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file && !contentForm.title) {
                          setContentForm({ ...contentForm, title: file.name.replace(/\.[^/.]+$/, '') });
                        }
                      }}
                    />
                    <label
                      htmlFor="content-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Supports PPT/PPTX, PDF, Word, MP4 Video, Markdown up to 100MB
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: YouTube Link */}
              {activeTab === 'youtube' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      YouTube Video URL *
                    </label>
                    <input
                      type="url"
                      required={activeTab === 'youtube'}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={contentForm.youtubeUrl}
                      onChange={(e) => setContentForm({ ...contentForm, youtubeUrl: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={Math.round(contentForm.durationSeconds / 60)}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          durationSeconds: (parseInt(e.target.value, 10) || 10) * 60,
                        })
                      }
                      className="w-32 text-sm border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Markdown */}
              {activeTab === 'markdown' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Markdown Body (Supports GFM, Formulas, and Code Blocks)
                  </label>
                  <textarea
                    rows={8}
                    required={activeTab === 'markdown'}
                    placeholder="# Topic Overview&#10;&#10;Write detailed syllabus notes, key formula derivations, code examples..."
                    value={contentForm.markdownContent}
                    onChange={(e) => setContentForm({ ...contentForm, markdownContent: e.target.value })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Options */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentForm.isDownloadable}
                    onChange={(e) => setContentForm({ ...contentForm, isDownloadable: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Allow students to download original file</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentForm.isPublished}
                    onChange={(e) => setContentForm({ ...contentForm, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish immediately to class</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition shadow"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Add Material</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* IN-APP LMS PREVIEW MODAL FOR FACULTY */}
      {/* ========================================================= */}
      {isPreviewModalOpen && previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  {getContentIcon(previewContent.content_type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold truncate max-w-md">
                    {previewContent.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {previewContent.topicTitle} • {previewContent.content_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700 px-2.5 py-1 rounded-md">
                  Faculty LMS Preview
                </span>
                <button
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    setPreviewContent(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Viewer Body */}
            <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center relative">
              {/* VIDEO PLAYER (MP4/WebM) */}
              {previewContent.content_type === 'VIDEO' && previewContent.file_url && (
                <div className="w-full h-full flex flex-col justify-center items-center p-4">
                  <video
                    src={previewContent.file_url}
                    controls
                    className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-2xl bg-black"
                  />
                </div>
              )}

              {/* YOUTUBE EMBED PLAYER */}
              {previewContent.content_type === 'YOUTUBE' && (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                  <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${previewContent.youtube_video_id || (previewContent.youtube_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1])}?autoplay=1`}
                      title={previewContent.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* PDF PREVIEWER */}
              {previewContent.content_type === 'PDF' && previewContent.file_url && (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <iframe
                    src={`${previewContent.file_url}#toolbar=1`}
                    title={previewContent.title}
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              )}

              {/* OFFICE DOCUMENTS (PPT, PPTX, DOC, DOCX) */}
              {(previewContent.content_type === 'PPT' || previewContent.content_type === 'DOC') && (
                <div className="w-full h-full flex flex-col bg-slate-900">
                  <div className="flex-1 w-full bg-slate-950 flex flex-col items-center justify-center relative">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        previewContent.file_url
                      )}&embedded=true`}
                      title={previewContent.title}
                      className="w-full h-full border-0 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* MARKDOWN NOTES VIEWER */}
              {previewContent.content_type === 'MARKDOWN' && (
                <div className="w-full h-full bg-white text-slate-800 p-8 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900 pb-3 border-b border-slate-200 mb-6">
                      {previewContent.title}
                    </h1>
                    <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {previewContent.markdown_content || 'No content provided.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
