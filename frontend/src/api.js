import axios from "axios";

// Create the basic Axios instance
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Define the interceptor that attaches the token
const authInterceptor = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Attach the interceptor to the instance
apiClient.interceptors.request.use(authInterceptor);

// Export the instance and explicit functions for clarity
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
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getCertificatePDF = (certId) =>
  apiClient.get(`/certificates/${certId}/pdf`, {
    responseType: "blob", // Important for file downloads
  });
