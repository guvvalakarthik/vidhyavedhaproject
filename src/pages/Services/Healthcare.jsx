import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStethoscope,
  FaUserMd,
  FaVideo,
} from "react-icons/fa";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Healthcare.css";

const TIME_ZONE = "Asia/Kolkata";

const dateInIndia = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const addDays = (dateText, amount) => {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
};

const formatDate = (value, options = {}) => new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: options.year ? "numeric" : undefined,
  weekday: options.weekday ? "short" : undefined,
}).format(new Date(value));

const formatTime = (value) => new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
}).format(new Date(value));

const appointmentIsUpcoming = (appointment) =>
  appointment.status === "booked" && new Date(appointment.startTime).getTime() > Date.now();

const appointmentCanBeModified = (appointment) =>
  new Date(appointment.startTime).getTime() - Date.now() >= 2 * 60 * 60 * 1000;

function Healthcare() {
  const { user } = useAuth();
  const [view, setView] = useState("book");
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [specialty, setSpecialty] = useState("All specialties");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mode, setMode] = useState("");
  const [fromDate, setFromDate] = useState(dateInIndia);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");

  const loadProviders = async () => {
    setProvidersLoading(true);
    setError("");
    try {
      const { data } = await api.get("/healthcare/providers");
      setProviders(data.providers);
    } catch {
      setError("Healthcare providers could not be loaded. Please try again.");
    } finally {
      setProvidersLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;
    setAppointmentsLoading(true);
    try {
      const { data } = await api.get("/healthcare/appointments/mine");
      setAppointments(data.appointments);
    } catch {
      setError("Your appointments could not be loaded.");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  useEffect(() => {
    if (!selectedProvider) {
      setSlots([]);
      return;
    }

    let active = true;
    const loadAvailability = async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      setError("");
      try {
        const { data } = await api.get(
          `/healthcare/providers/${selectedProvider.providerCode}/availability`,
          { params: { from: fromDate, days: 7 } },
        );
        if (active) setSlots(data.slots);
      } catch {
        if (active) setError("Availability could not be loaded. Please choose another doctor or try again.");
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    loadAvailability();
    return () => { active = false; };
  }, [selectedProvider, fromDate]);

  const specialties = useMemo(() => [
    "All specialties",
    ...Array.from(new Set(providers.map((provider) => provider.specialty))).sort(),
  ], [providers]);

  const filteredProviders = useMemo(() => specialty === "All specialties"
    ? providers
    : providers.filter((provider) => provider.specialty === specialty), [providers, specialty]);

  const groupedSlots = useMemo(() => slots.reduce((groups, slot) => {
    groups[slot.date] = [...(groups[slot.date] || []), slot];
    return groups;
  }, {}), [slots]);

  const upcomingAppointments = appointments.filter(appointmentIsUpcoming);
  const pastAppointments = appointments.filter((appointment) => !appointmentIsUpcoming(appointment));

  const chooseProvider = (provider) => {
    setSelectedProvider(provider);
    setMode(provider.modes[0]);
    setFromDate(dateInIndia());
    setNotice(null);
    setError("");
  };

  const resetBooking = () => {
    setSelectedProvider(null);
    setSelectedSlot(null);
    setMode("");
    setPhone("");
    setReason("");
    setRescheduleTarget(null);
  };

  const handleBooking = async () => {
    if (!selectedProvider || !selectedSlot) {
      setError("Choose a doctor and an available appointment time.");
      return;
    }
    if (!rescheduleTarget && (!phone.trim() || !reason.trim())) {
      setError("Enter a contact number and a short reason for the appointment.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = rescheduleTarget
        ? await api.patch(`/healthcare/appointments/${rescheduleTarget.confirmationCode}/reschedule`, {
          startTime: selectedSlot.start,
        })
        : await api.post("/healthcare/appointments", {
          providerCode: selectedProvider.providerCode,
          startTime: selectedSlot.start,
          mode,
          phone,
          reason,
        });

      const appointment = response.data.appointment;
      setNotice({
        title: rescheduleTarget ? "Appointment rescheduled" : "Appointment confirmed",
        appointment,
      });
      await Promise.all([loadAppointments(), (async () => {
        const { data } = await api.get(
          `/healthcare/providers/${selectedProvider.providerCode}/availability`,
          { params: { from: fromDate, days: 7 } },
        );
        setSlots(data.slots);
      })()]);
      setSelectedSlot(null);
      setRescheduleTarget(null);
      if (!rescheduleTarget) {
        setPhone("");
        setReason("");
      }
    } catch (bookingError) {
      setError(bookingError.response?.data?.error || "The appointment could not be booked. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (appointment) => {
    setSubmitting(true);
    setError("");
    try {
      await api.patch(`/healthcare/appointments/${appointment.confirmationCode}/cancel`);
      setCancelTarget(null);
      setNotice({ title: "Appointment cancelled", appointment });
      await loadAppointments();
    } catch (cancelError) {
      setError(cancelError.response?.data?.error || "The appointment could not be cancelled.");
    } finally {
      setSubmitting(false);
    }
  };

  const beginReschedule = (appointment) => {
    const provider = providers.find((item) => item.providerCode === appointment.providerCode);
    if (!provider) {
      setError("This doctor is no longer available for online rescheduling.");
      return;
    }
    chooseProvider(provider);
    setMode(appointment.mode);
    setRescheduleTarget(appointment);
    setView("book");
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="health-scheduling-page">
      <section className="health-service-intro">
        <div className="shell-container health-service-intro__grid">
          <div>
            <p className="eyebrow">Healthcare appointments</p>
            <h1>Book a doctor at a time that works for you</h1>
            <p>Choose a specialty, compare doctors and reserve a live appointment slot. You can cancel or change eligible bookings from the same page.</p>
          </div>
          <div className="health-service-intro__facts" aria-label="Appointment service information">
            <span><FaClock aria-hidden="true" /> 30-minute appointments</span>
            <span><FaMapMarkerAlt aria-hidden="true" /> In-person and video options</span>
            <span><FaCalendarAlt aria-hidden="true" /> Live 7-day availability</span>
          </div>
        </div>
      </section>

      <div className="health-view-tabs shell-container" role="tablist" aria-label="Healthcare appointments">
        <button type="button" role="tab" aria-selected={view === "book"} onClick={() => setView("book")}>Book an appointment</button>
        <button type="button" role="tab" aria-selected={view === "manage"} onClick={() => setView("manage")}>
          Manage appointments{user && upcomingAppointments.length > 0 ? ` (${upcomingAppointments.length})` : ""}
        </button>
      </div>

      {error && <div className="health-alert health-alert--error shell-container" role="alert">{error}</div>}
      {notice && (
        <div className="health-alert health-alert--success shell-container" role="status">
          <FaCheckCircle aria-hidden="true" />
          <div>
            <strong>{notice.title}</strong>
            {notice.appointment?.startTime && (
              <span>{notice.appointment.confirmationCode} · {formatDate(notice.appointment.startTime, { year: true, weekday: true })} at {formatTime(notice.appointment.startTime)}</span>
            )}
          </div>
          <button type="button" onClick={() => { setNotice(null); setView("manage"); }}>View appointments</button>
        </div>
      )}

      {view === "book" ? (
        <div className="health-booking shell-container">
          {rescheduleTarget && (
            <div className="reschedule-banner">
              <div><strong>Choose a new time</strong><span>Changing {rescheduleTarget.confirmationCode} with {rescheduleTarget.providerName}</span></div>
              <button type="button" onClick={resetBooking}>Cancel change</button>
            </div>
          )}

          <ol className="booking-progress" aria-label="Booking progress">
            <li className="is-current"><span>1</span> Choose a doctor</li>
            <li className={selectedProvider ? "is-current" : ""}><span>2</span> Choose a time</li>
            <li className={selectedSlot ? "is-current" : ""}><span>3</span> Confirm</li>
          </ol>

          <section className="booking-section" aria-labelledby="doctor-heading">
            <div className="booking-section__heading">
              <div><span className="step-kicker">Step 1</span><h2 id="doctor-heading">Choose a doctor</h2></div>
              <label>Specialty
                <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
                  {specialties.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>

            {providersLoading ? <div className="health-loading" role="status">Loading doctors...</div> : (
              <div className="provider-list">
                {filteredProviders.map((provider) => (
                  <button
                    type="button"
                    key={provider.providerCode}
                    className={`provider-row ${selectedProvider?.providerCode === provider.providerCode ? "is-selected" : ""}`}
                    onClick={() => chooseProvider(provider)}
                    aria-pressed={selectedProvider?.providerCode === provider.providerCode}
                  >
                    <span className="provider-row__avatar" aria-hidden="true"><FaUserMd /></span>
                    <span className="provider-row__details">
                      <strong>{provider.name}</strong>
                      <span>{provider.specialty} · {provider.experienceYears} years’ experience</span>
                      <small>{provider.qualifications} · {provider.languages.join(", ")}</small>
                    </span>
                    <span className="provider-row__location"><FaMapMarkerAlt aria-hidden="true" /> {provider.location.name}, {provider.location.city}</span>
                    <span className="provider-row__action">{selectedProvider?.providerCode === provider.providerCode ? "Selected" : "Choose"}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {selectedProvider && (
            <section className="booking-section" aria-labelledby="time-heading">
              <div className="booking-section__heading booking-section__heading--time">
                <div><span className="step-kicker">Step 2</span><h2 id="time-heading">Choose date and time</h2><p>Times shown in Indian Standard Time.</p></div>
                <div className="week-controls">
                  <button type="button" onClick={() => setFromDate(addDays(fromDate, -7))} disabled={fromDate <= dateInIndia()}><FaArrowLeft aria-hidden="true" /> Previous</button>
                  <button type="button" onClick={() => setFromDate(addDays(fromDate, 7))}>Next 7 days <FaArrowRight aria-hidden="true" /></button>
                </div>
              </div>

              <div className="mode-choice" role="group" aria-label="Consultation type">
                {selectedProvider.modes.map((item) => (
                  <button type="button" key={item} aria-pressed={mode === item} onClick={() => setMode(item)}>
                    {item === "video" ? <FaVideo aria-hidden="true" /> : <FaStethoscope aria-hidden="true" />}
                    {item === "video" ? "Video consultation" : "In-person visit"}
                  </button>
                ))}
              </div>

              {slotsLoading ? <div className="health-loading" role="status">Checking live availability...</div> : Object.keys(groupedSlots).length > 0 ? (
                <div className="slot-days">
                  {Object.entries(groupedSlots).map(([date, daySlots]) => (
                    <div className="slot-day" key={date}>
                      <div className="slot-day__date"><strong>{formatDate(`${date}T12:00:00+05:30`, { weekday: true })}</strong><span>{formatDate(`${date}T12:00:00+05:30`)}</span></div>
                      <div className="slot-day__times">
                        {daySlots.map((slot) => (
                          <button
                            type="button"
                            key={slot.start}
                            aria-pressed={selectedSlot?.start === slot.start}
                            onClick={() => setSelectedSlot(slot)}
                          >{formatTime(slot.start)}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="no-slots"><strong>No appointments in this week</strong><span>Try the next 7 days or choose another doctor.</span></div>}
            </section>
          )}

          {selectedProvider && selectedSlot && (
            <section className="booking-section booking-confirm" aria-labelledby="confirm-heading">
              <div><span className="step-kicker">Step 3</span><h2 id="confirm-heading">Review and confirm</h2></div>
              <div className="appointment-summary">
                <dl>
                  <div><dt>Doctor</dt><dd>{selectedProvider.name} · {selectedProvider.specialty}</dd></div>
                  <div><dt>Date and time</dt><dd>{formatDate(selectedSlot.start, { year: true, weekday: true })} at {formatTime(selectedSlot.start)}</dd></div>
                  <div><dt>Appointment type</dt><dd>{mode === "video" ? "Video consultation" : "In-person visit"}</dd></div>
                  <div><dt>Location</dt><dd>{mode === "video" ? "Secure video link provided after booking" : `${selectedProvider.location.name}, ${selectedProvider.location.address}`}</dd></div>
                </dl>

                {!user ? (
                  <div className="signin-to-book">
                    <h3>Sign in to reserve this time</h3>
                    <p>Your account keeps appointment details private and lets you make changes later.</p>
                    <Link to="/login" state={{ from: { pathname: "/services/healthcare" } }}>Sign in to continue</Link>
                  </div>
                ) : !rescheduleTarget ? (
                  <div className="patient-details">
                    <label>Contact number<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="Mobile or landline" /></label>
                    <label>Reason for appointment<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows="3" maxLength="500" placeholder="A short description helps the doctor prepare" /></label>
                    <p>Do not include emergency or highly sensitive details. Call emergency services for urgent, life-threatening symptoms.</p>
                  </div>
                ) : null}
              </div>

              {user && (
                <div className="confirm-actions">
                  <button type="button" className="confirm-button" onClick={handleBooking} disabled={submitting}>
                    {submitting ? "Confirming..." : rescheduleTarget ? "Confirm new appointment time" : "Confirm appointment"}
                  </button>
                  <button type="button" className="change-button" onClick={() => setSelectedSlot(null)}>Choose another time</button>
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        <section className="manage-appointments shell-container" aria-labelledby="manage-heading">
          <div className="manage-appointments__heading"><p className="eyebrow">Your healthcare</p><h2 id="manage-heading">Manage appointments</h2><p>View upcoming bookings, change an eligible time or release a slot you no longer need.</p></div>
          {!user ? (
            <div className="manage-signin"><FaCalendarAlt aria-hidden="true" /><div><h3>Sign in to view appointments</h3><p>Your appointment details are only shown inside your account.</p></div><Link to="/login" state={{ from: { pathname: "/services/healthcare" } }}>Sign in</Link></div>
          ) : appointmentsLoading ? <div className="health-loading" role="status">Loading your appointments...</div> : (
            <>
              <h3 className="appointment-list-title">Upcoming</h3>
              {upcomingAppointments.length > 0 ? (
                <div className="appointment-list">
                  {upcomingAppointments.map((appointment) => (
                    <article className="appointment-record" key={appointment.confirmationCode}>
                      <div className="appointment-record__date"><strong>{formatDate(appointment.startTime, { weekday: true })}</strong><span>{formatTime(appointment.startTime)}</span></div>
                      <div className="appointment-record__body"><span className="appointment-status">Booked</span><h4>{appointment.providerName}</h4><p>{appointment.specialty} · {appointment.mode === "video" ? "Video consultation" : appointment.location.name}</p><small>{appointment.confirmationCode}</small></div>
                      <div className="appointment-record__actions">
                        {appointmentCanBeModified(appointment) ? (
                          <>
                            <button type="button" onClick={() => beginReschedule(appointment)}>Change time</button>
                            {cancelTarget === appointment.confirmationCode ? (
                              <div className="cancel-confirm"><span>Cancel this appointment?</span><button type="button" onClick={() => handleCancel(appointment)} disabled={submitting}>Yes, cancel</button><button type="button" onClick={() => setCancelTarget(null)}>Go back</button></div>
                            ) : <button type="button" onClick={() => setCancelTarget(appointment.confirmationCode)}>Cancel</button>}
                          </>
                        ) : <span className="appointment-change-closed">Online changes close 2 hours before the appointment. Contact the clinic for help.</span>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="no-appointments"><FaCalendarAlt aria-hidden="true" /><h3>No upcoming appointments</h3><button type="button" onClick={() => setView("book")}>Book an appointment</button></div>}

              {pastAppointments.length > 0 && (
                <details className="past-appointments"><summary>Past and cancelled appointments ({pastAppointments.length})</summary><div>{pastAppointments.map((appointment) => <p key={appointment.confirmationCode}><strong>{appointment.providerName}</strong><span>{formatDate(appointment.startTime, { year: true })} · {appointment.status}</span></p>)}</div></details>
              )}
            </>
          )}
        </section>
      )}

      <section className="health-help-strip">
        <div className="shell-container"><FaPhoneAlt aria-hidden="true" /><div><strong>Need help booking?</strong><span>Use Help and contact if online booking is not suitable. For emergencies, contact your local emergency service.</span></div><Link to="/contact">Get booking help</Link></div>
      </section>
    </div>
  );
}

export default Healthcare;