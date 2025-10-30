import React, { useState } from "react";
import "./Healthcare.css";

function Healthcare() {
  const [activeService, setActiveService] = useState(null);
  const [expandedUpdate, setExpandedUpdate] = useState(null);

  const toggleForm = (id) => {
    setActiveService(activeService === id ? null : id);
  };

  const toggleUpdate = (index) => {
    setExpandedUpdate(expandedUpdate === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      "Your healthcare request has been submitted. Our team will contact you shortly."
    );
    e.target.reset();
  };

  const services = [
    { id: 1, title: "Telemedicine Consultations" },
    { id: 2, title: "Online Medicine Delivery" },
    { id: 3, title: "Diagnostic Lab Tests at Home" },
    { id: 4, title: "Ambulance Booking Services" },
    { id: 5, title: "Doctor Appointment Scheduling" },
    { id: 6, title: "Mental Health Counseling" },
    { id: 7, title: "Preventive Health Checkups" },
    { id: 8, title: "Vaccination Booking" },
    { id: 9, title: "Govt Health Scheme Enrollment" },
  ];

  const updates = [
    {
      title: "New Mental Wellness Program Launched",
      details:
        "Counseling sessions now available 24x7 with certified professionals.",
    },
    {
      title: "Expanded Vaccination Drive",
      details:
        "Now covering more vaccines including Hepatitis B and HPV in rural areas.",
    },
    {
      title: "Lab Test Discounts",
      details:
        "Get 20% off on all preventive checkup packages booked this month.",
    },
  ];

  return (
    <div className="healthcare-page">
      <div className="healthcare-header">
        <h2>Healthcare Services</h2>
        <p>Click on a service below to apply or request.</p>
      </div>

      <div className="healthcare-content">
        {services.map((service) => (
          <div key={service.id} className="healthcare-service-wrapper">
            <div
              className="healthcare-service"
              onClick={() => toggleForm(service.id)}
            >
              <h3>
                {service.id}. {service.title}
              </h3>
            </div>

            {activeService === service.id && (
              <div className="form-with-info">
                {/* What's New Section */}
                <div className="form-info">
                  <img
                    src="/healthcare-icon.png"
                    alt="healthcare"
                    className="form-img"
                  />
                  <p>
                    Please fill out the form to request:{" "}
                    <strong>{service.title}</strong>
                  </p>
                  <div className="whats-new-section">
                    <h4>📢 What's New</h4>
                    {updates.map((item, idx) => (
                      <div key={idx} className="update-item">
                        <div
                          className="update-header"
                          onClick={() => toggleUpdate(idx)}
                        >
                          {item.title}
                          <span className="update-toggle-icon">
                            {expandedUpdate === idx ? "−" : "+"}
                          </span>
                        </div>
                        {expandedUpdate === idx && (
                          <div className="update-details">{item.details}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Form */}
                <form onSubmit={handleSubmit} className="healthcare-form">
                  <h3>{service.title}</h3>
                  <label>
                    Full Name:
                    <input required />
                  </label>
                  <label>
                    Phone Number:
                    <input required />
                  </label>

                  {/* Conditional fields based on service ID */}
                  {service.id === 1 && (
                    <>
                      <label>
                        Symptoms/Health Issue:
                        <textarea required />
                      </label>
                      <label>
                        Preferred Doctor/Specialist:
                        <input />
                      </label>
                    </>
                  )}
                  {service.id === 2 && (
                    <>
                      <label>
                        Address:
                        <textarea required />
                      </label>
                      <label>
                        Medicine Details:
                        <textarea required />
                      </label>
                      <label>
                        Upload Prescription:
                        <input type="file" accept="image/*,application/pdf" />
                      </label>
                    </>
                  )}
                  {service.id === 3 && (
                    <>
                      <label>
                        Address:
                        <textarea required />
                      </label>
                      <label>
                        Select Test(s):
                        <input required />
                      </label>
                      <label>
                        Preferred Date:
                        <input type="date" required />
                      </label>
                      <label>
                        Preferred Time:
                        <input type="time" required />
                      </label>
                    </>
                  )}
                  {service.id === 4 && (
                    <>
                      <label>
                        Pickup Address:
                        <textarea required />
                      </label>
                      <label>
                        Drop Location:
                        <textarea required />
                      </label>
                      <label>
                        Emergency Type:
                        <input required />
                      </label>
                    </>
                  )}
                  {service.id === 5 && (
                    <>
                      <label>
                        City of Hospital:
                        <input required />
                      </label>
                      <label>
                        Hospital Name:
                        <input required />
                      </label>

                      <label>
                        Department / Specialist:
                        <input required />
                      </label>
                      <label>
                        Preferred Date:
                        <input type="date" required />
                      </label>
                      <label>
                        Preferred Time:
                        <input type="time" required />
                      </label>
                    </>
                  )}
                  {service.id === 6 && (
                    <>
                      <label>
                        Concern Area:
                        <input required />
                      </label>
                      <label>
                        Preferred Counselor (if any):
                        <input />
                      </label>
                      <label>
                        Preferred Date:
                        <input type="date" required />
                      </label>
                    </>
                  )}
                  {service.id === 7 && (
                    <>
                      <label>
                        Select Package:
                        <input required />
                      </label>
                      <label>
                        Preferred Date:
                        <input type="date" required />
                      </label>
                      <label>
                        Preferred Time:
                        <input type="time" required />
                      </label>
                    </>
                  )}
                  {service.id === 8 && (
                    <>
                      <label>
                        Vaccine Name:
                        <input required />
                      </label>
                      <label>
                        Age:
                        <input type="number" required />
                      </label>
                      <label>
                        Preferred Date:
                        <input type="date" required />
                      </label>
                    </>
                  )}
                  {service.id === 9 && (
                    <>
                      <label>
                        Address:
                        <textarea required />
                      </label>
                      <label>
                        Scheme Name:
                        <input required />
                      </label>
                      <label>
                        Aadhaar Number:
                        <input required />
                      </label>
                    </>
                  )}

                  <button type="submit">Submit</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Healthcare;
