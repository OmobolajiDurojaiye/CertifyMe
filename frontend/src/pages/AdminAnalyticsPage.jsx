import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap"; // Added Spinner
import { Line, Bar, Pie } from "react-chartjs-2";
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

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getAdminAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      setError("Failed to fetch analytics");
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

  // Prepare chart data
  const userGrowthData = {
    labels: analytics.user_growth?.map((g) => `${g.month}/${g.year}`) || [],
    datasets: [
      {
        label: "User Signups",
        data: analytics.user_growth?.map((g) => g.count) || [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const planDistData = {
    labels: analytics.plan_distribution?.map((p) => p.role) || [],
    datasets: [
      {
        label: "Users",
        data: analytics.plan_distribution?.map((p) => p.count) || [],
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

  const topUsersData = {
    labels: analytics.top_users?.map((u) => u.name) || [],
    datasets: [
      {
        label: "Certificates Issued",
        data: analytics.top_users?.map((u) => u.cert_count) || [],
        backgroundColor: "#36A2EB",
      },
    ],
  };

  return (
    <div>
      <h2 className="fw-bold mb-4">Analytics & Insights</h2>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Card.Title>User Growth Over Time</Card.Title>
              <Line data={userGrowthData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Card.Title>Plan Distribution</Card.Title>
              <Pie data={planDistData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Top Active Users (Certificates Issued)</Card.Title>
              <Bar data={topUsersData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminAnalyticsPage;
