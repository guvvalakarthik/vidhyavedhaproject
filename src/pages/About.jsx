import React from "react";

function About() {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "16px", color: "#1a365d" }}>
        About Vidhya Vedha
      </h1>
      <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#4a5568" }}>
        Vidhya Vedha is a digital service platform designed to empower rural
        India by bridging the gap between citizens and essential services. Our
        mission is to make banking, education, healthcare, farming, government
        services, and more — accessible to everyone through a single,
        easy-to-use web application.
      </p>

      <h2
        style={{
          fontSize: "1.5rem",
          marginTop: "32px",
          marginBottom: "12px",
          color: "#2c5282",
        }}
      >
        Our Vision
      </h2>
      <p style={{ fontSize: "1.05rem", lineHeight: "1.7", color: "#4a5568" }}>
        To create a digitally inclusive society where every individual,
        regardless of location, can access the services they need without
        barriers — from applying for loans and government certificates to
        booking healthcare appointments and emergency roadside assistance.
      </p>

      <h2
        style={{
          fontSize: "1.5rem",
          marginTop: "32px",
          marginBottom: "12px",
          color: "#2c5282",
        }}
      >
        What We Offer
      </h2>
      <ul
        style={{
          fontSize: "1.05rem",
          lineHeight: "1.8",
          color: "#4a5568",
          paddingLeft: "20px",
        }}
      >
        <li>Banking & Insurance services (loans, insurance applications)</li>
        <li>Education services (exam applications, university admissions, coaching)</li>
        <li>Healthcare services (telemedicine, lab tests, ambulance booking)</li>
        <li>Farming support (soil testing, fertilizer distribution, crop insurance)</li>
        <li>Emergency roadside assistance (towing, mechanic dispatch, fuel delivery)</li>
        <li>Utility bill payments and mobile recharge</li>
        <li>E-commerce and digital payment setup</li>
        <li>Home maintenance services (electrician, plumber, pest control)</li>
        <li>Government services (Aadhaar, PAN, Voter ID, certificates)</li>
      </ul>

      <h2
        style={{
          fontSize: "1.5rem",
          marginTop: "32px",
          marginBottom: "12px",
          color: "#2c5282",
        }}
      >
        Our Commitment
      </h2>
      <p style={{ fontSize: "1.05rem", lineHeight: "1.7", color: "#4a5568" }}>
        We are committed to transparency, efficiency, and accessibility. Every
        application submitted through Vidhya Vedha is tracked with a unique
        Application ID, so you can check your status anytime.
      </p>
    </div>
  );
}

export default About;
