// frontend/src/pages/AnalyticsPage.jsx

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Radar, Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement,
} from "chart.js";
import { getUserAnalytics } from "../api";
import {
  Target,
  Award,
  BarChart,
  Users,
  TrendingUp,
  Mail,
  Folder,
  Clock,
  PieChart,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement
);

const formatNumber = (num) => num?.toLocaleString() ?? "0";

const UpgradePrompt = () => (
  <div className="text-center p-5 bg-light rounded shadow-sm mt-4">
    <TrendingUp size={64} className="text-success mb-4" />
    <h2 className="fw-bold mb-3">Unlock Your Performance Insights</h2>
    <p
      className="lead text-muted mb-4"
      style={{ maxWidth: "600px", margin: "0 auto 1.5rem auto" }}
    >
      Gain a competitive edge with peer benchmarking, performance scores, and
      detailed issuance trends. See how you stack up against others and identify
      your top-performing programs.
    </p>
    <Button as={Link} to="/dashboard/settings" size="lg" variant="success">
      Upgrade to Pro Now
    </Button>
  </div>
);

const FullDashboard = ({ insights }) => {
  const {
    kpis,
    benchmarking,
    charts,
    status_breakdown,
    top_recipient,
    template_usage,
    group_stats,
    email_metrics,
    recent_activity,
  } = insights;

  // Calculate MoM Growth
  const momData = charts.certs_over_time.data;
  const currentMonth = momData[momData.length - 1];
  const prevMonth = momData[momData.length - 2];
  const momGrowth =
    prevMonth > 0
      ? (((currentMonth - prevMonth) / prevMonth) * 100).toFixed(1)
      : "N/A";
  const momGrowthColor =
    momGrowth !== "N/A"
      ? momGrowth > 0
        ? "text-success"
        : "text-danger"
      : "text-muted";

  const radarChartData = {
    labels: benchmarking.labels,
    datasets: [
      {
        label: "Your Performance",
        data: benchmarking.user_data,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: "Peer Average",
        data: benchmarking.peer_average_data,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };
  const radarOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Your Performance vs. Peer Average" },
    },
    scales: { r: { suggestedMin: 0, pointLabels: { font: { size: 14 } } } },
  };

  const lineChartData = {
    labels: charts.certs_over_time.labels,
    datasets: [
      {
        label: "Certificates",
        data: charts.certs_over_time.data,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Certificates Issued Over Time" },
    },
    scales: { y: { beginAtZero: true } },
  };

  const barChartData = {
    labels: charts.top_programs.labels,
    datasets: [
      {
        label: "Certificates",
        data: charts.top_programs.data,
        backgroundColor: "#36A2EB",
      },
    ],
  };
  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top 5 Programs by Issuance" },
    },
    scales: { x: { beginAtZero: true } },
  };

  // Status Breakdown Doughnut
  const statusChartData = {
    labels: status_breakdown.labels,
    datasets: [
      {
        data: status_breakdown.data,
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Certificate Status Breakdown" },
      legend: { position: "right" },
    },
  };

  // Template Usage Doughnut
  const templateChartData = {
    labels: template_usage.labels,
    datasets: [
      {
        data: template_usage.data,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };
  const templateOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Top 5 Template Usage" },
      legend: { position: "right" },
    },
  };

  // Top Recipients Bar
  const recipientsBarData = {
    labels: top_recipient.labels,
    datasets: [
      {
        label: "Certificates",
        data: top_recipient.data,
        backgroundColor: "#FF9F40",
      },
    ],
  };
  const recipientsBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top 5 Recipients by Certificates" },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Performance Insights</h3>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100 bg-primary text-white">
            <Card.Body>
              <Target size={32} className="mb-2" />
              <h1 className="fw-bolder display-4">{kpis.performance_score}</h1>
              <p className="mb-0 fs-5">Performance Score</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Award size={32} className="text-success mb-2" />
              <h3 className="fw-bold text-success">
                Top {100 - kpis.percentile_rank}%
              </h3>
              <p className="text-muted mb-0">Issuer Rank vs Peers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <BarChart size={32} className="text-info mb-2" />
              <h3 className="fw-bold text-info">
                {formatNumber(kpis.total_certificates)}
              </h3>
              <p className="text-muted mb-0">Total Certificates</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Users size={32} className="text-warning mb-2" />
              <h3 className="fw-bold text-warning">
                {formatNumber(kpis.total_programs)}
              </h3>
              <p className="text-muted mb-0">Distinct Programs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics KPIs */}
      <h4 className="fw-bold mb-3">Additional Metrics</h4>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Clock size={32} className="text-primary mb-2" />
              <h3 className="fw-bold text-primary">
                {formatNumber(recent_activity.last_7_days)}
              </h3>
              <p className="text-muted mb-0">Certs Last 7 Days</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Mail size={32} className="text-info mb-2" />
              <h3 className="fw-bold text-info">{email_metrics.send_rate}%</h3>
              <p className="text-muted mb-0">Email Send Rate</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Folder size={32} className="text-success mb-2" />
              <h3 className="fw-bold text-success">
                {formatNumber(group_stats.num_groups)}
              </h3>
              <p className="text-muted mb-0">Groups Created</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <PieChart size={32} className="text-warning mb-2" />
              <h3 className="fw-bold text-warning">
                {group_stats.avg_certs_per_group}
              </h3>
              <p className="text-muted mb-0">Avg Certs per Group</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MoM Growth KPI */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <TrendingUp size={32} className={`${momGrowthColor} mb-2`} />
              <h3 className={`fw-bold ${momGrowthColor}`}>
                {momGrowth !== "N/A" ? `${momGrowth}%` : momGrowth}
              </h3>
              <p className="text-muted mb-0">MoM Issuance Growth</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Radar data={radarChartData} options={radarOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <hr className="my-4" />
      <h3 className="fw-bold mb-3">Descriptive Analytics</h3>
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Line options={lineOptions} data={lineChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {charts.top_programs.data.length > 0 ? (
                <Bar options={barOptions} data={barChartData} />
              ) : (
                <div className="text-center p-5 text-muted">
                  <h5>No Program Data Yet</h5>
                  <p>
                    Issue certificates for different courses to see performance
                    here.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <hr className="my-4" />
      <h3 className="fw-bold mb-3">Breakdown Analytics</h3>
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {status_breakdown.data.length > 0 ? (
                <Doughnut data={statusChartData} options={doughnutOptions} />
              ) : (
                <div className="text-center p-5 text-muted">
                  <h5>No Status Data Yet</h5>
                  <p>Issue certificates to see status breakdown here.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {template_usage.data.length > 0 ? (
                <Doughnut data={templateChartData} options={templateOptions} />
              ) : (
                <div className="text-center p-5 text-muted">
                  <h5>No Template Usage Data Yet</h5>
                  <p>Use templates to issue certificates and see usage here.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {top_recipient.data.length > 0 ? (
                <Bar options={recipientsBarOptions} data={recipientsBarData} />
              ) : (
                <div className="text-center p-5 text-muted">
                  <h5>No Recipient Data Yet</h5>
                  <p>
                    Issue certificates to recipients to see top performers here.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getUserAnalytics();
        setAnalyticsData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="text-center p-5">
        <Spinner animation="border" /> Loading Analytics...
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!analyticsData)
    return <Alert variant="info">No analytics data found.</Alert>;

  return (
    <div>
      <h2 className="fw-bold mb-4">Analytics Dashboard</h2>
      {analyticsData.upgrade_required ? (
        <UpgradePrompt />
      ) : (
        <FullDashboard insights={analyticsData} />
      )}
    </div>
  );
}

export default AnalyticsPage;
