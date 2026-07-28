import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCar,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaRoute,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Emergency.css";

const STATUS_STEPS = ["requested", "assigned", "en-route", "arrived", "completed"];
const STATUS_LABELS = {
  requested: "Request received",
  assigned: "Unit assigned",
  "en-route": "On the way",
  arrived: "Responder arrived",
  completed: "Completed",
  cancelled: "Cancelled",
};
const VEHICLES = [
  ["car", "Car"],
  ["motorcycle", "Motorcycle"],
  ["auto-rickshaw", "Auto-rickshaw"],
  ["van", "Van"],
  ["commercial", "Commercial vehicle"],
  ["other", "Other"],
];
const SERVICE_SYMBOLS = {
  towing: "Tow",
  "flat-tyre": "Tyre",
  "battery-jump": "Battery",
  "fuel-delivery": "Fuel",
  "vehicle-lockout": "Unlock",
  mechanic: "Repair",
};

const getError = (error, fallback) => error.response?.data?.error || fallback;
const nextStatus = (status) => ({ assigned: "en-route", "en-route": "arrived", arrived: "completed" })[status];
const formatStatus = (status) => STATUS_LABELS[status] || status;
const formatDateTime = (value) => new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

function StatusTimeline({ request }) {
  const currentIndex = STATUS_STEPS.indexOf(request.status);
  if (request.status === "cancelled") {
    return <div className="road-status road-status--cancelled">This roadside request was cancelled.</div>;
  }

  return (
    <ol className="road-timeline" aria-label={`Current status: ${formatStatus(request.status)}`}>
      {STATUS_STEPS.map((status, index) => (
        <li className={index <= currentIndex ? "is-complete" : ""} key={status}>
          <span aria-hidden="true">{index < currentIndex ? "✓" : index + 1}</span>
          <small>{formatStatus(status)}</small>
        </li>
      ))}
    </ol>
  );
}

function Emergency() {
  const { user } = useAuth();
  const isDispatcher = user && ["dispatcher", "admin"].includes(user.role);
  const [view, setView] = useState("request");
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [immediateDanger, setImmediateDanger] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [safetyStatus, setSafetyStatus] = useState("safe");
  const [location, setLocation] = useState({ description: "" });
  const [locationMessage, setLocationMessage] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [assignmentTarget, setAssignmentTarget] = useState(null);
  const [assignment, setAssignment] = useState({ unitName: "", unitPhone: "", etaMinutes: "30" });

  const selectedService = useMemo(
    () => services.find((service) => service.code === serviceCode),
    [services, serviceCode],
  );

  useEffect(() => {
    api.get("/emergency/services")
      .then(({ data }) => setServices(data.services))
      .catch((requestError) => setError(getError(requestError, "Roadside services could not be loaded.")));
  }, []);

  const loadMyRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/emergency/requests/mine");
      setRequests(data.requests);
    } catch (requestError) {
      setError(getError(requestError, "Your roadside requests could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadQueue = useCallback(async () => {
    if (!isDispatcher) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/emergency/dispatch/queue");
      setQueue(data.requests);
    } catch (requestError) {
      setError(getError(requestError, "The dispatch queue could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [isDispatcher]);

  useEffect(() => {
    if (view === "track") loadMyRequests();
    if (view === "dispatch") loadQueue();
  }, [view, loadMyRequests, loadQueue]);

  const changeView = (nextView) => {
    setView(nextView);
    setError("");
    setSuccess("");
  };

  const captureLocation = () => {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Location capture is not supported. Enter a nearby landmark or road name instead.");
      return;
    }
    setLocationMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation((current) => ({
          ...current,
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        }));
        setLocationMessage("Location coordinates added. Please still describe a visible nearby landmark.");
      },
      () => setLocationMessage("We could not access your location. Enter a nearby landmark or road name instead."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const advance = () => {
    setError("");
    if (step === 1 && immediateDanger !== "no") {
      setError("Confirm that nobody is in immediate danger before requesting roadside assistance.");
      return;
    }
    if (step === 2 && !serviceCode) {
      setError("Choose the roadside assistance you need.");
      return;
    }
    if (step === 3 && location.description.trim().length < 5) {
      setError("Add a precise road name, direction or nearby landmark.");
      return;
    }
    setStep((current) => Math.min(current + 1, 4));
  };

  const submitRequest = async () => {
    setError("");
    if (!contactPhone.trim() || !vehicleType) {
      setError("Add a contact number and vehicle type.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/emergency/requests", {
        serviceCode,
        contactPhone,
        vehicleType,
        vehicleDescription,
        location,
        safetyStatus,
        notes,
      });
      setConfirmation(data.request);
      setRequests((current) => [data.request, ...current]);
      setSuccess("Your request has been sent to the dispatch queue.");
    } catch (requestError) {
      setError(getError(requestError, "The roadside request could not be sent."));
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.patch(`/emergency/requests/${requestId}/cancel`);
      setRequests((current) => current.map((item) => item.requestId === requestId ? data.request : item));
      setCancelTarget(null);
      setSuccess("Roadside request cancelled.");
    } catch (requestError) {
      setError(getError(requestError, "The request could not be cancelled."));
    } finally {
      setLoading(false);
    }
  };

  const assignUnit = async (requestId) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.patch(`/emergency/dispatch/${requestId}/assign`, assignment);
      setQueue((current) => current.map((item) => item.requestId === requestId ? data.request : item));
      setAssignmentTarget(null);
      setAssignment({ unitName: "", unitPhone: "", etaMinutes: "30" });
      setSuccess(`Response unit assigned to ${requestId}.`);
    } catch (requestError) {
      setError(getError(requestError, "The response unit could not be assigned."));
    } finally {
      setLoading(false);
    }
  };

  const progressDispatch = async (request) => {
    const status = nextStatus(request.status);
    if (!status) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.patch(`/emergency/dispatch/${request.requestId}/status`, { status });
      if (status === "completed") {
        setQueue((current) => current.filter((item) => item.requestId !== request.requestId));
      } else {
        setQueue((current) => current.map((item) => item.requestId === request.requestId ? data.request : item));
      }
      setSuccess(`${request.requestId} marked ${formatStatus(status).toLowerCase()}.`);
    } catch (requestError) {
      setError(getError(requestError, "The request status could not be updated."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="roadside-page">
      <section className="roadside-hero">
        <div className="shell-container roadside-hero__inner">
          <div>
            <p className="roadside-eyebrow">Roadside response</p>
            <h1>Help for a vehicle breakdown</h1>
            <p>Tell dispatch where you are, request the right kind of help, and follow the response from assignment to arrival.</p>
          </div>
          <div className="roadside-hero__promise">
            <FaShieldAlt aria-hidden="true" />
            <div><strong>Safety comes first</strong><span>This service is for breakdown support, not medical, fire or police emergencies.</span></div>
          </div>
        </div>
      </section>

      <nav className="roadside-tabs shell-container" role="tablist" aria-label="Roadside assistance">
        <button type="button" role="tab" aria-selected={view === "request"} onClick={() => changeView("request")}><FaTruck aria-hidden="true" /> Request help</button>
        <button type="button" role="tab" aria-selected={view === "track"} onClick={() => changeView("track")}><FaRoute aria-hidden="true" /> Track requests{user && requests.length ? ` (${requests.length})` : ""}</button>
        {isDispatcher && <button type="button" role="tab" aria-selected={view === "dispatch"} onClick={() => changeView("dispatch")}><FaClock aria-hidden="true" /> Dispatch queue</button>}
      </nav>

      {error && <div className="roadside-alert roadside-alert--error shell-container" role="alert">{error}</div>}
      {success && <div className="roadside-alert roadside-alert--success shell-container" role="status">{success}</div>}

      {view === "request" && (
        <div className="roadside-workspace shell-container">
          <aside className="roadside-progress" aria-label="Request progress">
            {["Check safety", "Choose help", "Share location", "Review request"].map((label, index) => (
              <div className={step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""} key={label}>
                <span>{step > index + 1 ? "✓" : index + 1}</span><p>{label}</p>
              </div>
            ))}
          </aside>

          <section className="roadside-panel">
            {confirmation ? (
              <div className="roadside-confirmation" role="status">
                <FaCheckCircle aria-hidden="true" />
                <p className="roadside-eyebrow">Request received</p>
                <h2>Dispatch has your location</h2>
                <p>Your request reference is <strong>{confirmation.requestId}</strong>. Keep this reference if you contact support.</p>
                <div className="confirmation-summary"><span>{confirmation.serviceName}</span><span>{confirmation.location.description}</span><span>{formatStatus(confirmation.status)}</span></div>
                <button type="button" onClick={() => changeView("track")}>Track this request</button>
              </div>
            ) : step === 1 ? (
              <div className="roadside-step">
                <p className="roadside-eyebrow">Step 1 of 4</p>
                <h2>Is anyone in immediate danger?</h2>
                <p className="roadside-lede">Roadside dispatch cannot replace medical, fire or police emergency response.</p>
                <div className="safety-choice">
                  <button type="button" className={immediateDanger === "yes" ? "is-selected is-danger" : ""} onClick={() => { setImmediateDanger("yes"); setError(""); }}>
                    <FaExclamationTriangle aria-hidden="true" /><span><strong>Yes — urgent danger</strong><small>Someone is injured, trapped, threatened, or the vehicle is in live traffic.</small></span>
                  </button>
                  <button type="button" className={immediateDanger === "no" ? "is-selected" : ""} onClick={() => { setImmediateDanger("no"); setError(""); }}>
                    <FaShieldAlt aria-hidden="true" /><span><strong>No — roadside assistance is suitable</strong><small>Everyone is away from immediate danger and needs vehicle support.</small></span>
                  </button>
                </div>
                {immediateDanger === "yes" && (
                  <div className="emergency-diversion">
                    <strong>Contact your local emergency service immediately.</strong>
                    <p>If it is safe to do so, move away from traffic and wait behind a barrier. Do not attempt repairs in a dangerous position.</p>
                    <a href="https://112.gov.in/" target="_blank" rel="noreferrer">Open official emergency service information</a>
                  </div>
                )}
                {immediateDanger === "no" && <button className="roadside-primary" type="button" onClick={advance}>Continue to assistance type</button>}
              </div>
            ) : step === 2 ? (
              <div className="roadside-step">
                <p className="roadside-eyebrow">Step 2 of 4</p>
                <h2>What help does the vehicle need?</h2>
                <p className="roadside-lede">Choose the closest match. The response unit will see any extra notes before travelling.</p>
                <div className="service-choice-grid">
                  {services.map((service) => (
                    <button type="button" className={serviceCode === service.code ? "is-selected" : ""} onClick={() => setServiceCode(service.code)} key={service.code}>
                      <span>{SERVICE_SYMBOLS[service.code]}</span><strong>{service.name}</strong><small>{service.summary}</small>
                    </button>
                  ))}
                </div>
                <div className="roadside-actions"><button type="button" className="roadside-secondary" onClick={() => setStep(1)}>Back</button><button type="button" className="roadside-primary" onClick={advance}>Continue to location</button></div>
              </div>
            ) : step === 3 ? (
              <div className="roadside-step">
                <p className="roadside-eyebrow">Step 3 of 4</p>
                <h2>Where should the unit meet you?</h2>
                <p className="roadside-lede">A road name, travel direction and visible landmark are usually more useful than a postcode alone.</p>
                <label className="roadside-field">Exact location or landmark<textarea value={location.description} onChange={(event) => setLocation((current) => ({ ...current, description: event.target.value }))} rows="4" maxLength="300" placeholder="For example: Outer Ring Road, northbound, 200 m after the airport exit, beside the blue sign" /></label>
                <button className="location-button" type="button" onClick={captureLocation}><FaLocationArrow aria-hidden="true" /> Add my current coordinates</button>
                {locationMessage && <p className="location-message" role="status">{locationMessage}</p>}
                {location.latitude !== undefined && <p className="coordinate-chip"><FaMapMarkerAlt aria-hidden="true" /> Coordinates added: {location.latitude}, {location.longitude}</p>}
                <fieldset className="roadside-fieldset"><legend>Current roadside position</legend><label><input type="radio" name="safety" checked={safetyStatus === "safe"} onChange={() => setSafetyStatus("safe")} /> Parked away from moving traffic</label><label><input type="radio" name="safety" checked={safetyStatus === "roadside-risk"} onChange={() => setSafetyStatus("roadside-risk")} /> On a shoulder or poorly visible roadside position</label></fieldset>
                <div className="roadside-actions"><button type="button" className="roadside-secondary" onClick={() => setStep(2)}>Back</button><button type="button" className="roadside-primary" onClick={advance}>Continue to details</button></div>
              </div>
            ) : (
              <div className="roadside-step">
                <p className="roadside-eyebrow">Step 4 of 4</p>
                <h2>Review and send</h2>
                <div className="request-review"><div><span>Assistance</span><strong>{selectedService?.name}</strong></div><div><span>Meet location</span><strong>{location.description}</strong></div><div><span>Dispatch priority</span><strong>{safetyStatus === "roadside-risk" ? "Urgent roadside position" : "Standard"}</strong></div></div>
                {!user ? (
                  <div className="roadside-signin"><FaShieldAlt aria-hidden="true" /><div><h3>Sign in to send this request</h3><p>Your account protects the location and contact details and lets you track the response.</p></div><Link to="/login" state={{ from: { pathname: "/services/emergency" } }}>Sign in to continue</Link></div>
                ) : (
                  <div className="roadside-details-grid">
                    <label className="roadside-field">Contact number<input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} inputMode="tel" placeholder="Number the response unit can call" /></label>
                    <label className="roadside-field">Vehicle type<select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>{VEHICLES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label className="roadside-field roadside-field--wide">Vehicle description <span>(optional)</span><input value={vehicleDescription} onChange={(event) => setVehicleDescription(event.target.value)} maxLength="160" placeholder="Colour, make and model — do not enter identity documents" /></label>
                    <label className="roadside-field roadside-field--wide">Notes for dispatch <span>(optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="3" maxLength="500" placeholder="Anything the response unit needs to prepare for" /></label>
                  </div>
                )}
                <div className="roadside-actions"><button type="button" className="roadside-secondary" onClick={() => setStep(3)}>Back</button>{user && <button type="button" className="roadside-primary" onClick={submitRequest} disabled={loading}>{loading ? "Sending request…" : "Send to dispatch"}</button>}</div>
              </div>
            )}
          </section>
        </div>
      )}

      {view === "track" && (
        <section className="roadside-list-view shell-container" aria-labelledby="track-heading">
          <div className="roadside-section-heading"><p className="roadside-eyebrow">Your roadside support</p><h2 id="track-heading">Track requests</h2><p>Assignment and arrival updates appear here as dispatch progresses the request.</p></div>
          {!user ? <div className="roadside-empty"><FaRoute aria-hidden="true" /><h3>Sign in to track requests</h3><p>Roadside locations and responder details are kept inside your account.</p><Link to="/login" state={{ from: { pathname: "/services/emergency" } }}>Sign in</Link></div> : loading ? <div className="roadside-loading" role="status">Loading your requests…</div> : requests.length ? (
            <div className="road-request-list">{requests.map((request) => <article className="road-request-card" key={request.requestId}><header><div><span className={`priority-chip priority-chip--${request.priority}`}>{request.priority === "urgent" ? "Urgent position" : "Standard"}</span><h3>{request.serviceName}</h3><p>{request.requestId} · Requested {formatDateTime(request.createdAt)}</p></div><strong className={`status-pill status-pill--${request.status}`}>{formatStatus(request.status)}</strong></header><StatusTimeline request={request} /><div className="request-location"><FaMapMarkerAlt aria-hidden="true" /><div><strong>Meeting location</strong><span>{request.location.description}</span></div></div>{request.assignment && <div className="assignment-card"><FaTruck aria-hidden="true" /><div><strong>{request.assignment.unitName}</strong><span>Estimated arrival: {request.assignment.etaMinutes} minutes · Contact: {request.assignment.unitPhone}</span></div></div>}{["requested", "assigned"].includes(request.status) && (cancelTarget === request.requestId ? <div className="cancel-road-request"><span>Cancel this roadside request?</span><button type="button" onClick={() => cancelRequest(request.requestId)} disabled={loading}>Yes, cancel</button><button type="button" onClick={() => setCancelTarget(null)}>Keep request</button></div> : <button type="button" className="cancel-link" onClick={() => setCancelTarget(request.requestId)}>Cancel request</button>)}</article>)}</div>
          ) : <div className="roadside-empty"><FaCar aria-hidden="true" /><h3>No roadside requests yet</h3><p>When you request assistance, its dispatch status will appear here.</p><button type="button" onClick={() => changeView("request")}>Request roadside help</button></div>}
        </section>
      )}

      {view === "dispatch" && isDispatcher && (
        <section className="roadside-list-view shell-container" aria-labelledby="dispatch-heading">
          <div className="roadside-section-heading roadside-section-heading--row"><div><p className="roadside-eyebrow">Operations workspace</p><h2 id="dispatch-heading">Active dispatch queue</h2><p>Urgent roadside positions are highlighted. Assign one unit, then move each response through the verified sequence.</p></div><button type="button" className="roadside-secondary" onClick={loadQueue}>Refresh queue</button></div>
          {loading && !queue.length ? <div className="roadside-loading" role="status">Loading dispatch queue…</div> : queue.length ? <div className="dispatch-grid">{queue.map((request) => <article className={`dispatch-card ${request.priority === "urgent" ? "dispatch-card--urgent" : ""}`} key={request.requestId}><header><div><span className={`priority-chip priority-chip--${request.priority}`}>{request.priority}</span><h3>{request.serviceName}</h3><p>{request.requestId} · Waiting {formatDateTime(request.createdAt)}</p></div><span className={`status-pill status-pill--${request.status}`}>{formatStatus(request.status)}</span></header><div className="dispatch-facts"><div><FaMapMarkerAlt aria-hidden="true" /><span>{request.location.description}</span></div><div><FaCar aria-hidden="true" /><span>{request.vehicleType}{request.vehicleDescription ? ` · ${request.vehicleDescription}` : ""}</span></div></div>{request.status === "requested" ? (assignmentTarget === request.requestId ? <div className="assignment-form"><label>Response unit<input value={assignment.unitName} onChange={(event) => setAssignment((current) => ({ ...current, unitName: event.target.value }))} placeholder="For example: Recovery unit 4" /></label><label>Unit contact<input value={assignment.unitPhone} onChange={(event) => setAssignment((current) => ({ ...current, unitPhone: event.target.value }))} inputMode="tel" /></label><label>ETA in minutes<input value={assignment.etaMinutes} onChange={(event) => setAssignment((current) => ({ ...current, etaMinutes: event.target.value }))} type="number" min="1" max="240" /></label><div><button type="button" onClick={() => assignUnit(request.requestId)} disabled={loading}>Confirm assignment</button><button type="button" onClick={() => setAssignmentTarget(null)}>Cancel</button></div></div> : <button type="button" className="dispatch-primary" onClick={() => setAssignmentTarget(request.requestId)}>Assign response unit</button>) : <div className="dispatch-assignment"><div><FaTruck aria-hidden="true" /><span><strong>{request.assignment?.unitName}</strong> · ETA {request.assignment?.etaMinutes} min</span></div><button type="button" className="dispatch-primary" onClick={() => progressDispatch(request)} disabled={loading}>Mark {formatStatus(nextStatus(request.status)).toLowerCase()}</button></div>}</article>)}</div> : <div className="roadside-empty"><FaCheckCircle aria-hidden="true" /><h3>Queue clear</h3><p>There are no active roadside requests waiting for dispatch.</p></div>}
        </section>
      )}

      <section className="roadside-safety-strip"><div className="shell-container"><FaExclamationTriangle aria-hidden="true" /><div><strong>Broken down near traffic?</strong><span>Switch on hazard lights if available, leave the traffic side carefully, and wait in a safer place when possible.</span></div></div></section>
    </main>
  );
}

export default Emergency;