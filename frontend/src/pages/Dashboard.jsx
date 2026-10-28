import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../api";
import Spinner from "../components/Spinner";

function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    let isMounted = true;
    const loadTasks = async () => {
      try {
        setLoading(true);
        const res = await getTasks();
        if (isMounted) {
          setTasks(res.tasks || []);
        }
      } catch {
        if (isMounted) setTasks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed === true || t.status === "completed").length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {/* 1. Welcome Section */}
      <div className="page-header" style={{ marginBottom: "1.75rem" }}>
        <div>
          <h1 className="page-title">TaskFlow</h1>
          <p className="page-subtitle">
            Unified task management, project showcase, and full-stack developer workspace.
          </p>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading dashboard..." />
      ) : (
        <>
          {/* 2. Task Overview */}
          <div className="card" style={{ marginBottom: "1.75rem" }}>
            <div className="card-title">
              <span>Task Overview</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {user ? `${completed} of ${total} completed (${progress}%)` : "Sign in to track your personal tasks"}
              </span>
            </div>

            <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
              <div className="metric-card">
                <div className="metric-header">Total Tasks</div>
                <div className="metric-value">{total}</div>
                <div className="metric-subtext">Active workspace tasks</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">Completed</div>
                <div className="metric-value" style={{ color: "var(--success)" }}>
                  {completed}
                </div>
                <div className="metric-subtext">Finished tasks</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">Pending</div>
                <div className="metric-value" style={{ color: "var(--warning)" }}>
                  {pending}
                </div>
                <div className="metric-subtext">Awaiting action</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">Completion Progress</div>
                <div className="metric-value" style={{ color: "var(--primary)" }}>
                  {progress}%
                </div>
                <div className="metric-subtext">Overall completion rate</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                background: "var(--bg-main)",
                height: "8px",
                borderRadius: "9999px",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--success))",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* 3. Quick Actions */}
          <div className="card" style={{ marginBottom: "1.75rem" }}>
            <div className="card-title" style={{ marginBottom: "0.85rem" }}>
              <span>Quick Actions</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/tasks" className="btn btn-primary">
                <span>+</span> Add Task
              </Link>
              <Link to="/projects" className="btn btn-secondary">
                <span>📦</span> View Projects
              </Link>
              <Link to="/activity" className="btn btn-secondary">
                <span>📡</span> View Activity
              </Link>
            </div>
          </div>

          {/* 4. Recent Tasks (if user has tasks) */}
          {user && tasks.length > 0 && (
            <div className="card" style={{ marginBottom: "1.75rem" }}>
              <div className="card-title">
                <span>Recent Tasks</span>
                <Link to="/tasks" style={{ fontSize: "0.825rem", color: "var(--primary)", fontWeight: 600 }}>
                  View all ({tasks.length}) →
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.65rem 0.85rem",
                      background: "var(--bg-card-subtle)",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: task.completed ? "3px solid var(--success)" : "3px solid var(--warning)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, marginRight: "0.75rem" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {task.description}
                        </div>
                      )}
                    </div>

                    <span className={`badge ${task.completed ? "badge-success" : "badge-warning"}`}>
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
