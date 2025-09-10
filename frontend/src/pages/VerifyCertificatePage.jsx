import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { verifyCertificate } from "../api";
import QRCode from "react-qr-code";

// Reusable Certificate Display Component (borrowed from ViewCertificatePage)
const CertificateDisplay = ({ certificate, template }) => {
  if (!certificate || !template) return null;

  const serverUrl = "http://127.0.0.1:5000";
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
    recipient_name,
    course_title,
    issue_date,
    signature,
    issuer_name,
    verification_id,
  } = certificate;
  const issueDateFormatted = new Date(issue_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
                  alt="Logo"
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
                <p>Date: {issueDateFormatted}</p>
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
                  {issueDateFormatted}
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

function VerifyCertificatePage() {
  const { verificationId: paramId } = useParams();
  const [verificationId, setVerificationId] = useState(paramId || "");
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (idToVerify) => {
    if (!idToVerify) return;
    setError("");
    setCertificate(null);
    setTemplate(null);
    setLoading(true);
    try {
      const response = await verifyCertificate(idToVerify);
      setCertificate(response.data.certificate);
      setTemplate(response.data.template);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to verify certificate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) {
      handleVerify(paramId);
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(verificationId);
  };

  return (
    <Container className="py-5" style={{ maxWidth: "1000px" }}>
      <h2 className="fw-bold mb-4 text-center text-dark">Verify Certificate</h2>
      <p className="text-muted mb-4 text-center">
        Enter the Verification ID to verify the authenticity of a certificate.
      </p>

      <Card
        className="p-4 shadow-sm mb-5 mx-auto"
        style={{ borderRadius: "12px", maxWidth: "600px" }}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Verification ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Verification ID"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              required
            />
          </Form.Group>
          <Button
            type="submit"
            className="w-100"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Verifying...
              </>
            ) : (
              "Verify Certificate"
            )}
          </Button>
        </Form>
      </Card>

      {error && (
        <Alert variant="danger" className="rounded-3">
          {error}
        </Alert>
      )}

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      {certificate && template && (
        <>
          <Alert variant="success" className="d-flex align-items-center">
            <svg
              className="me-2"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
            <div>
              <strong className="d-block">Certificate Verified!</strong>
              This certificate is authentic and its status is{" "}
              <strong className="text-capitalize">{certificate.status}</strong>.
            </div>
          </Alert>

          <div className="bg-light p-4 p-md-5 rounded-3">
            <div className="shadow-lg" style={{ aspectRatio: "1.414 / 1" }}>
              <CertificateDisplay
                certificate={certificate}
                template={template}
              />
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

export default VerifyCertificatePage;
