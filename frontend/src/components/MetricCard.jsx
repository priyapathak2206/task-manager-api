import React from "react";

function MetricCard({ title, value, subtext, color = "var(--text-primary)" }) {
  return (
    <div className="metric-card">
      <div className="metric-header">{title}</div>
      <div className="metric-value" style={{ color }}>
        {value}
      </div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
}

export default MetricCard;
