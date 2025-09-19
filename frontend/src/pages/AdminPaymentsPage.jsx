import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Col,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import { getAdminTransactions } from "../api";

function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total_revenue: 0, revenue_by_plan: {} });
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { status: statusFilter, page, limit: 10 };
      const res = await getAdminTransactions(params);
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pages);
      setStats(res.data.stats);
    } catch (err) {
      setError("Failed to fetch transactions");
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

  return (
    <div>
      <h2 className="fw-bold mb-4">Payments & Subscriptions</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-success text-white">
            <Card.Body className="text-center">
              <h4>${stats.total_revenue.toLocaleString()}</h4>
              <p>Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        {Object.entries(stats.revenue_by_plan).map(([plan, amount]) => (
          <Col md={3} key={plan}>
            <Card className="shadow-sm border-0">
              <Card.Body className="text-center">
                <h5>${amount.toLocaleString()}</h5>
                <p>{plan.toUpperCase()} Plan</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mb-3"
            style={{ width: "200px" }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </Form.Select>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Date</th>
                <th>Provider</th>
                {/* --- THIS IS THE FIX --- */}
                <th>Actions</th>
                {/* --- END OF FIX --- */}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className={t.status === "failed" ? "table-danger" : ""}
                >
                  <td>{t.user_name}</td>
                  <td>
                    {t.amount} {t.currency}
                  </td>
                  <td>{t.plan}</td>
                  <td>
                    <Badge
                      bg={
                        t.status === "paid"
                          ? "success"
                          : t.status === "failed"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.provider}</td>
                  {/* --- THIS IS THE FIX --- */}
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => navigate(`/admin/payments/${t.id}`)}
                    >
                      View
                    </Button>
                  </td>
                  {/* --- END OF FIX --- */}
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

export default AdminPaymentsPage;
