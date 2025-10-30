import React from "react";
import "./HomePage.css";
import bannerImage from "../assets/vidhyavedhaservicesphoto.png";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const Homepage = () => {
  // Handler function for submit
  const handleSubmitStatus = () => {
    alert("📢 Your application request is still pending!");
  };

  return (
    <div className="homepage-container">
      <div className="homepage-flex">
        <div className="homepage-image">
          <img src={bannerImage} alt="Vidhya Vedha Services" />
        </div>

        <div className="homepage-search">
          <h2 className="search-heading">🔍 Search</h2>

          {/* Search Location Section */}
          <div className="search-group">
            <label htmlFor="location">Search Location</label>
            <select id="location">
              <option>Kurnool</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
              <option>Mumbai</option>
              <option>Chennai</option>
              <option>Delhi</option>
              <option>Pune</option>
              <option>Ahmedabad</option>
              <option>Kolkata</option>
              <option>Jaipur</option>
            </select>
          </div>

          <button className="btn blue">
            <FaMapMarkerAlt /> Check Nearest Location
          </button>

          {/* Application Status Section */}
          <div className="search-group" style={{ marginTop: "25px" }}>
            <label htmlFor="status">Check Application Status</label>
            <input type="text" id="status" placeholder="Enter Application ID" />
          </div>

          <button className="btn green" onClick={handleSubmitStatus}>
            <FaSearch /> Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
