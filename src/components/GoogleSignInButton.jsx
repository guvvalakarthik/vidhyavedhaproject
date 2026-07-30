import React, { useEffect, useRef, useState } from "react";
import api from "../services/api.js";

const GOOGLE_SCRIPT_ID = "google-identity-services";
let googleLibraryPromise;

const loadGoogleIdentityLibrary = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleLibraryPromise) return googleLibraryPromise;

  googleLibraryPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    const script = existing || document.createElement("script");
    const complete = () => {
      if (window.google?.accounts?.id) resolve(window.google);
      else reject(new Error("Google Identity Services did not load."));
    };
    const failed = () => reject(new Error("Google Identity Services could not be loaded."));

    script.addEventListener("load", complete, { once: true });
    script.addEventListener("error", failed, { once: true });
    if (!existing) {
      script.id = GOOGLE_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    googleLibraryPromise = undefined;
    document.getElementById(GOOGLE_SCRIPT_ID)?.remove();
    throw error;
  });

  return googleLibraryPromise;
};

function GoogleSignInButton({ onCredential, onSetupError, busy = false }) {
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(onCredential);
  const setupErrorRef = useRef(onSetupError);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("loading");

  credentialHandlerRef.current = onCredential;
  setupErrorRef.current = onSetupError;

  useEffect(() => {
    let active = true;

    const prepareButton = async () => {
      setStatus("loading");
      try {
        const { data } = await api.get("/auth/google/config");
        if (!active) return;
        if (!data.enabled) {
          setStatus("not-configured");
          return;
        }

        const google = await loadGoogleIdentityLibrary();
        if (!active || !buttonRef.current) return;

        google.accounts.id.initialize({
          client_id: data.clientId,
          nonce: data.nonce,
          callback: async (response) => {
            if (!response?.credential) {
              setupErrorRef.current?.("Google did not return a sign-in credential. Please try again.");
              setAttempt((current) => current + 1);
              return;
            }

            setStatus("submitting");
            try {
              await credentialHandlerRef.current(response.credential);
            } finally {
              if (active) setAttempt((current) => current + 1);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
          ux_mode: "popup",
        });

        buttonRef.current.replaceChildren();
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.min(360, Math.max(220, buttonRef.current.clientWidth || 360)),
        });
        setStatus("ready");
      } catch {
        if (!active) return;
        setStatus("failed");
        setupErrorRef.current?.("Google sign-in could not be loaded. You can still use email and password.");
      }
    };

    prepareButton();
    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <div
      className={`google-signin ${busy || status === "submitting" ? "is-busy" : ""}`}
      aria-busy={busy || status === "submitting"}
    >
      <div ref={buttonRef} className="google-signin-button" />
      {status === "loading" && <div className="google-signin-skeleton">Loading Google sign-in?</div>}
      {status === "submitting" && <p className="google-signin-status">Securing your session?</p>}
      {status === "not-configured" && (
        <p className="google-signin-status">
          Google sign-in needs administrator setup. Use email and password for now.
        </p>
      )}
      {status === "failed" && (
        <button className="google-signin-retry" type="button" onClick={() => setAttempt((current) => current + 1)}>
          Retry Google sign-in
        </button>
      )}
    </div>
  );
}

export default GoogleSignInButton;
