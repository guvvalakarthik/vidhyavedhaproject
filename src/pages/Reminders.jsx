import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import "./Reminders.css";

const initial = { sourceType: "custom", sourceId: "", title: "", dueAt: "", cadence: "once", consent: false };
function Reminders() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initial);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/reminders").then(({ data }) => setItems(data.reminders)).catch(() => setError("Reminders could not be loaded.")); }, []);
  const change = ({ target }) => setForm((value) => ({ ...value, [target.name]: target.type === "checkbox" ? target.checked : target.value }));
  const create = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = await api.post("/reminders", { ...form, dueAt: new Date(form.dueAt).toISOString() });
      setItems((current) => [data.reminder, ...current]); setNotice(data.message); setForm(initial);
    } catch (err) { setError(err.response?.data?.error || "Reminder could not be created."); } finally { setBusy(false); }
  };
  const setStatus = async (id, status) => {
    const { data } = await api.patch(`/reminders/${id}/status`, { status });
    setItems((current) => current.map((item) => item.reminderId === id ? data.reminder : item)); setNotice(data.message);
  };
  const scan = async () => { const { data } = await api.post("/reminders/scan-due"); setNotice(data.message); };
  return <main className="reminders-page"><header><div><p>Opt-in task companion</p><h1>Stay ahead of unfinished work</h1><span>The reminder agent checks only the task you choose and creates in-app notices. It never submits, calls, emails, or changes the underlying service.</span></div></header>
    {notice && <p className="reminders-notice" role="status">{notice}</p>}{error && <p className="reminders-notice is-error" role="alert">{error}</p>}
    <div className="reminders-grid"><form onSubmit={create}><h2>Create a reminder</h2><label>Task source<select name="sourceType" value={form.sourceType} onChange={change}><option value="custom">Custom task</option><option value="readiness">Readiness checklist</option><option value="draft">Service draft</option></select></label>{form.sourceType !== "custom" && <label>Owned task ID<input name="sourceId" value={form.sourceId} onChange={change} required placeholder={form.sourceType === "draft" ? "DRF-XXXXXXXX" : "RDY-XXXXXXXX"} /></label>}<label>Reminder title<input name="title" value={form.title} onChange={change} required minLength="4" maxLength="180" /></label><label>First reminder<input type="datetime-local" name="dueAt" value={form.dueAt} onChange={change} required /></label><label>Repeat<select name="cadence" value={form.cadence} onChange={change}><option value="once">Once</option><option value="daily">Daily until complete</option><option value="weekly">Weekly until complete</option></select></label><label className="reminders-consent"><input type="checkbox" name="consent" checked={form.consent} onChange={change} required />Enable this in-app reminder agent. I can pause or complete it at any time.</label><button disabled={busy}>{busy ? "Saving..." : "Enable reminder"}</button></form>
      <section><div className="reminders-title"><h2>My reminders</h2><button type="button" onClick={scan}>Check due now</button></div>{items.filter(({ status }) => status !== "archived").map((item) => <article key={item.reminderId}><span>{item.reminderId} · {item.status}</span><h3>{item.title}</h3><p>Next check: {new Date(item.nextRunAt).toLocaleString("en-IN")} · {item.cadence}</p><div>{item.status === "active" && <button onClick={() => setStatus(item.reminderId, "paused")}>Pause</button>}{item.status === "paused" && <button onClick={() => setStatus(item.reminderId, "active")}>Resume</button>}{!["completed", "archived"].includes(item.status) && <button onClick={() => setStatus(item.reminderId, "completed")}>Mark complete</button>}</div></article>)}</section></div></main>;
}
export default Reminders;
