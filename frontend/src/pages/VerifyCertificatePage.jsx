import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { verifyCertificate } from "../api";
import { SERVER_BASE_URL } from "../config";
import QRCode from "react-qr-code";
import { CheckCircle, XCircle, Search } from "lucide-react";
import "../styles/VerifyPage.css"; // Import the new stylesheet

// A minimal header just for this page
const VerifyHeader = () => (
  <header className="verify-header">
    <Container>
      <Link to="/" className="navbar-brand">
        {/* <img src="/images/certbadge.png" alt="CertifyMe Logo" height="28" /> */}
        <span>CertifyMe</span>
      </Link>
    </Container>
  </header>
);

// A minimal footer just for this page
const VerifyFooter = () => (
  <footer className="verify-footer">
    <Container>
      <small>
        &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
      </small>
    </Container>
  </footer>
);

// The certificate display component
const CertificateDisplay = ({ certificate, template }) => {
  if (!certificate || !template) return null;

  const serverUrl = SERVER_BASE_URL;
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
  const textStyle = {
    color: body_font_color || "#333",
    fontFamily: font_family,
  };
  const backgroundStyle = {
    backgroundImage: background_url
      ? `url(${serverUrl}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const renderClassic = () => (
    <div
      className="w-100 h-100 bg-white p-2"
      style={{ fontFamily: font_family, ...backgroundStyle }}
    >
      <div
        className="d-flex flex-column justify-content-between w-100 h-100 p-4 text-center"
        style={{ border: `4px solid ${primary_color}` }}
      >
        <header>
          {logo_url && (
            <img
              src={`${serverUrl}${logo_url}`}
              alt="Logo"
              style={{
                maxHeight: "100px",
                maxWidth: "120px",
                marginBottom: "1rem",
              }}
            />
          )}
          <h1
            className="text-uppercase fw-bold"
            style={{
              fontSize: "2.5rem",
              color: primary_color,
              letterSpacing: "0.1em",
            }}
          >
            Certificate of Completion
          </h1>
        </header>
        <main>
          <p className="mb-2" style={{ fontSize: "1.2rem" }}>
            This is to certify that
          </p>
          <h2
            className="fw-bold my-3"
            style={{ fontSize: "3rem", ...textStyle }}
          >
            {recipient_name}
          </h2>
          <p className="mb-2" style={{ fontSize: "1.2rem" }}>
            has successfully completed the course
          </p>
          <p
            className="text-uppercase fw-bold mt-3"
            style={{ fontSize: "1.8rem", color: secondary_color }}
          >
            {course_title}
          </p>
        </main>
        <div className="d-flex justify-content-around align-items-end w-100 mt-4">
          <div style={{ width: "40%" }}>
            <p className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
              {issueDateFormatted}
            </p>
            <hr
              className="my-1"
              style={{ borderColor: primary_color, opacity: 1 }}
            />
            <span className="small text-muted">Date</span>
          </div>
          <div style={{ width: "40%" }}>
            <p className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
              {signature || issuer_name}
            </p>
            <hr
              className="my-1"
              style={{ borderColor: primary_color, opacity: 1 }}
            />
            <span className="small text-muted">Signature</span>
          </div>
        </div>
        <div
          className="position-absolute"
          style={{ bottom: "1rem", right: "1rem" }}
        >
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={80}
            viewBox="0 0 80 80"
          />
        </div>
        <div
          className="position-absolute text-start small text-muted"
          style={{ bottom: "1rem", left: "1rem" }}
        >
          <p className="mb-0">Issued by: {issuer_name}</p>
          <p className="mb-0">ID: {verification_id}</p>
        </div>
      </div>
    </div>
  );

  const renderModern = () => (
    <div
      className="d-flex h-100 w-100"
      style={{
        fontFamily: font_family,
        background: background_url ? "" : "#f8f9fa",
      }}
    >
      <div
        className="d-flex flex-column justify-content-between align-items-center p-4 text-white"
        style={{ width: "35%", backgroundColor: primary_color }}
      >
        <div className="text-center">
          {logo_url && (
            <img
              src={`${serverUrl}${logo_url}`}
              className="rounded-circle bg-white p-2 mb-3"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
              alt="Logo"
            />
          )}
          <p
            className="fw-bold text-uppercase"
            style={{ letterSpacing: "0.1em" }}
          >
            {issuer_name}
          </p>
        </div>
        <div className="bg-white p-1 rounded">
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={90}
            viewBox="0 0 90 90"
          />
        </div>
      </div>
      <div
        className="d-flex flex-column justify-content-center p-5"
        style={{ width: "65%", ...backgroundStyle }}
      >
        <h1
          className="text-uppercase"
          style={{ fontSize: "1.2rem", letterSpacing: "0.2em", color: "#888" }}
        >
          Certificate of Achievement
        </h1>
        <h2
          className="fw-bold my-3"
          style={{ fontSize: "3.5rem", ...textStyle }}
        >
          {recipient_name}
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#555" }}>
          has successfully completed
        </p>
        <p
          className="fw-bold mt-2 mb-4"
          style={{ fontSize: "2rem", color: secondary_color }}
        >
          {course_title}
        </p>
        <div
          className="mt-auto pt-3 border-top d-flex justify-content-between small text-muted"
          style={{ borderColor: primary_color }}
        >
          <div>
            <p className="mb-1">
              <strong>Date:</strong> {issueDateFormatted}
            </p>
            <p className="mb-0">
              <strong>Signature:</strong> {signature || issuer_name}
            </p>
          </div>
          <div>
            <p className="mb-1">
              <strong>Verification ID:</strong>
            </p>
            <p className="mb-0">{verification_id}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return layout_style === "modern" ? renderModern() : renderClassic();
};

const VerifyCertificatePage = () => {
  const { verificationId: paramId } = useParams();
  const [verificationId, setVerificationId] = useState(paramId || "");
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!paramId);
  const navigate = useNavigate();

  const handleVerify = async (idToVerify) => {
    if (!idToVerify || idToVerify.trim() === "") {
      setError("Please enter a Verification ID to begin.");
      return;
    }
    setError("");
    setCertificate(null);
    setTemplate(null);
    setLoading(true);
    navigate(`/verify/${idToVerify}`, { replace: true });
    try {
      const response = await verifyCertificate(idToVerify);
      setCertificate(response.data.certificate);
      setTemplate(response.data.template);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Verification failed. Please check the ID and try again."
      );
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
    <div className="verify-page-wrapper">
      <VerifyHeader />
      <main className="verify-main">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h1 className="fw-bold">Credential Verification</h1>
            <p className="lead text-muted">
              Enter a Verification ID to confirm the authenticity of a
              credential issued by CertifyMe.
            </p>
          </div>
          <Card
            className="p-4 shadow-sm mb-5 mx-auto"
            style={{ borderRadius: "12px", maxWidth: "600px" }}
          >
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  size="lg"
                  type="text"
                  placeholder="Enter Verification ID..."
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100 py-2 fw-bold"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Search size={16} className="me-2" />
                    Verify Credential
                  </>
                )}
              </Button>
            </Form>
          </Card>

          {loading && (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          )}
          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <XCircle className="me-2" />
              {error}
            </Alert>
          )}
          {certificate && template && (
            <>
              <Alert variant="success" className="d-flex align-items-center">
                <CheckCircle className="me-2" />
                <div>
                  <strong className="d-block">Certificate Verified!</strong>
                  This credential is authentic and was issued to{" "}
                  <strong>{certificate.recipient_name}</strong> on{" "}
                  <strong>
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </strong>
                  .
                </div>
              </Alert>
              <div
                className="shadow-lg"
                style={{
                  aspectRatio: "1.414 / 1",
                  maxWidth: "1000px",
                  margin: "0 auto",
                }}
              >
                <CertificateDisplay
                  certificate={certificate}
                  template={template}
                />
              </div>
            </>
          )}
        </Container>
      </main>
      <VerifyFooter />
    </div>
  );
};

export default VerifyCertificatePage;
