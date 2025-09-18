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
  // --- MODIFIED: Now handles date objects ---
  if (params.start_date instanceof Date) {
    params.start_date = params.start_date.toISOString().split("T")[0];
  }
  if (params.end_date instanceof Date) {
    params.end_date = params.end_date.toISOString().split("T")[0];
  }
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/admin/users?${query}`);
};

// --- NEW: Function to get all details for one user ---
export const getAdminUserDetails = (userId) =>
  apiClient.get(`/admin/users/${userId}`);

// --- NEW: Function to adjust user quota ---
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

// Admin Certificates
export const getAdminCertificatesOverview = () =>
  apiClient.get("/admin/certificates/overview");
export const revokeAdminCertificate = (certId) =>
  apiClient.post(`/admin/certificates/${certId}/revoke`);

// Admin Analytics
export const getAdminAnalytics = () =>
  apiClient.get("/admin/analytics/insights");

// Admin Dashboard Stats
export const getAdminDashboardStats = async () => {
  const response = await apiClient.get("/admin/dashboard-stats");
  return response.data; // Ensure we return the data object from the response
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

export const uploadUserSignature = (formData) =>
  apiClient.post("/users/me/signature", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

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
