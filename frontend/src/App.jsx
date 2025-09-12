import React from "react";
import { Routes, Route } from "react-router-dom";

// Import Layouts and Pages
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

const NotFoundPage = () => <h1 className="p-5">404: Page Not Found</h1>;

function App() {
  return (
    <Routes>
      {/* Publicly Accessible Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyCertificatePage />} />
      <Route
        path="/verify/:verificationId"
        element={<VerifyCertificatePage />}
      />

      {/* Protected Routes */}
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
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
