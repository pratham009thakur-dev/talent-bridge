import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './layouts/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsExplorePage from './pages/JobsExplorePage';
import JobDetailPage from './pages/JobDetailPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJobPage from './pages/employer/PostJobPage';
import EmployerJobsPage from './pages/employer/EmployerJobsPage';
import JobApplicantsPage from './pages/employer/JobApplicantsPage';
import CompanyProfilePage from './pages/employer/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/jobs" element={<JobsExplorePage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Candidate Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/profile" element={<CandidateProfilePage />} />
              <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
              <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
            </Route>

            {/* Employer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/employer/post-job" element={<PostJobPage />} />
              <Route path="/employer/jobs" element={<EmployerJobsPage />} />
              <Route
                path="/employer/jobs/:jobId/applicants"
                element={<JobApplicantsPage />}
              />
              <Route path="/employer/profile" element={<CompanyProfilePage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}