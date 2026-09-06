import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { ResumeListPage } from './pages/ResumeListPage';
import { JobInputPage } from './pages/JobInputPage';
import { JobListPage } from './pages/JobListPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { JobComparePage } from './pages/JobComparePage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Workspace Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resumes" element={<ResumeListPage />} />
            <Route path="/resumes/upload" element={<ResumeUploadPage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/new" element={<JobInputPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
            <Route path="/roadmap/:analysisId" element={<RoadmapPage />} />
            <Route path="/jobs/compare" element={<JobComparePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
