import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

const navClass = ({ isActive }) => isActive ? "primary-nav__link is-active" : "primary-nav__link";

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      <div className="shell-container primary-nav__inner">
        <a href="/#services" className="primary-nav__link">Services</a>
        <NavLink to="/dashboard" className={navClass}>My applications</NavLink>
        {user && <NavLink to="/companion" className={navClass}>Digital companion</NavLink>}
        {user && <NavLink to="/readiness" className={navClass}>Readiness</NavLink>}
        {user && <NavLink to="/drafts" className={navClass}>Drafts</NavLink>}
        {user && <NavLink to="/reminders" className={navClass}>Reminders</NavLink>}
        {user && <NavLink to="/tracking" className={navClass}>Status</NavLink>}
        {user && <NavLink to="/assistance" className={navClass}>Human help</NavLink>}
        {user && <NavLink to="/vault" className={navClass}>Document vault</NavLink>}
        {user && <NavLink to="/report-blocker" className={navClass}>Report a blocker</NavLink>}
        {user && <NavLink to="/assistant" className={navClass}>Ask Vidhya</NavLink>}
        <NavLink to="/about" className={navClass}>About</NavLink>
        <NavLink to="/contact" className={navClass}>Help and contact</NavLink>
        {user && <NavLink to="/profile" className={navClass}>Profile</NavLink>}
        {user && <NavLink to="/account/sessions" className={navClass}>Security</NavLink>}
        {["provider","admin"].includes(user?.role) && <NavLink to="/provider/operations" className={navClass}>Operations</NavLink>}
        {user?.role === "admin" && <NavLink to="/analytics/blockers" className={navClass}>Blocker analytics</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin" className={navClass}>Administration</NavLink>}
      </div>
    </nav>
  );
}

export default Navbar;
