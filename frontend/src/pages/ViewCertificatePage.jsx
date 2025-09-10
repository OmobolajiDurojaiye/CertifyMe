// frontend/src/pages/ViewCertificatePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Alert, Spinner } from "react-bootstrap";
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
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const CertificateDisplay = () => {
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
    const issueDateFormatted = new Date(issue_date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

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
      case "corporate":
        return (
          <div
            className="flex flex-col h-full shadow-lg rounded-xl overflow-hidden bg-white border border-gray-300"
            style={{ fontFamily: font_family, ...backgroundStyle }}
          >
            <div
              className="p-4 text-center"
              style={{ backgroundColor: secondary_color }}
            >
              {logo_url && (
                <img
                  src={`${serverUrl}${logo_url}`}
                  alt="Logo"
                  className="mx-auto"
                  style={{ width: 150, height: 60, objectFit: "contain" }}
                />
              )}
            </div>
            <div className="flex-grow p-8 text-center relative">
              <h1
                className="font-bold mb-4"
                style={{ fontSize: "2rem", color: primary_color }}
              >
                CERTIFICATE OF COMPLETION
              </h1>
              <p className="mb-2" style={textStyle}>
                Awarded to
              </p>
              <h2
                className="font-bold mb-4"
                style={{ fontSize: "2.5rem", ...textStyle }}
              >
                {recipient_name}
              </h2>
              <p className="mb-2" style={textStyle}>
                For successfully completing
              </p>
              <p
                className="font-bold mb-6"
                style={{ fontSize: "1.5rem", color: secondary_color }}
              >
                {course_title}
              </p>
              <div className="flex justify-between mt-8">
                <div style={textStyle}>
                  <p>Date: {issueDateFormatted}</p>
                  <p>Signature: {signature || issuer_name}</p>
                </div>
                <div className="bg-white p-1 rounded-md">
                  <QRCode
                    value={`${window.location.origin}/verify/${verification_id}`}
                    size={60}
                  />
                </div>
              </div>
            </div>
            <div
              className="p-2 text-center text-white"
              style={{ backgroundColor: primary_color }}
            >
              <p className="text-sm">Verification ID: {verification_id}</p>
            </div>
          </div>
        );
      case "creative":
        return (
          <div
            className="h-full shadow-lg rounded-xl overflow-hidden relative"
            style={{
              fontFamily: font_family,
              background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
              ...backgroundStyle,
            }}
          >
            <div className="p-8 text-center h-full flex flex-col justify-center">
              {logo_url && (
                <img
                  src={`${serverUrl}${logo_url}`}
                  alt="Logo"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4"
                  style={{ borderColor: body_font_color, objectFit: "cover" }}
                />
              )}
              <h1
                className="font-bold uppercase mb-2"
                style={{ fontSize: "2.25rem", color: body_font_color }}
              >
                Certificate
              </h1>
              <h2
                className="font-extrabold mb-3"
                style={{
                  fontSize: "3rem",
                  color: "#fff",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {recipient_name}
              </h2>
              <p style={{ color: "#fff" }}>Completed</p>
              <p
                className="font-bold mb-4"
                style={{ fontSize: "1.75rem", color: body_font_color }}
              >
                {course_title}
              </p>
              <div className="flex justify-between items-end mt-auto">
                <div style={{ color: "#fff" }}>
                  <p className="mb-0">Date: {issueDateFormatted}</p>
                  <p className="mb-0">Issued by: {issuer_name}</p>
                  <p className="mb-0">Signature: {signature || issuer_name}</p>
                  <p className="mb-0">Verification ID: {verification_id}</p>
                </div>
                <div className="bg-white p-1 rounded">
                  <QRCode
                    value={`${window.location.origin}/verify/${verification_id}`}
                    size={80}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unsupported layout</div>;
    }
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

  if (!certificate || !template) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Certificate or Template data could not be loaded.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: "1000px" }}>
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
      <div className="bg-light p-4 p-md-5 rounded-3">
        <div className="shadow-lg" style={{ aspectRatio: "1.414 / 1" }}>
          <CertificateDisplay />
        </div>
      </div>
      <div className="text-center bg-white p-3 mt-3 rounded-3 shadow-sm">
        <span
          className={`text-${
            certificate.status === "valid" ? "success" : "danger"
          } fw-bold`}
        >
          Status: {certificate.status.toUpperCase()}
        </span>
        <span className="mx-3 text-muted">|</span>
        <span className="text-muted">
          Verification ID: {certificate.verification_id}
        </span>
      </div>
    </Container>
  );
}

export default ViewCertificatePage;
