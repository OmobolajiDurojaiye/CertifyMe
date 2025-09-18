import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  ListGroup,
  Badge,
  Table,
  Button,
  Form,
  InputGroup,
  Modal, // Import Modal
} from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import {
  getAdminUserDetails,
  adjustUserQuota,
  revokeAdminCertificate,
} from "../api";

function AdminUserDetailsPage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quotaAdjustment, setQuotaAdjustment] = useState({
    amount: "",
    reason: "",
  });
  // State for the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await getAdminUserDetails(userId);
      setUserData(res.data);
    } catch (err) {
      setError("Failed to fetch user details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentChange = (e) => {
    setQuotaAdjustment({
      ...quotaAdjustment,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!quotaAdjustment.reason) {
      alert("A reason for the adjustment is required.");
      return;
    }
    setShowConfirmModal(true); // Show confirmation modal instead of direct submission
  };

  const confirmQuotaAdjustment = async () => {
    setShowConfirmModal(false);
    try {
      const amountInt = parseInt(quotaAdjustment.amount, 10);
      if (isNaN(amountInt)) {
        alert("Please enter a valid number for the adjustment.");
        return;
      }
      await adjustUserQuota(userId, amountInt, quotaAdjustment.reason);
      setQuotaAdjustment({ amount: "", reason: "" }); // Reset form
      fetchUserDetails(); // Refresh data
    } catch (err) {
      alert(
        err.response?.data?.msg || "Failed to adjust quota. Please try again."
      );
    }
  };

  const handleRevoke = async (certId) => {
    if (window.confirm("Are you sure you want to revoke this certificate?")) {
      try {
        await revokeAdminCertificate(certId);
        fetchUserDetails(); // Refresh the certificate list
      } catch (err) {
        alert("Failed to revoke certificate.");
      }
    }
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!userData) return <Alert variant="info">No user data found.</Alert>;

  const { user, certificates, payments } = userData;

  return (
    <div>
      <Link to="/admin/users" className="btn btn-outline-secondary mb-3">
        <ArrowLeft /> Back to User List
      </Link>
      <h2 className="fw-bold mb-4">
        User Details: <span className="text-primary">{user.name}</span>
      </h2>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">User Profile</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Email:</strong> {user.email}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Role:</strong>{" "}
                <Badge bg="info">{user.role.toUpperCase()}</Badge>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Certificate Quota:</strong>{" "}
                <span className="fw-bold">{user.cert_quota}</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Joined:</strong>{" "}
                {new Date(user.signup_date).toLocaleDateString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Last Login:</strong>{" "}
                {user.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : "Never"}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Subscription Expiry:</strong>{" "}
                {user.subscription_expiry
                  ? new Date(user.subscription_expiry).toLocaleDateString()
                  : "N/A"}
              </ListGroup.Item>
            </ListGroup>
          </Card>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0">Manual Credit Adjustment</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAdjustmentSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Adjustment (+/-)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    placeholder="e.g., 50 or -10"
                    value={quotaAdjustment.amount}
                    onChange={handleAdjustmentChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="reason"
                    placeholder="e.g., Goodwill gesture, promotional credits"
                    value={quotaAdjustment.reason}
                    onChange={handleAdjustmentChange}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  Adjust Quota
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">
                Certificates Issued ({certificates.length})
              </h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Issued</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id}>
                      <td>{cert.recipient_name}</td>
                      <td>{cert.course_title}</td>
                      <td>
                        <Badge
                          bg={cert.status === "revoked" ? "danger" : "success"}
                        >
                          {cert.status}
                        </Badge>
                      </td>
                      <td>{new Date(cert.issue_date).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`/verify/${cert.verification_id}`}
                          target="_blank"
                        >
                          View
                        </Button>
                        {cert.status !== "revoked" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-1"
                            onClick={() => handleRevoke(cert.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0">Payment History ({payments.length})</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.plan}</td>
                      <td>
                        {p.amount} {p.currency}
                      </td>
                      <td>
                        <Badge
                          bg={
                            p.status === "paid"
                              ? "success"
                              : p.status === "failed"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>{p.provider}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal for Quota Adjustment */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to adjust the quota by{" "}
          <strong>{quotaAdjustment.amount}</strong> credits for the reason: "
          <em>{quotaAdjustment.reason}</em>"?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmQuotaAdjustment}>
            Confirm Adjustment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminUserDetailsPage;
