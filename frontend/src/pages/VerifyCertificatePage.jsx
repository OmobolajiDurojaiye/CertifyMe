import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Image,
  Spinner,
} from "react-bootstrap";
import { verifyCertificate } from "../api";
import QRCode from "react-qr-code";

function VerifyCertificatePage() {
  const { verificationId: paramId } = useParams();
  const [verificationId, setVerificationId] = useState(paramId || "");
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (idToVerify) => {
    if (!idToVerify) return;
    setError("");
    setCertificate(null);
    setLoading(true);
    try {
      const response = await verifyCertificate(idToVerify);
      setCertificate(response.data.certificate);
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

  const CertificatePreview = () => {
    if (!certificate) return null;

    return (
      <Card
        className="mt-4 shadow-lg"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <div
          style={{
            background: certificate.template?.background_url
              ? `url(http://127.0.0.1:5000${certificate.template.background_url}) no-repeat center/cover`
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            padding: "40px",
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: certificate.template?.font_family || "Georgia, serif",
          }}
        >
          {certificate.template?.logo_url && (
            <Image
              src={`http://127.0.0.1:5000${certificate.template.logo_url}`}
              width={100}
              className="mb-3 mx-auto"
              rounded
              style={{ opacity: 0.9 }}
            />
          )}
          <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
            <h1
              style={{
                color: certificate.template?.primary_color || "#2563EB",
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
                  color: certificate.template?.primary_color || "#2563EB",
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
    );
  };

  return (
    <Container className="py-5" style={{ maxWidth: "800px" }}>
      <h2 className="fw-bold mb-4 text-center text-dark">Verify Certificate</h2>
      <p className="text-muted mb-4 text-center">
        Enter the Verification ID or scan the QR code to verify the authenticity
        of a certificate.
      </p>
      {error && (
        <Alert variant="danger" className="rounded-3">
          {error}
        </Alert>
      )}
      <Card className="p-4 shadow-sm" style={{ borderRadius: "12px" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
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
              borderRadius: "8px",
              padding: "10px",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Verifying...
              </>
            ) : (
              "Verify Certificate"
            )}
          </Button>
        </Form>
      </Card>
      <CertificatePreview />
    </Container>
  );
}

export default VerifyCertificatePage;
