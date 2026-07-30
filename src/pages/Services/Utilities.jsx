import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import "./Utilities.css";

const today = () => new Date().toISOString().slice(0, 10);

function Utilities() {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [view, setView] = useState("guides");
  const [query, setQuery] = useState("");
  const [providerLabel, setProviderLabel] = useState("");
  const [referenceLabel, setReferenceLabel] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [api.get("/utilities/guides")];
        if (user) requests.push(api.get("/utilities/issues/mine"));
        const [guideResponse, issueResponse] = await Promise.all(requests);
        setGuides(guideResponse.data.guides);
        setSelectedCode(guideResponse.data.guides[0]?.guideCode || "");
        setIssues(issueResponse?.data?.issues || []);
      } catch (requestError) {
        setError(requestError.response?.data?.error || "Utility guidance could not be loaded.");
      }
    };
    load();
  }, [user]);

  const selected = guides.find(({ guideCode }) => guideCode === selectedCode);
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return text ? guides.filter((guide) => JSON.stringify(guide).toLowerCase().includes(text)) : guides;
  }, [guides, query]);
  const activeIssues = issues.filter(({ status }) => status !== "archived");

  const createTracker = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/utilities/issues", { guideCode: selected.guideCode, providerLabel, referenceLabel, issueDate });
      setIssues((current) => [data.issue, ...current]);
      setNotice(`Tracker ${data.issue.issueId} is ready. No payment or account credentials were stored.`);
      setView("trackers");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "The issue tracker could not be created.");
    } finally { setBusy(false); }
  };

  const updateTask = async (issue, task, completed) => {
    setBusy(true); setError("");
    try {
      const { data } = await api.patch(`/utilities/issues/${issue.issueId}/tasks/${task.taskId}`, { completed });
      setIssues((current) => current.map((item) => item.issueId === data.issue.issueId ? data.issue : item));
    } catch (requestError) { setError(requestError.response?.data?.error || "Progress could not be updated."); }
    finally { setBusy(false); }
  };

  const setStatus = async (issueId, status) => {
    setBusy(true); setError("");
    try {
      const { data } = await api.patch(`/utilities/issues/${issueId}/status`, { status });
      setIssues((current) => current.map((item) => item.issueId === data.issue.issueId ? data.issue : item));
      setNotice(status === "resolved" ? `${issueId} marked resolved.` : `${issueId} archived.`);
    } catch (requestError) { setError(requestError.response?.data?.error || "Tracker status could not be updated."); }
    finally { setBusy(false); }
  };

  return (
    <main className="utility-page">
      <header className="utility-hero"><div className="utility-shell">
        <p className="utility-kicker">Safe utility issue resolution</p>
        <h1>Take the right complaint route and track what happens next</h1>
        <p>Use official electricity, telecom, LPG and consumer grievance routes. Payments, OTPs, passwords and full account numbers never belong here.</p>
      </div></header>
      <nav className="utility-tabs utility-shell" aria-label="Utility workspace">
        <button type="button" aria-current={view === "guides" ? "page" : undefined} onClick={() => setView("guides")}>Find a complaint route</button>
        <button type="button" aria-current={view === "trackers" ? "page" : undefined} onClick={() => setView("trackers")}>My issue trackers ({activeIssues.length})</button>
      </nav>
      {notice && <p className="utility-notice utility-shell" role="status">{notice}</p>}
      {error && <p className="utility-notice utility-notice--error utility-shell" role="alert">{error}</p>}

      {view === "guides" ? <section className="utility-workspace utility-shell">
        <aside className="utility-directory">
          <label htmlFor="utility-search">Search by problem</label>
          <input id="utility-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Billing, outage, broadband, LPG..." />
          {filtered.map((guide) => <button className={selectedCode === guide.guideCode ? "is-active" : ""} type="button" key={guide.guideCode} onClick={() => setSelectedCode(guide.guideCode)}><span>{guide.category}</span><strong>{guide.title}</strong></button>)}
        </aside>
        {selected && <article className="utility-guide">
          <p className="utility-kicker">{selected.category}</p><h2>{selected.title}</h2><p className="utility-summary">{selected.summary}</p>
          <div className="utility-authority"><span>Responsible route</span><strong>{selected.authority}</strong></div>
          <div className="utility-boundary"><strong>Safety boundary</strong><p>{selected.boundary}</p></div>
          <h3>Resolution checklist</h3><ol className="utility-preview">{selected.tasks.map((task) => <li key={task.taskId}><strong>{task.title}</strong><span>{task.description}</span></li>)}</ol>
          <a className="utility-official" href={selected.officialUrl} target="_blank" rel="noreferrer">Open the official guidance</a>
          <section className="utility-builder"><h3>Track this issue privately</h3><p>Use a provider nickname and a short complaint reference only. Never enter the utility account number, bank details, password, PIN or OTP.</p>
            <div className="utility-fields">
              <label>Provider label (optional)<input maxLength="80" value={providerLabel} onChange={(event) => setProviderLabel(event.target.value)} placeholder="For example, local DISCOM" /></label>
              <label>Complaint reference label (optional)<input maxLength="60" value={referenceLabel} onChange={(event) => setReferenceLabel(event.target.value)} placeholder="Short official docket reference" /></label>
              <label>Issue date<input type="date" value={issueDate} max={today()} onChange={(event) => setIssueDate(event.target.value)} /></label>
            </div>
            {user ? <button className="utility-save" type="button" disabled={busy} onClick={createTracker}>{busy ? "Creating..." : "Create issue tracker"}</button> : <p className="utility-signin">Sign in to save private progress. <Link to="/login">Sign in</Link></p>}
          </section>
        </article>}
      </section> : <section className="utility-trackers utility-shell">
        <p className="utility-kicker">Owner-scoped records</p><h2>My utility issue trackers</h2>
        {!user ? <p className="utility-empty">Sign in to see your trackers. <Link to="/login">Sign in</Link></p> : activeIssues.length === 0 ? <p className="utility-empty">No active tracker yet. <button type="button" onClick={() => setView("guides")}>Choose a complaint route</button></p> : activeIssues.map((issue) => {
          const completed = issue.tasks.filter((task) => task.status === "completed").length;
          return <article className="utility-tracker" key={issue.issueId}><header><div><span>{issue.status}</span><h3>{issue.guideTitle}</h3><p>{issue.issueId}{issue.providerLabel ? ` | ${issue.providerLabel}` : ""}{issue.referenceLabel ? ` | ${issue.referenceLabel}` : ""}</p></div><strong>{completed}/{issue.tasks.length}</strong></header>
            <div className="utility-checklist">{issue.tasks.map((task) => <label key={task.taskId} className={task.status === "completed" ? "is-complete" : ""}><input type="checkbox" checked={task.status === "completed"} disabled={busy || issue.status === "resolved"} onChange={(event) => updateTask(issue, task, event.target.checked)} /><span><strong>{task.title}</strong><small>{task.description}</small></span></label>)}</div>
            <footer><a href={issue.officialUrl} target="_blank" rel="noreferrer">Continue on official route</a><div>{issue.status !== "resolved" && <button type="button" disabled={busy} onClick={() => setStatus(issue.issueId, "resolved")}>Mark resolved</button>}<button type="button" disabled={busy} onClick={() => setStatus(issue.issueId, "archived")}>Archive</button></div></footer>
          </article>;
        })}
      </section>}
    </main>
  );
}
export default Utilities;
