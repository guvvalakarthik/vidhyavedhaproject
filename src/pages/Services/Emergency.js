import React, { useState } from "react";
import "./Emergency.css";

const emergencyServices = [
  "24x7 Towing Service",
  "On-Spot Mechanic Dispatch",
  "Flat Tyre Repair / Replacement",
  "Battery Jumpstart / Replacement",
  "Emergency Fuel Delivery",
  "Accident Reporting & Police Coordination",
  "Emergency Vehicle Unlock",
  "Minor On-Spot Repairs",
  "Vehicle Recovery (Remote Areas)",
  "Insurance Provider Coordination",
];

const Emergency = () => {
  const [selectedService, setSelectedService] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleServiceClick = (service) => {
    if (selectedService === service && showForm) {
      setShowForm(false);
      setSelectedService("");
    } else {
      setSelectedService(service);
      setShowForm(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted successfully!");
  };

  const renderFormInputs = (service) => {
    switch (service) {
      case "24x7 Towing Service":
        return (
          <>
            <input type="text" placeholder="Vehicle Type" required />
            <input type="text" placeholder="Current Location" required />
            <input type="text" placeholder="Drop Location" required />
            <input type="text" placeholder="Registration Number" required />
            <input type="text" placeholder="Preferred Time" required />
          </>
        );
      case "On-Spot Mechanic Dispatch":
        return (
          <>
            <input type="text" placeholder="Issue Description" required />
            <input type="text" placeholder="Vehicle Type" required />
            <input type="text" placeholder="Current Location" required />
            <input type="number" placeholder="Contact Number" required />
          </>
        );
      case "Flat Tyre Repair / Replacement":
        return (
          <>
            <input type="text" placeholder="Tyre Type" required />
            <input
              type="text"
              placeholder="Spare Tyre Available (Yes/No)"
              required
            />
            <input type="text" placeholder="Vehicle Model" required />
            <input type="text" placeholder="Exact Location" required />
          </>
        );
      case "Battery Jumpstart / Replacement":
        return (
          <>
            <input type="text" placeholder="Vehicle Make & Model" required />
            <input
              type="text"
              placeholder="Battery Issue Description"
              required
            />
            <input type="text" placeholder="Battery Brand (if known)" />
            <input type="text" placeholder="Current Location" required />
          </>
        );
      case "Emergency Fuel Delivery":
        return (
          <>
            <input
              type="text"
              placeholder="Fuel Type (Petrol/Diesel)"
              required
            />
            <input type="number" placeholder="Litres Required" required />
            <input type="text" placeholder="Location" required />
            <input type="text" placeholder="Vehicle Number" required />
          </>
        );
      case "Accident Reporting & Police Coordination":
        return (
          <>
            <textarea placeholder="Accident Description" required />
            <input type="text" placeholder="Location" required />
            <input type="text" placeholder="People Involved (Approx)" />
            <input type="text" placeholder="Vehicle Number" required />
          </>
        );
      case "Emergency Vehicle Unlock":
        return (
          <>
            <input type="text" placeholder="Vehicle Model" required />
            <input type="text" placeholder="Locked Location" required />
            <input
              type="text"
              placeholder="Key Status (Lost Inside/Outside)"
              required
            />
            <input type="number" placeholder="Contact Number" required />
          </>
        );
      case "Minor On-Spot Repairs":
        return (
          <>
            <textarea placeholder="Issue Description" required />
            <input type="text" placeholder="Vehicle Make/Model" required />
            <input type="text" placeholder="Current Location" required />
          </>
        );
      case "Vehicle Recovery (Remote Areas)":
        return (
          <>
            <input type="text" placeholder="Nearest Known Location" required />
            <input type="text" placeholder="Road Conditions (if known)" />
            <input type="text" placeholder="Vehicle Type" required />
            <input
              type="text"
              placeholder="Emergency Contact Number"
              required
            />
          </>
        );
      case "Insurance Provider Coordination":
        return (
          <>
            <input type="text" placeholder="Insurance Provider Name" required />
            <input type="text" placeholder="Policy Number" required />
            <input type="text" placeholder="Vehicle Registration" required />
            <input type="text" placeholder="Nature of Incident" required />
            <input
              type="text"
              placeholder="Claim Initiated? (Yes/No)"
              required
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderWhatsNewTable = (service) => (
    <table className="whatsnew-table">
      <thead>
        <tr>
          <th>Update</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>New service agents added</td>
          <td>20 July 2025</td>
        </tr>
        <tr>
          <td>App updated with live tracking</td>
          <td>10 July 2025</td>
        </tr>
        <tr>
          <td>Free emergency towing up to 5km</td>
          <td>5 July 2025</td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="emergency-container">
      <h1 className="emergency-heading">Emergency Services</h1>
      <div className="emergency-services">
        {emergencyServices.map((service, index) => (
          <div
            key={index}
            className="emergency-service"
            onClick={() => handleServiceClick(service)}
          >
            {service}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="form-and-whatsnew">
          <form className="emergency-form" onSubmit={handleSubmit}>
            <h2>{selectedService} Form</h2>
            {renderFormInputs(selectedService)}
            <button type="submit">Submit</button>
          </form>
          <div className="whatsnew-section">
            <h2>What's New - {selectedService}</h2>
            {renderWhatsNewTable(selectedService)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
