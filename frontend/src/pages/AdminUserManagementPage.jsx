import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  getAdminUserPayments,
} from "../api";

function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // State for new date filters
  const [dateFilter, setDateFilter] = useState({
    start_date: "",
    end_date: "",
  });
  const [paymentsModal, setPaymentsModal] = useState({
    show: false,
    userId: null,
    payments: [],
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Re-fetch users when any filter or page changes
  useEffect(() => {
    // Reset to page 1 if filters change, but not if only page changes
    const isFilterChange =
      search ||
      roleFilter ||
      statusFilter ||
      dateFilter.start_date ||
      dateFilter.end_date;
    if (isFilterChange && page !== 1) {
      // This check is to avoid a potential double-fetch, but for simplicity we can just fetch
    }
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
      // Filter out null values to keep URL clean
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

  const showPayments = async (userId) => {
    try {
      const res = await getAdminUserPayments(userId);
      setPaymentsModal({ show: true, userId, payments: res.data.payments });
    } catch (err) {
      alert("Failed to fetch payments");
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
                <th>Quota</th>
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
                  <td>{user.cert_quota}</td>
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
                        <Dropdown.Item onClick={() => showPayments(user.id)}>
                          View Payments
                        </Dropdown.Item>
                        {user.role !== "suspended" ? (
                          <Dropdown.Item
                            className="text-danger"
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

      {/* Payments Modal (triggered from the dropdown) */}
      <Modal
        show={paymentsModal.show}
        onHide={() =>
          setPaymentsModal({ show: false, userId: null, payments: [] })
        }
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
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
              {paymentsModal.payments.map((p) => (
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
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AdminUserManagementPage;
