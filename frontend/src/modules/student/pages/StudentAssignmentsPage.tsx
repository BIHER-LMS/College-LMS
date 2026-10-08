import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/studentApi';
import { Calendar, Clock, FileText, Upload, CheckCircle, AlertCircle, Download, FileImage, ExternalLink } from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format or pdf
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image file (.jpg, .jpeg, .png, .webp) or PDF');
      return;
    }

    try {
      setUploadingId(assignmentId);
      // Upload directly to Cloudinary cloud bucket via backend authenticated endpoint
      await studentApi.submitAssignment(assignmentId, { file });

      // Refresh assignments to show the updated submission
      await loadAssignments();
      alert('Assignment submitted successfully to Cloudinary cloud storage!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Failed to submit assignment: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 max-w-5xl mx-auto">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          My Assignments & Assessments
        </h1>
        <p className="text-sm text-slate-500 mt-1">View and submit your class assignments with cloud storage.</p>
      </div>

      <div className="space-y-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                      {assignment.subjectCode}
                    </span>
                    <span className="text-xs text-slate-500">{assignment.subjectName}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{assignment.title}</h2>
                </div>
                <div>
                  {assignment.isSubmitted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Submitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {assignment.description || 'No description provided.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                </div>
                {assignment.attachmentUrl && (
                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-600 hover:underline font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Reference Material
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                {assignment.isSubmitted && assignment.submission ? (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      {assignment.submission.file_url && (assignment.submission.file_url.includes('cloudinary.com') || assignment.submission.file_url.match(/\.(jpeg|jpg|png|webp|gif)/i)) ? (
                        <a href={assignment.submission.file_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={assignment.submission.file_url}
                            alt="Submission"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-300 shadow-2xs hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <FileImage className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>Submission Uploaded</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Cloud Verified</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Submitted on {new Date(assignment.submission.submitted_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <a
                        href={assignment.submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Submission</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      id={`upload-${assignment.id}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, assignment.id)}
                      disabled={uploadingId === assignment.id}
                    />
                    <label
                      htmlFor={`upload-${assignment.id}`}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed font-semibold text-xs transition cursor-pointer
                        ${
                          uploadingId === assignment.id
                            ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500'
                            : 'border-indigo-300 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400'
                        }`}
                    >
                      {uploadingId === assignment.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-700 border-t-transparent"></div>
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-indigo-600" />
                          <span>Upload Assignment Image / Document (Cloudinary Storage)</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Assignments</h3>
            <p className="text-slate-500 text-sm">You don't have any assignments pending or submitted at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
