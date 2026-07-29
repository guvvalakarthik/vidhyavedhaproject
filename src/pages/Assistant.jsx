import React, { useCallback, useEffect, useState } from "react";
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
const welcomeMessage = {
  messageId: "welcome",
  role: "assistant",
  content: "Tell me what you need help with. I will use Vidhya Vedha's trusted service catalogue and show the official sources behind the answer.",
  citations: [],
};

function Assistant() {
  const [service, setService] = useState("all");
  const [language, setLanguage] = useState("English");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const [actions, setActions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [resolvingAction, setResolvingAction] = useState("");
  const [error, setError] = useState("");

  const openConversation = useCallback(async (conversationId) => {
    setLoadingHistory(true);
    setError("");
    try {
      const { data } = await api.get(`/ai/conversations/${conversationId}`);
      setConversation(data.conversation);
      setService(data.conversation.service);
      setLanguage(data.conversation.language);
      setMessages(data.messages.length ? data.messages : [welcomeMessage]);
      setActions(data.actions || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not open that conversation.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/ai/conversations");
        setConversations(data.conversations);
        if (data.conversations[0]) await openConversation(data.conversations[0].conversationId);
        else setLoadingHistory(false);
      } catch (requestError) {
        setError(requestError.response?.data?.error || "Could not load conversation history.");
        setLoadingHistory(false);
      }
    };
    load();
  }, [openConversation]);

  const startNew = () => {
    setConversation(null);
    setMessages([welcomeMessage]);
    setActions([]);
    setMessage("");
    setService("all");
    setLanguage("English");
    setError("");
  };

  const upsertConversation = (nextConversation) => {
    setConversations((current) => [
      nextConversation,
      ...current.filter(({ conversationId }) => conversationId !== nextConversation.conversationId),
    ]);
  };

  const upsertAction = (nextAction) => {
    setActions((current) => [
      ...current.filter(({ actionId }) => actionId !== nextAction.actionId),
      nextAction,
    ]);
  };

  const submit = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || sending) return;
    setMessage("");
    setError("");
    setSending(true);
    const optimisticId = `user-${Date.now()}`;
    setMessages((current) => [...current.filter(({ messageId }) => messageId !== "welcome"), {
      messageId: optimisticId,
      role: "user",
      content: question,
      citations: [],
    }]);

    try {
      let activeConversation = conversation;
      if (!activeConversation) {
        const { data } = await api.post("/ai/conversations", { service, language });
        activeConversation = data.conversation;
        setConversation(activeConversation);
        upsertConversation(activeConversation);
      }
      const { data } = await api.post(
        `/ai/conversations/${activeConversation.conversationId}/messages`,
        { message: question },
      );
      setConversation(data.conversation);
      upsertConversation(data.conversation);
      if (data.pendingAction) upsertAction(data.pendingAction);
      setMessages((current) => [
        ...current.filter(({ messageId }) => messageId !== optimisticId),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (requestError) {
      setMessages((current) => current.filter(({ messageId }) => messageId !== optimisticId));
      setError(requestError.response?.data?.error || "The assistant could not answer right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resolveAction = async (actionId, decision) => {
    setResolvingAction(actionId);
    setError("");
    try {
      const { data } = await api.post(`/ai/actions/${actionId}/${decision}`, {});
      upsertAction(data.action);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "That action could not be updated. Refresh and try again.");
    } finally {
      setResolvingAction("");
    }
  };

  const removeConversation = async () => {
    if (!conversation || !window.confirm("Delete this conversation and all of its messages?")) return;
    try {
      await api.delete(`/ai/conversations/${conversation.conversationId}`);
      const remaining = conversations.filter(({ conversationId }) => conversationId !== conversation.conversationId);
      setConversations(remaining);
      if (remaining[0]) await openConversation(remaining[0].conversationId);
      else startNew();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not delete this conversation.");
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
        <div className="assistant-hero__badge"><span aria-hidden="true">&#10003;</span> Sources shown with every answer</div>
      </header>

      <div className="assistant-layout shell-container">
        <div className="assistant-rail">
          <aside className="assistant-history" aria-label="Conversation history">
            <div className="assistant-history__heading">
              <strong>Conversations</strong>
              <button type="button" onClick={startNew}>New</button>
            </div>
            {conversations.length ? (
              <div className="assistant-history__list">
                {conversations.map((item) => (
                  <button
                    type="button"
                    className={item.conversationId === conversation?.conversationId ? "is-active" : ""}
                    onClick={() => openConversation(item.conversationId)}
                    key={item.conversationId}
                  >
                    <span>{item.title}</span>
                    <small>{item.language}</small>
                  </button>
                ))}
              </div>
            ) : <p>No saved conversations yet.</p>}
          </aside>
          <aside className="assistant-controls" aria-label="Assistant preferences">
            <label htmlFor="assistant-service">Service area</label>
            <select id="assistant-service" value={service} onChange={(event) => setService(event.target.value)} disabled={Boolean(conversation)}>
              {services.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label htmlFor="assistant-language">Answer language</label>
            <select id="assistant-language" value={language} onChange={(event) => setLanguage(event.target.value)} disabled={Boolean(conversation)}>
              {languages.map((item) => <option key={item}>{item}</option>)}
            </select>
            {conversation && <button type="button" className="assistant-controls__delete" onClick={removeConversation}>Delete conversation</button>}
            <div className="assistant-controls__boundary">
              <strong>Approval boundary</strong>
              <p>Vidhya may prepare a plan-task change, but it cannot apply one until you approve the exact action. It will not diagnose illness, approve credit, or decide emergency priority.</p>
            </div>
          </aside>
        </div>

        <div className="assistant-chat">
          <div className="assistant-messages" aria-live="polite">
            {loadingHistory ? <p className="assistant-loading">Loading conversation...</p> : messages.map((item) => (
              <article className={`assistant-message assistant-message--${item.role}`} key={item.messageId}>
                <span className="assistant-message__role">{item.role === "assistant" ? "Vidhya" : "You"}</span>
                <p>{item.content}</p>
                {item.mode === "grounded-fallback" && <small className="assistant-message__mode">Verified catalogue mode</small>}
                {item.citations?.length > 0 && (
                  <div className="assistant-sources">
                    <strong>Official sources</strong>
                    <ol>
                      {item.citations.map((citation) => (
                        <li key={citation.sourceId}>
                          {citation.officialUrl ? <a href={citation.officialUrl} target="_blank" rel="noreferrer">{citation.title}</a> : citation.title}
                          <span>{citation.authority}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            ))}
            {actions.map((action) => (
              <section className={`assistant-action assistant-action--${action.status}`} key={action.actionId} aria-label="Proposed assistant action">
                <span>Plan action ? {action.planType}</span>
                <strong>{action.summary}</strong>
                <small>{action.planId} ? {action.taskId}</small>
                {action.status === "pending" ? (
                  <div>
                    <button type="button" onClick={() => resolveAction(action.actionId, "confirm")} disabled={resolvingAction === action.actionId}>Approve exact change</button>
                    <button type="button" onClick={() => resolveAction(action.actionId, "cancel")} disabled={resolvingAction === action.actionId}>Cancel</button>
                  </div>
                ) : <p className="assistant-action__result">{action.result || `Action ${action.status}.`}</p>}
              </section>
            ))}
            {sending && <div className="assistant-typing" role="status"><span /><span /><span /> Checking trusted guidance...</div>}
          </div>
          {error && <p className="assistant-error" role="alert">{error}</p>}
          <form className="assistant-composer" onSubmit={submit}>
            <label htmlFor="assistant-message" className="sr-only">Your question</label>
            <textarea id="assistant-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="For example: How do I renew my passport?" maxLength={1200} rows={3} />
            <div>
              <small>{message.length}/1200</small>
              <button type="submit" disabled={sending || message.trim().length < 2}>{sending ? "Checking..." : "Ask Vidhya"}</button>
            </div>
          </form>
          <p className="assistant-disclaimer">Conversations are private to your account and expire automatically. Confirm changing details on the linked official website.</p>
        </div>
      </div>
    </section>
  );
}

export default Assistant;
