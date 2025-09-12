import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// --- THIS IS THE FIX ---
import {
  Container,
  Button,
  Alert,
  Spinner,
  Modal,
  Card,
} from "react-bootstrap";
// --- END OF FIX ---
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
  RefreshCcw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CertificateDisplay = ({ certificate, template }) => {
  if (!certificate || !template) return null;

  const {
    layout_style,
    primary_color,
    secondary_color,
    body_font_color,
    font_family,
    background_url,
    logo_url,
    custom_text,
  } = template;

  const certificateTitle = custom_text?.title || "Certificate of Completion";
  const certificateBody =
    custom_text?.body || "has successfully completed the course";

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
      ? `url(${SERVER_BASE_URL}${background_url})`
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
              src={`${SERVER_BASE_URL}${logo_url}`}
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
            {certificateTitle}
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
            {certificateBody}
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
              src={`${SERVER_BASE_URL}${logo_url}`}
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
          {certificateTitle}
        </h1>
        <h2
          className="fw-bold my-3"
          style={{ fontSize: "3.5rem", ...textStyle }}
        >
          {recipient_name}
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#555" }}>{certificateBody}</p>
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
      setLoading(true);
      try {
        const certResponse = await getCertificate(certId);
        setCertificate(certResponse.data);
        if (certResponse.data.template_id) {
          const templateResponse = await getTemplate(
            certResponse.data.template_id
          );
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
    const promise = getCertificatePDF(certificate.id);
    toast.promise(promise, {
      loading: "Generating PDF...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `certificate_${certificate.verification_id}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download starting!";
      },
      error: "Failed to download PDF.",
    });
    promise.finally(() => setDownloading(false));
  };

  const handleStatusChange = async (newStatus) => {
    const promise = updateCertificateStatus(certificate.id, newStatus);
    toast.promise(promise, {
      loading: "Updating status...",
      success: (res) => {
        setCertificate((prev) => ({ ...prev, status: newStatus }));
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to update status.",
    });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!certificate || !template) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Certificate or Template data is missing.
        </Alert>
      </Container>
    );
  }

  const statusVariant = certificate.status === "valid" ? "success" : "danger";
  const statusIcon =
    certificate.status === "valid" ? (
      <CheckCircle className="me-2" />
    ) : (
      <AlertCircle className="me-2" />
    );

  return (
    <Container className="py-5" style={{ maxWidth: "1200px" }}>
      <Toaster position="top-center" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-dark fs-3">Certificate Details</h1>
          <p className="text-muted">Review and manage this certificate.</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-1"
            onClick={() => navigate(`/dashboard/edit/${certificate.id}`)}
          >
            <Edit3 size={16} /> Edit
          </Button>
          <Button
            variant="success"
            className="d-flex align-items-center gap-1"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? <Spinner size="sm" /> : <Download size={16} />}{" "}
            Download PDF
          </Button>
          <Button
            variant="outline-secondary"
            className="d-flex align-items-center gap-1"
            onClick={() => setShowFullscreen(true)}
          >
            <Maximize2 size={16} /> Preview
          </Button>
        </div>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center p-3">
          <div>
            <span
              className={`badge bg-${statusVariant} fs-6 fw-semibold px-3 py-2`}
            >
              {statusIcon} Status: {certificate.status.toUpperCase()}
            </span>
          </div>
          <div>
            {certificate.status === "valid" ? (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleStatusChange("revoked")}
              >
                <RefreshCcw size={14} className="me-1" /> Revoke Certificate
              </Button>
            ) : (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleStatusChange("valid")}
              >
                <RefreshCcw size={14} className="me-1" /> Re-validate
                Certificate
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <div
        className="shadow-lg rounded-3 overflow-hidden"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        <CertificateDisplay certificate={certificate} template={template} />
      </div>

      <Modal
        show={showFullscreen}
        onHide={() => setShowFullscreen(false)}
        size="xl"
        centered
      >
        <Modal.Body className="p-0" style={{ aspectRatio: "1.414 / 1" }}>
          <CertificateDisplay certificate={certificate} template={template} />
        </Modal.Body>
        <Button
          variant="light"
          onClick={() => setShowFullscreen(false)}
          className="position-absolute top-0 end-0 m-3 z-3"
        >
          <X />
        </Button>
      </Modal>
    </Container>
  );
}

export default ViewCertificatePage;
