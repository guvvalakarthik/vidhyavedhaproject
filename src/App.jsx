import React, { lazy, Suspense } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import LandingPage from "./components/LandingPage.jsx";
import Banking from "./pages/Services/Banking.jsx";
import Education from "./pages/Services/Education.jsx";
import Farming from "./pages/Services/Farming.jsx";
import Healthcare from "./pages/Services/Healthcare.jsx";
import Emergency from "./pages/Services/Emergency.jsx";
import Utilities from "./pages/Services/Utilities.jsx";
import Ecommerce from "./pages/Services/Ecommerce.jsx";
import HomeMaintenance from "./pages/Services/HomeMaintenance.jsx";
import GovernmentServices from "./pages/Services/GovernmentServices.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Analytics from "./pages/Analytics.jsx";
import SessionManagement from "./pages/SessionManagement.jsx";
import Assistant from "./pages/Assistant.jsx";
const Companion = lazy(() => import("./pages/Companion.jsx"));
const Readiness = lazy(() => import("./pages/Readiness.jsx"));
const Drafts = lazy(() => import("./pages/Drafts.jsx"));
const Reminders = lazy(() => import("./pages/Reminders.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const StatusTracking = lazy(() => import("./pages/StatusTracking.jsx"));
const AssistedHandoff = lazy(() => import("./pages/AssistedHandoff.jsx"));
const DocumentVault = lazy(() => import("./pages/DocumentVault.jsx"));
const ProviderOperations = lazy(() => import("./pages/ProviderOperations.jsx"));

const authenticated = (element) => <ProtectedRoute>{element}</ProtectedRoute>;
const adminOnly = (element) => <ProtectedRoute roles={["admin"]}>{element}</ProtectedRoute>;

function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <Navbar />
        <main className="main-content" id="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/services/banking" element={<Banking />} />
            <Route path="/services/education" element={<Education />} />
            <Route path="/services/farming" element={<Farming />} />
            <Route path="/services/healthcare" element={<Healthcare />} />
            <Route path="/services/emergency" element={<Emergency />} />
            <Route path="/services/utilities" element={<Utilities />} />
            <Route path="/services/ecommerce" element={<Ecommerce />} />
            <Route path="/services/home-maintenance" element={<HomeMaintenance />} />
            <Route path="/services/government" element={<GovernmentServices />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={authenticated(<UserDashboard />)} />
            <Route path="/notifications" element={authenticated(<Suspense fallback={<p>Loading notifications...</p>}><Notifications /></Suspense>)} />
            <Route path="/account/sessions" element={authenticated(<SessionManagement />)} />
            <Route path="/assistant" element={authenticated(<Assistant />)} />
            <Route path="/companion" element={authenticated(<Suspense fallback={<p>Loading digital companion...</p>}><Companion /></Suspense>)} />
            <Route path="/readiness" element={authenticated(<Suspense fallback={<p>Loading readiness checklists...</p>}><Readiness /></Suspense>)} />
            <Route path="/drafts" element={authenticated(<Suspense fallback={<p>Loading draft workspace...</p>}><Drafts /></Suspense>)} />
            <Route path="/reminders" element={authenticated(<Suspense fallback={<p>Loading reminders...</p>}><Reminders /></Suspense>)} />
            <Route path="/tracking" element={authenticated(<Suspense fallback={<p>Loading status trackers...</p>}><StatusTracking /></Suspense>)} />
            <Route path="/assistance" element={authenticated(<Suspense fallback={<p>Loading assistance...</p>}><AssistedHandoff /></Suspense>)} />
            <Route path="/vault" element={authenticated(<Suspense fallback={<p>Loading document vault...</p>}><DocumentVault /></Suspense>)} />
            <Route path="/provider/operations" element={<ProtectedRoute roles={["provider","admin"]}><Suspense fallback={<p>Loading provider operations...</p>}><ProviderOperations /></Suspense></ProtectedRoute>} />
            <Route path="/admin" element={adminOnly(<AdminPanel />)} />
            <Route path="/analytics" element={adminOnly(<Analytics />)} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
