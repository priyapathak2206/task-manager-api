import React from "react";

function TaskCard({ task, onToggleComplete, onEdit, onDelete, busyId }) {
  const isBusy = busyId === task._id;
  const createdDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        padding: "1.1rem 1.25rem",
        marginBottom: "0.85rem",
        borderLeft: task.completed ? "3px solid var(--success)" : "3px solid var(--warning)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: task.completed ? "line-through" : "none",
            wordBreak: "break-word",
          }}
        >
          {task.title}
        </h3>
        <span className={`badge ${task.completed ? "badge-success" : "badge-warning"}`}>
          {task.completed ? "Completed" : "Pending"}
        </span>
      </div>

      {task.description && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          paddingTop: "0.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        <div>{createdDate && <span>Created {createdDate}</span>}</div>

        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            onClick={() => onToggleComplete(task)}
            disabled={isBusy}
            className={`btn btn-sm ${task.completed ? "btn-secondary" : "btn-primary"}`}
          >
            {task.completed ? "Undo" : "Complete"}
          </button>
          <button
            onClick={() => onEdit(task)}
            disabled={isBusy}
            className="btn btn-sm btn-secondary"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            disabled={isBusy}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
