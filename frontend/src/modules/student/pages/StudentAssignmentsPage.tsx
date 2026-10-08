import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/studentApi';
import { Calendar, Clock, FileText, Upload, CheckCircle, AlertCircle, Download, FileImage } from 'lucide-react';
import { supabase } from '../../../config/supabase';

export const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
    
    // validate if image
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (.jpg, .png, .jpeg)');
        return;
    }

    try {
      setUploading(true);
      const timestamp = new Date().getTime();
      const fileName = `submissions/${assignmentId}_${timestamp}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('assignments')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('assignments')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      await studentApi.submitAssignment(assignmentId, { attachmentUrl: fileUrl });
      
      // refresh assignments
      loadAssignments();
      alert('Assignment submitted successfully!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Failed to submit assignment: ' + err.message);
    } finally {
      setUploading(false);
      // clear input
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
        <p className="text-sm text-slate-500 mt-1">View and submit your class assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {assignment.subjectCode}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {assignment.facultyName}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{assignment.title}</h3>
                </div>
                {assignment.isSubmitted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Submitted
                  </span>
                ) : (
                   new Date(assignment.dueDate) < new Date() ? (
                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                       <AlertCircle className="w-3.5 h-3.5" />
                       Overdue
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                       <Clock className="w-3.5 h-3.5" />
                       Pending
                     </span>
                   )
                )}
              </div>
              
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {assignment.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                {assignment.attachmentUrl && (
                  <a href={assignment.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                    <Download className="w-4 h-4" />
                    Reference Material
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                {assignment.isSubmitted ? (
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <div className="flex items-center gap-2 text-sm">
                       <FileImage className="w-4 h-4 text-slate-400" />
                       <span className="text-slate-600">You have submitted an image.</span>
                     </div>
                     <a 
                       href={assignment.submission.file_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                     >
                       View Submission
                     </a>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*"
                      id={`upload-${assignment.id}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, assignment.id)}
                      disabled={uploading}
                    />
                    <label 
                      htmlFor={`upload-${assignment.id}`}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed font-medium transition cursor-pointer
                        ${uploading ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'}`}
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Image Submission'}
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Assignments</h3>
            <p className="text-slate-500">You don't have any assignments pending or submitted at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
