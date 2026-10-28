import React from "react";

// Reusable loading component with customizable label prop
function Spinner({ label = "Loading data..." }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
      <div
        style={{
          display: "inline-block",
          width: "36px",
          height: "36px",
          border: "3px solid rgba(99, 102, 241, 0.2)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: "1rem",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 500 }}>
        {label}
      </p>
    </div>
  );
}

export default Spinner;

