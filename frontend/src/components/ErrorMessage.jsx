import React from "react";

// Reusable error message component with retry capability
function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="alert alert-error">
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", marginBottom: "0.25rem" }}>
          Operation Failed
        </strong>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-secondary"
          style={{ whiteSpace: "nowrap" }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;

