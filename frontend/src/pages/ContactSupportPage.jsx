import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  ListGroup,
  Badge,
  Spinner,
  Row,
  Col,
  InputGroup,
  Modal,
  Image,
  Container,
} from "react-bootstrap";
import {
  PlusCircle,
  ArrowLeft,
  SendFill,
  PersonCircle,
  Paperclip,
  Trash,
} from "react-bootstrap-icons";
import {
  createUserTicket,
  getUserTickets,
  getUserTicketDetails,
  replyToTicket,
  deleteUserTicket,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import "../styles/TicketPage.css"; // --- IMPORT THE NEW STYLESHEET

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
  const [file, setFile] = useState(null);
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
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message cannot be empty.");
      return;
    }
    setSubmitting(true);
    try {
      await createUserTicket(subject, message, file);
      toast.success("Support ticket created!");
      setSubject("");
      setMessage("");
      setFile(null);
      fetchTickets();
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
    e.target.value = null;
  };

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone."
      )
    ) {
      try {
        await deleteUserTicket(ticketId);
        toast.success("Ticket deleted successfully!");
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket.id !== ticketId)
        );
      } catch (err) {
        toast.error("Failed to delete the ticket.");
      }
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
    <Container className="py-4">
      <Toaster position="top-center" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0 h2">My Support Tickets</h1>
        <Button as={Link} to="/dashboard/support" variant="outline-secondary">
          Back to Help Center
        </Button>
      </div>

      <Row>
        <Col lg={5}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h5 className="mb-0 d-flex align-items-center">
                <PlusCircle className="me-2 text-primary" /> Create a New Ticket
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Subject</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Issue with bulk upload"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Message</Form.Label>
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
                  <Form.Label className="small fw-bold">
                    Attachment (Optional)
                  </Form.Label>
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
                  size="lg"
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
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
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
                    to={`/dashboard/support/tickets/${ticket.id}`}
                    className="d-flex justify-content-between align-items-center p-3 ticket-list-item"
                  >
                    <div className="flex-grow-1 me-3">
                      <div className="fw-bold">{ticket.subject}</div>
                      <small className="text-muted">
                        Last updated:{" "}
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge
                        pill
                        bg={getStatusBadge(ticket.status)}
                        className="me-3 px-2 py-1"
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Button
                        variant="light"
                        size="sm"
                        className="btn-delete"
                        onClick={(e) => handleDelete(e, ticket.id)}
                        title="Delete Ticket"
                      >
                        <Trash className="text-danger" />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <Card.Body className="text-center text-muted p-5">
                  You have no support tickets.
                </Card.Body>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function TicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(scrollToBottom, [ticket]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await getUserTicketDetails(ticketId);
      setTicket(res.data);
    } catch (err) {
      toast.error("Could not fetch ticket details.");
      navigate("/dashboard/support/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() && !file) {
      toast.error("Reply cannot be empty.");
      return;
    }
    setSending(true);
    try {
      await replyToTicket(ticketId, reply, file);
      setReply("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`Attached: ${selectedFile.name}`);
    } else {
      setFile(null);
    }
    e.target.value = null; // Reset input to allow re-selection
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!ticket) return null;

  return (
    <Container className="py-4">
      <Toaster position="top-center" />
      <Card className="border-0 shadow-sm chat-container-card">
        <Card.Header className="bg-white chat-header d-flex align-items-center justify-content-between p-3">
          <h2 className="h5 mb-0 fw-bold">{ticket.subject}</h2>
          <Button
            as={Link}
            to="/dashboard/support/tickets"
            variant="outline-secondary"
            size="sm"
          >
            <ArrowLeft /> Back to My Tickets
          </Button>
        </Card.Header>
        <Card.Body className="chat-body d-flex flex-column gap-3">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex flex-column chat-bubble ${
                msg.sender_type === "user" ? "user" : "admin"
              }`}
            >
              <div className="fw-bold d-flex align-items-center mb-1">
                <PersonCircle className="me-2" />
                <span>{msg.sender_name}</span>
              </div>
              <p className="mb-1">{msg.content}</p>
              {msg.image_url && (
                <Image
                  src={msg.image_url}
                  thumbnail
                  className="mt-2"
                  style={{ maxWidth: "200px", cursor: "pointer" }}
                />
              )}
              <small className="opacity-75 align-self-end mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </small>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </Card.Body>
        <Card.Footer className="chat-footer">
          <Form onSubmit={handleReply}>
            <InputGroup>
              <Form.Control
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={ticket.status === "closed"}
                required={!file} // Required if no file is attached
              />
              <Button
                variant="light"
                onClick={() => fileInputRef.current.click()}
                disabled={ticket.status === "closed"}
                title="Attach file"
              >
                <Paperclip size={20} />
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={sending || ticket.status === "closed"}
                title="Send"
              >
                {sending ? (
                  <Spinner as="span" size="sm" />
                ) : (
                  <SendFill size={20} />
                )}
              </Button>
            </InputGroup>
            <Form.Control
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
              style={{ display: "none" }}
            />
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default ContactSupportPage;
