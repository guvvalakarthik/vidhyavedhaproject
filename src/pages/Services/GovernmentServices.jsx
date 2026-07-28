import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaClipboardCheck,
  FaExternalLinkAlt,
  FaFileAlt,
  FaHeadset,
  FaLaptop,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShieldAlt,
  FaTimesCircle,
  FaUniversity,
} from "react-icons/fa";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./GovernmentServices.css";

const SUPPORT_MODES = [
  {
    value: "digital-guidance",
    title: "Digital service guidance",
    description: "Help understanding the official website and the steps you need to complete.",
    icon: <FaLaptop aria-hidden="true" />,
  },
  {
    value: "phone-guidance",
    title: "Phone guidance",
    description: "Ask the support team to call and explain where to start.",
    icon: <FaPhoneAlt aria-hidden="true" />,
  },
  {
    value: "centre-visit-guidance",
    title: "Plan a service-centre visit",
    description: "Get help identifying the correct office and what to take.",
    icon: <FaMapMarkerAlt aria-hidden="true" />,
  },
];

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Other"];

const STATUS_CONTENT = {
  pending: { label: "Request received", detail: "The support team has your request.", className: "received" },
  "under-review": { label: "Being reviewed", detail: "A support worker is reviewing the guidance needed.", className: "review" },
  approved: { label: "Support completed", detail: "The assisted-guidance request has been completed.", className: "complete" },
  rejected: { label: "Unable to complete", detail: "Open the request details or contact support for next steps.", className: "closed" },
};

const emptySupportDetails = {
  supportMode: "",
  district: "",
  preferredLanguage: "English",
  phone: "",
  notes: "",
  consent: false,
};

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(value));

function GovernmentServices() {
  const { user } = useAuth();
  const [view, setView] = useState("services");
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All services");
  const [selectedService, setSelectedService] = useState(null);
  const [checkedRequirements, setCheckedRequirements] = useState([]);
  const [supportStep, setSupportStep] = useState("overview");
  const [supportDetails, setSupportDetails] = useState(emptySupportDetails);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await api.get("/government/services");
        setServices(data.services);
      } catch {
        setError("Government service guidance could not be loaded. Please try again.");
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  const loadRequests = async () => {
    if (!user) return;
    setRequestsLoading(true);
    try {
      const { data } = await api.get("/government/requests/mine");
      setRequests(data.requests);
    } catch {
      setError("Your support requests could not be loaded.");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const categories = useMemo(() => [
    "All services",
    ...Array.from(new Set(services.map((service) => service.category))).sort(),
  ], [services]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = category === "All services" || service.category === category;
      const searchable = [service.name, service.summary, service.authority, service.category].join(" ").toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [services, query, category]);

  const selectService = (service) => {
    setSelectedService(service);
    setCheckedRequirements([]);
    setSupportStep("overview");
    setSupportDetails(emptySupportDetails);
    setConfirmation(null);
    setError("");
  };

  const toggleRequirement = (index) => {
    setCheckedRequirements((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  };

  const startSupport = () => {
    setSupportStep("channel");
    setError("");
  };

  const continueFromChannel = () => {
    if (!supportDetails.supportMode) {
      setError("Choose how you would like the support team to help.");
      return;
    }
    setError("");
    setSupportStep("details");
  };

  const continueFromDetails = () => {
    if (supportDetails.district.trim().length < 2 || !/^[0-9+()\-\s]{7,20}$/.test(supportDetails.phone.trim())) {
      setError("Enter your district and a valid contact number.");
      return;
    }
    setError("");
    setSupportStep("review");
  };

  const submitSupportRequest = async () => {
    if (!supportDetails.consent) {
      setError("Confirm that this is a guidance request before sending it.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/government/requests", {
        serviceCode: selectedService.serviceCode,
        supportMode: supportDetails.supportMode,
        district: supportDetails.district,
        preferredLanguage: supportDetails.preferredLanguage,
        phone: supportDetails.phone,
        notes: supportDetails.notes,
        consent: true,
      });
      setRequests((current) => [data.request, ...current]);
      setConfirmation(data.request);
      setSupportStep("confirmation");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "The support request could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (requestId) => {
    setSubmitting(true);
    setError("");
    try {
      await api.delete(`/government/requests/${requestId}`);
      setRequests((current) => current.filter((request) => request.requestId !== requestId));
      setCancelTarget(null);
    } catch (cancelError) {
      setError(cancelError.response?.data?.error || "The support request could not be cancelled.");
    } finally {
      setSubmitting(false);
    }
  };

  const chosenMode = SUPPORT_MODES.find((mode) => mode.value === supportDetails.supportMode);

  return (
    <div className="government-service-page">
      <section className="government-intro">
        <div className="shell-container government-intro__grid">
          <div>
            <p className="eyebrow">Government services guidance</p>
            <h1>Find the right official service before you apply</h1>
            <p>Check what you need, understand the process and continue safely to the responsible government authority. If the digital route is difficult, request assisted guidance.</p>
          </div>
          <aside className="government-trust-note">
            <FaShieldAlt aria-hidden="true" />
            <div><strong>Guidance, not document issuance</strong><span>Vidhya Vedha does not issue identity documents or collect Aadhaar, PAN, passport or voter numbers.</span></div>
          </aside>
        </div>
      </section>

      <div className="government-tabs shell-container" role="tablist" aria-label="Government services">
        <button type="button" role="tab" aria-selected={view === "services"} onClick={() => setView("services")}>Find a service</button>
        <button type="button" role="tab" aria-selected={view === "requests"} onClick={() => setView("requests")}>My support requests{user && requests.length ? ` (${requests.length})` : ""}</button>
      </div>

      {error && <div className="government-alert shell-container" role="alert">{error}</div>}

      {view === "services" ? (
        <main className="government-directory shell-container">
          <div className="government-directory__heading">
            <div><p className="eyebrow">Service directory</p><h2>What do you need to do?</h2></div>
            <label className="government-search"><span>Search services</span><div><FaSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="For example, passport or certificate" /></div></label>
          </div>

          <div className="government-category-filter" aria-label="Filter by category">
            {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>

          <div className="government-service-workspace">
            <section className="government-results" aria-label="Government service results">
              <p className="government-result-count">{filteredServices.length} {filteredServices.length === 1 ? "service" : "services"}</p>
              {servicesLoading ? <div className="government-loading" role="status">Loading government services...</div> : filteredServices.length ? (
                <div className="government-service-list">
                  {filteredServices.map((service) => (
                    <button type="button" key={service.serviceCode} className={selectedService?.serviceCode === service.serviceCode ? "is-selected" : ""} aria-pressed={selectedService?.serviceCode === service.serviceCode} onClick={() => selectService(service)}>
                      <span className="government-service-list__category">{service.category}</span>
                      <strong>{service.name}</strong>
                      <span>{service.summary}</span>
                      <small>{service.authority}</small>
                      <FaArrowRight aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : <div className="government-empty"><h3>No matching service</h3><p>Try a broader term or clear the category filter.</p><button type="button" onClick={() => { setQuery(""); setCategory("All services"); }}>Clear filters</button></div>}
            </section>

            <section className="government-detail" aria-live="polite">
              {!selectedService ? (
                <div className="government-detail__empty">
                  <FaUniversity aria-hidden="true" />
                  <h2>Choose a service to see official guidance</h2>
                  <p>You will see the issuing authority, likely documents, service steps and the safe official link before sharing any information.</p>
                </div>
              ) : supportStep === "overview" ? (
                <ServiceOverview
                  service={selectedService}
                  checkedRequirements={checkedRequirements}
                  toggleRequirement={toggleRequirement}
                  startSupport={startSupport}
                />
              ) : (
                <SupportJourney
                  service={selectedService}
                  step={supportStep}
                  setStep={setSupportStep}
                  details={supportDetails}
                  setDetails={setSupportDetails}
                  chosenMode={chosenMode}
                  user={user}
                  submitting={submitting}
                  confirmation={confirmation}
                  continueFromChannel={continueFromChannel}
                  continueFromDetails={continueFromDetails}
                  submitSupportRequest={submitSupportRequest}
                  showRequests={() => setView("requests")}
                />
              )}
            </section>
          </div>
        </main>
      ) : (
        <RequestManagement
          user={user}
          requests={requests}
          loading={requestsLoading}
          cancelTarget={cancelTarget}
          setCancelTarget={setCancelTarget}
          cancelRequest={cancelRequest}
          submitting={submitting}
          findService={() => setView("services")}
        />
      )}

      <section className="government-help-strip">
        <div className="shell-container"><FaHeadset aria-hidden="true" /><div><strong>Never pay an unofficial agent for a guaranteed approval</strong><span>Use the named government portal for applications, payments and official status. Our support only helps you understand the process.</span></div><Link to="/contact">Contact support</Link></div>
      </section>
    </div>
  );
}

function ServiceOverview({ service, checkedRequirements, toggleRequirement, startSupport }) {
  return (
    <div className="government-service-detail">
      <span className="government-authority">Official authority: {service.authority}</span>
      <h2>{service.name}</h2>
      <p className="government-service-lead">{service.summary}</p>

      <div className="official-boundary">
        <FaExternalLinkAlt aria-hidden="true" />
        <div><strong>Complete the official transaction with {service.authority}</strong><span>This page prepares and routes you; it does not submit the government application.</span></div>
        <a href={service.officialUrl} target="_blank" rel="noreferrer">{service.officialAction} <FaExternalLinkAlt aria-hidden="true" /></a>
      </div>

      <div className="government-start-grid">
        <div>
          <section className="government-guide-section">
            <p className="government-section-kicker">Before you start</p>
            <h3>How this service usually works</h3>
            <ol className="government-process-list">
              {service.steps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><strong>{step.title}</strong><p>{step.description}</p></div></li>)}
            </ol>
          </section>

          <section className="government-guide-section">
            <p className="government-section-kicker">Document checklist</p>
            <h3>Check what you may need</h3>
            <p className="government-guidance-note">This checklist stays in your browser. Confirm the exact documents on the official service because requirements can vary.</p>
            <div className="government-requirements">
              {service.requirements.map((requirement, index) => (
                <label key={requirement} className={checkedRequirements.includes(index) ? "is-checked" : ""}>
                  <input type="checkbox" checked={checkedRequirements.includes(index)} onChange={() => toggleRequirement(index)} />
                  <span><FaCheck aria-hidden="true" /></span>{requirement}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="government-before-card">
          <h3>Service information</h3>
          <dl>
            <div><dt>Available through</dt><dd>{service.access.join("; ")}</dd></div>
            <div><dt>Processing</dt><dd>{service.timeNote}</dd></div>
            <div><dt>Fees</dt><dd>{service.feeNote}</dd></div>
          </dl>
          <a className="government-primary-link" href={service.officialUrl} target="_blank" rel="noreferrer">{service.officialAction} <FaExternalLinkAlt aria-hidden="true" /></a>
          <button type="button" className="government-support-button" onClick={startSupport}>Get assisted support</button>
          <p>We will not ask for an official identity or application number.</p>
        </aside>
      </div>
    </div>
  );
}

function SupportJourney({ service, step, setStep, details, setDetails, chosenMode, user, submitting, confirmation, continueFromChannel, continueFromDetails, submitSupportRequest, showRequests }) {
  const update = (field, value) => setDetails((current) => ({ ...current, [field]: value }));
  return (
    <div className="government-support-journey">
      {step !== "confirmation" && <button type="button" className="government-back-link" onClick={() => setStep(step === "channel" ? "overview" : step === "details" ? "channel" : "details")}><FaArrowLeft aria-hidden="true" /> Back</button>}
      <p className="government-section-kicker">Assisted support · {service.name}</p>

      {step === "channel" && (
        <div className="government-question-page">
          <span>Question 1 of 2</span>
          <h2>How would you like us to help?</h2>
          <p>Choose one option. This support explains the process; it cannot approve or accelerate an official application.</p>
          <fieldset><legend className="sr-only">Support method</legend>{SUPPORT_MODES.map((mode) => <label key={mode.value} className={details.supportMode === mode.value ? "is-selected" : ""}><input type="radio" name="support-mode" value={mode.value} checked={details.supportMode === mode.value} onChange={() => update("supportMode", mode.value)} /><span className="government-mode-icon">{mode.icon}</span><span><strong>{mode.title}</strong><small>{mode.description}</small></span></label>)}</fieldset>
          <button type="button" className="government-continue" onClick={continueFromChannel}>Continue</button>
        </div>
      )}

      {step === "details" && (
        <div className="government-question-page">
          <span>Question 2 of 2</span>
          <h2>Where and how should we contact you?</h2>
          <p>Only provide details needed for this guidance request. Do not enter Aadhaar, PAN, passport, voter or licence numbers.</p>
          <div className="government-contact-fields">
            <label>District or city<input value={details.district} onChange={(event) => update("district", event.target.value)} autoComplete="address-level2" /></label>
            <label>Preferred language<select value={details.preferredLanguage} onChange={(event) => update("preferredLanguage", event.target.value)}>{LANGUAGES.map((language) => <option key={language}>{language}</option>)}</select></label>
            <label>Contact number<input value={details.phone} onChange={(event) => update("phone", event.target.value)} inputMode="tel" autoComplete="tel" /></label>
            <label className="government-notes-field">What do you need help understanding? <span>(optional)</span><textarea value={details.notes} onChange={(event) => update("notes", event.target.value)} rows="4" maxLength="500" /></label>
          </div>
          <button type="button" className="government-continue" onClick={continueFromDetails}>Continue</button>
        </div>
      )}

      {step === "review" && (
        <div className="government-review-page">
          <h2>Check your support request</h2>
          <p>Nothing here is sent to the issuing authority. This creates a Vidhya Vedha guidance request only.</p>
          <dl className="government-answer-list">
            <div><dt>Service</dt><dd>{service.name}</dd><button type="button" onClick={() => setStep("overview")}>Change</button></div>
            <div><dt>Support method</dt><dd>{chosenMode?.title}</dd><button type="button" onClick={() => setStep("channel")}>Change</button></div>
            <div><dt>District or city</dt><dd>{details.district}</dd><button type="button" onClick={() => setStep("details")}>Change</button></div>
            <div><dt>Language</dt><dd>{details.preferredLanguage}</dd><button type="button" onClick={() => setStep("details")}>Change</button></div>
            <div><dt>Contact number</dt><dd>{details.phone}</dd><button type="button" onClick={() => setStep("details")}>Change</button></div>
            <div><dt>Help needed</dt><dd>{details.notes || "Not provided"}</dd><button type="button" onClick={() => setStep("details")}>Change</button></div>
          </dl>
          <label className="government-consent"><input type="checkbox" checked={details.consent} onChange={(event) => update("consent", event.target.checked)} /><span>I understand this is a guidance request, not an official government application.</span></label>
          {!user ? <div className="government-signin-gate"><h3>Sign in to send this request</h3><p>Your account keeps support details private and lets you track progress.</p><Link to="/login" state={{ from: { pathname: "/services/government" } }}>Sign in to continue</Link></div> : <button type="button" className="government-continue" onClick={submitSupportRequest} disabled={submitting}>{submitting ? "Sending..." : "Send support request"}</button>}
        </div>
      )}

      {step === "confirmation" && (
        <div className="government-confirmation" role="status">
          <FaCheckCircle aria-hidden="true" />
          <p className="government-section-kicker">Request received</p>
          <h2>Your reference is {confirmation?.requestId}</h2>
          <p>The support team will review your request for {service.name}. Keep this reference; the official government application must still be completed with {service.authority}.</p>
          <div><button type="button" onClick={showRequests}>View my support requests</button><a href={service.officialUrl} target="_blank" rel="noreferrer">Continue to official service <FaExternalLinkAlt aria-hidden="true" /></a></div>
        </div>
      )}
    </div>
  );
}

function RequestManagement({ user, requests, loading, cancelTarget, setCancelTarget, cancelRequest, submitting, findService }) {
  return (
    <section className="government-requests shell-container" aria-labelledby="government-requests-heading">
      <div className="government-requests__heading"><p className="eyebrow">Your account</p><h2 id="government-requests-heading">Government support requests</h2><p>Track guidance requested from Vidhya Vedha. Official applications and their status remain with the responsible authority.</p></div>
      {!user ? (
        <div className="government-request-signin"><FaClipboardCheck aria-hidden="true" /><div><h3>Sign in to view support requests</h3><p>Only requests linked to your account are shown here.</p></div><Link to="/login" state={{ from: { pathname: "/services/government" } }}>Sign in</Link></div>
      ) : loading ? <div className="government-loading" role="status">Loading your support requests...</div> : requests.length ? (
        <div className="government-request-list">
          {requests.map((request) => {
            const status = STATUS_CONTENT[request.status] || STATUS_CONTENT.pending;
            const canCancel = ["pending", "under-review"].includes(request.status);
            return (
              <article className="government-request" key={request.requestId}>
                <div className={`government-request__status government-request__status--${status.className}`}><span></span>{status.label}</div>
                <div className="government-request__body"><h3>{request.serviceName}</h3><p>{status.detail}</p><dl><div><dt>Reference</dt><dd>{request.requestId}</dd></div><div><dt>Requested</dt><dd>{formatDate(request.submittedAt)}</dd></div>{request.district && <div><dt>Location</dt><dd>{request.district}</dd></div>}</dl></div>
                {canCancel && <div className="government-request__actions">{cancelTarget === request.requestId ? <div><strong>Cancel this guidance request?</strong><button type="button" onClick={() => cancelRequest(request.requestId)} disabled={submitting}>Yes, cancel</button><button type="button" onClick={() => setCancelTarget(null)}>Go back</button></div> : <button type="button" onClick={() => setCancelTarget(request.requestId)}><FaTimesCircle aria-hidden="true" /> Cancel request</button>}</div>}
              </article>
            );
          })}
        </div>
      ) : <div className="government-no-requests"><FaFileAlt aria-hidden="true" /><h3>No support requests yet</h3><p>You can use every official-service guide without signing in.</p><button type="button" onClick={findService}>Find a government service</button></div>}
    </section>
  );
}

export default GovernmentServices;