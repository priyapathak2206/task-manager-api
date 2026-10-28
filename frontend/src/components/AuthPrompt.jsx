import React, { useState } from "react";
import { login, register } from "../api";

function AuthPrompt({ onAuthSuccess, onToast }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "register") {
        await register(email.trim(), password);
        onToast?.("Account created! Signing you in...", "success");
      }

      const res = await login(email.trim(), password);
      onAuthSuccess?.(res.user);
      onToast?.(`Signed in as ${res.user.email}`, "success");
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-prompt-card">
      <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem" }}>
        {mode === "login" ? "Sign In to TaskFlow" : "Create your TaskFlow Account"}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        {mode === "login"
          ? "Please sign in to access your personal task workspace."
          : "Sign up to start organizing and managing your projects."}
      </p>

      {error && (
        <div className="alert alert-error" style={{ textAlign: "left", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="auth-prompt-email">
            Email address
          </label>
          <input
            id="auth-prompt-email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="auth-prompt-password">
            Password
          </label>
          <input
            id="auth-prompt-password"
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

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "0.5rem" }}
          disabled={loading}
        >
          {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        {mode === "login" ? "New to TaskFlow? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {mode === "login" ? "Create an account" : "Sign in here"}
        </button>
      </div>
    </div>
  );
}

export default AuthPrompt;

