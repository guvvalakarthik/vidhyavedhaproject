import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import { AuthProvider } from "./context/AuthContext.js";

// Import HomePage
import HomePage from "./components/HomePage.js";

// Service Pages
import Banking from "./pages/Services/Banking.js";
import Education from "./pages/Services/Education.js";
import Farming from "./pages/Services/Farming.js";
import Healthcare from "./pages/Services/Healthcare.js";
import Emergency from "./pages/Services/Emergency.js";
import Utilities from "./pages/Services/Utilities.js";
import Ecommerce from "./pages/Services/Ecommerce.js";
import HomeMaintenance from "./pages/Services/HomeMaintenance.js";
import GovernmentServices from "./pages/Services/GovernmentServices.js";

// Auth Pages
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";

// Info Pages
import About from "./pages/About.js";
import Contact from "./pages/Contact.js";
import UserDashboard from "./pages/UserDashboard.js";
import AdminPanel from "./pages/AdminPanel.js";

function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Header />
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Service Routes */}
            <Route path="/services/banking" element={<Banking />} />
            <Route path="/services/education" element={<Education />} />
            <Route path="/services/farming" element={<Farming />} />
            <Route path="/services/healthcare" element={<Healthcare />} />
            <Route path="/services/emergency" element={<Emergency />} />
            <Route path="/services/utilities" element={<Utilities />} />
            <Route path="/services/ecommerce" element={<Ecommerce />} />
            <Route
              path="/services/home-maintenance"
              element={<HomeMaintenance />}
            />
            <Route path="/services/government" element={<GovernmentServices />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Info Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Dashboard & Admin */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
