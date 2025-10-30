import React, { useState } from "react";
import "./Banking.css";
import { FaUniversity } from "react-icons/fa";

function Banking() {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    amount: "",
    tenure: "",
    income: "",
    nominee: "",
  });

  const [expandedUpdates, setExpandedUpdates] = useState({});

  const handleServiceClick = (service) => {
    setSelectedService(service === selectedService ? null : service);
    setExpandedUpdates({}); // reset expanded items on new selection
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Our team will contact you as soon as possible.");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      amount: "",
      tenure: "",
      income: "",
      nominee: "",
    });
    setSelectedService(null);
  };

  const toggleUpdateExpansion = (index) => {
    setExpandedUpdates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const whatsNewMap = {
    "Personal Loan": [
      {
        update: "Instant Approval",
        date: "July 2025",
        details: "Get approval in under 10 minutes for eligible applicants.",
      },
      {
        update: "Reduced Interest",
        date: "June 2025",
        details: "Interest rates now starting from 10.2% per annum.",
      },
    ],
    "Home Loan": [
      {
        update: "Zero Processing Fee",
        date: "July 2025",
        details: "No processing fee till September 2025.",
      },
      {
        update: "New EMI Calculator Tool",
        date: "June 2025",
        details: "Plan your home loan with our updated EMI tool.",
      },
    ],
    "Education Loan": [
      {
        update: "Extended Moratorium",
        date: "July 2025",
        details: "Repay only after 2 years of course completion.",
      },
    ],
    "Business Loan": [
      {
        update: "Startup Offer",
        date: "July 2025",
        details: "Special interest rates for startups under 2 years.",
      },
    ],
    "Vehicle Loan (Car/Bike)": [
      {
        update: "EV Special Rates",
        date: "June 2025",
        details: "Get lower rates for electric vehicle purchases.",
      },
    ],
    "Gold Loan": [
      {
        update: "Higher LTV",
        date: "May 2025",
        details: "Now avail up to 90% of gold value.",
      },
    ],
    "Agriculture Loan": [
      {
        update: "Subsidy Scheme",
        date: "July 2025",
        details: "4% subsidy on loans for farm equipment.",
      },
    ],
    "Term Life Insurance": [
      {
        update: "Online Discount",
        date: "July 2025",
        details: "Get 5% discount when buying online.",
      },
    ],
    "Health Insurance (Individual)": [
      {
        update: "COVID-19 Boost",
        date: "July 2025",
        details: "Plans now include COVID re-treatment support.",
      },
    ],
    "Motor Insurance (Car/Bike)": [
      {
        update: "Zero Dep Plan",
        date: "June 2025",
        details: "No depreciation deduction for the first claim.",
      },
    ],
    "Travel Insurance": [
      {
        update: "Flight Delay Cover",
        date: "May 2025",
        details: "Now includes automatic compensation for 4hr+ delays.",
      },
    ],
    "Home Insurance": [
      {
        update: "Storm Damage Coverage",
        date: "July 2025",
        details: "Covers damage due to cyclones and storms.",
      },
    ],
  };

  const loanServices = [
    {
      name: "Personal Loan",
      img: "/images/personal-loan.png",
      description:
        "Get instant personal loans to meet your urgent financial needs such as medical emergencies, travel, or weddings. No collateral required and fast approvals.",
    },
    {
      name: "Home Loan",
      img: "/images/home-loan.png",
      description:
        "Buy or build your dream home with our low-interest home loan plans and easy EMIs.",
    },
    {
      name: "Education Loan",
      img: "/images/education-loan.png",
      description:
        "Finance your higher education with affordable education loans for domestic and international institutions.",
    },
    {
      name: "Business Loan",
      img: "/images/business-loan.png",
      description:
        "Boost your business with flexible and collateral-free business loans tailored for SMEs and startups.",
    },
    {
      name: "Vehicle Loan (Car/Bike)",
      img: "/images/vehicle-loan.png",
      description:
        "Drive your dream car or bike home with attractive interest rates and up to 100% financing.",
    },
    {
      name: "Gold Loan",
      img: "/images/gold-loan.png",
      description:
        "Avail high-value loans instantly against your gold with minimal documentation.",
    },
    {
      name: "Agriculture Loan",
      img: "/images/agriculture-loan.png",
      description:
        "Empower your farming activities with customized loans for seeds, fertilizers, equipment, and more.",
    },
  ];

  const insuranceServices = [
    {
      name: "Term Life Insurance",
      img: "/images/life-insurance.png",
      description:
        "Secure your family's future with our customizable life insurance plans.",
    },
    {
      name: "Health Insurance (Individual)",
      img: "/images/health-insurance.png",
      description:
        "Get comprehensive medical coverage and cashless hospitalization benefits.",
    },
    {
      name: "Motor Insurance (Car/Bike)",
      img: "/images/motor-insurance.png",
      description:
        "Protect your vehicle from accidents, theft, and third-party liabilities.",
    },
    {
      name: "Travel Insurance",
      img: "/images/travel-insurance.png",
      description:
        "Travel stress-free with coverage for delays, losses, and medical emergencies.",
    },
    {
      name: "Home Insurance",
      img: "/images/home-insurance.png",
      description:
        "Safeguard your home and valuables against damage, theft, or natural calamities.",
    },
  ];

  const allServices = [...loanServices, ...insuranceServices];
  const getServiceDetails = (name) => allServices.find((s) => s.name === name);
  const currentUpdates = whatsNewMap[selectedService] || [];

  return (
    <div className="banking-page animated-background">
      <div className="banking-header">
        <FaUniversity className="banking-icon" />
        <h2>Welcome to Our Banking Services</h2>
        <p>Select a service below to get started with your application.</p>
      </div>

      <div className="banking-content">
        {allServices.map((serviceObj, index) => {
          const { name, img } = serviceObj;

          return (
            <div key={index} className="banking-service-wrapper">
              <div
                className="banking-service"
                onClick={() => handleServiceClick(name)}
              >
                <img src={img} alt={name} className="service-icon" />
                <h3>{name}</h3>
              </div>

              {selectedService === name && (
                <div className="form-with-info light-blue">
                  <div className="form-info">
                    <img src={img} alt={name} className="form-img" />
                    <p>{getServiceDetails(name)?.description}</p>

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
                    <h3>Apply for: {selectedService}</h3>

                    <label>
                      Full Name:
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Email:
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Phone Number:
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    {loanServices.some((s) => s.name === name) && (
                      <>
                        <label>
                          Loan Amount (₹):
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                          />
                        </label>

                        <label>
                          Tenure (in months):
                          <input
                            type="number"
                            name="tenure"
                            value={formData.tenure}
                            onChange={handleChange}
                            required
                          />
                        </label>

                        <label>
                          Annual Income (₹):
                          <input
                            type="number"
                            name="income"
                            value={formData.income}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </>
                    )}

                    {insuranceServices.some((s) => s.name === name) && (
                      <>
                        <label>
                          Insured Amount (₹):
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                          />
                        </label>

                        <label>
                          Nominee Name:
                          <input
                            type="text"
                            name="nominee"
                            value={formData.nominee}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </>
                    )}

                    <button type="submit">Submit Form</button>
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

export default Banking;
