// api.js
import axios from "axios";
import { API_BASE_URL } from "./config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const authInterceptor = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(authInterceptor);

export default apiClient;

// --- USER API Calls ---
export const loginUser = (credentials) =>
  apiClient.post("/auth/login", credentials);
export const signupUser = (userData) =>
  apiClient.post("/auth/register", userData);

// --- NEW PASSWORD RESET API Calls ---
export const requestPasswordReset = (email) =>
  apiClient.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  apiClient.post("/auth/reset-password", { token, password });
// --- END OF NEW FEATURE ---

// --- ADMIN API Calls ---
export const adminLogin = (credentials) =>
  apiClient.post("/admin/auth/login", credentials);
export const getAdminStatus = () => apiClient.get("/admin/auth/status");
export const adminSignup = (userData) =>
  apiClient.post("/admin/auth/signup", userData);
export const verifyAdmin = (verificationData) =>
  apiClient.post("/admin/auth/verify", verificationData);
export const getAdminProfile = () => apiClient.get("/admin/users/me");

// Admin User Management
export const getAdminUsers = (params = {}) => {
  if (params.start_date instanceof Date) {
    params.start_date = params.start_date.toISOString().split("T")[0];
  }
  if (params.end_date instanceof Date) {
    params.end_date = params.end_date.toISOString().split("T")[0];
  }
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/admin/users?${query}`);
};
export const getAdminUserDetails = (userId) =>
  apiClient.get(`/admin/users/${userId}`);
export const adjustUserQuota = (userId, adjustment, reason) =>
  apiClient.post(`/admin/users/${userId}/adjust-quota`, { adjustment, reason });
export const getAdminUserPayments = (userId) =>
  apiClient.get(`/admin/users/${userId}/payments`);
export const suspendAdminUser = (userId) =>
  apiClient.post(`/admin/users/${userId}/suspend`);
export const unsuspendAdminUser = (userId) =>
  apiClient.post(`/admin/users/${userId}/unsuspend`);
export const updateAdminUserPlan = (userId, plan) =>
  apiClient.put(`/admin/users/${userId}/plan`, { plan });

// Admin Payments
export const getAdminTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/admin/payments/transactions?${query}`);
};
export const getAdminTransactionDetails = (paymentId) =>
  apiClient.get(`/admin/payments/transactions/${paymentId}`);

// Admin Certificates
export const getAdminCertificatesOverview = () =>
  apiClient.get("/admin/certificates/overview");
export const getAdminCertificates = (params = {}) => {
  if (params.start_date instanceof Date) {
    params.start_date = params.start_date.toISOString().split("T")[0];
  }
  if (params.end_date instanceof Date) {
    params.end_date = params.end_date.toISOString().split("T")[0];
  }
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/admin/certificates?${query}`);
};
export const revokeAdminCertificate = (certId) =>
  apiClient.post(`/admin/certificates/${certId}/revoke`);

// Admin Analytics
export const getAdminAnalytics = (period = "1y") =>
  apiClient.get(`/admin/analytics/insights?period=${period}`);
export const getAdminDashboardStats = async () => {
  const response = await apiClient.get("/admin/dashboard-stats");
  return response.data;
};

// --- THIS IS THE NEW FEATURE ---
// New function to get the count of open tickets
export const getOpenTicketsCount = () =>
  apiClient.get("/admin/support/tickets/open-count");
// --- END OF NEW FEATURE ---

// For Admins
export const getAdminSupportTickets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/admin/support/tickets?${query}`);
};
export const getAdminTicketDetails = (ticketId) =>
  apiClient.get(`/admin/support/tickets/${ticketId}`);
export const adminReplyToTicket = (ticketId, message, file) => {
  const formData = new FormData();
  formData.append("message", message);
  if (file) {
    formData.append("file", file);
  }
  return apiClient.post(`/admin/support/tickets/${ticketId}/reply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const updateTicketStatus = (ticketId, status) =>
  apiClient.put(`/admin/support/tickets/${ticketId}/status`, { status });

// For Users
export const createUserTicket = (subject, message, file) => {
  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("message", message);
  if (file) {
    formData.append("file", file);
  }
  return apiClient.post("/support/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getUserTickets = () => apiClient.get("/support/tickets");
export const getUserTicketDetails = (ticketId) =>
  apiClient.get(`/support/tickets/${ticketId}`);
export const replyToTicket = (ticketId, message, file) => {
  const formData = new FormData();
  formData.append("message", message);
  if (file) {
    formData.append("file", file);
  }
  return apiClient.post(`/support/tickets/${ticketId}/reply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- USER-FACING API Calls ---
export const getTemplates = () => apiClient.get("/templates/");
export const getTemplate = (templateId) =>
  apiClient.get(`/templates/${templateId}`);
export const createTemplate = (formData) =>
  apiClient.post("/templates/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateTemplate = (templateId, formData) =>
  apiClient.put(`/templates/${templateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
// --- THIS IS THE NEW FEATURE ---
export const deleteTemplate = (templateId) =>
  apiClient.delete(`/templates/${templateId}`);
// --- END OF NEW FEATURE ---

// API calls for the visual template editor
export const createVisualTemplate = (templateData) =>
  apiClient.post("/templates/visual/", templateData);
export const getVisualTemplate = (templateId) =>
  apiClient.get(`/templates/visual/${templateId}`);
export const updateVisualTemplate = (templateId, templateData) =>
  apiClient.put(`/templates/visual/${templateId}`, templateData);

export const getCertificates = () => apiClient.get("/certificates/");
export const createCertificate = (certData) =>
  apiClient.post("/certificates/", certData);
export const getCertificate = (certId) =>
  apiClient.get(`/certificates/${certId}`);
export const updateCertificate = (certId, certData) =>
  apiClient.put(`/certificates/${certId}`, certData);
export const deleteCertificate = (certId) =>
  apiClient.delete(`/certificates/${certId}`);
export const verifyCertificate = (verificationId) =>
  apiClient.get(`/certificates/verify/${verificationId}`);
export const bulkCreateCertificates = (formData) =>
  apiClient.post("/certificates/bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCertificateStatus = (certId, status) =>
  apiClient.put(`/certificates/${certId}/status`, { status });

export const sendCertificateEmail = (certId) =>
  apiClient.post(`/certificates/${certId}/send`);
export const sendBulkEmails = (certificateIds) =>
  apiClient.post("/certificates/bulk-send", {
    certificate_ids: certificateIds,
  });
export const getCertificatePDF = (certId) =>
  apiClient.get(`/certificates/${certId}/pdf`, {
    responseType: "blob",
  });

export const getCurrentUser = () => apiClient.get("/users/me");
export const initializePayment = (plan) =>
  apiClient.post("/payments/initialize", { plan });

export const getUserAnalytics = () => apiClient.get("/analytics/dashboard");

export const uploadUserSignature = (formData) =>
  apiClient.post("/users/me/signature", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// --- THIS IS THE NEW FEATURE ---
export const generateApiKey = () => apiClient.post("/users/me/api-key");
// --- END OF NEW FEATURE ---

export const getGroups = (page = 1) => apiClient.get(`/groups/?page=${page}`);
export const createGroup = (name) => apiClient.post("/groups/", { name });
export const getGroupDetails = (groupId) => apiClient.get(`/groups/${groupId}`);
export const deleteGroup = (groupId) => apiClient.delete(`/groups/${groupId}`);
export const sendGroupBulkEmail = (groupId) =>
  apiClient.post(`/groups/${groupId}/send-bulk-email`);
export const downloadBulkTemplate = () =>
  apiClient.get("/certificates/bulk-template", { responseType: "blob" });

export const downloadGroupBulkPDF = (groupId) =>
  apiClient.get(`/groups/${groupId}/download-bulk-pdf`, {
    responseType: "blob",
  });

// New upload for editor images
export const uploadEditorImage = (formData) =>
  apiClient.post("/uploads/editor-images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const createCustomTemplate = (formData) =>
  apiClient.post("/templates/upload-custom", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCustomTemplate = (templateId, formData) =>
  apiClient.put(`/templates/upload-custom/${templateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
