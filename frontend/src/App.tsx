import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

// Layouts
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Public
import HomePage from '@/pages/public/HomePage';
import PricingPage from '@/pages/public/PricingPage';
import FeaturesPage from '@/pages/public/FeaturesPage';
import FaqPage from '@/pages/public/FaqPage';
import ContactPage from '@/pages/public/ContactPage';
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicyPage';
import TermsPage from '@/pages/public/TermsPage';
import BlogPage from '@/pages/public/BlogPage';
import BlogPostPage from '@/pages/public/BlogPostPage';

// Auth
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Dashboard
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import ProjectsPage from '@/pages/dashboard/ProjectsPage';
import NewProjectPage from '@/pages/dashboard/NewProjectPage';
import ProjectDetailPage from '@/pages/dashboard/ProjectDetailPage';
import GenerateAdsPage from '@/pages/dashboard/GenerateAdsPage';
import AnalysisDetailPage from '@/pages/dashboard/AnalysisDetailPage';
import GenerationDetailPage from '@/pages/dashboard/GenerationDetailPage';
import AnalysesListPage from '@/pages/dashboard/AnalysesListPage';
import GenerationsListPage from '@/pages/dashboard/GenerationsListPage';
import ExportsPage from '@/pages/dashboard/ExportsPage';
import BillingPage from '@/pages/dashboard/BillingPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import AudienceBuilderPage from '@/pages/dashboard/AudienceBuilderPage';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from '@/pages/admin/AdminSubscriptionsPage';
import { AdminProjectsPage, AdminAnalysesPage, AdminGenerationsPage, AdminExportsPage, AdminAuditLogsPage, AdminUsagePage, AdminSystemPage } from '@/pages/admin/AdminDataPage';
import AdminBlogPage from '@/pages/admin/AdminBlogPage';

import { LoadingSpinner } from '@/components/shared';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Auth */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardOverview />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/new" element={<NewProjectPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="projects/:id/generate" element={<GenerateAdsPage />} />
              <Route path="projects/:id/audience" element={<AudienceBuilderPage />} />
              <Route path="analyses" element={<AnalysesListPage />} />
              <Route path="analyses/:id" element={<AnalysisDetailPage />} />
              <Route path="generations" element={<GenerationsListPage />} />
              <Route path="generations/:id" element={<GenerationDetailPage />} />
              <Route path="exports" element={<ExportsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="usage" element={<AdminUsagePage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="analyses" element={<AdminAnalysesPage />} />
              <Route path="generations" element={<AdminGenerationsPage />} />
              <Route path="exports" element={<AdminExportsPage />} />
              <Route path="logs" element={<AdminAuditLogsPage />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="system" element={<AdminSystemPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
