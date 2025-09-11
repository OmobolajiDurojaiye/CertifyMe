// CreateCertificatePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTemplates,
  createCertificate,
  getCertificate,
  updateCertificate,
} from "../api";
import QRCode from "react-qr-code";
import { SERVER_BASE_URL } from "../config";
import { Calendar, CheckCircle, Info, Maximize2, X } from "lucide-react";

const CertificatePreview = ({ template, formData, onFullscreen }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg p-8">
        <p className="text-gray-500 text-lg">
          No templates available. Please create a template first.
        </p>
      </div>
    );
  }

  const serverUrl = SERVER_BASE_URL;
  const {
    layout_style,
    primary_color = "#0284C7",
    secondary_color = "#3B82F6",
    body_font_color = "#1F2937",
    font_family = "serif",
    background_url,
    logo_url,
  } = template;
  const {
    recipient_name = "Recipient Name",
    course_title = "Course Title",
    issue_date = new Date().toLocaleDateString("en-CA"),
    signature = "Signature",
    issuer_name = "Issuer Name",
    verification_id = "pending",
  } = formData;

  const textStyle = { color: body_font_color, fontFamily: font_family };
  const backgroundStyle = {
    backgroundImage: background_url
      ? `url(${serverUrl}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const containerClass = isFullscreen
    ? "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    : "relative shadow-2xl rounded-xl overflow-hidden";

  const handleFullscreenToggle = () => {
    if (onFullscreen) onFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  const PreviewContent = () => (
    <div
      className={containerClass}
      style={{
        aspectRatio: "1.414 / 1",
        width: isFullscreen ? "95vw" : "100%",
        maxHeight: isFullscreen ? "95vh" : "100%",
        fontFamily: font_family,
        ...backgroundStyle,
      }}
    >
      {!isFullscreen && (
        <button
          className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
          onClick={handleFullscreenToggle}
          title="Fullscreen Preview"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      )}
      {isFullscreen && (
        <button
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg transition-all"
          onClick={handleFullscreenToggle}
          title="Exit Fullscreen"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      )}
      {layout_style === "modern" && (
        <div
          className="flex h-full w-full rounded-xl overflow-hidden shadow-2xl border-4 border-opacity-20"
          style={{ borderColor: primary_color }}
        >
          <div
            className="w-1/3 flex flex-col justify-between items-center p-6 bg-gradient-to-br"
            style={{
              background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
              borderRight: `3px solid ${secondary_color}`,
            }}
          >
            <div className="text-center space-y-2">
              {logo_url && (
                <img
                  src={`${serverUrl}${logo_url}`}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-lg"
                  alt="Logo"
                />
              )}
              <p
                className="font-bold text-white text-sm uppercase tracking-wide"
                style={{
                  letterSpacing: "0.1em",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {issuer_name}
              </p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-md">
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={72}
                viewBox="0 0 72 72"
              />
            </div>
          </div>
          <div className="w-2/3 flex flex-col justify-center p-8 relative bg-white bg-opacity-10 backdrop-blur-sm">
            <h1
              className="font-light uppercase tracking-widest mb-4"
              style={{
                fontSize: "1.4rem",
                color: primary_color,
                letterSpacing: "0.15em",
                textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              Certificate of Achievement
            </h1>
            <h2
              className="font-black mb-3 tracking-tight"
              style={{
                fontSize: "2.8rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                ...textStyle,
              }}
            >
              {recipient_name}
            </h2>
            <p
              className="text-gray-200 italic mb-3 text-lg"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
            >
              has successfully completed
            </p>
            <p
              className="font-semibold uppercase mb-6 tracking-wide"
              style={{
                fontSize: "1.3rem",
                color: secondary_color,
                letterSpacing: "0.05em",
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              {course_title}
            </p>
            <div
              className="flex justify-between items-end mt-auto pt-4 border-t-2"
              style={{
                borderColor: primary_color,
                color: "#E5E7EB",
                fontSize: "1rem",
              }}
            >
              <div className="space-y-1">
                <p className="mb-0 font-medium">Date: {issue_date}</p>
                <p className="mb-0">Signature: {signature || issuer_name}</p>
              </div>
              <p className="mb-0 font-mono text-sm opacity-90">
                ID: {verification_id}
              </p>
            </div>
          </div>
        </div>
      )}
      {layout_style === "classic" && (
        <div
          className="h-full relative bg-white shadow-inner"
          style={{
            border: `8px double ${primary_color}`,
            fontFamily: font_family,
          }}
        >
          <div
            className="h-3 bg-gradient-to-r"
            style={{
              background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
              borderBottom: `4px solid ${primary_color}`,
            }}
          />
          <div className="flex-grow flex flex-col justify-center items-center text-center p-6 space-y-4">
            {logo_url && (
              <img
                src={`${serverUrl}${logo_url}`}
                alt="Logo"
                className="rounded-lg shadow-md"
                style={{
                  width: "110px",
                  height: "110px",
                  objectFit: "contain",
                  border: `2px solid ${secondary_color}`,
                  borderRadius: "8px",
                }}
              />
            )}
            <h1
              className="font-serif font-bold text-uppercase tracking-wide"
              style={{
                fontSize: "1.8rem",
                color: primary_color,
                letterSpacing: "0.08em",
                textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              Certificate of Completion
            </h1>
            <p
              className="italic text-blue-700 text-base"
              style={{ fontSize: "1.1rem", color: "#4B5EAA" }}
            >
              This is to certify that
            </p>
            <h2
              className="font-serif font-black tracking-tight"
              style={{
                fontSize: "2.3rem",
                ...textStyle,
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {recipient_name}
            </h2>
            <p
              className="italic text-blue-700 text-base"
              style={{ fontSize: "1.1rem", color: "#4B5EAA" }}
            >
              has successfully completed the course
            </p>
            <p
              className="font-bold uppercase tracking-wide"
              style={{
                fontSize: "1.4rem",
                color: secondary_color,
                letterSpacing: "0.04em",
              }}
            >
              {course_title}
            </p>
            <div className="flex justify-around w-full mt-6 space-x-8">
              <div className="text-center min-w-0">
                <p className="font-semibold mb-2" style={textStyle}>
                  {issue_date}
                </p>
                <hr
                  className="w-full my-1"
                  style={{ borderTop: `2px dashed ${primary_color}` }}
                />
                <small className="text-gray-500 block">Date</small>
              </div>
              <div className="text-center min-w-0">
                <p className="font-semibold mb-2" style={textStyle}>
                  {signature || issuer_name}
                </p>
                <hr
                  className="w-full my-1"
                  style={{ borderTop: `2px dashed ${primary_color}` }}
                />
                <small className="text-gray-500 block">Signature</small>
              </div>
            </div>
            <div
              className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg"
              style={{ width: "75px", height: "75px" }}
            >
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={65}
                viewBox="0 0 65 65"
              />
            </div>
            <p
              className="absolute bottom-4 left-4 text-sm font-medium italic"
              style={textStyle}
            >
              Issued by: {issuer_name}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
        onClick={handleFullscreenToggle}
      >
        <div
          className="relative w-full max-w-4xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <PreviewContent />
        </div>
      </div>
    );
  }

  return <PreviewContent />;
};

const CreateCertificatePage = () => {
  const { id: certId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issuer_name: "",
    issue_date: new Date().toISOString().split("T")[0],
    signature: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTemplates();
        setTemplates(response.data);

        if (certId) {
          setIsEditMode(true);
          const certResponse = await getCertificate(certId);
          const cert = certResponse.data;
          setFormData({
            template_id: cert.template_id,
            recipient_name: cert.recipient_name,
            recipient_email: cert.recipient_email,
            course_title: cert.course_title,
            issuer_name: cert.issuer_name,
            issue_date: cert.issue_date.split("T")[0],
            signature: cert.signature || "",
          });
          const templateResponse = await getTemplates();
          const template = templateResponse.data.find(
            (t) => t.id == cert.template_id
          );
          setSelectedTemplate(template);
        }
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id == templateId);
    setSelectedTemplate(template);
    setFormData((prev) => ({ ...prev, template_id: templateId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    if (!formData.template_id) {
      setError("Please select a template.");
      setSubmitting(false);
      return;
    }
    try {
      if (isEditMode) {
        await updateCertificate(certId, formData);
        setSuccess("Certificate updated successfully!");
      } else {
        await createCertificate(formData);
        setSuccess("Certificate created successfully!");
      }
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save certificate.");
    } finally {
      setSubmitting(false);
    }
  };

  const FormInput = ({
    name,
    label,
    placeholder,
    type = "text",
    required = false,
  }) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          key={name} // Ensure stable key
          type={type}
          name={name}
          id={name}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder={placeholder}
          required={required}
          value={formData[name] || ""}
          onChange={handleChange}
        />
        {type === "date" && (
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
      </div>
      {required && <p className="text-xs text-gray-500 mt-1">Required field</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Certificate" : "Create Certificate"}
            </h2>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center space-x-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isEditMode ? "Update" : "Publish"}</span>
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center space-x-2">
              <Info className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Template
              </label>
              <select
                name="template_id"
                onChange={handleTemplateChange}
                value={formData.template_id}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.is_public && "(System)"}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              name="recipient_name"
              label="Recipient Full Name"
              placeholder="e.g., Jane Doe"
              required
            />
            <FormInput
              name="recipient_email"
              label="Recipient Email"
              placeholder="jane.doe@example.com"
              type="email"
              required
            />
            <FormInput
              name="course_title"
              label="Course / Event Title"
              placeholder="e.g., Advanced React Workshop"
              required
            />
            <FormInput
              name="issuer_name"
              label="Issuer Name (Organization or Person)"
              placeholder="e.g., ACME University"
              required
            />
            <FormInput
              name="issue_date"
              label="Issue Date"
              type="date"
              required
            />
            <FormInput
              name="signature"
              label="Signature (Optional)"
              placeholder="e.g., Dr. John Smith"
            />
          </form>
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Live Preview</h3>
            {selectedTemplate && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                onClick={() => setShowFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4" />
                <span>Fullscreen</span>
              </button>
            )}
          </div>
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
            <CertificatePreview
              template={selectedTemplate}
              formData={formData}
              onFullscreen={() => setShowFullscreen(true)}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div
            className="relative w-full max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CertificatePreview
              template={selectedTemplate}
              formData={formData}
              onFullscreen={() => setShowFullscreen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCertificatePage;
