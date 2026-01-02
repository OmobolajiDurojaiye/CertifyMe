import React, { useState, useEffect } from "react";
import { Alert, Spinner } from "react-bootstrap";
import {
  Users,
  FileBadge,
  DollarSign,
  ArrowUp,
  BarChart2,
  ListOrdered,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
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

const formatNumber = (num) => (num || 0).toLocaleString();
const formatCurrency = (num) =>
  `$${(num || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-green-600 font-medium flex items-center gap-1">
        <ArrowUp size={14} /> {change} in 30 days
      </p>
    </div>
  </div>
);

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
        setError("Failed to load dashboard stats. Please refresh.");
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <Alert variant="info">No dashboard data found.</Alert>;

  const { kpi, recent_users, recent_payments, revenue_trend_30d } = data;

  const revenueChartData = {
    labels: (revenue_trend_30d || []).map((item) =>
      new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Daily Revenue (USD)",
        data: (revenue_trend_30d || []).map((item) => item.revenue),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => `$${value}` } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(kpi?.total_revenue)}
          change={`+${formatCurrency(kpi?.revenue_30d)}`}
          icon={DollarSign}
          color={{ bg: "bg-green-100", text: "text-green-600" }}
        />
        <StatCard
          title="Total Users"
          value={formatNumber(kpi?.total_users)}
          change={`+${formatNumber(kpi?.new_users_30d)}`}
          icon={Users}
          color={{ bg: "bg-indigo-100", text: "text-indigo-600" }}
        />
        <StatCard
          title="Certificates Issued"
          value={formatNumber(kpi?.total_certificates)}
          change={`+${formatNumber(kpi?.new_certs_30d)}`}
          icon={FileBadge}
          color={{ bg: "bg-blue-100", text: "text-blue-600" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 size={20} className="text-gray-400" /> Revenue Trend
              (30 Days)
            </h3>
            <div className="h-80">
              {revenue_trend_30d && revenue_trend_30d.length > 0 ? (
                <Line data={revenueChartData} options={lineOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No revenue data yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 p-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <ListOrdered size={20} className="text-gray-400" /> Recent Signups
            </h3>
            <div className="flex-1 overflow-y-auto">
              {recent_users && recent_users.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recent_users.map((user) => (
                    <Link
                      to={`/admin/users/${user.id}`}
                      key={user.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 no-underline text-current"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm mb-0">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-0">
                          {user.email}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(user.date).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 p-8">No new users.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-gray-400" /> Recent
            Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          {recent_payments && recent_payments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recent_payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {p.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold uppercase rounded-full bg-indigo-100 text-indigo-800">
                        {p.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(p.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/admin/payments/${p.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 p-8">
              No recent transactions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
