import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArchive,
  FaArrowRight,
  FaBookmark,
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaCompass,
  FaExternalLinkAlt,
  FaGlobeAsia,
  FaGraduationCap,
  FaMoneyBillWave,
  FaSearch,
  FaShieldAlt,
  FaUniversity,
} from "react-icons/fa";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Education.css";

const LEARNER_STAGES = [
  ["school", "School — up to class 10"],
  ["higher-secondary", "Higher secondary — classes 11–12"],
  ["undergraduate", "Undergraduate student"],
  ["postgraduate", "Postgraduate student"],
  ["working", "Working or returning to study"],
  ["international", "International student planning to study in India"],
];

const GOALS = [
  { code: "admission", title: "Admission and counselling", description: "Understand choice filling, allocation and reporting.", icon: <FaUniversity /> },
  { code: "entrance-exam", title: "Entrance examination", description: "Find the correct authority and current bulletin.", icon: <FaClipboardList /> },
  { code: "funding", title: "Scholarship funding", description: "Check schemes and prepare for official verification.", icon: <FaMoneyBillWave /> },
  { code: "verify-institution", title: "Check an institution", description: "Research official listings before paying.", icon: <FaSearch /> },
  { code: "career-guidance", title: "Career direction", description: "Explore occupations and counselling support.", icon: <FaCompass /> },
  { code: "study-in-india", title: "Study in India", description: "Plan the official international-student journey.", icon: <FaGlobeAsia /> },
];

const CATEGORY_ICONS = {
  Funding: <FaMoneyBillWave />,
  Examinations: <FaClipboardList />,
  Admissions: <FaUniversity />,
  "Institution research": <FaSearch />,
  "Career planning": <FaCompass />,
  "International admissions": <FaGlobeAsia />,
};

const STAGE_LABELS = Object.fromEntries(LEARNER_STAGES);
const CYCLE_LABELS = {
  "current-cycle": "Current application cycle",
  "next-cycle": "Next application cycle",
  exploring: "Still exploring",
};
const getError = (error, fallback) => error.response?.data?.error || fallback;
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));

function Education() {
  const { user } = useAuth();
  const [view, setView] = useState("explore");
  const [pathways, setPathways] = useState([]);
  const [plans, setPlans] = useState([]);
  const [learnerStage, setLearnerStage] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [checkedRequirements, setCheckedRequirements] = useState([]);
  const [target, setTarget] = useState("");
  const [targetCycle, setTargetCycle] = useState("exploring");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);

  useEffect(() => {
    api.get("/education/pathways")
      .then(({ data }) => setPathways(data.pathways))
      .catch((requestError) => setError(getError(requestError, "Education pathways could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  const recommendations = useMemo(() => pathways.filter((pathway) => (
    (!goal || pathway.goalCodes.includes(goal))
    && (!learnerStage || pathway.learnerStages.includes(learnerStage))
  )), [pathways, goal, learnerStage]);

  useEffect(() => {
    if (!selectedPathway || !recommendations.some((item) => item.pathwayCode === selectedPathway.pathwayCode)) {
      setSelectedPathway(recommendations[0] || null);
      setCheckedRequirements([]);
      setConfirmation(null);
    }
  }, [recommendations, selectedPathway]);

  const loadPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/education/plans/mine");
      setPlans(data.plans);
    } catch (requestError) {
      setError(getError(requestError, "Your education plans could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (view === "plans") loadPlans();
  }, [view, loadPlans]);

  const changeView = (nextView) => {
    setView(nextView);
    setError("");
    setSuccess("");
  };

  const chooseGoal = (goalCode) => {
    setGoal(goal === goalCode ? "" : goalCode);
    setError("");
    setConfirmation(null);
  };

  const choosePathway = (pathway) => {
    setSelectedPathway(pathway);
    setCheckedRequirements([]);
    setConfirmation(null);
    document.getElementById("education-pathway-detail")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  const savePlan = async () => {
    setError("");
    if (!learnerStage) {
      setError("Choose your current learner stage before saving a plan.");
      return;
    }
    if (!selectedPathway?.learnerStages.includes(learnerStage)) {
      setError("Choose a pathway recommended for your learner stage.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/education/plans", {
        pathwayCode: selectedPathway.pathwayCode,
        learnerStage,
        target,
        targetCycle,
      });
      setPlans((current) => [data.plan, ...current]);
      setConfirmation(data.plan);
      setSuccess("Your education action plan has been saved.");
    } catch (requestError) {
      setError(getError(requestError, "The education plan could not be saved."));
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (plan, task, completed) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.patch(`/education/plans/${plan.planId}/tasks/${task.taskId}`, { completed });
      setPlans((current) => current.map((item) => item.planId === plan.planId ? data.plan : item));
      setSuccess(completed ? "Step marked complete." : "Step returned to your checklist.");
    } catch (requestError) {
      setError(getError(requestError, "Plan progress could not be updated."));
    } finally {
      setSubmitting(false);
    }
  };

  const archivePlan = async (planId) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.patch(`/education/plans/${planId}/archive`);
      setPlans((current) => current.map((item) => item.planId === planId ? data.plan : item));
      setArchiveTarget(null);
      setSuccess("Education plan archived.");
    } catch (requestError) {
      setError(getError(requestError, "The education plan could not be archived."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="education-page">
      <section className="education-hero">
        <div className="shell-container education-hero__inner">
          <div>
            <p className="education-eyebrow">Education pathways</p>
            <h1>Plan the next step. Apply in the right place.</h1>
            <p>Find the responsible public platform, understand its process and keep a private preparation checklist without uploading personal education records here.</p>
          </div>
          <div className="education-hero__boundary">
            <FaShieldAlt aria-hidden="true" />
            <div><strong>Guidance, not an admission agent</strong><span>Applications, fees, rankings, allocation and approvals stay with the named authority.</span></div>
          </div>
        </div>
      </section>

      <nav className="education-tabs shell-container" role="tablist" aria-label="Education planning">
        <button type="button" role="tab" aria-selected={view === "explore"} onClick={() => changeView("explore")}><FaSearch aria-hidden="true" /> Explore pathways</button>
        <button type="button" role="tab" aria-selected={view === "plans"} onClick={() => changeView("plans")}><FaBookmark aria-hidden="true" /> My action plans{user && plans.length ? ` (${plans.length})` : ""}</button>
      </nav>

      {error && <div className="education-alert education-alert--error shell-container" role="alert">{error}</div>}
      {success && <div className="education-alert education-alert--success shell-container" role="status">{success}</div>}

      {view === "explore" ? (
        <>
          <section className="education-finder shell-container" aria-labelledby="education-finder-heading">
            <div className="education-finder__heading">
              <p className="education-eyebrow">Pathway finder</p>
              <h2 id="education-finder-heading">Start with your situation</h2>
              <p>Two choices narrow the catalogue. You can still open every pathway without signing in.</p>
            </div>

            <div className="education-stage-control">
              <label htmlFor="learner-stage">Your current stage</label>
              <select id="learner-stage" value={learnerStage} onChange={(event) => { setLearnerStage(event.target.value); setError(""); }}>
                <option value="">Choose a learner stage</option>
                {LEARNER_STAGES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>

            <fieldset className="education-goals">
              <legend>What are you trying to do?</legend>
              <div>{GOALS.map((item) => (
                <button type="button" className={goal === item.code ? "is-selected" : ""} aria-pressed={goal === item.code} onClick={() => chooseGoal(item.code)} key={item.code}>
                  <span className="education-goal-icon" aria-hidden="true">{item.icon}</span>
                  <span><strong>{item.title}</strong><small>{item.description}</small></span>
                  <FaArrowRight aria-hidden="true" />
                </button>
              ))}</div>
            </fieldset>
          </section>

          <section className="education-results shell-container" aria-labelledby="education-results-heading">
            <div className="education-results__heading">
              <div><p className="education-eyebrow">Official routes</p><h2 id="education-results-heading">{goal || learnerStage ? "Recommended pathways" : "Browse all pathways"}</h2></div>
              {(goal || learnerStage) && <button type="button" onClick={() => { setGoal(""); setLearnerStage(""); }}>Clear choices</button>}
            </div>

            {loading ? <div className="education-loading" role="status">Loading verified pathways…</div> : recommendations.length ? (
              <div className="education-pathway-grid">
                {recommendations.map((pathway) => (
                  <article className={selectedPathway?.pathwayCode === pathway.pathwayCode ? "education-pathway-card is-selected" : "education-pathway-card"} key={pathway.pathwayCode}>
                    <span className="education-pathway-card__icon" aria-hidden="true">{CATEGORY_ICONS[pathway.category] || <FaGraduationCap />}</span>
                    <p>{pathway.category}</p>
                    <h3>{pathway.title}</h3>
                    <span>{pathway.summary}</span>
                    <small>{pathway.authority}</small>
                    <button type="button" onClick={() => choosePathway(pathway)}>View pathway <FaArrowRight aria-hidden="true" /></button>
                  </article>
                ))}
              </div>
            ) : <div className="education-no-match"><FaCompass aria-hidden="true" /><h3>No single official route matches both choices</h3><p>Change the learner stage or browse every pathway. Requirements vary by course, authority and application cycle.</p><button type="button" onClick={() => { setGoal(""); setLearnerStage(""); }}>Browse all pathways</button></div>}
          </section>

          {selectedPathway && (
            <section className="education-detail shell-container" id="education-pathway-detail" aria-labelledby="education-pathway-heading">
              <div className="education-detail__title">
                <span>{selectedPathway.category}</span>
                <h2 id="education-pathway-heading">{selectedPathway.title}</h2>
                <p>{selectedPathway.summary}</p>
              </div>

              <div className="education-official-boundary">
                <FaExternalLinkAlt aria-hidden="true" />
                <div><strong>Continue with {selectedPathway.authority}</strong><span>{selectedPathway.boundary}</span></div>
                <a href={selectedPathway.officialUrl} target="_blank" rel="noreferrer">{selectedPathway.officialAction} <FaExternalLinkAlt aria-hidden="true" /></a>
              </div>

              <div className="education-detail-grid">
                <div>
                  <section className="education-process">
                    <p className="education-section-label">Your route</p>
                    <h3>Prepare in this order</h3>
                    <ol>{selectedPathway.tasks.map((task, index) => <li key={task.taskId}><span>{index + 1}</span><div><strong>{task.title}</strong><p>{task.description}</p>{task.officialUrl && <a href={task.officialUrl} target="_blank" rel="noreferrer">Open official source <FaExternalLinkAlt aria-hidden="true" /></a>}</div></li>)}</ol>
                  </section>

                  <section className="education-requirements">
                    <p className="education-section-label">Preparation only</p>
                    <h3>Check what you may need</h3>
                    <p>This local preview checklist is not saved or submitted. Confirm exact evidence in the current official notice.</p>
                    <div>{selectedPathway.requirements.map((requirement, index) => {
                      const checked = checkedRequirements.includes(index);
                      return <label className={checked ? "is-checked" : ""} key={requirement}><input type="checkbox" checked={checked} onChange={() => setCheckedRequirements((current) => checked ? current.filter((item) => item !== index) : [...current, index])} /><span><FaCheck aria-hidden="true" /></span>{requirement}</label>;
                    })}</div>
                  </section>
                </div>

                <aside className="education-plan-builder">
                  {confirmation ? (
                    <div className="education-plan-confirmation" role="status">
                      <FaCheckCircle aria-hidden="true" />
                      <p className="education-section-label">Plan saved</p>
                      <h3>{confirmation.planId}</h3>
                      <p>Your checklist is private to your account. Official application progress remains with {confirmation.authority}.</p>
                      <button type="button" onClick={() => changeView("plans")}>Open my action plans</button>
                    </div>
                  ) : (
                    <>
                      <p className="education-section-label">Keep your place</p>
                      <h3>Save a personal action plan</h3>
                      <p>Save these preparation steps and tick them off as you complete them on the official service.</p>
                      <dl><div><dt>Pathway</dt><dd>{selectedPathway.title}</dd></div><div><dt>Learner stage</dt><dd>{STAGE_LABELS[learnerStage] || "Choose above"}</dd></div></dl>
                      <label>Specific exam, course or scheme <span>(optional)</span><input value={target} onChange={(event) => setTarget(event.target.value)} maxLength="160" placeholder="For example: CUET undergraduate admission" /></label>
                      <fieldset><legend>Planning for</legend>{Object.entries(CYCLE_LABELS).map(([value, label]) => <label className={targetCycle === value ? "is-selected" : ""} key={value}><input type="radio" name="target-cycle" value={value} checked={targetCycle === value} onChange={() => setTargetCycle(value)} />{label}</label>)}</fieldset>
                      {!user ? <div className="education-signin"><strong>Sign in to save progress</strong><p>Browsing and official links remain available without an account.</p><Link to="/login" state={{ from: { pathname: "/services/education" } }}>Sign in to continue</Link></div> : <button type="button" className="education-save-button" onClick={savePlan} disabled={submitting}>{submitting ? "Saving plan…" : "Save this action plan"}</button>}
                      <small className="education-data-note"><FaShieldAlt aria-hidden="true" /> Do not enter marks, roll numbers, identity details or document contents.</small>
                    </>
                  )}
                </aside>
              </div>
            </section>
          )}
        </>
      ) : (
        <EducationPlans
          user={user}
          plans={plans}
          loading={loading}
          submitting={submitting}
          updateTask={updateTask}
          archiveTarget={archiveTarget}
          setArchiveTarget={setArchiveTarget}
          archivePlan={archivePlan}
          explore={() => changeView("explore")}
        />
      )}

      <section className="education-trust-strip"><div className="shell-container"><FaShieldAlt aria-hidden="true" /><div><strong>Check the current official notice before every application</strong><span>Dates, eligibility, fees and document rules can change between cycles. Vidhya Vedha does not publish or guarantee them.</span></div></div></section>
    </main>
  );
}

function EducationPlans({ user, plans, loading, submitting, updateTask, archiveTarget, setArchiveTarget, archivePlan, explore }) {
  const activePlans = plans.filter((plan) => plan.status !== "archived");
  const archivedPlans = plans.filter((plan) => plan.status === "archived");

  return (
    <section className="education-plans shell-container" aria-labelledby="education-plans-heading">
      <div className="education-plans__heading"><p className="education-eyebrow">Your account</p><h2 id="education-plans-heading">Education action plans</h2><p>Track preparation here. Use each official platform for submission, payments and authoritative status.</p></div>
      {!user ? <div className="education-empty"><FaBookmark aria-hidden="true" /><h3>Sign in to view saved plans</h3><p>Your education checklist is only visible inside your account.</p><Link to="/login" state={{ from: { pathname: "/services/education" } }}>Sign in</Link></div> : loading ? <div className="education-loading" role="status">Loading your action plans…</div> : activePlans.length ? (
        <div className="education-plan-list">{activePlans.map((plan) => {
          const completed = plan.tasks.filter((task) => task.status === "completed").length;
          const progress = Math.round((completed / plan.tasks.length) * 100);
          return <article className="education-plan" key={plan.planId}><header><div><span>{plan.status === "completed" ? "Plan complete" : CYCLE_LABELS[plan.targetCycle]}</span><h3>{plan.pathwayTitle}</h3><p>{plan.planId} · Saved {formatDate(plan.createdAt)}</p></div><div className="education-progress-number"><strong>{progress}%</strong><span>{completed} of {plan.tasks.length} steps</span></div></header><div className="education-progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>{plan.target && <p className="education-plan-target"><strong>Your target:</strong> {plan.target}</p>}<div className="education-plan-tasks">{plan.tasks.map((task) => <label className={task.status === "completed" ? "is-complete" : ""} key={task.taskId}><input type="checkbox" checked={task.status === "completed"} disabled={submitting} onChange={(event) => updateTask(plan, task, event.target.checked)} /><span><FaCheck aria-hidden="true" /></span><span><strong>{task.title}</strong><small>{task.description}</small></span></label>)}</div><footer><a href={plan.officialUrl} target="_blank" rel="noreferrer">Continue on official portal <FaExternalLinkAlt aria-hidden="true" /></a>{archiveTarget === plan.planId ? <div className="education-archive-confirm"><span>Archive this plan?</span><button type="button" onClick={() => archivePlan(plan.planId)} disabled={submitting}>Yes, archive</button><button type="button" onClick={() => setArchiveTarget(null)}>Keep plan</button></div> : <button type="button" onClick={() => setArchiveTarget(plan.planId)}><FaArchive aria-hidden="true" /> Archive</button>}</footer></article>;
        })}</div>
      ) : <div className="education-empty"><FaGraduationCap aria-hidden="true" /><h3>No active education plans</h3><p>Explore an official pathway and save its preparation checklist.</p><button type="button" onClick={explore}>Explore pathways</button></div>}

      {user && archivedPlans.length > 0 && <details className="education-archived"><summary>Archived plans ({archivedPlans.length})</summary>{archivedPlans.map((plan) => <div key={plan.planId}><strong>{plan.pathwayTitle}</strong><span>{plan.planId} · Archived {formatDate(plan.archivedAt)}</span></div>)}</details>}
    </section>
  );
}

export default Education;