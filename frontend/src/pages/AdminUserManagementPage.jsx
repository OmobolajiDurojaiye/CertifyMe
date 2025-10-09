import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Dropdown,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import {
  getAdminUsers,
  suspendAdminUser,
  unsuspendAdminUser,
  updateAdminUserPlan,
  deleteAdminUser,
} from "../api";

function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    start_date: "",
    end_date: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page, dateFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
        start_date: dateFilter.start_date || null,
        end_date: dateFilter.end_date || null,
      };
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
      );

      const res = await getAdminUsers(filteredParams);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateFilter({ ...dateFilter, [e.target.name]: e.target.value });
  };

  const handleSuspend = async (userId) => {
    if (window.confirm("Are you sure you want to suspend this user?")) {
      try {
        await suspendAdminUser(userId);
        fetchUsers();
      } catch (err) {
        alert("Failed to suspend user");
      }
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await unsuspendAdminUser(userId);
      fetchUsers();
    } catch (err) {
      alert("Failed to unsuspend user");
    }
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await updateAdminUserPlan(userId, newPlan);
      fetchUsers();
    } catch (err) {
      alert("Failed to update plan");
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "DANGER: Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    ) {
      try {
        const res = await deleteAdminUser(userId);
        alert(res.data.msg);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to delete user.");
      }
    }
  };

  if (loading && users.length === 0)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2 className="fw-bold mb-4">User Management</h2>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="mb-3 g-3">
            <Col md={4} lg={3}>
              <Form.Control
                type="text"
                placeholder="Search by name/email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
              </Form.Select>
            </Col>
            <Col md={4} lg={2}>
              <Form.Control
                type="date"
                name="start_date"
                value={dateFilter.start_date}
                onChange={handleDateChange}
              />
              <Form.Text muted>Start Date</Form.Text>
            </Col>
            <Col md={4} lg={2}>
              <Form.Control
                type="date"
                name="end_date"
                value={dateFilter.end_date}
                onChange={handleDateChange}
              />
              <Form.Text muted>End Date</Form.Text>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role/Plan</th>
                <th>Company</th>
                <th>Signup Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg="primary">{user.role.toUpperCase()}</Badge>
                  </td>
                  <td>{user.company_name}</td>
                  <td>{new Date(user.signup_date).toLocaleDateString()}</td>
                  <td>
                    <Badge
                      bg={user.role === "suspended" ? "danger" : "success"}
                    >
                      {user.role === "suspended" ? "Suspended" : "Active"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      View
                    </Button>
                    <Dropdown className="ms-1 d-inline">
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        id={`dropdown-actions-${user.id}`}
                      >
                        Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete User
                        </Dropdown.Item>
                        {user.role !== "suspended" ? (
                          <Dropdown.Item
                            className="text-warning"
                            onClick={() => handleSuspend(user.id)}
                          >
                            Suspend User
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            className="text-success"
                            onClick={() => handleUnsuspend(user.id)}
                          >
                            Unsuspend User
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Header>Change Plan</Dropdown.Header>
                        {["free", "starter", "growth", "pro", "enterprise"].map(
                          (plan) => (
                            <Dropdown.Item
                              key={plan}
                              onClick={() => handlePlanChange(user.id, plan)}
                            >
                              {plan.toUpperCase()}
                            </Dropdown.Item>
                          )
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
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

export default AdminUserManagementPage;
