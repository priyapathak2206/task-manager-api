import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../api";
import ErrorMessage from "../components/ErrorMessage";

function Account({ user, onAuthSuccess, onLogout, onToast }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "register") {
        await register(email.trim(), password);
        onToast?.("Account created successfully! Signing in...", "success");
      }

      const data = await login(email.trim(), password);
      onAuthSuccess?.(data.user);
      onToast?.(`Signed in as ${data.user.email}`, "success");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Redirect directly to Dashboard after successful login
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
      onToast?.(err.message || "Authentication error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Account</h1>
          <p className="page-subtitle">
            {user ? "Manage your signed-in account." : "Sign in or create an account to manage your tasks."}
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {user ? (
        /* Minimal Signed-In View (No Session Details or Diagnostic Panels) */
        <div style={{ maxWidth: "460px", margin: "1.5rem auto" }}>
          <div className="card" style={{ textAlign: "center", padding: "2.25rem 1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              {!avatarError ? (
                <img
                  src="/images/avatar.jpg"
                  alt="Priya Pathak"
                  className="profile-avatar-lg"
                  style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover" }}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  className="profile-avatar-lg"
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "white",
                    background: "var(--primary)",
                  }}
                >
                  PP
                </div>
              )}
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.3rem", color: "var(--text-primary)" }}>
              {user.email}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
              Authenticated with TaskFlow
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
              <Link to="/" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onToast?.("Signed out successfully.", "info");
                }}
                className="btn btn-secondary"
                style={{ color: "var(--danger)" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Clean Sign In / Register Card */
        <div style={{ maxWidth: "440px", margin: "1rem auto" }}>
          <div className="card">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.35rem",
                padding: "0.25rem",
                background: "var(--bg-main)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1.25rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`btn btn-sm ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
                style={{ border: "none" }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`btn btn-sm ${mode === "register" ? "btn-primary" : "btn-secondary"}`}
                style={{ border: "none" }}
              >
                Register
              </button>
            </div>

            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              {mode === "login" ? "Sign in to TaskFlow" : "Create your account"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              {mode === "login"
                ? "Enter your email and password to access your tasks."
                : "Register with an email and a password of at least 6 characters."}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="account-email">
                  Email
                </label>
                <input
                  id="account-email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="account-password">
                  Password
                </label>
                <input
                  id="account-password"
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              {mode === "register" && (
                <div className="form-group">
                  <label className="form-label" htmlFor="account-confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="account-confirm-password"
                    type="password"
                    className="form-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem" }}
                disabled={loading}
              >
                {loading
                  ? "Authenticating..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
