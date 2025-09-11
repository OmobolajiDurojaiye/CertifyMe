import axios from "axios";
import { API_BASE_URL } from "./config"; // <-- Import the new config

const apiClient = axios.create({
  baseURL: API_BASE_URL, // <-- Use the config variable
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

export const loginUser = (credentials) =>
  apiClient.post("/auth/login", credentials);
export const signupUser = (userData) =>
  apiClient.post("/auth/register", userData);
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

// --- User & Payment API Calls ---
export const getCurrentUser = () => apiClient.get("/users/me");
export const initializePayment = (plan) =>
  apiClient.post("/payments/initialize", { plan });
