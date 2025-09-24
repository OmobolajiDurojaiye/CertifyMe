import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Table, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import QRCode from "react-qr-code";
import {
  Maximize2,
  X,
  Info,
  CheckCircle,
  Upload,
  Download,
} from "lucide-react";
import { SERVER_BASE_URL } from "../config";
import {
  getTemplates,
  bulkCreateCertificates,
  getGroups,
  createGroup,
  downloadBulkTemplate,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
// --- THIS IS THE NEW FEATURE ---
import KonvaPreview from "../components/KonvaPreview";
// --- END OF NEW FEATURE ---

const CertificatePreview = ({ template, formData }) => {
  if (!template) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3 p-4">
        <p className="text-muted mb-0">Select a template to see a preview.</p>
      </div>
    );
  }
  if (!formData || !formData.recipient_name) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3 p-4">
        <p className="text-muted mb-0">Upload a CSV to see a preview.</p>
      </div>
    );
  }

  // --- THIS IS THE NEW FEATURE ---
  // If the template is from the visual editor, render the Konva preview.
  if (template.layout_style === "visual") {
    return (
      <KonvaPreview layoutData={template.layout_data} dynamicData={formData} />
    );
  }
  // --- END OF NEW FEATURE ---

  const {
    layout_style,
    primary_color,
    secondary_color,
    body_font_color,
    font_family,
    background_url,
    logo_url,
    // --- THIS IS THE FIX ---
    custom_text,
  } = template;

  // Use custom text with fallbacks
  const certificateTitle = custom_text?.title || "Certificate of Completion";
  const certificateBody =
    custom_text?.body || "has successfully completed the course";
  // --- END OF FIX ---

  const {
    recipient_name = "Recipient Name",
    course_title = "Course Title",
    issue_date = "MM/DD/YYYY",
    signature = "Signature",
    issuer_name = "Issuer Name",
    verification_id = "pending",
  } = formData || {};

  const textStyle = { color: body_font_color, fontFamily: font_family };
  const backgroundStyle = {
    backgroundImage: background_url
      ? `url(${SERVER_BASE_URL}${background_url})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const renderModern = () => (
    <div
      className="flex h-100 w-100 shadow-lg rounded-xl overflow-hidden text-black"
      style={{
        border: `6px solid ${primary_color}`,
        ...backgroundStyle,
        fontFamily: font_family,
      }}
    >
      <div
        className="flex flex-col justify-between items-center p-4 text-white"
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
            value={`${window.location.origin}/verify/${verification_id}`}
            size={72}
            viewBox="0 0 72 72"
          />
        </div>
      </div>
      <div className="flex-grow p-4 flex flex-col justify-center relative bg-white bg-opacity-90">
        <h1
          className="font-light uppercase mb-3"
          style={{
            fontSize: "1.5rem",
            letterSpacing: "0.15em",
            color: primary_color,
          }}
        >
          {certificateTitle}
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
          {certificateBody}
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
        <div
          className="d-flex justify-content-between mt-auto pt-3 border-top"
          style={{ borderColor: primary_color, fontSize: "0.9rem" }}
        >
          <p>
            Date: {issue_date}
            <br />
            Signature: {signature || issuer_name}
          </p>
          <p>ID: {verification_id}</p>
        </div>
      </div>
    </div>
  );

  const renderClassic = () => (
    <div
      className="h-100 w-100 bg-white relative flex flex-col shadow-2xl rounded-xl overflow-hidden"
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
      <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
        {logo_url && (
          <img
            src={`${SERVER_BASE_URL}${logo_url}`}
            alt="Logo"
            className="mb-3"
            style={{ width: "120px", height: "120px", objectFit: "contain" }}
          />
        )}
        <h1
          className="font-bold uppercase tracking-wider"
          style={{ fontSize: "2rem", color: primary_color }}
        >
          {certificateTitle}
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
            fontSize: "2.5rem",
            fontFamily: "'Georgia', serif",
            ...textStyle,
          }}
        >
          {recipient_name}
        </h2>
        <p
          className="italic my-1"
          style={{ fontSize: "1.1rem", color: "#4B5EAA" }}
        >
          {certificateBody}
        </p>
        <p
          className="font-bold uppercase my-2"
          style={{ fontSize: "1.5rem", color: secondary_color }}
        >
          {course_title}
        </p>
        <div className="flex justify-around w-full mt-4">
          <div className="text-center">
            <p className="font-semibold mb-1" style={textStyle}>
              {issue_date}
            </p>
            <hr
              className="w-3/4 mx-auto my-1"
              style={{ borderColor: primary_color }}
            />
            <small className="text-muted">Date</small>
          </div>
          <div className="text-center">
            <p className="font-semibold mb-1" style={textStyle}>
              {signature || issuer_name}
            </p>
            <hr
              className="w-3/4 mx-auto my-1"
              style={{ borderColor: primary_color }}
            />
            <small className="text-muted">Signature</small>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-white p-1 rounded-md shadow">
          <QRCode
            value={`${window.location.origin}/verify/${verification_id}`}
            size={64}
            viewBox="0 0 64 64"
          />
        </div>
        <small
          className="absolute bottom-3 left-3 text-muted"
          style={textStyle}
        >
          Issued by: {issuer_name}
        </small>
      </div>
    </div>
  );

  return layout_style === "modern" ? renderModern() : renderClassic();
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
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templateRes, groupRes] = await Promise.all([
          getTemplates(),
          getGroups(),
        ]);
        setTemplates(templateRes.data.templates);
        setGroups(groupRes.data.groups);
      } catch (err) {
        setError("Failed to load initial data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    setSelectedTemplate(templates.find((t) => t.id == templateId));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    setSuccess("");
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const requiredHeaders = [
            "recipient_name",
            "recipient_email",
            "course_title",
            "issuer_name",
            "issue_date",
          ];
          const headers = Object.keys(result.data[0] || {}).map((h) =>
            h.toLowerCase().trim().replace(/\s+/g, "_")
          );
          if (!requiredHeaders.every((h) => headers.includes(h))) {
            setError(`CSV must include columns: ${requiredHeaders.join(", ")}`);
            setCsvData([]);
            return;
          }
          setCsvData(result.data);
        },
        error: () => {
          setError("Failed to parse CSV file.");
          setCsvData([]);
        },
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim())
      return toast.error("Please enter a name for the new group.");
    const promise = createGroup(newGroupName);
    toast.promise(promise, {
      loading: "Creating group...",
      success: (res) => {
        const newGroup = res.data.group;
        setGroups((prev) => [newGroup, ...prev]);
        setSelectedGroupId(newGroup.id);
        setNewGroupName("");
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to create group.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !csvFile || !selectedGroupId) {
      setError(
        "Please select a template, a group, and upload a valid CSV file."
      );
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    const formData = new FormData();
    formData.append("template_id", selectedTemplateId);
    formData.append("group_id", selectedGroupId);
    formData.append("file", csvFile);
    try {
      const response = await bulkCreateCertificates(formData);
      setSuccess(`${response.data.msg}. Redirecting to dashboard...`);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const promise = downloadBulkTemplate();
    toast.promise(promise, {
      loading: "Generating template...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "certifyme_bulk_template.csv");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Template download started!";
      },
      error: "Could not download template.",
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bulk Create Certificates
          </h2>
          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <Info className="me-2" />
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="d-flex align-items-center">
              <CheckCircle className="me-2" />
              {success}
            </Alert>
          )}
          <Form onSubmit={handleSubmit} className="space-y-4">
            <Form.Group>
              <Form.Label className="font-semibold">
                1. Select Template
              </Form.Label>
              <Form.Select
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                required
              >
                <option value="">Choose a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}{" "}
                    {t.is_public
                      ? "(System)"
                      : t.layout_style === "visual"
                      ? "(Visual)"
                      : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label className="font-semibold">
                2. Assign to Group
              </Form.Label>
              <Form.Select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                required
              >
                <option value="">Choose an existing group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Form.Select>
              <div className="mt-2 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Or create a new group..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button variant="secondary" onClick={handleCreateGroup}>
                  Create
                </Button>
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label className="font-semibold">
                3. Upload CSV File
              </Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
              />
              <Form.Text>
                Columns must include: recipient_name, recipient_email,
                course_title, issuer_name, issue_date
              </Form.Text>
              <div className="mt-2">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 d-flex align-items-center"
                  onClick={handleDownloadTemplate}
                >
                  <Download size={14} className="me-1" />
                  Download sample CSV template
                </Button>
              </div>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 py-3 font-semibold"
              disabled={
                submitting ||
                !selectedTemplateId ||
                !selectedGroupId ||
                csvData.length === 0
              }
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="me-2" />
                  Create {csvData.length > 0 ? csvData.length : ""} Certificates
                </>
              )}
            </Button>
          </Form>
        </div>
        <div className="col-span-12 lg:col-span-8 bg-gray-100 p-6 rounded-xl shadow-inner">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Live Preview (from first record)
            </h3>
            {selectedTemplate && csvData.length > 0 && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowFullscreen(true)}
              >
                <Maximize2 size={16} className="me-1" /> Fullscreen
              </Button>
            )}
          </div>
          <div className="w-full aspect-[1.414/1]">
            <CertificatePreview
              template={selectedTemplate}
              formData={csvData[0]}
            />
          </div>
          {csvData.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-3">
                Uploaded Data Preview (first 5 rows)
              </h4>
              <div className="overflow-auto rounded-lg shadow">
                <Table striped bordered hover responsive className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      {Object.keys(csvData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((val, i) => (
                          <td key={i}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        show={showFullscreen}
        onHide={() => setShowFullscreen(false)}
        size="xl"
        centered
      >
        <Modal.Body className="p-0">
          <CertificatePreview
            template={selectedTemplate}
            formData={csvData[0]}
          />
        </Modal.Body>
        <Button
          variant="light"
          onClick={() => setShowFullscreen(false)}
          className="position-absolute top-0 end-0 m-3 z-3"
        >
          <X />
        </Button>
      </Modal>
    </>
  );
};

export default BulkCreateCertificatesPage;
