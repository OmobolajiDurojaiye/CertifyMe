import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTemplates,
  createCertificate,
  getCertificate,
  updateCertificate,
} from "../api";
import QRCode from "react-qr-code";

function CreateCertificatePage() {
  const { certId } = useParams();
  const isEditMode = !!certId;
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    recipient_name: "",
    course_title: "",
    issue_date: "",
    template_id: "",
    signature: "",
    verification_id: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch templates
        const templateResponse = await getTemplates();
        const fetchedTemplates = templateResponse.data;
        setTemplates(fetchedTemplates);

        if (fetchedTemplates.length === 0) {
          setError("No templates found. Please create one first.");
          setLoading(false);
          return;
        }

        // Handle Edit Mode or Create Mode
        if (isEditMode) {
          // Fetch existing certificate data
          const certResponse = await getCertificate(certId);
          const cert = certResponse.data;

          setFormData({
            recipient_name: cert.recipient_name,
            course_title: cert.course_title,
            issue_date: cert.issue_date,
            template_id: cert.template_id,
            signature: cert.signature || "",
            verification_id: cert.verification_id,
          });

          // Find and set the correct template for the certificate
          const templateForCert = fetchedTemplates.find(
            (t) => t.id == cert.template_id
          );
          setSelectedTemplate(templateForCert || fetchedTemplates[0]);
        } else {
          // Create Mode, set the default template
          const defaultTemplate = fetchedTemplates[0];
          setSelectedTemplate(defaultTemplate);
          setFormData((prev) => ({
            ...prev,
            recipient_name: "",
            course_title: "",
            issue_date: "",
            signature: "",
            verification_id: "",
            template_id: defaultTemplate.id,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          "Could not fetch required data for the page. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
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
      let response;
      if (isEditMode) {
        response = await updateCertificate(certId, formData);
        setSuccess("Certificate updated successfully! Redirecting...");
      } else {
        response = await createCertificate(formData);
        setSuccess(
          `Certificate created successfully! Verification ID: ${response.data.verification_id}. Redirecting...`
        );
      }
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError("Failed to save certificate. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const CertificatePreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="text-center text-gray-500 p-8">
          <img
            src="/images/certbadge.png"
            alt="Badge"
            className="w-24 mx-auto mb-4"
          />
          <p>Select a template to see a live preview.</p>
        </div>
      );
    }

    return (
      <div
        className="certificate-preview-container bg-white shadow-lg rounded-xl p-8 flex flex-col justify-between"
        style={{
          background: selectedTemplate.background_url
            ? `url(http://127.0.0.1:5000${selectedTemplate.background_url}) no-repeat center/cover`
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "450px",
          fontFamily: selectedTemplate.font_family || "Georgia, serif",
        }}
      >
        {selectedTemplate.logo_url && (
          <img
            src={`http://127.0.0.1:5000${selectedTemplate.logo_url}`}
            alt="Logo"
            className="w-24 h-24 mx-auto rounded opacity-90 mb-4"
          />
        )}
        <div className="text-center flex-grow-1 flex flex-col justify-center">
          <h1
            className="font-bold text-3xl mb-4"
            style={{ color: selectedTemplate.primary_color || "#2563EB" }}
          >
            Certificate of Achievement
          </h1>
          <p className="text-lg text-gray-700">
            Awarded to{" "}
            <strong>{formData.recipient_name || "Recipient Name"}</strong>
          </p>
          <p className="text-base text-gray-600">
            For successfully completing{" "}
            <strong>{formData.course_title || "Course Title"}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Issued on{" "}
            {formData.issue_date
              ? new Date(formData.issue_date).toLocaleDateString()
              : "Issue Date"}
          </p>
          {formData.signature && (
            <div
              className="mt-4 border-t border-gray-300 pt-2 w-64 mx-auto text-left"
              style={{ color: selectedTemplate.primary_color || "#2563EB" }}
            >
              Signed: {formData.signature}
            </div>
          )}
          <div className="mt-4 text-right text-sm text-gray-600 bg-white bg-opacity-80 p-2 rounded">
            Verification ID:{" "}
            {formData.verification_id || "Unique ID will be generated"}
          </div>
          <div className="mt-4 text-center">
            <QRCode
              value={`${window.location.origin}/verify/${
                formData.verification_id || "pending"
              }`}
              size={80}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="text-center py-12">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-indigo-600"
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
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isEditMode ? "Edit Certificate" : "Create a New Certificate"}
              </h2>
              <p className="text-gray-500">
                {isEditMode
                  ? "Update the certificate details below."
                  : "Design a professional certificate with real-time preview. Fill in the details and publish."}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md py-2 px-6 hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
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
                  {isEditMode ? "Updating..." : "Publishing..."}
                </>
              ) : isEditMode ? (
                "Update Certificate"
              ) : (
                "Publish Certificate"
              )}
            </button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Template
                  </label>
                  <select
                    name="template_id"
                    onChange={handleTemplateChange}
                    value={formData.template_id}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {templates.length === 0 ? (
                      <option value="">No templates found</option>
                    ) : (
                      templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    name="recipient_name"
                    placeholder="e.g., Jane Doe"
                    onChange={handleChange}
                    value={formData.recipient_name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course / Event Title
                  </label>
                  <input
                    type="text"
                    name="course_title"
                    placeholder="e.g., Advanced React Workshop"
                    onChange={handleChange}
                    value={formData.course_title}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="issue_date"
                    onChange={handleChange}
                    value={formData.issue_date}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Signature (Optional)
                  </label>
                  <input
                    type="text"
                    name="signature"
                    placeholder="e.g., Dr. John Smith"
                    onChange={handleChange}
                    value={formData.signature}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-6">
                Live Preview
              </h4>
              <CertificatePreview />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CreateCertificatePage;
