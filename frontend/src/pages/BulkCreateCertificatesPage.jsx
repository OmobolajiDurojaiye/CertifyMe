import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Table, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import Papa from "papaparse";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import TemplateSelector from "../components/TemplateSelector";
import {
  Maximize2,
  X,
  Info,
  CheckCircle,
  UploadCloud,
  Download,
  FileSpreadsheet,
  ArrowLeft,
  LayoutTemplate,
  Users,
  Eye,
  AlertCircle,
} from "lucide-react";
import { SERVER_BASE_URL } from "../config";
import {
  getTemplates,
  bulkCreateCertificates,
  getGroups,
  createGroup,
  downloadBulkTemplate,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";



const BulkCreateCertificatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const { user } = useUser();
  const isPro = user?.role === 'pro' || user?.role === 'enterprise';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templateRes, groupRes] = await Promise.all([
          getTemplates(),
          getGroups(),
        ]);
        setTemplates(templateRes.data.templates);
        setGroups(groupRes.data.groups);
      } catch (err) {
        setError("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => String(t.id) === String(templateId));

    if (template?.is_premium && !isPro) {
      toast.error("This is a Premium Template. Please upgrade your account to use it.");
      return;
    }

    setSelectedTemplateId(templateId);
    setSelectedTemplate(template || null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setSuccess("");
    setPreviewData([]);

    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.name.toLowerCase().endsWith(".csv")) {
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result.errors.length > 0) {
              setError("Could not parse CSV for preview.");
              return;
            }
            // Normalize for preview
            const normalizedData = result.data.map((row) => {
              const newRow = {};
              Object.keys(row).forEach((key) => {
                let newKey = key.trim().toLowerCase().replace(/ /g, "_");
                if (["name", "student", "full_name"].includes(newKey))
                  newKey = "recipient_name";
                if (["course", "program", "event"].includes(newKey))
                  newKey = "course_title";
                if (["date", "issued_on"].includes(newKey))
                  newKey = "issue_date";
                newRow[newKey] = row[key];
              });
              return newRow;
            });
            setPreviewData(normalizedData);
          },
          error: () => setError("Failed to parse CSV file."),
        });
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Please enter a group name.");
    const promise = createGroup(newGroupName);
    toast.promise(promise, {
      loading: "Creating group...",
      success: (res) => {
        const newGroup = res.data.group;
        setGroups((prev) => [newGroup, ...prev]);
        setSelectedGroupId(newGroup.id);
        setNewGroupName("");
        return "Group created!";
      },
      error: "Failed to create group.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !file || !selectedGroupId) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("template_id", selectedTemplateId);
    formData.append("group_id", selectedGroupId);
    formData.append("file", file);

    try {
      const response = await bulkCreateCertificates(formData);
      if (response.status === 207) {
        const { msg, created, errors } = response.data;
        const errorDetails = errors
          .map((err) => `Row ${err.row}: ${err.msg}`)
          .join("\n");
        setError(
          <>
            <strong>{msg}</strong> (Created: {created})
            <pre className="mt-2 bg-red-50 p-2 rounded text-xs text-red-600 max-h-32 overflow-y-auto">
              {errorDetails}
            </pre>
          </>
        );
      } else {
        toast.success(`${response.data.created} certificates created!`);
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    toast.promise(downloadBulkTemplate(), {
      loading: "Downloading template...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "bulk_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        return "Download started!";
      },
      error: "Download failed.",
    });
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bulk Create Certificates
          </h1>
          <p className="text-gray-500 text-sm">
            Upload a spreadsheet to generate hundreds of certificates at once.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Template */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    1
                  </span>
                  Select Template
                </label>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <TemplateSelector
                      value={selectedTemplateId}
                      onChange={handleTemplateChange}
                      options={templates}
                  />
                </div>
              </div>

              {/* Step 2: Group */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    2
                  </span>
                  Assign Group
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Users
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <select
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm appearance-none"
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      required
                    >
                      <option value="">Choose existing group...</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or create new..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreateGroup}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: File */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    3
                  </span>
                  Upload Data
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <FileSpreadsheet
                    className="mx-auto text-gray-400 mb-2"
                    size={32}
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {file ? file.name : "Click to upload spreadsheet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">CSV, Excel</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1 mt-2 ml-1"
                >
                  <Download size={12} /> Download sample template
                </button>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3 text-sm text-red-700 border border-red-100">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? <Spinner size="sm" /> : <UploadCloud size={20} />}
                <span>Start Bulk Process</span>
              </button>
            </Form>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-8 space-y-6">
          {/* Certificate Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Eye size={18} className="text-indigo-600" />
                Live Preview
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Row 1 Data
                </span>
              </h3>
              {selectedTemplate && (
                <button
                  onClick={() => setShowFullscreen(true)}
                  className="text-gray-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Maximize2 size={18} />
                </button>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center min-h-[300px]">
              <div className="w-full shadow-lg max-w-2xl transition-all duration-300">
                <TemplateRenderer
                  template={selectedTemplate}
                  formData={previewData[0]}
                />
              </div>
            </div>
          </div>

          {/* Data Table Preview */}
          {previewData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                  Data Snapshot
                </h4>
                <span className="text-xs text-gray-500">
                  Showing first 5 rows
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table hover responsive className="mb-0 text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th
                          key={key}
                          className="font-medium px-6 py-3 uppercase text-xs tracking-wider whitespace-nowrap"
                        >
                          {key.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((val, i) => (
                          <td
                            key={i}
                            className="px-6 py-3 text-gray-600 whitespace-nowrap"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Modal
        show={showFullscreen}
        onHide={() => setShowFullscreen(false)}
        size="xl"
        centered
        contentClassName="bg-transparent border-0"
      >
        <div className="relative w-full max-w-5xl mx-auto">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
          >
            <X size={32} />
          </button>
          <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
            <TemplateRenderer
              template={selectedTemplate}
              formData={previewData[0]}
              isFullscreen={true}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BulkCreateCertificatesPage;
