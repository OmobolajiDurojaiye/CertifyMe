import React, { useState, useEffect } from "react";
import { Card, Col, Row, Alert, Spinner } from "react-bootstrap";
import { PeopleFill, FileEarmarkText, CashStack } from "react-bootstrap-icons";
import { getAdminDashboardStats } from "../api";

function AdminDashboardPage() {
  // Initialize stats as null to easily check for loading status
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load dashboard stats");
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Display a spinner while loading OR if stats are not yet populated
  if (loading || !stats) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // Display an error message if the API call failed
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100 bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="me-4">
                <PeopleFill size={32} className="text-primary" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Users</h6>
                <h4 className="fw-bold mb-0">
                  {stats.total_users.toLocaleString()}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100 bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="me-4">
                <FileEarmarkText size={32} className="text-success" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Certificates Issued</h6>
                <h4 className="fw-bold mb-0">
                  {stats.total_certificates.toLocaleString()}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100 bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="me-4">
                <CashStack size={32} className="text-warning" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Revenue</h6>
                <h4 className="fw-bold mb-0">
                  ${stats.total_revenue.toLocaleString()}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm border-0 bg-primary text-white">
            <Card.Body>
              <Card.Title className="fw-bold">
                Welcome to the Control Panel
              </Card.Title>
              <Card.Text>
                Monitor your CertifyMe app with real-time insights. Use the
                sidebar to manage users, payments, and more.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboardPage;
