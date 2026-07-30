import React from "react";
import { Link } from "react-router-dom";
import mark from "../assets/vidhya-mark.svg";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell-container site-footer__grid">
        <div className="site-footer__brand">
          <img src={mark} alt="" />
          <div>
            <strong>Vidhya Vedha</strong>
            <p>A single place to discover services, submit requests and follow progress.</p>
          </div>
        </div>

        <nav aria-label="Footer navigation" className="site-footer__links">
          <h2>Services and support</h2>
          <Link to="/#services">Browse services</Link>
          <Link to="/dashboard">My applications</Link>
          <Link to="/about">About this platform</Link>
          <Link to="/contact">Help and contact</Link>
        </nav>

        <div className="site-footer__note">
          <h2>Before you apply</h2>
          <p>Check the relevant issuing authority for final eligibility, required documents, fees and processing times.</p>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="shell-container">
          <span>© {new Date().getFullYear()} Vidhya Vedha</span>
          <span>Designed for clear, accessible service delivery</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;