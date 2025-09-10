import React, { useState, useEffect } from "react";
import { getTemplates, createTemplate, updateTemplate } from "../api";
import { CheckCircle, Info, Edit2, Expand, X } from "lucide-react";
import { SERVER_BASE_URL } from "../config";

// This is the enhanced preview component
const TemplatePreview = ({ previewData, isFullscreen = false }) => {
  const {
    primary_color = "#0284C7",
    secondary_color = "#E2E8F0",
    body_font_color = "#1E293B",
    font_family = "Lato",
    layout_style = "modern",
    logo_url,
    background_url,
  } = previewData;

  const textStyle = { color: body_font_color };
  const backgroundStyle = {
    fontFamily: font_family,
    backgroundImage: background_url ? `url(${background_url})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const containerStyle = {
    aspectRatio: "1.414 / 1", // A4 Landscape
    width: "100%",
    transform: isFullscreen ? "scale(1)" : "scale(0.95)",
    transition: "transform 0.3s ease",
  };

  switch (layout_style) {
    case "classic":
      return (
        <div style={containerStyle}>
          <div
            className="h-full w-full bg-white relative flex flex-col shadow-2xl"
            style={{
              border: `8px double ${primary_color}`,
              ...backgroundStyle,
            }}
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
                Certificate of Completion
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
                has successfully completed the course
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
    case "modern":
      return (
        <div style={containerStyle}>
          <div
            className="flex h-full w-full bg-gray-800 text-white border-4 shadow-2xl"
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
            <div className="w-[65%] p-10 flex flex-col justify-center">
              <h1
                className="text-2xl font-light uppercase tracking-[0.15em]"
                style={{ color: primary_color }}
              >
                Certificate of Achievement
              </h1>
              <h2 className="text-5xl font-extrabold my-3 text-white">
                Recipient Name
              </h2>
              <p className="text-gray-200 text-lg italic">
                has successfully completed
              </p>
              <p
                className="text-2xl font-semibold mt-2 uppercase tracking-wider"
                style={{ color: primary_color }}
              >
                Course Title
              </p>
              <div
                className="flex justify-between mt-auto pt-4 text-base"
                style={{ borderTop: `2px solid ${primary_color}` }}
              >
                <div className="text-gray-200">
                  <p>Date: MM/DD/YYYY</p>
                  <p>Signature: Signature</p>
                </div>
                <p className="text-gray-200">ID: pending</p>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div
          style={containerStyle}
          className="flex items-center justify-center bg-gray-100 border rounded-lg"
        >
          <p className="text-gray-500">Invalid layout selected.</p>
        </div>
      );
  }
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
  });
  const [previewData, setPreviewData] = useState({
    ...formData,
    logo_url: null,
    background_url: null,
  });
  const [editFormData, setEditFormData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
      setTemplates(
        response.data.filter((t) => layoutOptions.includes(t.layout_style))
      );
    } catch (err) {
      setError("Could not fetch templates.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const stateSetter = showEditModal ? setEditFormData : setFormData;
    stateSetter((prev) => ({ ...prev, [name]: value }));
    setPreviewData((prev) => ({ ...prev, [name]: value }));
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

  const resetForm = (e) => {
    if (e) e.target.reset();
    setFormData({
      title: "",
      logo: null,
      background: null,
      primary_color: "#2563EB",
      secondary_color: "#D1D5DB",
      body_font_color: "#111827",
      font_family: "Georgia",
      layout_style: "classic",
    });
    setPreviewData({
      title: "",
      logo_url: null,
      background_url: null,
      primary_color: "#2563EB",
      secondary_color: "#D1D5DB",
      body_font_color: "#111827",
      font_family: "Georgia",
      layout_style: "classic",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    try {
      await createTemplate(data);
      setSuccess("Template created successfully!");
      resetForm(e);
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create template.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (template) => {
    setEditFormData({ ...template, logo: null, background: null });
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
    setError("");
    setSuccess("");
    setLoading(true);
    const data = new FormData();
    Object.keys(editFormData).forEach((key) => {
      if (editFormData[key]) data.append(key, editFormData[key]);
    });
    try {
      await updateTemplate(editFormData.id, data);
      setSuccess("Template updated successfully!");
      closeModal();
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update template.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditFormData(null);
    resetForm();
  };

  const currentFormState = showEditModal ? editFormData : formData;

  return (
    <div className="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Manage Templates
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h4 className="text-xl font-bold text-gray-900 mb-6">
              Create New Template
            </h4>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md flex items-center">
                <Info className="mr-2" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex items-center">
                <CheckCircle className="mr-2" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
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
                className="w-full bg-green-600 text-white rounded-md py-3 font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Template"}
              </button>
            </form>
          </div>
        </div>

        {/* Preview Panel */}
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

      {/* Your Templates Section */}
      <div className="mt-16">
        <h4 className="text-2xl font-bold text-gray-900 mb-6">
          Your Templates
        </h4>
        {loading ? (
          <p>Loading...</p>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all relative"
              >
                {t.is_public && (
                  <span className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    SYSTEM
                  </span>
                )}
                <div
                  className="w-full h-32"
                  style={{
                    backgroundColor: t.primary_color,
                    backgroundImage: t.background_url
                      ? `url(${SERVER_BASE_URL}${t.background_url})`
                      : "none",
                    backgroundSize: "cover",
                  }}
                ></div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {t.logo_url && (
                      <img
                        src={`${SERVER_BASE_URL}${t.logo_url}`}
                        alt="Logo"
                        className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-100"
                      />
                    )}
                    <div>
                      <h5 className="font-bold text-gray-900">{t.title}</h5>
                      <p className="text-sm text-gray-500 capitalize">
                        {t.layout_style}
                      </p>
                    </div>
                  </div>
                  {!t.is_public && (
                    <button
                      onClick={() => handleEditClick(t)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            You haven't created any templates yet.
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Template
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormInput
                label="Title"
                name="title"
                value={currentFormState?.title}
                onChange={handleInputChange}
                required
              />
              <FormSelect
                label="Layout Style"
                name="layout_style"
                value={currentFormState?.layout_style}
                onChange={handleInputChange}
                options={layoutOptions}
              />
              <FormSelect
                label="Font Family"
                name="font_family"
                value={currentFormState?.font_family}
                onChange={handleInputChange}
                options={fontOptions}
              />
              <div className="grid grid-cols-3 gap-3">
                <FormColorInput
                  label="Primary"
                  name="primary_color"
                  value={currentFormState?.primary_color}
                  onChange={handleInputChange}
                />
                <FormColorInput
                  label="Secondary"
                  name="secondary_color"
                  value={currentFormState?.secondary_color}
                  onChange={handleInputChange}
                />
                <FormColorInput
                  label="Font"
                  name="body_font_color"
                  value={currentFormState?.body_font_color}
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
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 rounded-md py-2 px-4 font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded-md py-2 px-4 font-semibold hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8"
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

// Helper components for the form
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

export default TemplatesPage;
