import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { getAdminCompanies, deleteAdminCompany } from "../api";

function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [search, page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = { search, page, limit: 10 };
      const res = await getAdminCompanies(params);
      setCompanies(res.data.companies);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? All members will be converted to individual accounts. This action cannot be undone."
      )
    ) {
      try {
        const res = await deleteAdminCompany(companyId);
        alert(res.data.msg);
        fetchCompanies();
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to delete company.");
      }
    }
  };

  if (loading && companies.length === 0)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2 className="fw-bold mb-4">Company Management</h2>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by company or owner name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Company Name</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{company.owner_name}</td>
                  <td>{company.member_count}</td>
                  <td>{new Date(company.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => navigate(`/admin/companies/${company.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleDelete(company.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminCompaniesPage;
