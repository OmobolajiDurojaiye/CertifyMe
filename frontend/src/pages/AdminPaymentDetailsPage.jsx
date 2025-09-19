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
} from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { getAdminTransactionDetails } from "../api";

function AdminPaymentDetailsPage() {
  const { paymentId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getAdminTransactionDetails(paymentId);
        setDetails(res.data);
      } catch (err) {
        setError("Failed to fetch payment details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!details) {
    return <Alert variant="info">No payment details found.</Alert>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "failed":
        return "danger";
      default:
        return "warning";
    }
  };

  return (
    <div>
      <Link to="/admin/payments" className="btn btn-outline-secondary mb-3">
        <ArrowLeft /> Back to Payments List
      </Link>
      <h2 className="fw-bold mb-4">
        Transaction Details: <span className="text-primary">#{details.id}</span>
      </h2>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">Payment Information</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Status:</strong>{" "}
                <Badge bg={getStatusBadge(details.status)}>
                  {details.status.toUpperCase()}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Amount:</strong> {details.amount} {details.currency}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Plan Purchased:</strong> {details.plan.toUpperCase()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Date & Time:</strong>{" "}
                {new Date(details.date).toLocaleString()}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">User & Provider</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>User:</strong>{" "}
                <Link to={`/admin/users/${details.user_id}`}>
                  {details.user_name}
                </Link>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>User Email:</strong> {details.user_email}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Payment Provider:</strong> {details.provider}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Provider Reference:</strong>{" "}
                <code>{details.transaction_ref}</code>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminPaymentDetailsPage;
