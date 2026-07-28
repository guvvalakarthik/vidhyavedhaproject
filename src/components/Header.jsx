import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import mark from "../assets/vidhya-mark.svg";
import "./Header.css";

function Header() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="service-banner">
        <div className="shell-container service-banner__inner">
          <span className="service-banner__mark" aria-hidden="true">✓</span>
          <span>Citizen service access and application support</span>
        </div>
      </div>
      <header className="site-header">
        <div className="shell-container site-header__inner">
          <Link to="/" className="site-brand" aria-label="Vidhya Vedha home">
            <img src={mark} alt="" className="site-brand__mark" />
            <span>
              <strong>Vidhya Vedha</strong>
              <small>Services made easier</small>
            </span>
          </Link>

          <div className="site-header__account">
            {user ? (
              <>
                <NotificationBell />
                <Link to="/dashboard" className="account-link">
                  <span className="account-link__label">Your account</span>
                  <span className="account-link__name">{user.name}</span>
                </Link>
                <button className="header-button header-button--quiet" type="button" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="header-button">Sign in</Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;