import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaChartPie, FaClock, FaCheckCircle, FaTimesCircle, FaHourglass, FaFileAlt, FaArrowUp, FaArrowDown, FaCalendar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import "./Analytics.css";

const categories = ["education", "emergency", "banking", "healthcare", "farming", "utilities", "ecommerce", "home-maintenance", "government", "contact"];

const categoryColors = {
  education: "#8b5cf6",
  emergency: "#f59e0b",
  banking: "#3b82f6",
  healthcare: "#ef4444",
  farming: "#22c55e",
  utilities: "#06b6d4",
  ecommerce: "#ec4899",
  "home-maintenance": "#14b8a6",
  government: "#6366f1",
  contact: "#a78bfa",
};

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchApplications();
    }
  }, [user, authLoading, navigate]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/");
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics…</p>
      </div>
    );
  }

  // ===== Compute Stats =====
  const total = applications.length;
  const byStatus = {
    pending: applications.filter((a) => a.status === "pending").length,
    "under-review": applications.filter((a) => a.status === "under-review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const byCategory = categories
    .map((cat) => ({
      category: cat,
      count: applications.filter((a) => a.category === cat).length,
      color: categoryColors[cat],
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Last 7 days trend
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = applications.filter((a) => {
      const appDate = new Date(a.createdAt).toISOString().split("T")[0];
      return appDate === dateStr;
    }).length;
    last7Days.push({
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      count,
    });
  }

  const maxDaily = Math.max(...last7Days.map((d) => d.count), 1);
  const maxCategory = Math.max(...byCategory.map((c) => c.count), 1);

  // Approval rate
  const decided = byStatus.approved + byStatus.rejected;
  const approvalRate = decided > 0 ? Math.round((byStatus.approved / decided) * 100) : 0;

  // Status breakdown for donut
  const statusData = [
    { label: "Pending", value: byStatus.pending, color: "#f59e0b" },
    { label: "Under Review", value: byStatus["under-review"], color: "#3b82f6" },
    { label: "Approved", value: byStatus.approved, color: "#22c55e" },
    { label: "Rejected", value: byStatus.rejected, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  // Donut chart calculation
  const donutTotal = statusData.reduce((sum, s) => sum + s.value, 0) || 1;
  let cumulativePercent = 0;
  const donutSegments = statusData.map((s) => {
    const percent = (s.value / donutTotal) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;
    return { ...s, percent, startAngle, endAngle };
  });

  function polarToCartesian(cx, cy, radius, angleDeg) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  }

  function describeArc(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1><FaChartBar /> Analytics Dashboard</h1>
        <p>Visual insights into application trends and performance</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><FaFileAlt /></div>
          <div className="kpi-body">
            <span className="kpi-value">{total}</span>
            <span className="kpi-label">Total Applications</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><FaCheckCircle /></div>
          <div className="kpi-body">
            <span className="kpi-value">{byStatus.approved}</span>
            <span className="kpi-label">Approved</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><FaClock /></div>
          <div className="kpi-body">
            <span className="kpi-value">{byStatus.pending}</span>
            <span className="kpi-label">Pending</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><FaChartPie /></div>
          <div className="kpi-body">
            <span className="kpi-value">{approvalRate}%</span>
            <span className="kpi-label">Approval Rate</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        {/* 7-Day Trend Chart */}
        <div className="chart-card trend-card">
          <h3><FaCalendar /> Applications — Last 7 Days</h3>
          <div className="trend-chart">
            {last7Days.map((day, i) => (
              <div className="trend-bar-col" key={i}>
                <div className="trend-bar-wrapper">
                  <div
                    className="trend-bar"
                    style={{
                      height: `${(day.count / maxDaily) * 100}%`,
                      background: day.count > 0
                        ? "linear-gradient(180deg, #3b82f6, #6366f1)"
                        : "#e2e8f0",
                    }}
                  >
                    {day.count > 0 && <span className="trend-bar-value">{day.count}</span>}
                  </div>
                </div>
                <span className="trend-day-label">{day.label}</span>
                <span className="trend-day-date">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="chart-card donut-card">
          <h3>Status Breakdown</h3>
          {donutSegments.length > 0 ? (
            <div className="donut-container">
              <svg viewBox="0 0 200 200" className="donut-svg">
                {donutSegments.map((seg, i) => (
                  <path
                    key={i}
                    d={describeArc(100, 100, 80, seg.startAngle, seg.endAngle)}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                ))}
                <text x="100" y="95" textAnchor="middle" className="donut-center-num">{donutTotal}</text>
                <text x="100" y="115" textAnchor="middle" className="donut-center-label">Total</text>
              </svg>
              <div className="donut-legend">
                {statusData.map((s, i) => (
                  <div className="legend-item" key={i}>
                    <span className="legend-dot" style={{ background: s.color }}></span>
                    <span className="legend-label">{s.label}</span>
                    <span className="legend-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">No data available</div>
          )}
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="chart-card category-chart-card">
        <h3>Applications by Category</h3>
        {byCategory.length > 0 ? (
          <div className="category-chart">
            {byCategory.map((cat, i) => (
              <div className="cat-chart-row" key={i}>
                <span className="cat-chart-name" style={{ color: cat.color }}>
                  {cat.category}
                </span>
                <div className="cat-chart-bar-track">
                  <div
                    className="cat-chart-bar-fill"
                    style={{
                      width: `${(cat.count / maxCategory) * 100}%`,
                      background: cat.color,
                    }}
                  >
                    <span className="cat-chart-bar-count">{cat.count}</span>
                  </div>
                </div>
                <span className="cat-chart-percent">
                  {Math.round((cat.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="chart-empty">No applications submitted yet</div>
        )}
      </div>

      {/* Status Summary Cards */}
      <div className="status-summary-grid">
        <div className="status-summary-card pending">
          <FaClock className="status-summary-icon" />
          <div>
            <span className="status-summary-num">{byStatus.pending}</span>
            <span className="status-summary-label">Pending</span>
          </div>
        </div>
        <div className="status-summary-card review">
          <FaHourglass className="status-summary-icon" />
          <div>
            <span className="status-summary-num">{byStatus["under-review"]}</span>
            <span className="status-summary-label">Under Review</span>
          </div>
        </div>
        <div className="status-summary-card approved">
          <FaCheckCircle className="status-summary-icon" />
          <div>
            <span className="status-summary-num">{byStatus.approved}</span>
            <span className="status-summary-label">Approved</span>
          </div>
        </div>
        <div className="status-summary-card rejected">
          <FaTimesCircle className="status-summary-icon" />
          <div>
            <span className="status-summary-num">{byStatus.rejected}</span>
            <span className="status-summary-label">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
