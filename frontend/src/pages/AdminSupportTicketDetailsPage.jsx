import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
  InputGroup,
  Dropdown,
  Modal,
  Image,
} from "react-bootstrap";
import {
  ArrowLeft,
  SendFill,
  PersonCircle,
  Paperclip,
} from "react-bootstrap-icons";
import {
  getAdminTicketDetails,
  adminReplyToTicket,
  updateTicketStatus,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import "../styles/SupportPage.css"; // Corrected CSS import path

function AdminSupportTicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await getAdminTicketDetails(ticketId);
      setTicket(res.data);
    } catch (err) {
      toast.error("Could not fetch ticket details.");
      navigate("/admin/support");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    setSending(true);
    const promise = adminReplyToTicket(ticketId, reply, file);

    toast.promise(promise, {
      loading: "Sending reply...",
      success: () => {
        setReply("");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchTicket(); // Refresh messages
        return "Reply sent successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to send reply.",
    });

    promise.finally(() => setSending(false));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const openImageModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    const promise = updateTicketStatus(ticketId, newStatus);
    toast.promise(promise, {
      loading: "Updating status...",
      success: (res) => {
        fetchTicket(); // Refresh ticket details
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to update status.",
    });
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <>
      <Toaster position="top-center" />
      <Link to="/admin/support" className="btn btn-outline-secondary mb-3">
        <ArrowLeft /> Back to All Tickets
      </Link>
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h4 className="mb-0">{ticket.subject}</h4>
            </Card.Header>
            <Card.Body
              style={{ height: "55vh", overflowY: "auto" }}
              className="d-flex flex-column"
            >
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`d-flex mb-3 ${
                    msg.sender_type === "admin" ? "justify-content-end" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-3 ${
                      msg.sender_type === "admin"
                        ? "bg-primary text-white"
                        : "bg-light text-dark"
                    }`}
                    style={{ maxWidth: "80%" }}
                  >
                    <div className="fw-bold d-flex align-items-center mb-1">
                      <PersonCircle className="me-2" />
                      {msg.sender_name}
                    </div>
                    <p className="mb-1" style={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </p>
                    {msg.image_url && (
                      <Image
                        src={msg.image_url}
                        thumbnail
                        className="mt-2 support-thumbnail"
                        onClick={() => openImageModal(msg.image_url)}
                      />
                    )}
                    <small className="opacity-75">
                      {new Date(msg.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </Card.Body>
            <Card.Footer>
              <Form onSubmit={handleReply}>
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    required
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Paperclip />
                  </Button>
                  <Button type="submit" variant="primary" disabled={sending}>
                    {sending ? <Spinner as="span" size="sm" /> : <SendFill />}
                  </Button>
                </InputGroup>
                <Form.Control
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/gif"
                  style={{ display: "none" }}
                />
                {file && <Form.Text muted>Attachment: {file.name}</Form.Text>}
              </Form>
            </Card.Footer>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0">Ticket Details</h5>
            </Card.Header>
            <Card.Body>
              <h6>User Information</h6>
              <p className="mb-1">
                <strong>Name:</strong>{" "}
                <Link to={`/admin/users/${ticket.user.id}`}>
                  {ticket.user.name}
                </Link>
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {ticket.user.email}
              </p>
              <p>
                <strong>Plan:</strong>{" "}
                <Badge bg="info">{ticket.user.role.toUpperCase()}</Badge>
              </p>
              <hr />
              <h6>Ticket Status</h6>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-basic"
                  className="w-100"
                >
                  {ticket.status.replace("_", " ").toUpperCase()}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item onClick={() => handleStatusChange("open")}>
                    Open
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleStatusChange("in_progress")}
                  >
                    In Progress
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleStatusChange("closed")}>
                    Close Ticket
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
        size="lg"
      >
        <Modal.Body className="p-0">
          <Image src={modalImageUrl} fluid />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AdminSupportTicketDetailsPage;
