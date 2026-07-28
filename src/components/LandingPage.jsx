import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaBook,
  FaBuilding,
  FaCheckCircle,
  FaFileAlt,
  FaHeartbeat,
  FaSearch,
  FaShieldAlt,
  FaShoppingCart,
  FaTools,
  FaTractor,
  FaUniversity,
} from "react-icons/fa";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./LandingPage.css";

const services = [
  {
    icon: FaBuilding,
    title: "Government documents",
    description: "Certificates, identity documents, pensions and public schemes.",
    examples: "Aadhaar support, PAN, voter services",
    route: "government",
    keywords: "government aadhaar pan voter pension certificate",
  },
  {
    icon: FaHeartbeat,
    title: "Health and care",
    description: "Find consultations, diagnostics, vaccination and ambulance support.",
    examples: "Appointments, lab tests, medicine",
    route: "healthcare",
    keywords: "health doctor hospital medicine ambulance vaccination lab",
  },
  {
    icon: FaTractor,
    title: "Agriculture and farming",
    description: "Access crop, soil, equipment, insurance and advisory services.",
    examples: "Crop insurance, soil testing, equipment",
    route: "farming",
    keywords: "farmer farming agriculture crop soil fertilizer insurance",
  },
  {
    icon: FaBook,
    title: "Education and learning",
    description: "Get support for admissions, examinations and learning services.",
    examples: "Admissions, exams, scholarships",
    route: "education",
    keywords: "education student school college exam admission scholarship",
  },
  {
    icon: FaUniversity,
    title: "Money and banking",
    description: "Find official financial routes, estimate loan cost and prepare complaint or application checklists.",
    examples: "Accounts, loans, financial support",
    route: "banking",
    keywords: "bank banking money loan account insurance finance",
  },
  {
    icon: FaBolt,
    title: "Electricity and utilities",
    description: "Request support for electricity, water and essential connections.",
    examples: "Bill support, connections, complaints",
    route: "utilities",
    keywords: "electricity power water utilities bill connection complaint",
  },
  {
    icon: FaTools,
    title: "Home maintenance",
    description: "Arrange trusted assistance for common household repair needs.",
    examples: "Plumbing, electrical, repairs",
    route: "home-maintenance",
    keywords: "home plumber electrician repair maintenance pest",
  },
  {
    icon: FaShoppingCart,
    title: "Digital and commerce help",
    description: "Get help with payments, online purchases and delivery services.",
    examples: "UPI, bill payment, courier support",
    route: "ecommerce",
    keywords: "online ecommerce upi payment courier shopping digital",
  },
  {
    icon: FaShieldAlt,
    title: "Roadside assistance",
    description: "Request vehicle recovery and roadside support when you need it.",
    examples: "Towing, tyre repair, mechanic dispatch",
    route: "emergency",
    keywords: "emergency roadside towing mechanic tyre vehicle recovery",
  },
];

const popularTasks = [
  { label: "Apply for government document support", route: "government" },
  { label: "Find healthcare services", route: "healthcare" },
  { label: "Request farming assistance", route: "farming" },
  { label: "Get electricity or utility help", route: "utilities" },
];

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) =>
      `${service.title} ${service.description} ${service.examples} ${service.keywords}`
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  const handleServiceSearch = (event) => {
    event.preventDefault();
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStatusCheck = async (event) => {
    event.preventDefault();
    const cleanId = applicationId.trim();
    if (!cleanId) {
      setStatusError("Enter your application ID.");
      return;
    }

    setLoading(true);
    setStatusError("");
    setStatusResult(null);
    try {
      const { data } = await api.get(`/status/${cleanId}`);
      setStatusResult(data);
    } catch (error) {
      setStatusError(error.response?.data?.error || "We could not find that application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="civic-home">
      <section className="civic-hero" aria-labelledby="home-title">
        <div className="shell-container civic-hero__grid">
          <div className="civic-hero__content">
            <p className="eyebrow">Services for everyday needs</p>
            <h1 id="home-title">Find and access essential services</h1>
            <p className="civic-hero__lead">
              Search government, health, education, farming, banking and local support services from one place.
            </p>

            <form className="service-finder" role="search" onSubmit={handleServiceSearch}>
              <label htmlFor="service-search">What do you need help with?</label>
              <div className="service-finder__controls">
                <input
                  id="service-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="For example, crop insurance or doctor"
                />
                <button type="submit"><FaSearch aria-hidden="true" /> Search services</button>
              </div>
            </form>

            <div className="civic-hero__actions">
              {user ? (
                <Link to="/dashboard" className="civic-button civic-button--light">
                  View my applications <FaArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="civic-button civic-button--gold">
                    Create an account <FaArrowRight aria-hidden="true" />
                  </Link>
                  <span>Already registered? <Link to="/login">Sign in</Link></span>
                </>
              )}
            </div>
          </div>

          <aside className="popular-panel" aria-labelledby="popular-title">
            <h2 id="popular-title">Popular tasks</h2>
            <ul>
              {popularTasks.map((task) => (
                <li key={task.route}>
                  <Link to={`/services/${task.route}`}>
                    {task.label}<FaArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {user && (
        <section className="account-strip" aria-label="Your account summary">
          <div className="shell-container account-strip__inner">
            <div>
              <span className="account-strip__kicker">Signed in</span>
              <h2>Welcome back, {user.name}</h2>
              <p>Continue an application or check an update from your account.</p>
            </div>
            <div className="account-strip__links">
              <Link to="/dashboard">My applications</Link>
              <Link to="/notifications">Notifications</Link>
            </div>
          </div>
        </section>
      )}

      <main>
        <section className="service-directory shell-container" id="services" aria-labelledby="services-title">
          <div className="section-heading section-heading--left">
            <p className="eyebrow">Browse by topic</p>
            <h2 id="services-title">Services</h2>
            <p>Choose a topic to see the help available and what you will need.</p>
          </div>

          <p className="result-count" aria-live="polite">
            {filteredServices.length === services.length
              ? `${services.length} service topics`
              : `${filteredServices.length} result${filteredServices.length === 1 ? "" : "s"} for “${searchQuery.trim()}”`}
          </p>

          {filteredServices.length > 0 ? (
            <ul className="service-directory__grid">
              {filteredServices.map((service) => {
                const Icon = service.icon;
                return (
                  <li key={service.route}>
                    <Link to={`/services/${service.route}`} className="directory-card">
                      <span className="directory-card__icon" aria-hidden="true"><Icon /></span>
                      <span className="directory-card__body">
                        <strong>{service.title}</strong>
                        <span>{service.description}</span>
                        <small>{service.examples}</small>
                      </span>
                      <FaArrowRight className="directory-card__arrow" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-results" role="status">
              <h3>No matching services</h3>
              <p>Try a shorter search, such as “health”, “loan” or “certificate”.</p>
              <button type="button" onClick={() => setSearchQuery("")}>Show all services</button>
            </div>
          )}
        </section>

        <section className="process-section">
          <div className="shell-container process-grid">
            <div>
              <div className="section-heading section-heading--left">
                <p className="eyebrow">A clear process</p>
                <h2>How an application works</h2>
              </div>
              <ol className="process-list">
                <li>
                  <span>1</span>
                  <div><h3>Choose the right service</h3><p>Read the service details before you begin.</p></div>
                </li>
                <li>
                  <span>2</span>
                  <div><h3>Provide only what is needed</h3><p>Complete the guided request and review your information.</p></div>
                </li>
                <li>
                  <span>3</span>
                  <div><h3>Follow progress in your account</h3><p>Your applications and status updates stay together.</p></div>
                </li>
              </ol>
            </div>

            <aside className="before-you-start" aria-labelledby="before-title">
              <FaFileAlt aria-hidden="true" />
              <h2 id="before-title">Before you start</h2>
              <p>Requirements differ by service. A service page should explain eligibility, documents, timing and next steps before asking for details.</p>
              <Link to="/#services">Browse service topics</Link>
            </aside>
          </div>
        </section>

        <section className="tracking-section shell-container" aria-labelledby="tracking-title">
          <div className="tracking-section__intro">
            <p className="eyebrow">Application updates</p>
            <h2 id="tracking-title">Track an application</h2>
            <p>For privacy, application progress is available only after you sign in.</p>
          </div>

          {user ? (
            <form className="tracking-card" onSubmit={handleStatusCheck}>
              <label htmlFor="application-id">Application ID</label>
              <div className="tracking-card__controls">
                <input
                  id="application-id"
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  placeholder="For example, GOV-12AB34CD"
                />
                <button type="submit" disabled={loading}>{loading ? "Checking..." : "Check status"}</button>
              </div>
              {statusError && <div className="notice notice--error" role="alert">{statusError}</div>}
              {statusResult && (
                <div className="status-summary" role="status">
                  <FaCheckCircle aria-hidden="true" />
                  <div>
                    <strong>{statusResult.serviceType}</strong>
                    <span>{statusResult.applicationId} · {statusResult.status.replace("-", " ")}</span>
                  </div>
                  <Link to="/dashboard">View details</Link>
                </div>
              )}
            </form>
          ) : (
            <div className="tracking-card tracking-card--signin">
              <FaShieldAlt aria-hidden="true" />
              <div>
                <h3>Sign in to see your applications</h3>
                <p>We use your account to prevent other people from viewing your status.</p>
              </div>
              <Link to="/login" className="civic-button civic-button--green">Sign in</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default LandingPage;