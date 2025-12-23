import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyCertificate } from "../api";
import { SERVER_BASE_URL } from "../config";
import QRCode from "react-qr-code";
import {
  CheckCircle,
  XCircle,
  Search,
  Building,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import KonvaPreview from "../components/KonvaPreview";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

// --- CERTIFICATE DISPLAY COMPONENT ---
const CertificateDisplay = ({ certificate, template }) => {
  if (!certificate || !template) return null;

  if (template.layout_style === "visual") {
    if (!template.layout_data) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-8 border-2 border-dashed border-red-200">
          <p className="text-red-600 text-center font-medium">
            Preview Unavailable: Missing layout data.
          </p>
        </div>
      );
    }
    return (
      <div className="shadow-2xl rounded-lg overflow-hidden h-full bg-white">
        <KonvaPreview
          layoutData={template.layout_data}
          dynamicData={certificate}
        />
      </div>
    );
  }

  // --- FIX: Destructure layout_style here ---
  const {
    layout_style,
    primary_color = "#2563EB",
    secondary_color = "#64748B",
    body_font_color = "#333333",
    font_family = "Georgia",
    background_url,
    logo_url,
    custom_text = {},
  } = template;

  const {
    recipient_name,
    course_title,
    issue_date,
    signature,
    issuer_name,
    verification_id,
  } = certificate;

  const certificateTitle = custom_text.title || "Certificate of Completion";
  const certificateBody =
    custom_text.body || "has successfully completed the course";
  const issueDateFormatted = new Date(issue_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const textStyle = { color: body_font_color, fontFamily: font_family };
  const backgroundStyle = background_url
    ? {
        backgroundImage: `url(${SERVER_BASE_URL}${background_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  const renderClassic = () => (
    <div
      className="w-full h-full bg-white p-2 shadow-2xl rounded-lg overflow-hidden"
      style={{ fontFamily: font_family }}
    >
      <div
        className="relative flex flex-col h-full w-full border-[8px] border-double"
        style={{ borderColor: primary_color, ...backgroundStyle }}
      >
        <div
          className="h-3 w-full border-b-4"
          style={{
            borderColor: primary_color,
            background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
          }}
        ></div>

        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 relative">
          {logo_url && (
            <img
              src={`${SERVER_BASE_URL}${logo_url}`}
              alt="Logo"
              className="h-24 w-auto object-contain mb-4"
            />
          )}

          <h1
            className="text-4xl font-bold uppercase tracking-wider mb-2"
            style={{ color: primary_color }}
          >
            {certificateTitle}
          </h1>
          <p className="text-lg italic mb-4" style={{ color: "#4B5EAA" }}>
            This is to certify that
          </p>

          <h2
            className="text-5xl font-extrabold mb-4"
            style={{ fontFamily: "'Georgia', serif", ...textStyle }}
          >
            {recipient_name}
          </h2>

          <p className="text-xl italic mb-6" style={{ color: "#4B5EAA" }}>
            {certificateBody}
          </p>

          <p
            className="text-3xl font-bold uppercase mb-8"
            style={{ color: secondary_color }}
          >
            {course_title}
          </p>

          <div className="w-full flex justify-around items-end mt-auto pt-8 px-12">
            <div className="text-center w-1/3">
              <p
                className="text-lg font-semibold border-b border-gray-400 pb-1 mb-1"
                style={textStyle}
              >
                {issueDateFormatted}
              </p>
              <span className="text-gray-500 text-sm">Date</span>
            </div>
            <div className="text-center w-1/3">
              <p
                className="text-lg font-semibold border-b border-gray-400 pb-1 mb-1"
                style={textStyle}
              >
                {signature || issuer_name}
              </p>
              <span className="text-gray-500 text-sm">Signature</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-white p-1.5 rounded shadow-md">
            <QRCode
              value={`${window.location.origin}/verify/${verification_id}`}
              size={64}
            />
          </div>

          <div className="absolute bottom-4 left-4 text-left text-xs text-gray-500">
            <p className="mb-0 font-semibold">Issued by: {issuer_name}</p>
            <p className="font-mono">ID: {verification_id}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModern = () => (
    <div
      className="flex w-full h-full bg-white shadow-2xl rounded-lg overflow-hidden"
      style={{ fontFamily: font_family, border: `6px solid ${primary_color}` }}
    >
      <div
        className="w-[35%] flex flex-col justify-between items-center p-8 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
        }}
      >
        <div>
          {logo_url && (
            <img
              src={`${SERVER_BASE_URL}${logo_url}`}
              className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4 object-contain mx-auto"
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

      <div
        className="w-[65%] flex flex-col justify-center p-12 relative bg-white/95"
        style={backgroundStyle}
      >
        <h1
          className="text-xl font-light uppercase tracking-[0.2em] mb-6"
          style={{ color: primary_color }}
        >
          {certificateTitle}
        </h1>
        <h2
          className="text-5xl font-bold mb-4 leading-tight"
          style={{ fontFamily: "'Georgia', serif", ...textStyle }}
        >
          {recipient_name}
        </h2>
        <p className="text-lg italic text-gray-600 mb-6">{certificateBody}</p>
        <p
          className="text-2xl font-bold uppercase tracking-wide mb-8"
          style={{ color: secondary_color }}
        >
          {course_title}
        </p>

        <div
          className="mt-auto pt-6 border-t-2 flex justify-between text-sm"
          style={{ borderColor: primary_color }}
        >
          <div>
            <p className="font-bold text-lg mb-0" style={textStyle}>
              {issueDateFormatted}
            </p>
            <span className="text-gray-500 uppercase text-xs tracking-wider">
              Date
            </span>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg mb-0" style={textStyle}>
              {signature || issuer_name}
            </p>
            <span className="text-gray-500 uppercase text-xs tracking-wider">
              Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return layout_style === "modern" ? renderModern() : renderClassic();
};

// --- MAIN PAGE COMPONENT ---
const VerifyCertificatePage = () => {
  const { verificationId: paramId } = useParams();
  const [verificationId, setVerificationId] = useState(paramId || "");
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!paramId);
  const navigate = useNavigate();

  const handleVerify = async (idToVerify) => {
    if (!idToVerify?.trim()) {
      setError("Please enter a valid Verification ID.");
      return;
    }
    setError("");
    setCertificate(null);
    setTemplate(null);
    setCompany(null);
    setLoading(true);

    // Update URL without reload if manually typing
    if (idToVerify !== paramId) {
      navigate(`/verify/${idToVerify}`, { replace: true });
    }

    try {
      const response = await verifyCertificate(idToVerify);
      setCertificate(response.data.certificate);
      setTemplate(response.data.template);
      setCompany(response.data.company);
    } catch (err) {
      setError(
        err.response?.data?.msg || "Verification failed. Credential not found."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) handleVerify(paramId);
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(verificationId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
              Credential Verification
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Verify the authenticity of a digital credential by entering its
              unique ID below.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="verify-id" className="sr-only">
                  Verification ID
                </label>
                <input
                  id="verify-id"
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  placeholder="e.g. 550e8400-e29b..."
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Search size={20} /> Verify Credential
                  </span>
                )}
              </button>
            </form>
          </div>

          {error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {certificate && template && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Status Banner */}
              <div
                className={`rounded-xl p-4 mb-6 flex items-start gap-4 border ${
                  certificate.status === "valid"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                {certificate.status === "valid" ? (
                  <CheckCircle className="text-green-600 shrink-0" size={24} />
                ) : (
                  <AlertCircle className="text-red-600 shrink-0" size={24} />
                )}
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      certificate.status === "valid"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {certificate.status === "valid"
                      ? "Valid Credential"
                      : "Revoked Credential"}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      certificate.status === "valid"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Issued to <strong>{certificate.recipient_name}</strong> on{" "}
                    {new Date(certificate.issue_date).toLocaleDateString()}.
                  </p>
                </div>
              </div>

              {/* Company Info */}
              {company && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-900">
                      Issued by verified organization:{" "}
                      <strong>{company.name}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Certificate Preview */}
              <div
                className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden bg-white"
                style={{ aspectRatio: "1.414/1" }}
              >
                <CertificateDisplay
                  certificate={certificate}
                  template={template}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default VerifyCertificatePage;
