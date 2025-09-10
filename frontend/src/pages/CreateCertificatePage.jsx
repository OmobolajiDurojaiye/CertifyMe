// frontend/src/pages/CreateCertificatePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTemplates,
  createCertificate,
  getCertificate,
  updateCertificate,
} from "../api";
import QRCode from "react-qr-code";
import { Calendar, CheckCircle, Info } from "lucide-react";

const CertificatePreview = ({ template, formData }) => {
  if (!template) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">
          No templates available. Please create a template first.
        </p>
      </div>
    );
  }

  const serverUrl = "http://127.0.0.1:5000"; // Define server URL
  const {
    layout_style,
    primary_color,
    secondary_color,
    body_font_color,
    font_family,
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

  const textStyle = { color: body_font_color || "#333" };
  const backgroundStyle = {
    fontFamily: font_family,
    backgroundImage: background_url
      ? `url(${serverUrl}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  switch (layout_style) {
    case "modern":
      return (
        <div
          className="flex h-full shadow-lg rounded-xl overflow-hidden bg-gray-800 text-white"
          style={{ fontFamily: font_family }}
        >
          <div
            className="w-1/3 p-6 flex flex-col justify-between items-center"
            style={{ backgroundColor: primary_color }}
          >
            <div className="text-center">
              {logo_url && (
                <img
                  src={`${serverUrl}${logo_url}`}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              )}
              <p className="font-bold text-center mt-3">{issuer_name}</p>
            </div>
            <div className="bg-white p-1 rounded-md">
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={80}
              />
            </div>
          </div>
          <div
            className="w-2/3 p-8 flex flex-col justify-center relative"
            style={backgroundStyle}
          >
            <h1
              className="text-xl font-light uppercase tracking-wider"
              style={{ color: primary_color }}
            >
              Certificate of Achievement
            </h1>
            <h2 className="text-4xl font-bold my-2">{recipient_name}</h2>
            <p className="text-gray-300">has successfully completed</p>
            <p
              className="text-lg font-semibold mt-1"
              style={{ color: primary_color }}
            >
              {course_title}
            </p>
            <div className="flex justify-between mt-8 text-sm">
              <div>
                <p>Date: {issue_date}</p>
                <p>Signature: {signature || issuer_name}</p>
              </div>
              <p>Verification ID: {verification_id}</p>
            </div>
          </div>
        </div>
      );
    case "classic":
      return (
        <div
          className="h-full shadow-lg rounded-xl overflow-hidden bg-white relative"
          style={{ fontFamily: font_family, ...backgroundStyle }}
        >
          <div style={{ borderBottom: `5px solid ${primary_color}` }}></div>
          <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
            {logo_url && (
              <img
                src={`${serverUrl}${logo_url}`}
                alt="Logo"
                className="mb-4"
                style={{ width: 120, height: 120, objectFit: "contain" }}
              />
            )}
            <h1
              className="font-bold mb-3"
              style={{ fontSize: "2rem", color: primary_color }}
            >
              Certificate of Completion
            </h1>
            <p className="text-gray-500 mb-1 text-base">
              This is to certify that
            </p>
            <h2
              className="font-bold mb-3"
              style={{ fontSize: "2.5rem", ...textStyle }}
            >
              {recipient_name}
            </h2>
            <p className="text-gray-500 mb-1 text-base">
              has successfully completed the course
            </p>
            <p
              className="font-bold mb-4"
              style={{ fontSize: "1.5rem", color: secondary_color }}
            >
              {course_title}
            </p>
            <div className="flex justify-around w-full mt-4">
              <div className="text-center">
                <p className="font-bold mb-0" style={textStyle}>
                  {issue_date}
                </p>
                <hr
                  className="w-1/2 mx-auto my-1"
                  style={{ borderColor: primary_color }}
                />
                <span className="text-gray-500 text-sm">Date</span>
              </div>
              <div className="text-center">
                <p className="font-bold mb-0" style={textStyle}>
                  {signature || issuer_name}
                </p>
                <hr
                  className="w-1/2 mx-auto my-1"
                  style={{ borderColor: primary_color }}
                />
                <span className="text-gray-500 text-sm">Signature</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-white p-1 rounded-md">
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={80}
              />
            </div>
            <p className="absolute bottom-4 left-4" style={textStyle}>
              Issued by: {issuer_name}
            </p>
            <p className="absolute bottom-2 left-4 text-gray-500 text-sm">
              Verification ID: {verification_id}
            </p>
          </div>
        </div>
      );
    default:
      return <div>Unsupported layout</div>;
  }
};

function CreateCertificatePage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issuer_name: "",
    issue_date: "",
    signature: "",
    verification_id: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { certId } = useParams();
  const isEditMode = !!certId;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const templatesResponse = await getTemplates();
        setTemplates(templatesResponse.data);

        let template;
        if (isEditMode) {
          const certResponse = await getCertificate(certId);
          const certData = certResponse.data;
          setFormData({
            ...certData,
            issue_date: certData.issue_date.split("T")[0],
          });
          template = templatesResponse.data.find(
            (t) => t.id === certData.template_id
          );
        } else {
          // Auto-select default template
          template =
            templatesResponse.data.find(
              (t) => t.is_public && t.title === "Default Classic"
            ) ||
            templatesResponse.data.find((t) => t.is_public) ||
            templatesResponse.data[0];
          if (template) {
            setFormData((prev) => ({ ...prev, template_id: template.id }));
          }
        }
        setSelectedTemplate(template);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [certId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id == templateId);
    setSelectedTemplate(template);
    setFormData({ ...formData, template_id: templateId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!formData.template_id) {
      setError("Please select a template.");
      setLoading(false);
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
      setLoading(false);
    }
  };

  const FormInput = ({
    name,
    label,
    placeholder,
    type = "text",
    required = false,
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          type={type}
          name={name}
          id={name}
          className="w-full p-3 bg-gray-50 rounded-md border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder}
          required={required}
          value={formData[name]}
          onChange={handleChange}
        />
        {type === "date" && (
          <Calendar
            className="absolute right-3 top-3.5 text-gray-400"
            size={20}
          />
        )}
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="text-center p-12">Loading certificate editor...</div>
    );

  return (
    <div
      className="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-8"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-xl shadow-lg overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Certificate" : "Create Certificate"}
          </h2>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white rounded-md py-2 px-6 font-semibold hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
          >
            {isEditMode ? "Update" : "Publish"}
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border-red-500 text-red-700 border-l-4 p-4 mb-6 rounded-md flex items-center">
            <Info className="mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-green-500 text-green-700 border-l-4 p-4 mb-6 rounded-md flex items-center">
            <CheckCircle className="mr-2" />
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Template
            </label>
            <select
              name="template_id"
              onChange={handleTemplateChange}
              value={formData.template_id}
              className="w-full p-3 bg-gray-50 rounded-md border-gray-200 mt-1"
            >
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
      <div className="col-span-12 lg:col-span-8 bg-gray-200 p-8 rounded-xl shadow-inner">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Live Preview</h3>
        <div className="aspect-[1.414/1] w-full">
          <CertificatePreview template={selectedTemplate} formData={formData} />
        </div>
      </div>
    </div>
  );
}

export default CreateCertificatePage;
