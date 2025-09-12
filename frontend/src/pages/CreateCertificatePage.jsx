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
import { Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";

const FormInput = ({
  name,
  label,
  placeholder,
  type = "text",
  required,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const CertificatePreview = ({ template, formData }) => {
  if (!template) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg p-8">
        <p className="text-gray-500 text-lg">
          Select a template to see a preview.
        </p>
      </div>
    );
  }

  const {
    layout_style,
    primary_color = "#0284C7",
    secondary_color = "#3B82F6",
    body_font_color = "#1F2937",
    font_family = "serif",
    background_url,
    logo_url,
    custom_text,
  } = template;

  // Use the custom text from the template, with safe fallbacks
  const certificateTitle = custom_text?.title || "Certificate of Completion";
  const certificateBody =
    custom_text?.body || "has successfully completed the course";

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
      ? `url(${SERVER_BASE_URL}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const issueDateFormatted = new Date(issue_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const renderClassic = () => (
    <div
      className="d-flex align-items-center justify-content-center h-100 w-100 position-relative"
      style={{
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      <div
        className="d-flex flex-column justify-content-between align-items-center p-5 text-center position-relative"
        style={{
          width: "95%",
          height: "90%",
          border: `1.5px solid ${primary_color}`,
          padding: "5px",
        }}
      >
        <div
          className="w-100 h-100 d-flex flex-column position-relative"
          style={{
            border: `4px solid ${primary_color}`,
            padding: "2rem",
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            {logo_url && (
              <img
                src={`${SERVER_BASE_URL}${logo_url}`}
                alt="Logo"
                className="mb-3"
                style={{
                  maxHeight: "80px",
                  maxWidth: "150px",
                }}
              />
            )}
            <h1
              className="text-uppercase fw-bold mb-0"
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: primary_color,
                letterSpacing: "0.2em",
              }}
            >
              {certificateTitle}
            </h1>
          </div>

          {/* Main Content */}
          <div className="flex-grow-1 d-flex flex-column justify-content-center">
            <p
              className="mb-3"
              style={{
                fontSize: "1.1rem",
                color: body_font_color,
              }}
            >
              This is to certify that
            </p>
            <h2
              className="fw-bold mb-3"
              style={{
                fontSize: "3.5rem",
                color: body_font_color,
                margin: "1rem 0",
              }}
            >
              {recipient_name}
            </h2>
            <p
              className="mb-4"
              style={{
                fontSize: "1.1rem",
                color: body_font_color,
              }}
            >
              {certificateBody}
            </p>
            <p
              className="fw-bold text-uppercase mt-4 mb-0"
              style={{
                fontSize: "1.5rem",
                color: secondary_color,
              }}
            >
              {course_title}
            </p>
          </div>

          {/* Footer */}
          <div
            className="d-flex justify-content-between w-80 mt-5"
            style={{
              width: "80%",
              margin: "2rem auto 0",
            }}
          >
            <div style={{ width: "45%" }}>
              <p
                className="border-top pt-2 fw-semibold mb-1 text-center"
                style={{
                  borderTop: `1.5px solid ${body_font_color}`,
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                {issueDateFormatted}
              </p>
              <p
                className="text-center small text-muted mb-0"
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                Date
              </p>
            </div>
            <div style={{ width: "45%" }}>
              <p
                className="border-top pt-2 fw-semibold mb-1 text-center"
                style={{
                  borderTop: `1.5px solid ${body_font_color}`,
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                {signature || issuer_name}
              </p>
              <p
                className="text-center small text-muted mb-0"
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                Signature
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div
            className="position-absolute"
            style={{
              bottom: "1rem",
              right: "1rem",
            }}
          >
            <QRCode
              value={`${window.location.origin}/verify/${verification_id}`}
              size={70}
              viewBox="0 0 70 70"
            />
          </div>

          {/* Verification ID */}
          <div
            className="position-absolute text-start small"
            style={{
              bottom: "1rem",
              left: "1rem",
              fontSize: "0.7rem",
              color: "#999",
            }}
          >
            <p className="mb-0">Verify at {window.location.origin}</p>
            <p className="mb-0">ID: {verification_id}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModern = () => (
    <div
      className="d-flex h-100 w-100 position-relative"
      style={{
        backgroundColor: "#111827",
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      {/* Sidebar */}
      <div
        className="d-flex flex-column justify-content-between align-items-center p-5 text-white"
        style={{
          width: "38%",
          backgroundColor: primary_color,
          padding: "3rem",
        }}
      >
        <div className="text-center">
          {logo_url && (
            <img
              src={`${SERVER_BASE_URL}${logo_url}`}
              alt="Logo"
              className="mb-4"
              style={{
                width: "130px",
                height: "130px",
                objectFit: "contain",
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            />
          )}
          <p
            className="fw-bold text-uppercase mb-0"
            style={{
              fontSize: "1.5rem",
              letterSpacing: "0.1em",
              marginTop: "1.5rem",
            }}
          >
            {issuer_name}
          </p>
        </div>
        <div
          className="bg-white p-2 rounded"
          style={{
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={100}
            viewBox="0 0 100 100"
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column justify-content-center p-5"
        style={{
          padding: "3rem 4rem",
          backgroundColor: "white",
          color: body_font_color,
        }}
      >
        <h1
          className="text-uppercase fw-light mb-3 mb-0"
          style={{
            fontSize: "1.2rem",
            letterSpacing: "0.3em",
            color: "#9ca3af",
          }}
        >
          {certificateTitle}
        </h1>
        <h2
          className="fw-bold mb-2 mb-0"
          style={{
            fontSize: "4rem",
            color: primary_color,
            margin: "0.5rem 0",
          }}
        >
          {recipient_name}
        </h2>
        <p
          className="mb-4 mb-0"
          style={{
            fontSize: "1.2rem",
            color: "#4b5563",
          }}
        >
          {certificateBody}
        </p>
        <p
          className="fw-bold mb-0"
          style={{
            fontSize: "2.2rem",
            color: secondary_color,
          }}
        >
          {course_title}
        </p>
        <div
          className="d-flex justify-content-between mt-auto pt-4"
          style={{
            marginTop: "auto",
            paddingTop: "1.5rem",
            borderTop: `2px solid ${primary_color}`,
            fontSize: "0.9rem",
            color: "#6b7280",
          }}
        >
          <div className="d-flex flex-column">
            <span className="fw-bold mb-1">Date Issued</span>
            <span>{issueDateFormatted}</span>
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold mb-1">Signature</span>
            <span>{signature || issuer_name}</span>
          </div>
          <div className="d-flex flex-column text-end">
            <span className="fw-bold mb-1">Verification ID</span>
            <span>{verification_id}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (layout_style === "classic") return renderClassic();
    return renderModern();
  };

  return <div className="h-100 w-100">{renderPreview()}</div>;
};

const CreateCertificatePage = () => {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issuer_name: "",
    issue_date: new Date().toISOString().split("T")[0],
    signature: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFullscreen, setShowFullscreen] = useState(false);
  const isEditMode = !!certId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const templatesRes = await getTemplates();
        setTemplates(templatesRes.data.templates || []);
        if (isEditMode) {
          const certRes = await getCertificate(certId);
          const cert = certRes.data;
          setFormData({
            template_id: cert.template_id,
            recipient_name: cert.recipient_name,
            recipient_email: cert.recipient_email,
            course_title: cert.course_title,
            issuer_name: cert.issuer_name,
            issue_date: cert.issue_date.split("T")[0],
            signature: cert.signature || "",
          });
        }
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId, isEditMode]);

  useEffect(() => {
    const template = templates.find(
      (t) => t.id === parseInt(formData.template_id)
    );
    setSelectedTemplate(template);
  }, [formData.template_id, templates]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTemplateChange = (e) => {
    setFormData({ ...formData, template_id: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const submitData = { ...formData };
    submitData.issue_date = new Date(submitData.issue_date)
      .toISOString()
      .split("T")[0];

    const promise = isEditMode
      ? updateCertificate(certId, submitData)
      : createCertificate(submitData);

    toast
      .promise(promise, {
        loading: isEditMode
          ? "Updating certificate..."
          : "Creating certificate...",
        success: (res) => {
          setSuccess(res.data.msg);
          if (!isEditMode) {
            navigate(`/dashboard/view/${res.data.certificate_id}`);
          }
          return res.data.msg;
        },
        error: (err) => {
          setError(err.response?.data?.msg || "Failed to save certificate");
          return err.response?.data?.msg || "Failed to save certificate";
        },
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit" : "Create"} Certificate
              </h2>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
              >
                {submitting && <Spinner size="sm" className="me-2" />}
                <span>{isEditMode ? "Update" : "Publish"}</span>
              </button>
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center">
                <Info className="w-5 h-5 me-2" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 me-2" />
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
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
                label="Recipient Name"
                placeholder="e.g., Jane Doe"
                required
                value={formData.recipient_name}
                onChange={handleChange}
              />
              <FormInput
                name="recipient_email"
                label="Recipient Email"
                placeholder="jane.doe@example.com"
                type="email"
                required
                value={formData.recipient_email}
                onChange={handleChange}
              />
              <FormInput
                name="course_title"
                label="Course / Event Title"
                placeholder="e.g., Advanced React"
                required
                value={formData.course_title}
                onChange={handleChange}
              />
              <FormInput
                name="issuer_name"
                label="Issuer Name"
                placeholder="e.g., ACME University"
                required
                value={formData.issuer_name}
                onChange={handleChange}
              />
              <FormInput
                name="issue_date"
                label="Issue Date"
                type="date"
                required
                value={formData.issue_date}
                onChange={handleChange}
              />
              <FormInput
                name="signature"
                label="Signature (e.g., Issuer's Name)"
                placeholder="e.g., Dr. John Smith"
                value={formData.signature}
                onChange={handleChange}
              />
            </form>
          </div>
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Live Preview</h3>
              {selectedTemplate && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                  onClick={() => setShowFullscreen(true)}
                >
                  <Maximize2 className="w-4 h-4 me-2" />
                  <span>Fullscreen</span>
                </button>
              )}
            </div>
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden p-4">
              <CertificatePreview
                template={selectedTemplate}
                formData={formData}
              />
            </div>
          </div>
        </div>
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
              />
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateCertificatePage;
