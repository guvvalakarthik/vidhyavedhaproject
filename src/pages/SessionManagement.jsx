import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import "./SessionManagement.css";

const deviceName = (userAgent = "") => {
  if (/Android/i.test(userAgent)) return "Android device";
  if (/iPhone|iPad/i.test(userAgent)) return "Apple mobile device";
  if (/Windows/i.test(userAgent)) return "Windows computer";
  if (/Macintosh/i.test(userAgent)) return "Mac computer";
  if (/Linux/i.test(userAgent)) return "Linux computer";
  return "Unknown device";
};

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadSessions = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/auth/sessions");
      setSessions(data.sessions);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not load your sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const revoke = async (session) => {
    setWorkingId(session.sessionId);
    setError("");
    setMessage("");
    try {
      await api.delete(`/auth/sessions/${session.sessionId}`);
      if (session.current) {
        navigate("/login", { replace: true });
        window.location.reload();
        return;
      }
      setSessions((current) => current.filter(({ sessionId }) => sessionId !== session.sessionId));
      setMessage("That device has been signed out.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not revoke that session.");
    } finally {
      setWorkingId("");
    }
  };

  const revokeOthers = async () => {
    setWorkingId("others");
    setError("");
    setMessage("");
    try {
      await api.delete("/auth/sessions/others");
      setSessions((current) => current.filter(({ current: isCurrent }) => isCurrent));
      setMessage("All other devices have been signed out.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not sign out other devices.");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <section className="session-page shell-container">
      <div className="session-page__heading">
        <div>
          <span className="session-page__eyebrow">Account security</span>
          <h1>Your signed-in devices</h1>
          <p>Review active sessions and remove access from a device you no longer use.</p>
        </div>
        {sessions.length > 1 && (
          <button type="button" className="session-page__danger" onClick={revokeOthers} disabled={workingId === "others"}>
            {workingId === "others" ? "Signing out?" : "Sign out other devices"}
          </button>
        )}
      </div>

      {message && <p className="session-page__notice" role="status">{message}</p>}
      {error && <p className="session-page__error" role="alert">{error}</p>}
      {loading ? <p className="session-page__loading">Loading sessions?</p> : (
        <div className="session-list">
          {sessions.map((session) => (
            <article className="session-card" key={session.sessionId}>
              <div className="session-card__icon" aria-hidden="true">{session.current ? "?" : "?"}</div>
              <div className="session-card__details">
                <div className="session-card__title">
                  <h2>{deviceName(session.userAgent)}</h2>
                  {session.current && <span>Current session</span>}
                </div>
                <p>Last active {formatDate(session.lastSeenAt)}</p>
                <small>Session expires {formatDate(session.expiresAt)}</small>
              </div>
              <button type="button" onClick={() => revoke(session)} disabled={workingId === session.sessionId}>
                {workingId === session.sessionId ? "Removing?" : session.current ? "Sign out here" : "Remove access"}
              </button>
            </article>
          ))}
        </div>
      )}
      <aside className="session-page__tip">
        <strong>Security tip</strong>
        <p>If you do not recognise a session, remove it and change your password. Never share passwords, OTPs, or account recovery codes.</p>
      </aside>
    </section>
  );
}

export default SessionManagement;
