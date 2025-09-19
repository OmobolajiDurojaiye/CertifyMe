import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
  InputGroup,
  Modal,
  Image,
} from "react-bootstrap";
import {
  PlusCircle,
  ArrowLeft,
  SendFill,
  PersonCircle,
  Paperclip,
} from "react-bootstrap-icons";
import {
  createUserTicket,
  getUserTickets,
  getUserTicketDetails,
  replyToTicket,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import "../styles/SupportPage.css"; // Corrected CSS import path

// Main component that decides whether to show the list or details
function ContactSupportPage() {
  const { ticketId } = useParams();
  if (ticketId) {
    return <TicketDetails />;
  }
  return <TicketList />;
}

// Component to show the list of tickets and the creation form
function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null); // State for the file
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getUserTickets();
      setTickets(res.data);
    } catch (err) {
      toast.error("Failed to fetch support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUserTicket(subject, message, file); // Pass file to API
      toast.success("Support ticket created!");
      setSubject("");
      setMessage("");
      setFile(null); // Reset file state
      fetchTickets(); // Refresh list
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: "primary",
      in_progress: "warning",
      closed: "secondary",
    };
    return variants[status] || "info";
  };

  return (
    <>
      <Toaster position="top-center" />
      <h2 className="fw-bold mb-4">Contact Support</h2>
      <Row>
        <Col md={5}>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0 d-flex align-items-center">
                <PlusCircle className="me-2" /> Create a New Ticket
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Issue with bulk upload"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Attachment (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif"
                  />
                  {file && <Form.Text muted>Selected: {file.name}</Form.Text>}
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0">Your Ticket History</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" />
                </div>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <ListGroup.Item
                    key={ticket.id}
                    action
                    as={Link}
                    to={`/dashboard/support/${ticket.id}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-bold">{ticket.subject}</div>
                      <small className="text-muted">
                        Last updated:{" "}
                        {new Date(ticket.updated_at).toLocaleString()}
                      </small>
                    </div>
                    <Badge bg={getStatusBadge(ticket.status)}>
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center text-muted">
                  You have no support tickets.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
}

// Component to show the details of a single ticket and its conversation
function TicketDetails() {
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
      const res = await getUserTicketDetails(ticketId);
      setTicket(res.data);
    } catch (err) {
      toast.error("Could not fetch ticket details.");
      navigate("/dashboard/support");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await replyToTicket(ticketId, reply, file);
      toast.success("Reply sent!");
      setReply("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchTicket(); // Refresh messages
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to send reply.");
    } finally {
      setSending(false);
    }
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
      <Link to="/dashboard/support" className="btn btn-outline-secondary mb-3">
        <ArrowLeft /> Back to Tickets
      </Link>
      <Card className="shadow-sm border-0">
        <Card.Header>
          <h4 className="mb-0">{ticket.subject}</h4>
        </Card.Header>
        <Card.Body
          style={{ height: "50vh", overflowY: "auto" }}
          className="d-flex flex-column"
        >
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex mb-3 ${
                msg.sender_type === "user" ? "justify-content-end" : ""
              }`}
            >
              <div
                className={`p-3 rounded-3 ${
                  msg.sender_type === "user"
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "70%" }}
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
                disabled={ticket.status === "closed"}
                required
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current.click()}
                disabled={ticket.status === "closed"}
              >
                <Paperclip />
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={sending || ticket.status === "closed"}
              >
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
            {ticket.status === "closed" && (
              <Form.Text muted>
                This ticket is closed. Replying will re-open it.
              </Form.Text>
            )}
          </Form>
        </Card.Footer>
      </Card>

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

export default ContactSupportPage;
