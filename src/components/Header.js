import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";

function Header() {
  return (
    <header className="header">
      <div className="home-button">
        <Link to="/" className="home-link">
          Home
        </Link>
      </div>

      <div className="header-center">
        <img src={logo} alt="Vidhya Vedha Logo" className="header-logo" />
        <div className="header-text">
          <h1 className="header-title">Vidhya Vedha</h1>
          <p className="header-subtitle">Empowering Rural India, Digitally</p>
        </div>
      </div>

      <div className="auth-buttons">
        <Link to="/login" className="auth-btn">
          Login
        </Link>
        <Link to="/register" className="auth-btn">
          Register
        </Link>
      </div>
    </header>
  );
}

export default Header;
