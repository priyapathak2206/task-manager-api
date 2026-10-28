import React from "react";

// Reusable task statistics component
function TaskStatistics({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed === true || t.status === "completed").length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card" style={{ marginBottom: "1.25rem" }}>
      <div className="card-title">
        <span>Task Overview</span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          {completed} of {total} completed ({percentage}%)
        </span>
      </div>

      <div className="grid-3" style={{ marginBottom: "1rem" }}>
        <div className="metric-card">
          <div className="metric-header">Total Tasks</div>
          <div className="metric-value">{total}</div>
          <div className="metric-subtext">Active workspace tasks</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">Completed</div>
          <div className="metric-value" style={{ color: "#34d399" }}>
            {completed}
          </div>
          <div className="metric-subtext">{percentage}% completion rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">Pending</div>
          <div className="metric-value" style={{ color: "#fbbf24" }}>
            {pending}
          </div>
          <div className="metric-subtext">Awaiting action</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "var(--bg-main)", height: "6px", borderRadius: "9999px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #6366f1, #10b981)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

export default TaskStatistics;
