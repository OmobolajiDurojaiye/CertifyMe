import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAdminAnalytics } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper to format numbers with commas
const formatNumber = (num) =>
  num ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0";

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("1y"); // '30d', '90d', '1y', 'all'

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAdminAnalytics(period);
      setAnalytics(res.data);
    } catch (err) {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const getChartOptions = (text) => ({
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text },
    },
  });

  const generateChartData = (label, data, color) => ({
    labels: data?.map((g) => `${g.month}/${g.year}`) || [],
    datasets: [
      {
        label: label,
        data: data?.map((g) => g.count || g.total) || [],
        borderColor: color,
        backgroundColor: `${color}80`, // Add transparency
        tension: 0.1,
        fill: true,
      },
    ],
  });

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" /> Loading Analytics...
      </div>
    );
  }
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!analytics) return <Alert variant="info">No analytics data found.</Alert>;

  const { kpi_stats } = analytics;

  return (
    <div>
      <h2 className="fw-bold mb-4">Analytics & Insights</h2>

      {/* --- KPI Cards Section --- */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <h3 className="fw-bold text-primary">
                {formatNumber(kpi_stats.total_users)}
              </h3>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <h3 className="fw-bold text-success">
                ${formatNumber(kpi_stats.total_revenue)}
              </h3>
              <p className="text-muted mb-0">Total Revenue (USD)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <h3 className="fw-bold text-info">
                {formatNumber(kpi_stats.total_certificates)}
              </h3>
              <p className="text-muted mb-0">Total Certificates</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <h3 className="fw-bold text-warning">
                {formatNumber(kpi_stats.avg_certs_per_user)}
              </h3>
              <p className="text-muted mb-0">Avg. Certs Per User</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Period Filter --- */}
      <div className="d-flex justify-content-end mb-3">
        <ButtonGroup>
          <Button
            variant={period === "30d" ? "primary" : "outline-primary"}
            onClick={() => setPeriod("30d")}
          >
            30 Days
          </Button>
          <Button
            variant={period === "90d" ? "primary" : "outline-primary"}
            onClick={() => setPeriod("90d")}
          >
            90 Days
          </Button>
          <Button
            variant={period === "1y" ? "primary" : "outline-primary"}
            onClick={() => setPeriod("1y")}
          >
            1 Year
          </Button>
          <Button
            variant={period === "all" ? "primary" : "outline-primary"}
            onClick={() => setPeriod("all")}
          >
            All Time
          </Button>
        </ButtonGroup>
      </div>

      {/* --- Growth Charts Section --- */}
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Line
                options={getChartOptions("Revenue Growth (USD)")}
                data={generateChartData(
                  "Revenue",
                  analytics.revenue_growth,
                  "rgb(40, 167, 69)"
                )}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Line
                options={getChartOptions("New User Signups")}
                data={generateChartData(
                  "Users",
                  analytics.user_growth,
                  "rgb(75, 192, 192)"
                )}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Line
                options={getChartOptions("Certificates Issued")}
                data={generateChartData(
                  "Certificates",
                  analytics.cert_growth,
                  "rgb(255, 159, 64)"
                )}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Distribution & Top Users Section --- */}
      <Row>
        <Col md={5}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Doughnut
                options={getChartOptions("Plan Distribution")}
                data={{
                  labels:
                    analytics.plan_distribution?.map((p) =>
                      p.role.toUpperCase()
                    ) || [],
                  datasets: [
                    {
                      label: "Users",
                      data:
                        analytics.plan_distribution?.map((p) => p.count) || [],
                      backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                      ],
                    },
                  ],
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Bar
                options={getChartOptions("Top 5 Users by Certificates Issued")}
                data={{
                  labels: analytics.top_users?.map((u) => u.name) || [],
                  datasets: [
                    {
                      label: "Certificates",
                      data: analytics.top_users?.map((u) => u.cert_count) || [],
                      backgroundColor: "#36A2EB",
                    },
                  ],
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminAnalyticsPage;
