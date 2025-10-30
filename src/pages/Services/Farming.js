import React, { useState } from "react";
import "./Farming.css";

const services = [
  {
    id: 1,
    title: "Soil Testing",
    inputs: [
      "Location",
      "Type of Crop",
      "Soil Sample ID",
      "Preferred Testing Date",
    ],
    updates: [
      {
        update: "New testing lab opened",
        date: "2024-06-15",
        details: "A new testing lab has been opened in Kottayam.",
      },
      {
        update: "Discount on bulk tests",
        date: "2024-05-10",
        details:
          "Farmers testing more than 5 samples will receive a 20% discount.",
      },
    ],
  },
  {
    id: 2,
    title: "Fertilizer Distribution",
    inputs: [
      "Farmer ID",
      "Crop Type",
      "Fertilizer Type",
      "Quantity Needed",
      "Preferred Pickup Date",
    ],
    updates: [
      {
        update: "New stock of organic fertilizers",
        date: "2024-07-01",
        details: "Organic fertilizers now available at all centers.",
      },
    ],
  },
  {
    id: 3,
    title: "Irrigation Support",
    inputs: ["Location", "Type of Irrigation", "Land Area", "Water Source"],
    updates: [
      {
        update: "Drip irrigation subsidy launched",
        date: "2024-06-10",
        details: "Apply now for 40% government subsidy on drip systems.",
      },
    ],
  },
  {
    id: 4,
    title: "Pest Advisory",
    inputs: [
      "Crop Type",
      "Symptoms Observed",
      "Photo Upload",
      "Preferred Contact Method",
    ],
    updates: [
      {
        update: "New pest alert for rice",
        date: "2024-07-05",
        details: "Brown Plant Hopper infestation in southern zones.",
      },
    ],
  },
  {
    id: 5,
    title: "Crop Insurance",
    inputs: [
      "Farmer ID",
      "Crop Type",
      "Insurance Plan",
      "Acreage",
      "Contact Number",
    ],
    updates: [
      {
        update: "Kharif insurance open",
        date: "2024-06-20",
        details: "Enrollment for Kharif 2024 is now open until July 31.",
      },
    ],
  },
  {
    id: 6,
    title: "Market Price Info",
    inputs: ["Crop Name", "District", "Preferred Market", "Mobile Number"],
    updates: [
      {
        update: "Live mandi prices",
        date: "2024-07-10",
        details: "You can now track mandi prices for 20+ crops in real time.",
      },
    ],
  },
  {
    id: 7,
    title: "Tractor & Equipment Rental",
    inputs: ["Location", "Tractor Type", "Rental Hours", "License Number"],
    updates: [
      {
        update: "New tractors added",
        date: "2024-07-15",
        details: "50+ new tractors added to the rental pool.",
      },
    ],
  },
  {
    id: 8,
    title: "Cold Storage Booking",
    inputs: [
      "Farmer ID",
      "Product to Store",
      "Storage Duration",
      "Preferred Location",
    ],
    updates: [
      {
        update: "Cold storage available in Alappuzha",
        date: "2024-07-08",
        details: "Book early due to high demand.",
      },
    ],
  },
  {
    id: 9,
    title: "Seed Distribution",
    inputs: ["Farmer Name", "Seed Type", "Quantity", "Collection Date"],
    updates: [
      {
        update: "New high-yield variety",
        date: "2024-06-25",
        details: "Try our new HYV rice seeds for better output.",
      },
    ],
  },
];

function Farming() {
  const [activeService, setActiveService] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const toggleForm = (id) => {
    setActiveService(activeService === id ? null : id);
    setExpanded(null);
  };

  const toggleUpdate = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your request has been submitted successfully!");
    e.target.reset();
  };

  return (
    <div className="farming-page animated-background">
      <div className="farming-header">
        <h2>Farming Services</h2>
        <p>Select a service to proceed with your request.</p>
      </div>

      <div className="farming-content">
        {services.map((service) => (
          <div key={service.id} className="farming-service-wrapper">
            <div
              className="farming-service"
              onClick={() => toggleForm(service.id)}
            >
              <h3>
                {service.id}. {service.title}
              </h3>
            </div>

            {activeService === service.id && (
              <div className="form-with-info">
                <div className="form-info">
                  <p>
                    Fill out the form to request{" "}
                    <strong>{service.title}</strong>.
                  </p>

                  <div className="whats-new-section">
                    <h4>📌 What's New in {service.title}</h4>
                    {service.updates.map((item, idx) => (
                      <div key={idx} className="update-item">
                        <div
                          className="update-header"
                          onClick={() => toggleUpdate(idx)}
                        >
                          <span>
                            {item.update} ({item.date})
                          </span>
                          <span className="update-toggle-icon">
                            {expanded === idx ? "×" : "+"}
                          </span>
                        </div>
                        {expanded === idx && (
                          <div className="update-details">{item.details}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="farming-form">
                  <h3>{service.title} Form</h3>
                  {service.inputs.map((label, index) => (
                    <label key={index}>
                      {label}:
                      <input
                        name={label.toLowerCase().replace(/ /g, "_")}
                        required
                      />
                    </label>
                  ))}
                  <button type="submit">Submit Request</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Farming;
