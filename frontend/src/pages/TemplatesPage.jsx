import React, { useState, useEffect } from "react";
import { getTemplates, createTemplate } from "../api";

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    logo: null,
    background: null,
    primary_color: "#2563EB",
    font_family: "Georgia",
  });
  const [previewData, setPreviewData] = useState({
    title: "",
    logo_url: null,
    background_url: null,
    primary_color: "#2563EB",
    font_family: "Georgia",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fontOptions = [
    "Georgia",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Roboto",
    "Lato",
    "Open Sans",
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getTemplates();
        setTemplates(response.data);
      } catch (err) {
        setError("Could not fetch templates.");
      }
    };
    fetchTemplates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setPreviewData({ ...previewData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setFormData({ ...formData, [name]: file });
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewData({ ...previewData, [`${name}_url`]: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    if (formData.logo) data.append("logo", formData.logo);
    if (formData.background) data.append("background", formData.background);
    data.append("primary_color", formData.primary_color);
    data.append("font_family", formData.font_family);

    try {
      await createTemplate(data);
      setSuccess("Template created successfully!");
      setFormData({
        title: "",
        logo: null,
        background: null,
        primary_color: "#2563EB",
        font_family: "Georgia",
      });
      setPreviewData({
        title: "",
        logo_url: null,
        background_url: null,
        primary_color: "#2563EB",
        font_family: "Georgia",
      });
      e.target.reset();
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (err) {
      setError("Failed to create template. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const TemplatePreview = () => (
    <div
      className="template-preview bg-white shadow-lg rounded-xl p-8 flex flex-col justify-between"
      style={{
        background: previewData.background_url
          ? `url(${previewData.background_url}) no-repeat center/cover`
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "300px",
        fontFamily: previewData.font_family,
      }}
    >
      {previewData.logo_url && (
        <img
          src={previewData.logo_url}
          alt="Logo"
          className="w-20 h-20 mx-auto rounded opacity-90 mb-4"
        />
      )}
      <div className="text-center">
        <h3
          className="font-bold text-2xl"
          style={{ color: previewData.primary_color }}
        >
          {previewData.title || "Template Preview"}
        </h3>
        <p className="text-gray-600">Sample Certificate Content</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Manage Your Templates
      </h2>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h4 className="text-xl font-bold text-gray-900 mb-6">
            Create New Template
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Professional Certificate"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo (Optional)
              </label>
              <input
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Background Image (Optional)
              </label>
              <input
                type="file"
                name="background"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <input
                type="color"
                name="primary_color"
                value={formData.primary_color}
                onChange={handleInputChange}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Font Family
              </label>
              <select
                name="font_family"
                value={formData.font_family}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md py-2 hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
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
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h4 className="text-xl font-bold text-gray-900 mb-6">Preview</h4>
          <TemplatePreview />
        </div>
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-6">Your Templates</h4>
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              {template.background_url ? (
                <img
                  src={`http://127.0.0.1:5000${template.background_url}`}
                  alt="Background"
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-300" />
              )}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  {template.logo_url && (
                    <img
                      src={`http://127.0.0.1:5000${template.logo_url}`}
                      alt="Logo"
                      className="w-10 h-10 rounded mr-3"
                    />
                  )}
                  <h5 className="font-bold text-gray-900">{template.title}</h5>
                </div>
                <p
                  style={{
                    color: template.primary_color,
                    fontFamily: template.font_family,
                  }}
                >
                  Sample Text
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You haven't created any templates yet.</p>
      )}
    </div>
  );
}

export default TemplatesPage;
