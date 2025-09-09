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
import { useNavigate } from "react-router-dom";
import { getTemplates, bulkCreateCertificates } from "../api";

function BulkCreateCertificatesPage() {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({ template_id: "", file: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getTemplates();
        setTemplates(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            template_id: response.data[0].id,
          }));
        }
      } catch (err) {
        setError("Could not fetch templates.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleTemplateChange = (e) => {
    setFormData({ ...formData, template_id: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResults(null);
    setLoading(true);

    const data = new FormData();
    data.append("template_id", formData.template_id);
    if (formData.file) {
      data.append("file", formData.file);
    } else {
      setError("Please upload a CSV file.");
      setLoading(false);
      return;
    }

    try {
      const response = await bulkCreateCertificates(data);
      setSuccess(
        `Processed ${response.data.created} certificates successfully!`
      );
      setResults(response.data);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to process certificates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: "900px" }}>
      <h2 className="fw-bold mb-4 text-dark">Bulk Create Certificates</h2>
      <p className="text-muted mb-4">
        Upload a CSV file with columns: recipient_name, course_title, issue_date
        (YYYY-MM-DD), signature (optional).
      </p>
      {error && (
        <Alert variant="danger" className="rounded-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="rounded-3">
          {success}
        </Alert>
      )}
      <Card className="p-4 shadow-sm" style={{ borderRadius: "12px" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">Select Template</Form.Label>
            <Form.Select
              name="template_id"
              value={formData.template_id}
              onChange={handleTemplateChange}
              disabled={loading}
            >
              {templates.length === 0 ? (
                <option value="">No templates found</option>
              ) : (
                templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">Upload CSV File</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
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
                Processing...
              </>
            ) : (
              "Upload and Create Certificates"
            )}
          </Button>
        </Form>
      </Card>
      {results?.errors?.length > 0 && (
        <Card className="mt-4 shadow-sm" style={{ borderRadius: "12px" }}>
          <Card.Body>
            <h4 className="fw-bold mb-3">Processing Errors</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Row Data</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {results.errors.map((error, index) => (
                  <tr key={index}>
                    <td>{JSON.stringify(error.row)}</td>
                    <td>{error.error}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default BulkCreateCertificatesPage;
