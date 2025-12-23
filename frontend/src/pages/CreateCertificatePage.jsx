import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getTemplates,
  createCertificate,
  getCertificate,
  updateCertificate,
} from "../api";
import QRCode from "react-qr-code";
import { SERVER_BASE_URL } from "../config";
import {
  Calendar,
  Maximize2,
  X,
  ArrowLeft,
  Save,
  User,
  Type,
  FileText,
  PenTool,
  LayoutTemplate,
  Loader2,
  Info,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import KonvaPreview from "../components/KonvaPreview";

// --- REUSABLE UI COMPONENTS ---
const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        {...props}
        className={`block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm ${
          Icon ? "pl-10" : "px-3"
        }`}
      />
    </div>
  </div>
);

const FormSelect = ({ label, icon: Icon, required, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <select
        {...props}
        className={`block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm ${
          Icon ? "pl-10" : "px-3"
        }`}
      >
        {children}
      </select>
    </div>
  </div>
);

const CertificatePreview = ({ template, formData }) => {
  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <LayoutTemplate className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">
          Select a template to generate preview
        </p>
      </div>
    );
  }

  const dynamicData = { ...formData };
  if (formData.extra_fields?.amount) {
    dynamicData.amount = formData.extra_fields.amount;
  }

  if (template.layout_style === "visual") {
    return (
      <div className="shadow-lg rounded-lg overflow-hidden h-full">
        <KonvaPreview
          layoutData={template.layout_data}
          dynamicData={dynamicData}
        />
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
                {issuer_name}
              </h2>
            )}
          </div>
          <div className="text-right text-gray-500 text-xs">
            <p className="font-bold text-base text-gray-800">{issuer_name}</p>
            <p>Receipt</p>
            <p>{issueDateFormatted}</p>
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
            #{verification_id.substring(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Bill To</p>
            <p className="font-bold text-lg text-gray-800">{recipient_name}</p>
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
            <span className="font-medium text-gray-800">{course_title}</span>
            <span className="font-bold" style={{ color: primary_color }}>
              {formData.extra_fields?.amount || "PAID"}
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
              {formData.extra_fields?.amount || "PAID"}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-end">
          <div className="text-xs text-gray-400">
            <p>Auth Signature: {signature}</p>
            <p className="font-mono mt-1">ID: {verification_id}</p>
          </div>
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={48}
          />
        </div>
      </div>
    </div>
  );

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
      <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
        {logo_url && (
          <img
            src={`${SERVER_BASE_URL}${logo_url}`}
            alt="Logo"
            className="mb-4 object-contain h-24 w-24"
          />
        )}
        <h1
          className="font-bold uppercase tracking-wider text-3xl md:text-4xl mb-2"
          style={{ color: primary_color }}
        >
          {certificateTitle}
        </h1>
        <p className="italic text-lg mb-4" style={{ color: "#4B5EAA" }}>
          This is to certify that
        </p>
        <h2
          className="font-extrabold text-4xl md:text-5xl mb-4"
          style={{ fontFamily: "'Georgia', serif", ...textStyle }}
        >
          {recipient_name}
        </h2>
        <p className="italic text-xl mb-4" style={{ color: "#4B5EAA" }}>
          {certificateBody}
        </p>
        <p
          className="font-bold uppercase text-2xl md:text-3xl mb-6"
          style={{ color: secondary_color }}
        >
          {course_title}
        </p>
        <p className="text-lg mb-8" style={{ color: body_font_color }}>
          Awarded on {issueDateFormatted}
        </p>
        <div className="flex justify-between w-full max-w-2xl mt-auto pt-8 px-8">
          <div className="text-center w-40">
            <p className="font-semibold text-lg" style={textStyle}>
              {signature || issuer_name}
            </p>
            <div className="h-px w-full bg-gray-400 my-1"></div>
            <span className="text-gray-500 text-sm">Authorized Signature</span>
          </div>
          <div className="text-center w-40">
            <p className="font-semibold text-lg" style={textStyle}>
              {issuer_name}
            </p>
            <div className="h-px w-full bg-gray-400 my-1"></div>
            <span className="text-gray-500 text-sm">Issuer</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 bg-white p-1 rounded shadow-sm">
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={60}
          />
        </div>
      </div>
    </div>
  );

  const renderModern = () => (
    <div
      className="flex h-full w-full shadow-xl overflow-hidden bg-white"
      style={{
        border: `6px solid ${primary_color}`,
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      <div
        className="w-[35%] flex flex-col justify-between items-center p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
        }}
      >
        <div className="text-center">
          {logo_url && (
            <img
              src={`${SERVER_BASE_URL}${logo_url}`}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 object-cover bg-white"
              alt="Logo"
            />
          )}
          <p className="font-bold uppercase tracking-widest text-sm opacity-90">
            {issuer_name}
          </p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={80}
          />
        </div>
      </div>
      <div className="w-[65%] flex flex-col justify-center p-12 relative bg-white/95">
        <h1
          className="font-light uppercase tracking-[0.2em] text-2xl mb-6"
          style={{ color: primary_color }}
        >
          {certificateTitle}
        </h1>
        <h2
          className="font-bold text-5xl mb-4 leading-tight"
          style={{ fontFamily: "'Georgia', serif", ...textStyle }}
        >
          {recipient_name}
        </h2>
        <p className="italic text-xl text-gray-600 mb-6">{certificateBody}</p>
        <p
          className="font-bold uppercase text-2xl tracking-wide mb-8"
          style={{ color: secondary_color }}
        >
          {course_title}
        </p>
        <p className="text-lg mb-8" style={textStyle}>
          Awarded on {issueDateFormatted}
        </p>
        <div
          className="flex justify-between mt-auto pt-6 border-t-2"
          style={{ borderColor: primary_color }}
        >
          <div>
            <p className="font-bold text-lg" style={textStyle}>
              {signature || issuer_name}
            </p>
            <p className="text-gray-500 text-sm uppercase tracking-wide">
              Signature
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg" style={textStyle}>
              {issuer_name}
            </p>
            <p className="text-gray-500 text-sm uppercase tracking-wide">
              Issuer
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (layout_style === "receipt") return renderReceipt();
  if (layout_style === "modern") return renderModern();
  return renderClassic();
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
    extra_fields: {},
  });
  const [customFields, setCustomFields] = useState([]);
  const [amount, setAmount] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState("");
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
            extra_fields: cert.extra_fields || {},
          });
          setSelectedTemplate(certResponse.data.template);

          if (cert.extra_fields?.amount) setAmount(cert.extra_fields.amount);

          const fields = Object.entries(cert.extra_fields || {})
            .filter(([key]) => key !== "amount")
            .map(([key, value]) => ({ key, value }));
          setCustomFields(fields);
        }
      } catch (err) {
        setError("Could not fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setFormData({ ...formData, template_id: templateId });
    const template = templates.find((t) => String(t.id) === String(templateId));
    setSelectedTemplate(template || null);
  };

  // Custom Fields Logic
  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  // Sync custom fields & amount
  useEffect(() => {
    const extras = {};
    if (amount) extras.amount = amount;

    customFields.forEach((field) => {
      if (field.key.trim()) {
        extras[field.key.trim()] = field.value;
      }
    });

    setFormData((prev) => ({ ...prev, extra_fields: extras }));
  }, [amount, customFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const promise = isEditMode
      ? updateCertificate(certId, formData)
      : createCertificate(formData);

    toast.promise(promise, {
      loading: isEditMode ? "Updating..." : "Issuing...",
      success: (response) => {
        setTimeout(() => navigate("/dashboard"), 1500);
        return response.data.msg;
      },
      error: (err) => {
        setSubmitting(false);
        return err.response?.data?.msg || "An error occurred.";
      },
    });
  };

  const isReceipt = selectedTemplate?.layout_style === "receipt";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

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
            {isEditMode ? "Edit Document" : "Issue New Document"}
          </h1>
          <p className="text-gray-500 text-sm">
            Fill in the details below. Custom fields are supported.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} />
              Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormSelect
                label="Select Template"
                icon={LayoutTemplate}
                name="template_id"
                onChange={handleTemplateChange}
                value={formData.template_id}
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
              </FormSelect>

              <div className="border-t border-gray-100 my-4"></div>

              <FormInput
                name="recipient_name"
                label={isReceipt ? "Payer Name" : "Recipient Name"}
                icon={User}
                placeholder="e.g., Jane Doe"
                required
                value={formData.recipient_name}
                onChange={handleChange}
              />

              <FormInput
                name="recipient_email"
                label="Email (Optional)"
                icon={Type}
                type="email"
                placeholder="jane@example.com"
                value={formData.recipient_email}
                onChange={handleChange}
              />

              <FormInput
                name="course_title"
                label={
                  isReceipt ? "Payment Description" : "Course / Event Title"
                }
                icon={FileText}
                placeholder={
                  isReceipt
                    ? "e.g. Web Dev Course"
                    : "e.g., Advanced React Workshop"
                }
                required
                value={formData.course_title}
                onChange={handleChange}
              />

              {isReceipt && (
                <FormInput
                  name="amount"
                  label="Amount (Total)"
                  icon={DollarSign}
                  placeholder="e.g. $500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="issue_date"
                  label={isReceipt ? "Payment Date" : "Issue Date"}
                  icon={Calendar}
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={handleChange}
                />
                <FormInput
                  name="issuer_name"
                  label="Issuer Name"
                  icon={User}
                  placeholder="e.g. Acme Inc"
                  value={formData.issuer_name}
                  onChange={handleChange}
                />
              </div>

              <FormInput
                name="signature"
                label="Signature Text (Optional)"
                icon={PenTool}
                placeholder="e.g., Dr. John Smith"
                value={formData.signature}
                onChange={handleChange}
              />

              {/* DYNAMIC FIELDS SECTION */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Fields
                  </label>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800"
                  >
                    <Plus size={14} /> Add Field
                  </button>
                </div>

                {customFields.length > 0 ? (
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          placeholder="Label"
                          className="w-1/3 px-2 py-1.5 border rounded text-sm"
                          value={field.key}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "key",
                              e.target.value
                            )
                          }
                        />
                        <input
                          placeholder="Value"
                          className="flex-1 px-2 py-1.5 border rounded text-sm"
                          value={field.value}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No custom fields added.
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                <span>{isEditMode ? "Update" : "Generate Document"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Preview
              </h3>
              {selectedTemplate && (
                <button
                  className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  onClick={() => setShowFullscreen(true)}
                >
                  <Maximize2 size={18} />
                  <span>Expand</span>
                </button>
              )}
            </div>

            <div className="w-full bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
              <div className="w-full shadow-xl transition-all duration-300">
                <CertificatePreview
                  template={selectedTemplate}
                  formData={formData}
                />
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
              <Info size={14} />
              Preview updates in real-time as you type
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 md:p-8"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={32} />
          </button>

          <div
            className="w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <CertificatePreview
              template={selectedTemplate}
              formData={formData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCertificatePage;
