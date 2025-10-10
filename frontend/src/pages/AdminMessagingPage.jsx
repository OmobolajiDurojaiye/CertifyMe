import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import {
  getEmailRecipients,
  sendAdminBulkEmail,
  uploadEditorImage,
} from "../api"; // IMPORT NEW API
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";

function AdminMessagingPage() {
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const quillRef = useRef(null); // Create a ref for the editor instance

  // --- THIS IS THE FIX: Custom Image Handler ---
  // This function handles image uploads directly to the server,
  // getting a URL back. This ensures images are not base64 encoded
  // and will show up in all email clients.
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file); // The backend expects an 'image' field

        try {
          const res = await uploadEditorImage(formData);
          const imageUrl = res.data.imageUrl; // The API should return the public URL

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", imageUrl);
          quill.setSelection(range.index + 1);
        } catch (err) {
          setError(
            err.response?.data?.msg ||
              "Failed to upload image. Please try again."
          );
        }
      }
    };
  };

  // Define a richer toolbar for the editor and wire up the custom image handler
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"], // The 'image' button will now trigger our handler
          [{ align: [] }],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );
  // --- END OF FIX ---

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const res = await getEmailRecipients();
        const options = res.data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
        setRecipientOptions([
          { value: "all", label: "All Active Users" },
          ...options,
        ]);
      } catch (err) {
        setError("Failed to fetch recipient list.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipients();
  }, []);

  const handleSelectChange = (selected) => {
    if (selected && selected.some((option) => option.value === "all")) {
      setSelectedOptions([{ value: "all", label: "All Active Users" }]);
    } else {
      setSelectedOptions(selected);
    }
  };

  const handleHeaderImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await uploadEditorImage(formData);
        setHeaderImageUrl(res.data.imageUrl);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Failed to upload header image. Please try again."
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !body || !selectedOptions || selectedOptions.length === 0) {
      setError("Please fill in all fields and select recipients.");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        subject,
        body,
        recipients:
          selectedOptions[0].value === "all"
            ? "all"
            : selectedOptions.map((opt) => opt.value),
        header_image_url: headerImageUrl,
      };
      const res = await sendAdminBulkEmail(payload);
      setSuccess(res.data.msg);
      setSubject("");
      setBody("");
      setSelectedOptions(null);
      setHeaderImageUrl("");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const previewBody = body.replace(/{{ user_name }}/g, "John Doe");

  return (
    <div>
      <h2 className="fw-bold mb-4">User Messaging Center</h2>
      <Card className="shadow-sm border-0">
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12} lg={6} className="mb-3">
                <Form.Group controlId="recipients">
                  <Form.Label>Recipients</Form.Label>
                  <Select
                    isMulti
                    options={recipientOptions}
                    isLoading={loading}
                    value={selectedOptions}
                    onChange={handleSelectChange}
                    closeMenuOnSelect={false}
                    placeholder="Select recipients..."
                  />
                  <Form.Text>
                    Select "All Active Users" or choose individuals from the
                    list.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12} lg={6} className="mb-3">
                <Form.Group controlId="subject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g., Important Platform Update"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="headerImage">
              <Form.Label>Header Image (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleHeaderImageUpload}
              />
              {headerImageUrl && (
                <img
                  src={headerImageUrl}
                  alt="Header Preview"
                  style={{ maxWidth: "100%", marginTop: "10px" }}
                />
              )}
              <Form.Text>
                Upload a header image to appear at the top of the email.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="body">
              <Form.Label>Email Body</Form.Label>
              <ReactQuill
                ref={quillRef} // Assign the ref
                theme="snow"
                value={body}
                onChange={setBody}
                modules={quillModules}
                style={{ height: "250px", marginBottom: "50px" }}
              />
              <Form.Text>
                Use {"{{ user_name }}"} in the body for personalization (e.g.,
                Hello {"{{ user_name }}"}).
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={sending || loading}
              >
                {sending ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" />{" "}
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowPreview(true)}
                disabled={!body}
              >
                Preview Email
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Email Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Subject: {subject}</h5>
          <hr />
          {headerImageUrl && (
            <img
              src={headerImageUrl}
              alt="Header"
              style={{ width: "100%", marginBottom: "20px" }}
            />
          )}
          <div dangerouslySetInnerHTML={{ __html: previewBody }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminMessagingPage;
