import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap"; // Added Spinner
import { getAdminCertificatesOverview, revokeAdminCertificate } from "../api";

function AdminCertificatesPage() {
  const [overview, setOverview] = useState({
    total: 0,
    by_user: [],
    by_template: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await getAdminCertificatesOverview();
      setOverview(res.data);
    } catch (err) {
      setError("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certId) => {
    if (window.confirm("Revoke this certificate?")) {
      try {
        await revokeAdminCertificate(certId);
        fetchOverview();
      } catch (err) {
        alert("Failed to revoke");
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

  return (
    <div>
      <h2 className="fw-bold mb-4">Certificates Management</h2>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="text-center">
          <h3>Total Certificates: {overview.total.toLocaleString()}</h3>
        </Card.Body>
      </Card>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>By User</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.by_user.slice(0, 10).map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_name}</td>
                      <td>{u.count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>By Template</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.by_template.slice(0, 10).map((t) => (
                    <tr key={t.template_id}>
                      <td>{t.title}</td>
                      <td>{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminCertificatesPage;
