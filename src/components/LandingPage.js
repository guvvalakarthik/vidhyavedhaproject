import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import { FaSearch, FaMapMarkerAlt, FaUniversity, FaBook, FaTractor, FaHeartbeat, FaBolt, FaShoppingCart, FaTools, FaBuilding, FaShieldAlt, FaClock, FaUsers, FaFileAlt, FaArrowRight } from "react-icons/fa";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";

const services = [
  { icon: <FaUniversity />, title: "Banking & Loans", desc: "Apply for loans, insurance, and banking assistance", color: "#3b82f6" },
  { icon: <FaBook />, title: "Education", desc: "Exam applications, university admissions, coaching", color: "#8b5cf6" },
  { icon: <FaHeartbeat />, title: "Healthcare", desc: "Telemedicine, lab tests, ambulance booking", color: "#ef4444" },
  { icon: <FaTractor />, title: "Farming", desc: "Soil testing, fertilizer, crop insurance, equipment", color: "#22c55e" },
  { icon: <FaBolt />, title: "Emergency", desc: "24x7 towing, mechanic dispatch, roadside assistance", color: "#f59e0b" },
  { icon: <FaShoppingCart />, title: "E-Commerce", desc: "Bill payments, UPI setup, courier services", color: "#ec4899" },
  { icon: <FaTools />, title: "Home Services", desc: "Electrician, plumber, pest control, repairs", color: "#14b8a6" },
  { icon: <FaBuilding />, title: "Government", desc: "Aadhaar, PAN, Voter ID, certificates, pensions", color: "#6366f1" },
];

const stats = [
  { icon: <FaUsers />, value: "10,000+", label: "Users Served" },
  { icon: <FaFileAlt />, value: "5,000+", label: "Applications Processed" },
  { icon: <FaShieldAlt />, value: "9", label: "Service Categories" },
  { icon: <FaClock />, value: "24x7", label: "Support Available" },
];

const steps = [
  { num: "1", title: "Register & Login", desc: "Create your free account in seconds to access all services." },
  { num: "2", title: "Choose a Service", desc: "Browse 9 categories of essential services and pick what you need." },
  { num: "3", title: "Submit Application", desc: "Fill out a simple form and get a unique Application ID instantly." },
  { num: "4", title: "Track Your Status", desc: "Use your Application ID to check status anytime, anywhere." },
];

const LandingPage = () => {
  const [applicationId, setApplicationId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleStatusCheck = async () => {
    if (!applicationId.trim()) {
      setStatusError("Please enter an Application ID.");
      return;
    }
    setLoading(true);
    setStatusError("");
    setStatusResult(null);
    try {
      const { data } = await api.get(`/status/${applicationId.trim()}`);
      setStatusResult(data);
    } catch (err) {
      setStatusError(err.response?.data?.error || "Application not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Empowering Rural India, <span className="gradient-text">Digitally</span>
          </h1>
          <p className="hero-subtitle">
            One platform for all your essential services — banking, education,
            healthcare, farming, government services, and more.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/services/banking" className="btn-primary">
                Explore Services <FaArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Get Started Free <FaArrowRight />
                </Link>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        {stats.map((stat, i) => (
          <div className="stat-item" key={i}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Services Grid */}
      <section className="services-section" id="services">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Nine categories covering everything you need, all in one place</p>
        </div>
        <div className="services-grid">
          {services.map((service, i) => (
            <Link
              to={`/services/${service.title.toLowerCase().split(" ")[0] === "home" ? "home-maintenance" : service.title.toLowerCase().split(" ")[0] === "e-commerce" ? "ecommerce" : service.title.toLowerCase().split(" ")[0] === "government" ? "government" : service.title.toLowerCase().split(" ")[0]}`}
              className="service-card"
              key={i}
              style={{ "--card-color": service.color }}
            >
              <div className="service-icon-wrapper" style={{ background: `${service.color}15`, color: service.color }}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <span className="service-link" style={{ color: service.color }}>
                Learn more <FaArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get your application submitted in 4 simple steps</p>
        </div>
        <div className="steps-container">
          {steps.map((step, i) => (
            <div className="step-card" key={i}>
              <div className="step-number">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < steps.length - 1 && <div className="step-arrow"><FaArrowRight /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Application Status Tracker */}
      <section className="status-tracker" id="track">
        <div className="section-header">
          <h2>Track Your Application</h2>
          <p>Enter your Application ID to check the current status</p>
        </div>
        <div className="status-tracker-card">
          <div className="status-input-row">
            <input
              type="text"
              placeholder="Enter your Application ID (e.g. EDU-XXXXX)"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStatusCheck()}
            />
            <button onClick={handleStatusCheck} disabled={loading}>
              {loading ? "Checking…" : <><FaSearch /> Check Status</>}
            </button>
          </div>

          {statusError && <div className="status-error-msg">{statusError}</div>}

          {statusResult && (
            <div className="status-success-msg">
              <div className="status-row">
                <span className="status-label">Application ID</span>
                <span className="status-value">{statusResult.applicationId}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Service</span>
                <span className="status-value">{statusResult.serviceType}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Category</span>
                <span className="status-value">{statusResult.category}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Status</span>
                <span
                  className={`status-badge status-${statusResult.status}`}
                >
                  {statusResult.status.toUpperCase()}
                </span>
              </div>
              <div className="status-row">
                <span className="status-label">Submitted</span>
                <span className="status-value">
                  {new Date(statusResult.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who've simplified their service access with Vidhya Vedha</p>
          {user ? (
            <Link to="/services/banking" className="btn-primary">
              Explore Services <FaArrowRight />
            </Link>
          ) : (
            <Link to="/register" className="btn-primary">
              Create Free Account <FaArrowRight />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
