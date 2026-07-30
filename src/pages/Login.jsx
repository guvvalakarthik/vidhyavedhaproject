import React, { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const continueToRequestedPage = useCallback(() => {
    const requested = location.state?.from;
    const destination = requested
      ? `${requested.pathname || "/"}${requested.search || ""}`
      : "/";
    navigate(destination, { replace: true });
  }, [location.state, navigate]);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordLoading(true);
    try {
      await login(email, password);
      continueToRequestedPage();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(async (credential) => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credential);
      continueToRequestedPage();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }, [continueToRequestedPage, loginWithGoogle]);

  const busy = passwordLoading || googleLoading;

  return (
    <section className="login-page">
      <div className="login-orb login-orb-one" aria-hidden="true" />
      <div className="login-orb login-orb-two" aria-hidden="true" />

      <div className="login-shell">
        <aside className="login-story">
          <Link className="login-brand" to="/" aria-label="Vidhya Vedha home">
            <span>VV</span>
            <strong>Vidhya Vedha</strong>
          </Link>

          <div className="login-story-copy">
            <p className="login-eyebrow"><FaShieldAlt aria-hidden="true" /> Secure resident access</p>
            <h1>One trusted place for every important next step.</h1>
            <p>
              Return to your service plans, document checklists, reminders, applications,
              and assistance requests without starting over.
            </p>

            <ul className="login-benefits">
              <li><FaCheckCircle aria-hidden="true" /><span>Continue unfinished service tasks</span></li>
              <li><FaCheckCircle aria-hidden="true" /><span>Keep personal records owner-only</span></li>
              <li><FaCheckCircle aria-hidden="true" /><span>Manage active devices and sessions</span></li>
            </ul>
          </div>

          <div className="login-trust-note">
            <FaLock aria-hidden="true" />
            <span>Your sign-in creates a protected, time-limited session. We never ask for OTPs or identity numbers here.</span>
          </div>
        </aside>

        <div className="login-card-wrap">
          <div className="login-card">
            <header className="login-heading">
              <p>Welcome back</p>
              <h2>Sign in to your account</h2>
              <span>Choose Google or use the email connected to your Vidhya Vedha account.</span>
            </header>

            {error && <div className="login-error" role="alert">{error}</div>}

            <GoogleSignInButton busy={busy} onCredential={handleGoogleCredential} onSetupError={setError} />

            <div className="login-divider" aria-hidden="true"><span>or continue with email</span></div>

            <form className="login-form" onSubmit={handlePasswordSubmit}>
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" disabled={busy} required />

              <div className="login-label-row">
                <label htmlFor="login-password">Password</label>
                <span>At least 8 characters</span>
              </div>
              <div className="login-password-field">
                <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" disabled={busy} required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                </button>
              </div>

              <button className="login-submit" type="submit" disabled={busy}>
                <span>{passwordLoading ? "Securing your session..." : "Sign in securely"}</span>
                {!passwordLoading && <FaArrowRight aria-hidden="true" />}
              </button>
            </form>

            <p className="login-footer">New to Vidhya Vedha? <Link to="/register">Create a resident account</Link></p>
          </div>

          <p className="login-privacy">By continuing, you agree to use the platform responsibly and keep your account access private.</p>
        </div>
      </div>
    </section>
  );
}

export default Login;