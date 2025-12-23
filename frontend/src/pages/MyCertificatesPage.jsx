import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  CheckCircle,
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

  // Action States
  const [downloadingId, setDownloadingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [selectedCertIds, setSelectedCertIds] = useState(new Set());

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, sent, not_sent
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      // Sort by newest first
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

  // --- Derived State for Filtering & Pagination ---
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course_title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "sent"
          ? !!cert.sent_at
          : !cert.sent_at;

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCertificates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCertificates, currentPage]);

  // --- Handlers ---

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
    if (e.target.checked) {
      // Select all currently filtered certificates
      const allIds = filteredCertificates.map((c) => c.id);
      setSelectedCertIds(new Set(allIds));
    } else {
      setSelectedCertIds(new Set());
    }
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
      loading: `Sending ${ids.length} emails...`,
      success: (res) => {
        fetchData();
        setSelectedCertIds(new Set());
        const { sent, failed } = res.data;
        return `Process complete! Sent: ${sent.length}, Failed: ${
          failed?.length || 0
        }.`;
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
        // Clear from selection if it was selected
        if (selectedCertIds.has(selectedCert.id)) {
          const newSet = new Set(selectedCertIds);
          newSet.delete(selectedCert.id);
          setSelectedCertIds(newSet);
        }
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
        return "Download started!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download PDF.",
    });
    promise.finally(() => setDownloadingId(null));
  };

  const stats = [
    {
      title: "Certificates Issued",
      value: certificates.length,
      icon: <FileText className="w-6 h-6" />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Templates Created",
      value: templates.length,
      icon: <Eye className="w-6 h-6" />,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Quota Remaining",
      value: user ? user.cert_quota : "...",
      icon: <HelpCircle className="w-6 h-6" />,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto pb-12">
        <Toaster position="top-right" />

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h2>
            <p className="text-gray-500 mt-1">
              Manage your certificates and templates from here.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard/create"
              className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-lg py-2.5 px-5 hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New
            </Link>
            <Link
              to="/dashboard/bulk-create"
              className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg py-2.5 px-5 hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Bulk Create
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search certificates..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-gray-200 p-1 rounded-lg self-start sm:self-auto">
                {["all", "sent", "not_sent"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      filterStatus === status
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status === "sent"
                      ? "Emailed"
                      : "Pending"}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCertIds.size > 0 && (
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-sm font-medium text-gray-600">
                  {selectedCertIds.size} selected
                </span>
                <button
                  onClick={handleBulkSend}
                  disabled={isBulkSending}
                  className="inline-flex items-center bg-blue-600 text-white text-sm font-medium rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isBulkSending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Email
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-8 w-8 mx-auto text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              <p className="mt-3 text-gray-500">Loading your certificates...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No certificates found
              </h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first certificate."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Link
                  to="/dashboard/create"
                  className="mt-4 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Create Certificate <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            paginatedCertificates.length > 0 &&
                            paginatedCertificates.every((c) =>
                              selectedCertIds.has(c.id)
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Recipient
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Course / Event
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Date Issued
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCertificates.map((cert) => {
                    const isSelected = selectedCertIds.has(cert.id);
                    return (
                      <tr
                        key={cert.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-indigo-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(cert.id)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {cert.recipient_name}
                          </div>
                          {cert.recipient_email && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {cert.recipient_email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {cert.course_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cert.sent_at ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Emailed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleSendEmail(cert.id)}
                              disabled={!!cert.sent_at || sendingId === cert.id}
                              className={`p-1.5 rounded-md transition-colors ${
                                cert.sent_at
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                              title="Send Email"
                            >
                              {sendingId === cert.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDownload(cert)}
                              disabled={downloadingId === cert.id}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Download PDF"
                            >
                              {downloadingId === cert.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>

                            <div className="h-4 w-px bg-gray-200 mx-1"></div>

                            <button
                              onClick={() =>
                                navigate(`/dashboard/view/${cert.id}`)
                              }
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/dashboard/edit/${cert.id}`)
                              }
                              className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCert(cert);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredCertificates.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredCertificates.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredCertificates.length}
                </span>{" "}
                results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Logic to show limited page numbers (start, end, current +/- 1)
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Certificate?
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the certificate for{" "}
                <strong>{selectedCert?.recipient_name}</strong>? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Delete Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default MyCertificatesPage;
