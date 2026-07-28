import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

import {
  FaUniversity,
  FaBook,
  FaTractor,
  FaHeartbeat,
  FaBolt,
  FaShoppingCart,
  FaTools,
  FaBuilding,
} from "react-icons/fa";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link
        to="/services/banking"
        className={isActive("/services/banking") ? "active" : ""}
      >
        <FaUniversity /> Banking
      </Link>
      <Link
        to="/services/education"
        className={isActive("/services/education") ? "active" : ""}
      >
        <FaBook /> Education
      </Link>
      <Link
        to="/services/farming"
        className={isActive("/services/farming") ? "active" : ""}
      >
        <FaTractor /> Farming
      </Link>
      <Link
        to="/services/healthcare"
        className={isActive("/services/healthcare") ? "active" : ""}
      >
        <FaHeartbeat /> Healthcare
      </Link>
      <Link
        to="/services/emergency"
        className={isActive("/services/emergency") ? "active" : ""}
      >
        <FaBolt /> Emergency
      </Link>
      <Link
        to="/services/utilities"
        className={isActive("/services/utilities") ? "active" : ""}
      >
        <FaBolt /> Utilities
      </Link>
      <Link
        to="/services/ecommerce"
        className={isActive("/services/ecommerce") ? "active" : ""}
      >
        <FaShoppingCart /> E-Commerce
      </Link>
      <Link
        to="/services/home-maintenance"
        className={isActive("/services/home-maintenance") ? "active" : ""}
      >
        <FaTools /> Home Services
      </Link>
      <Link
        to="/services/government"
        className={isActive("/services/government") ? "active" : ""}
      >
        <FaBuilding /> Govt Services
      </Link>
    </nav>
  );
}

export default Navbar;
