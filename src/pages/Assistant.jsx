import React, { useState } from "react";
import api from "../services/api.js";
import "./Assistant.css";

const services = [
  ["all", "All services"],
  ["government", "Government services"],
  ["education", "Education"],
  ["finance", "Money and banking"],
  ["healthcare", "Healthcare"],
  ["emergency", "Roadside assistance"],
];
const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi"];

function Assistant() {
  const [service, setService] = useState("all");
  const [language, setLanguage] = useState("English");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{
    id: "welcome",
    role: "assistant",
    text: "Tell me what you need help with. I will use Vidhya Vedha?s trusted service catalogue and show the official sources behind the answer.",
    citations: [],
  }]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || sending) return;
    setMessage("");
    setError("");
    setSending(true);
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: question, citations: [] }]);
    try {
      const { data } = await api.post("/ai/ask", { message: question, service, language });
      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.answer,
        citations: data.citations || [],
        mode: data.mode,
      }]);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "The assistant could not answer right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="assistant-page">
      <header className="assistant-hero shell-container">
        <div>
          <span className="assistant-hero__eyebrow">Trusted guidance assistant</span>
          <h1>Ask Vidhya</h1>
          <p>Plain-language help grounded in the official service routes already reviewed for this platform.</p>
        </div>
        <div className="assistant-hero__badge"><span aria-hidden="true">?</span> Sources shown with every answer</div>
      </header>

      <div className="assistant-layout shell-container">
        <aside className="assistant-controls" aria-label="Assistant preferences">
          <label htmlFor="assistant-service">Service area</label>
          <select id="assistant-service" value={service} onChange={(event) => setService(event.target.value)}>
            {services.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor="assistant-language">Answer language</label>
          <select id="assistant-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            {languages.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="assistant-controls__boundary">
            <strong>What this assistant will not do</strong>
            <p>It will not diagnose illness, approve credit, decide emergency priority, or ask for passwords, OTPs, identity numbers, or document uploads.</p>
          </div>
        </aside>

        <div className="assistant-chat">
          <div className="assistant-messages" aria-live="polite">
            {messages.map((item) => (
              <article className={`assistant-message assistant-message--${item.role}`} key={item.id}>
                <span className="assistant-message__role">{item.role === "assistant" ? "Vidhya" : "You"}</span>
                <p>{item.text}</p>
                {item.mode === "grounded-fallback" && <small className="assistant-message__mode">Verified catalogue mode</small>}
                {item.citations.length > 0 && (
                  <div className="assistant-sources">
                    <strong>Official sources</strong>
                    <ol>
                      {item.citations.map((citation) => (
                        <li key={citation.sourceId}>
                          {citation.officialUrl ? (
                            <a href={citation.officialUrl} target="_blank" rel="noreferrer">{citation.title}</a>
                          ) : citation.title}
                          <span>{citation.authority}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            ))}
            {sending && <div className="assistant-typing" role="status"><span /><span /><span /> Checking trusted guidance?</div>}
          </div>
          {error && <p className="assistant-error" role="alert">{error}</p>}
          <form className="assistant-composer" onSubmit={submit}>
            <label htmlFor="assistant-message" className="sr-only">Your question</label>
            <textarea
              id="assistant-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="For example: How do I renew my passport?"
              maxLength={1200}
              rows={3}
            />
            <div>
              <small>{message.length}/1200</small>
              <button type="submit" disabled={sending || message.trim().length < 2}>{sending ? "Checking?" : "Ask Vidhya"}</button>
            </div>
          </form>
          <p className="assistant-disclaimer">Confirm deadlines, fees, eligibility, and required documents on the linked official website before acting.</p>
        </div>
      </div>
    </section>
  );
}

export default Assistant;
