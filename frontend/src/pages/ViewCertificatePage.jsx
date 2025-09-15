import React, { useState, useEffect, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Alert,
  Spinner,
  Modal,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import {
  getCertificate,
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
  RefreshCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>
            {this.state.error?.message ||
              "An error occurred while rendering the certificate."}
          </p>
        </Alert>
      );
    }
    return this.props.children;
  }
}

const CertificateDisplay = ({ certificate, template }) => {
  if (!certificate || !template)
    return (
      <div className="text-center p-4 text-muted">Loading certificate...</div>
    );

  const {
    layout_style,
    primary_color = "#2563EB",
    secondary_color = "#64748B",
    body_font_color = "#333333",
    font_family = "Georgia",
    background_url,
    logo_url,
    custom_text = {
      title: "Certificate of Completion",
      body: "has successfully completed the course",
    },
  } = template;

  console.log(`Rendering certificate with layout_style: ${layout_style}`);

  const {
    recipient_name,
    course_title,
    issue_date,
    signature,
    issuer_name,
    verification_id,
    extra_fields = {},
    status,
  } = certificate;

  const issueDateFormatted = new Date(issue_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const textStyle = {
    color: body_font_color,
    fontFamily: font_family,
  };

  const backgroundStyle = background_url
    ? {
        backgroundImage: `url(${SERVER_BASE_URL}${background_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

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
          {custom_text.title}
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
          {custom_text.body}
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
        {Object.keys(extra_fields).length > 0 && (
          <div
            className="mx-auto my-3 text-start"
            style={{
              width: "80%",
              borderLeft: `3px solid ${primary_color}`,
              paddingLeft: "1rem",
              fontSize: "1rem",
              color: "#4B5563",
            }}
          >
            {Object.entries(extra_fields).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-bold uppercase">
                  {key.replace(/_/g, " ")}:
                </span>
                <span> {value}</span>
              </div>
            ))}
          </div>
        )}
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
            value={`https://certifyme.com.ng/verify/${verification_id}`}
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
            value={`https://certifyme.com.ng/verify/${verification_id}`}
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
          {custom_text.title}
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
          {custom_text.body}
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
        {Object.keys(extra_fields).length > 0 && (
          <div
            className="my-3 text-start"
            style={{
              borderLeft: `3px solid ${primary_color}`,
              paddingLeft: "1rem",
              fontSize: "1rem",
              color: "#4B5563",
            }}
          >
            {Object.entries(extra_fields).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-bold uppercase">
                  {key.replace(/_/g, " ")}:
                </span>
                <span> {value}</span>
              </div>
            ))}
          </div>
        )}
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

function ViewCertificatePage() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const statusVariant = certificate?.status === "valid" ? "success" : "danger";
  const statusIcon =
    certificate?.status === "valid" ? (
      <CheckCircle size={16} className="me-1" />
    ) : (
      <AlertCircle size={16} className="me-1" />
    );

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await getCertificate(certId);
        setCertificate(response.data.certificate);
        setTemplate(response.data.template);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Could not fetch certificate details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [certId]);

  const handleDownloadPDF = () => {
    setDownloading(true);
    const promise = getCertificatePDF(certId);
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
        return "Download started!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download PDF.",
    });
    promise.finally(() => setDownloading(false));
  };

  const handleStatusChange = (status) => {
    const promise = updateCertificateStatus(certId, status);
    toast.promise(promise, {
      loading: `Updating status to ${status}...`,
      success: () => {
        setCertificate((prev) => ({ ...prev, status }));
        return `Certificate ${status} successfully!`;
      },
      error: (err) => err.response?.data?.msg || "Failed to update status.",
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const issueDateFormatted = new Date(
    certificate.issue_date
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <Container className="py-5">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h1 className="text-3xl font-bold text-gray-900">
                Certificate Details
              </h1>
              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  className="d-flex align-items-center gap-1"
                  onClick={() => navigate(`/dashboard/edit/${certId}`)}
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
                      <RefreshCw size={14} className="me-1" /> Revoke
                      Certificate
                    </Button>
                  ) : (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleStatusChange("valid")}
                    >
                      <RefreshCw size={14} className="me-1" /> Re-validate
                      Certificate
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>

            <div
              className="shadow-lg rounded-3 overflow-hidden mb-4"
              style={{ aspectRatio: "1.414 / 1" }}
            >
              <CertificateDisplay
                certificate={certificate}
                template={template}
              />
            </div>

            <Modal
              show={showFullscreen}
              onHide={() => setShowFullscreen(false)}
              size="xl"
              centered
              dialogClassName="modal-fullscreen"
            >
              <Modal.Body className="p-0" style={{ aspectRatio: "1.414 / 1" }}>
                <CertificateDisplay
                  certificate={certificate}
                  template={template}
                />
              </Modal.Body>
              <Button
                variant="light"
                onClick={() => setShowFullscreen(false)}
                className="position-absolute top-0 end-0 m-3 z-3 rounded-circle p-2"
              >
                <X size={24} />
              </Button>
            </Modal>

            <Card className="shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="fw-bold mb-3">Certificate Information</h5>
                    <dl className="row mb-0">
                      <dt className="col-sm-4">Recipient:</dt>
                      <dd className="col-sm-8">{certificate.recipient_name}</dd>
                      <dt className="col-sm-4">Email:</dt>
                      <dd className="col-sm-8">
                        {certificate.recipient_email}
                      </dd>
                      <dt className="col-sm-4">Course:</dt>
                      <dd className="col-sm-8">{certificate.course_title}</dd>
                      <dt className="col-sm-4">Issue Date:</dt>
                      <dd className="col-sm-8">{issueDateFormatted}</dd>
                      <dt className="col-sm-4">Issuer:</dt>
                      <dd className="col-sm-8">{certificate.issuer_name}</dd>
                      <dt className="col-sm-4">Status:</dt>
                      <dd className="col-sm-8">
                        <span className={`badge bg-${statusVariant}`}>
                          {certificate.status.toUpperCase()}
                        </span>
                      </dd>
                    </dl>
                  </Col>
                  <Col md={6}>
                    <h5 className="fw-bold mb-3">Verification</h5>
                    <div className="text-center">
                      <QRCode
                        value={`https://certifyme.com.ng/verify/${certificate.verification_id}`}
                        size={128}
                        className="mb-2"
                      />
                      <p className="mb-2">
                        <a
                          href={`https://certifyme.com.ng/verify/${certificate.verification_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          Verify Online
                        </a>
                      </p>
                      <small className="text-muted">
                        Verification ID: {certificate.verification_id}
                      </small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </ErrorBoundary>
  );
}

export default ViewCertificatePage;
