import React from "react";
import { Routes, Route } from "react-router-dom";

// User-facing imports
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyCertificatesPage from "./pages/MyCertificatesPage";
import CreateCertificatePage from "./pages/CreateCertificatePage";
import SettingsPage from "./pages/SettingsPage";
import TemplatesPage from "./pages/TemplatesPage";
import ViewCertificatePage from "./pages/ViewCertificatePage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import BulkCreateCertificatesPage from "./pages/BulkCreateCertificatesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GroupsPage from "./pages/GroupsPage";
import ContactSupportPage from "./pages/ContactSupportPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import UploadTemplatePage from "./pages/UploadTemplatePage";

// Admin imports
import AdminPortalPage from "./pages/AdminPortalPage";
import AdminVerifyPage from "./pages/AdminVerifyPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";
import AdminPaymentDetailsPage from "./pages/AdminPaymentDetailsPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import AdminSupportTicketDetailsPage from "./pages/AdminSupportTicketDetailsPage";

// --- THIS IS THE NEW FEATURE ---
import DocsPage from "./pages/DocsPage";
// --- END OF NEW FEATURE ---

const NotFoundPage = () => <h1 className="p-5">404: Page Not Found</h1>;

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerifyCertificatePage />} />
      <Route
        path="/verify/:verificationId"
        element={<VerifyCertificatePage />}
      />

      <Route path="/docs" element={<DocsPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminPortalPage />} />
      <Route path="/admin/verify" element={<AdminVerifyPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="users/:userId" element={<AdminUserDetailsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route
            path="payments/:paymentId"
            element={<AdminPaymentDetailsPage />}
          />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route
            path="support/:ticketId"
            element={<AdminSupportTicketDetailsPage />}
          />
        </Route>
      </Route>

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyCertificatesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="create" element={<CreateCertificatePage />} />
          <Route path="edit/:certId" element={<CreateCertificatePage />} />
          <Route path="view/:certId" element={<ViewCertificatePage />} />
          <Route path="bulk-create" element={<BulkCreateCertificatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<ContactSupportPage />} />
          <Route path="support/:ticketId" element={<ContactSupportPage />} />
          <Route
            path="/dashboard/upload-template"
            element={<UploadTemplatePage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
