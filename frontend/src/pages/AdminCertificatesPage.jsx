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
  Form,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import {
  getAdminCertificatesOverview,
  getAdminCertificates,
  revokeAdminCertificate,
} from "../api";

function AdminCertificatesPage() {
  // State for overview data
  const [overview, setOverview] = useState({
    total: 0,
    by_user: [],
    by_template: [],
  });

  // State for the new detailed certificate list
  const [certificates, setCertificates] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(false);

  // State for new filter controls
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    start_date: "",
    end_date: "",
  });

  // Fetch overview stats on initial load
  useEffect(() => {
    fetchOverview();
  }, []);

  // Fetch the detailed certificate list whenever page or filters change
  useEffect(() => {
    fetchCertificates();
  }, [currentPage, search, statusFilter, dateFilter]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await getAdminCertificatesOverview();
      setOverview(res.data);
    } catch (err) {
      setError(
        "Failed to fetch overview data. The certificate list may still work."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    setListLoading(true);
    try {
      const params = {
        page: currentPage,
        search,
        status: statusFilter,
        start_date: dateFilter.start_date || null,
        end_date: dateFilter.end_date || null,
        limit: 10,
      };
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
      );
      const res = await getAdminCertificates(filteredParams);
      setCertificates(res.data.certificates);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError((prev) => prev + "\nFailed to fetch certificate list.");
    } finally {
      setListLoading(false);
    }
  };

  // Handlers to reset to page 1 when filters change
  const handleFilterChange = (setter) => (e) => {
    setCurrentPage(1);
    setter(e.target.value);
  };

  const handleDateChange = (e) => {
    setCurrentPage(1);
    setDateFilter({ ...dateFilter, [e.target.name]: e.target.value });
  };

  const handleRevoke = async (certId) => {
    if (window.confirm("Are you sure you want to revoke this certificate?")) {
      try {
        await revokeAdminCertificate(certId);
        fetchCertificates(); // Refresh list after revoking
      } catch (err) {
        alert("Failed to revoke certificate.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="fw-bold mb-4">Certificates Management</h2>
      {error && !loading && <Alert variant="warning">{error}</Alert>}

      {/* --- Overview Section (UI Improved) --- */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="text-center">
          <h3>Total Certificates Issued: {overview.total.toLocaleString()}</h3>
        </Card.Body>
      </Card>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Top Users by Volume</Card.Title>
              <ListGroup variant="flush">
                {overview.by_user.slice(0, 5).map((u) => (
                  <ListGroup.Item
                    key={u.user_id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {u.user_name}
                    <Badge bg="primary" pill>
                      {u.count}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Top Templates Used</Card.Title>
              <ListGroup variant="flush">
                {overview.by_template.slice(0, 5).map((t) => (
                  <ListGroup.Item
                    key={t.template_id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {t.title}
                    <Badge bg="secondary" pill>
                      {t.count}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Detailed Certificate List Section (NEW) --- */}
      <Card className="shadow-sm border-0">
        <Card.Header>
          <h5 className="mb-0">All Certificates</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-3">
            <Col lg={4} md={12}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search recipient, course, issuer..."
                  value={search}
                  onChange={handleFilterChange(setSearch)}
                />
              </InputGroup>
            </Col>
            <Col lg={2} md={4}>
              <Form.Select
                value={statusFilter}
                onChange={handleFilterChange(setStatusFilter)}
              >
                <option value="">All Statuses</option>
                <option value="valid">Valid</option>
                <option value="revoked">Revoked</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={4}>
              <Form.Control
                type="date"
                name="start_date"
                value={dateFilter.start_date}
                onChange={handleDateChange}
              />
              <Form.Text muted>Issue Start Date</Form.Text>
            </Col>
            <Col lg={3} md={4}>
              <Form.Control
                type="date"
                name="end_date"
                value={dateFilter.end_date}
                onChange={handleDateChange}
              />
              <Form.Text muted>Issue End Date</Form.Text>
            </Col>
          </Row>

          {listLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive size="sm">
                <thead className="table-dark">
                  <tr>
                    <th>Recipient</th>
                    <th>Course</th>
                    <th>Issuer</th>
                    <th>Status</th>
                    <th>Issue Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.length > 0 ? (
                    certificates.map((cert) => (
                      <tr key={cert.id}>
                        <td>{cert.recipient_name}</td>
                        <td>{cert.course_title}</td>
                        <td>{cert.issuer_name}</td>
                        <td>
                          <Badge
                            bg={
                              cert.status === "revoked" ? "danger" : "success"
                            }
                          >
                            {cert.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={`/verify/${cert.verification_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No certificates found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
export default AdminCertificatesPage;
