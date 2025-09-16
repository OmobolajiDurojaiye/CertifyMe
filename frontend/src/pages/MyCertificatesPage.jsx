import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCertificates,
  getTemplates,
  deleteCertificate,
  getCertificatePDF,
  sendCertificateEmail,
  sendBulkEmails,
  getCurrentUser,
} from "../api";
import {
  Pencil,
  Trash,
  PlusCircle,
  Download,
  Eye,
  Mail,
  Send,
  HelpCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error(
        "Error caught by ErrorBoundary in MyCertificatesPage:",
        error
      );
      setHasError(true);
    };
    // This is a simplified way to catch rendering errors in children.
    // For a more robust solution, a library like react-error-boundary is recommended.
    const originalError = console.error;
    console.error = (...args) => {
      if (/The above error occurred in the <.*> component/.test(args[0])) {
        errorHandler(args[0]);
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  if (hasError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded m-4">
        Something went wrong while rendering this page. Please refresh or try
        logging in again.
      </div>
    );
  }
  return children;
}

function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedCertIds, setSelectedCertIds] = useState(new Set());
  const [sendingId, setSendingId] = useState(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certResponse, templateResponse, userResponse] = await Promise.all([
        getCertificates(),
        getTemplates(),
        getCurrentUser(),
      ]);
      // Sort certificates by issue_date in descending order (newest to oldest)
      const sortedCertificates = certResponse.data.sort(
        (a, b) =>
          new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      );
      setCertificates(sortedCertificates);
      setTemplates(templateResponse.data.templates);
      setUser(userResponse.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Could not fetch dashboard data. Your session might have expired. Please try logging in again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (certId) => {
    setSendingId(certId);
    const promise = sendCertificateEmail(certId);

    toast.promise(promise, {
      loading: "Sending email...",
      success: (res) => {
        setCertificates((certs) =>
          certs.map((c) =>
            c.id === certId ? { ...c, sent_at: new Date().toISOString() } : c
          )
        );
        return res.data.msg || "Email sent successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to send email.",
    });

    promise.finally(() => setSendingId(null));
  };

  const handleSelectOne = (certId) => {
    const newSelection = new Set(selectedCertIds);
    if (newSelection.has(certId)) newSelection.delete(certId);
    else newSelection.add(certId);
    setSelectedCertIds(newSelection);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedCertIds(new Set(certificates.map((c) => c.id)));
    else setSelectedCertIds(new Set());
  };

  const handleBulkSend = () => {
    if (selectedCertIds.size === 0) {
      toast.error("Please select at least one certificate to send.");
      return;
    }
    setIsBulkSending(true);
    const ids = Array.from(selectedCertIds);
    const promise = sendBulkEmails(ids);

    toast.promise(promise, {
      loading: `Sending ${ids.length} emails... This may take a moment.`,
      success: (res) => {
        fetchData(); // Refresh all data to get latest sent_at status
        setSelectedCertIds(new Set());
        const { sent, failed } = res.data;
        return `Process complete! Sent: ${sent.length}, Failed: ${failed.length}.`;
      },
      error: (err) => err.response?.data?.msg || "Bulk send failed.",
    });

    promise.finally(() => setIsBulkSending(false));
  };

  const handleDelete = async () => {
    if (!selectedCert) return;
    const promise = deleteCertificate(selectedCert.id);
    toast.promise(promise, {
      loading: "Deleting certificate...",
      success: () => {
        setCertificates(
          certificates.filter((cert) => cert.id !== selectedCert.id)
        );
        setShowDeleteModal(false);
        setSelectedCert(null);
        return "Certificate deleted successfully.";
      },
      error: (err) =>
        err.response?.data?.msg || "Failed to delete certificate.",
    });
  };

  const handleDownload = (cert) => {
    setDownloadingId(cert.id);
    const promise = getCertificatePDF(cert.id);
    toast.promise(promise, {
      loading: "Generating PDF...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `certificate_${cert.verification_id}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download starting!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download PDF.",
    });
    promise.finally(() => setDownloadingId(null));
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
      title: "Quota Remaining",
      value: user ? user.cert_quota : "...",
      icon: <HelpCircle className="w-6 h-6" />,
      color: "text-purple-600",
    },
  ];

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-center" reverseOrder={false} />
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
                Welcome back, {user?.name}!
              </h2>
              <p className="text-gray-500">
                You're on the{" "}
                <strong className="capitalize">{user?.role}</strong> plan.
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
                    className="inline-flex items-center bg-gray-700 text-white rounded-md py-2 px-4 hover:bg-gray-800 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" /> Bulk Create
                  </Link>
                </div>
              </div>

              {certificates.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedCertIds.size > 0 &&
                        selectedCertIds.size === certificates.length
                      }
                      className="h-4 w-4 mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">
                      {selectedCertIds.size} selected
                    </span>
                  </div>
                  <button
                    onClick={handleBulkSend}
                    disabled={selectedCertIds.size === 0 || isBulkSending}
                    className="inline-flex items-center bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isBulkSending ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Email to Selected
                      </>
                    )}
                  </button>
                </div>
              )}

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
                    Get started by creating your first digital certificate.
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
                      className="border-b border-gray-200 py-4 flex items-start"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCertIds.has(cert.id)}
                        onChange={() => handleSelectOne(cert.id)}
                        className="h-4 w-4 mr-4 mt-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-grow">
                        <h6 className="text-lg font-bold text-gray-900">
                          {cert.recipient_name}
                        </h6>
                        <p className="text-gray-600">{cert.course_title}</p>
                        <p className="text-gray-500 text-sm">
                          Issued:{" "}
                          {new Date(cert.issue_date).toLocaleDateString()}
                          {cert.sent_at && (
                            <span className="text-green-600 font-semibold ml-2">
                              | Emailed:{" "}
                              {new Date(cert.sent_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <button
                          onClick={() => handleSendEmail(cert.id)}
                          className={
                            cert.sent_at
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:text-blue-700"
                          }
                          title={
                            cert.sent_at ? "Email already sent" : "Send Email"
                          }
                          disabled={!!cert.sent_at || sendingId === cert.id}
                        >
                          {sendingId === cert.id ? (
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
                            <Mail className="w-5 h-5" />
                          )}
                        </button>
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
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold text-gray-900">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Are you sure you want to delete the certificate for{" "}
                    <strong>{selectedCert?.recipient_name}</strong>?<br />
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
                    >
                      Delete
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
