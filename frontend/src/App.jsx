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
import AdminSupportPage from "./pages/AdminSupportPage"; // NEW
import AdminSupportTicketDetailsPage from "./pages/AdminSupportTicketDetailsPage"; // NEW

const NotFoundPage = () => <h1 className="p-5">404: Page Not Found</h1>;

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyCertificatePage />} />
      <Route
        path="/verify/:verificationId"
        element={<VerifyCertificatePage />}
      />

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
          {/* --- THIS IS THE NEW FEATURE --- */}
          <Route path="support" element={<AdminSupportPage />} />
          <Route
            path="support/:ticketId"
            element={<AdminSupportTicketDetailsPage />}
          />
          {/* --- END OF NEW FEATURE --- */}
        </Route>
      </Route>

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyCertificatesPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="create" element={<CreateCertificatePage />} />
          <Route path="edit/:certId" element={<CreateCertificatePage />} />
          <Route path="view/:certId" element={<ViewCertificatePage />} />
          <Route path="bulk-create" element={<BulkCreateCertificatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<ContactSupportPage />} />
          <Route path="support/:ticketId" element={<ContactSupportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
