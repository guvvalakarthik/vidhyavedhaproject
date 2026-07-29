import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import "./Farming.css";

const seasonLabels = { kharif: "Kharif", rabi: "Rabi", zaid: "Zaid", perennial: "Perennial / year-round", exploring: "Still exploring" };

function Farming() {
  const { user } = useAuth();
  const [pathways, setPathways] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [view, setView] = useState("explore");
  const [query, setQuery] = useState("");
  const [crop, setCrop] = useState("");
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState("exploring");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [api.get("/farming/pathways")];
        if (user) requests.push(api.get("/farming/plans/mine"));
        const [pathwayResponse, planResponse] = await Promise.all(requests);
        setPathways(pathwayResponse.data.pathways);
        setSelectedCode(pathwayResponse.data.pathways[0]?.pathwayCode || "");
        setPlans(planResponse?.data?.plans || []);
      } catch (requestError) {
        setError(requestError.response?.data?.error || "Farming guidance could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const selected = pathways.find(({ pathwayCode }) => pathwayCode === selectedCode);
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return pathways;
    return pathways.filter((item) => JSON.stringify(item).toLowerCase().includes(text));
  }, [pathways, query]);
  const activePlans = plans.filter(({ status }) => status !== "archived");

  const savePlan = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/farming/plans", { pathwayCode: selected.pathwayCode, crop, district, season });
      setPlans((current) => [data.plan, ...current]);
      setNotice(`Saved ${data.plan.planId}. Your checklist is ready.`);
      setView("plans");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "The farming plan could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (plan, task, completed) => {
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/farming/plans/${plan.planId}/tasks/${task.taskId}`, { completed });
      setPlans((current) => current.map((item) => item.planId === data.plan.planId ? data.plan : item));
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Plan progress could not be updated.");
    } finally {
      setSubmitting(false);
    }
  };

  const archivePlan = async (planId) => {
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/farming/plans/${planId}/archive`);
      setPlans((current) => current.map((item) => item.planId === planId ? data.plan : item));
      setArchiveTarget("");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "The plan could not be archived.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="farm-page">
      <header className="farm-hero"><div className="shell-container"><p className="farm-eyebrow">Official agricultural pathways</p><h1>Plan the next farm task, not another generic request</h1><p>Use verified government routes for soil health, crop insurance, market access and PM-KISAN. Save only a practical checklist here; sensitive records stay with the responsible authority.</p></div></header>
      <div className="farm-tabs shell-container" role="tablist" aria-label="Farming workspace">
        <button type="button" role="tab" aria-selected={view === "explore"} onClick={() => setView("explore")}>Explore official pathways</button>
        <button type="button" role="tab" aria-selected={view === "plans"} onClick={() => setView("plans")}>My farming plans {user && activePlans.length ? `(${activePlans.length})` : ""}</button>
      </div>
      {error && <p className="farm-alert farm-alert--error shell-container" role="alert">{error}</p>}
      {notice && <p className="farm-alert shell-container" role="status">{notice}</p>}

      {view === "explore" ? (
        <section className="farm-workspace shell-container">
          <aside className="farm-directory">
            <label htmlFor="farm-search">What do you need to do?</label>
            <input id="farm-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Soil, insurance, mandi, PM-KISAN..." />
            {loading ? <p>Loading verified pathways...</p> : filtered.map((pathway) => (
              <button type="button" className={selectedCode === pathway.pathwayCode ? "is-active" : ""} onClick={() => setSelectedCode(pathway.pathwayCode)} key={pathway.pathwayCode}><span>{pathway.category}</span><strong>{pathway.title}</strong></button>
            ))}
          </aside>
          {selected && (
            <article className="farm-pathway">
              <p className="farm-eyebrow">{selected.category}</p><h2>{selected.title}</h2><p className="farm-summary">{selected.summary}</p>
              <div className="farm-authority"><span>Responsible authority</span><strong>{selected.authority}</strong></div>
              <div className="farm-boundary"><strong>Important boundary</strong><p>{selected.boundary}</p></div>
              <h3>Your preparation checklist</h3>
              <ol className="farm-task-preview">{selected.tasks.map((task) => <li key={task.taskId}><strong>{task.title}</strong><span>{task.description}</span></li>)}</ol>
              <a className="farm-official-link" href={selected.officialUrl} target="_blank" rel="noreferrer">Open official {selected.authority} route</a>
              <div className="farm-plan-builder">
                <h3>Save this as a private action plan</h3><p>Crop and district are optional labels for your own list. Do not enter land-record, Aadhaar, bank or beneficiary numbers.</p>
                <div className="farm-fields">
                  <label>Crop label (optional)<input value={crop} onChange={(event) => setCrop(event.target.value)} maxLength={80} placeholder="For example, paddy" /></label>
                  <label>District label (optional)<input value={district} onChange={(event) => setDistrict(event.target.value)} maxLength={100} placeholder="For example, Kottayam" /></label>
                  <label>Season<select value={season} onChange={(event) => setSeason(event.target.value)}>{Object.entries(seasonLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                </div>
                {!user ? <div className="farm-signin"><span>Sign in to save and track this checklist.</span><Link to="/login" state={{ from: { pathname: "/services/farming" } }}>Sign in to continue</Link></div> : <button type="button" className="farm-save" onClick={savePlan} disabled={submitting}>{submitting ? "Saving..." : "Save farming action plan"}</button>}
              </div>
            </article>
          )}
        </section>
      ) : (
        <section className="farm-plans shell-container">
          <div><p className="farm-eyebrow">Owner-scoped progress</p><h2>My farming plans</h2><p>Check off preparation steps here and complete the real transaction only on the linked authority platform.</p></div>
          {!user ? <div className="farm-empty"><h3>Sign in to view plans</h3><Link to="/login">Sign in</Link></div> : loading ? <p>Loading plans...</p> : activePlans.length ? activePlans.map((plan) => {
            const completed = plan.tasks.filter((task) => task.status === "completed").length;
            const progress = Math.round((completed / plan.tasks.length) * 100);
            return <article className="farm-plan" key={plan.planId}>
              <header><div><span>{seasonLabels[plan.season]}</span><h3>{plan.pathwayTitle}</h3><p>{plan.planId}{plan.crop ? ` | ${plan.crop}` : ""}{plan.district ? ` | ${plan.district}` : ""}</p></div><strong>{progress}%</strong></header>
              <div className="farm-progress"><span style={{ width: `${progress}%` }} /></div>
              <div className="farm-checklist">{plan.tasks.map((task) => <label className={task.status === "completed" ? "is-complete" : ""} key={task.taskId}><input type="checkbox" checked={task.status === "completed"} disabled={submitting} onChange={(event) => updateTask(plan, task, event.target.checked)} /><span><strong>{task.title}</strong><small>{task.description}</small></span></label>)}</div>
              <footer><a href={plan.officialUrl} target="_blank" rel="noreferrer">Continue on official portal</a>{archiveTarget === plan.planId ? <div><span>Archive this plan?</span><button type="button" onClick={() => archivePlan(plan.planId)}>Yes, archive</button><button type="button" onClick={() => setArchiveTarget("")}>Keep plan</button></div> : <button type="button" onClick={() => setArchiveTarget(plan.planId)}>Archive</button>}</footer>
            </article>;
          }) : <div className="farm-empty"><h3>No active farming plans</h3><button type="button" onClick={() => setView("explore")}>Explore pathways</button></div>}
        </section>
      )}
    </main>
  );
}

export default Farming;
