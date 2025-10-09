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
} from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { getAdminCompanyDetails } from "../api";

function AdminCompanyDetailsPage() {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await getAdminCompanyDetails(companyId);
      setCompanyData(res.data);
    } catch (err) {
      setError("Failed to fetch company details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!companyData) return <Alert variant="info">No company data found.</Alert>;

  const { name, owner, members, recent_certificates, created_at } = companyData;

  return (
    <div>
      <Link to="/admin/companies" className="btn btn-outline-secondary mb-3">
        <ArrowLeft /> Back to Company List
      </Link>
      <h2 className="fw-bold mb-4">
        Company Details: <span className="text-primary">{name}</span>
      </h2>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">Company Info</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Owner:</strong>{" "}
                <Link to={`/admin/users/${owner.id}`}>{owner.name}</Link>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Owner Email:</strong> {owner.email}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Members:</strong> {members.length}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Created:</strong>{" "}
                {new Date(created_at).toLocaleDateString()}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header>
              <h5 className="mb-0">Members</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <Link to={`/admin/users/${member.id}`}>
                          {member.name}
                        </Link>
                      </td>
                      <td>{member.email}</td>
                      <td>
                        <Badge bg="info">{member.role.toUpperCase()}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0">
                Recent Certificates ({recent_certificates.length})
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
                  </tr>
                </thead>
                <tbody>
                  {recent_certificates.map((cert) => (
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

export default AdminCompanyDetailsPage;
