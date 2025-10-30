import React, { useState } from "react";
import "./Ecommerce.css";
import { FaShoppingCart } from "react-icons/fa";

function Ecommerce() {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    accountId: "",
    amount: "",
    mobile: "",
    address: "",
    platform: "",
    email: "",
  });
  const [expandedUpdates, setExpandedUpdates] = useState({});

  const handleServiceClick = (service) => {
    setSelectedService(service === selectedService ? null : service);
    setExpandedUpdates({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your request for " + selectedService + " has been submitted.");
    setFormData({
      name: "",
      accountId: "",
      amount: "",
      mobile: "",
      address: "",
      platform: "",
      email: "",
    });
    setSelectedService(null);
  };

  const toggleUpdateExpansion = (index) => {
    setExpandedUpdates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const ecommerceServices = [
    {
      name: "Online Bill Payments",
      img: "/images/bill-payment.png",
      description:
        "Pay your utility bills including electricity, water, gas, and mobile seamlessly.",
    },
    {
      name: "Digital Wallet & UPI Setup",
      img: "/images/wallet.png",
      description:
        "Quick setup and guidance for digital wallets and UPI platforms like Google Pay and PhonePe.",
    },
    {
      name: "Courier & Package Pickup Services",
      img: "/images/courier.png",
      description:
        "Book a doorstep pickup for your packages and parcels across India.",
    },
  ];

  const whatsNewMap = {
    "Online Bill Payments": [
      {
        update: "New Billers Added",
        date: "July 2025",
        details: "Now you can pay municipal taxes in 5 new cities.",
      },
      {
        update: "Faster Refunds",
        date: "June 2025",
        details: "Refunds for failed transactions processed within 30 minutes.",
      },
    ],
    "Digital Wallet & UPI Setup": [
      {
        update: "UPI Lite Support",
        date: "July 2025",
        details: "Setup UPI Lite for instant payments up to ₹500 without PIN.",
      },
    ],
    "Courier & Package Pickup Services": [
      {
        update: "Track in Real-time",
        date: "July 2025",
        details: "Now track your courier pickups live through our app.",
      },
    ],
  };

  const currentUpdates = whatsNewMap[selectedService] || [];

  return (
    <div className="ecommerce-page animated-background">
      <div className="ecommerce-header">
        <FaShoppingCart className="ecommerce-icon" />
        <h2>Digital Commerce & Payment Services</h2>
        <p>Select a service to proceed with the form and view updates.</p>
      </div>

      <div className="ecommerce-content">
        {ecommerceServices.map((serviceObj, index) => {
          const { name, img, description } = serviceObj;

          return (
            <div key={index} className="ecommerce-service-wrapper">
              <div
                className="ecommerce-service"
                onClick={() => handleServiceClick(name)}
              >
                <img src={img} alt={name} className="service-icon" />
                <h3>{name}</h3>
              </div>

              {selectedService === name && (
                <div className="form-with-info light-blue">
                  <div className="form-info">
                    <img src={img} alt={name} className="form-img" />
                    <p>{description}</p>

                    <div className="whats-new-section">
                      <h4>📢 What's New in {name}</h4>
                      {currentUpdates.length === 0 ? (
                        <p>No updates available.</p>
                      ) : (
                        currentUpdates.map((item, idx) => (
                          <div key={idx} className="update-item">
                            <div
                              className="update-header"
                              onClick={() => toggleUpdateExpansion(idx)}
                            >
                              <span>
                                {item.update} ({item.date})
                              </span>
                              <span className="update-toggle-icon">
                                {expandedUpdates[idx] ? "×" : "+"}
                              </span>
                            </div>
                            {expandedUpdates[idx] && (
                              <div className="update-details">
                                <p>{item.details}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <form className="loan-form" onSubmit={handleSubmit}>
                    <h3>Request: {name}</h3>

                    <label>
                      Name:
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    {name === "Online Bill Payments" && (
                      <>
                        <label>
                          Consumer Number / Account ID:
                          <input
                            type="text"
                            name="accountId"
                            value={formData.accountId}
                            onChange={handleChange}
                            required
                          />
                        </label>
                        <label>
                          Amount:
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </>
                    )}

                    {name === "Digital Wallet & UPI Setup" && (
                      <>
                        <label>
                          Mobile Number:
                          <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                          />
                        </label>
                        <label>
                          Platform:
                          <select
                            name="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Platform</option>
                            <option value="Google Pay">Google Pay</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="Paytm">Paytm</option>
                            <option value="BHIM">BHIM</option>
                          </select>
                        </label>
                        <label>
                          Email (Optional):
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </label>
                      </>
                    )}

                    {name === "Courier & Package Pickup Services" && (
                      <>
                        <label>
                          Pickup Address:
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </>
                    )}

                    <button type="submit">Submit Request</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Ecommerce;
