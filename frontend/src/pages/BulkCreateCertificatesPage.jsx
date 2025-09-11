// BulkCreateCertificatesPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Modal,
} from "react-bootstrap";
import { getTemplates, bulkCreateCertificates } from "../api";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import QRCode from "react-qr-code";
import { Maximize2, X } from "lucide-react";
import { SERVER_BASE_URL } from "../config";

const CertificatePreview = ({ template, formData, onFullscreen }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!template) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3 p-4">
        <p className="text-muted mb-0">
          No templates available. Please create a template first.
        </p>
      </div>
    );
  }
  if (!formData || formData.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3 p-4">
        <p className="text-muted mb-0">Upload a CSV to see a preview</p>
      </div>
    );
  }

  const serverUrl = SERVER_BASE_URL;
  const {
    layout_style,
    primary_color = "#0284C7",
    secondary_color = "#3B82F6",
    body_font_color = "#1F2937",
    font_family = "serif",
    background_url,
    logo_url,
  } = template;
  const {
    recipient_name = "Recipient Name",
    course_title = "Course Title",
    issue_date = "MM/DD/YYYY",
    signature = "Signature",
    issuer_name = "Issuer Name",
    verification_id = "pending",
  } = formData[0] || {};

  const textStyle = { color: body_font_color, fontFamily: font_family };
  const backgroundStyle = {
    backgroundImage: background_url
      ? `url(${serverUrl}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const containerClass = isFullscreen
    ? "position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-4 bg-dark bg-opacity-75 z-index-1050"
    : "shadow-lg rounded-3 overflow-hidden";

  const handleFullscreenToggle = () => {
    if (onFullscreen) onFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  const PreviewContent = () => (
    <div
      className={`position-relative ${containerClass}`}
      style={{
        aspectRatio: "1.414 / 1",
        width: isFullscreen ? "90vw" : "100%",
        maxHeight: isFullscreen ? "90vh" : "400px",
        ...backgroundStyle,
      }}
    >
      {!isFullscreen && (
        <button
          className="position-absolute top-2 end-2 btn btn-sm btn-light z-3"
          onClick={handleFullscreenToggle}
          title="Fullscreen"
        >
          <Maximize2 size={16} />
        </button>
      )}
      {isFullscreen && (
        <button
          className="position-absolute top-4 end-4 btn btn-sm btn-light z-3"
          onClick={handleFullscreenToggle}
          title="Exit Fullscreen"
        >
          <X size={24} />
        </button>
      )}
      {layout_style === "classic" && (
        <>
          <div
            className="position-relative w-100 h-100 bg-white d-flex flex-column overflow-hidden"
            style={{
              border: `8px double ${primary_color}`,
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
            <div className="flex-grow d-flex flex-column justify-content-center align-items-center text-center p-4">
              {logo_url && (
                <img
                  src={`${serverUrl}${logo_url}`}
                  alt="Logo"
                  className="mb-3 rounded shadow-sm"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "contain",
                    border: `2px solid ${secondary_color}`,
                    borderRadius: "8px",
                  }}
                />
              )}
              <h1
                className="fw-bold mb-3 text-uppercase"
                style={{
                  fontSize: "2rem",
                  color: primary_color,
                  letterSpacing: "0.05em",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                Certificate of Completion
              </h1>
              <p
                className="mb-2 fst-italic"
                style={{ fontSize: "1.1rem", color: "#4B5EAA" }}
              >
                This is to certify that
              </p>
              <h2
                className="fw-bolder mb-3"
                style={{
                  fontSize: "2.5rem",
                  fontFamily: "'Georgia', serif",
                  ...textStyle,
                }}
              >
                {recipient_name}
              </h2>
              <p
                className="mb-2 fst-italic"
                style={{ fontSize: "1.1rem", color: "#4B5EAA" }}
              >
                has successfully completed the course
              </p>
              <p
                className="fw-bold mb-4 text-uppercase"
                style={{
                  fontSize: "1.5rem",
                  color: secondary_color,
                  letterSpacing: "0.03em",
                }}
              >
                {course_title}
              </p>
              <div className="d-flex justify-content-around w-100 mt-4">
                <div className="text-center">
                  <p className="fw-semibold mb-1" style={textStyle}>
                    {issue_date}
                  </p>
                  <hr
                    className="w-75 mx-auto my-1"
                    style={{ borderTop: `2px solid ${primary_color}` }}
                  />
                  <small className="text-muted">Date</small>
                </div>
                <div className="text-center">
                  <p className="fw-semibold mb-1" style={textStyle}>
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
                className="position-absolute bottom-0 end-0 m-3 bg-white p-2 rounded shadow"
                style={{ width: "80px", height: "80px" }}
              >
                <QRCode
                  value={`${window.location.origin}/verify/${verification_id}`}
                  size={70}
                  viewBox="0 0 70 70"
                />
              </div>
              <small
                className="position-absolute bottom-0 start-0 m-3 text-muted fw-medium"
                style={textStyle}
              >
                Issued by: {issuer_name}
              </small>
            </div>
          </div>
        </>
      )}
      {layout_style === "modern" && (
        <div
          className="d-flex w-100 h-100 shadow-lg rounded-3 overflow-hidden text-white"
          style={{
            border: `6px solid ${primary_color}`,
            background: `rgba(255,255,255,0.05)`,
            fontFamily: font_family,
            ...backgroundStyle,
          }}
        >
          <div
            className="d-flex flex-column justify-content-between align-items-center p-4 bg-gradient"
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
                  className="rounded-circle border-4 border-white shadow mb-2"
                  style={{
                    width: "6rem",
                    height: "6rem",
                    objectFit: "cover",
                  }}
                />
              )}
              <p
                className="fw-bold text-uppercase small"
                style={{ letterSpacing: "0.1em", color: "white" }}
              >
                {issuer_name}
              </p>
            </div>
            <div
              className="bg-white p-2 rounded shadow-sm"
              style={{ width: "90px", height: "90px" }}
            >
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={80}
                viewBox="0 0 80 80"
              />
            </div>
          </div>
          <div className="flex-grow p-5 d-flex flex-column justify-content-center position-relative">
            <h1
              className="fw-light text-uppercase mb-3"
              style={{
                fontSize: "1.5rem",
                letterSpacing: "0.15em",
                color: primary_color,
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Certificate of Achievement
            </h1>
            <h2
              className="fw-bolder mb-2"
              style={{
                fontSize: "3rem",
                fontFamily: "'Georgia', serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                ...textStyle,
              }}
            >
              {recipient_name}
            </h2>
            <p
              className="mb-2 fst-italic"
              style={{ fontSize: "1.1rem", color: "#E5E7EB" }}
            >
              has successfully completed
            </p>
            <p
              className="fw-bold mb-4 text-uppercase"
              style={{
                fontSize: "1.4rem",
                letterSpacing: "0.05em",
                color: secondary_color,
              }}
            >
              {course_title}
            </p>
            <div
              className="d-flex justify-content-between mt-auto pt-3 border-top"
              style={{
                borderColor: primary_color,
                color: "#E5E7EB",
                fontSize: "0.95rem",
              }}
            >
              <div>
                <p className="mb-1">Date: {issue_date}</p>
                <p className="mb-0">Signature: {signature || issuer_name}</p>
              </div>
              <p className="mb-0">ID: {verification_id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <Modal
        show={true}
        onHide={() => setIsFullscreen(false)}
        size="xl"
        centered
      >
        <Modal.Body className="p-0 border-0 bg-transparent">
          <PreviewContent />
        </Modal.Body>
      </Modal>
    );
  }

  return <PreviewContent />;
};

const BulkCreateCertificatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFullscreen, setShowFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getTemplates();
        setTemplates(response.data);
      } catch (err) {
        setError("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id == templateId);
    setSelectedTemplate(template);
    setSelectedTemplateId(templateId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        complete: (results) => {
          const headers = results.data[0];
          const data = results.data.slice(1).map((row) => {
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index] || "";
            });
            return rowData;
          });
          setCsvData(data);
          setError("");
        },
        header: false,
        skipEmptyLines: true,
        error: () => {
          setError("Failed to parse CSV file.");
          setCsvData([]);
        },
      });
    } else {
      setCsvData([]);
      setCsvFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !csvFile || csvData.length === 0) {
      setError("Please select a template and upload a valid CSV file.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const formDataToSend = new FormData();
    formDataToSend.append("template_id", selectedTemplateId);
    formDataToSend.append("file", csvFile);

    try {
      const response = await bulkCreateCertificates(formDataToSend);
      setSuccess(`Successfully created ${response.data.created} certificates!`);
      setCsvData([]);
      setCsvFile(null);
      e.target.querySelector('input[type="file"]').value = null;
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error("Bulk create error:", err);
      setError(
        err.response?.data?.msg ||
          "Failed to create certificates. Please ensure the CSV is valid and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Loading templates...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Bulk Create Certificates</h2>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold fs-5 mb-4">Upload Data</Card.Title>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-3">
                  {success}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Select Template</Form.Label>
                  <Form.Select
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                    className="rounded-3"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} {template.is_public && "(System)"}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Upload CSV</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    id="csvFile"
                    onChange={handleFileChange}
                    className="rounded-3"
                  />
                  <Form.Text className="text-muted d-block mt-1">
                    Columns: recipient_name, recipient_email, course_title,
                    issuer_name, issue_date, signature (optional)
                  </Form.Text>
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={
                    submitting || !selectedTemplateId || csvData.length === 0
                  }
                  className="w-100 rounded-3 py-2 fw-semibold"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    "Create Certificates"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-8">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="fw-bold fs-5 mb-0">Preview</Card.Title>
                {selectedTemplate && csvData.length > 0 && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowFullscreen(true)}
                  >
                    <Maximize2 size={16} className="me-1" /> Fullscreen
                  </button>
                )}
              </div>
              <div
                className="bg-light rounded-3 p-3 d-flex justify-content-center align-items-center"
                style={{ height: "400px" }}
              >
                <CertificatePreview
                  template={selectedTemplate}
                  formData={csvData}
                  onFullscreen={() => setShowFullscreen(true)}
                />
              </div>
            </Card.Body>
          </Card>
          {csvData.length > 0 && (
            <Card className="shadow-sm border-0 mt-4">
              <Card.Body className="p-4">
                <Card.Title className="fw-bold fs-5 mb-3">
                  Uploaded Data ({csvData.length} rows)
                </Card.Title>
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Recipient Name</th>
                        <th>Email</th>
                        <th>Course Title</th>
                        <th>Issuer Name</th>
                        <th>Issue Date</th>
                        <th>Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          <td>{row.recipient_name || "N/A"}</td>
                          <td>{row.recipient_email || "N/A"}</td>
                          <td>{row.course_title || "N/A"}</td>
                          <td>{row.issuer_name || "N/A"}</td>
                          <td>{row.issue_date || "N/A"}</td>
                          <td>{row.signature || "N/A"}</td>
                        </tr>
                      ))}
                      {csvData.length > 5 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            ... and {csvData.length - 5} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
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
        <Modal.Body className="p-0 bg-dark">
          <CertificatePreview
            template={selectedTemplate}
            formData={csvData}
            onFullscreen={() => setShowFullscreen(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default BulkCreateCertificatesPage;
