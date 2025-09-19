import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { getAdminSupportTickets } from "../api";

function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { status: statusFilter, page, limit: 10 };
      const res = await getAdminSupportTickets(params);
      setTickets(res.data.tickets);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError("Failed to fetch support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (role) => {
    const priorities = {
      enterprise: { bg: "danger", text: "Highest" },
      pro: { bg: "warning", text: "High" },
      growth: { bg: "info", text: "Medium" },
      starter: { bg: "primary", text: "Normal" },
      free: { bg: "secondary", text: "Low" },
    };
    return priorities[role] || { bg: "light", text: "N/A" };
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
    <div>
      <h2 className="fw-bold mb-4">Support Ticket Management</h2>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mb-3"
            style={{ width: "200px" }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </Form.Select>

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Priority</th>
                    <th>Subject</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <Badge
                          bg={getPriorityBadge(ticket.user_role).bg}
                          className="p-2"
                        >
                          {getPriorityBadge(ticket.user_role).text}
                        </Badge>
                      </td>
                      <td>{ticket.subject}</td>
                      <td>
                        {ticket.user_name} (
                        <span className="text-capitalize">
                          {ticket.user_role}
                        </span>
                        )
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(ticket.status)}>
                          {ticket.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td>{new Date(ticket.updated_at).toLocaleString()}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/support/${ticket.id}`)
                          }
                        >
                          View / Reply
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
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminSupportPage;
