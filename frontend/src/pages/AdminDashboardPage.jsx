import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Alert,
  Spinner,
  Table,
  ListGroup,
  Badge,
  Button,
} from "react-bootstrap";
import {
  PeopleFill,
  FileEarmarkText,
  CashStack,
  ArrowUp,
} from "react-bootstrap-icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { getAdminDashboardStats } from "../api";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper to format numbers with commas
const formatNumber = (num) => (num ? num.toLocaleString() : "0");

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const responseData = await getAdminDashboardStats();
        setData(responseData);
      } catch (err) {
        setError("Failed to load dashboard stats");
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <Alert variant="info">No dashboard data found.</Alert>;

  const { kpi, recent_users, recent_payments, revenue_trend_30d } = data;

  const revenueChartData = {
    labels: revenue_trend_30d.map((item) =>
      new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Daily Revenue (USD)",
        data: revenue_trend_30d.map((item) => item.revenue),
        borderColor: "rgb(40, 167, 69)",
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      {/* KPI Cards */}
      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Total Users</h6>
                  <h3 className="fw-bold mb-0">
                    {formatNumber(kpi.total_users)}
                  </h3>
                </div>
                <PeopleFill size={32} className="text-primary" />
              </div>
              <p className="text-success small mt-2 mb-0">
                <ArrowUp /> {formatNumber(kpi.new_users_30d)} in last 30 days
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Certificates Issued</h6>
                  <h3 className="fw-bold mb-0">
                    {formatNumber(kpi.total_certificates)}
                  </h3>
                </div>
                <FileEarmarkText size={32} className="text-info" />
              </div>
              <p className="text-success small mt-2 mb-0">
                <ArrowUp /> {formatNumber(kpi.new_certs_30d)} in last 30 days
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="fw-bold mb-0">
                    ${formatNumber(kpi.total_revenue)}
                  </h3>
                </div>
                <CashStack size={32} className="text-success" />
              </div>
              <p className="text-success small mt-2 mb-0">
                <ArrowUp /> ${formatNumber(kpi.revenue_30d)} in last 30 days
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Chart and Recent Signups */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Revenue Trend (Last 30 Days)</Card.Title>
              <Line data={revenueChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Signups</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {recent_users.map((user) => (
                <ListGroup.Item
                  key={user.id}
                  action
                  as={Link}
                  to={`/admin/users/${user.id}`}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-bold">{user.name}</div>
                    <small className="text-muted">{user.email}</small>
                  </div>
                  <small>{new Date(user.date).toLocaleDateString()}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header>
              <h5 className="mb-0">Recent Transactions</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive size="sm">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.user_name}</td>
                      <td>
                        <Badge bg="primary">{p.plan.toUpperCase()}</Badge>
                      </td>
                      <td>${p.amount}</td>
                      <td>{new Date(p.date).toLocaleString()}</td>
                      <td>
                        <Button
                          as={Link}
                          to={`/admin/payments/${p.id}`}
                          variant="outline-info"
                          size="sm"
                        >
                          View
                        </Button>
                      </td>
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

export default AdminDashboardPage;
