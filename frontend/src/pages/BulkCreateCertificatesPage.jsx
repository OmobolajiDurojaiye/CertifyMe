import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Table, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import Papa from "papaparse";
import QRCode from "react-qr-code";
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
import KonvaPreview from "../components/KonvaPreview";

const CertificatePreview = ({ template, formData }) => {
  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
        <LayoutTemplate className="w-12 h-12 mb-3 opacity-20" />
        <p className="font-medium">Select a template to generate preview</p>
      </div>
    );
  }

  const data =
    formData && formData.recipient_name
      ? formData
      : {
          recipient_name: "Recipient Name",
          course_title: "Course Title",
          issue_date: new Date().toLocaleDateString(),
          issuer_name: "Issuer Name",
          signature: "Signature",
          verification_id: "pending-id",
        };

  if (template.layout_style === "visual") {
    return (
      <div className="shadow-lg rounded-lg overflow-hidden h-full bg-white">
        <KonvaPreview layoutData={template.layout_data} dynamicData={data} />
      </div>
    );
  }

  const {
    layout_style,
    primary_color = "#2563EB",
    secondary_color = "#64748B",
    body_font_color = "#333333",
    font_family = "Georgia",
    background_url,
    logo_url,
    custom_text,
  } = template;

  const certificateTitle = custom_text?.title || "Certificate of Completion";
  const certificateBody =
    custom_text?.body || "has successfully completed the course";

  const textStyle = { color: body_font_color, fontFamily: font_family };
  const backgroundStyle = {
    backgroundImage: background_url
      ? `url(${SERVER_BASE_URL}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const renderClassic = () => (
    <div
      className="h-full w-full bg-white relative flex flex-col shadow-xl overflow-hidden"
      style={{
        border: `8px double ${primary_color}`,
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      <div
        style={{
          height: "12px",
          borderBottom: `4px solid ${primary_color}`,
          background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
        }}
      />
      <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
        {logo_url && (
          <img
            src={`${SERVER_BASE_URL}${logo_url}`}
            alt="Logo"
            className="mb-4 object-contain h-20 w-20"
          />
        )}
        <h1
          className="font-bold uppercase tracking-wider text-2xl mb-1"
          style={{ color: primary_color }}
        >
          {certificateTitle}
        </h1>
        <p className="italic text-sm mb-2" style={{ color: "#4B5EAA" }}>
          This is to certify that
        </p>
        <h2
          className="font-extrabold text-3xl mb-2"
          style={{ fontFamily: "'Georgia', serif", ...textStyle }}
        >
          {data.recipient_name}
        </h2>
        <p className="italic text-sm mb-2" style={{ color: "#4B5EAA" }}>
          {certificateBody}
        </p>
        <p
          className="font-bold uppercase text-xl mb-4"
          style={{ color: secondary_color }}
        >
          {data.course_title}
        </p>
        <p className="text-sm mb-6" style={{ color: body_font_color }}>
          Awarded on {data.issue_date}
        </p>
        <div className="flex justify-between w-full mt-auto pt-4 px-8 border-t border-gray-100">
          <div className="text-center w-1/3">
            <p className="font-semibold text-sm" style={textStyle}>
              {data.signature}
            </p>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Signature
            </span>
          </div>
          <div className="text-center w-1/3">
            <p className="font-semibold text-sm" style={textStyle}>
              {data.issuer_name}
            </p>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Issuer
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModern = () => (
    <div
      className="flex h-full w-full shadow-lg rounded-xl overflow-hidden bg-white"
      style={{
        border: `6px solid ${primary_color}`,
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      <div
        className="w-[35%] flex flex-col justify-between items-center p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
        }}
      >
        <div className="text-center">
          {logo_url && (
            <img
              src={`${SERVER_BASE_URL}${logo_url}`}
              className="w-16 h-16 rounded-full border-4 border-white shadow mb-2 object-cover bg-white"
              alt="Logo"
            />
          )}
          <p className="font-bold uppercase text-xs tracking-wider opacity-90">
            {data.issuer_name}
          </p>
        </div>
        <div className="bg-white p-1 rounded shadow">
          <QRCode
            value={`${window.location.origin}/verify/${data.verification_id}`}
            size={64}
            viewBox="0 0 64 64"
          />
        </div>
      </div>
      <div className="flex-grow p-6 flex flex-col justify-center relative bg-white/95">
        <h1
          className="font-light uppercase tracking-widest text-lg mb-4"
          style={{ color: primary_color }}
        >
          {certificateTitle}
        </h1>
        <h2
          className="font-bold text-3xl mb-3 leading-tight"
          style={{ fontFamily: "'Georgia', serif", ...textStyle }}
        >
          {data.recipient_name}
        </h2>
        <p className="italic text-sm text-gray-600 mb-4">{certificateBody}</p>
        <p
          className="font-bold uppercase text-lg tracking-wide mb-6"
          style={{ color: secondary_color }}
        >
          {data.course_title}
        </p>
        <div
          className="flex justify-between mt-auto pt-4 border-t-2"
          style={{ borderColor: primary_color }}
        >
          <div>
            <p className="font-bold text-sm" style={textStyle}>
              {data.signature}
            </p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Signature
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm" style={textStyle}>
              {data.issuer_name}
            </p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Issuer
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceipt = () => (
    <div
      className="h-full w-full bg-white relative flex flex-col shadow-xl overflow-hidden text-sm"
      style={{ fontFamily: "sans-serif" }}
    >
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            {logo_url ? (
              <img
                src={`${SERVER_BASE_URL}${logo_url}`}
                className="h-12 object-contain mb-2"
                alt="Logo"
              />
            ) : (
              <h2
                className="text-xl font-bold"
                style={{ color: primary_color }}
              >
                {data.issuer_name}
              </h2>
            )}
          </div>
          <div className="text-right text-gray-500 text-xs">
            <p className="font-bold text-base text-gray-800">
              {data.issuer_name}
            </p>
            <p>Receipt</p>
            <p>{data.issue_date}</p>
          </div>
        </div>
        <div
          className="flex justify-between items-center p-3 rounded mb-6"
          style={{ background: primary_color, color: "white" }}
        >
          <span className="font-bold text-lg tracking-wider">
            {certificateTitle}
          </span>
          <span className="font-mono opacity-80">
            #{data.verification_id.substring(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Bill To</p>
            <p className="font-bold text-lg text-gray-800">
              {data.recipient_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
            <p className="font-bold text-green-600">PAID</p>
          </div>
        </div>
        <div className="border-b border-gray-200 mb-2">
          <div className="flex justify-between py-2 bg-gray-50 px-2 font-bold text-gray-500 text-xs uppercase">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="flex justify-between py-4 px-2">
            <span className="font-medium text-gray-800">
              {data.course_title}
            </span>
            <span className="font-bold" style={{ color: primary_color }}>
              {data.amount || "PAID"}
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-4 mb-auto">
          <div className="w-1/2 flex justify-between border-t-2 border-gray-800 pt-2">
            <span className="font-bold text-lg">Total</span>
            <span
              className="font-bold text-lg"
              style={{ color: primary_color }}
            >
              {data.amount || "PAID"}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-end">
          <div className="text-xs text-gray-400">
            <p>Auth Signature: {data.signature}</p>
            <p className="font-mono mt-1">ID: {data.verification_id}</p>
          </div>
          <QRCode
            value={`${window.location.origin}/verify/${data.verification_id}`}
            size={48}
          />
        </div>
      </div>
    </div>
  );

  // Correct switching logic
  if (layout_style === "receipt") return renderReceipt();
  if (layout_style === "modern") return renderModern();
  return renderClassic();
};

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

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    setSelectedTemplate(
      templates.find((t) => String(t.id) === String(templateId))
    );
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
                <div className="relative">
                  <LayoutTemplate
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm appearance-none"
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                    required
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} {t.is_public ? "(System)" : ""}
                      </option>
                    ))}
                  </select>
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
                <CertificatePreview
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
            <CertificatePreview
              template={selectedTemplate}
              formData={previewData[0]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BulkCreateCertificatesPage;
