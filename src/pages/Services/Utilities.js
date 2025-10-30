import React, { useState } from "react";
import "./Utilities.css";
import { FaBolt, FaMobileAlt, FaUniversity } from "react-icons/fa";

const Utilities = () => {
  const [activeService, setActiveService] = useState(null);
  const [popup, setPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPopupMessage("Your request was submitted successfully!");
    setPopup(true);
  };

  const toggleService = (id) => {
    setActiveService(activeService === id ? null : id);
    setExpandedIndex(null); // Reset expansion on service toggle
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const whatsNew = {
    electricity: [
      {
        title: "⚡ Auto-Payment Enabled",
        detail: "Set up monthly auto-debit for electricity bills.",
      },
      {
        title: "📈 New Tariff Plans Added",
        detail: "Track your new rates as per latest government slabs.",
      },
    ],
    netbanking: [
      {
        title: "🔐 New Security Layer",
        detail: "2FA enabled for banking helpdesk login.",
      },
      {
        title: "💼 Corporate Support",
        detail: "NetBanking setup now available for SMEs and businesses.",
      },
    ],
    mobile: [
      {
        title: "📡 5G Plans Added",
        detail: "Recharge with new 5G prepaid and postpaid packs.",
      },
      {
        title: "🛠 Auto APN Setup",
        detail: "Now automatically configure your phone’s internet.",
      },
    ],
  };

  return (
    <div className="utilities-page animated-background">
      <div className="utilities-header">
        <h2>Utility Services</h2>
        <p>
          Access a range of services including bill payments and mobile setup.
        </p>
      </div>

      <div className="utilities-content">
        {/* Electricity */}
        <div className="utilities-service-wrapper">
          <div className="utilities-service" onClick={() => toggleService(1)}>
            <FaBolt className="service-icon" />
            <h3>Electricity Bill Payments</h3>
          </div>
          {activeService === 1 && (
            <div className="utilities-form-section">
              <div className="utility-form">
                <h3>Electricity Bill Payment</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Consumer Number
                    <input type="text" required />
                  </label>
                  <label>
                    Electricity Board
                    <select required>
                      <option value="">Select Board</option>
                      <option>APSPDCL</option>
                      <option>TSNPDCL</option>
                      <option>TNEB</option>
                      <option>BESCOM</option>
                    </select>
                  </label>
                  <label>
                    Billing Month
                    <input type="month" required />
                  </label>
                  <label>
                    Payment Mode
                    <select required>
                      <option value="">Select Method</option>
                      <option>UPI</option>
                      <option>Card</option>
                      <option>Net Banking</option>
                    </select>
                  </label>
                  <button type="submit">Submit</button>
                </form>
              </div>

              <div className="whats-new-section">
                <h4>What's New in Electricity</h4>
                {whatsNew.electricity.map((item, index) => (
                  <div key={index} className="update-item">
                    <div
                      className="update-header"
                      onClick={() => toggleExpand(index)}
                    >
                      <span>{item.title}</span>
                      <span className="update-toggle-icon">
                        {expandedIndex === index ? "-" : "+"}
                      </span>
                    </div>
                    {expandedIndex === index && (
                      <div className="update-details">{item.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Net Banking */}
        <div className="utilities-service-wrapper">
          <div className="utilities-service" onClick={() => toggleService(2)}>
            <FaUniversity className="service-icon" />
            <h3>Net Banking Assistance</h3>
          </div>
          {activeService === 2 && (
            <div className="utilities-form-section">
              <div className="utility-form">
                <h3>Net Banking Assistance</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Bank Name
                    <input type="text" required />
                  </label>
                  <label>
                    Account Holder Name
                    <input type="text" required />
                  </label>
                  <label>
                    Account Number
                    <input type="text" required />
                  </label>
                  <label>
                    Service Type
                    <select required>
                      <option value="">Select</option>
                      <option>Register Net Banking</option>
                      <option>Reset Password</option>
                      <option>Unlock Account</option>
                    </select>
                  </label>
                  <button type="submit">Submit</button>
                </form>
              </div>

              <div className="whats-new-section">
                <h4>What's New in Net Banking</h4>
                {whatsNew.netbanking.map((item, index) => (
                  <div key={index} className="update-item">
                    <div
                      className="update-header"
                      onClick={() => toggleExpand(index)}
                    >
                      <span>{item.title}</span>
                      <span className="update-toggle-icon">
                        {expandedIndex === index ? "-" : "+"}
                      </span>
                    </div>
                    {expandedIndex === index && (
                      <div className="update-details">{item.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Recharge */}
        <div className="utilities-service-wrapper">
          <div className="utilities-service" onClick={() => toggleService(3)}>
            <FaMobileAlt className="service-icon" />
            <h3>Mobile Recharge & Internet Setup</h3>
          </div>
          {activeService === 3 && (
            <div className="utilities-form-section">
              <div className="utility-form">
                <h3>Mobile Recharge & Internet Setup</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Mobile Number
                    <input type="tel" required />
                  </label>
                  <label>
                    Operator
                    <select required>
                      <option value="">Select Operator</option>
                      <option>Jio</option>
                      <option>Airtel</option>
                      <option>VI</option>
                      <option>BSNL</option>
                    </select>
                  </label>
                  <label>
                    Plan Type
                    <select required>
                      <option value="">Select Plan</option>
                      <option>Talktime</option>
                      <option>Data</option>
                      <option>Combo</option>
                    </select>
                  </label>
                  <label>
                    Amount (₹)
                    <input type="number" required />
                  </label>
                  <label>
                    Internet Setup
                    <select required>
                      <option value="">Select</option>
                      <option>None</option>
                      <option>Home WiFi</option>
                      <option>SIM Data Setup</option>
                    </select>
                  </label>
                  <button type="submit">Submit</button>
                </form>
              </div>

              <div className="whats-new-section">
                <h4>What's New in Mobile Services</h4>
                {whatsNew.mobile.map((item, index) => (
                  <div key={index} className="update-item">
                    <div
                      className="update-header"
                      onClick={() => toggleExpand(index)}
                    >
                      <span>{item.title}</span>
                      <span className="update-toggle-icon">
                        {expandedIndex === index ? "-" : "+"}
                      </span>
                    </div>
                    {expandedIndex === index && (
                      <div className="update-details">{item.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <p>{popupMessage}</p>
            <button onClick={() => setPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilities;
