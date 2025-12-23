import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../api";
import {
  Edit3,
  Maximize2,
  X,
  Brush,
  Copy,
  Check,
  Trash2,
  Plus,
  LayoutTemplate,
  Eye,
} from "lucide-react";
import { SERVER_BASE_URL } from "../config";
import { Spinner, Modal, Button } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";

const TemplatePreview = ({ previewData, isFullscreen = false }) => {
  const {
    primary_color = "#0284C7",
    secondary_color = "#E2E8F0",
    body_font_color = "#1E293B",
    font_family = "Lato",
    layout_style = "modern",
    logo_url,
    background_url,
    custom_text = {
      title: "Certificate of Completion",
      body: "has successfully completed the course",
    },
  } = previewData;

  const certificateTitle = custom_text?.title || "Certificate of Completion";
  const certificateBody =
    custom_text?.body || "has successfully completed the course";

  const textStyle = { color: body_font_color };
  const backgroundStyle = {
    fontFamily: font_family,
    backgroundImage: background_url ? `url(${background_url})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const containerStyle = {
    aspectRatio: "1.414 / 1",
    width: "100%",
    transform: isFullscreen ? "scale(1)" : "scale(1)",
    transition: "transform 0.3s ease",
    position: "relative",
    overflow: "hidden",
  };

  // --- RENDER RECEIPT ---
  if (layout_style === "receipt") {
    return (
      <div style={containerStyle} className="shadow-lg bg-white p-4">
        <div
          className="h-full w-full flex flex-col p-6 border border-gray-200 bg-white"
          style={{ fontFamily: "sans-serif" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              {logo_url ? (
                <img
                  src={logo_url}
                  className="h-12 object-contain mb-2"
                  alt="Logo"
                />
              ) : (
                <h2
                  className="text-xl font-bold"
                  style={{ color: primary_color }}
                >
                  Issuer Inc.
                </h2>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              <p className="font-bold text-base text-gray-800">Issuer Name</p>
              <p>Payment Receipt</p>
              <p>MM/DD/YYYY</p>
            </div>
          </div>

          <div
            className="p-3 mb-6 rounded flex justify-between items-center"
            style={{ backgroundColor: primary_color, color: "white" }}
          >
            <span className="font-bold text-lg tracking-wider uppercase">
              PAYMENT RECEIPT
            </span>
            <span className="font-mono text-sm opacity-80">#12345678</span>
          </div>

          <div className="flex justify-between mb-6 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                Bill To
              </p>
              <p className="font-bold text-lg text-gray-800">Recipient Name</p>
              <p className="text-gray-500 text-xs">recipient@example.com</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                Status
              </p>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">
                PAID
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-2">
            <div className="flex justify-between py-2 bg-gray-50 px-3 text-xs font-bold text-gray-500 uppercase rounded-t">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between py-4 px-3 text-sm">
              <span className="font-medium text-gray-800">
                Course / Service Title
              </span>
              <span className="font-bold" style={{ color: primary_color }}>
                PAID
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-4 mb-auto">
            <div className="w-1/2 flex justify-between border-t-2 border-gray-800 pt-3">
              <span className="font-bold text-lg">Total</span>
              <span
                className="font-bold text-lg"
                style={{ color: primary_color }}
              >
                PAID
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 text-xs text-gray-400 flex justify-between items-end">
            <div>
              <p>Auth Signature: Signature</p>
              <p className="mt-1">Thank you for your business.</p>
            </div>
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-[10px]">
              QR
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER CLASSIC ---
  if (layout_style === "classic") {
    return (
      <div style={containerStyle} className="shadow-lg">
        <div
          className="h-full w-full bg-white relative flex flex-col"
          style={{ border: `8px double ${primary_color}`, ...backgroundStyle }}
        >
          <div
            style={{
              height: "12px",
              borderBottom: `4px solid ${primary_color}`,
              background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
            }}
          ></div>
          <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
            {logo_url && (
              <img
                src={logo_url}
                alt="Logo"
                className="mb-4 object-contain"
                style={{ width: "80px", height: "80px" }}
              />
            )}
            <h1
              className="font-bold uppercase tracking-wider leading-tight mb-2"
              style={{
                fontSize: isFullscreen ? "2.5rem" : "1.5rem",
                color: primary_color,
              }}
            >
              {certificateTitle}
            </h1>
            <p
              className="italic my-1"
              style={{
                fontSize: isFullscreen ? "1.2rem" : "0.8rem",
                color: "#4B5EAA",
              }}
            >
              This is to certify that
            </p>
            <h2
              className="font-extrabold my-2"
              style={{
                fontSize: isFullscreen ? "3rem" : "1.8rem",
                fontFamily: "'Georgia', serif",
                ...textStyle,
              }}
            >
              Recipient Name
            </h2>
            <p
              className="italic my-2"
              style={{
                fontSize: isFullscreen ? "1.2rem" : "0.8rem",
                color: "#4B5EAA",
              }}
            >
              {certificateBody}
            </p>
            <p
              className="font-bold uppercase my-3"
              style={{
                fontSize: isFullscreen ? "1.8rem" : "1rem",
                color: secondary_color,
              }}
            >
              Course Title
            </p>
            <div className="flex justify-around w-full mt-auto pt-4">
              <div className="text-center w-1/3">
                <p
                  className="font-semibold border-b border-gray-400 pb-1 mb-1"
                  style={textStyle}
                >
                  MM/DD/YYYY
                </p>
                <span className="text-gray-500 text-xs">Date</span>
              </div>
              <div className="text-center w-1/3">
                <p
                  className="font-semibold border-b border-gray-400 pb-1 mb-1"
                  style={textStyle}
                >
                  Signature
                </p>
                <span className="text-gray-500 text-xs">Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MODERN ---
  return (
    <div style={containerStyle} className="shadow-lg">
      <div
        className="flex h-full w-full bg-white text-black border-4"
        style={{ borderColor: primary_color, ...backgroundStyle }}
      >
        <div
          className="w-[35%] p-4 flex flex-col justify-between items-center text-center"
          style={{
            background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
          }}
        >
          <div>
            {logo_url && (
              <img
                src={logo_url}
                className="w-20 h-20 rounded-full border-4 border-white object-cover bg-white shadow-sm mb-2"
                alt="Logo"
              />
            )}
            <p className="font-bold text-white text-xs uppercase tracking-wider">
              Issuer Name
            </p>
          </div>
          <div className="bg-white/90 p-2 rounded shadow-sm">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
              QR
            </div>
          </div>
        </div>
        <div className="w-[65%] p-6 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
          <h1
            className="font-light uppercase tracking-widest mb-4"
            style={{
              fontSize: isFullscreen ? "1.5rem" : "1rem",
              color: primary_color,
            }}
          >
            {certificateTitle}
          </h1>
          <h2
            className="font-extrabold mb-3"
            style={{
              fontSize: isFullscreen ? "2.5rem" : "1.6rem",
              ...textStyle,
            }}
          >
            Recipient Name
          </h2>
          <p className="italic mb-4 text-sm" style={{ color: body_font_color }}>
            {certificateBody}
          </p>
          <p
            className="font-bold uppercase tracking-wide mb-6"
            style={{
              fontSize: isFullscreen ? "1.2rem" : "0.9rem",
              color: secondary_color,
            }}
          >
            Course Title
          </p>
          <div
            className="flex justify-between mt-auto pt-3 border-t-2"
            style={{ borderColor: primary_color }}
          >
            <div className="text-xs" style={textStyle}>
              <p className="font-bold">Date: MM/DD/YYYY</p>
              <p className="text-gray-500">Authorized Signature</p>
            </div>
            <div className="text-xs text-right" style={textStyle}>
              <p className="font-bold">ID: PENDING</p>
              <p className="text-gray-500">Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Form Components ---
const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
    />
  </div>
);

const FormSelect = ({ label, options, ...props }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

const FormColorInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
      <input
        type="color"
        {...props}
        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
      />
      <span className="text-xs font-mono text-gray-600 flex-grow">
        {props.value}
      </span>
    </div>
  </div>
);

const FormFileInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
      {label}
    </label>
    <input
      type="file"
      {...props}
      accept="image/*"
      className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-semibold
        file:bg-indigo-50 file:text-indigo-700
        hover:file:bg-indigo-100 cursor-pointer"
    />
  </div>
);

const TemplateCard = ({ template, onEditClick, onDeleteClick }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(template.id);
    setIsCopied(true);
    toast.success(`ID Copied`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[1.414/1] bg-gray-100 border-b border-gray-100 overflow-hidden">
        <div
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          style={{
            backgroundColor: template.primary_color,
            backgroundImage: template.background_url
              ? `url(${SERVER_BASE_URL}${template.background_url})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {template.is_public && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              SYSTEM
            </span>
          )}
          {template.layout_style === "visual" && (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              VISUAL
            </span>
          )}
          {template.layout_style === "receipt" && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              RECEIPT
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="font-bold text-gray-900 line-clamp-1 text-lg"
            title={template.title}
          >
            {template.title}
          </h3>
          {!template.is_public && (
            <div className="flex gap-1 -mr-2">
              <Link
                to={
                  template.layout_style === "visual"
                    ? `/dashboard/upload-template/${template.id}`
                    : "#"
                }
                onClick={
                  template.layout_style !== "visual"
                    ? (e) => {
                        e.preventDefault();
                        onEditClick(template);
                      }
                    : undefined
                }
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <Edit3 size={16} />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteClick(template);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
            ID: {template.id}
          </span>
          <button
            onClick={handleCopyId}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            title="Copy ID"
          >
            {isCopied ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    logo: null,
    background: null,
    primary_color: "#2563EB",
    secondary_color: "#D1D5DB",
    body_font_color: "#111827",
    font_family: "Georgia",
    layout_style: "classic",
    custom_title: "Certificate of Completion",
    custom_body: "has successfully completed the course",
  });
  const [previewData, setPreviewData] = useState({
    logo_url: null,
    background_url: null,
    primary_color: "#2563EB",
    secondary_color: "#D1D5DB",
    body_font_color: "#111827",
    font_family: "Georgia",
    layout_style: "classic",
    custom_text: {
      title: "Certificate of Completion",
      body: "has successfully completed the course",
    },
  });
  const [editFormData, setEditFormData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const fontOptions = [
    "Georgia",
    "Lato",
    "Roboto",
    "Arial",
    "Verdana",
    "Times New Roman",
  ];
  const layoutOptions = ["classic", "modern", "receipt"]; // Updated options

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      toast.error("Could not fetch templates.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const stateSetter = showEditModal ? setEditFormData : setFormData;
    stateSetter((prev) => ({ ...prev, [name]: value }));

    const targetPreview = showEditModal ? editFormData : formData;
    if (name === "custom_title" || name === "custom_body") {
      setPreviewData((prev) => ({
        ...prev,
        ...targetPreview,
        [name]: value,
        custom_text: {
          ...prev.custom_text,
          [name === "custom_title" ? "title" : "body"]: value,
        },
      }));
    } else {
      setPreviewData((prev) => ({ ...prev, ...targetPreview, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      const stateSetter = showEditModal ? setEditFormData : setFormData;
      stateSetter((prev) => ({ ...prev, [name]: file }));
      setPreviewData((prev) => ({
        ...prev,
        [`${name}_url`]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const promise = new Promise(async (resolve, reject) => {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });
      try {
        await createTemplate(data);
        fetchTemplates();
        e.target.reset();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    toast.promise(promise, {
      loading: "Creating...",
      success: "Template created successfully!",
      error: (err) => err.response?.data?.msg || "Failed to create.",
    });
  };

  const handleEditClick = (template) => {
    setEditFormData({
      ...template,
      logo: null,
      background: null,
      custom_title: template.custom_text?.title,
      custom_body: template.custom_text?.body,
    });
    setPreviewData({
      ...template,
      logo_url: template.logo_url
        ? `${SERVER_BASE_URL}${template.logo_url}`
        : null,
      background_url: template.background_url
        ? `${SERVER_BASE_URL}${template.background_url}`
        : null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const promise = new Promise(async (resolve, reject) => {
      const data = new FormData();
      Object.keys(editFormData).forEach((key) => {
        if (
          key !== "logo_url" &&
          key !== "background_url" &&
          editFormData[key]
        ) {
          data.append(key, editFormData[key]);
        }
      });
      try {
        await updateTemplate(editFormData.id, data);
        setShowEditModal(false);
        fetchTemplates();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    toast.promise(promise, {
      loading: "Updating...",
      success: "Template updated!",
      error: (err) => err.response?.data?.msg || "Failed.",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    const promise = deleteTemplate(templateToDelete.id);
    toast.promise(promise, {
      loading: "Deleting...",
      success: () => {
        setShowDeleteModal(false);
        setTemplateToDelete(null);
        fetchTemplates();
        return "Template deleted!";
      },
      error: (err) => {
        setShowDeleteModal(false);
        return err.response?.data?.msg || "Failed.";
      },
    });
  };

  const currentFormState = showEditModal ? editFormData : formData;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
          <p className="text-gray-500 mt-1">
            Design and manage your certificate layouts.
          </p>
        </div>
        <Link
          to="/dashboard/upload-template"
          className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-lg py-2.5 px-5 hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <Brush size={18} className="mr-2" />
          Open Visual Editor
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Creator Form */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <LayoutTemplate size={20} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Standard Creator
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                label="Template Name"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Monthly Award"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Layout"
                  name="layout_style"
                  value={formData.layout_style}
                  onChange={handleInputChange}
                  options={layoutOptions}
                />
                <FormSelect
                  label="Font"
                  name="font_family"
                  value={formData.font_family}
                  onChange={handleInputChange}
                  options={fontOptions}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-gray-700 font-semibold text-sm">
                  Colors
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <FormColorInput
                    label="Primary"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Accent"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Text"
                    name="body_font_color"
                    value={formData.body_font_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <FormInput
                  label="Heading"
                  name="custom_title"
                  value={formData.custom_title}
                  onChange={handleInputChange}
                  placeholder="Certificate of..."
                />
                <FormInput
                  label="Body Text"
                  name="custom_body"
                  value={formData.custom_body}
                  onChange={handleInputChange}
                  placeholder="has successfully..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <FormFileInput
                  label="Logo"
                  name="logo"
                  onChange={handleFileChange}
                />
                <FormFileInput
                  label="Background"
                  name="background"
                  onChange={handleFileChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold hover:bg-black transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create Template
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview - Sticky */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <Eye size={18} />
                <h4>Live Preview</h4>
              </div>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm"
              >
                <Maximize2 size={18} />
              </button>
            </div>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-2xl bg-white shadow-xl rounded overflow-hidden">
                <TemplatePreview previewData={previewData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
          Your Library
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner animation="border" />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onEditClick={handleEditClick}
                onDeleteClick={(template) => {
                  setTemplateToDelete(template);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No templates found. Create one above!
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-bold">Edit Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-6">
          <form
            id="edit-form"
            onSubmit={handleEditSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormInput
                  label="Name"
                  name="title"
                  value={currentFormState?.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Layout"
                    name="layout_style"
                    value={currentFormState?.layout_style}
                    onChange={handleInputChange}
                    options={layoutOptions}
                  />
                  <FormSelect
                    label="Font"
                    name="font_family"
                    value={currentFormState?.font_family}
                    onChange={handleInputChange}
                    options={fontOptions}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FormColorInput
                    label="Primary"
                    name="primary_color"
                    value={currentFormState?.primary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Accent"
                    name="secondary_color"
                    value={currentFormState?.secondary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Text"
                    name="body_font_color"
                    value={currentFormState?.body_font_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <FormInput
                  label="Heading"
                  name="custom_title"
                  value={currentFormState?.custom_title}
                  onChange={handleInputChange}
                />
                <FormInput
                  label="Body"
                  name="custom_body"
                  value={currentFormState?.custom_body}
                  onChange={handleInputChange}
                />
                <FormFileInput
                  label="New Logo"
                  name="logo"
                  onChange={handleFileChange}
                />
                <FormFileInput
                  label="New Background"
                  name="background"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="edit-form">
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-red-600 font-bold">
            Delete Template?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{templateToDelete?.title}</strong>?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Forever
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Fullscreen Preview */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors">
            <X size={32} />
          </button>
          <div
            className="w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TemplatePreview previewData={previewData} isFullscreen={true} />
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatesPage;
