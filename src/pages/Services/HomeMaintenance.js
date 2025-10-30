import React, { useState } from "react";
import "./HomeMaintenance.css";

const servicesList = [
  "Electrical Repairs",
  "Plumbing Services",
  "Deep Home Cleaning",
  "Painting Services",
  "Carpenter Services",
  "Appliance Repair",
  "Pest Control",
  "RO & Water Purifier Service",
  "Locksmith Services",
  "CCTV & Home Security Setup",
];

const whatsNewUpdates = {
  "Electrical Repairs": [
    {
      title: "⚡ Emergency Available",
      detail: "24/7 electricians now available in major cities.",
    },
    {
      title: "🔧 Certified Technicians",
      detail: "Only certified electricians dispatched for safety.",
    },
  ],
  "Plumbing Services": [
    {
      title: "🚿 Smart Leak Detection",
      detail: "New tools to find hidden leaks quickly.",
    },
    {
      title: "🛁 Bathroom Upgrades",
      detail: "Affordable modern fixtures available now.",
    },
  ],
  // Add remaining service updates similarly
};

function HomeMaintenance() {
  const [activeService, setActiveService] = useState(null);
  const [formData, setFormData] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [popup, setPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setPopupMessage(`Request for '${activeService}' submitted successfully!`);
    setPopup(true);
    setFormData({});
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="home-maintenance-page">
      <div className="home-maintenance-header">
        <h2>Home Maintenance Services</h2>
        <p>Select a service to schedule or get assistance.</p>
      </div>

      <div className="home-maintenance-content">
        {servicesList.map((service, idx) => (
          <div className="home-maintenance-service-wrapper" key={idx}>
            <div
              className="home-maintenance-service"
              onClick={() =>
                setActiveService(activeService === service ? null : service)
              }
            >
              <h3>{service}</h3>
            </div>

            {activeService === service && (
              <div className="home-maintenance-form-section">
                <div className="home-maintenance-form">
                  <h3>{service}</h3>
                  <form onSubmit={handleSubmit}>
                    <label>
                      Full Name
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </label>
                    <label>
                      Address
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </label>
                    <label>
                      Phone Number
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </label>
                    <button type="submit">Submit</button>
                  </form>
                </div>

                <div className="home-maintenance-whatsnew">
                  <h4>What's New in {service}</h4>
                  {(whatsNewUpdates[service] || []).map((item, index) => (
                    <div key={index} className="home-maintenance-update-item">
                      <div
                        className="home-maintenance-update-header"
                        onClick={() => toggleExpand(index)}
                      >
                        <span>{item.title}</span>
                        <span className="home-maintenance-toggle-icon">
                          {expandedIndex === index ? "×" : "+"}
                        </span>
                      </div>
                      {expandedIndex === index && (
                        <div className="home-maintenance-update-detail">
                          {item.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {popup && (
        <div
          className="home-maintenance-popup-overlay"
          onClick={() => setPopup(false)}
        >
          <div
            className="home-maintenance-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{popupMessage}</p>
            <button onClick={() => setPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeMaintenance;
