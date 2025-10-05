import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTemplates, createTemplate, updateTemplate } from "../api";
import {
  CheckCircle,
  Info,
  Edit2,
  Expand,
  X,
  Brush,
  Copy,
  Check,
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
    transform: isFullscreen ? "scale(1)" : "scale(0.95)",
    transition: "transform 0.3s ease",
  };

  if (layout_style === "classic") {
    return (
      <div style={containerStyle}>
        <div
          className="h-full w-full bg-white relative flex flex-col shadow-2xl"
          style={{ border: `8px double ${primary_color}`, ...backgroundStyle }}
        >
          <div
            style={{
              height: "12px",
              borderBottom: `4px solid ${primary_color}`,
              background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
            }}
          ></div>
          <div className="flex-grow flex flex-col justify-center items-center text-center p-8 overflow-hidden">
            {logo_url && (
              <img
                src={logo_url}
                alt="Logo"
                className="mb-4"
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "contain",
                }}
              />
            )}
            <h1
              className="font-bold uppercase tracking-wider"
              style={{ fontSize: "2.5rem", color: primary_color }}
            >
              {certificateTitle}
            </h1>
            <p
              className="italic my-2"
              style={{ fontSize: "1.2rem", color: "#4B5EAA" }}
            >
              This is to certify that
            </p>
            <h2
              className="font-extrabold my-2"
              style={{
                fontSize: "3rem",
                fontFamily: "'Georgia', serif",
                ...textStyle,
              }}
            >
              Recipient Name
            </h2>
            <p
              className="italic my-2"
              style={{ fontSize: "1.2rem", color: "#4B5EAA" }}
            >
              {certificateBody}
            </p>
            <p
              className="font-bold uppercase my-3"
              style={{ fontSize: "1.8rem", color: secondary_color }}
            >
              Course Title
            </p>
            <div className="flex justify-around w-full mt-auto pt-4">
              <div className="text-center">
                <p
                  className="font-semibold"
                  style={{ ...textStyle, fontSize: "1.1rem" }}
                >
                  MM/DD/YYYY
                </p>
                <hr
                  className="w-3/5 mx-auto my-1"
                  style={{ borderColor: primary_color }}
                />
                <span className="text-gray-500 text-sm">Date</span>
              </div>
              <div className="text-center">
                <p
                  className="font-semibold"
                  style={{ ...textStyle, fontSize: "1.1rem" }}
                >
                  Signature
                </p>
                <hr
                  className="w-3/5 mx-auto my-1"
                  style={{ borderColor: primary_color }}
                />
                <span className="text-gray-500 text-sm">Signature</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-white p-1 rounded-md shadow-md">
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  background: "#f0f0f0",
                  display: "grid",
                  placeContent: "center",
                  color: "#aaa",
                  fontSize: "0.8rem",
                }}
              >
                QR Code
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layout_style === "modern") {
    return (
      <div style={containerStyle}>
        <div
          className="flex h-full w-full bg-white text-black border-4 shadow-2xl"
          style={{ borderColor: primary_color, ...backgroundStyle }}
        >
          <div
            className="w-[35%] p-8 flex flex-col justify-between items-center"
            style={{
              background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
            }}
          >
            <div className="text-center">
              {logo_url && (
                <img
                  src={logo_url}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-lg"
                  alt="Logo Preview"
                />
              )}
              <p className="font-bold text-center mt-3 text-lg uppercase tracking-wider text-white">
                Issuer Name
              </p>
            </div>
            <div className="bg-white p-1 rounded-lg shadow-md">
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  background: "#f0f0f0",
                  display: "grid",
                  placeContent: "center",
                  color: "#aaa",
                  fontSize: "0.8rem",
                }}
              >
                QR Code
              </div>
            </div>
          </div>
          <div className="w-[65%] p-10 flex flex-col justify-center bg-white bg-opacity-80">
            <h1
              className="text-2xl font-light uppercase tracking-[0.15em]"
              style={{ color: primary_color }}
            >
              {certificateTitle}
            </h1>
            <h2 className="text-5xl font-extrabold my-3" style={textStyle}>
              Recipient Name
            </h2>
            <p className="text-lg italic" style={{ color: body_font_color }}>
              {certificateBody}
            </p>
            <p
              className="text-2xl font-semibold mt-2 uppercase tracking-wider"
              style={{ color: secondary_color }}
            >
              Course Title
            </p>
            <div
              className="flex justify-between mt-auto pt-4 text-base"
              style={{ borderTop: `2px solid ${primary_color}` }}
            >
              <div style={textStyle}>
                <p>Date: MM/DD/YYYY</p>
                <p>Signature: Signature</p>
              </div>
              <p style={textStyle}>ID: pending</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      style={containerStyle}
      className="flex items-center justify-center bg-gray-100 border rounded-lg"
    >
      <p className="text-gray-500">Invalid layout selected.</p>
    </div>
  );
};

const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1 text-sm">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);
const FormSelect = ({ label, options, ...props }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1 text-sm">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
    <label className="block text-gray-700 font-medium mb-1 text-sm">
      {label}
    </label>
    <input
      type="color"
      {...props}
      className="w-full h-10 p-1 border rounded-md"
    />
  </div>
);
const FormFileInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1 text-sm">
      {label}
    </label>
    <input
      type="file"
      {...props}
      accept="image/*"
      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
    />
  </div>
);

const TemplateCard = ({ template, onEditClick }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(template.id);
    setIsCopied(true);
    toast.success(`Template ID ${template.id} copied!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      key={template.id}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all relative"
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        {template.layout_style === "visual" && (
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            VISUAL
          </span>
        )}
        {template.is_public && (
          <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            SYSTEM
          </span>
        )}
      </div>
      <div
        className="w-full h-32"
        style={{
          backgroundColor: template.primary_color,
          backgroundImage: template.background_url
            ? `url(${SERVER_BASE_URL}${template.background_url})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            {template.logo_url && (
              <img
                src={`${SERVER_BASE_URL}${template.logo_url}`}
                alt="Logo"
                className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-100 flex-shrink-0"
              />
            )}
            <div className="flex-grow overflow-hidden">
              <h5 className="font-bold text-gray-900 truncate">
                {template.title}
              </h5>
              <p className="text-sm text-gray-500 capitalize">
                {template.layout_style}
              </p>
            </div>
          </div>
          {!template.is_public && (
            <Link
              to={
                template.layout_style === "visual"
                  ? `/dashboard/editor/${template.id}`
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
              className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 ml-2"
            >
              <Edit2 size={20} />
            </Link>
          )}
        </div>
        <div className="mt-4 bg-gray-50 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600">
            Template ID:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded">
              {template.id}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
              title="Copy ID"
            >
              {isCopied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
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

  const fontOptions = [
    "Georgia",
    "Lato",
    "Roboto",
    "Arial",
    "Verdana",
    "Times New Roman",
  ];
  const layoutOptions = ["classic", "modern"];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      toast.error("Could not fetch templates. You may need to log in again.");
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
        const response = await createTemplate(data);
        fetchTemplates();
        e.target.reset();
        setFormData({
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
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
    toast.promise(promise, {
      loading: "Creating template...",
      success: "Template created!",
      error: (err) => err.response?.data?.msg || "Failed.",
    });
  };

  const handleEditClick = (template) => {
    setEditFormData({
      ...template,
      logo: null,
      background: null,
      custom_title: template.custom_text?.title || "Certificate of Completion",
      custom_body:
        template.custom_text?.body || "has successfully completed the course",
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
        const response = await updateTemplate(editFormData.id, data);
        setShowEditModal(false);
        fetchTemplates();
        resolve(response);
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

  const currentFormState = showEditModal ? editFormData : formData;

  return (
    <div className="max-w-screen-2xl mx-auto">
      <Toaster position="top-center" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Manage Templates</h2>
        <Link to="/dashboard/editor">
          {/* <Button
            variant="primary"
            className="flex items-center w-full sm:w-auto justify-center"
          >
            <Brush size={18} className="me-2" />
            Create with Visual Editor
          </Button> */}
        </Link>
        <Link
          to="/dashboard/upload-template"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Brush size={18} />
          Upload Your Own Template
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h4 className="text-xl font-bold text-gray-900 mb-6">
              Create Form-Based Template
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Template Name"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Certificate Title Text"
                name="custom_title"
                value={formData.custom_title}
                onChange={handleInputChange}
              />
              <FormInput
                label="Certificate Body Text"
                name="custom_body"
                value={formData.custom_body}
                onChange={handleInputChange}
              />
              <FormSelect
                label="Layout Style"
                name="layout_style"
                value={formData.layout_style}
                onChange={handleInputChange}
                options={layoutOptions}
              />
              <FormSelect
                label="Font Family"
                name="font_family"
                value={formData.font_family}
                onChange={handleInputChange}
                options={fontOptions}
              />
              <div className="grid grid-cols-3 gap-3">
                <FormColorInput
                  label="Primary"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleInputChange}
                />
                <FormColorInput
                  label="Secondary"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleInputChange}
                />
                <FormColorInput
                  label="Font"
                  name="body_font_color"
                  value={formData.body_font_color}
                  onChange={handleInputChange}
                />
              </div>
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
              <button
                type="submit"
                className="w-full bg-green-600 text-white rounded-md py-3 font-semibold hover:bg-green-700 transition-colors"
              >
                Create Template
              </button>
            </form>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-gray-100 p-6 rounded-xl shadow-inner sticky top-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-gray-800">Live Preview</h4>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-200"
              >
                <Expand size={20} />
              </button>
            </div>
            <div className="w-full flex justify-center items-center">
              <TemplatePreview previewData={previewData} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <h4 className="text-2xl font-bold text-gray-900 mb-6">
          Your Templates
        </h4>
        {loading ? (
          <div className="text-center">
            <Spinner />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onEditClick={handleEditClick}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            You haven't created any templates yet.
          </p>
        )}
      </div>
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Form-Based Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            id="edit-template-form"
            onSubmit={handleEditSubmit}
            className="space-y-4"
          >
            <FormInput
              label="Template Name"
              name="title"
              value={currentFormState?.title || ""}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Certificate Title Text"
              name="custom_title"
              value={currentFormState?.custom_title || ""}
              onChange={handleInputChange}
            />
            <FormInput
              label="Certificate Body Text"
              name="custom_body"
              value={currentFormState?.custom_body || ""}
              onChange={handleInputChange}
            />
            <FormSelect
              label="Layout Style"
              name="layout_style"
              value={currentFormState?.layout_style || "classic"}
              onChange={handleInputChange}
              options={layoutOptions}
            />
            <FormSelect
              label="Font Family"
              name="font_family"
              value={currentFormState?.font_family || "Georgia"}
              onChange={handleInputChange}
              options={fontOptions}
            />
            <div className="grid grid-cols-3 gap-3">
              <FormColorInput
                label="Primary"
                name="primary_color"
                value={currentFormState?.primary_color || "#2563EB"}
                onChange={handleInputChange}
              />
              <FormColorInput
                label="Secondary"
                name="secondary_color"
                value={currentFormState?.secondary_color || "#D1D5DB"}
                onChange={handleInputChange}
              />
              <FormColorInput
                label="Font"
                name="body_font_color"
                value={currentFormState?.body_font_color || "#111827"}
                onChange={handleInputChange}
              />
            </div>
            <FormFileInput
              label="Logo (upload to change)"
              name="logo"
              onChange={handleFileChange}
            />
            <FormFileInput
              label="Background (upload to change)"
              name="background"
              onChange={handleFileChange}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="edit-template-form">
            Update Template
          </Button>
        </Modal.Footer>
      </Modal>
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 md:p-8"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
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
