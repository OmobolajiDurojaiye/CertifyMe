import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCertificates,
  getTemplates,
  deleteCertificate,
  getCertificatePDF,
} from "../api";
import { Pencil, Trash, PlusCircle, Download, Eye } from "lucide-react";

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error("Error in MyCertificatesPage:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded m-4">
        Something went wrong. Please refresh the page or try logging in again.
      </div>
    );
  }
  return children;
}

function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [certResponse, templateResponse] = await Promise.all([
          getCertificates(),
          getTemplates(),
        ]);
        setCertificates(certResponse.data);
        setTemplates(templateResponse.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          "Could not fetch dashboard data. Your session might have expired. Please try logging in again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!selectedCert) return;
    setLoading(true);
    try {
      await deleteCertificate(selectedCert.id);
      setCertificates(
        certificates.filter((cert) => cert.id !== selectedCert.id)
      );
      setShowDeleteModal(false);
      setSelectedCert(null);
    } catch (err) {
      setError("Failed to delete certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const response = await getCertificatePDF(cert.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate_${cert.verification_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const stats = [
    {
      title: "Certificates Issued",
      value: certificates.length,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "text-blue-600",
    },
    {
      title: "Templates Created",
      value: templates.length,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 6a1 1 0 011-1h6a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8zm12 0a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1v-8z"
          />
        </svg>
      ),
      color: "text-green-600",
    },
    {
      title: "Verifications",
      value: "0",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      color: "text-yellow-600",
    },
  ];

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-indigo-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back!
              </h2>
              <p className="text-gray-500">
                Here's a summary of your account activity.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-gray-900">
                  My Certificates
                </h4>
                <div className="space-x-3">
                  <Link
                    to="/dashboard/create"
                    className="inline-flex items-center bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" /> Create New
                  </Link>
                  <Link
                    to="/dashboard/bulk-create"
                    className="inline-flex items-center bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" /> Bulk Create
                  </Link>
                </div>
              </div>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <img
                    src="/images/certbadge.png"
                    alt="Badge"
                    className="w-24 mx-auto mb-4"
                  />
                  <h4 className="text-xl font-bold text-gray-900">
                    Your certificate list is empty
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first digital certificate or
                    badge.
                  </p>
                  <Link
                    to="/dashboard/create"
                    className="inline-flex items-center bg-indigo-600 text-white rounded-md py-2 px-6 hover:bg-indigo-700 transition-colors"
                  >
                    Create Your First Certificate
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="border-b border-gray-200 py-4 flex justify-between items-start"
                    >
                      <div>
                        <h6 className="text-lg font-bold text-gray-900">
                          {cert.recipient_name}
                        </h6>
                        <p className="text-gray-600">{cert.course_title}</p>
                        <p className="text-gray-500 text-sm">
                          Issued:{" "}
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              cert.status === "valid"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {cert.status.toUpperCase()}
                          </span>
                          {cert.signature && (
                            <span className="text-gray-500 text-sm ml-2">
                              | Signed: {cert.signature}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <button
                          onClick={() => handleDownload(cert)}
                          className="text-green-600 hover:text-green-800"
                          title="Download PDF"
                          disabled={downloadingId === cert.id}
                        >
                          {downloadingId === cert.id ? (
                            <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                              />
                            </svg>
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/view/${cert.id}`)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="View Certificate"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/edit/${cert.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Certificate"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCert(cert);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Certificate"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showDeleteModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold text-gray-900">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Are you sure you want to delete the certificate for{" "}
                    <strong>{selectedCert?.recipient_name}</strong>?
                    <br />
                    <small className="text-gray-500">
                      This action cannot be undone.
                    </small>
                  </p>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="bg-gray-300 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 text-white rounded-md py-2 px-4 hover:bg-red-700 transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <svg
                          className="animate-spin h-5 w-5 mr-2 inline-block"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                          />
                        </svg>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default MyCertificatesPage;
