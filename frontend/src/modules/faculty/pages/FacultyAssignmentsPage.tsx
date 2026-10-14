import React, { useEffect, useState } from 'react';
import { facultyApi } from '../api/facultyApi';
import { facultyContentApi } from '../api/facultyContentApi';
import { Clock, FileText, Upload, Download, CheckCircle, Award, History, X, Loader2 } from 'lucide-react';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAssignment(prev => ({ ...prev, attachmentUrl: e.target.files?.[0]?.name || '' }));
    }
  };

  // Submissions modal
  const [viewingAssignment, setViewingAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Version history & Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', gradePoints: 100, feedback: '' });
  const [versionHistoryData, setVersionHistoryData] = useState<any>(null);
  const [versionLoading, setVersionLoading] = useState(false);

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

  const handleOpenGrading = (sub: any) => {
    setGradingSubmission(sub);
    setGradeForm({
      grade: sub.grade || '',
      gradePoints: sub.versions?.[0]?.grade_points ?? 100,
      feedback: sub.feedback || '',
    });
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingAssignment || !gradingSubmission) return;

    try {
      await facultyContentApi.gradeSubmission(viewingAssignment.id, gradingSubmission.id, {
        grade: gradeForm.grade,
        gradePoints: Number(gradeForm.gradePoints),
        feedback: gradeForm.feedback,
      });
      alert('Submission graded successfully!');
      setGradingSubmission(null);
      // Reload submissions
      loadSubmissions(viewingAssignment);
    } catch (err: any) {
      alert(err.message || 'Failed to save grade');
    }
  };

  const handleViewVersionHistory = async (sub: any) => {
    if (!viewingAssignment) return;
    try {
      setVersionLoading(true);
      setVersionHistoryData({ student: sub.student, versions: [] });
      const data = await facultyContentApi.getSubmissionVersions(viewingAssignment.id, sub.id);
      setVersionHistoryData(data);
    } catch (err: any) {
      alert(err.message || 'Failed to load version history');
      setVersionHistoryData(null);
    } finally {
      setVersionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments & Grading</h1>
          <p className="text-slate-500 text-sm mt-1">Manage assessments, grade student submissions, and review version histories.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
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
                  rows={3}
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newAssignment.dueDate}
                  onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
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
                    <div key={sub.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{sub.student?.display_name || 'Unknown Student'}</h4>
                          {sub.is_late && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                              LATE
                            </span>
                          )}
                          {sub.grade && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Award className="w-3 h-3" /> Grade: {sub.grade}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{sub.student?.register_number || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Submitted on {new Date(sub.submittedAt || sub.submitted_at).toLocaleString()}
                        </p>
                        {sub.feedback && (
                          <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                            Feedback: {sub.feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleViewVersionHistory(sub)}
                          className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
                          title="View Version Timeline"
                        >
                          <History className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Versions</span>
                        </button>

                        <button
                          onClick={() => handleOpenGrading(sub)}
                          className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{sub.grade ? 'Re-grade' : 'Grade'}</span>
                        </button>

                        <a
                          href={sub.attachmentUrl || sub.fileUrl || sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> View File
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Grade Assignment Submission</h3>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Grading for: <span className="font-semibold text-slate-800">{gradingSubmission.student?.display_name}</span>
            </p>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Grade / Letter (e.g. A+, 95/100)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A or 95"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Score Points (out of 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeForm.gradePoints}
                  onChange={(e) => setGradeForm({ ...gradeForm, gradePoints: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Feedback & Comments
                </label>
                <textarea
                  rows={3}
                  placeholder="Constructive feedback for the student..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  Save Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionHistoryData && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Submission Version History</h3>
              </div>
              <button onClick={() => setVersionHistoryData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Student: <span className="font-semibold text-slate-800">{versionHistoryData.student?.display_name}</span> ({versionHistoryData.student?.register_number || 'N/A'})
            </p>

            {versionLoading ? (
              <div className="flex items-center justify-center py-10 text-indigo-600 gap-2 text-xs font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading versions...
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {versionHistoryData.versions?.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">No previous versions recorded.</div>
                ) : (
                  versionHistoryData.versions?.map((v: any) => (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700">Version {v.version_number}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(v.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      {v.is_late && (
                        <span className="inline-block text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                          Submitted Late
                        </span>
                      )}
                      {v.grade && (
                        <p className="text-slate-700">
                          <span className="font-semibold">Grade:</span> {v.grade} ({v.grade_points} pts)
                        </p>
                      )}
                      {v.feedback && (
                        <p className="text-slate-500 italic">"{v.feedback}"</p>
                      )}
                      {v.student_notes && (
                        <p className="text-slate-600">
                          <span className="font-semibold">Student Notes:</span> {v.student_notes}
                        </p>
                      )}
                      <div className="pt-1">
                        <a
                          href={v.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download Version {v.version_number} File
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
