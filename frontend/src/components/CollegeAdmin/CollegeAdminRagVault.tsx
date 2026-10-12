import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Info,
  X,
} from 'lucide-react';
import {
  getVaultStats,
  getVaultDocuments,
  uploadVaultDocument,
  deleteVaultDocument,
  type VaultDocument,
  type VaultStats,
  type CreateVaultDocumentPayload,
} from '../../services/api/collegeAdminRagVault';

export function CollegeAdminRagVault({ collegeId }: { collegeId: string }) {
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<VaultDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateVaultDocumentPayload>({
    title: '',
    category: 'policy',
    audience: 'ALL',
    content: '',
    source: '',
  });

  useEffect(() => {
    if (collegeId) {
      loadVaultData();
    }
  }, [collegeId, filterCategory]);

  const loadVaultData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [fetchedStats, fetchedDocs] = await Promise.all([
        getVaultStats(),
        getVaultDocuments(filterCategory),
      ]);
      setStats(fetchedStats);
      setDocuments(fetchedDocs);
    } catch (err: any) {
      console.error('Failed to load RAG Vault data:', err);
      setErrorMessage(err.message || 'Unable to connect to live Qdrant Vector Cloud.');
    } finally {
      setLoading(false);
    }
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('Please provide both a title and document content.');
      return;
    }

    setUploadLoading(true);
    setErrorMessage(null);
    try {
      await uploadVaultDocument({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        source: formData.source?.trim() || 'College Administration',
      });
      setSuccessMessage('Successfully vectorized and upserted to Qdrant Cloud!');
      setIsUploadOpen(false);
      setFormData({
        title: '',
        category: 'policy',
        audience: 'ALL',
        content: '',
        source: '',
      });
      await loadVaultData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Failed to upsert vector into Qdrant database.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (pointId: string | number) => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteVaultDocument(pointId);
      setSuccessMessage('Document permanently deleted from Qdrant vector index.');
      setDeleteId(null);
      await loadVaultData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setErrorMessage(err.message || 'Failed to remove vector point from Qdrant.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.source.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q)
    );
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'dress_code':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'policy':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'exam':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'discipline':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'handbook':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'STUDENT':
        return '🎓 Students';
      case 'FACULTY':
        return '👨‍🏫 Faculty';
      case 'HOD':
        return '🏛️ HODs';
      default:
        return '🌐 All Campus';
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Hero Header & Live Qdrant Indicator ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Qdrant Cloud Connected (128D Cosine Vector Space)
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Institutional RAG Vault</h1>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              Upload and manage college regulations, dress codes, academic handbooks, and examination
              policies. Documents are vectorized in real-time to provide high-precision contextual answers
              for student and faculty AI assistants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  category: 'policy',
                  audience: 'ALL',
                  content: '',
                  source: '',
                });
                setIsUploadOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Upload New Policy
            </button>
            <button
              onClick={loadVaultData}
              disabled={loading}
              title="Refresh vector records"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Feedback Alerts ─── */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{successMessage}</div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Stats Ribbon ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Documents
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.totalDocuments ?? documents.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Isolated to your college</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vector Geometry
            </div>
            <div className="text-2xl font-bold text-indigo-900 mt-1">
              {stats?.vectorDimension ?? 128}D
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Cosine Unit Metric</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Target Collections
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 truncate max-w-[150px]">
              Student & HOD
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Dual KB Synchronization</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live RAG Status
            </div>
            <div className="text-base font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </div>
            <div className="text-xs text-slate-500 mt-0.5">AWS US-East-1 Cloud</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── Search & Category Filtering Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'dress_code', label: 'Dress Code' },
            { id: 'policy', label: 'Campus Policies' },
            { id: 'exam', label: 'Exam Guidelines' },
            { id: 'discipline', label: 'Discipline / Anti-Ragging' },
            { id: 'handbook', label: 'Student Handbook' },
            { id: 'general', label: 'General Info' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vectorized policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* ─── Document Cards List ─── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-medium">Fetching vector points from Qdrant Cloud...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Vector Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery
              ? 'No documents matched your search filter.'
              : 'Your college RAG vault is currently empty. Click "Upload New Policy" to upload and vectorize your college policies, dress code, and guidelines into Qdrant.'}
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={String(doc.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                      doc.category
                    )}`}
                  >
                    {doc.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {getAudienceBadge(doc.audience)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {doc.snippet || doc.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Source:</span>
                    <span className="font-medium text-slate-600 truncate max-w-[180px]">
                      {doc.source}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium text-slate-600">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Target KBs:</span>
                    <span className="font-mono text-[10px] text-indigo-600 font-semibold">
                      {doc.collectionTargets?.join(', ') || 'student_knowledge_base'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setViewingDoc(doc);
                    setIsViewModalOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Policy
                </button>
                <button
                  onClick={() => setDeleteId(doc.id)}
                  title="Remove from Qdrant Vector DB"
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Upload / Vectorize Modal ─── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Ingest Policy into Qdrant Vector Cloud
                </h2>
                <p className="text-xs text-slate-500">
                  Vectorized points will be automatically indexed into student & faculty AI models.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Student Dress Code & ID Protocol 2026-27"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as CreateVaultDocumentPayload['category'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="policy">Campus Policy</option>
                    <option value="dress_code">Dress Code & Uniform</option>
                    <option value="handbook">Student Handbook</option>
                    <option value="exam">Examination Guidelines</option>
                    <option value="discipline">Discipline & Anti-Ragging</option>
                    <option value="general">General Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        audience: e.target.value as CreateVaultDocumentPayload['audience'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="ALL">Entire Campus (Students, Faculty, HODs)</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="FACULTY">Faculty Only</option>
                    <option value="HOD">HODs Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Authority / Source
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office of the Principal & Academic Council"
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Full Document Content / Rules *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.content.length} / 25,000 characters
                  </span>
                </div>
                <textarea
                  required
                  rows={9}
                  placeholder="Paste or write the institutional regulations, policy clauses, timings, or guidelines..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Upserting will convert text into 128-dimensional unit normalized vectors and push to
                  live AWS Qdrant collections.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Vectorizing & Storing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Vectorize to Qdrant Cloud
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Full Document Viewer Modal ─── */}
      {isViewModalOpen && viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                      viewingDoc.category
                    )}`}
                  >
                    {viewingDoc.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {getAudienceBadge(viewingDoc.audience)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{viewingDoc.title}</h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>Source: {viewingDoc.source}</span>
                  <span>•</span>
                  <span>Point ID: {String(viewingDoc.id).slice(0, 12)}...</span>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {viewingDoc.content}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Target: {viewingDoc.collectionTargets?.join(', ') || 'student_knowledge_base'}
              </span>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Vector Point?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete this policy point from Qdrant vector memory. Students
              and faculty queries will no longer retrieve this information.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(deleteId)}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting Point...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
