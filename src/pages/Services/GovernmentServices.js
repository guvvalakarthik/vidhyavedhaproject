import React, { useState } from "react";
import "./Ecommerce.css"; // Reusing Ecommerce styling
import { FaUniversity } from "react-icons/fa";

function GovtServices() {
  const [selectedService, setSelectedService] = useState(null);
  const [expandedUpdates, setExpandedUpdates] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    address: "",
    mobile: "",
    email: "",
  });

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
    alert(`Your request for ${selectedService} has been submitted.`);
    setFormData({
      name: "",
      idNumber: "",
      address: "",
      mobile: "",
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

  const govtServices = [
    {
      name: "Aadhaar Services",
      img: "/images/aadhar.png",
      description:
        "Update your Aadhaar card details including address, mobile number, and biometric info.",
    },
    {
      name: "PAN Card Application",
      img: "/images/pan-card.png",
      description:
        "Apply for a new PAN card or request corrections in your existing one easily.",
    },
    {
      name: "Voter ID Services",
      img: "/images/voter-id.png",
      description:
        "Register for a new Voter ID or update your existing one for electoral rolls.",
    },
    {
      name: "Birth & Death Certificate Assistance",
      img: "/images/certificate.png",
      description:
        "Apply for official birth or death certificates issued by your local government.",
    },
    {
      name: "Income, Caste & Domicile Certificates",
      img: "/images/income-certificate.png",
      description:
        "Get verified certificates required for scholarships, reservations, or legal documentation.",
    },
    {
      name: "Driving License Services",
      img: "/images/driving-license.png",
      description:
        "Apply for a learner or permanent license, renewals, or change of address.",
    },
    {
      name: "Ration Card Services",
      img: "/images/ration-card.png",
      description:
        "Apply for new ration cards or make updates to your existing one.",
    },
    {
      name: "Land Record Access (Bhulekh)",
      img: "/images/land-records.png",
      description:
        "Check and download land ownership details and property records online.",
    },
    {
      name: "Utility Bill Payments",
      img: "/images/bill-payment.png",
      description:
        "Pay electricity, water, and gas bills securely and get instant receipts.",
    },
    {
      name: "Scholarship & Pension Scheme Applications",
      img: "/images/scholarship.png",
      description:
        "Apply for central and state government scholarships or pension schemes.",
    },
  ];

  const whatsNewMap = {
    "Aadhaar Services": [
      {
        update: "Faster Biometric Verification",
        date: "July 2025",
        details: "Biometric updates now processed in under 48 hours.",
      },
    ],
    "PAN Card Application": [
      {
        update: "e-PAN Delivery",
        date: "June 2025",
        details: "PAN cards are now issued digitally within 24 hours.",
      },
    ],
    "Voter ID Services": [
      {
        update: "Selfie Verification Introduced",
        date: "June 2025",
        details:
          "New users can complete identity verification using a selfie and PAN.",
      },
    ],
    "Birth & Death Certificate Assistance": [
      {
        update: "Online Status Tracker",
        date: "July 2025",
        details: "Applicants can now track their certificate status online.",
      },
    ],
    "Income, Caste & Domicile Certificates": [
      {
        update: "One-Click Upload",
        date: "July 2025",
        details:
          "Upload income proof via mobile scan with instant OCR processing.",
      },
    ],
    "Driving License Services": [
      {
        update: "Instant Learner's License",
        date: "June 2025",
        details:
          "Online test results now generate provisional learner’s license instantly.",
      },
    ],
    "Ration Card Services": [
      {
        update: "Family Member Sync",
        date: "July 2025",
        details:
          "You can now sync family member data automatically from Aadhaar.",
      },
    ],
    "Land Record Access (Bhulekh)": [
      {
        update: "Satellite Map Overlay",
        date: "July 2025",
        details:
          "Visualize land plots with real-time satellite overlays and ownership markers.",
      },
    ],
    "Utility Bill Payments": [
      {
        update: "UPI AutoPay Support",
        date: "July 2025",
        details:
          "Recurring electricity and water bills can be paid via UPI AutoPay.",
      },
    ],
    "Scholarship & Pension Scheme Applications": [
      {
        update: "Unified Scheme Dashboard",
        date: "June 2025",
        details:
          "All eligible schemes now visible in one place based on your ID.",
      },
    ],
  };

  const currentUpdates = whatsNewMap[selectedService] || [];

  return (
    <div className="ecommerce-page animated-background">
      <div className="ecommerce-header">
        <FaUniversity className="ecommerce-icon" />
        <h2>Government Services</h2>
        <p>Select a service to proceed with the form and view updates.</p>
      </div>

      <div className="ecommerce-content">
        {govtServices.map((serviceObj, index) => {
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
                      Full Name:
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      ID Number:
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Mobile:
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Email (optional):
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      Address:
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </label>

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

export default GovtServices;
