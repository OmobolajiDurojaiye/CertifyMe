import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";
import { getTemplates, bulkCreateCertificates } from "../api";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import QRCode from "react-qr-code";

const CertificatePreview = ({ template, formData }) => {
  if (!template) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3">
        <p className="text-muted">
          No templates available. Please create a template first.
        </p>
      </div>
    );
  }
  if (!formData || formData.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3">
        <p className="text-muted">Upload a CSV to see a preview</p>
      </div>
    );
  }

  const serverUrl = "http://127.0.0.1:5000"; // Define server URL
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
    recipient_name = "Recipient Name",
    course_title = "Course Title",
    issue_date = "MM/DD/YYYY",
    signature = "Signature",
    issuer_name = "Issuer Name",
    verification_id = "pending",
  } = formData[0] || {};

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
    case "classic":
      return (
        <div
          className="h-full shadow-xl rounded-xl overflow-hidden bg-white relative"
          style={{ border: `8px double ${primary_color}`, ...backgroundStyle }}
        >
          <div
            style={{
              borderBottom: `4px solid ${primary_color}`,
              background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
            }}
          ></div>
          <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
            {logo_url && (
              <img
                src={`${serverUrl}${logo_url}`}
                alt="Logo"
                className="mb-6"
                style={{
                  width: 140,
                  height: 140,
                  objectFit: "contain",
                  border: `2px solid ${secondary_color}`,
                  borderRadius: "10px",
                }}
              />
            )}
            <h1
              className="font-bold mb-4"
              style={{
                fontSize: "2.5rem",
                color: primary_color,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Certificate of Completion
            </h1>
            <p
              className="text-blue-700 mb-2 italic"
              style={{ fontSize: "1.2rem" }}
            >
              This is to certify that
            </p>
            <h2
              className="font-extrabold mb-4"
              style={{
                fontSize: "3rem",
                fontFamily: "'Georgia', serif",
                ...textStyle,
              }}
            >
              {recipient_name}
            </h2>
            <p
              className="text-blue-700 mb-2 italic"
              style={{ fontSize: "1.2rem" }}
            >
              has successfully completed the course
            </p>
            <p
              className="font-bold mb-6"
              style={{
                fontSize: "1.8rem",
                color: secondary_color,
                textTransform: "uppercase",
              }}
            >
              {course_title}
            </p>
            <div className="flex justify-around w-full mt-6">
              <div className="text-center">
                <p
                  className="font-semibold mb-0"
                  style={{ ...textStyle, fontSize: "1.1rem" }}
                >
                  {issue_date}
                </p>
                <hr
                  className="w-3/5 mx-auto my-2"
                  style={{ borderColor: primary_color }}
                />
                <span className="text-gray-500 text-sm">Date</span>
              </div>
              <div className="text-center">
                <p
                  className="font-semibold mb-0"
                  style={{ ...textStyle, fontSize: "1.1rem" }}
                >
                  {signature || issuer_name}
                </p>
                <hr
                  className="w-3/5 mx-auto my-2"
                  style={{ borderColor: primary_color }}
                />
                <span className="text-gray-500 text-sm">Signature</span>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 bg-white p-1 rounded-md shadow-md">
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={90}
              />
            </div>
            <p
              className="absolute bottom-6 left-6 font-medium"
              style={{ ...textStyle, fontSize: "1.1rem" }}
            >
              Issued by: {issuer_name}
            </p>
            <p
              className="absolute bottom-3 left-6 text-gray-500"
              style={{ fontSize: "0.9rem" }}
            >
              Verification ID: {verification_id}
            </p>
          </div>
        </div>
      );
    case "modern":
      return (
        <div
          className="flex h-full shadow-xl rounded-xl overflow-hidden bg-gray-800 text-white border"
          style={{ borderColor: primary_color, ...backgroundStyle }}
        >
          <div
            className="w-[35%] p-8 flex flex-col justify-between items-center"
            style={{
              background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
              borderRight: `3px solid ${secondary_color}`,
            }}
          >
            <div className="text-center">
              {logo_url && (
                <img
                  src={`${serverUrl}${logo_url}`}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-lg"
                />
              )}
              <p
                className="font-bold text-center mt-4 text-lg uppercase tracking-wider"
                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.2)" }}
              >
                {issuer_name}
              </p>
            </div>
            <div className="bg-white p-1 rounded-lg shadow-md">
              <QRCode
                value={`${window.location.origin}/verify/${verification_id}`}
                size={100}
              />
            </div>
          </div>
          <div
            className="w-[65%] p-10 flex flex-col justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <h1
              className="text-2xl font-light uppercase tracking-[0.15em]"
              style={{
                color: primary_color,
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Certificate of Achievement
            </h1>
            <h2
              className="text-5xl font-extrabold my-3"
              style={{
                fontFamily: "'Georgia', serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {recipient_name}
            </h2>
            <p className="text-gray-200 text-lg italic">
              has successfully completed
            </p>
            <p
              className="text-xl font-semibold mt-2 uppercase tracking-wider"
              style={{ color: secondary_color }}
            >
              {course_title}
            </p>
            <div
              className="flex justify-between mt-10 text-base"
              style={{
                borderTop: `2px solid ${primary_color}`,
                paddingTop: "1rem",
              }}
            >
              <div>
                <p>Date: {issue_date}</p>
                <p>Signature: {signature || issuer_name}</p>
              </div>
              <p>Verification ID: {verification_id}</p>
            </div>
          </div>
        </div>
      );
    default:
      return <div>Unsupported layout</div>;
  }
};

function BulkCreateCertificatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getTemplates();
        const validTemplates = response.data.filter((t) =>
          ["classic", "modern"].includes(t.layout_style)
        );
        setTemplates(validTemplates);
        const defaultTemplate =
          validTemplates.find(
            (t) => t.is_public && t.title === "Default Classic"
          ) ||
          validTemplates.find((t) => t.is_public) ||
          validTemplates[0];
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
          setSelectedTemplateId(defaultTemplate.id);
        }
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
        complete: (result) => {
          if (!result.data || result.data.length < 2) {
            setError("Invalid CSV format or empty file.");
            setCsvData([]);
            return;
          }
          const headers = result.data[0].map((header) =>
            header.toLowerCase().trim()
          );
          const requiredHeaders = [
            "recipient_name",
            "recipient_email",
            "course_title",
            "issuer_name",
            "issue_date",
          ];
          if (!requiredHeaders.every((header) => headers.includes(header))) {
            setError(
              "CSV must include columns: recipient_name, recipient_email, course_title, issuer_name, issue_date"
            );
            setCsvData([]);
            return;
          }
          const data = result.data
            .slice(1)
            .filter((row) => row.some((cell) => cell.trim() !== ""))
            .map((row) => {
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index] || "";
              });
              return rowData;
            });
          setCsvData(data);
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

    const formData = new FormData();
    formData.append("template_id", selectedTemplateId);
    formData.append("file", csvFile);

    try {
      const response = await bulkCreateCertificates(formData);
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
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">Bulk Create Certificates</h2>
      <div className="row">
        <div className="col-lg-4">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Upload Certificate Data</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Template</Form.Label>
                  <Form.Select
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} {template.is_public && "(System)"}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Upload CSV File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    id="csvFile"
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    CSV must have columns: recipient_name, recipient_email,
                    course_title, issuer_name, issue_date, signature (optional)
                  </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={submitting}>
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
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Preview</Card.Title>
              <div style={{ aspectRatio: "1.414 / 1", height: "400px" }}>
                <CertificatePreview
                  template={selectedTemplate}
                  formData={csvData}
                />
              </div>
            </Card.Body>
          </Card>
          {csvData.length > 0 && (
            <Card className="shadow-sm mt-4">
              <Card.Body>
                <Card.Title>Uploaded Data</Card.Title>
                <Table striped bordered hover responsive>
                  <thead>
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
                    {csvData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.recipient_name}</td>
                        <td>{row.recipient_email}</td>
                        <td>{row.course_title}</td>
                        <td>{row.issuer_name}</td>
                        <td>{row.issue_date}</td>
                        <td>{row.signature || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}

export default BulkCreateCertificatesPage;
