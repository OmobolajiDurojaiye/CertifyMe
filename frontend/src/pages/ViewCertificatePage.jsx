// ViewCertificatePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Alert, Spinner, Modal } from "react-bootstrap";
import {
  getCertificate,
  getTemplate,
  getCertificatePDF,
  updateCertificateStatus,
} from "../api";
import { SERVER_BASE_URL } from "../config";
import QRCode from "react-qr-code";
import {
  Edit3,
  Download,
  Maximize2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function ViewCertificatePage() {
  const { certId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        const certResponse = await getCertificate(certId);
        const certData = certResponse.data;
        setCertificate(certData);

        if (certData.template_id) {
          const templateResponse = await getTemplate(certData.template_id);
          setTemplate(templateResponse.data);
        }
      } catch (err) {
        setError("Failed to load certificate details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificateData();
  }, [certId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await getCertificatePDF(certificate.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `certificate_${certificate.verification_id}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const CertificateDisplay = ({ isFullscreen = false }) => {
    if (!certificate || !template) return null;

    const serverUrl = SERVER_BASE_URL;
    const {
      layout_style,
      primary_color = "#0284c7",
      secondary_color = "#e2e8f0",
      body_font_color = "#1e293b",
      font_family = "serif",
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
    const issueDateFormatted = new Date(issue_date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const textStyle = {
      color: body_font_color,
      fontFamily: font_family.includes("serif")
        ? "Georgia, serif"
        : "Helvetica Neue, sans-serif",
    };
    const backgroundStyle = {
      backgroundImage: background_url
        ? `url(${serverUrl}${background_url})`
        : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };

    const containerStyle = {
      aspectRatio: isFullscreen ? "1.414 / 1" : "1.414 / 1",
      width: isFullscreen ? "100%" : "100%",
      height: isFullscreen ? "100vh" : "auto",
      transform: isFullscreen ? "scale(1)" : "scale(0.95)",
      transition: "transform 0.3s ease",
      boxShadow: isFullscreen
        ? "0 0 50px rgba(0,0,0,0.5)"
        : "0 20px 40px rgba(0,0,0,0.1)",
    };

    const renderClassic = () => (
      <div
        className="position-relative d-flex flex-column h-100 shadow-2xl rounded-4 overflow-hidden bg-white"
        style={{
          border: `8px double ${primary_color}`,
          ...backgroundStyle,
          ...textStyle,
        }}
      >
        <div
          style={{
            borderBottom: `4px solid ${primary_color}`,
            background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
            height: "20px",
          }}
        ></div>
        <div className="d-flex flex-grow-1 flex-column justify-content-center align-items-center text-center p-4">
          {logo_url && (
            <img
              src={`${serverUrl}${logo_url}`}
              alt="Logo"
              className="mb-4 rounded-3"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "contain",
                border: `2px solid ${secondary_color}`,
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            />
          )}
          <h1
            className="fw-bold mb-3 text-uppercase"
            style={{
              fontSize: "2.5rem",
              color: primary_color,
              letterSpacing: "0.05em",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Certificate of Completion
          </h1>
          <p
            className="mb-2 fst-italic"
            style={{ fontSize: "1.2rem", color: "#4B5EAA" }}
          >
            This is to certify that
          </p>
          <h2
            className="fw-bolder mb-3"
            style={{
              fontSize: "3rem",
              ...textStyle,
            }}
          >
            {recipient_name}
          </h2>
          <p
            className="mb-2 fst-italic"
            style={{ fontSize: "1.2rem", color: "#4B5EAA" }}
          >
            has successfully completed the course
          </p>
          <p
            className="fw-bold mb-4 text-uppercase"
            style={{
              fontSize: "1.8rem",
              color: secondary_color,
            }}
          >
            {course_title}
          </p>
          <div className="d-flex justify-content-around w-100 mt-4">
            <div className="text-center">
              <p
                className="fw-semibold mb-1"
                style={{ ...textStyle, fontSize: "1.1rem" }}
              >
                {issueDateFormatted}
              </p>
              <hr
                className="w-75 mx-auto my-1"
                style={{ borderTop: `2px solid ${primary_color}` }}
              />
              <small className="text-muted">Date</small>
            </div>
            <div className="text-center">
              <p
                className="fw-semibold mb-1"
                style={{ ...textStyle, fontSize: "1.1rem" }}
              >
                {signature || issuer_name}
              </p>
              <hr
                className="w-75 mx-auto my-1"
                style={{ borderTop: `2px solid ${primary_color}` }}
              />
              <small className="text-muted">Signature</small>
            </div>
          </div>
          <div
            className="position-absolute bottom-0 end-0 m-3 bg-white p-2 rounded-3 shadow-lg"
            style={{ width: "90px", height: "90px" }}
          >
            <QRCode
              value={`${window.location.origin}/verify/${verification_id}`}
              size={80}
              className="rounded"
            />
          </div>
          <small
            className="position-absolute bottom-0 start-0 m-3 fw-medium"
            style={{ ...textStyle, fontSize: "1.1rem" }}
          >
            Issued by: {issuer_name}
          </small>
        </div>
      </div>
    );

    const renderModern = () => (
      <div
        className="d-flex h-100 shadow-2xl rounded-4 overflow-hidden position-relative"
        style={{
          border: `6px solid ${primary_color}`,
          background: "rgba(255,255,255,0.05)",
          ...backgroundStyle,
        }}
      >
        <div
          className="d-flex flex-column justify-content-between align-items-center p-4"
          style={{
            width: "35%",
            background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
            borderRight: `3px solid ${secondary_color}`,
          }}
        >
          <div className="text-center">
            {logo_url && (
              <img
                src={`${serverUrl}${logo_url}`}
                alt="Logo"
                className="rounded-circle border-4 border-white mb-2"
                style={{
                  width: "8rem",
                  height: "8rem",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
            )}
            <p
              className="fw-bold text-uppercase ls-2"
              style={{
                fontSize: "1.3rem",
                color: "white",
                textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              {issuer_name}
            </p>
          </div>
          <div className="bg-white p-2 rounded-3 shadow-lg">
            <QRCode
              value={`${window.location.origin}/verify/${verification_id}`}
              size={100}
              className="rounded"
            />
          </div>
        </div>
        <div
          className="d-flex flex-column justify-content-center p-5 position-relative"
          style={{ width: "65%", background: "rgba(255,255,255,0.1)" }}
        >
          <h1
            className="fw-light text-uppercase ls-3 mb-3"
            style={{
              fontSize: "1.8rem",
              color: primary_color,
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            Certificate of Achievement
          </h1>
          <h2
            className="fw-bolder my-3"
            style={{
              fontSize: "3.2rem",
              fontFamily: "'Georgia', serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              ...textStyle,
            }}
          >
            {recipient_name}
          </h2>
          <p
            className="fst-italic mb-3"
            style={{ fontSize: "1.2rem", color: "#E5E7EB" }}
          >
            has successfully completed
          </p>
          <p
            className="fw-bold text-uppercase mb-4 ls-1"
            style={{ fontSize: "1.6rem", color: secondary_color }}
          >
            {course_title}
          </p>
          <div
            className="d-flex justify-content-between mt-5 pt-3 border-top"
            style={{
              borderColor: primary_color,
              fontSize: "1.1rem",
              color: "#E5E7EB",
            }}
          >
            <div>
              <p className="mb-0">Date: {issueDateFormatted}</p>
              <p className="mb-0">Signature: {signature || issuer_name}</p>
            </div>
            <p className="mb-0">Verification ID: {verification_id}</p>
          </div>
        </div>
      </div>
    );

    return (
      <div style={containerStyle}>
        {layout_style === "modern" ? renderModern() : renderClassic()}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center min-vh-100 d-flex align-items-center">
        <Spinner animation="border" className="me-2" />
        <p>Loading certificate...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <AlertCircle className="mb-2 d-block mx-auto" />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!certificate || !template) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          Certificate data could not be loaded.
        </Alert>
      </Container>
    );
  }

  const statusVariant = certificate.status === "valid" ? "success" : "danger";
  const statusIcon =
    certificate.status === "valid" ? (
      <CheckCircle className="me-1" />
    ) : (
      <AlertCircle className="me-1" />
    );

  return (
    <Container className="py-5" style={{ maxWidth: "1200px" }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold text-dark fs-3">Certificate Details</h1>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-1 rounded-pill px-4"
            onClick={() => navigate(`/dashboard/edit/${certificate.id}`)}
          >
            <Edit3 size={18} />
            Edit
          </Button>
          <Button
            variant="success"
            className="d-flex align-items-center gap-1 rounded-pill px-4"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Spinner size="sm" className="me-1" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PDF
              </>
            )}
          </Button>
          <Button
            variant="info"
            className="d-flex align-items-center gap-1 rounded-pill px-4"
            onClick={() => setShowFullscreen(true)}
          >
            <Maximize2 size={18} />
            Fullscreen
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden mb-4">
        <div className="p-4 bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <span
              className={`badge bg-${statusVariant} fs-6 fw-semibold px-3 py-2`}
            >
              {statusIcon} {certificate.status.toUpperCase()}
            </span>
            <small className="text-muted">
              Verification ID:{" "}
              <code className="bg-secondary bg-opacity-10 px-2 py-1 rounded">
                {certificate.verification_id}
              </code>
            </small>
          </div>
        </div>
        <div style={{ aspectRatio: "1.414 / 1" }}>
          <CertificateDisplay />
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Modal
        show={showFullscreen}
        onHide={() => setShowFullscreen(false)}
        size="xl"
        centered
        className="p-0"
      >
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="fw-bold fs-4">
            Certificate Fullscreen View
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-0 bg-black d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <CertificateDisplay isFullscreen={true} />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ViewCertificatePage;
