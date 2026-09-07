import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SeoManager } from '@/components/shared/SeoManager';
import { LoadingSpinner, ErrorBoundary } from '@/components/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// The marketing homepage is the only eagerly loaded page; everything else is
// code-split so anonymous visitors never download the dashboard or admin bundles.
import HomePage from '@/pages/public/HomePage';

const PricingPage = lazy(() => import('@/pages/public/PricingPage'));
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'));
const FaqPage = lazy(() => import('@/pages/public/FaqPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const BlogPage = lazy(() => import('@/pages/public/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/public/BlogPostPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));

const DashboardOverview = lazy(() => import('@/pages/dashboard/DashboardOverview'));
const ProjectsPage = lazy(() => import('@/pages/dashboard/ProjectsPage'));
const NewProjectPage = lazy(() => import('@/pages/dashboard/NewProjectPage'));
const ProjectDetailPage = lazy(() => import('@/pages/dashboard/ProjectDetailPage'));
const GenerateAdsPage = lazy(() => import('@/pages/dashboard/GenerateAdsPage'));
const AnalysisDetailPage = lazy(() => import('@/pages/dashboard/AnalysisDetailPage'));
const GenerationDetailPage = lazy(() => import('@/pages/dashboard/GenerationDetailPage'));
const AnalysesListPage = lazy(() => import('@/pages/dashboard/AnalysesListPage'));
const GenerationsListPage = lazy(() => import('@/pages/dashboard/GenerationsListPage'));
const ExportsPage = lazy(() => import('@/pages/dashboard/ExportsPage'));
const BillingPage = lazy(() => import('@/pages/dashboard/BillingPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const AudienceBuilderPage = lazy(() => import('@/pages/dashboard/AudienceBuilderPage'));
const AgencyDashboard = lazy(() => import('@/pages/agency/AgencyDashboard'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminSubscriptionsPage = lazy(() => import('@/pages/admin/AdminSubscriptionsPage'));
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage'));
const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminProjectsPage })));
const AdminAnalysesPage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminAnalysesPage })));
const AdminGenerationsPage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminGenerationsPage })));
const AdminExportsPage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminExportsPage })));
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminAuditLogsPage })));
const AdminUsagePage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminUsagePage })));
const AdminSystemPage = lazy(() => import('@/pages/admin/AdminDataPage').then(m => ({ default: m.AdminSystemPage })));

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
    <BrowserRouter>
      <AuthProvider>
        <SeoManager />
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner text="Loading..." />}>
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
                <Route path="agency" element={<AgencyDashboard />} />
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

              {/* Real 404 — no soft redirect */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
