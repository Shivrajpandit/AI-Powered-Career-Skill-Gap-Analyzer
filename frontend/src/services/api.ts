import axios from 'axios';
import type {
  AuthResponse,
  User,
  Resume,
  JobDescription,
  Analysis,
  CompareJobsResponse,
  LearningRoadmap,
  RoadmapItem,
  QualityAudit,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: async (data: { email: string; password: string; full_name: string }): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: { full_name?: string; email?: string; password?: string }): Promise<User> => {
    const res = await apiClient.put<User>('/auth/me', data);
    return res.data;
  },

  // Resumes
  uploadResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<Resume>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getResumes: async (): Promise<Resume[]> => {
    const res = await apiClient.get<Resume[]>('/resumes');
    return res.data;
  },
  getResume: async (id: string): Promise<Resume> => {
    const res = await apiClient.get<Resume>(`/resumes/${id}`);
    return res.data;
  },
  updateResumeParsedData: async (id: string, parsedData: any): Promise<Resume> => {
    const res = await apiClient.put<Resume>(`/resumes/${id}`, { parsed_data: parsedData });
    return res.data;
  },
  deleteResume: async (id: string): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  },

  // Jobs
  analyzeJob: async (data: { title: string; company?: string; raw_text: string }): Promise<JobDescription> => {
    const res = await apiClient.post<JobDescription>('/jobs/analyze', data);
    return res.data;
  },
  getJobs: async (): Promise<JobDescription[]> => {
    const res = await apiClient.get<JobDescription[]>('/jobs');
    return res.data;
  },
  getJob: async (id: string): Promise<JobDescription> => {
    const res = await apiClient.get<JobDescription>(`/jobs/${id}`);
    return res.data;
  },
  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  // Analysis & Matching
  matchResumeToJob: async (resumeId: string, jobId: string, weights?: Record<string, number>): Promise<Analysis> => {
    const res = await apiClient.post<Analysis>('/analysis/match', {
      resume_id: resumeId,
      job_id: jobId,
      weights,
    });
    return res.data;
  },
  getAnalyses: async (): Promise<Analysis[]> => {
    const res = await apiClient.get<Analysis[]>('/analysis');
    return res.data;
  },
  getAnalysis: async (id: string): Promise<Analysis> => {
    const res = await apiClient.get<Analysis>(`/analysis/${id}`);
    return res.data;
  },
  compareJobs: async (resumeId: string, jobIds: string[]): Promise<CompareJobsResponse> => {
    const res = await apiClient.post<CompareJobsResponse>('/analysis/compare-jobs', {
      resume_id: resumeId,
      job_ids: jobIds,
    });
    return res.data;
  },
  deleteAnalysis: async (id: string): Promise<void> => {
    await apiClient.delete(`/analysis/${id}`);
  },

  // Roadmap & Auditor
  generateRoadmap: async (analysisId: string, targetWeeks: number = 12): Promise<LearningRoadmap> => {
    const res = await apiClient.post<LearningRoadmap>('/roadmap/generate', {
      analysis_id: analysisId,
      target_weeks: targetWeeks,
    });
    return res.data;
  },
  getRoadmap: async (analysisId: string): Promise<LearningRoadmap> => {
    const res = await apiClient.get<LearningRoadmap>(`/roadmap/${analysisId}`);
    return res.data;
  },
  updateRoadmapItemStatus: async (itemId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<RoadmapItem> => {
    const res = await apiClient.patch<RoadmapItem>(`/roadmap/items/${itemId}`, { status });
    return res.data;
  },
  auditResumeQuality: async (resumeId: string): Promise<QualityAudit> => {
    const res = await apiClient.get<QualityAudit>(`/roadmap/resumes/${resumeId}/quality-audit`);
    return res.data;
  },
};
