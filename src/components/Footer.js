import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaArrowUp } from "react-icons/fa";
import "./Footer.css";
import logo from "../assets/logo.png";

const Footer = () => {
  const [showForm, setShowForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !suggestion) {
      setMessage("Please fill all fields.");
      return;
    }
    setMessage("Thank you for your suggestion!");
    setName("");
    setEmail("");
    setSuggestion("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <footer className="footer">
        {/* Brand Heading with Logo */}
        <div className="footer-heading">
          <img src={logo} alt="Vidhya Vedha Logo" className="footer-logo" />
          <div className="footer-title-text">
            <h2>Vidhya Vedha</h2>
            <p>Empowering Rural India</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="footer-buttons">
          <button
            className="suggestion-button"
            onClick={() => setShowForm(!showForm)}
          >
            💬 Suggestions
          </button>
          <button
            className="suggestion-button"
            onClick={() => setShowGallery(!showGallery)}
          >
            📸 Photo Gallery
          </button>
          <button
            className="suggestion-button"
            onClick={() => setShowAchievements(!showAchievements)}
          >
            🏅 Achievements
          </button>
        </div>

        {/* Suggestion Form */}
        {showForm && (
          <form className="suggestion-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              placeholder="Your Suggestion"
              required
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            ></textarea>
            <button type="submit">Submit</button>
            {message && <p className="form-message">{message}</p>}
          </form>
        )}

        {/* Achievements */}
        {showAchievements && (
          <ul className="footer-achievements">
            <li>🏆 10,000+ Users Served</li>
            <li>📄 5,000+ Govt Applications Processed</li>
            <li>🎓 100+ Admissions Supported</li>
            <li>🚑 500+ Emergency Cases Handled</li>
            <li>🌱 250+ Farmers Empowered</li>
          </ul>
        )}

        {/* Image Gallery */}
        {showGallery && (
          <div className="image-gallery">
            <img
              src="https://i.imgur.com/w1UZWJY.png"
              alt="Helping farmers with irrigation"
            />
            <img
              src="https://i.imgur.com/VHyXQk1.png"
              alt="Rural education support"
            />
            <img
              src="https://i.imgur.com/U7QlFGc.png"
              alt="Medical emergency assistance"
            />
            <img
              src="https://i.imgur.com/3G3xGmC.png"
              alt="Community development event"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="footer-bottom">
          <h3>📬 Contact Us</h3>
          <p>📧 vidhyavedha@gmail.com</p>
          <p>📞 +91-6305224771</p>
        </div>
      </footer>

      {/* Floating WhatsApp Icon */}
      <a
        href="https://wa.me/916305224771"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>

      {/* Scroll to Top Button */}
      {showScrollBtn && (
        <button
          className="top-float-btn"
          onClick={scrollToTop}
          title="Back to Top"
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default Footer;
