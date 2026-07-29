import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import "./Drafts.css";

const blank = {
  serviceCode: "government",
  draftType: "application",
  readinessId: "",
  recipient: "",
  subject: "",
  facts: "",
  chronology: "",
  requestedOutcome: "",
  referenceLabel: "",
  signerName: "",
  privacyAcknowledged: false,
};

function Drafts() {
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [form, setForm] = useState(blank);
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const selected = drafts.find(({ draftId }) => draftId === selectedId) || null;
  const service = useMemo(
    () => templates.find(({ serviceCode }) => serviceCode === form.serviceCode),
    [templates, form.serviceCode],
  );

  useEffect(() => {
    Promise.all([api.get("/drafts/templates"), api.get("/drafts")])
      .then(([templateResponse, draftResponse]) => {
        setTemplates(templateResponse.data.templates);
        setDrafts(draftResponse.data.drafts);
        if (templateResponse.data.templates[0]) {
          const requested = templateResponse.data.templates.find(({ serviceCode }) => serviceCode === searchParams.get("service"));
          const first = requested || templateResponse.data.templates[0];
          setForm((value) => ({ ...value, serviceCode: first.serviceCode, draftType: first.types[0]?.draftType || value.draftType, readinessId: searchParams.get("readiness") || "" }));
        }
        if (draftResponse.data.drafts[0]) setSelectedId(draftResponse.data.drafts[0].draftId);
      })
      .catch((err) => setError(err.response?.data?.error || "Draft workspace could not be loaded."));
  }, []);

  const change = ({ target: { name, value, type, checked } }) => {
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const create = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/drafts", form);
      setDrafts((items) => [data.draft, ...items]);
      setSelectedId(data.draft.draftId);
      setNotice(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "The draft could not be generated.");
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/drafts/${selected.draftId}/finalize`);
      setDrafts((items) => items.map((item) => item.draftId === data.draft.draftId ? data.draft : item));
      setNotice(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "The draft could not be finalized.");
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    setBusy(true);
    try {
      const response = await api.get(`/drafts/${selected.draftId}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selected.draftId.toLowerCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice(`${selected.draftId} downloaded. It is still not an official submission.`);
    } catch (err) {
      setError(err.response?.data?.error || "The PDF could not be downloaded.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="drafts-page">
      <header className="drafts-hero">
        <div className="drafts-shell">
          <p className="drafts-kicker">Write, review, then decide</p>
          <h1>Turn your facts into a clear service draft</h1>
          <p>Create an application, complaint, service request, or follow-up. Nothing is sent automatically; you remain responsible for checking every detail and using the responsible official channel.</p>
        </div>
      </header>
      {notice && <p className="drafts-notice drafts-shell" role="status">{notice}</p>}
      {error && <p className="drafts-notice drafts-error drafts-shell" role="alert">{error}</p>}

      <div className="drafts-workspace drafts-shell">
        <form className="drafts-form" onSubmit={create}>
          <p className="drafts-kicker">New draft</p>
          <h2>Describe only what you know</h2>
          <label>Service journey
            <select name="serviceCode" value={form.serviceCode} onChange={(event) => {
              const next = templates.find(({ serviceCode }) => serviceCode === event.target.value);
              setForm((current) => ({ ...current, serviceCode: event.target.value, draftType: next?.types[0]?.draftType || current.draftType }));
            }}>
              {templates.map((item) => <option key={item.serviceCode} value={item.serviceCode}>{item.serviceTitle}</option>)}
            </select>
          </label>
          <label>Draft type
            <select name="draftType" value={form.draftType} onChange={change}>
              {(service?.types || []).map((item) => <option key={item.draftType} value={item.draftType}>{item.label}</option>)}
            </select>
            <span>{service?.types.find(({ draftType }) => draftType === form.draftType)?.purpose}</span>
          </label>
          <label>Recipient (optional)
            <input name="recipient" value={form.recipient} onChange={change} maxLength="160" placeholder={service?.recipient || "Responsible office"} />
          </label>
          <label>Subject
            <input name="subject" value={form.subject} onChange={change} required minLength="4" maxLength="180" />
          </label>
          <label>Facts in your own words
            <textarea name="facts" value={form.facts} onChange={change} required minLength="20" maxLength="1800" rows="5" />
          </label>
          <label>Chronology (optional)
            <textarea name="chronology" value={form.chronology} onChange={change} maxLength="1200" rows="3" placeholder="What happened, and when?" />
          </label>
          <label>Requested outcome
            <textarea name="requestedOutcome" value={form.requestedOutcome} onChange={change} required minLength="10" maxLength="800" rows="3" />
          </label>
          <div className="drafts-form-row">
            <label>Reference label (optional)
              <input name="referenceLabel" value={form.referenceLabel} onChange={change} maxLength="100" />
            </label>
            <label>Sign-off name (optional)
              <input name="signerName" value={form.signerName} onChange={change} maxLength="120" />
            </label>
          </div>
          <label>Readiness ID (optional)
            <input name="readinessId" value={form.readinessId} onChange={change} maxLength="12" placeholder="RDY-XXXXXXXX" />
          </label>
          <label className="drafts-consent">
            <input type="checkbox" name="privacyAcknowledged" checked={form.privacyAcknowledged} onChange={change} required />
            <span>I will not enter passwords, OTPs, full identity numbers, card data, or unnecessary medical information, and I will review the result before use.</span>
          </label>
          <button type="submit" disabled={busy}>{busy ? "Generating..." : "Generate preview"}</button>
        </form>

        <section className="drafts-preview" aria-live="polite">
          <div className="drafts-preview-head">
            <div>
              <p className="drafts-kicker">Preview</p>
              <h2>{selected ? selected.subject : "No draft selected"}</h2>
            </div>
            {selected && <span>{selected.draftId} · revision {selected.revision}</span>}
          </div>
          {!selected ? <p className="drafts-empty">Generate a draft or choose one from your history.</p> : (
            <>
              <div className="drafts-boundary"><strong>DRAFT — NOT SUBMITTED</strong><span>Verify facts and current official requirements.</span></div>
              <article className="draft-paper">
                <p>{selected.content.salutation}</p>
                <p><strong>Subject: {selected.content.subject}</strong></p>
                {selected.content.paragraphs.map((paragraph, index) => <p key={`${selected.draftId}-${index}`}>{paragraph}</p>)}
                {selected.content.closing.split("\n").map((line) => <p key={line}>{line}</p>)}
              </article>
              <div className="drafts-actions">
                {selected.status === "draft" && <button type="button" disabled={busy} onClick={finalize}>Lock reviewed draft</button>}
                <button type="button" className="secondary" disabled={busy} onClick={download}>Download PDF</button>
              </div>
              <small>Generated in {selected.mode === "openai" ? "AI-assisted" : "reviewed-template"} mode. Vidhya Vedha does not submit this document.</small>
            </>
          )}
          <div className="drafts-history">
            <h3>My draft history</h3>
            {drafts.length === 0 ? <p>No saved drafts yet.</p> : drafts.filter(({ status }) => status !== "archived").map((item) => (
              <button type="button" key={item.draftId} className={item.draftId === selectedId ? "is-selected" : ""} onClick={() => setSelectedId(item.draftId)}>
                <strong>{item.subject}</strong><span>{item.draftId} · {item.status}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Drafts;
