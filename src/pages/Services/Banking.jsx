import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArchive,
  FaArrowRight,
  FaBalanceScale,
  FaBookmark,
  FaCalculator,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaLandmark,
  FaRegCreditCard,
  FaSearch,
  FaShieldAlt,
  FaUniversity,
  FaUserShield,
} from "react-icons/fa";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { calculateLoanCost } from "../../utils/loanCalculator.js";
import "./Banking.css";

const NEEDS = [
  { code: "business-credit", title: "Business or livelihood credit", description: "Check credit-linked government schemes.", icon: <FaLandmark /> },
  { code: "education-finance", title: "Education finance", description: "Prepare for the official education-loan route.", icon: <FaUniversity /> },
  { code: "bank-account", title: "Basic bank account", description: "Understand PMJDY and the bank process.", icon: <FaRegCreditCard /> },
  { code: "banking-complaint", title: "Banking complaint", description: "Escalate from the provider to RBI CMS.", icon: <FaBalanceScale /> },
  { code: "insurance-check", title: "Check an insurer", description: "Verify before buying or paying.", icon: <FaUserShield /> },
  { code: "insurance-complaint", title: "Insurance grievance", description: "Follow the insurer-first Bima Bharosa route.", icon: <FaShieldAlt /> },
];

const CATEGORY_ICONS = {
  "Government credit": <FaLandmark />,
  "Education finance": <FaUniversity />,
  "Financial inclusion": <FaRegCreditCard />,
  "Banking grievance": <FaBalanceScale />,
  "Insurance checks": <FaUserShield />,
  "Insurance grievance": <FaShieldAlt />,
};

const HORIZON_LABELS = {
  now: "I need to act now",
  "within-three-months": "Within three months",
  researching: "I am researching",
};

const getError = (error, fallback) => error.response?.data?.error || fallback;
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value);

function Banking() {
  const { user } = useAuth();
  const [view, setView] = useState("routes");
  const [pathways, setPathways] = useState([]);
  const [plans, setPlans] = useState([]);
  const [need, setNeed] = useState("");
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [checkedPreparation, setCheckedPreparation] = useState([]);
  const [target, setTarget] = useState("");
  const [planningHorizon, setPlanningHorizon] = useState("researching");
  const [principal, setPrincipal] = useState("500000");
  const [annualRate, setAnnualRate] = useState("10.5");
  const [months, setMonths] = useState("60");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);

  useEffect(() => {
    api.get("/finance/pathways")
      .then(({ data }) => setPathways(data.pathways))
      .catch((requestError) => setError(getError(requestError, "Financial pathways could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  const recommendations = useMemo(() => pathways.filter((pathway) => (
    !need || pathway.needCodes.includes(need)
  )), [pathways, need]);

  useEffect(() => {
    if (!selectedPathway || !recommendations.some(({ pathwayCode }) => pathwayCode === selectedPathway.pathwayCode)) {
      setSelectedPathway(recommendations[0] || null);
      setCheckedPreparation([]);
      setConfirmation(null);
    }
  }, [recommendations, selectedPathway]);

  const calculation = useMemo(() => calculateLoanCost({
    principal,
    annualRate,
    months: Number(months),
  }), [principal, annualRate, months]);

  const loadPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/finance/plans/mine");
      setPlans(data.plans);
    } catch (requestError) {
      setError(getError(requestError, "Your financial preparation plans could not be loaded."));
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

  const chooseNeed = (needCode) => {
    setNeed(need === needCode ? "" : needCode);
    setConfirmation(null);
    setError("");
  };

  const choosePathway = (pathway) => {
    setSelectedPathway(pathway);
    setCheckedPreparation([]);
    setConfirmation(null);
    document.getElementById("financial-pathway-detail")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  const savePlan = async () => {
    if (!selectedPathway) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/finance/plans", {
        pathwayCode: selectedPathway.pathwayCode,
        target,
        planningHorizon,
      });
      setPlans((current) => [data.plan, ...current]);
      setConfirmation(data.plan);
      setSuccess("Your financial preparation plan has been saved.");
    } catch (requestError) {
      setError(getError(requestError, "The financial plan could not be saved."));
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (plan, task, completed) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.patch(`/finance/plans/${plan.planId}/tasks/${task.taskId}`, { completed });
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
      const { data } = await api.patch(`/finance/plans/${planId}/archive`);
      setPlans((current) => current.map((item) => item.planId === planId ? data.plan : item));
      setArchiveTarget(null);
      setSuccess("Financial preparation plan archived.");
    } catch (requestError) {
      setError(getError(requestError, "The financial plan could not be archived."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="finance-page">
      <section className="finance-hero">
        <div className="shell-container finance-hero__inner">
          <div>
            <p className="finance-eyebrow">Money and banking</p>
            <h1>Understand the route before you share financial details.</h1>
            <p>Find the responsible official platform, prepare a private checklist and estimate loan cost without submitting an application here.</p>
          </div>
          <div className="finance-hero__boundary">
            <FaShieldAlt aria-hidden="true" />
            <div><strong>Guidance, not a lender or insurer</strong><span>We do not quote rates, approve credit, sell policies, perform KYC or hold your financial records.</span></div>
          </div>
        </div>
      </section>

      <nav className="finance-tabs shell-container" role="tablist" aria-label="Financial guidance">
        <button type="button" role="tab" aria-selected={view === "routes"} onClick={() => changeView("routes")}><FaSearch aria-hidden="true" /> Find an official route</button>
        <button type="button" role="tab" aria-selected={view === "calculator"} onClick={() => changeView("calculator")}><FaCalculator aria-hidden="true" /> Loan cost calculator</button>
        <button type="button" role="tab" aria-selected={view === "plans"} onClick={() => changeView("plans")}><FaBookmark aria-hidden="true" /> My preparation plans{user && plans.length ? ` (${plans.length})` : ""}</button>
      </nav>

      {error && <div className="finance-alert finance-alert--error shell-container" role="alert">{error}</div>}
      {success && <div className="finance-alert finance-alert--success shell-container" role="status">{success}</div>}

      {view === "routes" && (
        <>
          <section className="finance-finder shell-container" aria-labelledby="finance-finder-heading">
            <div className="finance-finder__heading">
              <p className="finance-eyebrow">Route finder</p>
              <h2 id="finance-finder-heading">What do you need to do?</h2>
              <p>Choose a task to narrow the verified public pathways. Browsing never requires an account.</p>
            </div>
            <div className="finance-needs">
              {NEEDS.map((item) => (
                <button type="button" className={need === item.code ? "is-selected" : ""} aria-pressed={need === item.code} onClick={() => chooseNeed(item.code)} key={item.code}>
                  <span aria-hidden="true">{item.icon}</span>
                  <span><strong>{item.title}</strong><small>{item.description}</small></span>
                  <FaArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="finance-results shell-container" aria-labelledby="finance-results-heading">
            <div className="finance-results__heading">
              <div><p className="finance-eyebrow">Verified handoffs</p><h2 id="finance-results-heading">{need ? "Recommended route" : "Browse all financial routes"}</h2></div>
              {need && <button type="button" onClick={() => setNeed("")}>Clear choice</button>}
            </div>
            {loading ? <div className="finance-loading" role="status">Loading verified pathways...</div> : (
              <div className="finance-pathway-grid">
                {recommendations.map((pathway) => (
                  <article className={selectedPathway?.pathwayCode === pathway.pathwayCode ? "finance-pathway-card is-selected" : "finance-pathway-card"} key={pathway.pathwayCode}>
                    <span className="finance-pathway-card__icon" aria-hidden="true">{CATEGORY_ICONS[pathway.category] || <FaLandmark />}</span>
                    <p>{pathway.category}</p>
                    <h3>{pathway.title}</h3>
                    <span>{pathway.summary}</span>
                    <small>{pathway.authority}</small>
                    <button type="button" onClick={() => choosePathway(pathway)}>View official route <FaArrowRight aria-hidden="true" /></button>
                  </article>
                ))}
              </div>
            )}
          </section>

          {selectedPathway && (
            <section className="finance-detail shell-container" id="financial-pathway-detail" aria-labelledby="financial-pathway-heading">
              <div className="finance-detail__title">
                <span>{selectedPathway.category}</span>
                <h2 id="financial-pathway-heading">{selectedPathway.title}</h2>
                <p>{selectedPathway.summary}</p>
              </div>

              <div className="finance-official-boundary">
                <FaExternalLinkAlt aria-hidden="true" />
                <div><strong>Continue with {selectedPathway.authority}</strong><span>{selectedPathway.boundary}</span></div>
                <a href={selectedPathway.officialUrl} target="_blank" rel="noreferrer">{selectedPathway.officialAction} <FaExternalLinkAlt aria-hidden="true" /></a>
              </div>

              <div className="finance-detail-grid">
                <div>
                  <section className="finance-process">
                    <p className="finance-section-label">Your route</p>
                    <h3>Prepare in this order</h3>
                    <ol>{selectedPathway.tasks.map((task, index) => (
                      <li key={task.taskId}><span>{index + 1}</span><div><strong>{task.title}</strong><p>{task.description}</p>{task.officialUrl && <a href={task.officialUrl} target="_blank" rel="noreferrer">Open official source <FaExternalLinkAlt aria-hidden="true" /></a>}</div></li>
                    ))}</ol>
                  </section>

                  <div className="finance-support-grid">
                    <section className="finance-preparation">
                      <p className="finance-section-label">Private preview</p>
                      <h3>Prepare without uploading</h3>
                      <p>These ticks stay in this browser and are not sent to the API.</p>
                      <div>{selectedPathway.preparationItems.map((item, index) => {
                        const checked = checkedPreparation.includes(index);
                        return <label className={checked ? "is-checked" : ""} key={item}><input type="checkbox" checked={checked} onChange={() => setCheckedPreparation((current) => checked ? current.filter((value) => value !== index) : [...current, index])} /><span><FaCheck aria-hidden="true" /></span>{item}</label>;
                      })}</div>
                    </section>
                    <section className="finance-warning-list">
                      <p className="finance-section-label">Pause if you see this</p>
                      <h3>Fraud and mis-selling warnings</h3>
                      <ul>{selectedPathway.watchFor.map((warning) => <li key={warning}><FaExclamationTriangle aria-hidden="true" /><span>{warning}</span></li>)}</ul>
                    </section>
                  </div>
                </div>

                <aside className="finance-plan-builder">
                  {confirmation ? (
                    <div className="finance-plan-confirmation" role="status">
                      <FaCheckCircle aria-hidden="true" />
                      <p className="finance-section-label">Plan saved</p>
                      <h3>{confirmation.planId}</h3>
                      <p>The saved checklist contains no loan values, income, bank details, policy details or identity documents.</p>
                      <button type="button" onClick={() => changeView("plans")}>Open my preparation plans</button>
                    </div>
                  ) : (
                    <>
                      <p className="finance-section-label">Keep your place</p>
                      <h3>Save a preparation plan</h3>
                      <p>Save this public route and checklist. Applications and authoritative status stay with the official provider.</p>
                      <dl><div><dt>Pathway</dt><dd>{selectedPathway.title}</dd></div><div><dt>Authority</dt><dd>{selectedPathway.authority}</dd></div></dl>
                      <label>Purpose label <span>(optional)</span><input value={target} onChange={(event) => setTarget(event.target.value)} maxLength="120" placeholder="For example: Compare education loan terms" /></label>
                      <fieldset><legend>Planning horizon</legend>{Object.entries(HORIZON_LABELS).map(([value, label]) => <label className={planningHorizon === value ? "is-selected" : ""} key={value}><input type="radio" name="planning-horizon" value={value} checked={planningHorizon === value} onChange={() => setPlanningHorizon(value)} />{label}</label>)}</fieldset>
                      {!user ? <div className="finance-signin"><strong>Sign in to save progress</strong><p>Official links and the calculator remain public.</p><Link to="/login" state={{ from: { pathname: "/services/banking" } }}>Sign in to continue</Link></div> : <button type="button" className="finance-save-button" onClick={savePlan} disabled={submitting}>{submitting ? "Saving plan..." : "Save preparation plan"}</button>}
                      <small className="finance-data-note"><FaShieldAlt aria-hidden="true" /> Never enter an account, card, policy, identity, income or credit-score value here.</small>
                    </>
                  )}
                </aside>
              </div>
            </section>
          )}
        </>
      )}

      {view === "calculator" && (
        <LoanCalculator
          principal={principal}
          setPrincipal={setPrincipal}
          annualRate={annualRate}
          setAnnualRate={setAnnualRate}
          months={months}
          setMonths={setMonths}
          calculation={calculation}
        />
      )}

      {view === "plans" && (
        <FinancialPlans
          user={user}
          plans={plans}
          loading={loading}
          submitting={submitting}
          updateTask={updateTask}
          archiveTarget={archiveTarget}
          setArchiveTarget={setArchiveTarget}
          archivePlan={archivePlan}
          explore={() => changeView("routes")}
        />
      )}

      <section className="finance-trust-strip"><div className="shell-container"><FaShieldAlt aria-hidden="true" /><div><strong>Never share an OTP, PIN, password or card security code</strong><span>Use the named authority, bank or insurer for applications, KYC, payment, evidence and official status.</span></div></div></section>
    </main>
  );
}

function LoanCalculator({ principal, setPrincipal, annualRate, setAnnualRate, months, setMonths, calculation }) {
  return (
    <section className="finance-calculator shell-container" aria-labelledby="loan-calculator-heading">
      <div className="finance-calculator__intro">
        <p className="finance-eyebrow">Private, illustrative tool</p>
        <h2 id="loan-calculator-heading">Estimate a reducing-balance loan cost</h2>
        <p>Values are calculated only in your browser. They are not saved, transmitted or used to assess eligibility.</p>
      </div>
      <div className="finance-calculator-grid">
        <div className="finance-calculator-inputs">
          <label htmlFor="loan-amount">Illustrative loan amount</label>
          <div className="finance-money-input"><span aria-hidden="true">₹</span><input id="loan-amount" type="number" min="1" step="1000" inputMode="decimal" value={principal} onChange={(event) => setPrincipal(event.target.value)} /></div>
          <label htmlFor="annual-rate">Annual interest rate</label>
          <div className="finance-suffix-input"><input id="annual-rate" type="number" min="0" max="100" step="0.01" inputMode="decimal" value={annualRate} onChange={(event) => setAnnualRate(event.target.value)} /><span aria-hidden="true">%</span></div>
          <label htmlFor="loan-term">Repayment term</label>
          <select id="loan-term" value={months} onChange={(event) => setMonths(event.target.value)}>
            <option value="12">1 year (12 months)</option>
            <option value="24">2 years (24 months)</option>
            <option value="36">3 years (36 months)</option>
            <option value="60">5 years (60 months)</option>
            <option value="84">7 years (84 months)</option>
            <option value="120">10 years (120 months)</option>
            <option value="180">15 years (180 months)</option>
            <option value="240">20 years (240 months)</option>
          </select>
          <div className="finance-local-note"><FaShieldAlt aria-hidden="true" /><span><strong>Stays on this device</strong>No calculator value is sent to Vidhya Vedha or a lender.</span></div>
        </div>

        <div className="finance-calculator-result" aria-live="polite">
          <p>Illustrative repayment</p>
          {calculation ? (
            <>
              <strong>{formatMoney(calculation.monthlyPayment)}<small> / month</small></strong>
              <dl>
                <div><dt>Amount entered</dt><dd>{formatMoney(Number(principal))}</dd></div>
                <div><dt>Total interest</dt><dd>{formatMoney(calculation.totalInterest)}</dd></div>
                <div><dt>Total repayment</dt><dd>{formatMoney(calculation.totalRepayable)}</dd></div>
              </dl>
            </>
          ) : <div className="finance-calculator-error" role="alert">Enter a positive amount, a non-negative annual rate and a valid term.</div>}
        </div>
      </div>

      <div className="finance-kfs-panel">
        <div><FaBalanceScale aria-hidden="true" /><span><p className="finance-section-label">Before accepting any loan</p><h3>Compare the lender's Key Facts Statement, not this estimate</h3></span></div>
        <ul>
          <li><strong>APR and every charge</strong><span>APR captures more of the credit cost than the interest rate alone.</span></li>
          <li><strong>Repayment conditions</strong><span>Check the term, due dates, rate type, security, late-payment and foreclosure terms.</span></li>
          <li><strong>A repayment buffer</strong><span>Test whether essential expenses remain affordable if income falls or a floating rate changes.</span></li>
        </ul>
        <a href="https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12827" target="_blank" rel="noreferrer">Read RBI's KFS direction <FaExternalLinkAlt aria-hidden="true" /></a>
        <small>This estimate assumes equal monthly payments and a constant annual rate. It excludes lender fees, taxes, insurance, changes in a floating rate and payment timing differences. It is not a quote or financial advice.</small>
      </div>
    </section>
  );
}

function FinancialPlans({ user, plans, loading, submitting, updateTask, archiveTarget, setArchiveTarget, archivePlan, explore }) {
  const activePlans = plans.filter((plan) => plan.status !== "archived");
  const archivedPlans = plans.filter((plan) => plan.status === "archived");

  return (
    <section className="finance-plans shell-container" aria-labelledby="finance-plans-heading">
      <div className="finance-plans__heading"><p className="finance-eyebrow">Your account</p><h2 id="finance-plans-heading">Financial preparation plans</h2><p>Track preparation here. Applications, payments, evidence and authoritative status remain with the official organisation.</p></div>
      {!user ? <div className="finance-empty"><FaBookmark aria-hidden="true" /><h3>Sign in to view saved plans</h3><p>Your financial preparation checklists are visible only inside your account.</p><Link to="/login" state={{ from: { pathname: "/services/banking" } }}>Sign in</Link></div> : loading ? <div className="finance-loading" role="status">Loading your preparation plans...</div> : activePlans.length ? (
        <div className="finance-plan-list">{activePlans.map((plan) => {
          const completed = plan.tasks.filter((task) => task.status === "completed").length;
          const progress = Math.round((completed / plan.tasks.length) * 100);
          return <article className="finance-plan" key={plan.planId}><header><div><span>{plan.status === "completed" ? "Plan complete" : HORIZON_LABELS[plan.planningHorizon]}</span><h3>{plan.pathwayTitle}</h3><p>{plan.planId} · Saved {formatDate(plan.createdAt)}</p></div><div className="finance-progress-number"><strong>{progress}%</strong><span>{completed} of {plan.tasks.length} steps</span></div></header><div className="finance-progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>{plan.target && <p className="finance-plan-target"><strong>Your label:</strong> {plan.target}</p>}<div className="finance-plan-tasks">{plan.tasks.map((task) => <label className={task.status === "completed" ? "is-complete" : ""} key={task.taskId}><input type="checkbox" checked={task.status === "completed"} disabled={submitting} onChange={(event) => updateTask(plan, task, event.target.checked)} /><span><FaCheck aria-hidden="true" /></span><span><strong>{task.title}</strong><small>{task.description}</small></span></label>)}</div><footer><a href={plan.officialUrl} target="_blank" rel="noreferrer">Continue on official portal <FaExternalLinkAlt aria-hidden="true" /></a>{archiveTarget === plan.planId ? <div className="finance-archive-confirm"><span>Archive this plan?</span><button type="button" onClick={() => archivePlan(plan.planId)} disabled={submitting}>Yes, archive</button><button type="button" onClick={() => setArchiveTarget(null)}>Keep plan</button></div> : <button type="button" onClick={() => setArchiveTarget(plan.planId)}><FaArchive aria-hidden="true" /> Archive</button>}</footer></article>;
        })}</div>
      ) : <div className="finance-empty"><FaLandmark aria-hidden="true" /><h3>No active financial plans</h3><p>Explore an official route and save its preparation checklist.</p><button type="button" onClick={explore}>Explore official routes</button></div>}

      {user && archivedPlans.length > 0 && <details className="finance-archived"><summary>Archived plans ({archivedPlans.length})</summary>{archivedPlans.map((plan) => <div key={plan.planId}><strong>{plan.pathwayTitle}</strong><span>{plan.planId} · Archived {formatDate(plan.archivedAt)}</span></div>)}</details>}
    </section>
  );
}

export default Banking;
