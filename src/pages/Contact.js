import React, { useState } from "react";
import api from "../services/api.js";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact/submit", {
        ...form,
        serviceType: "Contact Form",
        phone: "N/A",
      });
      setStatus("Thank you! Your message has been sent.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "16px", color: "#1a365d" }}>
        Contact Us
      </h1>
      <p style={{ fontSize: "1.05rem", color: "#4a5568", marginBottom: "24px" }}>
        Have a question or feedback? Send us a message and we'll get back to
        you.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2d3748" }}>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              marginTop: "6px",
              padding: "10px 12px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "1rem",
            }}
          />
        </label>

        <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2d3748" }}>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              marginTop: "6px",
              padding: "10px 12px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "1rem",
            }}
          />
        </label>

        <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2d3748" }}>
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows="5"
            style={{
              marginTop: "6px",
              padding: "10px 12px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "1rem",
              resize: "vertical",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#3182ce",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Sending…" : "Send Message"}
        </button>
      </form>

      {status && (
        <p
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "6px",
            background: status.includes("Thank") ? "#f0fff4" : "#fed7d7",
            color: status.includes("Thank") ? "#2f855a" : "#c53030",
            fontSize: "0.95rem",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default Contact;
