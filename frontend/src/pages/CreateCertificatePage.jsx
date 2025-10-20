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
import KonvaPreview from "../components/KonvaPreview";

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

  if (template.layout_style === "visual") {
    return (
      <KonvaPreview layoutData={template.layout_data} dynamicData={formData} />
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
      className="h-100 w-100 bg-white relative flex flex-column shadow-2xl rounded-xl overflow-hidden"
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
      <div className="flex-grow flex flex-column justify-content-center align-items-center text-center p-4">
        {logo_url && (
          <img
            src={`${SERVER_BASE_URL}${logo_url}`}
            alt="Logo"
            className="mb-3"
            style={{ width: "140px", height: "140px", objectFit: "contain" }}
          />
        )}
        <h1
          className="font-bold uppercase tracking-wider"
          style={{ fontSize: "2.5rem", color: primary_color }}
        >
          {certificateTitle}
        </h1>
        <p
          className="italic my-1"
          style={{ fontSize: "1.1rem", color: "#4B5EAA" }}
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
          {recipient_name}
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
          {course_title}
        </p>
        <p
          className="my-2"
          style={{ fontSize: "1.2rem", color: body_font_color }}
        >
          Awarded on {issueDateFormatted}
        </p>
        <div className="flex justify-content-around w-full mt-auto pt-4">
          <div className="text-center" style={{ width: "45%" }}>
            <p
              className="font-semibold"
              style={{ ...textStyle, fontSize: "1rem" }}
            >
              {signature || issuer_name}
            </p>
            <hr
              className="w-3/5 mx-auto my-1"
              style={{ borderColor: body_font_color }}
            />
            <span className="text-gray-500 text-sm">Authorized Signature</span>
          </div>
          <div className="text-center" style={{ width: "45%" }}>
            <p
              className="font-semibold"
              style={{ ...textStyle, fontSize: "1rem" }}
            >
              {issuer_name}
            </p>
            <hr
              className="w-3/5 mx-auto my-1"
              style={{ borderColor: body_font_color }}
            />
            <span className="text-gray-500 text-sm">Issuer</span>
          </div>
        </div>
        <div className="absolute bottom-4 end-4 bg-white p-1 rounded-md shadow-md">
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={80}
            style={{ height: "auto", maxWidth: "80px" }}
          />
          <p className="text-gray-500 text-center text-sm mt-1">
            {verification_id}
          </p>
        </div>
      </div>
    </div>
  );

  const renderModern = () => (
    <div
      className="flex h-100 w-100 shadow-lg rounded-xl overflow-hidden text-white"
      style={{
        border: `6px solid ${primary_color}`,
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      <div
        className="flex flex-column justify-content-between align-items-center p-4"
        style={{
          width: "35%",
          background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
        }}
      >
        <div className="text-center">
          {logo_url && (
            <img
              src={`${SERVER_BASE_URL}${logo_url}`}
              className="rounded-circle border-4 border-white shadow mb-2"
              style={{ width: "6rem", height: "6rem", objectFit: "cover" }}
              alt="Logo"
            />
          )}
          <p
            className="font-bold uppercase small"
            style={{ letterSpacing: "0.1em" }}
          >
            {issuer_name}
          </p>
        </div>
        <div className="bg-white p-1 rounded shadow">
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={72}
            viewBox="0 0 72 72"
          />
          <p className="text-center text-dark small font-bold mt-1">
            {verification_id}
          </p>
        </div>
      </div>
      <div className="flex-grow p-4 flex flex-column justify-content-center relative bg-white bg-opacity-90">
        <h1
          className="font-light uppercase mb-3"
          style={{
            fontSize: "1.5rem",
            letterSpacing: "0.15em",
            color: primary_color,
          }}
        >
          {certificateTitle}
        </h1>
        <h2
          className="font-bolder mb-2"
          style={{
            fontSize: "2.8rem",
            fontFamily: "'Georgia', serif",
            ...textStyle,
          }}
        >
          {recipient_name}
        </h2>
        <p
          className="italic mb-2"
          style={{ fontSize: "1.1rem", color: "#666" }}
        >
          {certificateBody}
        </p>
        <p
          className="font-bold uppercase mb-4"
          style={{
            fontSize: "1.4rem",
            letterSpacing: "0.05em",
            color: secondary_color,
          }}
        >
          {course_title}
        </p>
        <p style={{ ...textStyle, fontSize: "1rem" }}>
          Awarded on {issueDateFormatted}
        </p>
        <div
          className="d-flex justify-content-between mt-auto pt-3 border-top"
          style={{ borderColor: primary_color, fontSize: "0.9rem" }}
        >
          <div>
            <p
              className="font-semibold"
              style={{ ...textStyle, fontSize: "1.2rem" }}
            >
              {signature || issuer_name}
            </p>
            <p className="text-gray-500">Authorized Signature</p>
          </div>
          <div>
            <p
              className="font-semibold"
              style={{ ...textStyle, fontSize: "1.2rem" }}
            >
              {issuer_name}
            </p>
            <p className="text-gray-500">Issuer</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="w-100 h-100 position-relative"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      {layout_style === "classic" ? renderClassic() : renderModern()}
    </div>
  );
};

const CreateCertificatePage = () => {
  const { certId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!certId;
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issuer_name: "",
    issue_date: new Date().toLocaleDateString("en-CA"),
    signature: "",
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templateResponse = await getTemplates();
        setTemplates(templateResponse.data.templates);
        if (isEditMode) {
          const certResponse = await getCertificate(certId);
          const cert = certResponse.data.certificate;
          setFormData({
            template_id: certResponse.data.template.id,
            recipient_name: cert.recipient_name,
            recipient_email: cert.recipient_email,
            course_title: cert.course_title,
            issuer_name: cert.issuer_name,
            issue_date: new Date(cert.issue_date).toLocaleDateString("en-CA"),
            signature: cert.signature,
          });
          setSelectedTemplate(certResponse.data.template);
        }
      } catch (err) {
        setError(
          err.response?.data?.msg || "Could not fetch data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setFormData({ ...formData, template_id: templateId });
    const template = templates.find((t) => String(t.id) === String(templateId));
    setSelectedTemplate(template || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      let response;
      if (isEditMode) {
        response = await updateCertificate(certId, formData);
      } else {
        response = await createCertificate(formData);
      }
      setSuccess(response.data.msg);
      toast.success(response.data.msg);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg || "An error occurred. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-gray-50">
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
                  <option value="">Choose a template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}{" "}
                      {t.is_public
                        ? "(System)"
                        : t.layout_style === "visual"
                        ? "(Visual)"
                        : ""}
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
              {/* --- THIS IS THE FIX --- */}
              <FormInput
                name="recipient_email"
                label="Recipient Email (Optional)"
                placeholder="jane.doe@example.com"
                type="email"
                value={formData.recipient_email}
                onChange={handleChange}
              />
              {/* --- END OF FIX --- */}
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
                label="Signature (Optional)"
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
            <div className="w-full h-auto aspect-[1.414/1] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden p-4">
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
