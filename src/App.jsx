import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Import LandingPage
import LandingPage from "./components/LandingPage.jsx";

// Service Pages
import Banking from "./pages/Services/Banking.jsx";
import Education from "./pages/Services/Education.jsx";
import Farming from "./pages/Services/Farming.jsx";
import Healthcare from "./pages/Services/Healthcare.jsx";
import Emergency from "./pages/Services/Emergency.jsx";
import Utilities from "./pages/Services/Utilities.jsx";
import Ecommerce from "./pages/Services/Ecommerce.jsx";
import HomeMaintenance from "./pages/Services/HomeMaintenance.jsx";
import GovernmentServices from "./pages/Services/GovernmentServices.jsx";

// Auth Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// Info Pages
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Analytics from "./pages/Analytics.jsx";
import Notifications from "./pages/Notifications.jsx";

function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Header />
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

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

            {/* Dashboard, Admin & Analytics */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
