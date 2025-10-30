import React, { useState, useEffect } from "react";
import "./Education.css";
import axios from "axios";

function Education() {
  const [data, setData] = useState([]);

  const [activeService, setActiveService] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/education")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const toggleForm = (id) => {
    setActiveService(activeService === id ? null : id);
  };

  const toggleUpdate = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = {};

    formData.forEach((value, key) => {
      payload[key] = value;
    });

    payload["serviceType"] = e.target.getAttribute("data-service");

    try {
      const response = await fetch(
        "http://localhost:5000/api/education/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      // ✅ Update UI instantly
      setData((prev) => [...prev, result]);

      // ✅ Reset form & close
      e.target.reset();
      setActiveService(null);
      setExpanded(null);

      alert(
        "Your application has been submitted. Our team will contact you soon."
      );
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("There was a problem submitting your form. Please try again.");
    }
  };

  const services = [
    { id: 1, title: "Apply for Competitive Exam" },
    { id: 2, title: "Apply to University" },
    { id: 3, title: "Admission Support (India & Abroad)" },
    { id: 4, title: "Apply for Coaching / Tutoring" },
    { id: 5, title: "Career Counseling Registration" },
  ];

  const updates = [
    {
      title: "New University Partnerships Announced",
      details:
        "We've signed MOUs with top universities in Canada and the UK to streamline admission processes.",
    },
    {
      title: "NEET/JEE Coaching Batch 2025 Open",
      details:
        "Our intensive coaching programs for NEET and JEE are now accepting students for the 2025 batch.",
    },
    {
      title: "Career Counseling Now Available Online",
      details:
        "Get expert career guidance from certified counselors via video consultation.",
    },
  ];

  return (
    <div className="education-page animated-background">
      <div className="education-header">
        <h2>Education Services</h2>
        <p>Select a service below to proceed with your application.</p>
      </div>

      <div className="education-content">
        {services.map((service) => (
          <div key={service.id} className="edu-service-wrapper">
            <div className="edu-service" onClick={() => toggleForm(service.id)}>
              <h3>
                {service.id}. {service.title}
              </h3>
            </div>

            {activeService === service.id && (
              <div className="form-with-info">
                <div className="form-info">
                  <img
                    src="/education-icon.png"
                    alt="education"
                    className="form-img"
                  />
                  <p>
                    Fill out the form to apply for {service.title.toLowerCase()}
                    .
                  </p>

                  <div className="whats-new-section">
                    <h4>📌 What's New</h4>
                    {updates.map((item, idx) => (
                      <div key={idx} className="update-item">
                        <div
                          className="update-header"
                          onClick={() => toggleUpdate(idx)}
                        >
                          {item.title}
                          <span className="update-toggle-icon">
                            {expanded === idx ? "−" : "+"}
                          </span>
                        </div>
                        {expanded === idx && (
                          <div className="update-details">{item.details}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  data-service={service.title}
                  className="edu-form"
                >
                  <h3>{service.title}</h3>
                  <label>
                    Full Name:
                    <input name="name" required />
                  </label>
                  <label>
                    Email:
                    <input type="email" name="email" required />
                  </label>
                  <label>
                    Phone:
                    <input name="phone" required />
                  </label>

                  {service.id === 1 && (
                    <>
                      <label>
                        Select Exam:
                        <select name="exam" required>
                          <option value="">--Select--</option>
                          <option>UPSC</option>
                          <option>SSC</option>
                          <option>NEET</option>
                          <option>JEE</option>
                          <option>RRB</option>
                          <option>IBPS</option>
                        </select>
                      </label>
                      <label>
                        Date of Birth:
                        <input type="date" name="dob" required />
                      </label>
                      <label>
                        Qualification:
                        <input name="qualification" required />
                      </label>
                      <label>
                        Address:
                        <textarea name="address" required />
                      </label>
                    </>
                  )}

                  {service.id === 2 && (
                    <>
                      <label>
                        Target Country:
                        <input name="country" required />
                      </label>
                      <label>
                        Preferred University:
                        <input name="university" required />
                      </label>
                      <label>
                        Course Name:
                        <input name="course" required />
                      </label>
                      <label>
                        Current Qualification:
                        <input name="qualification" required />
                      </label>
                      <label>
                        Address:
                        <textarea name="address" required />
                      </label>
                    </>
                  )}

                  {service.id === 3 && (
                    <>
                      <label>
                        Interested College:
                        <input name="college" required />
                      </label>
                      <label>
                        Program:
                        <input name="program" required />
                      </label>
                      <label>
                        Qualification:
                        <input name="qualification" required />
                      </label>
                      <label>
                        Location Preference:
                        <input name="location" required />
                      </label>
                    </>
                  )}

                  {service.id === 4 && (
                    <>
                      <label>
                        Subject / Exam:
                        <input name="subject" required />
                      </label>
                      <label>
                        Preferred Mode:
                        <select name="mode" required>
                          <option value="">--Select--</option>
                          <option>Online</option>
                          <option>Offline</option>
                        </select>
                      </label>
                      <label>
                        Current Class / Year:
                        <input name="class" required />
                      </label>
                    </>
                  )}

                  {service.id === 5 && (
                    <>
                      <label>
                        Current Status:
                        <select name="status" required>
                          <option value="">--Select--</option>
                          <option>School Student</option>
                          <option>College Student</option>
                          <option>Graduate</option>
                          <option>Working Professional</option>
                        </select>
                      </label>
                      <label>
                        Career Interest:
                        <input name="interest" required />
                      </label>
                    </>
                  )}

                  <button type="submit">
                    {service.id === 5
                      ? "Book Counseling"
                      : "Submit Application"}
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Education;
