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
        {user && <NavLink to="/assistant" className={navClass}>Ask Vidhya</NavLink>}
        <NavLink to="/about" className={navClass}>About</NavLink>
        <NavLink to="/contact" className={navClass}>Help and contact</NavLink>
        {user && <NavLink to="/account/sessions" className={navClass}>Security</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin" className={navClass}>Administration</NavLink>}
      </div>
    </nav>
  );
}

export default Navbar;
