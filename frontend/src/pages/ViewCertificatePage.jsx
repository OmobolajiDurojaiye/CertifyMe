import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";
import { getCertificate, getTemplate, getCertificatePDF } from "../api";
import QRCode from "react-qr-code";

function ViewCertificatePage() {
  const { certId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        const certResponse = await getCertificate(certId);
        const certData = certResponse.data;
        setCertificate(certData);

        const templateResponse = await getTemplate(certData.template_id);
        setTemplate(templateResponse.data);
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
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `certificate_${certificate.verification_id}.pdf`
      );
      // Append to html
      document.body.appendChild(link);
      // Start download
      link.click();
      // Clean up and remove the link
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !certificate || !template) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="rounded-3">
          {error || "Certificate or template not found."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: "900px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Certificate Details</h2>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => navigate(`/dashboard/edit/${certificate.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="success"
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              border: "none",
            }}
          >
            {downloading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Downloading...
              </>
            ) : (
              "Download PDF"
            )}
          </Button>
        </div>
      </div>
      <Card
        className="shadow-lg"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <div
          style={{
            background: template.background_url
              ? `url(http://127.0.0.1:5000${template.background_url}) no-repeat center/cover`
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            padding: "40px",
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: template.font_family || "Georgia, serif",
          }}
        >
          {template.logo_url && (
            <Image
              src={`http://127.0.0.1:5000${template.logo_url}`}
              width={100}
              className="mb-3 mx-auto"
              rounded
              style={{ opacity: 0.9 }}
            />
          )}
          <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
            <h1
              style={{
                color: template.primary_color || "#2563EB",
                fontSize: "2em",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              Certificate of Achievement
            </h1>
            <p style={{ fontSize: "1.2em", color: "#444" }}>
              Awarded to <strong>{certificate.recipient_name}</strong>
            </p>
            <p style={{ fontSize: "1em", color: "#666" }}>
              For successfully completing{" "}
              <strong>{certificate.course_title}</strong>
            </p>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              Issued on {new Date(certificate.issue_date).toLocaleDateString()}
            </p>
            {certificate.signature && (
              <div
                style={{
                  fontSize: "1em",
                  color: template.primary_color || "#2563EB",
                  borderTop: "1px solid #ddd",
                  paddingTop: "10px",
                  width: "250px",
                  textAlign: "left",
                  margin: "20px auto 0",
                }}
              >
                Signed: {certificate.signature}
              </div>
            )}
            <div
              style={{
                fontSize: "0.9em",
                color: "#6c757d",
                background: "rgba(255,255,255,0.85)",
                padding: "8px 12px",
                borderRadius: "6px",
                textAlign: "right",
                marginTop: "20px",
              }}
            >
              Verification ID: {certificate.verification_id}
            </div>
          </div>
          <div className="mt-3 text-center">
            <QRCode
              value={`${window.location.origin}/verify/${certificate.verification_id}`}
              size={80}
            />
          </div>
        </div>
        <Card.Footer className="text-center">
          <span
            className={`text-${
              certificate.status === "valid" ? "success" : "danger"
            } fw-bold`}
          >
            Status: {certificate.status.toUpperCase()}
          </span>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default ViewCertificatePage;
