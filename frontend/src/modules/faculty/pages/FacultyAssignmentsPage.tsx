import React, { useEffect, useState } from 'react';
import { facultyApi } from '../api/facultyApi';
import { Clock, FileText, Upload, Download, CheckCircle } from 'lucide-react';

export const FacultyAssignmentsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New assignment form
  const [isCreating, setIsCreating] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    attachmentUrl: ''
  });

  // Submissions modal
  const [viewingAssignment, setViewingAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      loadAssignments(selectedSubjectId);
    }
  }, [selectedSubjectId, subjects]);

  const loadSubjects = async () => {
    try {
      const data = await facultyApi.getMySubjects();
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubjectId(data[0].classSubjectId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadAssignments = async (classSubjectId: string) => {
    try {
      setLoading(true);
      const data = await facultyApi.getAssignments(classSubjectId);
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await facultyApi.createAssignment({
        classSubjectId: selectedSubjectId,
        ...newAssignment
      });
      setIsCreating(false);
      setNewAssignment({ title: '', description: '', dueDate: '', attachmentUrl: '' });
      loadAssignments(selectedSubjectId);
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment');
    }
  };

  const loadSubmissions = async (assignment: any) => {
    try {
      setViewingAssignment(assignment);
      const data = await facultyApi.getAssignmentSubmissions(assignment.id);
      setSubmissions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Assignments & Assessments
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage class assignments and review student submissions.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition"
        >
          <Upload className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <label className="font-semibold text-slate-700 text-sm">Select Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 min-w-[250px]"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s.classSubjectId} value={s.classSubjectId}>
              {s.subjectName} - {s.className} ({s.batch})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Assignments Found</h3>
          <p className="text-slate-500 text-sm">You haven't created any assignments for this subject yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map(assignment => (
            <div key={assignment.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                    {assignment.classSubject?.subject?.code}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">{assignment.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{assignment.description}</p>
                {assignment.attachmentUrl && (
                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded"
                  >
                    <Download className="w-3.5 h-3.5" /> Attachment
                  </a>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {assignment._count?.submissions || 0} Submissions
                </span>
                <button
                  onClick={() => loadSubmissions(assignment)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Submissions &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject & Class</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select --</option>
                  {subjects.map(s => (
                    <option key={s.classSubjectId} value={s.classSubjectId}>
                      {s.subjectName} - {s.className}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  required
                  value={newAssignment.dueDate}
                  onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Attachment URL (Optional)</label>
                <input
                  type="url"
                  value={newAssignment.attachmentUrl}
                  onChange={e => setNewAssignment({ ...newAssignment, attachmentUrl: e.target.value })}
                  placeholder="https://link-to-doc"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{viewingAssignment.title} - Submissions</h2>
                <p className="text-sm text-slate-500 mt-1">{submissions.length} student(s) submitted</p>
              </div>
              <button
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No submissions yet.</div>
              ) : (
                <div className="space-y-3">
                  {submissions.map(sub => (
                    <div key={sub.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-slate-50">
                      <div>
                        <h4 className="font-bold text-slate-900">{sub.student?.display_name || 'Unknown Student'}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{sub.student?.register_number || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Submitted on {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <a
                        href={sub.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> View File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
