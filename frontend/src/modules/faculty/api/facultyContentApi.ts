import axios from 'axios';
import { auth } from '../../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Firebase sign-in required');
  config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  return config;
});

export const facultyContentApi = {
  // Topics
  getTopics: async (classSubjectId: string): Promise<any[]> => {
    const res = await api.get('/faculty/topics', { params: { classSubjectId } });
    return res.data?.data || res.data;
  },

  createTopic: async (data: { classSubjectId: string; title: string; description?: string; orderIndex?: number }): Promise<any> => {
    const res = await api.post('/faculty/topics', data);
    return res.data?.data || res.data;
  },

  updateTopic: async (id: string, data: any): Promise<any> => {
    const res = await api.patch(`/faculty/topics/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteTopic: async (id: string): Promise<any> => {
    const res = await api.delete(`/faculty/topics/${id}`);
    return res.data?.data || res.data;
  },

  // Learning Content
  getContents: async (classSubjectId: string, topicId?: string): Promise<any[]> => {
    const res = await api.get('/faculty/content', { params: { classSubjectId, topicId } });
    return res.data?.data || res.data;
  },

  getContentById: async (id: string): Promise<any> => {
    const res = await api.get(`/faculty/content/${id}`);
    return res.data?.data || res.data;
  },

  createContent: async (data: any): Promise<any> => {
    const res = await api.post('/faculty/content', data);
    return res.data?.data || res.data;
  },

  uploadContentFile: async (file: File, meta: { topicId: string; classSubjectId: string; title: string; description?: string; durationSeconds?: number; isDownloadable?: boolean; isPublished?: boolean }): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topicId', meta.topicId);
    formData.append('classSubjectId', meta.classSubjectId);
    formData.append('title', meta.title);
    if (meta.description) formData.append('description', meta.description);
    if (meta.durationSeconds) formData.append('durationSeconds', String(meta.durationSeconds));
    if (meta.isDownloadable !== undefined) formData.append('isDownloadable', String(meta.isDownloadable));
    if (meta.isPublished !== undefined) formData.append('isPublished', String(meta.isPublished));

    const res = await api.post('/faculty/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  updateContent: async (id: string, data: any): Promise<any> => {
    const res = await api.patch(`/faculty/content/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteContent: async (id: string): Promise<any> => {
    const res = await api.delete(`/faculty/content/${id}`);
    return res.data?.data || res.data;
  },

  // Versioned Grading
  gradeSubmission: async (assignmentId: string, submissionId: string, data: { grade?: string; gradePoints?: number; feedback?: string; versionNumber?: number }): Promise<any> => {
    const res = await api.post(`/faculty/assignments/${assignmentId}/submissions/${submissionId}/grade`, data);
    return res.data?.data || res.data;
  },

  getSubmissionVersions: async (assignmentId: string, submissionId: string): Promise<any> => {
    const res = await api.get(`/faculty/assignments/${assignmentId}/submissions/${submissionId}/versions`);
    return res.data?.data || res.data;
  },

  // Learning Analytics
  getClassSubjectAnalytics: async (classSubjectId: string): Promise<any> => {
    const res = await api.get(`/faculty/analytics/classes/${classSubjectId}`);
    return res.data?.data || res.data;
  },

  getStudentDrillDownAnalytics: async (classSubjectId: string, studentUid: string): Promise<any> => {
    const res = await api.get(`/faculty/analytics/classes/${classSubjectId}/students/${studentUid}`);
    return res.data?.data || res.data;
  },
};
